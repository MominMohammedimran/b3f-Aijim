import React, { useEffect, useState } from "react";
import { Product } from "@/lib/types";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  product: Product;
  onClick?: (p: Product) => void;
}

const ProductCard: React.FC<Props> = ({ product, onClick }) => {
  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    reviewCount: 0,
  });
  const [currentImage, setCurrentImage] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const images =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [product.image];

  const discount =
    product.originalPrice && product.originalPrice > product.price;
  const pct = discount
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from("reviews")
        .select("rating")
        .eq("product_id", product.id);
      if (data?.length) {
        const avg = data.reduce((s, r) => s + (r.rating || 0), 0) / data.length;
        setReviewStats({ averageRating: avg, reviewCount: data.length });
      }
    };
    if (product.id) fetchReviews();
  }, [product.id]);

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
      className={`cursor-pointer bg-[#0b0b0b] rounded-none overflow-hidden group transition-all duration-500 hover:shadow-[0_8px_20px_rgba(255,255,255,0.08)] ${
        outOfStock ? "opacity-70 pointer-events-none" : "hover:-translate-y-1"
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

        {/* 🔖 Discount Tag */}
        {pct > 0 && !outOfStock && (
          <div className="absolute top-0 right-0 bg-red-600 text-white text-[10px] px-2 py-[1px] rounded-sm font-semibold z-10">
            {pct}% OFF
          </div>
        )}

        {/* ⭐ Rating */}
        {reviewStats.reviewCount > 0 && (
          <div className="absolute bottom-1 left-0 bg-black/60 backdrop-blur-sm px-2 py-[1px] rounded-sm flex items-center gap-1 text-yellow-400 text-[10px] font-semibold">
            <Star className="w-3 h-3 fill-yellow-400" />
            {reviewStats.averageRating.toFixed(1)}
            <span className="text-gray-300 text-[9px] ml-1">
              ({reviewStats.reviewCount})
            </span>
          </div>
        )}

        {/* ❌ SOLD OUT Overlay */}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <span className="text-red-500 bg-white px-2text-lg font-bold tracking-widest uppercase opacity-90">
              SOLD OUT
            </span>
          </div>
        )}
      </div>

      {/* 🏷️ Product Info */}
      <div className="p-1 text-center space-y-1">
        <h3 className="text-[13px] w-full p-1 text-white font-medium tracking-wide leading-tight line-clamp-2">
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
