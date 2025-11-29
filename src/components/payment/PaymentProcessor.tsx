import React from "react";
import RazorpayCheckout from "./RazorpayCheckout";
import CashfreeCheckout from "./CashfreeCheckout";
import { sendOrderConfirmationEmail } from "@/services/unifiedEmailService";
import { toast } from "sonner";

interface PaymentProcessorProps {
  paymentMethod: string;
  orderData: any;
  onSuccess?: () => void;
  onFailure?: () => void;
}

const PaymentProcessor: React.FC<PaymentProcessorProps> = ({
  paymentMethod,
  orderData,
  onSuccess = () => {},
  onFailure = () => {},
}) => {
  if (!orderData) return null;

  const handlePaymentSuccess = async () => {
    // Send confirmation email using unified service
    const emailData = {
      orderId: orderData.order_number || orderData.id,
      customerEmail: orderData.shipping_address?.email || orderData.user_email,
      customerName:
        orderData.shipping_address?.name ||
        orderData.shipping_address?.fullName ||
        "Customer",
      status: "confirmed",
      orderItems: orderData.items || [],
      totalAmount: orderData.total,
      shippingAddress: orderData.shipping_address,
      paymentMethod: paymentMethod,
    };

    if (emailData.customerEmail && emailData.customerEmail !== "N/A") {
      try {
        const emailSent = await sendOrderConfirmationEmail(emailData);
        if (emailSent) {
          console.log("✅ Confirmation email sent successfully");
        } else {
          console.warn("⚠️ Confirmation email failed to send");
        }
      } catch (emailError) {
        console.error("Failed to send confirmation email:", emailError);
        toast.error("Payment successful but failed to send confirmation email");
      }
    } else {
      console.warn("⚠️ No valid email address for confirmation");
      toast.warning(
        "Payment successful but no email address provided for confirmation"
      );
    }

    onSuccess();
  };

  // Handle different payment methods
  switch (paymentMethod.toLowerCase()) {
    case "cashfree":
      return (
        <CashfreeCheckout
          amount={orderData.total || 0}
          cartItems={orderData.items || []}
          shippingAddress={orderData.shipping_address || {}}
          onSuccess={handlePaymentSuccess}
          onError={onFailure}
          OrderId={orderData.id}
          RewardPoints={orderData.reward_points_used?.points || 0}
          onRemoveSize={() => {}}
          onRemoveItem={() => {}}
        />
      );

    case "razorpay":
      return (
        <RazorpayCheckout
          amount={orderData.total || 0}
          cartItems={orderData.items || []}
          shippingAddress={orderData.shipping_address || {}}
          onSuccess={handlePaymentSuccess}
          onError={onFailure}
          OrderId={orderData.id}
          RewardPoints={orderData.reward_points_used?.points || 0}
          onRemoveSize={() => {}}
          onRemoveItem={() => {}}
        />
      );

    case "upi":
      // Placeholder for UPI payment handling
      return null;

    case "cod":
      // Placeholder for Cash on Delivery handling
      return null;

    default:
      return null;
  }
};

export default PaymentProcessor;
