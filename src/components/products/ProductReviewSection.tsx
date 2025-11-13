import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, Plus, Upload, X } from 'lucide-react';
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
  review_images?: string[];
}

interface ProductReviewSectionProps {
  productId: string;
}

const ProductReviewSection: React.FC<ProductReviewSectionProps> = ({ productId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const { data: reviewsData, error: reviewsError } = await supabase
        .from('reviews')
        .select('id, user_id, rating, comment, created_at, review_images')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;

      if (!reviewsData || reviewsData.length === 0) {
        setReviews([]);
        return;
      }

      const userIds = [...new Set(reviewsData.map((r) => r.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, display_name, first_name, last_name')
        .in('id', userIds);

      const reviewsWithNames = reviewsData.map((review) => {
        const profile = profilesData?.find((p) => p.id === review.user_id);
        const userName =
          profile?.display_name ||
          `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() ||
          'Anonymous';
        return { ...review, user_name: userName, review_images: review.review_images || [] };
      });

      setReviews(reviewsWithNames);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files);
    const total = selectedImages.length + newFiles.length;
    if (total > 3) return toast.error('You can upload max 3 images');
    setSelectedImages([...selectedImages, ...newFiles]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (selectedImages.length === 0) return [];
    const urls: string[] = [];
    const date = new Date().toISOString();
    for (const file of selectedImages) {
      const path = `review-images/${currentUser!.id}_${date}_${file.name}`;
      const { error } = await supabase.storage.from('paymentproofs').upload(path, file);
      if (error) throw error;
      const { data } = supabase.storage.from('paymentproofs').getPublicUrl(path);
      if (data?.publicUrl) urls.push(data.publicUrl);
    }
    return urls;
  };

  const handleSubmitReview = async () => {
    if (!currentUser) return toast.error('Please log in to review');
    if (newReview.comment.trim().length < 10)
      return toast.error('Please write at least 10 characters');

    setLoading(true);
    try {
      const imageUrls = await uploadImages();

      const { error } = await supabase.from('reviews').insert([
        {
          product_id: productId,
          user_id: currentUser.id,
          rating: newReview.rating,
          comment: newReview.comment.trim(),
          review_images: imageUrls,
        },
      ]);

      if (error) throw error;

      toast.success('Review submitted successfully');
      setNewReview({ rating: 5, comment: '' });
      setSelectedImages([]);
      setShowWriteReview(false);
      fetchReviews();
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((a, b) => a + b.rating, 0) / reviews.length
      : 0;

  return (
    <div className="space-y-8 bg-zinc-950/60 backdrop-blur-md rounded-2xl p-6 border border-zinc-800 shadow-inner">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white tracking-wide">
            Customer Reviews
          </h3>
          <div className="flex items-center mt-1 gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star
                key={s}
                className={`h-4 w-4 ${
                  s <= Math.round(avgRating)
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-zinc-500'
                }`}
              />
            ))}
            <span className="text-xs text-zinc-400 font-medium ml-2">
              Avg {avgRating.toFixed(1)} ({reviews.length}{' '}
              {reviews.length === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => setShowWriteReview(!showWriteReview)}
          className="flex items-center gap-2 border-zinc-700 text-white hover:bg-yellow-500 hover:text-black transition-all"
        >
          <Plus className="h-4 w-4" /> {showWriteReview ? 'Close' : 'Write Review'}
        </Button>
      </div>

      {/* Review Form */}
      {showWriteReview && (
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-6 space-y-5 shadow-md">
          <h4 className="font-medium text-white text-base">Write Your Review</h4>

          <div>
            <Label className="text-sm text-zinc-300">Your Rating</Label>
            <div className="flex items-center mt-2 gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setNewReview({ ...newReview, rating: s })}
                  className="p-1"
                >
                  <Star
                    className={`h-6 w-6 ${
                      s <= newReview.rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-zinc-500'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="comment" className="text-sm text-zinc-300">
              Your Review
            </Label>
            <Textarea
              id="comment"
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              placeholder="Share your honest experience..."
              className="mt-2 bg-zinc-950/70 border-zinc-800 text-white focus:ring-yellow-400"
              rows={4}
            />
          </div>

          <div>
            <Label className="text-sm text-zinc-300">
              Upload Images (Optional - Max 3)
            </Label>
            <div className="mt-3 flex flex-wrap gap-3">
              {selectedImages.map((file, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${idx}`}
                    className="h-20 w-20 object-cover rounded-lg border border-zinc-700"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {selectedImages.length < 3 && (
                <label className="h-20 w-20 border-2 border-dashed border-zinc-700 rounded-lg flex items-center justify-center cursor-pointer hover:border-yellow-400 transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <Upload className="h-6 w-6 text-zinc-500" />
                </label>
              )}
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              {selectedImages.length}/3 selected
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSubmitReview}
              disabled={loading}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-medium"
            >
              {loading ? 'Submitting...' : 'Submit Review'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowWriteReview(false)}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Carousel Below */}
      <div className="pt-4">
        <ProductReviewCarousel reviews={reviews} />
      </div>
    </div>
  );
};

export default ProductReviewSection;
