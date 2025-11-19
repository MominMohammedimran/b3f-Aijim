import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import useSEO from "@/hooks/useSEO";

interface ProductSEO {
  name: string;
  description: string;
  image: string;
  price?: number;
  currency?: string;
}

const defaultSEO = {
  title: "AIJIM | Premium Fashion, Affordable Price",
  description: "Shop premium streetwear & custom printed T-shirts by AIJIM.",
  url: "https://aijim.shop",
  image: "https://aijim.shop/og-image.jpg",
};

const NewSEOHelmet: React.FC = () => {
  const { pathname } = useLocation();
  const params = useParams();

  const [products, setProducts] = useState<ProductSEO[]>([]);
  const [seoData, setSeoData] = useState(defaultSEO);

  // Call the generic useSEO for page title/keywords update
  useSEO(pathname);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        let fetchedProducts: ProductSEO[] = [];

        if (pathname === "/" || pathname.startsWith("/products")) {
          const { data, error } = await supabase
            .from("products")
            .select("name, description, image, price");
          if (!error && data) {
            fetchedProducts = data.map((p: any) => ({
              name: p.name,
              description: p.description,
              image: p.image,
              price: p.price,
              currency: "INR",
            }));
          }
        }

        // Individual product details
        if (pathname.startsWith("/product/details") && params.productId) {
          const { data, error } = await supabase
            .from("products")
            .select("name, description, image, price")
            .eq("id", params.productId)
            .single();
          if (!error && data) {
            fetchedProducts = [
              {
                name: data.name,
                description: data.description,
                image: data.image,
                price: data.price,
                currency: "INR",
              },
            ];
          }
        }

        setProducts(fetchedProducts);
      } catch (err) {
        console.error("SEO fetch error:", err);
      }
    };

    fetchProducts();

    // Update SEO meta per route
    if (pathname === "/") {
      setSeoData({
        title: "AIJIM | Premium Fashion, Affordable Price",
        description: "Shop premium streetwear & custom printed T-shirts by AIJIM.",
        url: defaultSEO.url,
        image: defaultSEO.image,
      });
    } else if (pathname.startsWith("/products")) {
      setSeoData({
        title: "Shop All Products | AIJIM",
        description: "Browse AIJIM’s full collection of streetwear.",
        url: defaultSEO.url,
        image: defaultSEO.image,
      });
    } else if (pathname.startsWith("/product/details")) {
      setSeoData({
        title: "Product Details | AIJIM",
        description: "Check out design, sizing, and features before you buy.",
        url: defaultSEO.url,
        image: defaultSEO.image,
      });
    }
  }, [pathname, params.productId]);

  const fullUrl = `${seoData.url}${pathname}`;
  const fullTitle = seoData.title.includes("AIJIM")
    ? seoData.title
    : `${seoData.title} | AIJIM`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={seoData.description} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={seoData.description} />
      <meta property="og:image" content={seoData.image} />
      <meta property="og:url" content={fullUrl} />
      <link rel="canonical" href={fullUrl} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={seoData.description} />
      <meta name="twitter:image" content={seoData.image} />

      {/* JSON-LD structured data for all products */}
      {products.length > 0 && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            itemListElement: products.map((p, i) => ({
              "@type": "Product",
              position: i + 1,
              name: p.name,
              description: p.description,
              image: p.image,
              ...(p.price && {
                offers: {
                  "@type": "Offer",
                  price: p.price,
                  priceCurrency: p.currency,
                  availability: "https://schema.org/InStock",
                },
              }),
            })),
          })}
        </script>
      )}
    </Helmet>
  );
};

export default NewSEOHelmet;
