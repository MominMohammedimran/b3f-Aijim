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
      console.error('Error fetching payment issues:', error);
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
      console.error('Error fetching order issues:', error);
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
    <div className="space-y-6">
       
<ModernAdminLayout 
title="Payments">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Issue Management</h1>
          <p className="text-gray-600 mt-1">Manage payment and order-related issues</p>
        </div>
        <Button onClick={fetchAllIssues} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Payment Issues</p>
                <p className="text-2xl font-bold">{paymentIssues.length}</p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Order Issues</p>
                <p className="text-2xl font-bold">{orderIssues.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Issues</p>
                <p className="text-2xl font-bold">{paymentStatusCounts.pending + orderStatusCounts.pending}</p>
              </div>
              <Badge variant="secondary">Pending</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Resolved Issues</p>
                <p className="text-2xl font-bold">{paymentStatusCounts.resolved + orderStatusCounts.resolved}</p>
              </div>
              <Badge variant="default">Resolved</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by order number, user name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 bg-gray-800 text-white  rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues Tabs */}
      <Tabs defaultValue="payment" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payment Issues ({paymentStatusCounts.all})
          </TabsTrigger>
          <TabsTrigger value="order" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Order Issues ({orderStatusCounts.all})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payment" className="space-y-4">
          {filteredPaymentIssues.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Payment Issues Found</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'No payment issues match your current filters.' 
                    : 'No payment issues have been submitted yet.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPaymentIssues.map((issue) => (
                <PaymentIssueResponseForm
                  key={issue.id}
                  issue={issue as any}
                  onUpdate={fetchPaymentIssues}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="order" className="space-y-4">
          {filteredOrderIssues.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Order Issues Found</h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'No order issues match your current filters.' 
                    : 'No order issues have been submitted yet.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOrderIssues.map((issue) => (
                <OrderIssueResponseForm
                  key={issue.id}
                  issue={issue as any}
                  onUpdate={fetchOrderIssues}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
          </ModernAdminLayout>
    </div>

  );
}