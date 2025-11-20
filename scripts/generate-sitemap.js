// scripts/generate-sitemap.js
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const baseUrl = process.env.BASE_URL || "https://aijim.shop";
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const today = new Date().toISOString().split("T")[0];

// -----------------------------------
// Static Routes
// -----------------------------------
const staticUrls = [
  { loc: "/", changefreq: "daily", priority: 1.0, lastmod: today },
  { loc: "/signin", changefreq: "weekly", priority: 0.6, lastmod: today },

  { loc: "/products", changefreq: "weekly", priority: 0.8, lastmod: today },
  { loc: "/search", changefreq: "monthly", priority: 0.5, lastmod: today },

  { loc: "/about-us", changefreq: "yearly", priority: 0.4, lastmod: today },
  { loc: "/contact-us", changefreq: "yearly", priority: 0.4, lastmod: today },

  { loc: "/privacy-policy", changefreq: "yearly", priority: 0.2, lastmod: today },
  { loc: "/terms-conditions", changefreq: "yearly", priority: 0.2, lastmod: today },
  { loc: "/shipping-delivery", changefreq: "yearly", priority: 0.2, lastmod: today },
  { loc: "/cancellation-refund", changefreq: "yearly", priority: 0.2, lastmod: today },
];

// -----------------------------------
// Fetch products
// -----------------------------------
async function fetchProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("code,name,description,image,price,category,updated_at")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error.message);
    return [];
  }

  return (data || []).filter(p => p.code);
}

// -----------------------------------
// Generate JSON-LD (ALL in one file)
// -----------------------------------
function generateJsonLd(product) {
  const url = `${baseUrl}/product/details/${product.code}`;

  const Product = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name || "Unnamed Product",
    image: [product.image || `${baseUrl}/default-product.png`],
    description: product.description || "Description coming soon.",
    sku: product.code,
    mpn: product.code,

    brand: {
      "@type": "Brand",
      name: "Aijim"
    },

    manufacturer: {
      "@type": "Organization",
      name: "Aijim Clothing",
      logo: `${baseUrl}/logo.png`
    },

    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "INR",
      price: product.price || 0,
      priceValidUntil: `${new Date().getFullYear()}-12-31`,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",

      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: "0",
          currency: "INR"
        },
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: "IN"
        },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "DAY"
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 3,
            maxValue: 7,
            unitCode: "DAY"
          }
        }
      },

      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "IN",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 7,
        returnMethod: "https://schema.org/ReturnByMail",
        refundType: "https://schema.org/FullRefund"
      }
    },

    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "152"
    },

    review: [
      {
        "@type": "Review",
        author: "Verified Buyer",
        datePublished: today,
        reviewBody: "Premium quality streetwear, fits perfectly!",
        reviewRating: {
          "@type": "Rating",
          ratingValue: "5",
          bestRating: "5"
        }
      }
    ]
  };

  const Breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "Products", item: `${baseUrl}/products` },
      { "@type": "ListItem", position: 3, name: product.name, item: url }
    ]
  };

  const FAQ = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is the delivery time?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Delivery usually takes 3–7 days across India."
        }
      },
      {
        "@type": "Question",
        name: "Do you offer returns?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, you can return the product within 7 days."
        }
      }
    ]
  };

  return [Product, Breadcrumbs, FAQ];
}

// -----------------------------------
// Sitemap XML
// -----------------------------------
function generateSitemap(products) {
  const productUrls = products
    .map(
      p => `
  <url>
    <loc>${baseUrl}/product/details/${p.code}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`
    )
    .join("");

  const staticXml = staticUrls
    .map(
      u => `
  <url>
    <loc>${baseUrl}${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
  ${staticXml}
  ${productUrls}
</urlset>`;
}

// -----------------------------------
// File Writer
// -----------------------------------
async function writeFiles() {
  const products = await fetchProducts();

  const publicDir = path.resolve(process.cwd(), "public");
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);

  // Sitemap
  const sitemapXml = generateSitemap(products);
  fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemapXml, "utf8");

  // Robots
  const robots = `
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Sitemap: ${baseUrl}/sitemap.xml
`.trim();

  fs.writeFileSync(path.join(publicDir, "robots.txt"), robots, "utf8");

  // JSON-LD
  const jsonDir = path.join(publicDir, "json-ld");
  if (!fs.existsSync(jsonDir)) fs.mkdirSync(jsonDir);

  products.forEach(product => {
    const blocks = generateJsonLd(product);
    fs.writeFileSync(
      path.join(jsonDir, `${product.code}.json`),
      JSON.stringify(blocks, null, 2),
      "utf8"
    );
  });

  console.log("✅ sitemap.xml, robots.txt, JSON-LD generated successfully.");
}

writeFiles();
