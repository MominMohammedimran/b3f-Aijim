
import React, { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift, Star, Trophy, Coins } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Order, CartItem } from '@/lib/types';

const RewardsSection = () => {
  const [rewardPoints, setRewardPoints] = useState(0);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      fetchRewardPoints();
      fetchOrders();
    }
  }, [currentUser]);

  const fetchRewardPoints = async () => {
    if (!currentUser) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('reward_points')
        .eq('id', currentUser.id)
        .single();

      if (error) throw error;
      setRewardPoints(data?.reward_points || 0);
    } catch (error) {
      console.error('Error fetching reward points:', error);
    }
  };

  const fetchOrders = async () => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', currentUser.id)
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

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 mt-10">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 mt-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-4">Rewards Section</h1>
          <p className="text-center text-gray-600">
            Earn and redeem reward points with every purchase
          </p>
        </div>

        {/* Reward Points Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Points</CardTitle>
              <Coins className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rewardPoints}</div>
              <p className="text-xs text-blue-100">
                Worth ₹{rewardPoints} in discounts
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
              <Trophy className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {orders.reduce((sum, order) => sum + (order.reward_points_earned || 0), 0)}
              </div>
              <p className="text-xs text-green-100">
                Lifetime earnings
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Used</CardTitle>
              <Gift className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {orders.reduce((sum, order) => sum + ((order.reward_points_used as any)?.points || 0), 0)}
              </div>
              <p className="text-xs text-orange-100">
                Points redeemed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How it Works */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              How Reward Points Work
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Earning Points</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Earn 1 point for every ₹10 spent</li>
                  <li>• Bonus points on special occasions</li>
                  <li>• Extra points for reviews and referrals</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Using Points</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• 1 point = ₹1 discount</li>
                  <li>• Minimum 100 points required to redeem</li>
                  <li>• Use points at checkout to reduce total</li>
                  <li>• Points can cover up to 50% of order value</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order History with Rewards */}
        <Card>
          <CardHeader>
            <CardTitle>Order History & Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No orders found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">#{order.orderNumber}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={order.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                          {order.status}
                        </Badge>
                        <p className="text-sm font-semibold mt-1">₹{Number(order.total).toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex gap-4">
                        {(order.reward_points_earned || 0) > 0 && (
                          <span className="text-green-600 flex items-center gap-1">
                            <Coins className="h-4 w-4" />
                            +{order.reward_points_earned} points earned
                          </span>
                        )}
                        {((order.reward_points_used as any)?.points || 0) > 0 && (
                          <div className="text-xs text-red-400 mt-1">
                            -{(order.reward_points_used as any)?.points || 0} points used
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default RewardsSection;
