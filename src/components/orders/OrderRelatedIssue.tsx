import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/layout/Layout';

export default function OrderRelatedIssue() {
  const [params] = useSearchParams();
  const orderId = params.get('orderId') || '';
  const navigate = useNavigate();

  const generateOrderIssueId = () => {
    const randomPart = Math.random().toString(36).substring(2, 10);
    return `aijim-orderIss-${randomPart}`;
  };

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    transaction_id: '',
    selected_reason: '',
    description: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [existingIssues, setExistingIssues] = useState<any[]>([]);

  const reasonOptions = [
    'Size mismatched',
    'Product damaged',
    'Quality issue',
    'Mismatched product color',
    'Others',
  ];

  const fetchExistingIssues = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('order_issue')
        .eq('order_number', orderId)
        .maybeSingle();

      if (data && data.order_issue) {
        setExistingIssues(Array.isArray(data.order_issue) ? data.order_issue : [data.order_issue]);
      } else setExistingIssues([]);
    } catch {
      setExistingIssues([]);
    }
  };

  useEffect(() => {
    if (orderId) fetchExistingIssues();
  }, [orderId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.email || !formData.phone || !formData.selected_reason) {
      toast.error('Please fill all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const { data: orderData } = await supabase
        .from('orders')
        .select('order_issue')
        .eq('order_number', orderId)
        .maybeSingle();

      let existingOrderIssues = [];
      if (orderData?.order_issue) {
        existingOrderIssues = Array.isArray(orderData.order_issue)
          ? orderData.order_issue
          : [orderData.order_issue];
      }

      const newIssue = {
        id: generateOrderIssueId(),
        user_email: formData.email,
        user_name: formData.full_name,
        phone_number: formData.phone,
        transaction_id: formData.transaction_id,
        reason: formData.selected_reason,
        description: formData.description,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const updatedOrderIssues = [...existingOrderIssues, newIssue];
      const { error } = await supabase
        .from('orders')
        .update({ order_issue: updatedOrderIssues })
        .eq('order_number', orderId);

      if (error) throw error;

      toast.success('Issue submitted successfully!');
      fetchExistingIssues();
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        transaction_id: '',
        selected_reason: '',
        description: '',
      });
    } catch {
      toast.error('Error submitting issue. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-950 py-10 pt-10 mt-10">
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          {/* Header */}
           <nav className="flex items-center gap-2 pt-6 mb-5 text-white text-sm sm:text-base">
                    <Link to="/orders" className="opacity-70 hover:opacity-100 transition">
                      Orders
                    </Link>
                
                   <span className="opacity-60">/</span>
                   <Link to={`/order-preview/${orderId}`} className="opacity-70 hover:opacity-100 transition">
                   Back to order
                       </Link>
                   
                       <span className="opacity-60">/</span>
                
                    <span className="font-semibold line-clamp-1">
                   
                    {orderId}
                    </span>
                  </nav>
          
            <h1 className="text-xl lg:text-2xl text-center font-bold text-yellow-400 underline">Order Issue</h1>
          
          <p className="text-gray-400 text-sm font-medium">
            Report any issue with your order — our team will review and respond within 24–48 hours.
          </p>

          {/* Existing Issues */}
          {existingIssues.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-yellow-400 flex items-center gap-2">
                🧾 Submitted Issues
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
                    {issue.admin_response && (
                      <div className="p-3 border border-green-700 bg-gray-800">
                        <span className="text-yellow-300 font-medium">Admin Response:</span>
                        <p className="text-gray-100 mt-1">{issue.admin_response}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Submit New Issue */}
          <div className="bg-gray-900 border border-gray-700 rounded-none p-6 shadow-md">
            <h2 className="text-yellow-400 text-lg font-semibold mb-4 flex items-center gap-2">
              🛠 Submit New Issue
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-gray-300">Order Number</label>
                <Input value={orderId} disabled className="bg-gray-800 text-gray-200" />
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
                  placeholder="Transaction ID (optional)"
                  value={formData.transaction_id}
                  onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
                  className="bg-gray-800 text-gray-200 border-gray-700"
                />
              </div>
              <select
                required
                className="w-full bg-gray-800 border border-gray-700 text-gray-200 px-3 py-2"
                value={formData.selected_reason}
                onChange={(e) => setFormData({ ...formData, selected_reason: e.target.value })}
              >
                <option value="">Select Issue Type</option>
                {reasonOptions.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <Textarea
                placeholder="Describe your issue..."
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="bg-gray-800 text-gray-200 border-gray-700"
              />
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-none"
              >
                {submitting ? 'Submitting...' : 'Submit Issue'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
