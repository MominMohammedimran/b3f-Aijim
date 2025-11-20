
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
  const totalPrice = cartItems.reduce((acc, item) => {
    const itemTotal = item.sizes.reduce(
      (sum, s) => sum + s.quantity * item.price,
      0
    );
    return acc + itemTotal;
  }, 0);


//{points: 75, discount: 75} {code: 'WELCOME10', discount: 29.9}//
 const couponDiscount = appliedCoupon?.discount || 0;
  const pointsDiscount = appliedPoints?.discount || 0;
  const totalDiscount = couponDiscount + pointsDiscount;
  const finalTotal = Math.max(0, totalPrice - totalDiscount + deliveryFee);
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

  

  const sendOrderConfirmationEmailHandler = async (orderData: any, paymentMethod: string) => {
    try {
     
      
      // Prepare cart items with proper image URLs for email
      const emailCartItems = cartItems.map(item => ({
        ...item,
        image: item.image && !item.image.startsWith('http') 
          ? `https://zfdsrtwjxwzwbrtfgypm.supabase.co/storage/v1/object/public/${item.image}` 
          : item.image || 'https://zfdsrtwjxwzwbrtfgypm.supabase.co/storage/v1/object/public/placeholder.svg'
      }));
      
      const emailData = {
        orderId: orderData.order_number || 'N/A',
        customerEmail: shippingAddress?.email || userProfile?.email,
        customerName: shippingAddress?.fullName || userProfile?.display_name || 'Customer',
        status: 'confirmed',
        orderItems: emailCartItems,
        totalAmount: finalTotal,
        shippingAddress: shippingAddress,
        paymentMethod: paymentMethod
      };

      {/*if (emailData.customerEmail && emailData.customerEmail !== 'N/A') {
        const emailSent = await sendOrderConfirmationEmail(emailData);
        if (emailSent) {
         
          toast.success('Order confirmed! Confirmation email sent.');
        } else {
          console.warn('⚠️ Order confirmation email failed to send');
          toast.warning('Order confirmed but failed to send confirmation email');
        }
      } else {
        console.warn('⚠️ No email address available for confirmation');
        toast.warning('Order confirmed but no email address provided');
      }*/}
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
      toast.error('Order confirmed but failed to send confirmation email');
    }
  };

  const sendAdminOrderNotification = async (orderData: any) => {
    try {
    
      const adminNotificationData = {
        orderId: orderData.id,
        orderNumber: orderData.order_number,
        customerName: shippingAddress?.fullName || userProfile?.display_name || 'Customer',
        customerEmail: shippingAddress?.email || userProfile?.email,
        customerPhone: shippingAddress?.phone || userProfile?.phone,
        orderItems: cartItems,
        totalAmount: finalTotal,
        shippingAddress: shippingAddress,
        paymentMethod: 'Razorpay',
        deliveryFee: deliveryFee,
        appliedCoupon: appliedCoupon?.code || null,
        rewardPointsUsed: appliedPoints?.points || 0
      };

      const { data, error } = await supabase.functions.invoke('send-admin-order-notification', {
        body: adminNotificationData
      });

      if (error) {
        console.error('Failed to send admin notification:', error);
      } else {
        console.log('✅ Admin notification sent successfully');
      }
    } catch (error) {
      console.error('Error sending admin notification:', error);
    }
  };

  const handlePayment = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
       // Validate required data
      if (!shippingAddress?.fullName || !shippingAddress?.email || !shippingAddress?.phone) {
        throw new Error('Missing shipping address information');
      }

      if (finalTotal <= 0) {
        throw new Error('Invalid payment amount');
      }

      // First, create order in database
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

      // Generate unique order number
 // Generate order number: Aijim + 3 letters + "-" + 5 random digits
const orderNumber = `Aijim-${(userProfile?.firstName || 'usr')
  .substring(0,4)
  .toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;


      const orderData = {
        order_number: orderNumber,
        user_id: currentUser?.id || '00000000-0000-0000-0000-000000000000',
        total: finalTotal,
        status: 'pending',
        payment_status: 'pending',
        items: orderItems,
        payment_method: 'razorpay',
        delivery_fee: deliveryFee,
        shipping_address: shippingAddress,
        user_email: shippingAddress?.email || userProfile?.email,
        coupon_code: appliedCoupon ? {
          code: appliedCoupon.code,
          discount_amount: appliedCoupon.   discount || 0
        } : null,
        reward_points_used: appliedPoints ? {
          points: appliedPoints.points,
          value_used: appliedPoints.discount || appliedPoints.points
        } : null,
        reward_points_earned: 0,
        discount_applied: couponDiscount + pointsDiscount
      };

    
      const { data: createdOrder, error: dbError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error('Failed to create order');
      }

    
      // Prepare payment data for Razorpay
      const paymentData = {
        amount: Math.round(finalTotal * 100), // Convert to paise for Razorpay
        currency: 'INR',
        receipt: orderNumber,
        orderItems: orderItems,
        customerInfo: {
          name: shippingAddress?.fullName || userProfile?.display_name || 'Customer',
          email: shippingAddress?.email || userProfile?.email || '',
          contact: shippingAddress?.phone || userProfile?.phone || '',
          user_id: currentUser?.id
        }
      };

     
      const { data: orderResponse, error: orderError } = await supabase.functions.invoke('create-razorpay-order', {
        body: paymentData
      });

     
      if (orderError) {
        console.error('Supabase function error:', orderError);
        
        // Better error handling for different error types
        if (orderError.message?.includes('RAZORPAY_KEY_ID') || 
            orderError.message?.includes('RAZORPAY_KEY_SECRET') ||
            orderError.message?.includes('authentication failed')) {
          throw new Error('Payment gateway credentials are not configured properly. Please contact support.');
        }
        
        if (orderError.message?.includes('network') || orderError.message?.includes('fetch')) {
          throw new Error('Network error. Please check your connection and try again.');
        }
        
        throw new Error(`Payment service error: ${orderError.message || 'Unknown error'}`);
      }

      if (!orderResponse?.success || !orderResponse?.order_id) {
        console.error('Invalid order response:', orderResponse);
        throw new Error('Invalid response from payment service');
      }

      
   
      // Initialize Razorpay payment with the order data from backend
      const razorpayOptions = {
        key: orderResponse.key_id, // Use the key provided by the backend
        amount: orderResponse.amount,
        currency: orderResponse.currency,
        name: 'AIJIM',
        description: `Payment for order ${orderResponse.receipt}`,
        order_id: orderResponse.order_id,
        prefill: {
          name: paymentData.customerInfo.name,
          email: paymentData.customerInfo.email,
          contact: paymentData.customerInfo.contact
        },
        theme: {
          color: '#3399cc'
        }
      };

     
      // Use the enhanced payment method with proper configuration
      await makePayment(
        finalTotal, // Pass the actual amount
        orderResponse.order_id,
        paymentData.customerInfo.name,
        paymentData.customerInfo.email,
        paymentData.customerInfo.contact,
        async (paymentId, orderId, signature) => {
        
          // Update order with payment details
          try {
            await supabase
              .from('orders')
              .update({
                payment_status: 'paid',
                status: 'processing',
                payment_details: JSON.stringify({
                  razorpay_payment_id: paymentId,
                  razorpay_order_id: orderId,
                  razorpay_signature: signature,
                  amount: finalTotal * 100,
                  currency: 'INR'
                }),
                updated_at: new Date().toISOString()
              })
              .eq('id', createdOrder.id);

           
          } catch (updateError) {
            console.error('❌ Failed to update order payment status:', updateError);
          }
          
          // Update inventory immediately when payment is successful
          try {
            const { updateInventoryFromOrder } = await import('@/hooks/useProductInventory');
            await updateInventoryFromOrder({
              id: createdOrder.id,
              items: cartItems
            });
            // 📩 Send initial order status email (Processing)
try {
  const emailCartItems = cartItems.map(item => ({
    ...item,
    image: item.image && !item.image.startsWith('http')
      ? `https://zfdsrtwjxwzwbrtfgypm.supabase.co/storage/v1/object/public/${item.image}`
      : item.image,
  }));

  // Send to User
  await sendOrderStatusEmail({
    orderId: orderData.order_number,
    customerEmail: shippingAddress?.email || userProfile?.email,
    customerName: shippingAddress?.fullName || userProfile?.display_name,
    status: "processing",
    orderItems: emailCartItems,
    totalAmount: finalTotal,
    shippingAddress: shippingAddress,
    paymentMethod: "razorpay",
    couponCode: appliedCoupon?.code || null,
    couponDiscount: appliedCoupon?.discount || 0,
    rewardPointsUsed: appliedPoints?.points || 0,
  });

  // Send to Admin
  await sendOrderStatusEmail({
    orderId: createdOrder.order_number,
    customerEmail: "aijim.official@gmail.com",
    customerName: "Admin",
    status: "processing",
    orderItems: emailCartItems,
    totalAmount: finalTotal,
    shippingAddress: shippingAddress,
    paymentMethod: "razorpay",
    couponCode: appliedCoupon?.code || null,
    couponDiscount: appliedCoupon?.discount || 0,
    rewardPointsUsed: appliedPoints?.points || 0,
  });

  console.log("📨 Processing status emails sent to user + admin");
} catch (err) {
  console.error("❌ Failed to send processing email:", err);
}

           
          } catch (inventoryError) {
            console.error('❌ Failed to update inventory:', inventoryError);
            // Don't fail the payment process if inventory update fails
          }

          // Create Delhivery order after successful payment
          try {
            const delhiveryData = {
              orderId: createdOrder.id,
              orderNumber: orderNumber,
              shippingAddress: shippingAddress,
              items: cartItems,
              total: finalTotal,
              paymentMethod: 'razorpay'
            };

            console.log('Creating Delhivery order...');
            const { data: delhiveryResponse, error: delhiveryError } = await supabase.functions.invoke('create-delhivery-order', {
              body: { orderData: delhiveryData }
            });

            if (delhiveryError) {
              console.error('Delhivery order creation failed:', delhiveryError);
            } else {
              console.log('Delhivery order created successfully:', delhiveryResponse);
            }
          } catch (delhiveryErr) {
            console.error('Error calling Delhivery function:', delhiveryErr);
          }
          
          toast.success('Payment completed successfully!');
          window.location.href = `/order-complete/${createdOrder.id}`;
          onSuccess?.();
        },
        () => {
         
          toast.error('Payment was cancelled');
          
          onError?.();
        },
        orderResponse.key_id // ✅ use key from backend response
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
              <span className="text-lg font-semibold text-white">
                ₹{item.price * s.quantity}
              </span>
            </div>
          ))
        )}
      </section>

     

      {/* Price Breakdown */}
      <div className="space-y-0 mb-4 text-white">
                      <div className="flex justify-between">
                        <span className="font-semibold uppercase text-sm ">Subtotal</span>
                        <span className='font-semibold text-md'>{formatPrice(totalPrice)}</span>
                      </div>
                      {appliedCoupon && (
                        <div className="flex justify-between text-green-400 font-bold">
                          <span className="font-semibold uppercase text-sm">Coupon </span>
                          <span className='font-semibold text-md'>-{formatPrice(couponDiscount)}</span>
                        </div>
                      )}
                      {appliedPoints && (
                        <div className="flex justify-between text-blue-400 font-bold">
                          <span className="font-semibold uppercase text-sm">Points </span>
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
