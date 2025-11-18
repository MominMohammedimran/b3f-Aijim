import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { Product } from '@/lib/types';
import { products } from '@/lib/data';
import ProductDetailsContent from '@/components/products/details/ProductDetailsContent';
import SEOHelmet from '@/components/seo/SEOHelmet';
import useSEO from '@/hooks/useSEO';

const ProductDetailsPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);

  const seo = useSEO('/product/details/:productId');

  useEffect(() => {
    if (!productId) return;

    // Load product from data (no fallback sample product)
    const foundProduct = products.find((p) => p.code === productId);

    setProduct(foundProduct || null);
  }, [productId]);

  return (
    <Layout>
      <SEOHelmet {...{ ...seo, keywords: seo.keywords?.join(', ') }} />

      <div className="container-custom mt-14">
        <div className="hidden lg:flex items-center pt-5">
          <Link to="/" className="mr-2">
            <ArrowLeft size={24} className="back-arrow" />
          </Link>
          <h1 className="text-xl font-bold text-white line-clamp-1">
            {product?.name || 'Product Details'}
          </h1>
        </div>

        {/* If product exists → show details */}
        {product ? (
          <ProductDetailsContent product={product} />
        ) : (
          // No product found → show message
          <div className="bg-gray-900 shadow-sm p-8 text-center">
            <p className="text-gray-200">Product details are not available.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetailsPage;
