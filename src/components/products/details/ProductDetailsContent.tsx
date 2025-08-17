
import React, { useState } from 'react';
import { Product } from '@/lib/types';
import ProductImage from '../ProductImage';
import ProductDetails from '../ProductDetails';
import ProductReviewSection from '../ProductReviewSection';

interface ProductDetailsContentProps {
  product: Product;
}

const ProductDetailsContent: React.FC<ProductDetailsContentProps> = ({ product }) => {
  
  return (
    <div className="space-y-8">
      <div className="grid    grid-cols-1 mt-5 md:grid-cols-2 shadow-md">
        <ProductImage 
          image={product.image} 
          name={product.name} 
          additionalImages={product.images || []}
        />
        
        <ProductDetails
          product={product}
          allowMultipleSizes={true}
        />
      </div>
      
      {/* Reviews Section */}
      <ProductReviewSection productId={product.id} />
    </div>
  );
};

export default ProductDetailsContent;
