import { useEffect } from "react";

type SEOOverrides = Partial<{
  title: string;
  description: string;
  keywords: string[];
  url: string;
  image: string;
  twitterHandle: string;
  products: any[];
}>;

const defaultSEO = {
  title: "AIJIM | Premium fashion , Affordable price ",
  description:
    "Your trusted partner [AIJIM] — From custom T-shirts to fashion drops, we bring your ideas to life with premium quality and fast delivery.",
  keywords: [
    "AIJIM",
    "fashion India",
    "premium streetwear",
    "AIJIM clothing",
    "hoodies",
  ],
  url: "https://aijim.shop",
  image: "https://aijim.shop/og-image.jpg",
  twitterHandle: "@aijimindia",
};

const routeSEO: Record<string, Partial<typeof defaultSEO>> = {
  "/": {
    title: "AIJIM | Premium Fashion , Affordable price ",
    description:
      "Explore the latest trends and premium printed products by AIJIM — fashion-forward and quality-driven.",
  },
  "/signin": {
    title: "Sign In | AIJIM",
    description:
      "Access your AIJIM account to track orders, manage your wishlist, and shop faster.",
  },
  "/signup": {
    title: "Create an Account | AIJIM",
    description:
      "Join AIJIM and unlock personalized fashion and exclusive offers.",
  },
  "/cart": {
    title: "Your Cart | AIJIM",
    description: "Review your selected AIJIM products and proceed to checkout.",
  },
  "/checkout": {
    title: "Checkout | AIJIM",
    description:
      "Securely complete your order with fast delivery and trusted payment options.",
  },

  // Dynamic patterns handled manually
  "/product/details": {
    title: "Product Details | AIJIM",
    description: "Check out design, sizing, and features before you buy.",
  },
  "/products": {
    title: "Shop All Products | AIJIM",
    description: "Browse AIJIM’s full collection of streetwear.",
  },
};

function getMatchedSEO(path: string) {
  if (routeSEO[path]) return routeSEO[path];

  // Dynamic route support
  if (path.startsWith("/product/details")) return routeSEO["/product/details"];
  if (path.startsWith("/products")) return routeSEO["/products"];

  return {};
}

export default function useSEO(path: string, overrides: SEOOverrides = {}) {
  const seo = {
     ...defaultSEO,
     ...getMatchedSEO(path),
     ...overrides,
  };

  useEffect(() => {
    document.title = seo.title;

    const setMeta = (selector: string, content: string) => {
      let tag = document.querySelector(selector);
      if (tag) tag.setAttribute("content", content);
    };

    setMeta("meta[name='description']", seo.description);
    setMeta("meta[name='keywords']", seo.keywords?.join(", "));

    // Canonical
    let canonical = document.querySelector("link[rel='canonical']");
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", seo.url + path);

    // OG
    const og = {
      "og:title": seo.title,
      "og:description": seo.description,
      "og:image": seo.image,
      "og:url": seo.url + path,
    };
    Object.entries(og).forEach(([prop, content]) => {
      let tag = document.querySelector(`meta[property='${prop}']`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("property", prop);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    });

    // Twitter
    const twitter = {
      "twitter:card": "summary_large_image",
      "twitter:title": seo.title,
      "twitter:description": seo.description,
      "twitter:image": seo.image,
    };
    Object.entries(twitter).forEach(([name, content]) => {
      let tag = document.querySelector(`meta[name='${name}']`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    });
  }, [path, JSON.stringify(overrides)]);

  return seo;
}