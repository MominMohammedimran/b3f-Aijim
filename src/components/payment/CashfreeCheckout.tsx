import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useDeliverySettings } from '@/hooks/useDeliverySettings';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/utils';

// 🔧 CASHFREE MODE CONFIGURATION
const CASHFREE_MODE = "sandbox"; // Change to "production" when live

interface CashfreeCheckoutProps {
  amount?: number;
  cartItems?: any[];
  shippingAddress?: any;
  onSuccess?: () => void;
  onError?: () => void;
  OrderId?: string;
  RewardPoints?: number;
}

declare global {
  interface Window {
    Cashfree: any;
  }
}

const CashfreeCheckout: React.FC<CashfreeCheckoutProps> = ({
  amount,
  cartItems: propCartItems,
  shippingAddress,
  RewardPoints = 0,
  onSuccess,
  onError,
}) => {
  const navigate = useNavigate();
  const { cartItems: contextCartItems } = useCart();
  const { userProfile, currentUser } = useAuth();
  const { settings: deliverySettings } = useDeliverySettings();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cashfreeLoaded, setCashfreeLoaded] = useState(false);

  const cartItems = propCartItems || contextCartItems;
  const deliveryFee = deliverySettings?.delivery_fee ?? 100;

  const location = useLocation();
  const passedCoupon = location.state?.appliedCoupon || null;
  const passedPoints = location.state?.appliedPoints || 0;
  const [appliedCoupon, setAppliedCoupon] = useState(passedCoupon || { code: "", discount: 0 });
  const [appliedPoints, setAppliedPoints] = useState(passedPoints || { points: 0, discount: 0 });

  // 🧠 Load saved discounts if user navigates back
  useEffect(() => {
    const savedCoupon = localStorage.getItem('appliedCoupon');
    const savedPoints = localStorage.getItem('appliedPoints');
    if (savedCoupon) setAppliedCoupon(JSON.parse(savedCoupon) || { code: "", discount: 0 });
    if (savedPoints) setAppliedPoints(JSON.parse(savedPoints) || { points: 0, discount: 0 });
  }, []);

  // 🧩 Load Cashfree SDK
  useEffect(() => {
    if (window.Cashfree) {
      setCashfreeLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    script.onload = () => setCashfreeLoaded(!!window.Cashfree);
    script.onerror = () => {
      toast.error('Failed to load payment gateway.');
      setCashfreeLoaded(false);
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  // 🧾 Calculate pricing
  const totalPrice = cartItems.reduce((acc, item) => {
    const itemTotal = item.sizes.reduce((sum, s) => sum + s.quantity * item.price, 0);
    return acc + itemTotal;
  }, 0);

  const couponDiscount = appliedCoupon?.discount || 0;
  const pointsDiscount = appliedPoints?.discount || 0;
  const finalTotal = Math.max(0, totalPrice - (couponDiscount + pointsDiscount) + deliveryFee);

  // 🧠 Payment handler
  const handlePayment = async () => {
    if (isProcessing || !cashfreeLoaded) return;

    setIsProcessing(true);
    try {
      if (!shippingAddress?.fullName || !shippingAddress?.email || !shippingAddress?.phone) {
        throw new Error('Please complete your shipping details.');
      }

      // 🆔 Generate order number
      const orderNumber = `AIJIM-${Math.floor(10000 + Math.random() * 90000)}`;

      // 🗂️ Prepare order data
      const orderData = {
        order_number: orderNumber,
        user_id: currentUser?.id || 'guest',
        total: finalTotal,
        status: 'pending',
        payment_status: 'pending',
        items: cartItems,
        payment_method: 'cashfree',
        delivery_fee: deliveryFee,
        shipping_address: shippingAddress,
        user_email: shippingAddress?.email || userProfile?.email,
        coupon_code: appliedCoupon?.code || null,
        discount_applied: couponDiscount + pointsDiscount,
        reward_points_used: appliedPoints.points || 0,
        reward_points_earned: Math.floor(finalTotal / 100),
      };

      // 💾 Save order to DB
      const { data: createdOrder, error: dbError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (dbError) throw dbError;

      // 🧾 Create Cashfree payment session
      const { data: sessionResponse, error: sessionError } = await supabase.functions.invoke('create-cashfree-order', {
        body: {
          order_amount: finalTotal,
          order_currency: 'INR',
          order_id: orderNumber,
          customer_details: {
            customer_id: currentUser?.id || 'guest',
            customer_name: shippingAddress?.fullName,
            customer_email: shippingAddress?.email,
            customer_phone: shippingAddress?.phone,
          },
        },
      });

      if (sessionError || !sessionResponse?.payment_session_id) {
        throw new Error('Failed to create payment session.');
      }

      const cashfree = window.Cashfree({ mode: CASHFREE_MODE });
      const checkoutOptions = {
        paymentSessionId: sessionResponse.payment_session_id,
        redirectTarget: "_modal",
      };

      // 🧾 Start checkout
      cashfree.checkout(checkoutOptions)
        .then(async (result: any) => {
          if (result.error) {
            toast.error('Payment failed. Please try again.');
            setIsProcessing(false);
            return onError?.();
          }

          if (result.paymentDetails) {
            console.log('✅ Payment successful:', result.paymentDetails);
            await handlePaymentSuccess(createdOrder, result.paymentDetails);
          }
        })
        .catch((err: any) => {
          console.error('Checkout error:', err);
          toast.error('Payment initialization failed');
          setIsProcessing(false);
          onError?.();
        });

    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Payment process failed.');
      setIsProcessing(false);
    }
  };

  // ✅ On Payment Success
  const handlePaymentSuccess = async (order: any, paymentDetails: any) => {
  try {
    // Update order with payment details
    await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        status: 'confirmed',
        payment_details: JSON.stringify({
          cashfree_order_id: paymentDetails.cf_order_id,
          payment_method: paymentDetails.payment_method,
          amount: finalTotal,
          currency: 'INR'
        }),
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id);

    // Update inventory
    const { updateInventoryFromOrder } = await import('@/hooks/useProductInventory');
    await updateInventoryFromOrder({
      id: order.id,
      items: cartItems
    });

    // Create Delhivery order (optional)
    try {
      const delhiveryData = {
        orderId: order.id,
        orderNumber: order.order_number,
        shippingAddress: shippingAddress,
        items: cartItems,
        total: finalTotal,
        paymentMethod: 'cashfree'
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
    setIsProcessing(false);

    // ✅ Redirect to Order Complete page
    window.location.href = `/order-complete/${order.id}`;
  } catch (updateError) {
    console.error('Failed to update order:', updateError);
    toast.error('Payment successful but failed to update order');
    setIsProcessing(false);
  }
};

  return (
    <div className="bg-gray-900 border border-gray-700 p-4 shadow max-w-sm mx-auto text-white rounded-md">
      {/* Cart Items */}
      <section className="space-y-4 max-h-60 overflow-y-auto pr-1">
        {cartItems.map((item) =>
          item.sizes.map((s) => (
            <div key={`${item.id}-${s.size}`} className="flex gap-3 items-center bg-gray-800 rounded-md p-2">
              <img src={item.image || '/placeholder.svg'} alt={item.name} className="w-14 h-14 rounded object-cover" />
              <div className="flex-1">
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="text-xs text-gray-400">Size - {s.size} | Qty - {s.quantity}</p>
              </div>
              <span className="text-lg font-semibold">₹{item.price * s.quantity}</span>
            </div>
          ))
        )}
      </section>

      {/* Price Summary */}
      <div className="mt-4 border-t border-gray-700 pt-3 space-y-2">
        <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(totalPrice)}</span></div>
        {couponDiscount > 0 && <div className="flex justify-between text-green-400"><span>Coupon</span><span>-{formatPrice(couponDiscount)}</span></div>}
        {pointsDiscount > 0 && <div className="flex justify-between text-blue-400"><span>Points</span><span>-{formatPrice(pointsDiscount)}</span></div>}
        <div className="flex justify-between"><span>Shipping</span><span>{deliveryFee > 0 ? `₹${deliveryFee}` : 'Free'}</span></div>
        <div className="flex justify-between font-bold border-t border-gray-700 pt-2">
          <span>Total</span><span>{formatPrice(finalTotal)}</span>
        </div>
      </div>

      {/* Pay Button */}
      <div className="mt-5">
        <Button
          className="w-full uppercase bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-md disabled:opacity-50"
          onClick={handlePayment}
          disabled={isProcessing || finalTotal <= 0 || !cashfreeLoaded}
        >
          {!cashfreeLoaded ? 'Loading Gateway...' : isProcessing ? 'Processing...' : 'Pay Now'}
        </Button>
      </div>
    </div>
  );
};

export default CashfreeCheckout;
