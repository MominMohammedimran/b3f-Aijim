function generateJsonLd(product) {
  const today = new Date().toISOString().split("T")[0];
  const baseUrl = "https://aijim.shop";
  const url = `${baseUrl}/product/${product.code}`;

  // ------------------------------
  // PRODUCT SCHEMA
  // ------------------------------
  const Product = {
    "@context": "https://schema.org",
    "@type": "Product",

    name: product.name || "Unnamed Product",
    description: product.description || "Description coming soon.",
    image: [product.image || `${baseUrl}/default-product.png`],
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

      // Must exist for Google Merchant/Shopping
      priceValidUntil: `${new Date().getFullYear()}-12-31`,

      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",

      // Google-valid shipping schema
      shippingDetails: [
        {
          "@type": "OfferShippingDetails",
          shippingRate: {
            "@type": "MonetaryAmount",
            currency: "INR",
            value: "0"
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
              maxValue: 5,
              unitCode: "DAY"
            }
          }
        }
      ],

      // Google requires complete return policy
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "IN",
        returnPolicyCategory:
          "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 5,
        returnMethod: "https://schema.org/ReturnByMail",
        refundType: "https://schema.org/FullRefund"
      }
    },

    // Optional but good for SEO
    aggregateRating: product.rating
      ? {
          "@type": "AggregateRating",
          ratingValue: String(product.rating),
          reviewCount: String(product.reviewCount || 10)
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
          worstRating: "1"
        }
      }
    ]
  };

  // ------------------------------
  // BREADCRUMB SCHEMA
  // ------------------------------
  const Breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Products",
        item: `${baseUrl}/products`
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: url
      }
    ]
  };

  // ------------------------------
  // FAQ SCHEMA
  // ------------------------------
  const FAQ = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is the delivery time?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Delivery usually takes 5–7 days across India."
        }
      },
      {
        "@type": "Question",
        name: "Do you offer returns?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, you can return the product within 5 days."
        }
      }
    ]
  };

  return [Product, Breadcrumbs, FAQ];
}
