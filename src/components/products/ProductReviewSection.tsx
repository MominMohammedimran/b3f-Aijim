import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Star, PencilLine, Upload, X } from 'lucide-react';
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
  review_images?: string[];
  user_name?: string;
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
      const { data: reviewsData, error } = await supabase
        .from('reviews')
        .select('id, user_id, rating, comment, created_at, review_images')
        .eq('product_id', productId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!reviewsData?.length) return setReviews([]);

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
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setReviews([]);
    }
  };

  // ✅ Image selection (max 3)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedImages.length > 3) {
      toast.error('You can upload a maximum of 3 images.');
      return;
    }
    setSelectedImages((prev) => [...prev, ...files]);
  };

  // ✅ Remove preview image
  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ Upload images to Supabase (returns public URLs)
  const uploadImages = async () => {
    const uploadedUrls: string[] = [];
    for (const file of selectedImages) {
      const ext = file.name.split('.').pop();
      const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const filePath = `review-images/${uniqueName}`;

      const { error } = await supabase.storage
        .from('paymentproofs')
        .upload(filePath, file);

      if (error) {
        console.error('Upload error:', error);
        toast.error('Failed to upload image');
        continue;
      }

      const { data } = supabase.storage
        .from('paymentproofs')
        .getPublicUrl(filePath);

      if (data?.publicUrl) uploadedUrls.push(data.publicUrl);
    }
    return uploadedUrls;
  };

  // ✅ Submit review
  const handleSubmitReview = async () => {
    if (!currentUser) return toast.error('Please log in to submit a review');
    if (newReview.comment.trim().length < 10)
      return toast.error('Please write at least 10 characters for your review');

    setLoading(true);
    try {
      const uploadedUrls = await uploadImages();

      const { error } = await supabase.from('reviews').insert([
        {
          product_id: productId,
          user_id: currentUser.id,
          rating: newReview.rating,
          comment: newReview.comment.trim(),
          review_images: uploadedUrls,
        },
      ]);

      if (error) throw error;

      toast.success('Review submitted successfully!');
      setNewReview({ rating: 5, comment: '' });
      setSelectedImages([]);
      setShowWriteReview(false);
      fetchReviews();
    } catch (err) {
      console.error('Error submitting review:', err);
      toast.error('Failed to submit review');
    } finally {
      setLoading(false);
    }
  };

  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  return (
    <div className="space-y-8 mt-6 border-t border-zinc-800 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-xs md:text-md lg:text-lg font-semibold text-white tracking-wide">
            Customer Reviews
          </h3>
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
          </div>
          <span className="text-xs md:text-md lg:text-lg text-gray-400 font-semibold">
            {averageRating.toFixed(1)} / 5 • {reviews.length}{' '}
            {reviews.length === 1 ? 'Review' : 'Reviews'}
          </span>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowWriteReview(!showWriteReview)}
          className="flex items-center gap-2 text-xs md:text-md lg:text-lg border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black transition"
        >
          <PencilLine className="h-4 w-4" />
          Write Review
        </Button>
      </div>

      {/* Carousel */}
      <ProductReviewCarousel reviews={reviews} />

      {/* Write Review Form */}
      {showWriteReview && (
        <div className="border border-zinc-700 bg-zinc-900/60 backdrop-blur-md rounded-md p-4 space-y-4 shadow-lg">
          <h4 className="text-md font-semibold text-yellow-400">Write Your Review</h4>

          {/* Rating */}
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

          {/* Comment */}
          <div>
            <Label htmlFor="comment">Your Review</Label>
            <Textarea
              id="comment"
              value={newReview.comment}
              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
              placeholder="Share your experience..."
              className="mt-1 bg-zinc-800 text-white border-zinc-700 focus:ring-yellow-400"
              rows={4}
            />
          </div>

          {/* Image Upload */}
          <div>
            <Label>Upload Images (max 3)</Label>
            <div className="mt-2 flex flex-wrap gap-3 items-center">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
                id="review-images"
              />
              {selectedImages.length < 3 && (
                <label
                  htmlFor="review-images"
                  className="flex items-center justify-center w-24 h-24 border-2 border-dashed border-zinc-600 text-zinc-400 hover:border-yellow-400 hover:text-yellow-400 cursor-pointer rounded-md"
                >
                  <Upload className="w-6 h-6" />
                </label>
              )}

              {selectedImages.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`preview-${index}`}
                    className="w-24 h-24 object-cover rounded-md border border-zinc-700"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-black/70 rounded-full p-1"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
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
