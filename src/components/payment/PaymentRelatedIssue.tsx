import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSearchParams, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Upload } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { toast } from 'sonner';

interface Issue {
  id: string;
  user_email: string;
  user_name: string;
  phone_number: string;
  transaction_id: string;
  reason: string;
  description: string;
  status: 'pending' | 'resolved' | 'rejected';
  created_at: string;
  updated_at: string;
  screenshot_url?: string;
  admin_response?: string;
  admin_uploaded_image?: string;
}

export default function PaymentRelatedIssue() {
  const [params] = useSearchParams();
  const orderId = params.get('orderId') || '';
  const formRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    transaction_id: '',
    selected_reason: '',
    description: '',
  });
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [existingIssues, setExistingIssues] = useState<Issue[]>([]);

  const generatePaymentIssueId = () => {
    const randomPart = Math.random().toString(36).substring(2, 10);
    return `aijim-payIssu-${randomPart}`;
  };

  useEffect(() => {
    const fetchIssues = async () => {
      const { data } = await supabase
        .from('orders')
        .select('payment_issue')
        .eq('order_number', orderId)
        .maybeSingle();

      if (data?.payment_issue) {
        setExistingIssues(
          Array.isArray(data.payment_issue) ? (data.payment_issue as Issue[]) : []
        );
      }
    };
    fetchIssues();
  }, [orderId]);

  const handleUpload = async () => {
    if (!screenshot) return '';
    setUploading(true);
    try {
      const timestamp = Date.now();
      const fileName = `${timestamp}-${screenshot.name}`;
      const { data: uploadedFile, error: uploadError } = await supabase.storage
        .from('paymentproofs')
        .upload(fileName, screenshot, { upsert: true });

      if (uploadError) return '';

      const { data: publicUrlData } = supabase.storage
        .from('paymentproofs')
        .getPublicUrl(uploadedFile.path);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error uploading proof:', error);
      return '';
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const screenshot_url = await handleUpload();

    const newIssue: Issue = {
      id: generatePaymentIssueId(),
      user_email: formData.email,
      user_name: formData.full_name,
      phone_number: formData.phone,
      transaction_id: formData.transaction_id,
      reason: formData.selected_reason,
      description: formData.description,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      screenshot_url,
    };

    const updatedIssues = [...existingIssues, newIssue];

    const { error } = await supabase
      .from('orders')
      .update({ payment_issue: updatedIssues as any })
      .eq('order_number', orderId);

    if (error) {
      toast.error('Failed to submit issue.');
    } else {
      setExistingIssues(updatedIssues);
      toast.success('Payment issue submitted successfully!');
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        transaction_id: '',
        selected_reason: '',
        description: '',
      });
      setScreenshot(null);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-950 py-10">
        <div className="max-w-4xl mx-auto px-4 space-y-6">
          {/* Header */}
          <div className="flex items-center gap-3">
            <Link
              to={`/order-preview/${orderId}`}
              className="flex items-center text-yellow-400 hover:text-yellow-300"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              Back
            </Link>
            <h1 className="text-2xl font-bold text-white">Payment Related Issue</h1>
          </div>
          <p className="text-gray-400 text-sm font-medium">
            Report payment-related concerns — missing, delayed, or refund issues.
          </p>

          {/* Existing Issues */}
          {existingIssues.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-yellow-400 flex items-center gap-2">
                💳 Submitted Payment Issues
              </h2>
              {existingIssues.map((issue, index) => (
                <Card
                  key={index}
                  className="bg-gray-900 border border-gray-700 rounded-none text-gray-100 shadow-md"
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-yellow-300 text-base font-semibold">
                        Issue #{index + 1}
                      </CardTitle>
                      <Badge className="bg-blue-700 text-white rounded-none">
                        {issue.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{issue.id}</p>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p>
                      <span className="text-yellow-300">Reason:</span> {issue.reason}
                    </p>
                    <p>
                      <span className="text-yellow-300">Transaction ID:</span>{' '}
                      {issue.transaction_id || 'N/A'}
                    </p>
                    <p>
                      <span className="text-yellow-300">Description:</span>{' '}
                      {issue.description || '—'}
                    </p>

                    {issue.screenshot_url && (
                      <div className="mt-3">
                        <p className="text-yellow-300 text-sm mb-1">Uploaded Proof:</p>
                        <img
                          src={issue.screenshot_url}
                          alt="Proof"
                          className="w-28 h-20 object-cover border border-gray-700"
                        />
                      </div>
                    )}

                    {issue.admin_response && (
                      <div className="p-3 border border-green-700 bg-gray-800 mt-3">
                        <span className="text-yellow-300 font-medium">Admin Response:</span>
                        <p className="text-gray-100 mt-1">{issue.admin_response}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* New Issue Form */}
          <div
            ref={formRef}
            className="bg-gray-900 border border-gray-700 rounded-none p-6 shadow-md"
          >
            <h2 className="text-yellow-400 text-lg font-semibold mb-4 flex items-center gap-2">
              🧾 Submit New Payment Issue
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-gray-300">Order Number</label>
                <Input
                  value={orderId}
                  disabled
                  className="bg-gray-800 text-gray-200 font-medium cursor-not-allowed"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  placeholder="Full Name *"
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="bg-gray-800 text-gray-200 border-gray-700"
                />
                <Input
                  placeholder="Email *"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-gray-800 text-gray-200 border-gray-700"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Input
                  placeholder="Phone *"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-gray-800 text-gray-200 border-gray-700"
                />
                <Input
                  placeholder="Transaction ID *"
                  required
                  value={formData.transaction_id}
                  onChange={(e) =>
                    setFormData({ ...formData, transaction_id: e.target.value })
                  }
                  className="bg-gray-800 text-gray-200 border-gray-700"
                />
              </div>
              <select
                required
                className="w-full bg-gray-800 border border-gray-700 text-gray-200 px-3 py-2"
                value={formData.selected_reason}
                onChange={(e) =>
                  setFormData({ ...formData, selected_reason: e.target.value })
                }
              >
                <option value="">Select Issue Type</option>
                <option value="Payment refunded (order cancelled by admin)">
                  Payment refunded
                </option>
                <option value="Payment made but not reflected">
                  Payment not reflected
                </option>
                <option value="I want to cancel my order">Cancel my order</option>
                <option value="Other">Other</option>
              </select>

              <Textarea
                placeholder="Describe your issue..."
                required
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="bg-gray-800 text-gray-200 border-gray-700"
              />

              <div>
                <label className="block mb-1 text-gray-300 font-medium">
                  Upload Proof (mandatory)
                </label>
                <div className="flex items-center gap-3">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setScreenshot(e.target.files?.[0] || null)
                    }
                    className="bg-gray-800 text-gray-200 border-gray-700"
                  />
                  {screenshot && (
                    <img
                      src={URL.createObjectURL(screenshot)}
                      alt="Preview"
                      className="w-20 h-14 object-cover border border-gray-700"
                    />
                  )}
                </div>
              </div>

              <Button
                type="submit"
                disabled={uploading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-none"
              >
                {uploading ? 'Uploading...' : 'Submit Payment Issue'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
