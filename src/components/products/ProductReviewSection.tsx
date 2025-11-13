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

      if (!reviewsData?.length) return setReviews([]);

      const userIds = [...new Set(reviewsData.map((r) => r.user_id))];

      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, display_name, first_name, last_name')
        .in('id', userIds);

      const reviewsWithUsers = reviewsData.map((review) => {
        const profile = profilesData?.find((p) => p.id === review.user_id);
        const userName =
          profile?.display_name ||
          `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() ||
          'Anonymous User';
        return { ...review, user_name: userName, review_images: review.review_images || [] };
      });

      setReviews(reviewsWithUsers);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files);
    if (selectedImages.length + newFiles.length > 3) {
      toast.error('You can upload up to 3 images only');
      return;
    }
    setSelectedImages([...selectedImages, ...newFiles]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const uploadImages = async (): Promise<string[]> => {
    if (selectedImages.length === 0) return [];
    const uploadedUrls: string[] = [];
    const timestamp = new Date().toISOString().split('T')[0];

    for (const file of selectedImages) {
      const fileName = `review-images/${currentUser!.id}_${timestamp}_${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from('paymentproofs').upload(fileName, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('paymentproofs').getPublicUrl(fileName);
      uploadedUrls.push(publicUrl);
    }
    return uploadedUrls;
  };

  const handleSubmitReview = async () => {
    if (!currentUser) return toast.error('Please log in to submit a review');
    if (newReview.comment.trim().length < 10)
      return toast.error('Please write at least 10 characters for your review');

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
      toast.success('Review submitted successfully!');
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
    reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Customer Reviews</h3>
          <div className="mt-1 flex items-center space-x-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500 font-medium">
              Avg {avgRating.toFixed(1)} ({reviews.length}{' '}
              {reviews.length === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowWriteReview(!showWriteReview)}
          className="flex items-center gap-2 border-zinc-700"
        >
          <Plus className="h-4 w-4" /> Write Review
        </Button>
      </div>

      <ProductReviewCarousel reviews={reviews} />

      {showWriteReview && (
        <div className="border border-zinc-700 bg-zinc-900/70 rounded-xl p-5 shadow-md space-y-4">
          <h4 className="font-medium text-lg">Write Your Review</h4>

          <div>
            <Label>Rating</Label>
            <div className="flex mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setNewReview({ ...newReview, rating: star })}>
                  <Star
                    className={`h-6 w-6 ${
                      star <= newReview.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Your Review</Label>
            <Textarea
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              placeholder="Share your experience with this product..."
              className="mt-2 bg-zinc-800 border-zinc-700 text-gray-100"
              rows={4}
            />
          </div>

          <div>
            <Label>Upload Images (Optional)</Label>
            <p className="text-xs text-gray-400 mt-1">
              You can upload up to 3 images for a better shopping experience.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              {selectedImages.map((file, i) => (
                <div key={i} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${i + 1}`}
                    className="h-20 w-20 object-cover rounded-md border border-zinc-700"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {selectedImages.length < 3 && (
                <label className="h-20 w-20 border-2 border-dashed border-zinc-700 rounded-md flex items-center justify-center cursor-pointer hover:border-yellow-400 transition">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <Upload className="h-6 w-6 text-gray-400" />
                </label>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSubmitReview} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Review'}
            </Button>
            <Button variant="outline" onClick={() => setShowWriteReview(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductReviewSection;
