import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star ,UserRound} from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      <div className="bg-zinc-900/70 backdrop-blur-md  border border-zinc-700 p-6 sm:p-8 shadow-lg transition-all duration-300">
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

        <p className="text-zinc-200 text-base leading-relaxed min-h-[80px]">
          “ {currentReview.comment || 'No comment provided'} ”
        </p>

        <div className="mt-6 flex items-center justify-between text-sm text-zinc-500">
          <div>
            <p className="font-semibold text-white">{currentReview.user_name || 'Anonymous'}</p>
            <p>{new Date(currentReview.created_at).toLocaleDateString()}</p>
          </div>
          <div>{currentIndex + 1} / {reviews.length}</div>
        </div>
      </div>

      {reviews.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-transparent  hover: text-yellow-400"
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-transparent  hover: text-yellow-400"
          >
            <ChevronRight className="w-8 h-8" />
          </Button>
        </>
      )}

      {reviews.length > 1 && (
        <div className="flex justify-center mt-5 gap-2">
          {reviews.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-yellow-400 scale-110 shadow-md'
                  : 'bg-zinc-600'
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductReviewCarousel;
