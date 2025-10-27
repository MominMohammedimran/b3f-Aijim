import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

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

const ProductReviewCarousel: React.FC<ProductReviewCarouselProps> = ({
  reviews,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLargeScreen, setIsLargeScreen] = useState(
    typeof window !== "undefined" && window.innerWidth >= 1024
  );

  useEffect(() => {
    const handleResize = () =>
      setIsLargeScreen(window.innerWidth >= 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-scroll interval
  useEffect(() => {
    if (reviews.length <= (isLargeScreen ? 2 : 1)) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        (prev + (isLargeScreen ? 2 : 1)) % reviews.length
      );
    }, 6000);
    return () => clearInterval(interval);
  }, [reviews.length, isLargeScreen]);

  const goToPrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0
        ? Math.max(0, reviews.length - (isLargeScreen ? 2 : 1))
        : prev - (isLargeScreen ? 2 : 1)
    );
  };

  const goToNext = () => {
    setCurrentIndex(
      (prev) => (prev + (isLargeScreen ? 2 : 1)) % reviews.length
    );
  };

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-400">
        <p>No reviews yet. Be the first to leave one!</p>
      </div>
    );
  }

  // Slice visible reviews
  const visibleReviews = isLargeScreen
    ? reviews.slice(currentIndex, currentIndex + 2)
    : [reviews[currentIndex]];

  return (
    <div className="relative max-w-5xl mx-auto px-4 py-10">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.5 }}
          className={`grid gap-6 ${
            isLargeScreen ? "lg:grid-cols-2" : "grid-cols-1"
          }`}
        >
          {visibleReviews.map((review) => (
            <div
              key={review.id}
              className="bg-gradient-to-br from-zinc-900/80 to-black/70
                         border border-zinc-700 backdrop-blur-md rounded-xl
                         shadow-xl p-8 transition-all duration-300"
            >
              {/* Rating */}
              <div className="flex items-center mb-4 space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= review.rating
                        ? "text-yellow-400 fill-yellow-400 drop-shadow-sm"
                        : "text-zinc-600"
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-zinc-400 font-medium">
                  {review.rating}/5
                </span>
              </div>

              {/* Comment */}
              <p className="text-zinc-200 italic text-lg leading-relaxed font-light mb-6">
                “{review.comment || "No comment provided"}”
              </p>

              {/* User Info */}
              <div className="flex items-center justify-between text-sm text-zinc-400">
                <div>
                  <p className="font-semibold text-yellow-400">
                    {review.user_name || "Anonymous"}
                  </p>
                  <p className="text-xs">
                    {new Date(review.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Navigation 
      {reviews.length > (isLargeScreen ? 2 : 1) && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-transparent hover:bg-zinc-800/60 text-yellow-400"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-transparent hover:bg-zinc-800/60 text-yellow-400"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </>
      )}*/}

      {/* Dots */}
      {reviews.length > (isLargeScreen ? 2 : 1) && (
        <div className="flex justify-center mt-6 gap-3">
          {Array.from({
            length: Math.ceil(reviews.length / (isLargeScreen ? 2 : 1)),
          }).map((_, index) => (
            <motion.div
              key={index}
              onClick={() => setCurrentIndex(index * (isLargeScreen ? 2 : 1))}
              className={`h-2.5 w-2.5 rounded-full cursor-pointer transition-all ${
                index === Math.floor(currentIndex / (isLargeScreen ? 2 : 1))
                  ? "bg-yellow-400 scale-110 shadow-yellow-400/50 shadow-sm"
                  : "bg-zinc-600 hover:bg-yellow-300"
              }`}
              whileHover={{ scale: 1.2 }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReviewCarousel;
