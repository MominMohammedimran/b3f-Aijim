// components/ui/IdexFeaturesproducts.tsx
import React from "react";
import { Product } from "@/lib/types";

interface Props {
  product: Product;
  onClick?: (p: Product) => void;
}

const IndexFeaturesproducts: React.FC<Props> = ({ product, onClick }) => {
  const sizes = Array.isArray(product.sizes) ? product.sizes : [];
  const totalStock = sizes.reduce((sum, s) => sum + (typeof s.stock === 'number' ? s.stock : 0), 0);

  const inStock = totalStock > 0;
  const discount = product.originalPrice && product.originalPrice > product.price;
  const pct = discount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Get second image or fallback to main image
  const backImage = product.images && product.images.length > 1 
    ? product.images[1] 
    : product.image;

  return (
    <div
      onClick={() => onClick?.(product)}
      className="flip-card-container cursor-pointer group"
    >
      <div className="flip-card">
        {/* Front Side */}
        <div className="flip-card-front rounded-none">
          <div className="relative aspect-[4/5] overflow-hidden bg-gray-900 border border-gray-700">
            <img
              src={product.image}
              alt={product.name}
              className={`w-full h-full object-cover transition-all duration-500 ${
                inStock ? '' : 'grayscale opacity-50'
              }`}
            />
            {pct > 0 && (
              <span className="absolute top-2 right-1 bg-red-600 text-white text-xs px-1 py-1  animate-bounce z-10">
                {pct}% OFF
              </span>
            )}
          </div>
          <div className="p-2 pl-3 pr-3 bg-gray-900 border-x border-b border-gray-700">
            <h3 className="text-white font-medium text-sm leading-snug">{product.name}</h3>
            <div className="flex items-center justify-center gap-2 text-sm mt-1">
              {discount && (
                <span className="text-gray-400 line-through">₹{product.originalPrice}</span>
              )}
              <span className="text-white text-lg font-bold">₹{product.price}</span>
              <div></div>
              
              <span
                className={`ml-auto text-[9px] font-bold px-2 py-0.5 rounded ${
                  inStock ? 'bg-white text-black' : 'bg-red-600 text-white'
                }`}
              >
                {inStock ? 'Stock' : 'Sold'}
              </span>
            </div>
          </div>
        </div>

        {/* Back Side */}
        <div className="flip-card-back rounded-none">
          <div className="relative aspect-[4/5] overflow-hidden bg-gray-900 border border-gray-200">
            <img
              src={backImage}
              alt={`${product.name} - Back view`}
              className="w-full h-full object-cover"
            />
            <div className="absolute bg-gradient-to-t from-black via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              
              <button className="w-full bg-blue-600 hover:bg-blue-900 text-white text-xs font-bold py-2 px-3 rounded transition-colors">
                View Product
              </button>
            </div>
          </div>
          <div className="p-2 pl-3 pr-3 gap-2px bg-gray-900 border-x border-b border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-white font-bold">₹{product.price}</span>
              {sizes.length > 0 && (
                <span className="text-gray-300 text-xs">
                 {sizes.map(s => s.size).join(', ')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndexFeaturesproducts;
