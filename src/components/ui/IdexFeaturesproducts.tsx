import React, { useEffect, useState } from "react";
import { Product } from "@/lib/types";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  product: Product;
  onClick?: (p: Product) => void;
}

const IndexFeaturesproducts: React.FC<Props> = ({ product, onClick }) => {
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

  const sizes = Array.isArray(product.variants)
    ? product.variants.map((v) => v.size).filter(Boolean)
    : [];

  // ✅ Fetch review stats
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await supabase
          .from("reviews")
          .select("rating")
          .eq("product_id", product.id);

        if (data?.length) {
          const avg =
            data.reduce((sum, r) => sum + (r.rating || 0), 0) / data.length;
          setReviewStats({
            averageRating: avg,
            reviewCount: data.length,
          });
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }
    };

    if (product.id) fetchReviews();
  }, [product.id]);

  // ✅ Auto carousel on hover
  useEffect(() => {
    if (!isHovered || images.length <= 1) return;
    const interval = setInterval(
      () => setCurrentImage((prev) => (prev + 1) % images.length),
      1500
    );
    return () => clearInterval(interval);
  }, [isHovered, images.length]);

  return (
    <div
      onClick={() => onClick?.(product)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCurrentImage(0);
      }}
      className="cursor-pointer bg-[#0b0b0b] rounded-none overflow-hidden group transition-all duration-500 hover:shadow-[0_8px_20px_rgba(255,255,255,0.08)] hover:-translate-y-1"


>
      {/* 🖼️ Product Image with hover carousel */}
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
        {pct > 0 && (
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
      </div>

      {/* 🏷️ Product Info */}
      <div className="p-1 text-center space-y-1">
        {/* Product Name */}
        <h3 className="text-[13px] w-full p-1 text-white font-medium tracking-wide leading-tight line-clamp-2">
          {product.name}
        </h3>

        {/* Price Section */}
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

        {/* Sizes 
        {sizes.length > 0 && (
          <div className="flex justify-center flex-wrap gap-1 mt-1">
            {sizes.slice(0, 5).map((size, i) => (
              <span
                key={i}
                className="text-[10px] text-gray-400 border border-gray-700 px-1 py-[1px] rounded-sm"
              >
                {size}
              </span>
            ))}
            {sizes.length > 5 && (
              <span className="text-[10px] text-gray-500">+ more</span>
            )}
          </div>
        )}*/}
      </div>
    </div>
  );
};

export default IndexFeaturesproducts;
