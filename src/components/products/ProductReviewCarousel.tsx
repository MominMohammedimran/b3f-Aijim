import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_name?: string;
}

interface ProductReviewCarouselProps {
  reviews: Review[];
}

const ProductReviewCarousel: React.FC<ProductReviewCarouselProps> = ({ reviews }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTwoPerView, setIsTwoPerView] = useState(window.innerWidth >= 1024);

  // Handle responsive switch
  useEffect(() => {
    const handleResize = () => setIsTwoPerView(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto scroll every 6 seconds
  useEffect(() => {
    if (reviews.length <= (isTwoPerView ? 2 : 1)) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + (isTwoPerView ? 2 : 1)) % reviews.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [reviews.length, isTwoPerView]);

  const goToPrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? Math.max(0, reviews.length - (isTwoPerView ? 2 : 1)) : prev - (isTwoPerView ? 2 : 1)
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + (isTwoPerView ? 2 : 1)) % reviews.length);
  };

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 text-sm italic">
        No reviews yet. Be the first to leave one ✍️
      </div>
    );
  }

  const visibleReviews = isTwoPerView
    ? reviews.slice(currentIndex, currentIndex + 2)
    : [reviews[currentIndex]];

  return (
    <div className="relative w-full max-w-5xl mx-auto mt-4">
      {/* Review Cards */}
      <div className="flex justify-center gap-6 overflow-hidden">
        {visibleReviews.map((review, idx) => {
          const globalIndex = currentIndex + idx + 1;
          return (
            <div
              key={review.id}
              className="flex-1 min-w-[250px] max-w-md bg-gradient-to-br from-zinc-900/60 via-zinc-800/60 to-zinc-900/40 
                         border border-zinc-800 rounded-none p-6 shadow-md hover:shadow-yellow-500/10 
                         backdrop-blur-sm transition-all duration-300"
            >
              {/* Header - Rating + Review Number */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.rating ? "text-yellow-400 fill-yellow-400" : "text-zinc-600"
                      }`}
                    />
                  ))}
                </div>

                <span className="text-[11px] px-2 py-0.5 rounded-none bg-yellow-400 text-black font-semibold uppercase tracking-wide">
                  Review {globalIndex}
                </span>
              </div>

              {/* Comment */}
              <p className="text-gray-200 text-sm leading-relaxed  mb-4">
                “{review.comment || "No comment provided"}”
              </p>

              {/* Footer - User Info */}
              <div className="flex justify-between items-center mt-2">
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
                <span className="text-[10px] text-gray-500 font-medium uppercase">
                  Verified Buyer
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Buttons */}
      {reviews.length > (isTwoPerView ? 2 : 1) && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-zinc-800/40 hover:bg-yellow-500/20 text-yellow-400"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-zinc-800/40 hover:bg-yellow-500/20 text-yellow-400"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {reviews.length > (isTwoPerView ? 2 : 1) && (
        <div className="flex justify-center mt-5 gap-2">
          {Array.from({
            length: Math.ceil(reviews.length / (isTwoPerView ? 2 : 1)),
          }).map((_, index) => (
            <div
              key={index}
              onClick={() => setCurrentIndex(index * (isTwoPerView ? 2 : 1))}
              className={`h-2 w-2 rounded-full cursor-pointer transition-all ${
                index === Math.floor(currentIndex / (isTwoPerView ? 2 : 1))
                  ? "bg-yellow-400 scale-110"
                  : "bg-zinc-700"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReviewCarousel;