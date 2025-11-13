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
  review_images?: string[]; // public URLs
}

interface ProductReviewCarouselProps {
  reviews: Review[];
}

const ProductReviewCarousel: React.FC<ProductReviewCarouselProps> = ({ reviews }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [fsImages, setFsImages] = useState<string[]>([]);
  const [fsIndex, setFsIndex] = useState(0);

  useEffect(() => {
    if (reviews.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((p) => (p + 1) % reviews.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [reviews.length]);

  useEffect(() => {
    // keep currentIndex in bounds if reviews length changes
    if (currentIndex >= reviews.length) setCurrentIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviews.length]);

  const goPrev = () => setCurrentIndex((p) => (p === 0 ? reviews.length - 1 : p - 1));
  const goNext = () => setCurrentIndex((p) => (p + 1) % reviews.length);

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-400">
        <p>No reviews yet. Be the first to leave one!</p>
      </div>
    );
  }

  const current = reviews[currentIndex];

  // open fullscreen viewer with ALL images for this review (not just clicked one)
  const openFullscreen = (images: string[], startIndex = 0) => {
    if (!images || images.length === 0) return;
    setFsImages(images);
    setFsIndex(startIndex);
    setFullscreenOpen(true);
  };

  const fsNext = () => setFsIndex((i) => (i + 1) % fsImages.length);
  const fsPrev = () => setFsIndex((i) => (i === 0 ? fsImages.length - 1 : i - 1));

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-0">
      <motion.div
        key={current.id}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35 }}
        className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 shadow-md text-zinc-100"
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:gap-6">
          {/* left - text */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <UserRound
                    key={s}
                    className={`w-5 h-5 ${s <= current.rating ? 'text-yellow-400' : 'text-zinc-600'}`}
                  />
                ))}
              </div>
              <div className="text-sm text-zinc-400 ml-2">{current.rating}/5</div>
            </div>

            <p className="text-base text-zinc-200 italic leading-relaxed">{`“${current.comment || 'No comment provided'}”`}</p>

            <div className="mt-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-white">{current.user_name || 'Anonymous'}</p>
                <p className="text-xs text-zinc-500">{new Date(current.created_at).toLocaleDateString()}</p>
              </div>

              <div className="hidden sm:flex items-center gap-3">
                <div className="text-xs text-zinc-500">{currentIndex + 1} / {reviews.length}</div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" onClick={goPrev} className="bg-transparent hover:bg-zinc-800">
                    <ChevronLeft className="w-6 h-6 text-zinc-300" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={goNext} className="bg-transparent hover:bg-zinc-800">
                    <ChevronRight className="w-6 h-6 text-zinc-300" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* right - thumbnails */}
          <div className="mt-4 sm:mt-0 sm:w-56">
            {current.review_images && current.review_images.length > 0 ? (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-1 sm:gap-3">
                {current.review_images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`review-${idx}`}
                    className="h-20 w-full object-cover rounded-lg border border-zinc-700 cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => openFullscreen(current.review_images!, idx)}
                  />
                ))}
              </div>
            ) : (
              <div className="h-20 flex items-center justify-center text-sm text-zinc-500 border border-zinc-800 rounded-lg">
                No images
              </div>
            )}
          </div>
        </div>

        {/* mobile controls and dots */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex gap-2 sm:hidden">
            <Button variant="ghost" size="icon" onClick={goPrev} className="bg-transparent hover:bg-zinc-800">
              <ChevronLeft className="w-6 h-6 text-zinc-300" />
            </Button>
            <Button variant="ghost" size="icon" onClick={goNext} className="bg-transparent hover:bg-zinc-800">
              <ChevronRight className="w-6 h-6 text-zinc-300" />
            </Button>
          </div>

          <div className="flex justify-center w-full">
            {reviews.length > 1 && (
              <div className="flex gap-2">
                {reviews.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`h-2.5 w-2.5 rounded-full ${i === currentIndex ? 'bg-yellow-400 scale-125' : 'bg-zinc-700 hover:bg-zinc-600'}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Fullscreen modal for images */}
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

              <button
                onClick={() => setFullscreenOpen(false)}
                className="absolute top-6 right-6 bg-zinc-800 hover:bg-red-600 text-white rounded-full p-2 shadow-lg"
              >
                <X className="w-6 h-6" />
              </button>

              {fsImages.length > 1 && (
                <>
                  <Button variant="ghost" size="icon" onClick={fsPrev} className="absolute left-6 top-1/2 -translate-y-1/2">
                    <ChevronLeft className="w-8 h-8 text-zinc-300" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={fsNext} className="absolute right-6 top-1/2 -translate-y-1/2">
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
