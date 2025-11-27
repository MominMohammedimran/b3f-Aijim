import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface ProductIssueFormProps {
  orderNumber: string;
  onSubmit?: () => void;
}

const ProductIssueForm: React.FC<ProductIssueFormProps> = ({
  orderNumber,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    user_name: "",
    phone_number: "",
    transaction_id: "",
    reason: "",
    description: "",
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    }
  };

  const removeFile = () => {
    setUploadFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl("");
    }
  };

  const uploadImage = async (): Promise<string> => {
    if (!uploadFile) return "";

    setUploading(true);
    try {
      const fileName = `user-issue-${Date.now()}-${uploadFile.name}`;
      const filePath = `issues/${fileName}`;

      const { data, error } = await supabase.storage
        .from("paymentproofs")
        .upload(filePath, uploadFile);

      if (error) throw error;

      const { data: signedUrlData, error: signedUrlError } =
        await supabase.storage
          .from("paymentproofs")
          .createSignedUrl(filePath, 365 * 24 * 60 * 60);

      if (signedUrlError) throw signedUrlError;

      return signedUrlData.signedUrl;
    } catch (error) {
      // console.error('Upload error:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload image. Please try again.",
      });
      return "";
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.email) {
      toast({
        title: "Error",
        description: "You must be logged in to submit an issue.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const screenshotUrl = await uploadImage();

      const issueData = {
        id: crypto.randomUUID(),
        order_number: orderNumber,
        user_email: currentUser.email,
        user_name: formData.user_name,
        phone_number: formData.phone_number,
        transaction_id: formData.transaction_id,
        reason: formData.reason,
        description: formData.description,
        screenshot_url: screenshotUrl,
        status: "pending",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Get existing order issues
      const { data: orderData, error: fetchError } = await supabase
        .from("orders")
        .select("order_issue")
        .eq("order_number", orderNumber)
        .maybeSingle();

      if (fetchError) throw fetchError;

      // Prepare the issues array
      const existingIssues = Array.isArray(orderData?.order_issue)
        ? orderData.order_issue
        : [];
      const updatedIssues = [...existingIssues, issueData];

      // Update the order with the new issue
      const { error: updateError } = await supabase
        .from("orders")
        .update({ order_issue: updatedIssues })
        .eq("order_number", orderNumber);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description:
          "Your issue has been submitted successfully. We'll get back to you soon.",
      });

      // Reset form
      setFormData({
        user_name: "",
        phone_number: "",
        transaction_id: "",
        reason: "",
        description: "",
      });
      removeFile();
      onSubmit?.();
    } catch (error) {
      //    console.error('Submit error:', error);
      toast({
        title: "Error",
        description: "Failed to submit issue. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Report Product Issue
        </CardTitle>
        <p className="text-sm text-gray-600">Order #{orderNumber}</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Your Name *
            </label>
            <Input
              type="text"
              value={formData.user_name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, user_name: e.target.value }))
              }
              required
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Phone Number *
            </label>
            <Input
              type="tel"
              value={formData.phone_number}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  phone_number: e.target.value,
                }))
              }
              required
              placeholder="Enter your phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Transaction ID (if applicable)
            </label>
            <Input
              type="text"
              value={formData.transaction_id}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  transaction_id: e.target.value,
                }))
              }
              placeholder="Enter transaction ID"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Issue Type *
            </label>
            <select
              value={formData.reason}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, reason: e.target.value }))
              }
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select issue type</option>
              <option value="Damaged product received">
                Damaged product received
              </option>
              <option value="Wrong size/color delivered">
                Wrong size/color delivered
              </option>
              <option value="Product not as described">
                Product not as described
              </option>
              <option value="Missing items">Missing items</option>
              <option value="Quality issues">Quality issues</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description *
            </label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              required
              placeholder="Please describe the issue in detail..."
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Upload Image (Optional)
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="product-issue-file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="product-issue-file-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="sr-only"
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF up to 10MB
                </p>
              </div>
            </div>

            {previewUrl && (
              <div className="mt-4">
                <div className="relative inline-block">
                  <img
                    src={previewUrl}
                    alt="Upload preview"
                    className="h-32 w-32 object-cover rounded-lg border border-gray-300"
                    loading="lazy"
                  />
                  <button
                    type="button"
                    onClick={removeFile}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={submitting || uploading}
            className="w-full"
          >
            {uploading
              ? "Uploading Image..."
              : submitting
              ? "Submitting..."
              : "Submit Issue"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProductIssueForm;
