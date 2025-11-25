import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface ProductSEO {
  id?: string;
  name: string;
  description: string;
  image: string;
  price?: number;
  currency?: string;
  rating?: number;
  reviewCount?: number;
  code?: string; // slug
}

interface PageSEO {
  title?: string;
  description?: string;
  image?: string;
  code?: string;
  url?: string;
}

interface SEOProps {
  pageSEO?: PageSEO;
  productProp?: ProductSEO;
}

const defaultSEO: PageSEO = {
  title: "AIJIM | Premium Fashion, Affordable Price",
  description: "Shop premium streetwear & custom printed T-shirts by AIJIM.",
  url: "https://aijim.shop",
  image: "https://aijim.shop/og-image.jpg",
};

const routeSEO: Record<string, Partial<PageSEO>> = {
  "/": {
    title: "AIJIM | Premium Fashion, Affordable Price",
    description:
      "Explore the latest trends and premium printed products by AIJIM.",
  },
  "/about-us": {
    title: "About Us | AIJIM",
    description: "Learn about AIJIM brand & story.",
  },
  "/contact-us": {
    title: "Contact | AIJIM",
    description: "Get in touch with AIJIM support.",
  },
  "/signin": {
    title: "Sign In | AIJIM",
    description: "Access your AIJIM account.",
  },
  "/search": {
    title: "Search | AIJIM",
    description: "Search your desired products.",
  },
  "/products": {
    title: "Shop All Products | AIJIM",
    description: "Browse AIJIM streetwear.",
  },
  "/product/": {
    title: "Product Details | AIJIM",
    description: "View product details.",
  },
};

export default function NewSEOHelmet({ pageSEO, productProp }: SEOProps) {
  const { pathname } = useLocation();
  const { productId } = useParams<{ productId?: string }>();

  const [product, setProduct] = useState<ProductSEO | null>(
    productProp || null
  );

  // Fetch product BY SLUG (IMPORTANT FIX)
  useEffect(() => {
    if (productProp || !productId) return;

    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("id, name, description, image, price, rating, code")
          .eq("code", productId) // ← IMPORTANT: Use slug, not id
          .single();

        if (!error && data) {
          setProduct({
            id: data.id,
            name: data.name,
            description: data.description,
            image: data.image,
            price: data.price,
            code: data.code,
            currency: "INR",
            rating: data.rating,
            reviewCount: 2,
          });
        }
      } catch (err) {
        console.error("SEO fetch error:", err);
      }
    };

    fetchProduct();
  }, [productId, productProp]);

  // Convert slug to keyword string
  const formatSlugKeywords = (slug?: string) =>
    slug ? slug.replace(/-/g, ", ") : "";

  const matchedSEO = routeSEO[pathname] || {};

  const seo = {
    ...defaultSEO,
    ...matchedSEO,
    ...pageSEO,

    title: product
      ? `${product.name} | Buy ${product.code?.replace(
          /-/g,
          " "
        )} Online | AIJIM`
      : matchedSEO.title || pageSEO?.title || defaultSEO.title,

    description:
      product?.description ||
      matchedSEO.description ||
      pageSEO?.description ||
      defaultSEO.description,

    image: product?.image || pageSEO?.image || defaultSEO.image,

    url: product
      ? `${defaultSEO.url}/product/${product.code}`
      : defaultSEO.url + pathname,

    keywords: product?.code
      ? formatSlugKeywords(product.code)
      : pageSEO?.code || "",
  };

  return (
    <Helmet>
      <title>{seo.title}</title>

      <meta name="description" content={seo.description} />
      {seo.keywords && <meta name="keywords" content={seo.keywords} />}

      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:url" content={seo.url} />

      <link rel="canonical" href={seo.url} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />

      {/* JSON-LD Schema */}
      {product ? (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            name: product.name,
            image: [product.image],
            description: product.description,
            sku: product.id,
            url: seo.url,
            offers: product.price
              ? {
                  "@type": "Offer",
                  priceCurrency: "INR",
                  price: product.price,
                  availability: "https://schema.org/InStock",
                }
              : undefined,
          })}
        </script>
      ) : (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: seo.title,
            description: seo.description,
            url: seo.url,
          })}
        </script>
      )}
    </Helmet>
  );
}
