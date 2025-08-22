import React, { useState, useEffect } from 'react';
import { useSearchParams ,useNavigate,Link} from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/layout/Layout';

export default function OrderRelatedIssue() {
  const [params] = useSearchParams();
  const orderId = params.get('orderId') || '';
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
    description: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);
  const navigate = useNavigate();
  const [existingIssues, setExistingIssues] = useState<any[]>([]);

  const reasonOptions = [
    'Size mismatched',
    'Product damaged',
    'Quality issue',
    'Mismatched product color',
    'Others'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.email || !formData.phone || !formData.selected_reason) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);

    try {
      // First get existing order issues
      const { data: orderData, error: fetchError } = await supabase
        .from('orders')
        .select('order_issue')
        .eq('order_number', orderId)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching order:', fetchError);
        toast.error('Error submitting order issue. Please try again.');
        setSubmitting(false);
        return;
      }

      // Handle existing order issues - it might be null, single object, or array
      let existingOrderIssues = [];
      if (orderData?.order_issue) {
        if (Array.isArray(orderData.order_issue)) {
          existingOrderIssues = orderData.order_issue;
        } else {
          existingOrderIssues = [orderData.order_issue];
        }
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
        updated_at: new Date().toISOString()
      };

      // Add new issue to array
      const updatedOrderIssues = [...existingOrderIssues, newIssue];

      const { error } = await supabase
        .from('orders')
        .update({
          order_issue: updatedOrderIssues
        })
        .eq('order_number', orderId);

      if (error) {
        console.error('Error submitting order issue:', error);
        toast.error('Error submitting order issue. Please try again.');
      } else {
        setSubmittedData(formData);
        toast.success('Issue submitted successfully!');
        fetchExistingIssues();
        // Reset form
        setFormData({
          full_name: '',
          email: '',
          phone: '',
          transaction_id: '',
          selected_reason: '',
          description: ''
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error submitting order issue. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const fetchExistingIssues = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('order_issue')
        .eq('order_number', orderId)
        .maybeSingle();

      if (data && data.order_issue) {
        // Handle both array and single object cases
        if (Array.isArray(data.order_issue)) {
          setExistingIssues(data.order_issue);
        } else {
          setExistingIssues([data.order_issue]);
        }
      } else {
        setExistingIssues([]);
      }
    } catch (error) {
      console.error('Error fetching existing issues:', error);
      setExistingIssues([]);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchExistingIssues();
    }
  }, [orderId]);
  

  return (
    <Layout>

    <div className="min-h-screen bg-black py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8 pt-5">
         <div className="flex items-center mb-4 pt-8 animate-fade-in">
          <Link to={`/order-preview/${orderId}`} className="mr-2 flex items-center gap-[20px]">
            <ArrowLeft size={24} className="back-arrow" />
            <h1 className="text-2xl text-white font-bold">Back to Orders</h1>
          </Link>
          
        </div>
          <h1 className="text-2xl font-bold text-gray-100">Order Related Issue</h1>
          <p className="mt-2 text-gray-200">Submit your order-related concerns and we'll address them promptly.</p>
        </div>

        {/* Show existing issues */}
        {existingIssues.length > 0 && (
          <div className="mb-8 space-y-4">
            <h2 className="text-xl font-semibold text-gray-100">Previously Submitted Issues</h2>
            {existingIssues.map((issue, index) => (
              <Card key={issue.id || index} className="border-gray-200 rounded-none bg-gray-800">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-red-400 text-lg ">Issue  #{index + 1}
                       <p className="text-xs font-medium text-yellow-500 ">id :{" "} 
                         <span className="font-semibold text-gray-100 leading-relaxed">{issue.id}</span>
                        </p>
                    </CardTitle>
                    <Badge className='bg-blue-600 text-white rounded-none' 
                   >
                      {issue.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                <p className="text-sm font-medium text-yellow-300">
                  Issue Type :{" "}
                  <span className="font-semibold text-gray-100 leading-relaxed">
                    {issue.reason}
                  </span>
                </p>
                <p className="text-sm font-medium text-yellow-300">
                  Transction ID :{" "}
                  <span className="font-semibold text-gray-100 leading-relaxed">
                    {issue.transaction_id}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-300">
                  Name :{" "}
                  <span className="font-semibold text-gray-100 leading-relaxed">
                    {issue.user_name}
                  </span>
                </p>
                <p className="text-sm font-medium text-yellow-300">
                  Email :{" "}
                  <span className="font-semibold text-gray-100 leading-relaxed">
                    {issue.user_email}
                  </span>
                </p>
                 <p className="text-sm font-medium text-yellow-300">
                  Number :{" "}
                  <span className="font-semibold text-gray-100 leading-relaxed">
                    {issue.phone_number}
                  </span>
                </p>
              </div>

                    </div>
                    
                    
                    <div>
                      <p className="text-sm font-bold text-yellow-300">Description :</p>
                      <p className="text-gray-100 bg-gray-700 p-3 rounded border border-gray-600">{issue.description}</p>
                    </div>

                    {issue.admin_response && (
                      <div className="mt-4 p-4 bg-gray-700 rounded-lg border border-green-600">
                        <h4 className="font-medium text-yellow-500 mb-2">Admin Response:
                            <p className="bg-black text-white  p-2">{issue.admin_response}</p>
                        </h4>
                      
                        {issue.admin_uploaded_image && (
                          <div className="mt-3">
                            <img 
                              src={issue.admin_uploaded_image} 
                              alt="Admin response" 
                              className="w-[150px] h-[100px] max-h-65 object-contain"
                            />
                          </div>
                        )}
                      </div>
                    )}
                     {issue.updated_at && (
                
                <div>
                  <div>
                <p className="text-sm font-medium text-yellow-300">
                  Created At :{" "}
                  <span className="font-semibold text-gray-100">
                   {new Date(issue.created_at).toLocaleString("en-IN", {
                       year: "numeric",
                       month: "2-digit",
                        day: "2-digit",
                       hour: "2-digit",
                       minute: "2-digit",
                      second: "2-digit",
                         hour12: true
                        })}
                  </span>
                 
                </p>
              </div>
                  <p className="text-sm font-medium text-yellow-300">
                    Updated At :{" "}
                    <span className="font-semibold text-gray-100">
                       {new Date(issue.updated_at).toLocaleString("en-IN", {
                        year: "numeric",
                          month: "2-digit",
                         day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                          hour12: true
                           })}]

                    </span>
                  </p>
                </div>
              )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {submittedData && (
          <Card className="mb-8 border-green-600 bg-green-900">
            <CardHeader>
              <CardTitle className="text-green-300 flex items-center gap-2">
                ✓ Issue Submitted Successfully
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-blue-900 rounded-lg">
                <p className="text-blue-300 font-medium">What happens next?</p>
                <p className="text-blue-200 text-sm mt-1">
                  Our team will review your issue and respond within 24-48 hours. You'll receive updates via email.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-gray-800 border-gray-200 rounded-none2">
          <CardHeader>
            <CardTitle className="text-gray-100">Submit New Issue</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium  text-gray-200 mb-2">Order Number</label>
                <Input 
                  value={orderId} 
                  disabled 
                  className="text-white bg-gray-700 border border-gray-200 cursor-not-allowed" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Full Name *</label>
                <Input
                    placeholder="Enter your full name"
                    required
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Email Address *</label>
                <Input
                    placeholder="your.email@example.com"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Phone Number *</label>
                <Input
                    placeholder="+91 9876543210"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Transaction ID</label>
                <Input
                    placeholder="Enter transaction ID (if any)"
                    value={formData.transaction_id}
                    onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Issue Type *</label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-200 bg-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={formData.selected_reason}
                  onChange={(e) => setFormData({ ...formData, selected_reason: e.target.value })}
                >
                  <option value="">Please select the issue type</option>
                  {reasonOptions.map((reason) => (
                    <option key={reason} value={reason}>{reason}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Detailed Description *</label>
                <Textarea
                  placeholder="Please describe your issue in detail"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-gray-100 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <Button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Issue Report'}
              </Button>

              <div className="text-center">
                <p className="text-sm text-gray-200">
                  Our admin team will review your issue and respond within 24-48 hours.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
    </Layout>
  );
}