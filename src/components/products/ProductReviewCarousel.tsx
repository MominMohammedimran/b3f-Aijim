import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_name?: string;
  review_images?: string[]; // product-specific review images
}

interface ProductReviewCarouselProps {
  reviews: Review[];
}

const CARD_MAX_HEIGHT = 160; // Maintain consistent height

const ProductReviewCarousel: React.FC<ProductReviewCarouselProps> = ({
  reviews,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [fsImages, setFsImages] = useState<string[]>([]);
  const [fsIndex, setFsIndex] = useState(0);

  const reviewContentRef = useRef<HTMLDivElement>(null);

  // Auto-advance mechanism
  useEffect(() => {
    if (reviews.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((p) => (p + 1) % reviews.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [reviews.length]);

  const goNext = () => setCurrentIndex((p) => (p + 1) % reviews.length);

  const current = reviews[currentIndex];

  const openFullscreen = (images: string[], startIndex = 0) => {
    if (!images || images.length === 0) return;
    setFsImages(images);
    setFsIndex(startIndex);
    setFullscreenOpen(true);
  };

  const fsNext = () => setFsIndex((i) => (i + 1) % fsImages.length);
  const fsPrev = () =>
    setFsIndex((i) => (i === 0 ? fsImages.length - 1 : i - 1));

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center text-md text-gray-100 gap-1 flex items-center justify-center font-medium">
        <span className="text-yellow-400 font-semibold ">Trusted</span> by
        <span className="text-yellow-400 font-bold mx-1">16+</span> Aijim
        customers till Now !
      </div>
    );
  }

  // Helper component for star rating
  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-4 h-4 ${
            s <= rating ? "text-yellow-500 fill-yellow-500" : "text-zinc-300"
          }`}
        />
      ))}
    </div>
  );

  return (
    <div className="w-full   relative">
      <div className="text-center text-xl underline  font-semibold text-yellow-400 mb-4">
        REVIEWS
      </div>

      {/* Review Card Container */}
      <div
        className="relative w-full overflow-hidden bg-black border border-zinc-200 rounded-none shadow-lg"
        style={{ minHeight: `${CARD_MAX_HEIGHT}px` }}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={current.id}
            ref={reviewContentRef}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            // Full width padding, no flex column for the avatar
            className="p-4 relative"
          >
            {/* Top Row: Name, Date, and Rating */}
            <div className="flex justify-between items-center mb-1">
              {/* Left Side: Name and Date */}
              <div className="flex flex-col">
                <p className="font-semibold text-sm text-yellow-400 truncate">
                  {current.user_name || "Anonymous"}
                </p>
                {/* Date included as requested */}
                <p className="text-[10px] text-zinc-200">
                  {new Date(current.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* Right Side: Rating */}
              <div className="flex-shrink-0">
                <StarRating rating={current.rating} />
              </div>
            </div>

            {/* Comment */}
            <div className="text-sm text-zinc-300 leading-snug overflow-hidden mb-2 mt-2 h-auto">
              <p className="h-auto">
                " {current.comment || "No comment provided"} "
              </p>
            </div>

            {/* Product Review Images */}
            {current.review_images && current.review_images.length > 0 && (
              <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                {current.review_images.slice(0, 3).map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`review-${idx}`}
                    className="h-12 w-12 object-cover rounded-md border border-zinc-300 cursor-pointer"
                    onClick={() => openFullscreen(current.review_images!, idx)}
                  />
                ))}
              </div>
            )}

            {/* Carousel Arrow (Right) */}
            {reviews.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={goNext}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-800"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Fullscreen Modal (Retained) */}
      <AnimatePresence>
        {fullscreenOpen && fsImages.length > 0 && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="relative w-full h-full flex items-center justify-center px-4">
              <motion.img
                key={fsImages[fsIndex]}
                src={fsImages[fsIndex]}
                alt="fullscreen"
                className="max-w-[95vw] max-h-[90vh] rounded-lg object-contain shadow-2xl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
              />

              {/* Close Button */}
              <button
                onClick={() => setFullscreenOpen(false)}
                className="absolute top-6 right-6 bg-zinc-800 hover:bg-red-600  text-white rounded-full p-2 shadow-lg"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Carousel Arrows */}
              {fsImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={fsPrev}
                    className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/20"
                  >
                    <ChevronLeft className="w-4 h-4 text-zinc-300 " />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={fsNext}
                    className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/20"
                  >
                    <ChevronRight className="w-4 h-4 text-zinc-300" />
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductReviewCarousel;
