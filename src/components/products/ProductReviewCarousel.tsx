import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X, UserRound } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (reviews.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % reviews.length);
    }, 6000);
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

  return (
    <div className="relative max-w-3xl mx-auto">
      {/* Review Card */}
      <div className="bg-zinc-900/70 backdrop-blur-md border border-zinc-700 p-6 sm:p-8 shadow-lg rounded-xl transition-all duration-300">
        {/* Rating */}
        <div className="flex items-center mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <UserRound
              key={star}
              className={`w-5 h-5 transition ${
                star <= currentReview.rating
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-zinc-500'
              }`}
            />
          ))}
          <span className="ml-3 text-sm text-zinc-400">
            {currentReview.rating}/5
          </span>
        </div>

        {/* Comment */}
        <p className="text-zinc-200 text-base leading-relaxed min-h-[80px]">
          “{currentReview.comment || 'No comment provided'}”
        </p>

        {/* Review Images */}
        {currentReview.review_images && currentReview.review_images.length > 0 && (
          <div className="mt-4 flex gap-3 flex-wrap">
            {currentReview.review_images.map((imageUrl, idx) => (
              <img
                key={idx}
                src={imageUrl}
                alt={`Review image ${idx + 1}`}
                onClick={() => setSelectedImage(imageUrl)}
                className="h-20 w-20 object-cover rounded-md border border-zinc-600 cursor-pointer hover:scale-105 transition-transform"
              />
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between text-sm text-zinc-500">
          <div>
            <p className="font-semibold text-white">{currentReview.user_name || 'Anonymous'}</p>
            <p>{new Date(currentReview.created_at).toLocaleDateString()}</p>
          </div>
          <div className="text-zinc-400">
            {currentIndex + 1} / {reviews.length}
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {reviews.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 text-yellow-400 hover:text-yellow-500"
          >
            <ChevronLeft className="w-7 h-7" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 text-yellow-400 hover:text-yellow-500"
          >
            <ChevronRight className="w-7 h-7" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {reviews.length > 1 && (
        <div className="flex justify-center mt-5 gap-2">
          {reviews.map((_, index) => (
            <div
              key={index}
              className={`h-2.5 w-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                index === currentIndex
                  ? 'bg-yellow-400 scale-110 shadow-md'
                  : 'bg-zinc-600'
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}

      {/* Fullscreen Image Viewer */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative">
            <img
              src={selectedImage}
              alt="Full review"
              className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-lg"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
              className="absolute -top-10 right-0 text-white bg-white/20 hover:bg-white/30 rounded-full p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductReviewCarousel;
