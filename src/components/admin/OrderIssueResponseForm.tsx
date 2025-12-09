import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';
import { createOrderIssueNotification } from "@/services/adminNotificationService";

interface OrderIssue {
  id: string;
  order_id: string;
  order_number: string;
  user_email: string;
  user_name: string;
  user_id:string;
  phone_number: string;
  transaction_id?: string;
  reason: string;
  description: string;
  status: string;
  admin_response?: string;
  admin_uploaded_image?: string;
  created_at: string;
  updated_at: string;
}

interface OrderIssueResponseFormProps {
  issue: OrderIssue;
  onUpdate: () => void;
}

// ...imports remain the same

export default function OrderIssueResponseForm({ issue, onUpdate }: OrderIssueResponseFormProps) {
  const [adminResponse, setAdminResponse] = useState(issue.admin_response || '');
  const [adminImageUrl, setAdminImageUrl] = useState(issue.admin_uploaded_image || '');
  const [status, setStatus] = useState(issue.status);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = async (): Promise<string> => {
    if (!uploadFile) return adminImageUrl;

    setUploading(true);
    try {
      const fileExtension = uploadFile.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `admin-${Date.now()}.${fileExtension}`;
      const filePath = `admin/${fileName}`;

      const { data, error } = await supabase.storage
        .from('paymentproofs')
        .upload(filePath, uploadFile);

      if (error) {
       // console.error('Upload error:', error);
        toast({ title: "Upload Error", description: error.message });
        return adminImageUrl;
      }

      // Return the public URL directly instead of signed URL
      const { data: { publicUrl } } = supabase.storage
        .from('paymentproofs')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
    // console.error('Upload error:', error);
      toast({ title: "Upload Failed", description: "Failed to upload image" });
      return adminImageUrl;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const finalImageUrl = await handleImageUpload();

      const { data: orderData, error: fetchError } = await supabase
        .from('orders')
        .select('order_issue')
        .eq('order_number', issue.order_number)
        .maybeSingle();

      if (fetchError) throw fetchError;

      // Ensure order_issue is always an array
      const orderIssues: any[] = Array.isArray(orderData?.order_issue) ? orderData.order_issue : [];

      const updatedIssues = orderIssues.map((issueItem: any) => {
        if (issueItem && issueItem.id === issue.id) {
          return {
            ...(typeof issueItem === 'object' && issueItem !== null ? issueItem : {}),
            admin_response: adminResponse,
            admin_uploaded_image: finalImageUrl,
            status: status,
            updated_at: new Date().toISOString(),
          };
        }
        return issueItem;
      });

      const { error } = await supabase
        .from('orders')
        .update({ order_issue: updatedIssues })
        .eq('order_number', issue.order_number);

      if (error) throw error;

      toast({ title: "Success", description: "Order issue response updated successfully" });

      if (issue.user_id) {
                  try {
                    await createOrderIssueNotification(issue.user_id, issue.order_number || issue.order_id, status);
                  } catch (notifErr) {
                    console.error("Failed to send in-app notification:", notifErr);
                  }
                }
      onUpdate();
      
    } catch (error) {
     // console.error('Error updating order issue:', error);
      toast({ title: "Error", description: "Failed to update order issue response" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ...the rest of your JSX remains exactly the same



 return (
  <Card className="mb-6 bg-neutral-900 border border-neutral-700">
    <CardHeader className="pb-2">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-0">
        <div>
          <CardTitle className="text-lg text-white">Order Issue #{issue.order_number}</CardTitle>
          <p className="text-gray-400 text-sm mt-1">
            Submitted by {issue.user_name} ({issue.user_email})
          </p>
          <div className="flex flex-col text-xs text-gray-500 mt-1 space-y-1">
            <span>Created: {new Date(issue.created_at).toLocaleDateString()} at {new Date(issue.created_at).toLocaleTimeString()}</span>
            <span>Updated: {new Date(issue.updated_at).toLocaleDateString()} at {new Date(issue.updated_at).toLocaleTimeString()}</span>
          </div>
        </div>
        <Badge 
          variant={
            status === 'resolved' ? 'default' : status === 'pending' ? 'secondary' : 'destructive'
          } 
          className="self-start sm:self-center"
        >
          {status}
        </Badge>
      </div>
    </CardHeader>

    <CardContent>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* User Issue Details */}
        <div className="flex-1 space-y-4">
          <h3 className="font-semibold text-yellow-300 text-sm sm:text-base">User Issue Details</h3>
          <div className="bg-gray-800 border border-gray-700 p-4 space-y-3 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-xs sm:text-sm font-medium text-yellow-400">Phone</p>
                <p className="text-sm text-gray-200">{issue.phone_number}</p>
              </div>
              {issue.transaction_id && (
                <div>
                  <p className="text-xs sm:text-sm font-medium text-yellow-400">Transaction ID</p>
                  <p className="text-sm text-gray-200">{issue.transaction_id}</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-xs sm:text-sm font-medium text-yellow-400">Issue Type</p>
              <p className="text-sm text-gray-200">{issue.reason}</p>
            </div>

            <div>
              <p className="text-xs sm:text-sm font-medium text-yellow-400 mb-1">Description</p>
              <p className="text-sm text-gray-200 bg-gray-900 p-2 rounded border border-gray-700">{issue.description}</p>
            </div>

            {(issue as any).screenshot_url && (
              <div>
                <p className="text-xs sm:text-sm font-medium text-yellow-400 mb-1">User Screenshot</p>
                <img 
                  src={(issue as any).screenshot_url} 
                  alt="User screenshot" 
                  className="w-full h-auto rounded border border-gray-700 max-h-64 object-contain cursor-pointer hover:shadow-lg" 
                  onClick={() => window.open((issue as any).screenshot_url, '_blank')}
                />
              </div>
            )}

            {adminImageUrl && (
              <div>
                <p className="text-xs sm:text-sm font-medium text-yellow-400 mb-1">Admin Uploaded Image</p>
                <img 
                  src={adminImageUrl} 
                  alt="Admin uploaded image" 
                  className="w-full h-auto rounded border border-gray-700 max-h-64 object-contain cursor-pointer hover:shadow-lg" 
                  onClick={() => window.open(adminImageUrl, '_blank')}
                />
              </div>
            )}
          </div>
        </div>

        {/* Admin Response Form */}
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="font-semibold text-yellow-300 text-sm sm:text-base">Admin Response</h3>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-yellow-400 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-700 bg-gray-900 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-yellow-300 mb-1">Admin Response</label>
              <Textarea
                placeholder="Enter your response to the user..."
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                rows={4}
                className="w-full text-sm sm:text-base border border-gray-700 bg-gray-900 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-yellow-300 mb-1">Admin Image Upload (Optional)</label>
              <div className="mt-1 flex flex-col items-center px-4 py-6 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer hover:border-gray-500 transition-colors">
                <Upload className="h-10 w-10 text-gray-400 mb-2" />
                <label
                  htmlFor={`order-admin-file-upload-${issue.id}`}
                  className="text-sm sm:text-base font-medium text-blue-500 cursor-pointer hover:text-blue-400"
                >
                  Click to upload
                  <input
                    id={`order-admin-file-upload-${issue.id}`}
                    type="file"
                    accept="image/*"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="sr-only"
                  />
                </label>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</p>
              </div>

              {uploadFile && (
                <div className="mt-3">
                  <img
                    src={URL.createObjectURL(uploadFile)}
                    alt="Upload preview"
                    className="w-full max-w-xs h-32 object-cover rounded border border-gray-700"
                  />
                  <button
                    type="button"
                    onClick={() => setUploadFile(null)}
                    className="mt-1 px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting || uploading} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-sm sm:text-base"
            >
              {uploading ? 'Uploading Image...' : isSubmitting ? 'Updating...' : 'Update Response'}
            </Button>
          </form>
        </div>
      </div>
    </CardContent>
  </Card>
);

}