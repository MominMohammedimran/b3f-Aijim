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
  review_images?: string[]; // public URLs stored in DB
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      const reviewsWithNames = reviewsData.map((review: any) => {
        const profile = profilesData?.find((p: any) => p.id === review.user_id);
        const userName =
          profile?.display_name ||
          `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() ||
          'Anonymous';
        return {
          ...review,
          user_name: userName,
          review_images: (review.review_images as string[]) || [],
        } as Review;
      });

      setReviews(reviewsWithNames);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setReviews([]);
    }
  };

  // select images (optional)
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newFiles = Array.from(files);
    const total = selectedImages.length + newFiles.length;
    if (total > 3) {
      toast.error('You can upload up to 3 images.');
      return;
    }
    setSelectedImages((prev) => [...prev, ...newFiles]);
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // upload to supabase storage (paymentproofs public bucket), return public URLs
  const uploadImages = async (): Promise<string[]> => {
    if (!selectedImages.length) return [];

    const uploadedUrls: string[] = [];
    const date = new Date().toISOString().split('T')[0];

    for (const file of selectedImages) {
      const safeName = `${currentUser?.id || 'anon'}_${date}_${Date.now()}_${file.name}`;
      const path = `review-images/${safeName}`;
      const { error } = await supabase.storage.from('paymentproofs').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

      if (error) {
        console.error('Upload error:', error);
        throw error;
      }

      const { data } = supabase.storage.from('paymentproofs').getPublicUrl(path);
      if (data?.publicUrl) uploadedUrls.push(data.publicUrl);
    }

    return uploadedUrls;
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
      const imageUrls = await uploadImages(); // will be [] if none selected

      const payload = {
        product_id: productId,
        user_id: currentUser.id,
        rating: newReview.rating,
        comment: newReview.comment.trim(),
        review_images: imageUrls.length ? imageUrls : null,
      };

      const { error } = await supabase.from('reviews').insert([payload]);
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

  const avgRating =
    reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  return (
    <section className="w-full  mx-auto space-y-6 px-1 sm:px-2">
      <div className="bg-zinc-950/60 backdrop-blur-md rounded-2xl p-2 border border-zinc-800 shadow-inner">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-md lg:text-xl font-semibold text-white tracking-tight">Customer Reviews</h3>
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-4 w-4 ${
                      s <= Math.round(avgRating) ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-600'
                    }`}
                  />
                ))}
              </div>
              <div className="text-xs lg:text-md font-semibold text-zinc-400">
                Avg {avgRating.toFixed(1)} • {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowWriteReview((s) => !s)}
              className="flex items-center gap-2 text-sm lg:text-lg border-zinc-700 text-white hover:bg-yellow-500 hover:text-black transition"
            >
              <Plus className="h-4 w-4" />
              {showWriteReview ? 'Close' : 'Write Review'}
            </Button>
          </div>
        </div>

        {/* Write review form (full width card) */}
        {showWriteReview && (
          <div className="mt-2 bg-zinc-900/70 border border-zinc-800 rounded-xl p-2 shadow-md">
            <div className=" items-start justify-between">
              <h4 className="text-sm lg:text-lg font-medium text-white">Write your review</h4>
              <div className="text-xs lg:text-lg font-medium text-zinc-400">Optional: add up to 3 images</div>
            </div>

            <div className="mt-2 grid grid-cols-1 gap-4">
              <div>
                <Label className="text-sm lg:text-md text-zinc-300">Your rating</Label>
                <div className="flex items-center gap-2 mt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      onClick={() => setNewReview({ ...newReview, rating: s })}
                      type="button"
                      className="p-1"
                      aria-label={`Rate ${s}`}
                    >
                      <Star className={`h-5 w-5 ${s <= newReview.rating ? 'text-yellow-400' : 'text-zinc-500'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="comment" className="text-sm text-zinc-300">
                  Your review
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
                <Label className="text-xs lg:text-md text-zinc-300">Images (optional)</Label>
                <div className="mt-3 flex flex-wrap gap-3 items-center">
                  {selectedImages.map((file, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`preview-${idx}`}
                        className="h-14 w-14 object-cover rounded-lg border border-zinc-700"
                      />
                      <button
                        type="button"
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        onClick={() => removeImage(idx)}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}

                  {selectedImages.length < 3 && (
                    <label className="h-14 w-14 border-2 border-dashed border-zinc-700 rounded-lg flex items-center justify-center cursor-pointer hover:border-yellow-400 transition">
                      <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="hidden" />
                      <Upload className="h-4 w-4 text-zinc-500" />
                    </label>
                  )}
                </div>
                <p className="mt-2 text-xs text-zinc-500">{selectedImages.length}/3 selected</p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={handleSubmitReview}
                  disabled={loading}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black"
                >
                  {loading ? 'Submitting...' : 'Submit Review'}
                </Button>
                <Button variant="outline" onClick={() => setShowWriteReview(false)} className="border-zinc-700 text-zinc-300">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Carousel below */}
      <div>
        <ProductReviewCarousel reviews={reviews} />
      </div>
    </section>
  );
};

export default ProductReviewSection;
