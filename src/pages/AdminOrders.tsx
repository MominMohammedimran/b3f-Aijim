
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Search, Edit, Package, Gift, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Order, CartItem } from '@/lib/types';
import { toast } from 'sonner';

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRewardDialog, setShowRewardDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [rewardPoints, setRewardPoints] = useState(0);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedOrders: Order[] = data?.map(order => {
        // Safely parse items
        let parsedItems: CartItem[] = [];
        try {
          if (Array.isArray(order.items)) {
            parsedItems = order.items.map((item: any) => ({
              id: item.id || '',
              product_id: item.product_id || '',
              name: item.name || '',
              price: Number(item.price) || 0,
              sizes: Array.isArray(item.sizes) ? item.sizes : [],
              image: item.image || '',
              metadata: item.metadata || {}
            }));
          }
        } catch (error) {
          console.error('Error parsing order items:', error);
        }

        return {
          id: order.id,
          orderNumber: order.order_number,
          order_number: order.order_number,
          userId: order.user_id,
          user_id: order.user_id,
          items: parsedItems,
          total: Number(order.total),
          status: order.status as Order['status'],
          paymentMethod: order.payment_method,
          payment_method: order.payment_method,
          shippingAddress: order.shipping_address,
          shipping_address: order.shipping_address,
          deliveryFee: order.delivery_fee,
          delivery_fee: order.delivery_fee,
          createdAt: order.created_at,
          created_at: order.created_at,
          date: order.created_at,
          payment_status: order.payment_status,
          reward_points_used: (order.reward_points_used as any)?.points || 0,
          reward_points_earned: order.reward_points_earned || 0
        };
      }) || [];

      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRewardPoints = (order: Order) => {
    setSelectedOrder(order);
    setRewardPoints(order.reward_points_earned || 0);
    setShowRewardDialog(true);
  };

  const handleSaveRewardPoints = async () => {
    if (!selectedOrder) return;

    try {
      const { error } = await supabase
        .from('orders')
        .update({ reward_points_earned: rewardPoints })
        .eq('id', selectedOrder.id);

      if (error) throw error;

      // Update user's total reward points
      const { error: profileError } = await supabase.rpc('update_user_reward_points', {
        user_id: selectedOrder.userId,
        points_to_add: rewardPoints - (selectedOrder.reward_points_earned || 0)
      });

      if (profileError) console.warn('Error updating user points:', profileError);

      toast.success('Reward points updated successfully');
      setShowRewardDialog(false);
      fetchOrders();
    } catch (error) {
      console.error('Error updating reward points:', error);
      toast.error('Failed to update reward points');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredOrders = orders.filter(order =>
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.payment_status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <AdminLayout title="Orders">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Orders">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="bg-white">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">#{order.orderNumber}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                    <p className="text-lg font-semibold mt-1">₹{Number(order.total).toFixed(2)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Payment Status</p>
                    <p className="font-medium">{order.payment_status || 'Pending'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Payment Method</p>
                    <p className="font-medium">{order.paymentMethod || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Points Used</p>
                    <p className="font-medium">{order.reward_points_used?.points || 0} points</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Points Earned</p>
                    <p className="font-medium flex items-center gap-1">
                      {order.reward_points_earned || 0} points
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUpdateRewardPoints(order)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    </p>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-600">
                    {Array.isArray(order.items) ? order.items.length : 0} item(s)
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUpdateRewardPoints(order)}
                    >
                      <Gift className="h-4 w-4 mr-1" />
                      Update Rewards
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredOrders.length === 0 && (
          <Card className="bg-white">
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No orders found</p>
            </CardContent>
          </Card>
        )}

        {/* Update Reward Points Dialog */}
        <Dialog open={showRewardDialog} onOpenChange={setShowRewardDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Update Reward Points</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="rewardPoints">Reward Points Earned</Label>
                <Input
                  id="rewardPoints"
                  type="number"
                  value={rewardPoints}
                  onChange={(e) => setRewardPoints(Number(e.target.value))}
                  min="0"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Order: #{selectedOrder?.orderNumber} • Total: ₹{selectedOrder?.total}
                </p>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowRewardDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveRewardPoints}>
                  Save Points
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default AdminOrders;
