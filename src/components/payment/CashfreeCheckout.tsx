import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useDeliverySettings } from "@/hooks/useDeliverySettings";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/utils";

const CASHFREE_MODE = "production"; // Change to "production" in live

declare global {
  interface Window {
    Cashfree: any;
  }
}

export interface CashfreeCheckoutProps {
  amount?: number;
  cartItems?: any[];
  shippingAddress?: any;
  onSuccess?: () => void;
  onError?: () => void;
  OrderId?: string;
  RewardPoints?: number;
  onRemoveSize?: () => void;
  onRemoveItem?: () => void;
}

const CashfreeCheckout: React.FC<CashfreeCheckoutProps> = ({
  cartItems: propCartItems,
  shippingAddress,
  RewardPoints = 0,
  onSuccess,
  onError,
}) => {
  const { cartItems: contextCartItems } = useCart();
  const { userProfile, currentUser } = useAuth();
  const { settings: deliverySettings } = useDeliverySettings();
  const [isProcessing, setIsProcessing] = useState(false);
  const [cashfreeLoaded, setCashfreeLoaded] = useState(false);
  const [rewardPointsToUse, setRewardPointsToUse] = useState(RewardPoints);

  const cartItems = propCartItems || contextCartItems;
  const deliveryFee = deliverySettings?.delivery_fee ?? 100;
  const availablePoints = userProfile?.reward_points || 0;

  const location = useLocation();
  const passedCoupon = location.state?.appliedCoupon || { code: "", discount: 0 };
  const passedPoints = location.state?.appliedPoints || { points: 0, discount: 0 };

  const [appliedCoupon, setAppliedCoupon] = useState(passedCoupon);
  const [appliedPoints, setAppliedPoints] = useState(passedPoints);

  // Load Cashfree SDK
  useEffect(() => {
    if (window.Cashfree) return setCashfreeLoaded(true);
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    script.onload = () => setCashfreeLoaded(!!window.Cashfree);
    script.onerror = () => toast.error("Failed to load Cashfree payment gateway.");
    document.head.appendChild(script);
    return () => script.remove();
  }, []);

  // Calculate totals
  const subtotal = cartItems.reduce(
    (acc, item) => acc + (item.sizes?.reduce((sum, s) => sum + s.quantity * item.price, 0) || 0),
    0
  );

  const couponDiscount = appliedCoupon?.discount || 0;
  const pointsDiscount = appliedPoints?.discount || 0;
  const totalDiscount = couponDiscount + pointsDiscount;
  const finalTotal = Math.max(0, subtotal - totalDiscount + deliveryFee);

  const handleRewardPointsChange = (value: number) => {
    if (value < 100 && value > 0) return;
    setRewardPointsToUse(Math.min(value, availablePoints));
  };

  const handlePaymentSuccess = async (order: any, paymentDetails: any) => {
    try {
      await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          status: "confirmed",
          payment_details: paymentDetails,
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);

      toast.success("Payment successful!");
      window.location.href = `/order-complete/${order.id}`;
      onSuccess?.();
    } catch (err) {
      console.error("Error updating order:", err);
      toast.error("Payment success but order update failed.");
    }
  };

  const handlePayment = async () => {
    if (!cashfreeLoaded || isProcessing) return;
    setIsProcessing(true);

    try {
      if (!shippingAddress?.fullName || !shippingAddress?.email || !shippingAddress?.phone) {
        throw new Error("Please complete your shipping address before proceeding.");
      }

      const orderNumber = `AIJIM-${(userProfile?.firstName || "USR")
        .substring(0, 4)
        .toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;

       const orderData = {
        order_number: orderNumber,
        user_id: currentUser?.id || '00000000-0000-0000-0000-000000000000',
        total: finalTotal,
        status: 'pending',
        payment_status: 'pending',
        items: cartItems,
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

      // Save order in Supabase
      const { data: createdOrder, error: dbError } = await supabase
        .from("orders")
        .insert(orderData)
        .select()
        .single();
      if (dbError) throw dbError;

      // Create Cashfree order session
      const { data: sessionResponse, error: sessionError } = await supabase.functions.invoke(
        "create-cashfree-order",
        {
          body: {
            order_amount: finalTotal,
            order_currency: "INR",
            order_id: orderNumber,
            customer_details: {
              customer_id: currentUser?.id || "guest",
              customer_name: shippingAddress?.fullName,
              customer_email: shippingAddress?.email,
              customer_phone: shippingAddress?.phone,
            },
          },
        }
      );

      if (sessionError || !sessionResponse?.payment_session_id)
        throw new Error("Failed to create Cashfree payment session.");

      const cashfree = window.Cashfree({ mode: CASHFREE_MODE });
      cashfree
        .checkout({
          paymentSessionId: sessionResponse.payment_session_id,
          redirectTarget: "_modal",
        })
        .then(async (result: any) => {
          if (result.error) {
            toast.error("Payment failed. Please try again.");
            setIsProcessing(false);
            return onError?.();
          }
          if (result.paymentDetails) {
            await handlePaymentSuccess(createdOrder, result.paymentDetails);
          }
        })
        .catch((err: any) => {
          console.error("Cashfree checkout error:", err);
          toast.error("Payment initialization failed.");
          setIsProcessing(false);
          onError?.();
        });
    } catch (err: any) {
      console.error("Payment process error:", err);
      toast.error(err.message || "Failed to process payment.");
      setIsProcessing(false);
      onError?.();
    }
  };

  return (
    <div className="bg-gray-800 border p-4 shadow max-w-sm mx-auto text-white">
      {/* Cart Items */}
      <section className="space-y-4 max-h-60 overflow-y-auto pr-1">
        {cartItems.map((item) =>
          item.sizes?.map((s) => (
            <div
              key={`${item.id}-${s.size}`}
              className="flex gap-3 items-center bg-gray-800 rounded-md p-2"
            >
              <img
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                className="w-14 h-14 rounded object-cover"
              />
              <div className="flex-1 space-y-0.5">
                <p className="text-sm font-semibold line-clamp-1">{item.name}</p>
                <p className="text-xs text-gray-200 font-semibold">
                  Size - {s.size} | Qty - {s.quantity}
                </p>
              </div>
              <span className="text-lg font-semibold">₹{item.price * s.quantity}</span>
            </div>
          ))
        )}
      </section>

      {/* Price Breakdown */}
      <div className="space-y-1 mt-4">
        <div className="flex justify-between">
          <span className="font-semibold uppercase text-sm">Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {appliedCoupon && (
          <div className="flex justify-between text-green-400 font-bold">
            <span className="font-semibold uppercase text-sm">Coupon</span>
            <span>-{formatPrice(couponDiscount)}</span>
          </div>
        )}
        {appliedPoints && (
          <div className="flex justify-between text-blue-400 font-bold">
            <span className="font-semibold uppercase text-sm">Points</span>
            <span>-{formatPrice(pointsDiscount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="font-semibold uppercase text-sm">Shipping</span>
          <span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}</span>
        </div>
        <div className="border-t pt-2 flex justify-between font-bold">
          <span className="uppercase text-sm">Total</span>
          <span>{formatPrice(finalTotal)}</span>
        </div>
      </div>

      {/* Payment Button */}
      <div className="mt-5">
        <Button
          onClick={handlePayment}
          disabled={isProcessing || finalTotal <= 0 || !cashfreeLoaded}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-1"
        >
          {isProcessing ? "Processing..." : "Pay Now"}
        </Button>
      </div>
    </div>
  );
};

export default CashfreeCheckout;
