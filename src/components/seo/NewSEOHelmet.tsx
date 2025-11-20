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
}

interface PageSEO {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

interface SEOProps {
  pageSEO?: PageSEO;
  productProp?: ProductSEO; // optional product prop
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
    description: "Explore the latest trends and premium printed products by AIJIM.",
  },
  "/about-us": { title: "About Us | AIJIM", description: "Learn about AIJIM brand & story." },
  "/contact-us": { title: "Contact | AIJIM", description: "Get in touch with AIJIM support." },
  "/signin": { title: "Sign In | AIJIM", description: "Access your AIJIM account." },

  "/cart": { title: "Your Cart | AIJIM", description: "Review your AIJIM products." },
  "/search": { title: "Search | AIJIM", description: "Search your desired products. " },
  "/products": { title: "Shop All Products | AIJIM", description: "Browse AIJIM streetwear." },
  "/product/details": { title: "Product Details | AIJIM", description: "View product details." },
};

export default function NewSEOHelmet({ pageSEO, productProp }: SEOProps) {
  const { pathname } = useLocation();
  const params = useParams<{ productId?: string }>();
  const [product, setProduct] = useState<ProductSEO | null>(productProp || null);

  // Fetch product if not passed as prop
  useEffect(() => {
    if (productProp || !params.productId) return;

    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("id, name, description, image, price, rating")
          .eq("id", params.productId)
          .single();

        if (!error && data) {
          setProduct({
            id: data.id,
            name: data.name,
            description: data.description,
            image: data.image,
            price: data.price,
            currency: "INR",
            rating: data.rating,
            reviewCount:2,
          });
        }
      } catch (err) {
        console.error("SEO fetch error:", err);
      }
    };

    fetchProduct();
  }, [params.productId, productProp]);

  // Determine SEO metadata
  const matchedSEO = routeSEO[pathname] || {};
  const seo = {
    ...defaultSEO,
    ...matchedSEO,
    ...pageSEO,
    title: product ? `${product.name} | AIJIM` : matchedSEO.title || pageSEO?.title || defaultSEO.title,
    description: product?.description || matchedSEO.description || pageSEO?.description || defaultSEO.description,
    image: product?.image || pageSEO?.image || defaultSEO.image,
    url: product ? `${defaultSEO.url}/product/details/${product.id}` : defaultSEO.url + pathname,
  };

  return (
    <Helmet>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:url" content={seo.url} />
      <link rel="canonical" href={seo.url} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />

      {/* JSON-LD structured data */}
      {product && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            name: product.name,
            image: [product.image],
            description: product.description,
            sku: product.id,
            offers: product.price
              ? {
                  "@type": "Offer",
                  priceCurrency: product.currency || "INR",
                  price: product.price,
                  availability: "https://schema.org/InStock",
                  url: seo.url,
                }
              : undefined,
            aggregateRating:
              product.rating && product.reviewCount
                ? {
                    "@type": "AggregateRating",
                    ratingValue: product.rating,
                    reviewCount: product.reviewCount,
                  }
                : undefined,
          })}
        </script>
      )}
      {!product && (
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
