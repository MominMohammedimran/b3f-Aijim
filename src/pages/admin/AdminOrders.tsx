import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Search, Download, Eye, Trash2, Award, Plus } from 'lucide-react';
import OrderDetailsDialog from '../../components/admin/OrderDetailsDialog';
import AdminOrderDownload from '../../components/admin/AdminOrderDownload';
import AdminDownloadDesign from '../../components/admin/AdminDownloadDesign';
import PaymentStatusUpdateDialog from '../../components/admin/PaymentStatusUpdateDialog';
import RewardPointsUpdateDialog from '../../components/admin/orders/RewardPointsUpdateDialog';
import CreateOrderDialog from '../../components/admin/CreateOrderDialog';
import ModernAdminLayout from '../../components/admin/ModernAdminLayout';
import { sendOrderStatusEmail } from '../../components/admin/OrderStatusEmailService';

interface Order {
  id: string;
  order_number: string;
  user_email: string;
  total: number;
  status: string;
  created_at: string;
  items: any[];
  shipping_address: any;
  payment_method: string;
  payment_status?: string;
    coupon_code?: {code: string, discount_amount: number};
    reward_points_used?: {points: number, value_used: number};
  reward_points_earned?: number;
   delivery_fee?: number;
}

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showPaymentUpdate, setShowPaymentUpdate] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<Order | null>(null);
  const [showRewardPointsUpdate, setShowRewardPointsUpdate] = useState(false);
  const [selectedOrderForRewards, setSelectedOrderForRewards] = useState<Order | null>(null);
  const [showCreateOrder, setShowCreateOrder] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const transformedOrders = data.map((order: any) => ({
          id: order.id,
          order_number: order.order_number,
          user_email: order.user_email || 'N/A',
          total: order.total,
          status: order.status,
          created_at: order.created_at,
          items: Array.isArray(order.items) ? order.items : 
                 (typeof order.items === 'string' ? JSON.parse(order.items || '[]') : []),
          shipping_address: order.shipping_address,
          payment_method: order.payment_method,
          payment_status: order.payment_status,
          reward_points_earned: order.reward_points_earned || 0,
          coupon_code:order.coupon_code?.code||"",
          coupon_code_discount:order.coupon_code?.discount_amount||0,
          reward_points_used:order.reward_points_used?.value_used||0,
          reward_points_used_available:order.reward_points?.points||0,
          delivery_fee:order.delivery_fee||0,
          
        }));

        setOrders(transformedOrders);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      const updatedOrder = orders.find(order => order.id === orderId);

      if (updatedOrder) {
        const shipping = updatedOrder.shipping_address;
        const emailToSend = shipping?.email || updatedOrder.user_email;

        if (emailToSend && emailToSend !== 'N/A') {
          
          try {
            await sendOrderStatusEmail({
              orderId: updatedOrder.order_number,
              customerEmail: emailToSend,
              customerName: shipping?.name || shipping?.fullName || 'Customer',
              status: newStatus,
              orderItems: updatedOrder.items || [],
              totalAmount: updatedOrder.total || 0,
              shippingAddress: {
                name: shipping?.fullName || shipping?.name || 'Customer',
                phone: shipping?.phone || '',
                email: emailToSend,
                address: shipping?.address || '',
                city: shipping?.city || '',
                state: shipping?.state || '',
                zipCode: shipping?.zipCode || '',
                country: shipping?.country || ''
              },
              paymentMethod: updatedOrder.payment_method,
              couponCode:updatedOrder.coupon_code?.code||"",
              couponDiscount:updatedOrder.coupon_code?.discount_amount||0,
              rewardPointsUsed:updatedOrder.reward_points_used?.value_used||0,
              deliveryFee:updatedOrder.delivery_fee,
            });
            
            
           
          } catch (emailError) {
            console.error('Failed to send status update email:', emailError);
            toast.error('Status updated but failed to send email notification');
          }
        } else {
          toast.warning('⚠️ No email found for this customer');
        }
      }

      // Update state locally
      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      toast.success('✅ Order status updated');
    } catch (err) {
      console.error('❌ Error updating status:', err);
      toast.error('Failed to update order status');
    }
  };

  const handlePaymentUpdate = (order: Order) => {
    setSelectedOrderForPayment(order);
    setShowPaymentUpdate(true);
  };

  const handlePaymentUpdateComplete = () => {
    setShowPaymentUpdate(false);
    setSelectedOrderForPayment(null);
    fetchOrders(); // Refresh orders after payment update
  };

  const handleRewardPointsUpdate = (order: Order) => {
    setSelectedOrderForRewards(order);
    setShowRewardPointsUpdate(true);
  };

  const handleRewardPointsUpdateComplete = () => {
    setShowRewardPointsUpdate(false);
    setSelectedOrderForRewards(null);
    fetchOrders(); // Refresh orders after reward points update
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;

    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev => prev.filter(order => order.id !== orderId));
      toast.success('Order deleted successfully');
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
    }
  };

  const handleExportOrders = () => {
    const csvContent = [
      ['Order Number', 'Date', 'Customer', 'Status', 'Total'],
      ...orders.map(order => [
        order.order_number,
        new Date(order.created_at).toLocaleDateString(),
        order.user_email,
        order.status,
        order.total.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  

 
  const filteredOrders = orders.filter(order =>
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ModernAdminLayout 
      title="Orders Management" 
      subtitle="Manage customer orders and track status"
      actionButton={
          <div className="flex gap-2">
            <Button onClick={() => setShowCreateOrder(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              <Plus size={16} />
              Create Order
            </Button>
            <Button variant="outline" onClick={handleExportOrders} className="gap-2">
              <Download size={16} />
              Export Orders
            </Button>
          </div>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2 text-sm text-gray-600">
            <Badge variant="outline">{filteredOrders.length} orders</Badge>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-semibold text-gray-800 hover:bg-gray-200 ">Order</TableHead>
                    <TableHead className="font-semibold  text-gray-800 hover:bg-gray-200">Date</TableHead>
                    <TableHead className="font-semibold  text-gray-800 hover:bg-gray-200">Customer</TableHead>
                    <TableHead className="font-semibold  text-gray-800 hover:bg-gray-200">Payment</TableHead>
                    <TableHead className="font-semibold text-gray-800 hover:bg-gray-200">Payment Update</TableHead>
                    <TableHead className="font-semibold text-gray-800 hover:bg-gray-200">Rewards</TableHead>
                    <TableHead className="font-semibold text-gray-800  hover:bg-gray-200">Status</TableHead>
                    <TableHead className="font-semibold text-gray-800 text-right hover:bg-gray-200">Total</TableHead>
                    <TableHead className="font-semibold text-gray-800 text-center hover:bg-gray-200">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-gray-800">
                      <TableCell className="font-medium">{order.order_number}</TableCell>
                      <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{order.user_email}</TableCell>
                      <TableCell>
                        <Badge variant={order.payment_status === 'paid' ? 'default' : 'destructive'} className="text-xs">
                          {order.payment_status || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePaymentUpdate(order)}
                          className="text-xs px-2 py-1 h-8"
                        >
                          Update Payment
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-xs">{order.reward_points_earned || 0} pts</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRewardPointsUpdate(order)}
                            className="h-6 w-6 p-0"
                            title="Update reward points"
                          >
                            <Award size={12} />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'} className="text-xs">
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">₹{order.total}</TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-2 flex-wrap">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleViewOrder(order)}
                            className="h-8 w-8 p-0"
                          >
                            <Eye size={14} /> Update 
                          </Button>
                        
                          {order.status !== 'delivered' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusUpdate(order.id, 'delivered')}
                              className="text-xs px-2 py-1 h-8"
                            >
                              Mark Delivered
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {filteredOrders.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'No orders found matching your search.' : 'No orders found.'}
              </div>
            )}
          </div>
        )}

        {showOrderDetails && selectedOrder && (
          <OrderDetailsDialog
            order={selectedOrder}
            open={showOrderDetails}
            onOpenChange={(open) => setShowOrderDetails(open)}
            onStatusUpdate={handleStatusUpdate}
            onDeleteOrder={() => handleDeleteOrder(selectedOrder.id)}
          />
        )}

        {showPaymentUpdate && selectedOrderForPayment && (
          <PaymentStatusUpdateDialog
            isOpen={showPaymentUpdate}
            onClose={() => setShowPaymentUpdate(false)}
            order={selectedOrderForPayment}
            onUpdate={handlePaymentUpdateComplete}
          />
        )}

        {showRewardPointsUpdate && selectedOrderForRewards && (
          <RewardPointsUpdateDialog
            isOpen={showRewardPointsUpdate}
            onClose={() => setShowRewardPointsUpdate(false)}
            order={selectedOrderForRewards}
            onUpdate={handleRewardPointsUpdateComplete}
          />
        )}

        {showCreateOrder && (
          <CreateOrderDialog
            isOpen={showCreateOrder}
            onClose={() => setShowCreateOrder(false)}
            onOrderCreated={fetchOrders}
          />
        )}
      </div>
    </ModernAdminLayout>
  );
};

export default AdminOrders;