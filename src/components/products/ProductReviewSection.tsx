import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, PencilLine } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import ProductReviewCarousel from './ProductReviewCarousel';

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_name?: string;
}

interface ProductReviewSectionProps {
  productId: string;
}

const ProductReviewSection: React.FC<ProductReviewSectionProps> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('id, user_id, rating, comment, created_at')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      if (!reviewsData?.length) {
        setReviews([]);
        return;
      }

      const userIds = [...new Set(reviewsData.map((r) => r.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, display_name, first_name, last_name, email')
        .in('id', userIds);

      const reviewsWithNames = reviewsData.map((review) => {
        const profile = profilesData?.find((p) => p.id === review.user_id);
        const displayName =
          profile?.display_name ||
          `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() ||
          (profile?.email ? profile.email.split('@')[0] : 'Anonymous User');
 
 
        return { ...review, user_name: displayName };
      });

      setReviews(reviewsWithNames);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    }
  };

  const handleSubmitReview = async () => {
    if (!currentUser) {
      toast.error('Please log in to submit a review');
      return;
    }

    if (newReview.comment.trim().length < 10) {
      toast.error('Please write at least 10 characters for your review');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('reviews').insert([
        {
          product_id: productId,
          user_id: currentUser.id,
          rating: newReview.rating,
          comment: newReview.comment.trim(),
        },
      ]);

      if (error) throw error;

      toast.success('Review submitted successfully!');
      setNewReview({ rating: 5, comment: '' });
      setShowWriteReview(false);
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="space-y-8 mt-6 border-t border-zinc-800 pt-6">
      {/* Header Section */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">Customer Reviews</h3>
          <div className="flex items-center mt-1 space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= Math.round(averageRating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-500'
                }`}
              />
            ))}
            <span className="ml-2 text-sm text-gray-400 font-semibold">
              {averageRating.toFixed(1)} / 5 • {reviews.length}{' '}
              {reviews.length === 1 ? 'Review' : 'Reviews'}
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowWriteReview(!showWriteReview)}
          className="flex items-center gap-2 text-sm border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black transition"
        >
          <PencilLine className="h-4 w-4" />
          Write Review
        </Button>
      </div>

      {/* Carousel */}
      <ProductReviewCarousel reviews={reviews} />

      {/* Write Review Section */}
      {showWriteReview && (
        <div className="border border-zinc-700 bg-zinc-900/60 backdrop-blur-md rounded-md p-4 space-y-4 shadow-lg">
          <h4 className="text-md font-semibold text-yellow-400">Write Your Review</h4>

          <div>
            <Label>Rating</Label>
            <div className="flex items-center gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setNewReview({ ...newReview, rating: star })}
                  type="button"
                  className="focus:outline-none"
                >
                  <Star
                    className={`h-6 w-6 transition ${
                      star <= newReview.rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-500'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="comment">Your Review</Label>
            <Textarea
              id="comment"
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              placeholder="Share your experience with this product..."
              className="mt-1 bg-zinc-800 text-white border-zinc-700 focus:ring-yellow-400"
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              onClick={handleSubmitReview}
              disabled={loading}
              className="bg-yellow-400 text-black hover:bg-yellow-300"
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowWriteReview(false)}
              className="border-zinc-700 text-gray-300 hover:text-white"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductReviewSection;