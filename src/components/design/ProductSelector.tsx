import React from 'react';
import { cn } from '@/lib/utils';

interface ProductVariant {
  size: string;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  variants: ProductVariant[];
}

interface ProductSelectorProps {
  products: Record<string, Product>;
  activeProduct: string;
  isDualSided: boolean;
  onProductSelect: (productId: string) => void;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({
  products,
  activeProduct,
  isDualSided,
  onProductSelect,
}) => {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-white mb-3">Select Product</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Object.entries(products).map(([key, product]) => (
          <button
            key={key}
            onClick={() => onProductSelect(key)}
            className={cn(
              'relative p-4 rounded-xl border-2 transition-all duration-200',
              'hover:shadow-lg hover:scale-105',
              activeProduct === key
                ? 'border-blue-500 bg-blue-500/20 shadow-md shadow-blue-500/20'
                : 'border-gray-700 bg-gray-900 hover:border-gray-500'
            )}
          >
            <div className="aspect-square mb-2 rounded-lg overflow-hidden bg-gray-800">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="text-center">
              <h3 className="font-medium text-white text-sm">{product.name}</h3>
              <p className="text-blue-400 font-semibold">₹{product.price}</p>
            </div>
            
            {/* Selected indicator */}
            {activeProduct === key && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductSelector;
