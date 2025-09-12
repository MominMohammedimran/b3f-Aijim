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
                inStock ? '' : 'grayscale opacity-70'
              }`}
            />
            {pct > 0 && (
               <span className="absolute top-1 right-0 bg-red-600 text-white text-[10px] px-1 py-0 font-semibold animate-bounce z-10">
                {pct}% OFF
              </span>
            )}
             <span
                className={` rounded-none  ${
                  inStock
                    ? 'absolute top-6 right-0 text-[11px] uppercase px-1.5 py-0 bg-white text-black font-semibold'
                    : ' absolute top-1/2 left-1/3  text-lg uppercase px-3 py-0 bg-red-600 font-semibold text-white'
                }`}
              >
                {inStock ? 'Stock' : 'Sold'}
              </span>
          </div>
         <div className="p-1 pt-2 bg-[#111] border-x border-b border-gray-800">
            <h3 className="text-white text-left font-bold text-[16px] leading-tight ml-2">
              {product.name}
            </h3>
            <div className="flex items-center justify-evenly gap-2 text-sm ">
              {discount && (
                <span className="text-gray-400 line-through font-semibold">
                  ₹{product.originalPrice}
                </span>
              )}
              <span className="text-white text-[17px] font-semibold">₹{product.price}</span>
              {/*<span
                className={`ml-auto text-[10px] px-1 py-0.5 rounded ${
                  inStock
                    ? 'bg-white text-black font-bold'
                    : 'bg-red-600 font-bold text-white'
                }`}
              >
                {inStock ? 'Stock' : 'Sold'}
              </span>*/}
            </div>
        
          </div>
        </div>

        {/* Back Side */}
        <div className="flip-card-back rounded-none">
          <div className="relative aspect-[4/5] overflow-hidden bg-gray-900 border border-gray-200">
            <img
              src={backImage}
              alt={`${product.name} - Back view`}
             
               className={`w-full h-full object-cover ${
                inStock ? '' : 'grayscale opacity-70'
              }`}
            />
            <div className=" " />
            <div className=" text-white">
               {pct > 0 && (
               <span className="absolute top-1 right-0 bg-red-600 text-white text-[10px] px-1 py-0 font-semibold animate-bounce z-10">
                {pct}% OFF
              </span>
            )}
              <span
                className={` rounded-none  ${
                  inStock
                    ? 'absolute top-6 right-0 text-[11px] uppercase px-1.5 py-0 bg-white text-black font-semibold'
                    : ' absolute top-1/2 left-1/3 mr-3 text-lg uppercase px-3 py-0 bg-red-600 font-semibold  text-white'
                }`}
              >
                {inStock ? 'Stock' : 'Sold'}
              
              </span>
              <button className="absolute bottom-4   w-full bg-blue-600 hover:bg-blue-900 text-white text-xs font-bold py-2 px-1 rounded transition-colors">
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
