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
      
      if (!razorpayOrder?.success) {
        throw new Error(razorpayOrder?.error || 'Failed to create order');
      }
      
      return razorpayOrder;
    } catch (error) {
     // console.error('Error creating Razorpay order:', error);
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
      key: razorpayOrder.key_id || "rzp_live_2Mc4YyXZYcwqy8",
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
      //console.error(err);
      toast.error("Failed to update order after payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-80 bg-gray-900 shadow-lg p-2">
    <div className="text-center mb-2">


  {/* Loop through order items */}
  <div className="space-y-4 ">
    {data.items.map((item, idx) => (
      <div 
        key={idx} 
        className="flex items-center gap-4 p-3 bg-gray-800  shadow-sm"
      >
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-20 h-20 object-cover rounded-md border"
        />
        <div className="flex-1 text-left">
          <p className="font-semibold text-gray-100">{item.name}</p>
          {item.sizes.map((s, i) => (
            <p key={i} className="text-sm text-gray-100">
              Size : <span className="font-medium">{s.size}</span> × {s.quantity} Qty 
            </p>
          ))}
          <p className="text-gray-100 font-semibold ">₹{item.price}</p>
        </div>
      </div>
    ))}
  </div>

  {/* Coupon & Reward Points */}
  <div className="mt-1  text-sm text-left p-3  shadow-sm">
    
      <p className="text-yellow-400 text-sm  font-medium">
        Coupon Applied : <span className="">{data.coupon_code?.code || 'None'}</span>
      </p>
  

      <p className="text-yellow-400 text-sm font-medium">
        Reward Points Used : {data.reward_points_used?.points || 0}
      </p>
    
  </div>

  {/* Final Total */}
  <p className="text-lg font-bold text-green-400 mt-1">
    Total: ₹{data.total.toFixed(2)}
  </p>
</div>


      {loading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : (
        <button
          onClick={handlePayment}
          className="w-full bg-white text-black mb-4 py-2  font-semibold hover:bg-gray-200 transition"
        >
          Pay with Razorpay
        </button>
      )}
    </div>
  );
};

export default PaymentRetry;
