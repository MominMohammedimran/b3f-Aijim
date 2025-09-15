import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus } from 'lucide-react';
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
  const navigate = useNavigate();
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
  const [showForm, setShowForm] = useState(false);
const generatePaymentIssueId = () => {
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `aijim-payIssu-${randomPart}`;
};

  useEffect(() => {
    const fetchIssues = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('payment_issue')
        .eq('order_number', orderId)
        .maybeSingle();

      if (!error && data?.payment_issue) {
        const issues = Array.isArray(data.payment_issue) 
          ? (data.payment_issue as unknown as Issue[]) 
          : [];
        setExistingIssues(issues);
      }
    };

    fetchIssues();
  }, [orderId]);

  const scrollToForm = () => {
    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleUpload = async () => {
  if (!screenshot) return '';
  setUploading(true);
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || 'anonymous';

    // Use original filename
    const fileName = screenshot.name;
    
    // Upload file
    const { data: uploadedFile, error: uploadError } = await supabase
      .storage
      .from('paymentproofs')
      .upload(fileName, screenshot, { upsert: true });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return '';
    }

    // Get signed URL with expiry (e.g., 1 hour)
    const { data: signedData, error: signedError } = await supabase
      .storage
      .from('paymentproofs')
      .createSignedUrl(uploadedFile.path, 3600); // 3600 seconds = 1 hour

    if (signedError) {
      console.error('Signed URL error:', signedError);
      return '';
    }

    return signedData.signedUrl;
  } catch (error) {
    console.error('Error during upload:', error);
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
      screenshot_url
    };

    const updatedIssues = [...existingIssues, newIssue];

    const { data, error } = await supabase
      .from('orders')
      .update({
        payment_issue: updatedIssues as any
      })
      .eq('order_number', orderId)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error submitting issue:', error);
      toast.error('Failed to submit issue. Please try again.');
    } else {
      setExistingIssues(updatedIssues);
      toast.success('Issue submitted successfully!');
      setFormData({
        full_name: '',
        email: '',
        phone: '',
        transaction_id: '',
        selected_reason: '',
        description: ''
      });
      setScreenshot(null);
      setShowForm(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background text-foreground pt-15">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          
                  <div className="mb-8 pt-5">
                   <div className="flex items-center mb-4 pt-8 animate-fade-in">
                    <Link to={`/order-preview/${orderId}`} className="mr-2 flex items-center gap-[20px]">
                      <ArrowLeft size={24} className="back-arrow" />
                      <h1 className="text-2xl text-white font-bold">Back to Orders</h1>
                    </Link>
                    
                  </div>
                    <h1 className="text-2xl font-bold text-gray-100">Payment Related Issue</h1>
                    <p className="mt-2 font-semibold text-sm text-gray-200">Submit your Payment-related concerns and we'll address them promptly.</p>
                  </div>

          {/* Show existing issues */}
{existingIssues.length > 0 && (
  <div className="mb-8 space-y-4">
    <h2 className="text-xl font-semibold text-gray-100">Previously Submitted Issues</h2>
    {existingIssues.map((issue, index) => (
      <Card key={issue.id || index} className="border-gray-200 rounded-none bg-background">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-red-500 text-lg">Issue #{index + 1}
              <p className="text-xs font-semibold text-yellow-400">
                <span className="leading-relaxed font-semibold text-gray-100">
                  {issue.id}
                  </span>
                </p>
            </CardTitle>
            <Badge
              className="bg-blue-600 text-white rounded-none"

            >
              {issue.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-semibold text-yellow-300">
                  Issue Type :{" "}
                  <span className="font-semibold text-xs text-gray-100 leading-relaxed">
                    {issue.reason}
                  </span>
                </p>
                <p className="text-sm font-semibold text-yellow-300">
                  Transction ID :{" "}
                  <span className="font-semibold text-xs text-gray-100 leading-relaxed">
                    {issue.transaction_id}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-yellow-300">
                  Name :{" "}
                  <span className="font-semibold text-xs text-gray-100 leading-relaxed lowercase">
                    {issue.user_name}
                  </span>
                </p>
                <p className="text-sm font-semibold text-yellow-300">
                  Email :{" "}
                  <span className="font-semibold text-xs text-gray-100 leading-relaxed lowercase">
                    {issue.user_email}
                  </span>
                </p>
                 <p className="text-sm font-semibold text-yellow-300">
                  Number :{" "}
                  <span className="font-semibold text-xs text-gray-100  leading-relaxed">
                    {issue.phone_number}
                  </span>
                </p>
              </div>
              
            
            </div>
            <div className="  w-full flex items-center">
              <p className="text-sm font-semibold text-yellow-300">image_upl:</p>
               <img className='w-[30%]  h-[60px] m-auto' src={issue.screenshot_url}/>

            </div>

            <div>
              <p className="text-sm font-semibold text-yellow-300 mb-1">Description </p>
              <p className="text-gray-100 text-sm font-semibold bg-gray-700 p-1.5 rounded border border-gray-600">
                {issue.description}
              </p>
            </div>

             {issue.admin_response && (
                      <div className="mt-4 p-4 bg-gray-700 rounded-lg border border-green-600">
                        <h4 className="font-medium text-yellow-500 mb-2">Admin Response:
                            <p className=" text-white  p-2">{issue.admin_response}</p>
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
                <p className="text-sm font-semibold text-yellow-300">
                  Created At :{" "}
                  <span className="font-semibold text-xs text-gray-100">
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
                  <p className="text-sm font-semibold text-yellow-300">
                    Updated At :{" "}
                    <span className="font-semibold text-xs text-gray-100">
                       {new Date(issue.updated_at).toLocaleString("en-IN", {
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
              )}
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
)}


          <div ref={formRef} className="border border-border rounded-lg p-6 bg-card shadow-lg">
              <h2 className="text-xl font-bold mb-6 text-foreground">Submit a New Payment Issue</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                              <label className="block text-sm font-medium  text-gray-200 mb-2">Order Number</label>
                              <Input 
                                value={orderId} 
                                disabled 
                                className="bg-background   font-semibold text-foreground cursor-not-allowed" 
                              />
                            </div>
              
              <div>
                <label className="block mb-1 text-foreground">Full Name *</label>
                <Input
                  required
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="bg-background font-semibold border-input text-foreground"
                />
              </div>
              <div>
                <label className="block mb-1 text-foreground">Email *</label>
                <Input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-background font-semibold border-input text-foreground"
                />
              </div>
              <div>
                <label className="block mb-1 text-foreground">Phone *</label>
                <Input
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-background border-input font-semibold text-foreground"
                />
              </div>
              <div>
                <label className="block mb-1 text-foreground">Transaction ID *</label>
                <Input
                  required
                  value={formData.transaction_id}
                  onChange={(e) => setFormData({ ...formData, transaction_id: e.target.value })}
                  className="bg-background font-semibold border-input text-foreground"
                />
              </div>
              <div>
                <label className="block mb-1 text-foreground">Issue Type *</label>
                <select
                  required
                  className="w-full bg-background border border-input rounded px-3 py-2 text-foreground"
                  value={formData.selected_reason}
                  onChange={(e) => setFormData({ ...formData, selected_reason: e.target.value })}
                >
                  <option value="">Select an option</option>
                  <option value="Payment refunded (order cancelled by admin)">Payment refunded</option>
                  <option value="Payment made but not reflected">Payment not reflected</option>
                  <option value="I want to cancel my order">Cancel my order</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 text-foreground">Description *</label>
                <Textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-background font-semibold border-input text-foreground"
                />
              </div>
              <div>
                <label className="block mb-1 text-foreground">Upload Image (mandatory)</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
                  className="bg-background border-input text-foreground"
                />
              </div>
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 font-semibold"
                >
                  {uploading ? 'Uploading...' : 'Submit Issue'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
