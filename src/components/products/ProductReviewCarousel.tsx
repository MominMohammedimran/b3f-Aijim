import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, UserRound, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_name?: string;
  review_images?: string[];
}

interface ProductReviewCarouselProps {
  reviews: Review[];
}

const ProductReviewCarousel: React.FC<ProductReviewCarouselProps> = ({ reviews }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreenIndex, setFullscreenIndex] = useState<number | null>(null);
  const [fullscreenImages, setFullscreenImages] = useState<string[]>([]);

  useEffect(() => {
    if (reviews.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [reviews.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-400">
        <p>No reviews yet. Be the first to leave one!</p>
      </div>
    );
  }

  const currentReview = reviews[currentIndex];

  const openFullscreen = (images: string[], index: number) => {
    setFullscreenImages(images);
    setFullscreenIndex(index);
  };

  const nextFullscreen = () => {
    if (fullscreenIndex === null || fullscreenImages.length === 0) return;
    setFullscreenIndex((prev) => (prev! + 1) % fullscreenImages.length);
  };

  const prevFullscreen = () => {
    if (fullscreenIndex === null || fullscreenImages.length === 0) return;
    setFullscreenIndex((prev) =>
      prev! === 0 ? fullscreenImages.length - 1 : prev! - 1
    );
  };

  return (
    <div className="relative max-w-3xl mx-auto px-4 sm:px-0">
      {/* Review Card */}
      <motion.div
        key={currentReview.id}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40 }}
        transition={{ duration: 0.4 }}
        className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-lg text-zinc-100"
      >
        {/* Rating */}
        <div className="flex items-center mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <UserRound
              key={star}
              className={`w-5 h-5 transition ${
                star <= currentReview.rating
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-zinc-600'
              }`}
            />
          ))}
          <span className="ml-3 text-sm text-zinc-400">
            {currentReview.rating}/5
          </span>
        </div>

        {/* Comment */}
        <p className="text-base text-zinc-200 italic leading-relaxed">
          “{currentReview.comment || 'No comment provided'}”
        </p>

        {/* Review Images */}
        {currentReview.review_images && currentReview.review_images.length > 0 && (
          <div className="mt-5 flex gap-3 flex-wrap">
            {currentReview.review_images.map((imageUrl, idx) => (
              <motion.img
                key={idx}
                src={imageUrl}
                alt={`Review image ${idx + 1}`}
                className="h-24 w-24 sm:h-28 sm:w-28 object-cover rounded-xl border border-zinc-700 cursor-pointer hover:scale-105 transition-transform"
                whileHover={{ scale: 1.05 }}
                onClick={() => openFullscreen(currentReview.review_images!, idx)}
              />
            ))}
          </div>
        )}

        {/* Reviewer Info */}
        <div className="mt-6 flex items-center justify-between text-sm text-zinc-500">
          <div>
            <p className="font-semibold text-zinc-100">{currentReview.user_name || 'Anonymous'}</p>
            <p>{new Date(currentReview.created_at).toLocaleDateString()}</p>
          </div>
          <div>{currentIndex + 1} / {reviews.length}</div>
        </div>
      </motion.div>

      {/* Desktop Navigation Arrows */}
      {reviews.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-transparent hover:bg-zinc-800 hidden sm:flex"
          >
            <ChevronLeft className="w-7 h-7 text-zinc-400 hover:text-yellow-400" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-transparent hover:bg-zinc-800 hidden sm:flex"
          >
            <ChevronRight className="w-7 h-7 text-zinc-400 hover:text-yellow-400" />
          </Button>
        </>
      )}

      {/* Dots */}
      {reviews.length > 1 && (
        <div className="flex justify-center mt-5 gap-2">
          {reviews.map((_, index) => (
            <div
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2.5 w-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                index === currentIndex
                  ? 'bg-yellow-400 scale-125 shadow-lg'
                  : 'bg-zinc-700 hover:bg-zinc-500'
              }`}
            />
          ))}
        </div>
      )}

      {/* Fullscreen Image Carousel */}
      <AnimatePresence>
        {fullscreenIndex !== null && fullscreenImages.length > 0 && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="relative flex items-center justify-center w-full h-full">
              <motion.img
                key={fullscreenImages[fullscreenIndex]}
                src={fullscreenImages[fullscreenIndex]}
                alt="Fullscreen Review"
                className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              />

              {/* Close Button */}
              <button
                onClick={() => setFullscreenIndex(null)}
                className="absolute top-6 right-6 bg-zinc-800 hover:bg-red-600 text-white rounded-full p-2 shadow-lg"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Prev / Next Arrows */}
              {fullscreenImages.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={prevFullscreen}
                    className="absolute left-6 top-1/2 -translate-y-1/2 bg-transparent hover:bg-zinc-800"
                  >
                    <ChevronLeft className="w-8 h-8 text-zinc-300 hover:text-yellow-400" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={nextFullscreen}
                    className="absolute right-6 top-1/2 -translate-y-1/2 bg-transparent hover:bg-zinc-800"
                  >
                    <ChevronRight className="w-8 h-8 text-zinc-300 hover:text-yellow-400" />
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
