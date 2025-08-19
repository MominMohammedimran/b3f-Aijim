import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import Layout from '../components/layout/Layout';
import OrdersFilter from '../components/orders/OrdersFilter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { Link, useNavigate, } from 'react-router-dom';

const Orders = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnlySuccessful, setShowOnlySuccessful] = useState(false);

  const fetchOrders = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter orders to show only paid orders
      const filteredOrders = data?.filter(order => {
        // Only show orders with successful payments
        return order.payment_status === 'paid';
      }) || [];

      setOrders(filteredOrders);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleRetryPayment = async (order: any) => {
    try {
      // Redirect to payment page with order data
      navigate('/payment', {
        state: {
          shippingAddress: order.shipping_address,
          cartItems: order.items,
          totalPrice: order.total,
          orderId: order.id
        }
      });
    } catch (error: any) {
      console.error('Error retrying payment:', error);
      toast.error('Failed to retry payment');
    }
  };

  const getStatusBadge = (order: any) => {
    // Check payment status first
    if (order.payment_status === 'pending' || order.payment_status === 'failed') {
      return (
        <Badge variant="destructive">
          Payment Pending
        </Badge>
      );
    }
    
    // If payment is successful, show order status
    if (order.payment_status === 'paid') {
      const orderStatus = order.order_status || order.status;
      return (
        <Badge variant={orderStatus === 'delivered' ? 'default' : 'secondary'}>
          {orderStatus}
        </Badge>
      );
    }

    // Fallback to old status
    return (
      <Badge variant={order.status === 'delivered' ? 'default' : 'secondary'}>
        {order.status}
      </Badge>
    );
  };

  const shouldShowPayNow = (order: any) => {
    return order.payment_status === 'pending' || order.payment_status === 'failed';
  };

  useEffect(() => {
    fetchOrders();
  }, [currentUser, showOnlySuccessful]);

  if (!currentUser) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          
        </div>
         <div className="mt-6 space-y-2 pt-3">
                      <p className="text-gray-500 text-lg mb-2">You are not signed in.</p>
                      <Link to="/signin">
                        <Button className='mt-2 text-xl bg-white text-gray-800' variant="outline">Sign In</Button>
                      </Link>
                    </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>
        
        <OrdersFilter 
          showOnlySuccessful={showOnlySuccessful}
          onToggleFilter={setShowOnlySuccessful}
        />

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <div className="text-center py-8">
                        <p className="text-gray-600 mb-4">No orders found</p>
                        <Link to="/"><Button>Start Shopping</Button></Link>
                      </div>
          </div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-500">
                {showOnlySuccessful ? 'No successfully paid orders found.' : 'No orders found.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg">Order #{order.order_number}</CardTitle>
                    <div className="flex gap-2 items-center">
                      {getStatusBadge(order)}
                      {order.payment_status === 'paid' && (
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          Paid
                        </Badge>
                      )}
                      {shouldShowPayNow(order) && (
                        <Button 
                          size="sm" 
                          onClick={() => handleRetryPayment(order)}
                          className="ml-2"
                        >
                          Pay Now
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p><strong>Date:</strong> {formatDate(order.created_at)}</p>
                      <p><strong>Total:</strong> ₹{order.total}</p>
                      <p><strong>Payment Method:</strong> {order.payment_method === 'razorpay' ? 'Razorpay' : order.payment_method}</p>
                    </div>
                    <div>
                      <p><strong>Items:</strong> {order.items?.length || 0}</p>
                      <p><strong>Payment Status:</strong> {order.payment_status || 'N/A'}</p>
                      <p><strong>Order Status:</strong> {order.order_status || order.status}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Orders;
