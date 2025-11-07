import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Loader2, CreditCard, ShieldCheck, Gift, Tag } from "lucide-react";

// ⚙️ Global Configuration
const PAYMENT_GATEWAY = import.meta.env.VITE_PAYMENT_GATEWAY || "cashfree"; // or "razorpay"
const CASHFREE_MODE = import.meta.env.VITE_CASHFREE_MODE || "production"; // "sandbox" or "production"

declare global {
  interface Window {
    Razorpay: any;
    Cashfree: any;
  }
}

interface PaymentRetryProps {
  orderId: string;
  amount: number;
  orderNumber: string;
  data: any;
}

const PaymentRetry: React.FC<PaymentRetryProps> = ({
  orderId,
  amount,
  orderNumber,
  data,
}) => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [gatewayReady, setGatewayReady] = useState(false);

  // 🧩 Auto-load SDK dynamically
  useEffect(() => {
    const loadSDK = async () => {
      let script = document.createElement("script");

      if (PAYMENT_GATEWAY === "cashfree") {
        script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
      } else {
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
      }

      script.async = true;
      script.onload = () => {
        console.log(`✅ ${PAYMENT_GATEWAY} SDK loaded`);
        setGatewayReady(true);
      };
      script.onerror = () => {
        toast.error(`Failed to load ${PAYMENT_GATEWAY} SDK`);
      };

      document.head.appendChild(script);
    };

    loadSDK();
  }, []);

  // ==================== CASHFREE FLOW ====================
  const createCashfreeOrder = async () => {
    const { data: cashfreeOrder, error } = await supabase.functions.invoke(
      "retry-cashfree-order",
      { body: { orderId, amount } }
    );
    if (error || !cashfreeOrder?.success) {
      toast.error("Failed to create Cashfree order");
      return null;
    }
    return cashfreeOrder;
  };

  const handleCashfreePayment = async () => {
    if (!gatewayReady) return toast.error("Cashfree SDK not ready");
    setLoading(true);
    try {
      const cashfreeOrder = await createCashfreeOrder();
      if (!cashfreeOrder) return setLoading(false);

      const cashfree = window.Cashfree({ mode: CASHFREE_MODE });
      const checkoutOptions = {
        paymentSessionId: cashfreeOrder.payment_session_id,
        returnUrl: `${window.location.origin}/order-complete`,
      };

      cashfree.checkout(checkoutOptions).then((result: any) => {
        if (result.error) {
          toast.error(result.error.message || "Payment failed");
          setLoading(false);
        } else if (result.paymentDetails) {
          handleCashfreeSuccess(result.paymentDetails);
        }
      });
    } catch {
      toast.error("Payment initialization failed");
      setLoading(false);
    }
  };

  const handleCashfreeSuccess = async (paymentDetails: any) => {
    setLoading(true);
    try {
      await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          cashfree_order_id: paymentDetails.orderId,
          cashfree_payment_id: paymentDetails.paymentId,
        })
        .eq("id", orderId);

      toast.success("Payment successful! Order confirmed.");
      navigate(`/orders/${orderId}`);
    } catch {
      toast.error("Failed to update order after payment.");
    } finally {
      setLoading(false);
    }
  };

  // ==================== RAZORPAY FLOW ====================
  const createRazorpayOrder = async () => {
    const { data: razorpayOrder, error } = await supabase.functions.invoke(
      "retry-razorpay-order",
      { body: { orderId, amount } }
    );
    if (error || !razorpayOrder?.success) {
      toast.error("Failed to create Razorpay order");
      return null;
    }
    return razorpayOrder;
  };

  const handleRazorpayPayment = async () => {
    if (!gatewayReady) return toast.error("Razorpay SDK not ready");
    setLoading(true);
    try {
      const razorpayOrder = await createRazorpayOrder();
      if (!razorpayOrder) return setLoading(false);

      const options = {
        key: razorpayOrder.key_id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "AIJIM",
        description: `Payment for order ${orderNumber}`,
        order_id: razorpayOrder.order_id,
        prefill: {
          name: userProfile?.display_name || "Customer",
          email: userProfile?.email || "",
          contact: userProfile?.phone || "",
        },
        theme: { color: "#facc15" },
        handler: async (response: any) => {
          await handleRazorpaySuccess(response);
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch {
      toast.error("Payment initialization failed");
      setLoading(false);
    }
  };

  const handleRazorpaySuccess = async (paymentResponse: any) => {
    setLoading(true);
    try {
      await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
        })
        .eq("id", orderId);

      toast.success("Payment successful! Order confirmed.");
      navigate(`/orders/${orderId}`);
    } catch {
      toast.error("Failed to update order after payment.");
    } finally {
      setLoading(false);
    }
  };

  // ==================== MAIN HANDLER ====================
  const handlePayment = async () => {
    if (PAYMENT_GATEWAY === "cashfree") await handleCashfreePayment();
    else await handleRazorpayPayment();
  };

  // ==================== UI ====================
  const accentColor =
    PAYMENT_GATEWAY === "cashfree" ? "text-green-400" : "text-yellow-400";
  const brandName =
    PAYMENT_GATEWAY === "cashfree" ? "Cashfree" : "Razorpay";
  const buttonColor =
    PAYMENT_GATEWAY === "cashfree"
      ? "bg-green-500 hover:bg-green-400"
      : "bg-yellow-400 hover:bg-yellow-300";

  return (
    <div className="w-full max-w-md mx-auto bg-gradient-to-br from-black via-gray-900 to-black border border-gray-800 shadow-lg rounded-none p-5 mt-8 font-sans">
      <h2 className="text-center text-xl font-bold text-white mb-1 uppercase tracking-wide">
        Retry Payment
      </h2>
      <p className="text-center text-gray-400 text-sm font-semibold mb-5">
        #{orderNumber}
      </p>

      {/* Order Items */}
      <div className="space-y-3 mb-4">
        {data.items.map((item: any, idx: number) => (
          <div
            key={idx}
            className="flex items-center gap-3 bg-gray-800/80 border border-gray-700 p-3 hover:bg-gray-800 transition"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-16 h-16 rounded object-cover border border-gray-600"
            />
            <div className="flex-1 text-left">
              <p className="font-semibold text-gray-100 text-sm">{item.name}</p>
              {item.sizes.map((s: any, i: number) => (
                <p key={i} className="text-xs text-gray-400">
                  Size: {s.size} × {s.quantity}
                </p>
              ))}
              <p className="text-sm font-semibold text-yellow-400">
                ₹{item.price}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Discounts */}
      <div className="bg-gray-800/70 border border-gray-700 p-3 mb-4 space-y-1">
        <div className="flex items-center text-yellow-400 text-sm">
          <Tag className="h-4 w-4 mr-1" /> Coupon:
          <span className="ml-1 text-gray-200 font-medium">
            {data.coupon_code?.code || "None"}
          </span>
        </div>
        <div className="flex items-center text-blue-400 text-sm">
          <Gift className="h-4 w-4 mr-1" /> Reward Points:
          <span className="ml-1 text-gray-200 font-medium">
            {data.reward_points_used?.points || 0}
          </span>
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-between items-center border-t border-gray-700 pt-3 mb-5">
        <span className="text-gray-300 text-sm uppercase font-semibold">
          Total
        </span>
        <span className={`font-bold text-lg ${accentColor}`}>
          ₹{data.total.toFixed(2)}
        </span>
      </div>

      {/* Payment Button */}
      {loading ? (
        <div className="flex justify-center py-3">
          <Loader2 className="h-6 w-6 animate-spin text-yellow-400" />
        </div>
      ) : (
        <button
          onClick={handlePayment}
          disabled={!gatewayReady}
          className={`w-full ${buttonColor} text-black font-semibold py-2 uppercase tracking-wide rounded-none shadow transition disabled:opacity-50`}
        >
          <div className="flex items-center justify-center gap-2">
            <CreditCard className="h-4 w-4" />
            {gatewayReady
              ? `Pay Securely with ${brandName}`
              : `Loading ${brandName}...`}
          </div>
        </button>
      )}

      <div className="flex justify-center mt-3 text-xs text-gray-500">
        <ShieldCheck className="h-3 w-3 mr-1 text-green-500" />
        Secured by AIJIM & {brandName}
      </div>
    </div>
  );
};

export default PaymentRetry;
