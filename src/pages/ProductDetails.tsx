
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Product } from '@/lib/types';
import ProductDetailsContent from '@/components/products/details/ProductDetailsContent';

const ProductDetails = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    if (!productId) return;
    
    const mockProduct: Product = {
      id: productId,
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
    
    setProduct(mockProduct);
  }, [productId]);

  return (
    <Layout>
      {product ? (
        <ProductDetailsContent product={product} />
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">Product details are not available.</p>
        </div>
      )}
    </Layout>
  );
};

export default ProductDetails;
