import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useDeliverySettings } from "@/hooks/useDeliverySettings";
import { Loader2 } from "lucide-react";

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
  const { settings } = useDeliverySettings();
  const [loading, setLoading] = useState(false);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const createRazorpayOrder = async () => {
    try {
      const { data: razorpayOrder, error } = await supabase.functions.invoke('retry-razorpay-order', {
        body: { orderId, amount }
      });

      if (error) throw error;
      return razorpayOrder;
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      toast.error('Failed to create payment order');
      return null;
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    
    const res = await loadRazorpay();
    if (!res) {
      toast.error("Razorpay SDK failed to load.");
      setLoading(false);
      return;
    }

    const razorpayOrder = await createRazorpayOrder();
    if (!razorpayOrder) {
      setLoading(false);
      return;
    }

    const options = {
      key: "rzp_live_2Mc4YyXZYcwqy8",
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: "Aijim",
      description: `Payment for Order #${orderNumber}`,
      order_id: razorpayOrder.orderId,
      handler: async (response: any) => {
        await handleSuccess(response);
      },
      prefill: {
        name: userProfile?.full_name || "Customer",
        email: data?.shipping_address?.email || userProfile?.email || "",
        contact: data?.shipping_address?.phone || "",
      },
      theme: { color: "#000000" },
    };

    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.open();
    setLoading(false);
  };

  const handleSuccess = async (paymentResponse: any) => {
    try {
      setLoading(true);

      // ✅ Mark payment as paid in Supabase
      const { error } = await supabase
        .from("orders")
        .update({
          payment_status: "paid",
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
        })
        .eq("id", orderId);

      if (error) throw error;

      toast.success("Payment successful! Order confirmed.");
      navigate(`/orders/${orderId}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update order after payment.");
    } finally {
      setLoading(false);
    }
  };
console.log(data)
  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold">Retry Payment</h2>
        <p className="text-gray-600 mt-2">
          Order <span className="font-semibold">#{orderNumber}</span>
        </p>
        <img src={data.image}/>

        <p className="text-lg font-semibold text-green-600 mt-1">
          ₹{amount.toFixed(2)}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <button
          onClick={handlePayment}
          className="w-full bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-800 transition"
        >
          Pay with Razorpay
        </button>
      )}
    </div>
  );
};

export default PaymentRetry;
