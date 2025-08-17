
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

    // Always load product from mock data for now
    const foundProduct = products.find((p) => p.id === productId);

    if (foundProduct) {
      setProduct(foundProduct);
    } else {
      // Define default product first
      const defaultProduct: Product = {
        id: productId || "default-product",
        code: "SAMPLE-001",
        name: "Sample Product",
        description: "This is a sample product description.",
        price: 99.99,
        originalPrice: 129.99,
        discountPercentage: 20,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500",
        rating: 4.5,
        category: "Sample Category",
        tags: ["featured", "new"],
        stock: 15,
        variants: [
          { size: 'S', stock: 5 },
          { size: 'M', stock: 8 },
          { size: 'L', stock: 2 }
        ],
        sizes: [
          { size: 'S', stock: 5 },
          { size: 'M', stock: 8 },
          { size: 'L', stock: 2 }
        ]
      };

      setProduct(defaultProduct);
    }
  }, [productId, navigate]);

  return (
    <Layout>
       <SEOHelmet {...{ ...seo, keywords: seo.keywords?.join(', ') }} />


      <div className="container-custom mt-14">
        <div className="flex items-center pt-5">
          <Link to="/" className="mr-2">
            <ArrowLeft size={24} className="back-arrow" />
          </Link>
          <h1 className="text-2xl font-bold text-yellow-300">{product?.name || 'Product Details'}</h1>
        </div>

        {product ? (
          <ProductDetailsContent product={product} />
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">Product details are not available.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetailsPage;
