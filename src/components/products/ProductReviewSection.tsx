import React, { useState } from "react";
import { Star, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Review {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_name?: string;
  image_paths?: string[];
}

interface ProductReviewSectionProps {
  productId: string;
  userId: string;
  onReviewSubmitted?: (review: Review) => void;
}

const ProductReviewSection: React.FC<ProductReviewSectionProps> = ({
  productId,
  userId,
  onReviewSubmitted,
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const newFiles = [...imageFiles, ...files].slice(0, 3); // max 3
    setImageFiles(newFiles);

    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(newPreviews);
  };

  const handleRemoveImage = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    setImageFiles(newFiles);
    setPreviewUrls(newPreviews);
  };

  const handleSubmit = async () => {
    if (!rating) {
      setError("Please select a rating.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      let uploadedPaths: string[] = [];

      // Only upload if user selected images
      if (imageFiles.length > 0) {
        for (const file of imageFiles) {
          const fileName = `${userId}-${Date.now()}-${file.name}`;
          const { error: uploadError } = await supabase.storage
            .from("paymentproofs")
            .upload(`review-images/${fileName}`, file);

          if (uploadError) throw uploadError;
          uploadedPaths.push(fileName);
        }
      }

      const { data, error: insertError } = await supabase
        .from("reviews")
        .insert([
          {
            product_id: productId,
            user_id: userId,
            rating,
            comment,
            image_paths: uploadedPaths, // may be empty []
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      setRating(0);
      setComment("");
      setImageFiles([]);
      setPreviewUrls([]);
      onReviewSubmitted?.(data);
    } catch (err: any) {
      console.error(err);
      setError("Failed to submit review. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mt-10 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 shadow-md backdrop-blur-md">
      <h3 className="text-lg font-semibold text-white mb-4">Write a Review</h3>

      {/* Rating */}
      <div className="flex gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            onClick={() => setRating(star)}
            className={`w-6 h-6 cursor-pointer transition ${
              star <= rating
                ? "text-yellow-400 fill-yellow-400"
                : "text-zinc-600 hover:text-yellow-300"
            }`}
          />
        ))}
      </div>

      {/* Comment */}
      <textarea
        className="w-full rounded-md bg-zinc-800/50 border border-zinc-700 text-gray-200 p-3 text-sm focus:outline-none focus:ring-1 focus:ring-yellow-400 mb-4 resize-none"
        rows={3}
        placeholder="Share your experience about this product..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      {/* Optional Upload Section */}
      <div className="mb-4">
        <p className="text-xs text-gray-400 mb-2">
          📸 You can upload up to 3 product images for better user experience (optional)
        </p>
        <label className="flex items-center gap-2 cursor-pointer w-fit text-sm text-yellow-400 hover:text-yellow-500 transition">
          <Upload className="w-4 h-4" />
          <span>Upload Images</span>
          <input
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={handleFileChange}
          />
        </label>

        {previewUrls.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-3">
            {previewUrls.map((url, i) => (
              <div key={i} className="relative group">
                <img
                  src={url}
                  alt={`Preview ${i}`}
                  className="w-20 h-20 rounded-md object-cover border border-zinc-700"
                />
                <button
                  onClick={() => handleRemoveImage(i)}
                  className="absolute top-1 right-1 bg-black/70 p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Error */}
      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={uploading}
        className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-md"
      >
        {uploading ? "Submitting..." : "Submit Review"}
      </Button>
    </div>
  );
};

export default ProductReviewSection;
