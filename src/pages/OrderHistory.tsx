import React, { useState, useEffect } from 'react';
import { Link, useNavigate, } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import SEOHelmet from '@/components/seo/SEOHelmet';
import useSEO from '@/hooks/useSEO';

import { useAuth } from '../context/AuthContext';
import { supabase } from '../integrations/supabase/client';
import { Order, CartItem } from '../lib/types';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { X } from 'lucide-react';

const OrderHistory = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const seo = useSEO('/orders');
 

   const redirect = (product: { id: string,pd_name:string }) => {
  // Example route logic
 if (!currentUser) {
      navigate('/signin?redirectTo=/orders');
      return;
    }
    else if (!product.pd_name.toLowerCase().includes('custom printed')) {
    navigate(`/product/details/${product.id}`);
  }
};

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) return;
      try {
        setLoading(true);
        
        // First, clean up expired pending orders (older than 24 hours)
        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
        
        await supabase
          .from('orders')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('payment_status', 'pending')
          .lt('created_at', twentyFourHoursAgo.toISOString());

        // Then fetch remaining orders
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        const transformedOrders: Order[] = (data || []).map((order: any) => {
          // Parse items as CartItem[]
          let parsedItems: CartItem[] = [];
          try {
            if (Array.isArray(order.items)) {
              parsedItems = order.items.map((item: any) => ({
                id: item.id || '',
                product_id: item.product_id || '',
                productId: item.productId,
                name: item.name || '',
                image: item.image,
                code:item.code||'',
                price: item.price || 0,
                sizes: Array.isArray(item.sizes) ? item.sizes : [],
                color: item.color,
                metadata: item.metadata
              }));
            }
          } catch (e) {
            console.error('Error parsing order items:', e);
            parsedItems = [];
          }

          // Ensure status is properly typed
          const validStatuses = ['processing', 'confirmed', 'shipped', 'delivered', 'cancelled', 'pending','return-accepted','return-picked','return-warehouse','payment-refund','payment-refund-successfull'] as const;
          const orderStatus = validStatuses.includes(order.status as any) ? order.status : 'pending';

          return {
            id: order.id,
            orderNumber: order.order_number,
            userId: order.user_id,
            items: parsedItems,
            total: order.total,
            status: orderStatus as Order['status'],
            paymentMethod: order.payment_method || 'razorpay',
            shippingAddress: order.shipping_address || {},
            deliveryFee: order.delivery_fee || 0,
            createdAt: order.created_at,
            date: order.created_at,
          reward_points_used: (order.reward_points_used as any)?.points || 0,
          order_number: order.order_number,
          user_id: order.user_id,
          payment_method: order.payment_method || 'razorpay',
          payment_status:order.payment_status||'pending',
          shipping_address: order.shipping_address || {},
          created_at: order.created_at,
          };
        });

        setOrders(transformedOrders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  const handleRetryPayment = (order: any) => {
    console.log(order.id)
    navigate(`/payment-retry/${order.id}`, {
      state: {
        shippingAddress: order.shipping_address,
        cartItems: order.items,
        totalPrice: order.total,
        orderId: order.id
      }
    });
  };

  const handleRemoveOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
      .from('orders')
     .update({
         status:"cancelled"
        })
      .eq('id', orderId);
      if (error) throw error;
      
      toast.success('Order cancelled');
      window.location.reload(); 
   
    
    } catch (err) {
      console.error(err);
      toast.error('Failed to cancel order');
    }
  };

const getOrderStatusText = (status: string) => {
  switch (status) {
    case 'pending':
    case 'processing':
    case 'confirmed':
    case 'shipped':
    case 'delivered':
    case 'return-accepted':
    case 'return-processing':
    case 'return-picked':
    case 'return-warehouse':
    case 'payment-refund ':
    case 'payment-refund-successfull':
      case 'cancelled':
      return status.charAt(0).toUpperCase() + status.slice(1);
    default:
      return 'Pending';
  }
};
const getPaymentStatusText = (status: string) => {
  switch (status) {
    case 'paid':
    case 'failed':
    case 'pending':
    case 'refunded':
    case 'cancelled':
    case 'refund successfull':
      return status.charAt(0).toUpperCase() + status.slice(1);
    default:
      return 'pending';
  }
};


console.log(orders)


if (loading) {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center pt-12 h-64 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mt-10 mb-4"></div>
 {!currentUser && (
            <div className="mt-6 space-y-2">
              <p className="text-gray-500 text-lg mb-2">You are not signed in.</p>
              <Link to="/signin">
                <Button className='mt-2 text-xl bg-white text-gray-800' variant="outline">Sign In</Button>
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
          <div className="mb-4">
            <h1 className="text-4xl font-bold text-gray-100 mb-2">Your Orders</h1>
            <p className="text-gray-100">Track and manage all your orders in one place</p>
          </div>

          {orders.length === 0 ? (
            <div className="bg-gray-900 shadow-xl p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-200 mb-2">No orders yet</h3>
              <p className="text-gray-200 mb-6">Start shopping to see your orders here</p>
              <Link to="/">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium">
                  Start Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <div className=" grid md:grid-cols-2 lg:grid-cols-3 gap-5 ">
              {orders.map(order => (
                <div key={order.id} className="bg-black border   shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden">
                  <div className="p-2">
                    {/* Order Header */}
                    <div className="flex flex-col  lg:items-center lg:justify-between ">
                      <div className="  lg:mb-0">
                        <div className="flex  flex p-2 pl-0 pr-0 w-full justify-between   items-center gap-3 mb-2">
                          <div className="  w-full p-0 ">
                           
                            <div className="w-full flex  justify-between  items-center mb-3 mt-1">
  {/* Order Number */}
  <h4 className="font-bold text-xl text-gray-200">{order.order_number}</h4>

  {/* Status Badge */}
  {order.status === "cancelled" && (
    <span className="  bg-red-500 text-white text-xs font-medium px-2 py-1.5  shadow">
      Cancelled
    </span>
  )}
  {order.payment_status === "pending" && (
    <span className="  bg-red-500 text-white text-xs font-medium px-2 py-1.5  shadow">
      Not Paid
    </span>
  )}
  {order.status === "delivered" && (
    <span className="  bg-green-500 text-black  text-xs font-medium px-2 py-1.5  item-center z-10 shadow">
      Delivered
    </span>
  )}
</div>

                                           
                      <div className="space-y-4">
  {order.items.map((item: any, idx: number) => (
    <div
      key={idx}
      className="flex items-start gap-4 p-4 bg-gray-800/90 rounded-xl shadow-md border border-gray-700 hover:shadow-lg hover:bg-gray-800 transition"
    >
      {/* Product Image */}
      <img
        src={item.image || '/placeholder.svg'}
        onClick={() => redirect({ id: item.code, pd_name: item.name })}
        className={`h-20 w-20 object-cover border border-gray-600 shadow-sm transition-transform duration-200 hover:scale-105 ${
          !item.name.toLowerCase().includes('custom printed') ? 'cursor-pointer' : 'cursor-default'
        }`}
        alt={item.name}
      />

      {/* Product Details */}
      <div className="flex-1">
        <h5 className="font-semibold text-lg text-yellow-300 mb-2">{item.name}</h5>

        {Array.isArray(item.sizes) ? (
          <div className="space-y-1">
            {item.sizes.map((s: any, i: number) => (
              <div
                key={i}
                className="flex justify-between items-center text-sm text-gray-200 bg-gray-700/60 px-3 py-1 "
              >
                <span>Size: <span className="font-medium text-white">{s.size}</span></span>
                <span>Qty: <span className="font-medium text-white">{s.quantity}</span></span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-between items-center bg-gray-700/60 px-3 py-1  text-sm text-gray-200">
            <span>Size: <span className="font-medium text-white">{item.size}</span></span>
            <span>Qty: <span className="font-medium text-white">{item.quantity}</span></span>
          </div>
        )}

        {/* Price */}
        <div className="mt-2 text-right font-bold text-green-400 text-lg">
          {formatPrice(
            Array.isArray(item.sizes)
              ? item.sizes.reduce((sum: number, s: any) => sum + s.quantity * item.price, 0)
              : item.quantity * item.price
          )}
        </div>
      </div>
    </div>
  ))}
</div>





                       <p className="text-gray-200 font-medium text-center text-xs p-1 mb-2">
                         Placed on{" "}
{new Date(order.createdAt).toLocaleString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  hour12: true,
})}

                        </p>
                          

                        <div className="flex gap-2 ">
                          
                     {/* Order Details Button */}
                              <Link to={`/order-preview/${order.order_number}`} className="flex-1">
                              <Button className="bg-blue-600 hover:bg-blue-700 hover:text-white text-white w-full py-2 rounded-none font-medium">
                                Order Details
                             </Button>
                             </Link>

                       {/* Cancel Order Button */}
                               {(
                                     order.status === "pending" ||
                                   order.status === "processing" ||
                                  order.status === "confirmed"
                                     ) && (
                             <Button
                             onClick={() => handleRemoveOrder(order.id)}
                            className="bg-red-500 rounded-none text-white hover:bg-red-700  w-full flex-1"
                             >
                            Cancel Order
                              </Button>
                               )}
                               {(
                                     order.status === "cancelled"
                                     ) && (
                             <Button
                             
                            className="bg-red-500 rounded-none text-white hover:bg-red-700 cursor-text  w-full flex-1"
                             >
                            Order cancelled
                              </Button>
                               )}
                        </div>


                      {order.payment_status === "pending" && (
                          <p className="text-sm text-white text-center font-medium mt-2">
                            ⚠️ This order will be deleted if payment is not completed by{" "}
                            {new Date(new Date(order.createdAt).getTime() + 24 * 60 * 60 * 1000).toLocaleString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                           day: "numeric",
                           hour: "numeric",
                           minute: "numeric",
                           hour12: true,
                              })}
                            </p>    
                         )}


                      
                      


                          
                    </div>
                          </div>
                       
                      </div>
                      
                      
                    </div>

                   
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default OrderHistory;
