import React, { useEffect, useState } from "react";
import { Product } from "@/lib/types";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  product: Product;
  onClick?: (p: Product) => void;
}

const ProductCard: React.FC<Props> = ({ product, onClick }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const images =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [product.image];

  const discount =
    product.originalPrice && product.originalPrice > product.price;

  useEffect(() => {
    if (!isHovered || images.length <= 1) return;
    const interval = setInterval(
      () => setCurrentImage((p) => (p + 1) % images.length),
      1500
    );
    return () => clearInterval(interval);
  }, [isHovered, images.length]);

  const outOfStock = product.stock <= 0;

  return (
    <div
      onClick={() => onClick?.(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCurrentImage(0);
      }}
      className={`cursor-pointer bg-[#0b0b0b] rounded-none overflow-hidden group transition-all duration-500 hover:shadow-[0_8px_20px_rgba(255,255,255,0.08)] hover:-translate-y-1 ${
        outOfStock ? "opacity-70" : ""
      }`}
    >
      {/* 🖼️ Product Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-neutral-900">
        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            alt={product.name}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              i === currentImage ? "opacity-100" : "opacity-0"
            } group-hover:scale-[1.03]`}
          />
        ))}

        {/* 🚫 SOLD OUT Label */}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center z-20">
            <div className="bg-red-600 text-white text-xs sm:text-sm font-bold uppercase tracking-wide px-4 py-2 rounded-md shadow-lg">
              SOLD OUT
            </div>
          </div>
        )}
      </div>

      {/* 🏷️ Product Info */}
      <div className="p-2 space-y-1">
        {/* 🧾 Product Name */}
        <h3
          className="
            text-[13px] sm:text-[14px]  
            text-left sm:text-center  
            text-white font-medium tracking-wide leading-tight   
            min-h-[36px]
          "
        >
          {product.name}
        </h3>

        {/* 💰 Price */}
        <div className="flex justify-center items-center gap-2">
          {discount && (
            <span className="text-gray-500 text-[12px] line-through">
              ₹{product.originalPrice}
            </span>
          )}
          <span className="text-yellow-400 text-[14px] font-semibold">
            ₹{product.price}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
