import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';  
import { useAuth } from '@/context/AuthContext';
import { Order, CartItem } from '@/lib/types';
import { format } from 'date-fns';
import { Package, Truck, CheckCircle, XCircle } from 'lucide-react';

const OrderHistory = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [currentUser]);

  const fetchOrders = async () => {
    if (!currentUser) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedOrders: Order[] = data?.map((order) => {
        // Safely parse items with proper type checking
        let parsedItems: CartItem[] = [];
        try {
          if (Array.isArray(order.items)) {
            parsedItems = (order.items as unknown[]).map((item: any) => ({
              id: item?.id || '',
              product_id: item?.product_id || '',
              productId: item?.productId,
              name: item?.name || '',
              image: item?.image,
              price: item?.price || 0,
              sizes: Array.isArray(item?.sizes) ? item.sizes : [],
              color: item?.color,
              metadata: item?.metadata
            }));
          }
        } catch (e) {
          console.error('Error parsing order items:', e);
          parsedItems = [];
        }

        return {
          id: order.id,
          orderNumber: order.order_number,
          order_number: order.order_number,
          userId: order.user_id,
          user_id: order.user_id,
          items: parsedItems,
          total: order.total,
          status: order.status as Order['status'],
          paymentMethod: order.payment_method,
          payment_method: order.payment_method,
          shippingAddress: order.shipping_address,
          shipping_address: order.shipping_address,
          deliveryFee: order.delivery_fee,
          delivery_fee: order.delivery_fee,
          createdAt: order.created_at,
          created_at: order.created_at,
          updatedAt: order.updated_at,
          updated_at: order.updated_at,
          date: order.created_at,
          payment_details: order.payment_details,
          payment_status: order.payment_status,
          reward_points_earned: order.reward_points_earned || 0,
          reward_points_used: (order.reward_points_used as any)?.points || 0,
        };
      }) || [];

      setOrders(transformedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Package className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Order History</h2>
        <p className="text-gray-500">{orders.length} orders</p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500">Your order history will appear here once you make your first purchase.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">Order #{order.orderNumber}</CardTitle>
                    <p className="text-sm text-gray-500">
                      {format(new Date(order.createdAt), 'MMMM d, yyyy')}
                    </p>
                  </div>
                  <Badge className={getStatusColor(order.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(order.status)}
                      {order.status}
                    </div>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Items ({Array.isArray(order.items) ? order.items.length : 0})</h4>
                    <div className="space-y-2">
                      {Array.isArray(order.items) && order.items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span>{item.name}</span>
                          <span>{formatPrice(item.price * (item.quantity || 1))}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center font-medium">
                      <span>Total</span>
                      <span>{formatPrice(order.total)}</span>
                    </div>
                    {order.deliveryFee && (
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>Delivery Fee</span>
                        <span>{formatPrice(order.deliveryFee)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    {order.status === 'delivered' && (
                      <Button variant="outline" size="sm">
                        Reorder
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
