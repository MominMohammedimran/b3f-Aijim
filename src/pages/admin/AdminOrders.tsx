import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Search, Download, Eye, Award, Plus } from 'lucide-react';

import OrderDetailsDialog from '../../components/admin/OrderDetailsDialog';
import PaymentStatusUpdateDialog from '../../components/admin/PaymentStatusUpdateDialog';
import RewardPointsUpdateDialog from '../../components/admin/orders/RewardPointsUpdateDialog';
import CreateOrderDialog from '../../components/admin/CreateOrderDialog';
import ModernAdminLayout from '../../components/admin/ModernAdminLayout';
// import { sendOrderStatusEmail } from '../../components/admin/OrderStatusEmailService';

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
  coupon_code?: { code: string; discount_amount: number };
  reward_points_used?: { points: number; value_used: number };
  reward_points_earned?: number;
  delivery_fee?: number;
  courier?: any;
  trackingNote?: string;
}

const statusColors: Record<string, string> = {
  delivered: 'default',
  shipped: 'secondary',
  'on-the-way': 'warning',
  'out-for-delivery': 'warning',
  cancelled: 'destructive',
  'return-picked': 'destructive',
  processing: 'secondary',
  undelivered: 'destructive',
};

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
          items: Array.isArray(order.items)
            ? order.items
            : typeof order.items === 'string'
            ? JSON.parse(order.items || '[]')
            : [],
          shipping_address: order.shipping_address,
          payment_method: order.payment_method,
          payment_status: order.payment_status,
          reward_points_earned: order.reward_points_earned || 0,
          coupon_code: order.coupon_code?.code || '',
          coupon_code_discount: order.coupon_code?.discount_amount || 0,
          reward_points_used: order.reward_points_used?.value_used || 0,
          reward_points_used_available: order.reward_points?.points || 0,
          delivery_fee: order.delivery_fee || 0,
          courier: order.courier,
          trackingNote: order.trackingNote || '',
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
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev =>
        prev.map(order => (order.id === orderId ? { ...order, status: newStatus } : order))
      );

      toast.success('✅ Order status updated');
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error('Failed to update order status');
    }
  };

  const fetchDelhiveryStatus = async (awb: string, orderId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('track-delhivery', {
        body: JSON.stringify({ awb, orderId }),
      });

      if (error || !data?.data?.ShipmentData?.[0]?.Shipment) {
        toast.error('Failed to fetch tracking status');
        return null;
      }

      const shipment = data.data.ShipmentData[0].Shipment;
      console.log(shipment)

      const statusMap: Record<string, string> = {
        Dispatched: 'shipped',
        'In transit': 'on-the-way',
        'Out for Delivery': 'out-for-delivery',
        Delivered: 'delivered',
        Undelivered: 'undelivered',
        RTO: 'return-picked',
        Cancelled: 'cancelled',
      };

      const currentStatus = statusMap[shipment.Status?.Status || ''] || 'processing';
      const note = shipment.Status?.Instructions || 'N/A';

      const { error: updateError } = await supabase
        .from('orders')
        .update({  trackingNote: note, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (updateError) {
        toast.error('Failed to update order status in database');
        console.error(updateError);
      } else {
        setOrders(prev =>
          prev.map(order =>
            order.id === orderId ? { ...order, status: currentStatus, trackingNote: note } : order
          )
        );
        toast.success(`✅ Order status updated to "${currentStatus}"`);
      }

      return { status: currentStatus, note };
    } catch (err) {
      console.error(err);
      toast.error('Error fetching Delhivery status');
      return null;
    }
  };

  const handlePaymentUpdate = (order: Order) => {
    setSelectedOrderForPayment(order);
    setShowPaymentUpdate(true);
  };

  const handlePaymentUpdateComplete = () => {
    setShowPaymentUpdate(false);
    setSelectedOrderForPayment(null);
    fetchOrders();
  };

  const handleRewardPointsUpdate = (order: Order) => {
    setSelectedOrderForRewards(order);
    setShowRewardPointsUpdate(true);
  };

  const handleRewardPointsUpdateComplete = () => {
    setShowRewardPointsUpdate(false);
    setSelectedOrderForRewards(null);
    fetchOrders();
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;

    try {
      const { error } = await supabase.from('orders').delete().eq('id', orderId);
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
      [
        'Order Number',
        'Date',
        'Customer',
        'Status',
        'Payment',
        'Total',
        'Reward Points Used',
        'Reward Points Earned',
        'Coupon Code',
        'Courier AWB',
      ],
      ...orders.map(order => [
        order.order_number,
        new Date(order.created_at).toLocaleDateString(),
        order.user_email,
        order.status,
        order.payment_status || 'N/A',
        order.total.toString(),
        order.reward_points_used,
        order.reward_points_earned,
        order.coupon_code || '',
        order.courier?.awb || '',
      ]),
    ]
      .map(row => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredOrders = orders.filter(
    order =>
      order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paidOrders = filteredOrders.filter(order => order.payment_status === 'paid');
  const otherOrders = filteredOrders.filter(order => order.payment_status !== 'paid');

  return (
    <ModernAdminLayout
      title="Orders Management"
      subtitle="Manage customer orders and track status"
      actionButton={
        <div className="flex gap-2">
          <Button
            onClick={() => setShowCreateOrder(true)}
            className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
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
              onChange={e => setSearchTerm(e.target.value)}
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
          <div className="space-y-8">
            {paidOrders.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Paid Orders</h3>
                <OrderTable
                  orders={paidOrders}
                  handleViewOrder={handleViewOrder}
                  fetchDelhiveryStatus={fetchDelhiveryStatus}
                  handlePaymentUpdate={handlePaymentUpdate}
                  handleRewardPointsUpdate={handleRewardPointsUpdate}
                  handleStatusUpdate={handleStatusUpdate}
                  setOrders={setOrders}
                />
              </div>
            )}

            {otherOrders.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Other Orders</h3>
                <OrderTable
                  orders={otherOrders}
                  handleViewOrder={handleViewOrder}
                  fetchDelhiveryStatus={fetchDelhiveryStatus}
                  handlePaymentUpdate={handlePaymentUpdate}
                  handleRewardPointsUpdate={handleRewardPointsUpdate}
                  handleStatusUpdate={handleStatusUpdate}
                  setOrders={setOrders}
                />
              </div>
            )}

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
            onOpenChange={setShowOrderDetails}
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

// ---------------- Helper Table -----------------
interface OrderTableProps {
  orders: Order[];
  fetchDelhiveryStatus: (awb: string, orderId: string) => Promise<{ status: string; note: string } | null>;
  handleViewOrder: (order: Order) => void;
  handlePaymentUpdate: (order: Order) => void;
  handleRewardPointsUpdate: (order: Order) => void;
  handleStatusUpdate: (orderId: string, newStatus: string) => void;
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  setOrders,
  handleViewOrder,
  handlePaymentUpdate,
  fetchDelhiveryStatus,
  handleRewardPointsUpdate,
  handleStatusUpdate,
}) => (
  <div className="rounded-lg border overflow-hidden">
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 hover:bg-gray-50">
            <TableHead>Order</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Payment Update</TableHead>
            <TableHead>Delhivery</TableHead>
            <TableHead>Rewards</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map(order => (
            <TableRow key={order.id} className="">
              <TableCell className="font-medium">{order.order_number}</TableCell>
              <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
              <TableCell className="max-w-[200px] truncate">{order.user_email}</TableCell>
              <TableCell>
                <Badge
                  variant={order.payment_status === 'paid' ? 'default' : 'destructive'}
                  className="text-xs"
                >
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
              <span className="text-xs">{order.trackingNote || 'N/A'}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (!order.courier?.awb) {
                      toast.error('AWB not found for this order');
                      return;
                    }
                    const result = await fetchDelhiveryStatus(order.courier.awb, order.id);
                    if (!result) return;
                    handleStatusUpdate(order.id, result.status);
                    setOrders(prev =>
                      prev.map(o => (o.id === order.id ? { ...o, trackingNote: result.note } : o))
                    );
                  }}
                  className="text-xs px-2 py-1 h-8"
                >
                  Check
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
                <Badge variant={statusColors[order.status] || 'secondary'} className="text-xs">
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
                    <Eye size={14} />
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
  </div>
);
