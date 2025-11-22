import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Package, Loader2 } from "lucide-react"; // Added Loader2 for better spinner
import { toast } from "sonner";
import { CheckoutStepper } from "@/components/checkout/CheckoutStepper";
import { useCart } from "@/context/CartContext";

const OrderComplete = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  // Using 'any' for the order state as in the original code, but a proper interface is recommended
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // --- LOGIC REMAINS UNCHANGED ---

  useEffect(() => {
    if (!orderId) {
      toast.error("Invalid order.");
      navigate("/");
      return;
    }
    fetchOrder();
  }, [orderId, navigate]); // Added navigate to dependency array for correctness

  const fetchOrder = async () => {
    try {
      // Assuming 'order_number' is also fetched from the Supabase 'orders' table
      const { data, error } = await supabase.from("orders").select("*").eq("order_number", orderId).single();
      if (error || !data) throw error;
      setOrder(data);
      clearCart();
    } catch (err) {
      console.error("Error fetching order:", err);
      toast.error("Unable to load order details.");
    } finally {
      setLoading(false);
    }
  };

  // --- UI/UX UPDATES START HERE ---

  // Custom Dark Button Styles
  const primaryButtonClass = "w-full bg-yellow-500 text-black hover:bg-yellow-400 font-semibold transition-colors";
  const secondaryButtonClass = "w-full border-green-500 text-green-500 hover:bg-green-900/50 transition-colors";

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64 bg-black text-white">
          {/* Using Loader2 for a better looking spinner */}
          <Loader2 className="h-10 w-10 text-yellow-500 animate-spin" />
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="text-center py-10 bg-black text-white min-h-screen">
          <h2 className="text-xl font-bold text-red-500">Order not found</h2>
          <Button onClick={() => navigate("/")} className={`mt-4 ${primaryButtonClass}`}>Go Home</Button>
        </div>
      </Layout>
    );
  }

  // Main Success View
  return (
    <Layout>
      <div className="min-h-screen bg-black text-white py-15 pt-5 mt-5 ">
        <div className="container mx-auto px-4 max-w-md">
          {/* Checkout Stepper needs to be styled for dark theme if possible, but keeping it as is for now */}
          <CheckoutStepper currentStep={4} />

          {/* Dark Card Style */}
          <Card className="bg-gray-900 border-green-500 border-2 shadow-2xl">
            <CardContent className="pt-6 text-center space-y-6">
              
              {/* Success Icon */}
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold text-green-500 tracking-wider">PAYMENT SUCCESSFUL</h2>
              <p className="text-gray-300">Your order has been placed. Thank you for your purchase.</p>

              {/* Order Details - Highlighted with Yellow Text */}
              <div className="bg-gray-800 p-4 rounded-lg text-left space-y-3 border border-gray-700">
                <div className="flex justify-between font-medium">
                  <span className="text-gray-400">Order Number:</span>
                  <span className="text-yellow-500">{order.order_number}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-gray-400">Total Amount:</span>
                  <span className="text-yellow-500">₹{order.total}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-gray-400">Status:</span>
                  <span className="capitalize text-blue-400">{order.status}</span>
                </div>
              </div>

              {/* Next Steps - Highlighted with a contrasting Blue theme */}
              <div className="bg-blue-900/50 p-4 rounded-lg border border-blue-700">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Package className="h-5 w-5 text-blue-400" />
                  <span className="font-semibold text-blue-300 tracking-wide">WHAT'S NEXT?</span>
                </div>
                <ul className="text-sm text-blue-200 space-y-1 text-left">
                  <li>• **Email Confirmation:** You’ll receive an email confirmation shortly.</li>
                  <li>• **Processing:** Your order will be processed within 24 hours.</li>
                  <li>• **Tracking:** Track your order status in the "My Orders" section.</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <Button 
                  onClick={() => navigate("/orders")} 
                  className={primaryButtonClass}
                >
                  View My Orders
                </Button>
                <Button 
                  onClick={() => navigate("/")} 
                  variant="outline" 
                  className={secondaryButtonClass}
                >
                  Continue Shopping
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default OrderComplete;
