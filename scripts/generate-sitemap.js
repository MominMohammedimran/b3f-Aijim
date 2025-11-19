// scripts/generate-sitemap.js
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load environment variables from .env
dotenv.config();

const baseUrl = process.env.BASE_URL || "https://aijim.shop";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY must be set in your .env file");
}

// Initialize Supabase client
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
  { loc: "/reset-password", changefreq: "monthly", priority: 0.3 },
  { loc: "/wishlist", changefreq: "daily", priority: 0.5 },
  { loc: "/thank-you", changefreq: "daily", priority: 0.5 },
  { loc: "/privacy-policy", changefreq: "yearly", priority: 0.2 },
  { loc: "/terms-conditions", changefreq: "yearly", priority: 0.2 },
  { loc: "/shipping-delivery", changefreq: "yearly", priority: 0.2 },
  { loc: "/cancellation-refund", changefreq: "yearly", priority: 0.2 },
  { loc: "/forgot-password", changefreq: "monthly", priority: 0.3 },
];

// -----------------------------
// Fetch dynamic products
// -----------------------------
async function fetchProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("code")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error.message);
    return [];
  }

  return (data || [])
    .filter(p => p.code) // remove null/undefined
    .map(p => ({
      loc: `/product/details/${p.code}`,
      changefreq: "weekly",
      priority: 0.9,
    }));
}

// -----------------------------
// Fetch dynamic categories
// -----------------------------
async function fetchCategories() {
  const { data, error } = await supabase
    .from("products")
    .select("category");

  if (error) {
    console.error("Error fetching categories:", error.message);
    return [];
  }

  const categories = Array.from(
    new Set((data || [])
      .map(c => c.category)
      .filter(Boolean)) // remove null/empty
  );

  return categories.map(c => ({
    loc: `/products/${encodeURIComponent(c)}`,
    changefreq: "weekly",
    priority: 0.8,
  }));
}

// -----------------------------
// Generate sitemap XML
// -----------------------------
async function generateSitemap() {
  const header =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  const footer = `</urlset>`;

  const productUrls = await fetchProducts();
  const categoryUrls = await fetchCategories();

  const allUrls = [
    ...staticUrls,
    { loc: "/products", changefreq: "daily", priority: 1.0 },
    ...categoryUrls,
    ...productUrls,
  ];

  console.log(`✅ Total URLs to add: ${allUrls.length}`);

  const body = allUrls
    .map(({ loc, changefreq, priority }) => {
      const lastmod = new Date().toISOString().split("T")[0];
      return `  <url>
    <loc>${baseUrl}${loc}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join("\n");

  return header + body + "\n" + footer;
}

// -----------------------------
// Write sitemap.xml & robots.txt
// -----------------------------
async function writeFiles() {
  const sitemap = await generateSitemap();
  const publicDir = path.resolve(process.cwd(), "public");

  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);

  fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemap, "utf8");
  console.log("✅ sitemap.xml generated at /public/sitemap.xml");

  const robots = `
# Aijim.shop Robots.txt
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Sitemap: ${baseUrl}/sitemap.xml
`.trim();

  fs.writeFileSync(path.join(publicDir, "robots.txt"), robots, "utf8");
  console.log("✅ robots.txt generated at /public/robots.txt");
}

// Run
writeFiles();
