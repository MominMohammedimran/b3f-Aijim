import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, CreditCard, Package, Gift, Truck,Loader2 } from "lucide-react";
import Layout from "@/components/layout/Layout";
import TrackOrder from "@/pages/TrackOrder";


interface OrderDetailsPreviewProps {
  orders: any[];
  orderNumber: string;
}

const OrderDetailsPreview: React.FC<OrderDetailsPreviewProps> = ({
  orders,
  orderNumber,
}) => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { orderid } = useParams<{ orderid: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!orderid) return;
    
    const fetchOrder = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("order_number", orderid)
        .single();
      if (error) setOrder(null);
      else setOrder(data);
      setLoading(false);
    };
    fetchOrder();
  }, [orderid]);

  useEffect(() => {
    if (Array.isArray(orders)) {
      const foundOrder = orders.find(
        (o) => String(o.order_number) === String(orderid)
      );
      setOrder(foundOrder || null);
    }
  }, [orders, orderid]);

  const redirect = (product: { id: string; pd_name: string }) => {
    if (!currentUser) {
      navigate("/signin?redirectTo=/orders");
      return;
    }
    if (!product.pd_name.toLowerCase().includes("custom printed")) {
      navigate(`/product/${product.id}`);
    }
  };

  const handleRetryPayment = (order: any) => {
    navigate(`/payment-retry/${order.order_number}`, {
      state: {
        shippingAddress: order.shipping_address,
        cartItems: order.items,
        totalPrice: order.total,
        orderId: order.id,
      },
    });
  };

  const getOrderStatusText = (status: string) =>
    status ? status.charAt(0).toUpperCase() + status.slice(1) : "Pending";
  const getPaymentStatusText = (status: string) =>
    status ? status.charAt(0).toUpperCase() + status.slice(1) : "Pending";

   if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <Loader2 className="w-10 h-10 animate-spin text-yellow-400 mb-3" />
          <p className="text-gray-400 text-sm font-medium">
            Loading your order history...
          </p>
        </div>
      </Layout>
    );
  }
  if (!order) {
    return (
      <Layout>
        <div className="p-6 text-gray-200 bg-gray-900 py-10 mt-10 pt-10 text-center">
          No order found for #{orderNumber}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto mt-10 pt-10 px-4 pb-24 font-sans">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Link
            to="/orders"
            className="flex items-center text-yellow-400 hover:text-yellow-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </div>

        {/* Order Overview */}
        <div className="bg-[#0d0d0d] border border-gray-800 rounded-none p-5 mb-5 shadow-lg">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h1 className="text-sm md:text-md font-semibold text-white tracking-wide">
                #{order.order_number}
              </h1>
              <p className="text-xs text-gray-400">
                Placed on{" "}
                {new Date(order.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm md:text-md font-bold text-yellow-400">
                {formatPrice(order.total)}
              </p>
              <p className="text-xs text-gray-400">
                {order.items.reduce((t: number, item: any) => {
                  return (
                    t +
                    (Array.isArray(item.sizes)
                      ? item.sizes.reduce(
                          (s: number, x: any) => s + x.quantity,
                          0
                        )
                      : item.quantity || 1)
                  );
                }, 0)}{" "}
                ITEM(S)
              </p>
            </div>
          </div>

          {/* Order Items */}
          {order.items.map((item: any, idx: number) => (
            <div
              key={idx}
              className="flex items-start gap-4 py-3 border-t border-gray-800"
            >
              <img
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                onClick={() => redirect({ id: item.code, pd_name: item.name })}
                className={`w-16 h-16 rounded-md object-cover border border-gray-700 ${
                  item.name.toLowerCase().includes("custom printed")
                    ? ""
                    : "cursor-pointer hover:scale-105 transition-transform"
                }`}
              />
              <div className="flex-1">
                <p className="text-sm font-semibold text-white line-clamp-1">
                  {item.name}
                </p>
                {Array.isArray(item.sizes) ? (
                  <div className="space-y-[2px] w-full mt-1 border-b border-gray-400 pb-2 flex flex-wrap items-center justify-start gap-4">
                    {item.sizes.map((s: any, i: number) => (
                      <p
                        key={i}
                        className="text-sm text-gray-300 font-medium leading-tight"
                      >
                        {s.size} × {s.quantity}
                      </p>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-300 mt-1">
                    Qty {item.quantity} ×{" "}
                    <span className="text-yellow-400 font-semibold">
                      {formatPrice(item.price)}
                    </span>
                  </p>
                )}
                <span className="text-yellow-400 mt-2 text-xs font-semibold">
                  {formatPrice(item.price)} Each Item
                </span>
              </div>
            </div>
          ))}

        
        </div>

        {/* Info Cards */}
        {/* Info Cards */}
       <div className="space-y-0 mt-4 grid grid-cols-1">
  {/* Payment Status */}
  <div className="bg-[#0d0d0d] border border-gray-800 rounded-none p-2 text-center flex-col items-center justify-center w-full">
    <div className="flex items-center justify-center gap-2 whitespace-nowrap">
      <CreditCard className="w-5 h-5 text-yellow-400" />
      <h3 className="text-sm font-semibold text-yellow-400 uppercase whitespace-nowrap">
        Payment Status
      </h3>
    </div>

    <p className="text-sm text-white font-medium mb-1 whitespace-nowrap w-full">
      {getPaymentStatusText(order.payment_status)}
    </p>

    <p className="text-xs text-gray-300 mb-2 whitespace-nowrap w-full">
      Transaction Id - {order.payment_method || "N/A"}
    </p>

    {!["cancelled", "paid", "refunded", "refund-ss"].includes(order.payment_status) &&
      !["cancelled"].includes(order.status) && (
        <Button
          onClick={() => handleRetryPayment(order)}
          className="bg-green-600 hover:bg-green-700 text-white w-full mt-2 mb-2 text-sm font-semibold rounded-none"
        >
          Complete Payment
        </Button>
      )}
  </div>

  {/* Order Status */}
  <div className="bg-[#0d0d0d] border border-gray-800 rounded-none p-2 text-center flex flex-col items-center justify-center w-full">
    <div className="flex items-center justify-center gap-2 whitespace-nowrap">
      <Package className="w-5 h-5 text-yellow-400" />
      <h3 className="text-sm font-semibold text-yellow-400 uppercase whitespace-nowrap">
        Order Status
      </h3>
    </div>
    <p className="text-sm text-white font-medium mb-1 whitespace-nowrap w-full">
      {getOrderStatusText(order.status)}
    </p>
    <p className="text-xs text-gray-300 whitespace-nowrap w-full">
      Note - "{order.status_note || "User cancelled"}"
    </p>
  </div>
  <div className="bg-[#0d0d0d] border border-gray-800 rounded-none p-2 text-center flex flex-col items-center justify-center">
            <div className="flex items-center justify-center gap-1 mb-2">
              <Gift className="w-5 h-5 text-yellow-400" />
              <h3 className="text-sm font-semibold text-yellow-400 uppercase">
                Rewards / Coupon
              </h3>
            </div>
            <p className="text-sm text-white font-medium mb-1">
              Points Used:{" "}
              <span className="text-yellow-400 font-semibold">
                {(order.reward_points_used as any)?.points || 0}
              </span>
            </p>
            <p className="text-sm text-white">
              Coupon:{" "}
              <span className="text-yellow-400 font-semibold">
                {(order.coupon_code as any)?.code || "None"}
                
              </span>
            </p>
          </div>
</div>




        {/* Issue Buttons */}
        <div className="mt-2 grid grid-cols-2 sm:grid-cols-2 gap-1">
          {order.status !== "delivered" && (
            <Link
              to={`/payment-issue?orderId=${order.order_number}`}
              className="flex-1"
            >
              <Button className="bg-red-600 hover:bg-red700 text-white  w-full py-3 rounded-none font-semibold">
                Payment Issue?
              </Button>
            </Link>
          )}
          <Link
            to={`/order-related-issue?orderId=${order.order_number}`}
            className="flex-1"
          >
            <Button className="bg-red-600 hover:bg-red-700 text-white w-full py-3 rounded-none font-semibold">
              Order Issue?
            </Button>
          </Link>
        </div>
        


 < TrackOrder orderNumber={orderid} />

      </div>

    </Layout>
  );
};

export default OrderDetailsPreview;
