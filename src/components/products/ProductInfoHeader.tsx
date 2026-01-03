import React from 'react';

interface ProductInfoHeaderProps {
  name: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  deliveryFee: number;
}

const ProductInfoHeader: React.FC<ProductInfoHeaderProps> = ({
  name,
  price,
  originalPrice,
  discountPercent,
  deliveryFee,
}) => {
  return (
    <div id="sizeSection" className="px-2 mt-2">
      <h2 className="text-lg font-semibold mb-1">{name}</h2>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl font-bold text-yellow-300">₹{price}</span>
        {originalPrice > price && (
          <span className="text-md text-gray-400 line-through">
            ₹{originalPrice}
          </span>
        )}
        {discountPercent > 0 && (
          <span className="text-[10px] bg-red-600 text-white px-1 py-0.5 rounded">
            {discountPercent}% OFF
          </span>
        )}
        <div className="flex justify-start sm:justify-center items-baseline gap-2 mt-0 text-left sm:text-center">
          <span className="text-yellow-400 text-[14px] font-semibold">
            {deliveryFee === 0 ? (
              <span className="text-xs uppercase font-semibold md:text-md text-gray-200">
                Free Shipping
              </span>
            ) : (
              `+ ₹${deliveryFee}`
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductInfoHeader;
