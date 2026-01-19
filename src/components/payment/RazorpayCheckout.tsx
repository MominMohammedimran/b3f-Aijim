
import React, { useState, useEffect,useRef } from 'react';
import{useLocation} from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { v4 as uuidv4 } from 'uuid';
import { useDeliverySettings } from '@/hooks/useDeliverySettings';
import { Award } from 'lucide-react';
import { toast } from 'sonner';
import { makePayment } from '@/services/paymentServices/razorpay/RazorpayService';
import { getRazorpayConfig } from '@/services/paymentServices/razorpay/RazorpayConfig';
import { supabase } from '@/integrations/supabase/client';
import {sendOrderStatusEmail } from '@/components/admin/OrderStatusEmailService';
import { formatPrice } from '@/lib/utils';
type CartItem = {
  name: string;
  price: number;
  sizes: { quantity: number }[];
};
interface RazorpayCheckoutProps {
  amount?: number;
  cartItems?: any[];
  shippingAddress?: any;
  onSuccess?: () => void;
  onError?: () => void;
  OrderId?: string;
  RewardPoints?: number;
  onRemoveSize?: (itemId: string, size: string) => void;
  onRemoveItem?: (itemId: string) => void;
}

const RazorpayCheckout: React.FC<RazorpayCheckoutProps> = ({
  amount,
  cartItems: propCartItems,
  shippingAddress,
  RewardPoints = 0,
  onSuccess,
  onError,
  OrderId
}) => {
  const { cartItems: contextCartItems } = useCart();
  const { userProfile, currentUser } = useAuth();
  const { settings: deliverySettings, loading: settingsLoading } = useDeliverySettings();
  const [rewardPointsToUse, setRewardPointsToUse] = useState(RewardPoints);
  const comboOffer=deliverySettings?.combo_offer??550;
  const [isProcessing, setIsProcessing] = useState(false);
  
  const cartItems = propCartItems || contextCartItems;
  const deliveryFee = deliverySettings?.delivery_fee ?? 100;
  
  const availablePoints = userProfile?.reward_points || 0;
  const payNowRef = useRef(null);

const location = useLocation();


useEffect(() => {
  if (location.state?.scrollToPayNow && payNowRef.current) {
    payNowRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}, [location]);

 const passedCoupon = location.state?.appliedCoupon||" ";
 const passedPoints =location.state?.appliedPoints||0;
 const [appliedCoupon, setAppliedCoupon] = useState<{
   code: string;
   discount: number;
 } | null>(passedCoupon ||{code:"",discount:0});
   const [appliedPoints, setAppliedPoints] = useState<{
     points: number;
     discount: number;
   } | null>(passedPoints ||{points:0,discount:0});
 useEffect(() => {
   const savedCoupon = localStorage.getItem('appliedCoupon');
   const savedPoints=localStorage.getItem('appliedPoints');
   if (savedCoupon) {
     setAppliedCoupon(JSON.parse(savedCoupon)||{coupon:"",discount:0});
   }
   if(savedPoints){
     setAppliedPoints(JSON.parse(savedPoints)||{points:0,discount:0});
   }
 }, []);
 
 {/* const totalPrice = cartItems.reduce((acc, item) => {
    const itemTotal = item.sizes.reduce(
      (sum, s) => sum + s.quantity * item.price,
      0
    );
    return acc + itemTotal;
  }, 0);*/}
// GLOBAL OFFER: ANY 2 = 1000


const calculateGlobalOfferTotal = (cartItems: CartItem[]) => {
  const totalQty = cartItems.reduce((sum, item) => {
    if (item.name.toLowerCase().includes("custom")) return sum;

    const itemQty = item.sizes.reduce((s, sz) => s + sz.quantity, 0);
    return sum + itemQty;
  }, 0);

  const pairs = Math.floor(totalQty / 2);
  const remainder = totalQty % 2;

  return pairs * 1000 + (remainder ? comboOffer: 0);
};

const getTotalPricePrinting = (cartItems: CartItem[]) => {
  return cartItems.reduce((total, item) => {
    if (!item.name.toLowerCase().includes("custom")) return total;

    const itemTotal = item.sizes.reduce(
      (sum, size) => sum + size.quantity * item.price,
      0
    );

    return total + itemTotal;
  }, 0);
};

const totalPrice = (cartItems: CartItem[]) => {
  return (
    calculateGlobalOfferTotal(cartItems) +
    getTotalPricePrinting(cartItems)
  );
};

//{points: 75, discount: 75} {code: 'WELCOME10', discount: 29.9}//
const couponDiscount = appliedCoupon?.discount || 0;
const pointsDiscount = appliedPoints?.discount || 0;
const totalDiscount = couponDiscount + pointsDiscount;

const finalTotal = Math.max(
  0,
  totalPrice(cartItems) - totalDiscount + deliveryFee
);

  const handleRewardPointsChange = (value: number) => {
    if (value < 100 && value > 0) {
      return;
    }
    if (value > availablePoints) {
      setRewardPointsToUse(availablePoints);
    } else {
      setRewardPointsToUse(Math.max(0, value));
    }
  };

  

  
// ALWAYS Call Courier API
//ALWAYS Call Courier API
const triggerCourier = async (order: any) => {
  try {
   // console.log("🚚 Triggering Delhivery via Supabase Function...");

    const courierPayload = {
      orderId: order.id,                     // MUST be the Supabase row id (UUID)
      orderNumber: order.order_number,       // Aijim-XXXX
      shippingAddress: order.shipping_address,
      items: order.items,
      total: order.total,
      paymentMethod: order.payment_method,
    };

    const { data, error } = await supabase.functions.invoke(
      "create-delhivery-order",
      {
        body: { orderData: courierPayload },
      }
    );

    if (error) {
      console.error("❌ Delhivery Function Error:", error);
    } else {
      console.log("✅ Delhivery Order Created:");
    }
  } catch (err) {
    console.error("⚠️ Delhivery Trigger Failed:", err);
  }
};



 const handlePayment = async () => {
  if (isProcessing) return;
  setIsProcessing(true);

  try {
    // Validate shipping address
    if (!shippingAddress?.fullName || !shippingAddress?.email || !shippingAddress?.phone) {
      throw new Error("Missing shipping address information");
    }

    if (finalTotal <= 0) {
      throw new Error("Invalid payment amount");
    }

    // Prepare items for DB
    const orderItems = cartItems.map(item => ({
      id: item.id,
      product_id: item.product_id || item.id,
      name: item.name,
      image: item.image,
      code: item.code,
      price: item.price,
      sizes: item.sizes,
      color: item.color,
      metadata: item.metadata
    }));

    // Generate order number
    const orderNumber = `Aijim-${(userProfile?.firstName || "usr")
      .substring(0, 4)
      .toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;

    // Order data for database
    const orderData = {
      order_number: orderNumber,
      user_id: currentUser?.id || "00000000-0000-0000-0000-000000000000",
      total: finalTotal,
      status: "pending",
      payment_status: "pending",
      items: orderItems,
      payment_method: "razorpay",
      delivery_fee: deliveryFee,
      shipping_address: shippingAddress,
      user_email: shippingAddress?.email || userProfile?.email,
      coupon_code: appliedCoupon
        ? { code: appliedCoupon.code, discount_amount: appliedCoupon.discount || 0 }
        : null,
      reward_points_used: appliedPoints
        ? { points: appliedPoints.points, value_used: appliedPoints.discount || appliedPoints.points }
        : null,
      reward_points_earned: 0,
      discount_applied: couponDiscount + pointsDiscount
    };

    // Insert into DB
    const { data: createdOrder, error: dbError } = await supabase
      .from("orders")
      .insert(orderData)
      .select()
      .single();

    if (dbError) throw new Error("Failed to create order");

    // Prepare payment request
    const paymentData = {
      amount: Math.round(finalTotal * 100),
      currency: "INR",
      receipt: orderNumber,
      orderItems,
      customerInfo: {
        name: shippingAddress.fullName,
        email: shippingAddress.email,
        contact: shippingAddress.phone,
        user_id: currentUser?.id
      }
    };

    // Call Supabase Edge Function
    const { data: orderResponse, error: orderError } = await supabase.functions.invoke(
      "create-razorpay-order",
      { body: paymentData }
    );

    if (orderError) throw new Error(orderError.message || "Payment service error");

    if (!orderResponse?.success || !orderResponse?.order_id) {
      throw new Error("Invalid response from payment service");
    }
  
    // ⛳ RUN Razorpay (new clean version)
    await makePayment(
      finalTotal,
      orderResponse.order_id,
      paymentData.customerInfo.name,
      paymentData.customerInfo.email,
      paymentData.customerInfo.contact,

      // 🟢 SUCCESS CALLBACK
      async (paymentId, orderId, signature) => {
        try {
          // Update DB
          await supabase
            .from("orders")
            .update({
              payment_status: "paid",
              status: "processing",
              payment_details: JSON.stringify({
                razorpay_payment_id: paymentId,
                razorpay_order_id: orderId,
                razorpay_signature: signature
              }),
              updated_at: new Date().toISOString()
            })
            .eq("id", createdOrder.id);

          // Update inventory
          const { updateInventoryFromOrder } = await import("@/hooks/useProductInventory");
          await updateInventoryFromOrder({ id: createdOrder.id, items: cartItems });
await triggerCourier(createdOrder);
          // Prepare email images
          const emailCartItems = cartItems.map(item => ({
            ...item,
            image:
              item.image && !item.image.startsWith("http")
                ? `https://zfdsrtwjxwzwbrtfgypm.supabase.co/storage/v1/object/public/${item.image}`
                : item.image
          }));

          // Send user email
          await sendOrderStatusEmail({
            orderId: orderData.order_number,
            customerEmail: shippingAddress.email,
            customerName: shippingAddress.fullName,
            status: "processing",
            orderItems: emailCartItems,
            totalAmount: finalTotal,
            shippingAddress,
            paymentMethod: "razorpay",
            couponCode: appliedCoupon?.code || null,
            couponDiscount: appliedCoupon?.discount || 0,
            rewardPointsUsed: appliedPoints?.points || 0
          });

          // Send admin email
          await sendOrderStatusEmail({
            orderId: createdOrder.order_number,
            customerEmail: "aijim.official@gmail.com",
            customerName: "Admin",
            status: "processing",
            orderItems: emailCartItems,
            totalAmount: finalTotal,
            shippingAddress,
            paymentMethod: "razorpay",
            couponCode: appliedCoupon?.code || null,
            couponDiscount: appliedCoupon?.discount || 0,
            rewardPointsUsed: appliedPoints?.points || 0
          });

          // Create Delhivery order
          await supabase.functions.invoke("create-delhivery-order", {
            body: {
              orderData: {
                orderId: createdOrder.id,
                orderNumber,
                shippingAddress,
                items: cartItems,
                total: finalTotal,
                paymentMethod: "razorpay"
              }
            }
          });

          toast.success("Payment Successful");
          setTimeout(() => {
window.location.href = `/order-complete`;
}, 30000); // 60000ms = 1 minute

          
        } catch (e) {
          console.error("Error in success handler:", e);
        }
      },

      // 🔴 FAILURE CALLBACK
      async () => {
        await supabase
          .from("orders")
          .update({
            payment_status: "failed",
            status: "pending"
          })
          
          .eq("id", createdOrder.id);


          await triggerCourier(createdOrder);
           const emailCartItems = cartItems.map(item => ({
            ...item,
            image:
              item.image && !item.image.startsWith("http")
                ? `https://zfdsrtwjxwzwbrtfgypm.supabase.co/storage/v1/object/public/${item.image}`
                : item.image
          }));
           await sendOrderStatusEmail({
            orderId: createdOrder.order_number,
            customerEmail: "aijim.official@gmail.com",
            customerName: "Admin",
            status: "pending",
            orderItems: emailCartItems,
            totalAmount: finalTotal,
            shippingAddress,
            paymentMethod: "razorpay",
            couponCode: appliedCoupon?.code || null,
            couponDiscount: appliedCoupon?.discount || 0,
            rewardPointsUsed: appliedPoints?.points || 0
          });

        toast.error("Payment Failed ");
       
      },

      // Razorpay Key
      orderResponse.key_id
    );

  } catch (error: any) {
      console.error('Payment process error:', error);
      
      let errorMessage = 'Failed to process payment. Please try again.';
      
      if (error.message?.includes('Missing shipping address')) {
        errorMessage = 'Please complete your shipping address before proceeding.';
      } else if (error.message?.includes('Invalid payment amount')) {
        errorMessage = 'Invalid payment amount. Please refresh the page and try again.';
      } else if (error.message?.includes('credentials not configured') || 
                 error.message?.includes('authentication failed')) {
        errorMessage = 'Payment gateway configuration issue. Please contact support.';
      } else if (error.message?.includes('Network error') || error.message?.includes('connection')) {
        errorMessage = 'Network connection issue. Please check your internet and try again.';
      } else if (error.message?.includes('Failed to load payment gateway')) {
        errorMessage = 'Unable to load payment gateway. Please refresh the page and try again.';
      } else if (error.message?.includes('Payment service error')) {
        errorMessage = 'Payment service is currently unavailable. Please try again later.';
      }
      
      toast.error(errorMessage);
      onError?.();
    } finally {
      setIsProcessing(false);
    }
  };

  

   
  return (
    <div className="bg-gray-800 border p-4 shadow max-w-sm mx-auto">
 

      {/* Cart Items */}
      <section className="space-y-4 max-h-60 overflow-y-auto pr-1">
        {cartItems.map((item) =>
          item.sizes.map((s) => (
            <div
              key={`${item.id}-${s.size}`}
              className="flex gap-3 items-center bg-gray-800 border-red-300 rounded-md p-2"
            >
              <img
                src={item.image || '/placeholder.svg'}
                alt={item.name}
                className="w-14 h-14 rounded object-cover"
              />
              <div className="flex-1 space-y-0.5">
                <p className="text-sm font-semibold text-white line-clamp-1">
                  {item.name}
                </p>
                <p className="text-xs text-gray-200 font-semibold">
                  Size - {s.size} | Qty - {s.quantity}
                </p>
              </div>
              
            </div>
          ))
        )}
      </section>

     

      {/* Price Breakdown */}
      <div className="space-y-0 mb-4 text-white">
                      <div className="flex justify-between">
                        <span className="font-semibold uppercase text-sm ">Subtotal</span>
                        <span className='font-semibold text-md'>
  {formatPrice(totalPrice(cartItems))}
</span>
 </div>
                     
 <div className="flex justify-between text-green-500 font-bold text-sm line-clamp-1 mb-2">
                          <span className="font-semibold uppercase text-sm">Coupon  </span>
                          <span className='font-semibold text-md'>{appliedCoupon.code||"Not Available"}</span>
                        </div>
                      {appliedPoints && (
                        <div className="flex justify-between text-red-500 font-bold">
                          <span className="font-semibold uppercase text-sm">Reward Points </span>
                          <span className='font-semibold text-md'>-{formatPrice(pointsDiscount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="font-semibold uppercase text-sm">Shipping</span>
                        <span>{deliveryFee === 0 ? <span className="line-through font-semibold text-sm text-gray-200">Free Delivery</span> : `- ₹${deliveryFee}`}</span>
                      </div>
                      <div className="border-t pb-2">
                        <div className="flex justify-between font-semibold">
                          <span className="font-semibold uppercase text-sm">Total</span>
                          <span className="underline text-md font-semibold">{formatPrice(finalTotal)}</span>
                        </div>
                      </div>
                    </div>

      {/* Payment Button */}
      <div className="mt-5">
        <Button 
         ref={payNowRef}
          className="w-full uppercase bg-green-600 hover:bg-green-700 text-white font-bold text-md py-1 rounded-none disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handlePayment}
          disabled={isProcessing || finalTotal <= 0}
        >
          {isProcessing ? 'Processing...' : 'Pay Now'}
        </Button>
      </div>
    </div>
  );
};

export default RazorpayCheckout;
