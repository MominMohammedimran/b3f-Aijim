import React from 'react';

interface ProductVariant {
  size: string;
  stock: number;
}

interface SizeWithQuantity {
  size: string;
  quantity: number;
}

interface ProductSizeSelectorProps {
  variants: ProductVariant[];
  selectedSizes: SizeWithQuantity[];
  onToggleSize: (size: string) => void;
}

const ProductSizeSelector: React.FC<ProductSizeSelectorProps> = ({ variants, selectedSizes, onToggleSize }) => {
  return (
    <div className="px-2 mt-3">
      <span className="text-gray-200 text-lg font-medium pt-1">Select Size</span>
      <div className="grid mt-1 grid-cols-6 md:grid-cols-6 gap-2 relative border-t border-gray-200">
        {variants.map(({ size, stock }) => {
          const selected = selectedSizes.some((s) => s.size === size);
          const isOutOfStock = stock === 0;

          return (
            <div key={size} className="relative mt-2">
              <button
                onClick={() => onToggleSize(size)}
                disabled={isOutOfStock}
                className={`relative w-full py-1.5 text-xs font-bold border rounded-sm transition-all overflow-hidden ${
                  selected
                    ? "bg-white text-black underline border-2 border-gray-300"
                    : isOutOfStock
                    ? "bg-gray-900 text-gray-200 border-gray-700 cursor-not-allowed opacity-90"
                    : "text-white border-gray-200 hover:bg-gray-100 hover:text-black"
                }`}>
                {size}
              </button>

              {isOutOfStock && (
                <span className="absolute inset-0 flex items-center justify-center opacity-70 text-red-500 font-extrabold text-xs pointer-events-none">
                  ✕
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductSizeSelector;
