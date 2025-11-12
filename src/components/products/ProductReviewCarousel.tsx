import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_name?: string;
  image_paths?: string[];
}

interface ProductReviewCarouselProps {
  reviews: Review[];
}

const ProductReviewCarousel: React.FC<ProductReviewCarouselProps> = ({ reviews }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTwoPerView, setIsTwoPerView] = useState(window.innerWidth >= 1024);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [reviewImages, setReviewImages] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const fetchImages = async () => {
      const urls: Record<string, string[]> = {};
      for (const review of reviews) {
        if (review.image_paths?.length) {
          const paths = review.image_paths.slice(0, 3);
          const imageUrls = await Promise.all(
            paths.map(async (path) => {
              const { data } = supabase.storage
                .from("paymentproofs")
                .getPublicUrl(`review-images/${path}`);
              return data?.publicUrl || "";
            })
          );
          urls[review.id] = imageUrls.filter(Boolean);
        }
      }
      setReviewImages(urls);
    };

    fetchImages();
  }, [reviews]);

  useEffect(() => {
    const handleResize = () => setIsTwoPerView(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const goToPrevious = () =>
    setCurrentIndex((prev) =>
      prev === 0 ? Math.max(0, reviews.length - (isTwoPerView ? 2 : 1)) : prev - (isTwoPerView ? 2 : 1)
    );

  const goToNext = () =>
    setCurrentIndex((prev) => (prev + (isTwoPerView ? 2 : 1)) % reviews.length);

  if (!reviews.length)
    return (
      <div className="text-center py-10 text-gray-400 text-sm italic">
        No reviews yet. Be the first to leave one ✍️
      </div>
    );

  const visibleReviews = isTwoPerView
    ? reviews.slice(currentIndex, currentIndex + 2)
    : [reviews[currentIndex]];

  return (
    <div className="relative w-full max-w-5xl mx-auto mt-4">
      <div className="flex justify-center gap-6 overflow-hidden">
        {visibleReviews.map((review, idx) => (
          <div
            key={review.id}
            className="flex-1 min-w-[220px] max-w-md bg-gradient-to-br from-zinc-900/60 via-zinc-800/60 to-zinc-900/40 
                       border border-zinc-800 rounded-md p-6 shadow-md hover:shadow-yellow-500/10 
                       backdrop-blur-sm transition-all duration-300"
          >
            {/* Rating */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= review.rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-zinc-600"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Comment */}
            <p className="text-gray-200 text-sm leading-relaxed mb-6">
              “{review.comment || "No comment provided"}”
            </p>

            {/* Images */}
            {reviewImages[review.id]?.length ? (
              <div className="flex gap-3 mb-6">
                {reviewImages[review.id].map((imgUrl, i) => (
                  <img
                    key={i}
                    src={imgUrl}
                    alt={`Review ${i}`}
                    className="w-20 h-20 object-cover rounded-md cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => setSelectedImage(imgUrl)}
                  />
                ))}
              </div>
            ) : null}

            {/* Footer */}
            <div>
              <p className="font-medium text-white text-sm">
                {review.user_name || "Anonymous User"}
              </p>
              <p className="text-xs text-gray-400">
                {new Date(review.created_at).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation */}
      {reviews.length > (isTwoPerView ? 2 : 1) && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 text-yellow-400 hover:text-yellow-600"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-yellow-400 hover:text-yellow-600"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </>
      )}

      {/* Fullscreen Image */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Full Preview"
            className="max-w-[90%] max-h-[85%] rounded-md shadow-lg object-contain"
          />
          <button
            className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 rounded-full p-2"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductReviewCarousel;
