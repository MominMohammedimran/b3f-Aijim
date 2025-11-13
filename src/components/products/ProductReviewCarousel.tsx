import React, { useState, useEffect, useRef } from 'react';
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
  review_images?: string[]; // public URLs
}

interface ProductReviewCarouselProps {
  reviews: Review[];
}

const MIN_CARD_HEIGHT = 120; // base height
const MAX_CARD_HEIGHT = 200; // max height if comment is long

const ProductReviewCarousel: React.FC<ProductReviewCarouselProps> = ({ reviews }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [fsImages, setFsImages] = useState<string[]>([]);
  const [fsIndex, setFsIndex] = useState(0);
  const [cardHeight, setCardHeight] = useState(MIN_CARD_HEIGHT);

  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reviews.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((p) => (p + 1) % reviews.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [reviews.length]);

  useEffect(() => {
    if (currentIndex >= reviews.length) setCurrentIndex(0);
  }, [reviews.length]);

  useEffect(() => {
    // adjust card height based on content
    if (cardRef.current) {
      const height = Math.min(
        Math.max(cardRef.current.scrollHeight, MIN_CARD_HEIGHT),
        MAX_CARD_HEIGHT
      );
      setCardHeight(height);
    }
  }, [currentIndex, reviews]);

  const goPrev = () => setCurrentIndex((p) => (p === 0 ? reviews.length - 1 : p - 1));
  const goNext = () => setCurrentIndex((p) => (p + 1) % reviews.length);

  const current = reviews[currentIndex];

  const openFullscreen = (images: string[], startIndex = 0) => {
    if (!images || images.length === 0) return;
    setFsImages(images);
    setFsIndex(startIndex);
    setFullscreenOpen(true);
  };

  const fsNext = () => setFsIndex((i) => (i + 1) % fsImages.length);
  const fsPrev = () => setFsIndex((i) => (i === 0 ? fsImages.length - 1 : i - 1));

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-400">
        <p>No reviews yet. Be the first to leave one!</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-0">
      <motion.div
        key={current.id}
        ref={cardRef}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35 }}
        className="bg-zinc-900/80 border border-zinc-800 rounded-xl shadow-md text-zinc-100 flex p-4 sm:p-6 overflow-hidden"
        style={{ height: `${cardHeight}px` }}
      >
        {/* Left - Review Text */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <UserRound
                  key={s}
                  className={`w-4 h-4 ${s <= current.rating ? 'text-yellow-400' : 'text-zinc-600'}`}
                />
              ))}
              <span className="text-xs text-zinc-400 ml-1">{current.rating}/5</span>
            </div>
            <p className="text-sm text-zinc-200 italic leading-snug">{`“${current.comment || 'No comment provided'}”`}</p>
          </div>

          <div className="flex justify-between items-center mt-2">
            <div>
              <p className="font-semibold text-white text-xs">{current.user_name || 'Anonymous'}</p>
              <p className="text-[10px] text-zinc-500">{new Date(current.created_at).toLocaleDateString()}</p>
            </div>

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[10px] text-zinc-500">{currentIndex + 1}/{reviews.length}</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={goPrev}>
                  <ChevronLeft className="w-4 h-4 text-zinc-300" />
                </Button>
                <Button variant="ghost" size="icon" onClick={goNext}>
                  <ChevronRight className="w-4 h-4 text-zinc-300" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right - Thumbnails */}
        <div className="ml-4 flex-shrink-0 flex items-center gap-2">
          {current.review_images && current.review_images.length > 0 ? (
            <div className="flex gap-2 overflow-x-auto">
              {current.review_images.map((img, idx) => (
                <img
                  key={idx}
                  src={img}
                  alt={`review-${idx}`}
                  className="h-20 w-20 object-cover rounded-lg border border-zinc-700 cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => openFullscreen(current.review_images!, idx)}
                />
              ))}
            </div>
          ) : (
            <div className="h-20 w-20 flex items-center justify-center text-xs text-zinc-500 border border-zinc-800 rounded-lg">
              No images
            </div>
          )}
        </div>
      </motion.div>

      {/* Dots and Mobile Controls */}
      <div className="mt-2 flex items-center justify-between">
        <div className="flex gap-1 sm:hidden">
          <Button variant="ghost" size="icon" onClick={goPrev}>
            <ChevronLeft className="w-4 h-4 text-zinc-300" />
          </Button>
          <Button variant="ghost" size="icon" onClick={goNext}>
            <ChevronRight className="w-4 h-4 text-zinc-300" />
          </Button>
        </div>

        <div className="flex justify-center w-full">
          {reviews.length > 1 && (
            <div className="flex gap-1">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2 w-2 rounded-full ${i === currentIndex ? 'bg-yellow-400 scale-125' : 'bg-zinc-700 hover:bg-zinc-600'}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Modal */}
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
                className="absolute top-6 right-6 bg-zinc-800 hover:bg-red-600 text-white rounded-full p-2 shadow-lg"
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
                    className="absolute left-6 top-1/2 -translate-y-1/2"
                  >
                    <ChevronLeft className="w-8 h-8 text-zinc-300" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={fsNext}
                    className="absolute right-6 top-1/2 -translate-y-1/2"
                  >
                    <ChevronRight className="w-8 h-8 text-zinc-300" />
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
