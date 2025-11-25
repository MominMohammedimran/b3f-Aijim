import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Product } from "@/lib/types";
import ProductDetailsContent from "@/components/products/details/ProductDetailsContent";
import SEOHelmet from "@/components/seo/SEOHelmet";
import useSEO from "@/hooks/useSEO";
import ProductJsonLd from "@/components/products/ProductJsonLd";
import { supabase } from "@/integrations/supabase/client";
import NewSEOHelmet from "@/components/seo/NewSEOHelmet";

interface ProductDetailsPageProps {
  product?: Product; // Optional prop
}

const ProductDetailsPage: React.FC<ProductDetailsPageProps> = ({
  product: propProduct,
}) => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(propProduct || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canonicalUrl = `https://aijim.shop/product/${productId}`;

  const seo = useSEO("/product/:productId");

  useEffect(() => {
    if (propProduct) return; // Already have product via props

    if (!productId) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("code", productId)
          .single<Product>();

        if (error) throw error;
        if (!data) throw new Error("Product not found");

        setProduct(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load product");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, propProduct]);

  return (
    <Layout>
      <NewSEOHelmet
        pageSEO={{
          title: product?.name,
          description: product?.description,
          image: product?.image,
          url: canonicalUrl, // optional
        }}
        productProp={product}
      />

      <div className="container-custom mt-14">
        <div className="hidden lg:flex items-center pt-10 mt-5">
          <Link to="/" className="mr-2">
            <ArrowLeft size={24} className="back-arrow" />
          </Link>
          <h1 className="text-xl font-bold text-white line-clamp-1">
            {product?.name || "Product Details"}
          </h1>
        </div>

        {loading ? (
          <div className="bg-gray-900 shadow-sm p-4 text-center text-gray-200">
            Loading product details...
          </div>
        ) : error ? (
          <div className="bg-gray-900 shadow-sm p-4 text-center text-red-400">
            {error}
          </div>
        ) : product ? (
          <>
            <ProductDetailsContent product={product} />
            <ProductJsonLd product={product} />
          </>
        ) : (
          <div className="bg-gray-900 shadow-sm p-8 text-center text-gray-200">
            Product details are not available.
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetailsPage;
