import React, { useState, useEffect } from 'react';
import { Link, useNavigate ,useParams} from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';

import { toast } from 'sonner';
import { X ,ArrowLeft} from 'lucide-react';
import Layout from '@/components/layout/Layout';

interface OrderDetailsPreviewProps {
  orders: any[];
  orderNumber: string;
}

const OrderDetailsPreview: React.FC<OrderDetailsPreviewProps> = ({
  orders,
  orderNumber,
}) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { orderid } = useParams<{ orderid: string }>();
   const [order, setOrder] = useState<any>(null);


  useEffect(() => {
    if (!orderid) return;

    const fetchOrder = async () => {
   
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("order_number", orderid)
        .single();

      if (error) {
        
        setOrder(null);
      } else {
        setOrder(data);
      }
     
    };

    fetchOrder();
  }, [orderid]);
 
useEffect(() => {
  if (Array.isArray(orders)) {
    const foundOrder = orders.find(
      (o) => String(o.order_number) === String(orderid)
    );
    setOrder(foundOrder || null);
  }
}, [orders, orderid]);

  const redirect = (product: { id: string; pd_name: string }) => {
    if (!currentUser) {
      navigate('/signin?redirectTo=/orders');
      return;
    }
    if (!product.pd_name.toLowerCase().includes('custom printed')) {
      navigate(`/product/details/${product.id}`);
    }
  };



  const handleRetryPayment = (order: any) => {
    navigate(`/payment-retry/${order.order_number}`, {
      state: {
        shippingAddress: order.shipping_address,
        cartItems: order.items,
        totalPrice: order.total,
        orderId: order.id,
      },
    });
  };

  const handleRemoveOrder = async (orderId: string) => {
    try {
      const { error } = await supabase.from('orders').delete().eq('order_number', orderId);
      if (error) throw error;
      setOrder(null); // single order, so just clear it
      toast.success('Order removed');
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove order');
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





  if (!order) {
    return (
            <Layout>
      <div className="p-4 text-gray-400 text-center">
        No order found for #{orderNumber}
      </div>
      </Layout>
    );
  }

  return (
    <Layout>

    <div
      key={order.id}
      className="bg-black grid lg:grid-cols-2 mt-12 shadow-lg p-2 hover:shadow-xl transition-shadow duration-200 overflow-hidden"
    >
         <div className="flex items-center mb-4 pt-8 animate-fade-in">
                  <Link to="/orders" className="mr-2 flex items-center gap-[20px]">
                    <ArrowLeft size={24} className="back-arrow" />
                    <h1 className="text-2xl text-white font-bold">Back to Orders</h1>
                  </Link>
                  
                </div>
      <div className="p-2 border border-gray-200">
        {/* Order Header */}
        <div className="flex flex-col md:justify-evenly mb-6">
          <div>
            <div className="flex p-2 justify-between border-b border-gray-100 items-center gap-3 ">
              <h3 className="text-xl font-bold md:text-2xl text-gray-100">
                {order.order_number}
              </h3>
              <div className="text-right md:text-2xl pt-5">
                <div className="text-xl font-bold text-gray-200">
                  {formatPrice(order.total)}
                </div>
                <div className="text-sm text-gray-300">
                  {order.items.reduce((total: number, item: any) => {
                    return total + (Array.isArray(item.sizes)
                      ? item.sizes.reduce(
                          (sum: number, s: any) => sum + s.quantity,
                          0
                        )
                      : item.quantity || 1);
                  }, 0)}{' '}
                  item(s)
                </div>
              </div>
            </div>
          </div>
          
        </div>

                {/* Items */}
        <div className="border p-4 mb-6">
          <div className="flex w-ful justify-between">

          <h4 className="font-semibold text-gray-200 ">Order Items</h4>
           { (order.payment_status==="paid")&&( 
            <Link
              to={`/track-order/${order.order_number}`}
              state={{ order }}
            >
              <h4 className="bg-blue-600 text-sm px-2 py-1  w-full  font-semibold  text-white hover:bg-blue-700 
              w-full  mb-2  rounded-none ">
                Track Order
              </h4>
            </Link>
              )}
          
          </div>

          {order.items.map((item: any, idx: number) => (
            <div
              key={idx}
              className="flex items-start gap-4 p-3 bg-gray-900 m-1"
            >
              <img
                src={item.image || '/placeholder.svg'}
                onClick={() =>
                  redirect({ id: item.code, pd_name: item.name })
                }
                className={`h-20 w-20 object-cover border shadow-sm hover:scale-105 ${
                  !item.name.toLowerCase().includes('custom printed')
                    ? 'cursor-pointer'
                    : 'cursor-default'
                }`}
                alt={item.name}
              />
              <div className="flex-1">
                <h5 className="text-lg font-medium  text-white mb-1">{item.name}</h5>
                {Array.isArray(item.sizes) ? (
                  item.sizes.map((s: any, i: number) => (
                    <div
                      key={i}
                      className="text-white text-sm font-medium"
                    >
                      <p className= "gap-20 ">Size - {s.size} |  Qty - {s.quantity} 
                         <span>
                          &nbsp; {formatPrice(s.quantity * item.price)}
                        </span>
                      </p>
                      
                     
                    </div>
                  ))
                ) : (
                  <div className="text-xs font-medium text-white">
                    Size {item.size} ×  Qty — {item.quantity}
                    <p>
                    {item.total}
                  </p>
                  </div>
                 
                )}
              </div>
              
            </div>
            
          ))}
          <p className="text-gray-200 font-bold text-center text-xs">
            Placed on{' '}
            {new Date(order.created_at).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>


        {/* Status & Rewards */}
        <div className="bg-gray-100 grid grid-cols-1 md:grid-cols-3 mb-6">
          <div className="p-4 grid items-center border-b md:border-r border-gray-800">
            <span className="font-semibold text-lg   text-blue-900 mb-1  text-center">
              Payment Status -<span className="w-full font-bold  text-red-500 text-center ">
             "{getPaymentStatusText(order.payment_status)}"
            </span>
            </span>
            <p className="text-sm text-gray-800 leading-snug  font-bold text-center mb-2 ">
              #Note - {order.payment_method || 'N/A'} 
            </p>
           
            {!['cancelled','paid'].includes(order.payment_status) && (
                     <div className="flex gap-2">
                     <Button
                 onClick={() => handleRetryPayment(order)}
                 className="bg-green-600 rounded-none text-lg w-100 m-auto hover:bg-green-700 text-white "
            >
                 Complete Payment
              </Button>
                </div> 
             )}


          </div>

      
            <div className="p-4 grid items-center border-b w-full md:border-r border-gray-800">
              <span className="font-semibold text-lg w-full     text-green-800 mb-1 text-center ">Order Status -
                 <span className=" w-full text-red-500 font-bold text-center ">
                 &nbsp;"{getOrderStatusText(order.status)}"
              </span>
              </span>
             
              
              <p className="text-sm text-gray-800 leading-snug  font-bold text-center mb-2">
                #Note - {order.status_note || 'N/A'}
              </p>
              
              
            </div>
         

          <div className="p-4  grid items-center border-b  border-gray-800 ">
             <div className=' w-full m-auto pt-1  '> 
            <p className="text-md font-semibold text-center text-black">
              Reward Points Used -{' '}
              <span className="font-semibold text-red-500  underline">
                {(order.reward_points_used as any)?.points || 0}
              </span>
            </p>
            <p className="text-md text-black font-semibold text-center">
              Coupon Used- {' '}
              <span className=" font-semibold underline text-red-500">
                {(order.coupon_code as any)?.code || 'None'}
              </span>
            </p>
            </div>
          </div>
        </div>

      

        {/* Actions */}
        <div className="grid grid-cols-1  gap-[10px]">
        
          <div className=" flex gap-4">
              {order.status !== 'delivered' && (
            <Link
              to={`/payment-issue?orderId=${order.order_number}`}
              className="w-full"
            >
              <Button className="bg-red-600 rounded-none hover:bg-red-700 text-white w-full">
                Payment Issue?
              </Button>
            </Link>
          )}

          <Link
            to={`/order-related-issue?orderId=${order.order_number}`}
            className="w-full flex-cols-1 "
          >
            <Button className="bg-red-600 rounded-none  hover:bg-red-700 text-white w-full ">
              Order Issue?
            </Button>
          </Link>
          </div>


        
        </div>
      </div>
    </div>
    </Layout>
  );
};

export default OrderDetailsPreview;
