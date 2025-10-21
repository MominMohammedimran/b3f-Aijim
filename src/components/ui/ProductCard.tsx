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

  const sizes = Array.isArray(product.variants) ? product.variants : [];
  const totalStock = sizes.reduce(
    (sum, s) => sum + (typeof s.stock === "number" ? s.stock : 0),
    0
  );
  const inStock = totalStock > 0;
  const discount =
    product.originalPrice && product.originalPrice > product.price;
  const pct = discount
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  const images =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images
      : [product.image];

  // ✅ Fetch review stats
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from("reviews")
          .select("rating")
          .eq("product_id", product.id);

        if (error) throw error;

        if (data && data.length > 0) {
          const total = data.reduce((sum, r) => sum + (r.rating || 0), 0);
          const avg = total / data.length;
          setReviewStats({
            averageRating: avg,
            reviewCount: data.length,
          });
        } else {
          setReviewStats({ averageRating: 0, reviewCount: 0 });
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }
    };

    if (product.id) fetchReviews();
  }, [product.id]);

  // ✅ Auto carousel logic for back side
  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % images.length);
    }, 2000); // Change every 2 seconds
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div
      onClick={() => onClick?.(product)}
      className="flip-card-container cursor-pointer group"
    >
      <div className="flip-card">
        {/* ---------- FRONT ---------- */}
        <div className="flip-card-front rounded-none">
          <div className="relative aspect-[4/5] overflow-hidden bg-gray-900 border border-gray-700">
            <img
              src={product.image}
              alt={product.name}
              className={`w-full h-full object-cover transition-all duration-500 ${
                inStock ? "" : "grayscale opacity-70"
              }`}
            />

            {/* ✅ Discount Badge */}
            {pct > 0 && (
              <span className="absolute top-1 right-0 bg-red-600 text-white text-[8px] px-1 py-0 font-bold animate-bounce z-10">
                {pct}% OFF
              </span>
            )}

            {/* ✅ Stock/Sold */}
            <span
              className={`rounded-none ${
                inStock
                  ? "absolute top-5 right-0 hidden text-[8px] uppercase px-1 py-0 hidden bg-white text-black font-bold"
                  : "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg uppercase px-3 py-0 bg-red-600 font-semibold text-white"
              }`}
            >
              {inStock ? "Stock" : "Sold"}
            </span>

            {/* ✅ Rating badge bottom-left */}
            {reviewStats.reviewCount > 0 && (
              <div className="absolute bottom-0 left-0 bg-black/60 backdrop-blur-sm px-2 py-[2px] flex items-center gap-1 text-yellow-400 text-[10px] font-semibold rounded-tr-md">
                <Star className="w-3 h-3 fill-yellow-400" />
                {reviewStats.averageRating.toFixed(1)}
                <span className="text-gray-300 text-[9px] ml-1">
                  ({reviewStats.reviewCount})
                </span>
              </div>
            )}
          </div>

          {/* ---------- Product Info ---------- */}
         {/* ---------- Product Info ---------- */}
                  <div className="p-0 pl-1 pt-2 bg-[#111] border-x border-b border-gray-800">
                    <h3 className="text-white text-left font-semibold text-xs lg:text-sm leading-tight line-clamp-2 ml-1">
                      {product.name}
                    </h3>
                    <div className="flex items-center lg:justify-center lg:gap-5 mt-1 ml-2 gap-2 text-xs lg:text-sm ">
                      {discount && (
                        <span className="text-gray-400  line-through font-semibold">
                          ₹{product.originalPrice}
                        </span>
                      )}
                      <span className="text-white text-sm lg:text-md font-semibold">
                        ₹{product.price}
                      </span>
                    </div>
                  </div>
        </div>

        {/* ---------- BACK (Carousel) ---------- */}
        <div className="flip-card-back rounded-none relative aspect-[4/5] overflow-hidden bg-gray-900 border border-gray-200">
          <div className="relative w-full h-full">
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`${product.name}-${i}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                  i === currentImage ? "opacity-100" : "opacity-0"
                } ${inStock ? "" : "grayscale opacity-70"}`}
              />
            ))}

            {/* Discount Badge */}
            {pct > 0 && (
              <span className="absolute top-1 right-0 bg-red-600 text-white text-[8px] px-1 py-0 font-bold animate-bounce z-10">
                {pct}% OFF
              </span>
            )}

            {/* Stock Status */}
            <span
              className={`rounded-none ${
                inStock
                  ? "absolute top-5 hidden right-0 text-[8px] hidden uppercase px-1 py-0 bg-white text-black font-bold"
                  : "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg uppercase px-3 py-0 bg-red-600 font-semibold text-white"
              }`}
            >
              {inStock ? "Stock" : "Sold"}
            </span>

            {/* Rating badge */}
            {reviewStats.reviewCount > 0 && (
              <div className="absolute bottom-0 left-0 bg-black/60 backdrop-blur-sm px-2 py-[2px] flex items-center gap-1 text-yellow-400 text-[10px] font-semibold rounded-tr-md">
                <Star className="w-3 h-3 fill-yellow-400" />
                {reviewStats.averageRating.toFixed(1)}
                <span className="text-gray-300 text-[9px] ml-1">
                  ({reviewStats.reviewCount})
                </span>
              </div>
            )}

            {/* View Product Button 
            <button className="absolute bottom-4 w-full bg-blue-600 hover:bg-blue-900 text-white text-xs font-bold py-2 px-1 rounded transition-colors">
              View Product
            </button>*/}
          </div>

          {/*<div className="flex items-center justify-evenly mt-1 gap-2 text-sm">
            {discount && (
              <span className="text-gray-400 line-through font-semibold">
                ₹{product.originalPrice}
              </span>
            )}
            <span className="text-white text-[17px] font-semibold">
              ₹{product.price}
            </span>
          </div>*/}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
