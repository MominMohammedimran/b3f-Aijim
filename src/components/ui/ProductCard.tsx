import React, { useEffect, useState } from 'react';
import { Product } from '@/lib/types';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  product: Product;
  onClick?: (p: Product) => void;
  className?: string;
}

export default function ProductCard({ product, onClick, className = '' }: Props) {
  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    reviewCount: 0,
  });

  const sizes = Array.isArray(product.variants) ? product.variants : [];

  const totalStock = sizes.reduce(
    (sum, s) => sum + (typeof s.stock === 'number' ? s.stock : 0),
    0
  );
  const inStock = totalStock > 0;
  const discount = product.originalPrice && product.originalPrice > product.price;
  const pct = discount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const backImage =
    product.images && product.images.length > 1 ? product.images[1] : product.image;

  // ✅ Fetch review stats for this product
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from('reviews')
          .select('rating')
          .eq('product_id', product.id);

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
        console.error('Error fetching reviews:', err);
      }
    };

    if (product.id) fetchReviews();
  }, [product.id]);

  return (
    <div
      onClick={() => onClick?.(product)}
      className={`flip-card-container cursor-pointer group ${className}`}
    >
      <div className="flip-card">
        {/* ---------- FRONT ---------- */}
        <div className="flip-card-front rounded-none relative">
          <div className="relative aspect-[4/5] overflow-hidden bg-[#111] border border-gray-800">
            <img
              src={product.image}
              alt={product.name}
              className={`w-full h-full object-cover transition-all duration-500 ${
                inStock ? '' : 'grayscale opacity-50'
              }`}
            />

            {/* ✅ Discount Badge */}
            {pct > 0 && (
              <span className="absolute top-1 right-0 bg-red-600 text-white text-[10px] px-1 py-0 font-semibold animate-bounce z-10">
                {pct}% OFF
              </span>
            )}

            {/* ✅ Stock or Sold Badge */}
            <span
              className={`rounded-none ${
                inStock
                  ? 'absolute top-6 right-0 text-[11px] uppercase px-1.5 py-0 bg-white hidden text-black font-semibold'
                  : 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg uppercase px-3 py-0 bg-red-600 font-semibold text-white'
              }`}
            >
              {inStock ? 'Stock' : 'Sold'}
            </span>

            {/* ✅ Fixed Rating Badge (bottom-left corner) */}
            {reviewStats.reviewCount > 0 && (
              <div className="absolute bottom-0 left-0 bg-black/60 backdrop-blur-sm px-2 py-[2px] flex items-center gap-1 text-yellow-400 text-xs font-semibold rounded-tr-md">
                <Star className="w-3 h-3 fill-yellow-400" />
                {reviewStats.averageRating.toFixed(1)}
                <span className="text-gray-300 text-[10px] ml-1">
                  ({reviewStats.reviewCount})
                </span>
              </div>
            )}
          </div>

          {/* ---------- Info Section ---------- */}
          <div className="p-0 pl-1 pt-2 bg-[#111] border-x border-b border-gray-800">
            <h3 className="text-white text-left font-semibold text-xs line-clamp-2 leading-tight ml-1">
              {product.name}
            </h3>
            <div className="flex items-center  mt-1 ml-2 gap-2 text-xs ">
              {discount && (
                <span className="text-gray-400 line-through font-semibold">
                  ₹{product.originalPrice}
                </span>
              )}
              <span className="text-white  text-sm font-semibold">₹{product.price}</span>
            </div>
          </div>
        </div>

        {/* ---------- BACK ---------- */}
        <div className="flip-card-back rounded-none relative">
          <div className="relative aspect-[4/5] overflow-hidden bg-[#111] border border-gray-200">
            <img
              src={backImage}
              alt={`${product.name} - Back view`}
              className={`w-full h-full object-cover ${
                inStock ? '' : 'grayscale opacity-50'
              }`}
            />

            {pct > 0 && (
              <span className="absolute top-1 right-0 bg-red-600 text-white text-[10px] px-1 py-0 font-semibold animate-bounce z-10">
                {pct}% OFF
              </span>
            )}
            <span
              className={`rounded-none ${
                inStock
                  ? 'absolute top-6 right-0 text-[11px] uppercase px-1.5 py-0 bg-white text-black font-semibold'
                  : 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg uppercase px-3 py-0 bg-red-600 font-semibold text-white'
              }`}
            >
              {inStock ? 'Stock' : 'Sold'}
            </span>

            {/* ✅ Rating badge also on back */}
            {reviewStats.reviewCount > 0 && (
              <div className="absolute bottom-0 left-0 bg-black/60 backdrop-blur-sm px-2 py-[2px] flex items-center gap-1 text-yellow-400 text-xs font-semibold rounded-tr-md">
                <Star className="w-3 h-3 fill-yellow-400" />
                {reviewStats.averageRating.toFixed(1)}
                <span className="text-gray-300 text-[10px] ml-1">
                  ({reviewStats.reviewCount})
                </span>
              </div>
            )}

            <button className="absolute bottom-4 w-full bg-blue-600 hover:bg-blue-900 text-white text-xs font-bold py-2 px-1 rounded transition-colors">
              View Product
            </button>
          </div>

          <div className="p-2 pl-3 pr-3 bg-[#111] border-x border-b border-gray-200">
            <div className="flex justify-between items-center gap-2">
              <span className="text-white font-bold">₹{product.price}</span>
              {sizes.length > 0 && (
                <span className="text-gray-300 text-xs">
                  {sizes.map((s) => s.size).join(', ')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

