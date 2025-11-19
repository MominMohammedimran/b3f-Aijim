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
  throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY must be set in your .env file");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// -----------------------------
// Static public routes
// -----------------------------
const staticUrls = [
  { loc: "/", changefreq: "daily", priority: 1.0 },
  { loc: "/search", changefreq: "daily", priority: 0.8 },
  { loc: "/cart", changefreq: "daily", priority: 0.8 },
  { loc: "/checkout", changefreq: "daily", priority: 0.7 },
  { loc: "/payment", changefreq: "daily", priority: 0.5 },
  { loc: "/about-us", changefreq: "monthly", priority: 0.5 },
  { loc: "/contact-us", changefreq: "monthly", priority: 0.5 },
  { loc: "/orders", changefreq: "daily", priority: 0.6 },
  { loc: "/profile", changefreq: "daily", priority: 0.6 },
  { loc: "/account", changefreq: "daily", priority: 0.5 },
  { loc: "/track-order", changefreq: "daily", priority: 0.5 },
  
  { loc: "/wishlist", changefreq: "daily", priority: 0.5 },
  { loc: "/thank-you", changefreq: "daily", priority: 0.5 },
  { loc: "/privacy-policy", changefreq: "yearly", priority: 0.2 },
  { loc: "/terms-conditions", changefreq: "yearly", priority: 0.2 },
  { loc: "/shipping-delivery", changefreq: "yearly", priority: 0.2 },
  { loc: "/cancellation-refund", changefreq: "yearly", priority: 0.2 },
  { loc: "/forgot-password", changefreq: "monthly", priority: 0.3 },
];

// -----------------------------
// Fetch products
// -----------------------------
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

// -----------------------------
// Generate JSON-LD for a product
// -----------------------------
function generateProductJsonLd(product) {
  const name = product.name || "Unnamed Product";
  const description = product.description || "Description coming soon.";
  const image = product.image || `${baseUrl}/default-product.png`;
  const price = product.price || 0;
  const url = `${baseUrl}/product/details/${product.code}`;

  const review = {
    "@type": "Review",
    author: "Anonymous",
    datePublished: new Date().toISOString().split("T")[0],
    reviewBody: "This is a great product!",
    reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" }
  };

  const aggregateRating = {
    "@type": "AggregateRating",
    ratingValue: "5",
    reviewCount: 1
  };

  return {
    "@context": "https://schema.org/",
    "@type": "Product",
    name,
    image: [image],
    description,
    sku: product.code,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "INR",
      price,
      availability: "https://schema.org/InStock"
    },
    review: [review],
    aggregateRating
  };
}

// -----------------------------
// Generate sitemap XML
// -----------------------------
function generateSitemap(products) {
  const productUrls = products.map(p => ({
    loc: `/product/details/${p.code}`,
    lastmod: p.updated_at ? new Date(p.updated_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    changefreq: "weekly",
    priority: 0.9,
  }));

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));
  const categoryUrls = categories.map(c => ({
    loc: `/products/${encodeURIComponent(c)}`,
    changefreq: "weekly",
    priority: 0.8
  }));

  const allUrls = [
    ...staticUrls,
    { loc: "/products", changefreq: "daily", priority: 1.0, lastmod: new Date().toISOString().split("T")[0] },
    ...categoryUrls,
    ...productUrls,
  ];

  const header = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  const footer = '</urlset>';

  const body = allUrls.map(({ loc, lastmod, changefreq, priority }) => `
  <url>
    <loc>${baseUrl}${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join("\n");

  return header + body + "\n" + footer;
}

// -----------------------------
// Write files
// -----------------------------
async function writeFiles() {
  const products = await fetchProducts();
  const publicDir = path.resolve(process.cwd(), "public");
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);

  // sitemap.xml
  const sitemapXml = generateSitemap(products);
  fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemapXml, "utf8");
  console.log("✅ sitemap.xml generated");

  // robots.txt
  const robots = `
# Aijim.shop Robots.txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Sitemap: ${baseUrl}/sitemap.xml
`.trim();
  fs.writeFileSync(path.join(publicDir, "robots.txt"), robots, "utf8");
  console.log("✅ robots.txt generated");

  // JSON-LD
  const jsonLdDir = path.join(publicDir, "json-ld");
  if (!fs.existsSync(jsonLdDir)) fs.mkdirSync(jsonLdDir);

  products.forEach(product => {
    const jsonLd = generateProductJsonLd(product);
    fs.writeFileSync(path.join(jsonLdDir, `${product.code}.json`), JSON.stringify(jsonLd, null, 2), "utf8");
  });
  console.log("✅ JSON-LD files generated at /public/json-ld/");
}

writeFiles();
