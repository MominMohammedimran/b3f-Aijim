import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useDeliverySettings } from "@/hooks/useDeliverySettings";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/utils";

const CASHFREE_MODE = "production"; // Change to "production" in live mode

interface CashfreeCheckoutProps {
  amount?: number;
  cartItems?: any[];
  shippingAddress?: any;
  onSuccess?: () => void;
  onError?: () => void;
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

  // 🧩 Load Cashfree SDK
  useEffect(() => {
    if (window.Cashfree) return setCashfreeLoaded(true);
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    script.onload = () => setCashfreeLoaded(!!window.Cashfree);
    script.onerror = () => toast.error("Failed to load payment gateway.");
    document.head.appendChild(script);
    return () => script.remove();
  }, []);

  // 🧾 Calculate totals
  const subtotal = cartItems.reduce((acc, item) => {
    const itemTotal = item.sizes.reduce((sum, s) => sum + s.quantity * item.price, 0);
    return acc + itemTotal;
  }, 0);

  const couponDiscount = appliedCoupon?.discount || 0;
  const pointsDiscount = appliedPoints?.discount || 0;
  const total = Math.max(0, subtotal - (couponDiscount + pointsDiscount) + deliveryFee);

  // 💳 Handle Cashfree Payment
  const handlePayment = async () => {
    if (!cashfreeLoaded || isProcessing) return;
    setIsProcessing(true);

    try {
      if (!shippingAddress?.fullName || !shippingAddress?.email || !shippingAddress?.phone) {
        throw new Error("Please complete your shipping address before proceeding.");
      }

      const orderNumber = `AIJIM-${Math.floor(10000 + Math.random() * 90000)}`;
      const orderData = {
        order_number: orderNumber,
        user_id: currentUser?.id || "guest",
        total: total,
        status: "pending",
        payment_status: "pending",
        items: cartItems,
        payment_method: "cashfree",
        delivery_fee: deliveryFee,
        shipping_address: shippingAddress,
        user_email: shippingAddress?.email || userProfile?.email,
        coupon_code: appliedCoupon?.code || null,
        discount_applied: couponDiscount + pointsDiscount,
        reward_points_used: appliedPoints.points || 0,
        reward_points_earned:0,
      };

      // 🧾 Save order in Supabase
      const { data: createdOrder, error: dbError } = await supabase
        .from("orders")
        .insert(orderData)
        .select()
        .single();
      if (dbError) throw dbError;

      // 🧾 Get Cashfree payment session
      const { data: sessionResponse, error: sessionError } = await supabase.functions.invoke(
        "create-cashfree-order",
        {
          body: {
            order_amount: total,
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
        throw new Error("Failed to create payment session");

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
          console.error("Checkout error:", err);
          toast.error("Payment initialization failed");
          setIsProcessing(false);
          onError?.();
        });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Payment process failed");
      setIsProcessing(false);
    }
  };

  // ✅ Handle Success
  const handlePaymentSuccess = async (order: any, paymentDetails: any) => {
    try {
      await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          status: "confirmed",
          payment_details: paymentDetails,
        })
        .eq("id", order.id);

      toast.success("Payment successful!");
      setIsProcessing(false);

      window.location.href = `/order-complete/${order.id}`;
    } catch (err) {
      console.error("Error updating order:", err);
      toast.error("Payment success but order update failed.");
    }
  };

  return (
    <div className="bg-gray-900 border border-gray-700 p-4 rounded-md text-white max-w-sm mx-auto shadow">
      {/* Cart Items */}
      <section className="space-y-3 max-h-60 overflow-y-auto pr-1">
        {cartItems.map((item) =>
          item.sizes.map((s) => (
            <div key={`${item.id}-${s.size}`} className="flex gap-3 bg-gray-800 rounded-md p-2 items-center">
              <img src={item.image || "/placeholder.svg"} className="w-12 h-12 rounded" alt={item.name} />
              <div className="flex-1">
                <p className="text-sm font-semibold">{item.name}</p>
                <p className="text-xs text-gray-400">Size {s.size} × {s.quantity}</p>
              </div>
              <span className="text-sm font-bold">₹{item.price * s.quantity}</span>
            </div>
          ))
        )}
      </section>

      {/* Summary */}
      <div className="mt-4 border-t border-gray-700 pt-3 space-y-2">
        <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
        {couponDiscount > 0 && <div className="flex justify-between text-green-400"><span>Coupon</span><span>-{formatPrice(couponDiscount)}</span></div>}
        {pointsDiscount > 0 && <div className="flex justify-between text-blue-400"><span>Points</span><span>-{formatPrice(pointsDiscount)}</span></div>}
        <div className="flex justify-between"><span>Shipping</span><span>{deliveryFee > 0 ? `₹${deliveryFee}` : "Free"}</span></div>
        <div className="flex justify-between font-bold border-t border-gray-700 pt-2">
          <span>Total</span><span>{formatPrice(total)}</span>
        </div>
      </div>

      <div className="mt-5">
        <Button
          onClick={handlePayment}
          disabled={isProcessing || total <= 0 || !cashfreeLoaded}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {isProcessing ? "Processing..." : "Pay Now"}
        </Button>
      </div>
    </div>
  );
};

export default CashfreeCheckout;
