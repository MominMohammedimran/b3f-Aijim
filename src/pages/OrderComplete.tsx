import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ShoppingBag, Package } from "lucide-react";

const OrderComplete = () => {
  const navigate = useNavigate();

  // More dynamic and appealing button styles
  const primaryButtonClass = "w-full bg-green-500 text-white hover:bg-green-600 font-bold tracking-wider text-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-green-500/30";
  const secondaryButtonClass = "w-full bg-transparent border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black font-bold tracking-wider text-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-yellow-500/30";

  return (
    <Layout>
      <div className="min-h-screen  text-white p-4 py-15 mt-20 flex items-center justify-center">
        <div className="container mx-auto px-4 max-w-lg text-center">
          <Card className="bg-gray-900/80 backdrop-blur-sm border-2 border-red-500/50 shadow-2xl shadow-green-500/20 rounded-2xl overflow-hidden">
            <CardContent className="p-8 md:p-12 space-y-6">

              <div className="relative w-24 h-24 mx-auto">
                {/* Pulsing green background glow */}
                <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-50"></div>
                {/* Central Check Icon */}
                <div className="relative flex items-center justify-center w-full h-full bg-gray-800 rounded-full border-4 border-green-500">
                    <CheckCircle className="h-12 w-12 text-green-500" />
                </div>
              </div>

              <h1 className="text-xl font-extrabold text-white tracking-tight">
                Thank You for Your Order!
              </h1>

              <p className="text-gray-300 text-md">
                Your order has been successfully placed. A confirmation email is on its way to you.
              </p>

              

              <div className="space-y-4 pt-4">
                <Button
                  onClick={() => navigate("/orders")}
                  className={primaryButtonClass}
                >
                  <Package className="mr-2 h-5 w-5" />
                  View My Orders
                </Button>
                <Button
                  onClick={() => navigate("/")}
                  variant="outline"
                  className={secondaryButtonClass}
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Continue Shopping
                </Button>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
                 <p className="text-gray-400 text-sm">
                    Thank you for placing your order. You can check the status of your order by clicking on the 'View My Orders' button, or you can continue shopping for more amazing products.
                 </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default OrderComplete;
