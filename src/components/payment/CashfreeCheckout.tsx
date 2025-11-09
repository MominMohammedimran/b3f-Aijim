import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useDeliverySettings } from '@/hooks/useDeliverySettings';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/lib/utils';

// 🔧 CASHFREE MODE CONFIGURATION
// Change to "production" when going live
const CASHFREE_MODE = "sandbox"; // "sandbox" or "production"

interface CashfreeCheckoutProps {
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
  OrderId
}) => {
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
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(passedCoupon || { code: "", discount: 0 });
  const [appliedPoints, setAppliedPoints] = useState<{
    points: number;
    discount: number;
  } | null>(passedPoints || { points: 0, discount: 0 });

  useEffect(() => {
    const savedCoupon = localStorage.getItem('appliedCoupon');
    const savedPoints = localStorage.getItem('appliedPoints');
    if (savedCoupon) {
      setAppliedCoupon(JSON.parse(savedCoupon) || { coupon: "", discount: 0 });
    }
    if (savedPoints) {
      setAppliedPoints(JSON.parse(savedPoints) || { points: 0, discount: 0 });
    }
  }, []);

  useEffect(() => {
    // Check if already loaded
    if (window.Cashfree) {
      console.log('Cashfree SDK already available');
      setCashfreeLoaded(true);
      return;
    }

    // Check if script tag already exists
    const existingScript = document.querySelector('script[src="https://sdk.cashfree.com/js/v3/cashfree.js"]');
    
    if (existingScript) {
      console.log('Cashfree script tag exists, waiting for it to load...');
      // Script exists but SDK not loaded yet, wait for it
      const waitForLoad = setInterval(() => {
        if (window.Cashfree) {
          console.log('Cashfree SDK loaded!');
          clearInterval(waitForLoad);
          setCashfreeLoaded(true);
        }
      }, 100);
      
      setTimeout(() => {
        clearInterval(waitForLoad);
        if (!window.Cashfree) {
          console.error('Cashfree SDK timeout');
          setCashfreeLoaded(false);
        }
      }, 5000);
      return;
    }

    // Create new script
    console.log('Loading Cashfree SDK script...');
    const script = document.createElement('script');
    script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
    script.async = true;
    
    script.onload = () => {
      console.log('Script loaded, checking for window.Cashfree...');
      setTimeout(() => {
        if (window.Cashfree) {
          console.log('Cashfree SDK ready!');
          setCashfreeLoaded(true);
        } else {
          console.error('Script loaded but window.Cashfree not found');
          setCashfreeLoaded(false);
        }
      }, 100);
    };
    
    script.onerror = (error) => {
      console.error('Failed to load Cashfree script:', error);
      setCashfreeLoaded(false);
      toast.error('Failed to load payment gateway. Please check your internet connection.');
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const totalPrice = cartItems.reduce((acc, item) => {
    const itemTotal = item.sizes.reduce(
      (sum, s) => sum + s.quantity * item.price,
      0
    );
    return acc + itemTotal;
  }, 0);

  const couponDiscount = appliedCoupon?.discount || 0;
  const pointsDiscount = appliedPoints?.discount || 0;
  const totalDiscount = couponDiscount + pointsDiscount;
  const finalTotal = Math.max(0, totalPrice - totalDiscount + deliveryFee);

  const handlePayment = async () => {
    if (isProcessing) {
      return;
    }

    if (!cashfreeLoaded) {
      if (cashfreeLoaded === false) {
        toast.error('Payment gateway failed to load. Please refresh the page and try again.');
      } else {
        toast.error('Payment gateway is still loading. Please wait...');
      }
      return;
    }
    
    if (!window.Cashfree) {
      toast.error('Payment gateway not available. Please refresh the page.');
      return;
    }
    
    setIsProcessing(true);
    console.log('Starting Cashfree payment process...');
    
    try {
      // Validate required data
      if (!shippingAddress?.fullName || !shippingAddress?.email || !shippingAddress?.phone) {
        throw new Error('Missing shipping address information');
      }

      if (finalTotal <= 0) {
        throw new Error('Invalid payment amount');
      }

      // Prepare order items
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
      const orderNumber = `Aijim-${(userProfile?.firstName || 'usr')
        .substring(0, 4)
        .toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;

      const orderData = {
        order_number: orderNumber,
        user_id: currentUser?.id || '00000000-0000-0000-0000-000000000000',
        total: finalTotal,
        status: 'pending',
        payment_status: 'pending',
        items: orderItems,
        payment_method: 'cashfree',
        delivery_fee: deliveryFee,
        shipping_address: shippingAddress,
        user_email: shippingAddress?.email || userProfile?.email,
        coupon_code: appliedCoupon ? {
          code: appliedCoupon.code,
          discount_amount: appliedCoupon.discount || 0
        } : null,
        reward_points_used: appliedPoints ? {
          points: appliedPoints.points,
          value_used: appliedPoints.discount || appliedPoints.points
        } : null,
        reward_points_earned: Math.floor(finalTotal / 100),
        discount_applied: couponDiscount + pointsDiscount
      };

      // Create order in database first
      const { data: createdOrder, error: dbError } = await supabase
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        throw new Error('Failed to create order');
      }

      console.log('Order created in database:', createdOrder.id);

      // Create Cashfree payment session
      const paymentData = {
        order_amount: finalTotal,
        order_currency: 'INR',
        order_id: orderNumber,
        customer_details: {
          customer_id: currentUser?.id || 'guest',
          customer_name: shippingAddress?.fullName || userProfile?.display_name || 'Customer',
          customer_email: shippingAddress?.email || userProfile?.email || '',
          customer_phone: shippingAddress?.phone || userProfile?.phone || ''
        }
      };

      console.log('Creating Cashfree payment session with data:', paymentData);
      const { data: sessionResponse, error: sessionError } = await supabase.functions.invoke('create-cashfree-order', {
        body: paymentData
      });

      console.log('Cashfree response:', { sessionResponse, sessionError });

      if (sessionError) {
        console.error('Cashfree session error:', sessionError);
        throw new Error(sessionError.message || 'Failed to create payment session');
      }

      if (!sessionResponse?.payment_session_id) {
        console.error('No payment session ID in response:', sessionResponse);
        throw new Error(sessionResponse?.error || 'Failed to create payment session');
      }

      console.log('Cashfree session created:', sessionResponse.payment_session_id);

      // Initialize Cashfree checkout
      const cashfree = window.Cashfree({ mode: CASHFREE_MODE });
      
      const checkoutOptions = {
        paymentSessionId: sessionResponse.payment_session_id,
        redirectTarget: "_modal"
      };

      cashfree.checkout(checkoutOptions).then((result: any) => {
        if (result.error) {
          console.error('Payment error:', result.error);
          toast.error('Payment failed. Please try again.');
          setIsProcessing(false);
          onError?.();
        }
        
        if (result.redirect) {
          console.log('Payment redirect initiated');
        }
        
        if (result.paymentDetails) {
          console.log('Payment successful:', result.paymentDetails);
          handlePaymentSuccess(createdOrder, result.paymentDetails);
        }
      }).catch((error: any) => {
        console.error('Checkout error:', error);
        toast.error('Payment initialization failed');
        setIsProcessing(false);
        onError?.();
      });

    } catch (error: any) {
      console.error('Payment process error:', error);
      
      let errorMessage = 'Failed to process payment. Please try again.';
      
      if (error.message?.includes('Missing shipping address')) {
        errorMessage = 'Please complete your shipping address before proceeding.';
      } else if (error.message?.includes('Invalid payment amount')) {
        errorMessage = 'Invalid payment amount. Please refresh the page and try again.';
      }
      
      toast.error(errorMessage);
      setIsProcessing(false);
      onError?.();
    }
  };

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

      // Create Delhivery order after successful payment
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
      onSuccess?.();
    } catch (updateError) {
      console.error('Failed to update order:', updateError);
      toast.error('Payment successful but failed to update order');
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
          <span className="font-semibold uppercase text-sm">Subtotal</span>
          <span className='font-semibold text-md'>{formatPrice(totalPrice)}</span>
        </div>
        {appliedCoupon && (
          <div className="flex justify-between text-green-400 font-bold">
            <span className="font-semibold uppercase text-sm">Coupon</span>
            <span className='font-semibold text-md'>-{formatPrice(couponDiscount)}</span>
          </div>
        )}
        {appliedPoints && (
          <div className="flex justify-between text-blue-400 font-bold">
            <span className="font-semibold uppercase text-sm">Points</span>
            <span className='font-semibold text-md'>-{formatPrice(pointsDiscount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="font-semibold uppercase text-sm">Shipping</span>
          <span>{deliveryFee === 0 ? <span className="line-through font-semibold text-sm text-gray-200">Free Delivery</span> : `₹${deliveryFee}`}</span>
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
          className="w-full uppercase bg-green-600 hover:bg-green-700 text-white font-bold text-md py-1 rounded-none disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handlePayment}
          disabled={isProcessing || finalTotal <= 0 || !cashfreeLoaded}
        >
          {!cashfreeLoaded ? 'Loading Payment Gateway...' : isProcessing ? 'Processing...' : 'Pay with Cashfree'}
        </Button>
      </div>
    </div>
  );
};

export default CashfreeCheckout;
