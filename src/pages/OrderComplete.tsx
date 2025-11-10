import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Package } from "lucide-react";
import { toast } from "sonner";
import { CheckoutStepper } from "@/components/checkout/CheckoutStepper";
import { useCart } from "@/context/CartContext";

const OrderComplete = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) {
      toast.error("Invalid order.");
      navigate("/");
      return;
    }
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase.from("orders").select("*").eq("id", orderId).single();
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

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-10 w-10 border-b-2 border-green-600 rounded-full"></div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="text-center py-10">
          <h2 className="text-xl font-bold text-red-500">Order not found</h2>
          <Button onClick={() => navigate("/")} className="mt-4">Go Home</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-md">
        <CheckoutStepper currentStep={4} />
        <Card>
          <CardContent className="pt-6 text-center space-y-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold text-green-600">Payment Successful!</h2>
            <p className="text-gray-600">Thank you for shopping with us. Your payment has been received.</p>

            <div className="bg-gray-50 p-4 rounded-lg text-left space-y-2">
              <div className="flex justify-between"><span>Order Number:</span><span>{order.order_number}</span></div>
              <div className="flex justify-between"><span>Total Amount:</span><span>₹{order.total}</span></div>
              <div className="flex justify-between"><span>Status:</span><span className="capitalize text-blue-600">{order.status}</span></div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Package className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Next Steps</span>
              </div>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• You’ll receive a confirmation email shortly.</li>
                <li>• Your order will be processed within 24 hours.</li>
                <li>• You can track your order in “My Orders”.</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button onClick={() => navigate("/orders")} className="w-full">View My Orders</Button>
              <Button onClick={() => navigate("/")} variant="outline" className="w-full">Continue Shopping</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default OrderComplete;
