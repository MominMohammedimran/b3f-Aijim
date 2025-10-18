import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import SEOHelmet from '@/components/seo/SEOHelmet';
import useSEO from '@/hooks/useSEO';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { Order, CartItem } from '../lib/types';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { updateInventoryFromPaidOrders } from '@/hooks/useProductInventory';

const OrderHistory = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const seo = useSEO('/orders');

  // tick every second
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) return;
      try {
        setLoading(true);

        // Update inventory from paid orders first
        await updateInventoryFromPaidOrders();

        // auto delete expired pending orders from DB
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
        await supabase
          .from('orders')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('payment_status', 'pending')
          .lt('created_at', twentyFourHoursAgo.toISOString());

        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const transformedOrders: Order[] = (data || []).map((order: any) => {
          let parsedItems: CartItem[] = [];
          try {
            if (Array.isArray(order.items)) {
              parsedItems = order.items.map((item: any) => ({
                id: item.id || '',
                product_id: item.product_id || '',
                productId: item.productId,
                name: item.name || '',
                image: item.image,
                code: item.code || '',
                price: item.price || 0,
                sizes: Array.isArray(item.sizes) ? item.sizes : [],
                color: item.color,
                metadata: item.metadata,
              }));
            }
          } catch {
            parsedItems = [];
          }

          return {
            id: order.id,
            orderNumber: order.order_number,
            userId: order.user_id,
            items: parsedItems,
            total: order.total,
            status: order.status,
            paymentMethod: order.payment_method || 'razorpay',
            shippingAddress: order.shipping_address || {},
            deliveryFee: order.delivery_fee || 0,
            createdAt: order.created_at,
            date: order.created_at,
            payment_method: order.payment_method || 'razorpay',
            shipping_address: order.shipping_address || {},
            delivery_fee: order.delivery_fee || 0,
            created_at: order.created_at,
            reward_points_used: order.reward_points_used || 0,
            order_number: order.order_number,
            user_id: order.user_id,
            payment_status: order.payment_status || 'pending',
          };
        });

        setOrders(transformedOrders);
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  const handleRemoveOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('id', orderId);
      if (error) throw error;

      toast.success('Order cancelled');
      window.location.reload();
    } catch (err) {
      console.error(err);
      toast.error('Failed to cancel order');
    }
  };

  // countdown formatter
  const getCountdown = (createdAt: string) => {
    const expiry = new Date(createdAt).getTime() + 24 * 60 * 60 * 1000;
    const diff = expiry - now.getTime();
    if (diff <= 0) return { text: 'Expired', expired: true };

    const hrs = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    return { text: `${hrs}h ${mins}m ${secs}s`, expired: false };
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center pt-12 mb-12  h-64 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mt-10 mb-4"></div>
          {!currentUser && (
            <div className="mt-6 space-y-2">
              <p className="text-gray-500 text-lg mb-2">You are not signed in.</p>
              <Link to="/signin">
                <Button className="mt-2 text-xl bg-white text-gray-800" variant="outline">
                  Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHelmet {...{ ...seo, keywords: seo.keywords?.join(', ') }} />
      <div className="min-h-screen bg-black pt-20">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-white mb-1">Your Orders</h1>
          <p className="text-gray-400 mb-6">Track and manage all your orders in one place</p>

          {orders.length === 0 ? (
            <div className="bg-gray-800 p-12 text-center rounded-none">
              <h3 className="text-xl font-semibold text-white mb-2">No orders yet</h3>
              <Link to="/">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-none font-medium">
                  Start Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {orders.map(order => {
                const { text: countdown, expired } = getCountdown(order.createdAt);

                // 🚨 Skip showing if expired and status is pending/cancelled
                if (expired && (order.payment_status === 'pending' || order.status === 'cancelled')) {
                  return null;
                }

                return (
                <div key={order.id} className="bg-gray-800 p-4 rounded-none shadow-md">
  {/* Header */}
  <div className=" bg-gray-800 p-4 pb-1 rounded-none shadow-md border border-gray-700">
  {/* Left: Order Info */}
  <div>
    <h4 className="font-bold text-lg text-white tracking-wide">{order.order_number}</h4>
    
  </div>
  {/* Right: Status Section */}
  <div className="flex text-xs sm:items-center gap-2 sm:gap-3 mt-1 mb-1">
    {/* Payment Status */}
    <div className="flex items-center gap-1">
      <span className=" font-semibold text-[10px] text-gray-300 uppercase">Payment -</span>
      <span className="bg-red-600 text-[10px]  text-white  font-semibold px-2 rounded-sm shadow-sm uppercase tracking-wide">
        {order.payment_status || "N/A"}
      </span>
    </div>

    {/* Divider (only on desktop) */}
    <span className="hidden sm:inline text-gray-600">|</span>

    {/* Order Status */}
    <div className="flex items-center gap-1">
      <span className=" font-semibold text-[10px] text-gray-300 uppercase">Status -</span>
      <span className="bg-yellow-400 text-[10px] text-black  font-semibold px-2 rounded-sm shadow-sm uppercase tracking-wide">
        {order.status || "Unknown"}
      </span>
    </div>
  </div>
 

</div>

  


                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex gap-3 mb-2 bg-gray-900 p-2 rounded-none">
                        <img src={item.image} alt={item.name} className="h-14 w-12 object-cover" />
                        <div className="flex-1 text-white">
                          <p className="font-semibold line-clamp-1">{item.name}</p>
                          {item.sizes?.map((s, i) => (
                            <p key={i} className="flex text-xs font-semibold justify-evenly">
                              Size - {s.size} <span>|</span>  Qty - {s.quantity}
                            </p>
                          ))}
                            </div>
                       
                      </div>
                      
                    ))}

                    {order.payment_status === 'pending' && order.status !== 'cancelled' && (
  <p className="text-xs font-Roboto font-semibold text-yellow-400 text-center mt-2">
    Please complete payment within 
    <br/>
    <b className='text-white text-[10px] font-semibold'> 24 Hours | remaining {" "}{countdown}</b>
    <br/> this order will be deleted .
  </p>
)}

{order.status === 'cancelled' && (
  <p className="text-xs font-semibold text-yellow-400 text-center mt-2">
    Cancelled orders will be removed after 
    <br/>
    <b className='text-white text-[10px] font-semibold'> 24 Hours | remaining {" "}{countdown}</b>
    <br/>
    if u have any queries raise a issue
  </p>
)}


                    <div className="flex gap-2 mt-3">
                      <Link to={`/order-preview/${order.order_number}`} className="flex-1">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold w-full rounded-none">
                          Order Details
                        </Button>
                      </Link>
                      {['pending', 'processing', 'confirmed'].includes(order.status) && (
                        <Button
                          onClick={() => handleRemoveOrder(order.id)}
                          disabled={expired}
                          className={`flex-1 font-semibold rounded-none ${
                            expired
                              ? 'bg-gray-700 text-gray-400 cursor-not-allowed hidden'
                              : 'bg-red-600 hover:bg-red-700 text-white'
                          }`}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                    <p className='text-xs text-gray-400 mt-1'>
                      Placed on {new Date(order.created_at).toLocaleDataString('en-us',{
                        weekday:'long',
                      year:'numeric',
                    month:'long',
                  day:'numeric',                     })}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default OrderHistory;