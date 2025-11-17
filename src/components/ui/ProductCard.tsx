import React, { useEffect, useState } from "react";
import { Product } from "@/lib/types";

interface Props {
  product: Product;
  onClick?: (p: Product) => void;
  className?: string;
}

const ProductCard: React.FC<Props> = ({ product, onClick, className = "" }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const images =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [product.image];

  // Determine effective original price (if not provided fallback to price)
  const originalPrice = typeof product.originalPrice === "number" && product.originalPrice > 0
    ? product.originalPrice
    : product.price;

  // Calculate discount percentage when originalPrice is greater than price
  const hasDiscount = originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - product.price) / product.price) * 100)
    : 0;

  useEffect(() => {
    if (!isHovered || images.length <= 1) return;
    const interval = setInterval(
      () => setCurrentImage((p) => (p + 1) % images.length),
      1500
    );
    return () => clearInterval(interval);
  }, [isHovered, images.length]);

  const outOfStock = typeof product.stock === "number" ? product.stock <= 0 : false;

  return (
    <div
      onClick={() => onClick?.(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCurrentImage(0);
      }}
      className={`cursor-pointer bg-[#0b0b0b] rounded-none overflow-hidden group transition-all duration-500 hover:shadow-[0_6px_14px_rgba(255,255,255,0.07)] hover:-translate-y-1 h-full flex flex-col ${className}`}
    >
      {/* Image Section */}
      <div className="relative aspect-[4/5] sm:aspect-[5/5] overflow-hidden bg-neutral-900 flex-shrink-0">
        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={product.name}
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${
              i === currentImage ? "opacity-100" : "opacity-0"
            } ${outOfStock ? "opacity-50 grayscale" : ""}`}
          />
        ))}

        {/* Discount Badge */}
        {hasDiscount && discountPercent > 0 && (
          <div className="absolute top-3 left-3 z-20 bg-yellow-400 text-black text-[11px] font-semibold px-2 py-1 rounded-md shadow">
            {discountPercent}% OFF
          </div>
        )}

        {/* SOLD Overlay (still clickable) */}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/40 pointer-events-none">
            <div className="bg-red-600 text-white text-xs sm:text-sm font-bold uppercase tracking-wide px-4 py-2 rounded-md shadow-lg select-none">
              SOLD
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-1 flex flex-col justify-between flex-grow">
        <h3
          className="
            text-[11px] sm:text-[14px]
            text-left sm:text-center
            text-white font-medium tracking-wide leading-tight min-h-[36px]
         "
        >
          {product.name}
        </h3>

        {/* Price Section */}
        <div
          className="
            flex 
            justify-start sm:justify-center 
            items-baseline 
            gap-2
            mt-0
            text-left sm:text-center
          "
        >
          <span className="text-yellow-400 text-[14px] font-semibold">
            ₹{product.price}
          </span>

          {hasDiscount && (
            <>
              <span className="text-gray-400 text-[12px] line-through">
                ₹{originalPrice}
              </span>
              <span className="text-green-400 text-[12px] font-medium">
                Save ₹{Math.round(originalPrice - product.price)}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
