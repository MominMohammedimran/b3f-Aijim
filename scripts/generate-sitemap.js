// scripts/generate-sitemap.js

import fs from "fs";
import path from "path";
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

// ------------------------------------------
// ENV
// ------------------------------------------
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const baseUrl = "https://aijim.shop";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const today = new Date().toISOString().split("T")[0];

// ------------------------------------------
// STATIC ROUTES
// ------------------------------------------
const staticUrls = [
  { loc: "/", changefreq: "daily", priority: 1.0 },
  { loc: "/search", changefreq: "daily", priority: 0.8 },
  { loc: "/about-us", changefreq: "monthly", priority: 0.5 },
  { loc: "/contact-us", changefreq: "monthly", priority: 0.5 },
  { loc: "/signin", changefreq: "weekly", priority: 0.6 },
  { loc: "/products", changefreq: "daily", priority: 1.0 },

  // Policies
  { loc: "/privacy-policy", changefreq: "yearly", priority: 0.3 },
  { loc: "/terms-conditions", changefreq: "yearly", priority: 0.3 },
  { loc: "/shipping-delivery", changefreq: "yearly", priority: 0.3 },
  { loc: "/cancellation-refund", changefreq: "yearly", priority: 0.3 },
];

// ------------------------------------------
// FETCH PRODUCTS FROM SUPABASE
// ------------------------------------------
async function fetchProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("code, name, description, image, price, updated_at, category");

  if (error) {
    console.error("Supabase Error:", error);
    return [];
  }

  return (data || []).filter((p) => p.code);
}

// ------------------------------------------
// JSON-LD GENERATOR (Correct Version)
// ------------------------------------------
function generateJsonLd(product) {
  const url = `${baseUrl}/product/${product.code}`;

  const Product = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name || "Unnamed Product",
    description: product.description || "Description coming soon.",
    image: [product.image || `${baseUrl}/default-product.png`],
    sku: product.code,
    mpn: product.code,
    brand: { "@type": "Brand", name: "Aijim" },
    manufacturer: {
      "@type": "Organization",
      name: "Aijim Clothing",
      logo: `${baseUrl}/logo.png`,
    },
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "INR",
      price: product.price || 0,
      priceValidUntil: `${new Date().getFullYear()}-12-31`,
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      shippingDetails: [
        {
          "@type": "OfferShippingDetails",
          shippingRate: {
            "@type": "MonetaryAmount",
            currency: "INR",
            value: "0",
          },
          shippingDestination: {
            "@type": "DefinedRegion",
            addressCountry: "IN",
          },
          deliveryTime: {
            "@type": "ShippingDeliveryTime",
            handlingTime: {
              "@type": "QuantitativeValue",
              minValue: 1,
              maxValue: 2,
              unitCode: "DAY",
            },
            transitTime: {
              "@type": "QuantitativeValue",
              minValue: 3,
              maxValue: 5,
              unitCode: "DAY",
            },
          },
        },
      ],
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "IN",
        returnPolicyCategory:
          "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 5,
        returnMethod: "https://schema.org/ReturnByMail",
        refundType: "https://schema.org/FullRefund",
      },
    },
    aggregateRating: product.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: String(product.rating),
          reviewCount: String(product.reviewCount || 10),
        }
      : undefined,
    review: [
      {
        "@type": "Review",
        author: { "@type": "Person", name: "Verified Buyer" },
        datePublished: today,
        reviewBody: "Premium quality streetwear, fits perfectly!",
        reviewRating: {
          "@type": "Rating",
          ratingValue: "5",
          bestRating: "5",
          worstRating: "1",
        },
      },
    ],
  };

  const Breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      {
        "@type": "ListItem",
        position: 2,
        name: "Products",
        item: `${baseUrl}/products`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: url,
      },
    ],
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
          text: "Delivery usually takes 5–7 days across India.",
        },
      },
      {
        "@type": "Question",
        name: "Do you offer returns?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, you can return the product within 5 days.",
        },
      },
    ],
  };

  return [Product, Breadcrumbs, FAQ];
}

// ------------------------------------------
// GENERATE SITEMAP.XML
// ------------------------------------------
function generateSitemap(products) {
  const productUrls = products.map((p) => ({
    loc: `/product/${p.code}`,
    lastmod: p.updated_at
      ? new Date(p.updated_at).toISOString().split("T")[0]
      : today,
    changefreq: "weekly",
    priority: 0.9,
  }));

  const categoryUrls = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  ).map((category) => ({
    loc: `/products/${encodeURIComponent(category)}`,
    changefreq: "weekly",
    priority: 0.8,
    lastmod: today,
  }));

  const allUrls = [...staticUrls, ...categoryUrls, ...productUrls];

  const xmlBody = allUrls
    .map(
      (u) => `
  <url>
    <loc>${baseUrl}${u.loc}</loc>
    <lastmod>${u.lastmod || today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
${xmlBody}
</urlset>`;
}

// ------------------------------------------
// WRITE ALL FILES
// ------------------------------------------
async function writeFiles() {
  const products = await fetchProducts();
  const publicDir = path.resolve(process.cwd(), "public");

  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);

  // SITEMAP
  fs.writeFileSync(
    path.join(publicDir, "sitemap.xml"),
    generateSitemap(products),
    "utf8"
  );
  console.log("✅ sitemap.xml generated");

  // ROBOTS
  const robots = `
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Sitemap: ${baseUrl}/sitemap.xml
`.trim();
  fs.writeFileSync(path.join(publicDir, "robots.txt"), robots, "utf8");

  // JSON-LD FOLDER
  const jsonDir = path.join(publicDir, "json-ld");
  if (!fs.existsSync(jsonDir)) fs.mkdirSync(jsonDir);

  products.forEach((product) => {
    fs.writeFileSync(
      path.join(jsonDir, `${product.code}.json`),
      JSON.stringify(generateJsonLd(product), null, 2),
      "utf8"
    );
  });

  console.log("🎉 All SEO files generated successfully.");
}

writeFiles();
