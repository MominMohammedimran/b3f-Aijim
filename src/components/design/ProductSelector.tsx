import React from "react";
import { cn } from "@/lib/utils";

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
      <h2 className="text-lg font-semibold text-white mb-3">
        Select Product
      </h2>

      {/* ✅ ALWAYS 3 columns */}
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(products).map(([key, product]) => {
          const isActive = activeProduct === key;

          const isOutOfStock =
            !product.variants ||
            product.variants.every((v) => v.stock <= 0);

          return (
            <button
              key={key}
              disabled={isOutOfStock}
              onClick={() => onProductSelect(key)}
              className={cn(
                "relative border-2 p-1 transition-all duration-200",
                "h-full flex flex-col", // ✅ equal height
                "rounded-none",
                isOutOfStock
                  ? "opacity-40 cursor-not-allowed border-gray-800 bg-gray-900"
                  : "hover:scale-105 hover:shadow-lg",
                isActive
                  ? "border-blue-500 bg-blue-500/20 shadow-blue-500/30"
                  : "border-gray-700 bg-gray-900 hover:border-gray-500"
              )}
            >
              {/* ✅ Fixed image height */}
              <div className="aspect-square w-full bg-gray-800 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* ✅ Fixed content height */}
              <div className="mt-2 flex flex-1 flex-col justify-between text-center">
                <h3 className="font-medium text-white text-sm line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-blue-400 font-semibold text-sm mt-1">
                  ₹{product.price}
                </p>
              </div>

              {/* Active indicator */}
              {isActive && !isOutOfStock && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}

              {/* Out of stock overlay */}
              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                  <span className="text-xs font-bold text-red-500 bg-black uppercase">
                    Out of Stock
                  </span>
                </div>
              )}

              {/* Dual sided badge */}
              {isDualSided && !isOutOfStock && (
                <div className="absolute bottom-2 left-2 bg-purple-600 text-white text-[10px] px-2 py-0.5 rounded">
                  Dual-Sided
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProductSelector;
