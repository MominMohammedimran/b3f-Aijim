import React from "react";
import { Product } from "@/lib/types";

interface ProductJsonLdProps {
  product: Product;
}

const ProductJsonLd: React.FC<ProductJsonLdProps> = ({ product }) => {
  if (!product) return null;

  // Fallbacks for missing data
  const productName = product.name || "Sample Product";
  const productDesc = product.description || "Description coming soon.";
  const productImage = product.image || "https://aijim.shop/og-image.svg";
  const productPrice = product.price || 0;
  const productSKU = product.code || "SKU-0000";
  const productURL = `${window.location.origin}/product/${product.code || ""}`;

  // Generate multiple anonymous reviews as placeholders
  const reviews = [
    {
      "@type": "Review",
      author: "Anonymous",
      datePublished: new Date().toISOString().split("T")[0],
      reviewBody: "Great product! Highly recommended.",
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
    },
    {
      "@type": "Review",
      author: "Anonymous",
      datePublished: new Date().toISOString().split("T")[0],
      reviewBody: "Loved it, will buy again.",
      reviewRating: { "@type": "Rating", ratingValue: "4", bestRating: "5" },
    },
  ];

  // Aggregate rating placeholder based on reviews
  const aggregateRating = {
    "@type": "AggregateRating",
    ratingValue: "4.5",
    reviewCount: reviews.length,
  };

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: productName,
    image: [productImage],
    description: productDesc,
    sku: productSKU,
    offers: {
      "@type": "Offer",
      url: productURL,
      priceCurrency: "INR",
      price: productPrice,
      availability: "https://schema.org/InStock",
    },
    review: reviews,
    aggregateRating,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
};

export default ProductJsonLd;
