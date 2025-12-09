import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw, AlertTriangle, CreditCard } from 'lucide-react';
import PaymentIssueResponseForm from './PaymentIssueResponseForm';
import OrderIssueResponseForm from './OrderIssueResponseForm';
import { useToast } from '@/hooks/use-toast';
import ModernAdminLayout from '../../components/admin/ModernAdminLayout';



interface AdminPaymentIssue {
  user_email?: string;
 user_id?: string;
  user_name?: string;
  phone_number?: string;
  transaction_id?: string;
  reason?: string;
  description?: string;
  screenshot_url?: string;
  status?: string;
  admin_response?: string;
  admin_uploaded_image?: string;
  created_at?: string;
  updated_at?: string;
  id: string;
  order_number?: string;
  order_id?: string;
}

interface AdminOrderIssue {
  user_email?: string;
  user_name?: string;
  user_id?: string;
  phone_number?: string;
  transaction_id?: string;
  reason?: string;
  description?: string;
  screenshot_url?: string;
  status?: string;
  admin_response?: string;
  admin_uploaded_image?: string;
  created_at?: string;
  order_id?: string;
  updated_at?: string;
  id: string;
  order_number?: string;
}
export default function AdminOrderManager() {
  const [paymentIssues, setPaymentIssues] = useState<AdminPaymentIssue[]>([]);
  const [orderIssues, setOrderIssues] = useState<AdminOrderIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toast } = useToast();

  const fetchPaymentIssues = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .not('payment_issue', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const mappedData: AdminPaymentIssue[] = [];
       
     (data || []).forEach(order => {
  const shippingAddress = order.shipping_address as any;
  const paymentIssuesRaw = order.payment_issue as unknown as AdminPaymentIssue | AdminPaymentIssue[] | null;
  const paymentIssues = Array.isArray(paymentIssuesRaw) ? paymentIssuesRaw : (paymentIssuesRaw ? [paymentIssuesRaw] : []);
  
  paymentIssues.forEach(issue => {
    mappedData.push({
      id: issue.id || order.id,
      order_id: order.order_number,
      order_number: order.order_number,
      user_id:issue.user_id,
      user_email: issue.user_email || shippingAddress?.email || 'N/A',
      user_name: issue.user_name || shippingAddress?.fullName || 'N/A',
      phone_number: issue.phone_number || shippingAddress?.phone || 'N/A',
      transaction_id: issue.transaction_id || order.payment_details || 'N/A',
      reason: issue.reason || 'Payment Issue',
      description: issue.description || 'No description',
       screenshot_url: issue.screenshot_url || null,
       status: issue.status || 'pending',
       admin_response: issue.admin_response || null,
       admin_uploaded_image: issue.admin_uploaded_image || null,
      created_at: issue.created_at || order.created_at,
      updated_at: issue.updated_at || order.updated_at,
    });
  });
});

      setPaymentIssues(mappedData);
    } catch (error) {
     // console.error('Error fetching payment issues:', error);
      toast({
        title: "Error",
        description: "Failed to fetch payment issues",
      });
    }
  };

  const fetchOrderIssues = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .not('order_issue', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const mappedData: AdminOrderIssue[] = [];
    (data || []).forEach(order => {
  const shippingAddress = order.shipping_address as any;
  const orderIssuesRaw = order.order_issue as unknown as AdminOrderIssue | AdminOrderIssue[] | null;
  const orderIssues = Array.isArray(orderIssuesRaw) ? orderIssuesRaw : (orderIssuesRaw ? [orderIssuesRaw] : []);
  
  orderIssues.forEach(issue => {
    mappedData.push({
      id: issue.id || order.id,
      order_id: order.order_number,
      order_number: order.order_number,
        user_id:issue.user_id,
      user_email: issue.user_email || shippingAddress?.email || 'N/A',
      user_name: issue.user_name || shippingAddress?.fullName || 'N/A',
      phone_number: issue.phone_number || shippingAddress?.phone || 'N/A',
      transaction_id: issue.transaction_id || order.payment_details || 'N/A',
       reason: issue.reason || 'Order Issue',
       description: issue.description || 'No description',
       status: issue.status || 'pending',
       admin_response: issue.admin_response || null,
       admin_uploaded_image: issue.admin_uploaded_image || null,
      created_at: issue.created_at || order.created_at,
      updated_at: issue.updated_at || order.updated_at,
    });
  });
});


  
      setOrderIssues(mappedData);
    } catch (error) {
    //  console.error('Error fetching order issues:', error);
      toast({
        title: "Error",
        description: "Failed to fetch order issues",
      });
    }
  };

  const fetchAllIssues = async () => {
    setLoading(true);
    await Promise.all([fetchPaymentIssues(), fetchOrderIssues()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllIssues();
  }, []);

  const filterIssues = (issues: (AdminPaymentIssue | AdminOrderIssue)[]) => {
    return issues.filter(issue => {
      const matchesSearch = 
        issue.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.user_email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };

  const getStatusCounts = (issues: (AdminPaymentIssue | AdminOrderIssue)[]) => {
    const counts = {
      all: issues.length,
      pending: issues.filter(i => i.status === 'pending').length,
      'in-progress': issues.filter(i => i.status === 'in-progress').length,
      resolved: issues.filter(i => i.status === 'resolved').length,
      rejected: issues.filter(i => i.status === 'rejected').length,
    };
    return counts;
  };

  const paymentStatusCounts = getStatusCounts(paymentIssues);
  const orderStatusCounts = getStatusCounts(orderIssues);
  const filteredPaymentIssues = filterIssues(paymentIssues);
  const filteredOrderIssues = filterIssues(orderIssues);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading issues...</span>
        </div>
      </div>
    );
  }

  return (
  <div className="space-y-6 bg-black text-white min-h-screen pb-10">
    <ModernAdminLayout title="Payments">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-white">Issue Management</h1>
          <p className="text-gray-400 text-sm">Manage payment and order-related issues</p>
        </div>

        <Button 
          onClick={fetchAllIssues} 
          variant="outline"
          className="flex items-center gap-2 border-gray-600 text-white hover:bg-neutral-900"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-neutral-900 border border-neutral-700">
          <CardContent className="p-5">
            <p className="text-gray-400 text-sm">Total Payment Issues</p>
            <p className="text-2xl font-bold">{paymentIssues.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border border-neutral-700">
          <CardContent className="p-5">
            <p className="text-gray-400 text-sm">Total Order Issues</p>
            <p className="text-2xl font-bold">{orderIssues.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border border-neutral-700">
          <CardContent className="p-5">
            <p className="text-gray-400 text-sm">Pending</p>
            <p className="text-2xl font-bold text-red-500">
              {paymentStatusCounts.pending + orderStatusCounts.pending}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border border-neutral-700">
          <CardContent className="p-5">
            <p className="text-gray-400 text-sm">Resolved</p>
            <p className="text-2xl font-bold text-green-500">
              {paymentStatusCounts.resolved + orderStatusCounts.resolved}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="bg-neutral-900 border border-neutral-700">
        <CardContent className="p-5 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search order, name, email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-neutral-800 text-white border-neutral-600"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-44 bg-neutral-800 border border-neutral-600 rounded-md text-white px-3 py-2"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="payment" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-neutral-900 border border-neutral-700">
          <TabsTrigger 
            value="payment" 
            className="text-white data-[state=active]:bg-red-600"
          >
            💳 Payment Issues ({paymentStatusCounts.all})
          </TabsTrigger>
          <TabsTrigger 
            value="order" 
            className="text-white data-[state=active]:bg-red-600"
          >
            ⚠️ Order Issues ({orderStatusCounts.all})
          </TabsTrigger>
        </TabsList>

        {/* Payment Issues */}
        <TabsContent value="payment" className="space-y-4 py-4">
          {filteredPaymentIssues.length === 0 ? (
            <NoIssuesCard type="payment" />
          ) : (
            filteredPaymentIssues.map(issue => (
              <PaymentIssueResponseForm key={issue.id} issue={issue} onUpdate={fetchPaymentIssues} />
            ))
          )}
        </TabsContent>

        {/* Order Issues */}
        <TabsContent value="order" className="space-y-4 py-4">
          {filteredOrderIssues.length === 0 ? (
            <NoIssuesCard type="order" />
          ) : (
            filteredOrderIssues.map(issue => (
              <OrderIssueResponseForm key={issue.id} issue={issue as any} onUpdate={fetchOrderIssues} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </ModernAdminLayout>
  </div>
);

}

function NoIssuesCard({ type }: { type: string }) {
  return (
    <Card className="bg-neutral-900 border border-neutral-700 p-10 text-center">
      <p className="text-gray-400 text-lg">No {type} issues found.</p>
      <p className="text-gray-500 text-sm">Try adjusting search or filters.</p>
    </Card>
  );
}
