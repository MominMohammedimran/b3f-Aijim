import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';

interface OrderIssue {
  id: string;
  order_id: string;
  order_number: string;
  user_email: string;
  user_name: string;
  phone_number: string;
  transaction_id?: string;
  reason: string;
  description: string;
  status: string;
  admin_response?: string;
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
  const [adminImageUrl, setAdminImageUrl] = useState((issue as any).admin_uploaded_image || '');
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
        console.error('Upload error:', error);
        toast({ title: "Upload Error", description: error.message });
        return adminImageUrl;
      }

      const { data: signedData, error: signedError } = await supabase.storage
        .from('paymentproofs')
        .createSignedUrl(data.path, 365 * 24 * 60 * 60);

      if (signedError) {
        console.error('Signed URL error:', signedError);
        toast({ title: "URL Error", description: signedError.message });
        return adminImageUrl;
      }

      return signedData.signedUrl;
    } catch (error) {
      console.error('Upload error:', error);
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
      onUpdate();
    } catch (error) {
      console.error('Error updating order issue:', error);
      toast({ title: "Error", description: "Failed to update order issue response" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ...the rest of your JSX remains exactly the same



  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Order Issue #{issue.order_number}</CardTitle>
            <p className="text-sm text-gray-300 mt-1">
              Submitted by {issue.user_name} ({issue.user_email}) on {new Date(issue.created_at).toLocaleDateString()}
            </p>
          </div>
          <Badge variant={status === 'resolved' ? 'default' : status === 'pending' ? 'secondary' : 'destructive'}>
            {status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Issue Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-200">User Issue Details</h3>
            
            <div className="bg-gray-900 border border-gray-200 p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-yellow-300">Phone</p>
                  <p className="text-sm text-gray-200">{issue.phone_number}</p>
                </div>
                {issue.transaction_id && (
                  <div>
                    <p className="text-sm font-medium text-yellow-300">Transaction ID</p>
                    <p className="text-sm text-gray-200">{issue.transaction_id}</p>
                  </div>
                )}
              </div>
              
              <div>
                <p className="text-sm font-medium text-yellow-300">Issue Type</p>
                <p className="text-sm text-gray-200">{issue.reason}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-yellow-300 mb-2">Description</p>
                <p className="text-sm text-gray-200 bg-gray-800 p-3  border">{issue.description}</p>
              </div>
            </div>
          </div>

          {/* Admin Response Form */}
          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <h3 className="font-semibold text-yellow-300">Admin Response</h3>
              
              <div>
                <label className="block text-sm font-medium text-yellow-400 mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 bg-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-yellow-300 mb-2">Admin Response</label>
                <Textarea
                  placeholder="Enter your response to the user..."
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  rows={4}
                  className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-yellow-300 mb-2">Admin Image Upload (Optional)</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor={`order-admin-file-upload-${issue.id}`}
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id={`order-admin-file-upload-${issue.id}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>

                {uploadFile && (
                  <div className="mt-4">
                    <div className="relative inline-block">
                      <img
                        src={URL.createObjectURL(uploadFile)}
                        alt="Upload preview"
                        className="h-32 w-32 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => setUploadFile(null)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                )}

                {adminImageUrl && !uploadFile && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500 mb-2">Current Image</p>
                    <img 
                      src={adminImageUrl} 
                      alt="Current admin image" 
                      className="max-w-full h-auto rounded border shadow-sm max-h-32 object-contain"
                    />
                  </div>
                )}
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting || uploading}
                className="w-full bg-blue-600 hover:bg-blue-700"
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