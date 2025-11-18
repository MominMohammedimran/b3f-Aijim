import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import SEOHelmet from "@/components/seo/SEOHelmet";
import useSEO from "@/hooks/useSEO";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../integrations/supabase/client";
import { Order } from "../lib/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateInventoryFromPaidOrders } from "@/hooks/useProductInventory";
import { Loader2 } from "lucide-react";
import { useCart } from "@/context/CartContext";

const OrderHistory = () => {
  const { currentUser } = useAuth();
  const { clearCart } = useCart();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const seo = useSEO("/orders");
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) return;
      try {
        setLoading(true);
        await updateInventoryFromPaidOrders();

        const twentyFourHoursAgo = new Date();
        twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

        await supabase
          .from("orders")
          .delete()
          .eq("user_id", currentUser.id)
          .eq("payment_status", "pending")
          .lt("created_at", twentyFourHoursAgo.toISOString());

        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const transformed: Order[] =
          data?.map((order: any) => ({
            ...order,
            items: Array.isArray(order.items)
              ? order.items.map((item: any) => ({
                  ...item,
                  sizes: Array.isArray(item.sizes) ? item.sizes : [],
                }))
              : [],
          })) || [];

        setOrders(transformed);

        // clear cart after fresh order placement
        if (transformed.length > 0) {
          const latestOrderId = transformed[0].id;
          const lastClearedOrder = localStorage.getItem("lastOrderId");

          if (lastClearedOrder !== latestOrderId) {
            await clearCart();
            localStorage.setItem("lastOrderId", latestOrderId);
            toast.success("Your cart has been cleared after order placement.");
          }
        }
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser, clearCart]);

  const handleRemoveOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", orderId);

      if (error) throw error;

      toast.success("Order cancelled successfully");
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
    } catch {
      toast.error("Failed to cancel order");
    }
  };

  const getCountdown = (createdAt: string) => {
    const expiry = new Date(createdAt).getTime() + 24 * 60 * 60 * 1000;
    const diff = expiry - now.getTime();
    if (diff <= 0) return { text: "Expired", expired: true };

    const hrs = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    return { text: `${hrs}h ${mins}m ${secs}s`, expired: false };
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

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center pt-20 text-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-yellow-400 mb-4" />
          <p className="text-gray-400 text-sm font-semibold">
            Fetching your orders...
          </p>
        </div>
      </Layout>
    );
  }

 return (
  <Layout>
    <SEOHelmet {...{ ...seo, keywords: seo.keywords?.join(", ") }} />

    <div className="min-h-screen bg-black text-white pt-20">
      <div className="container mx-auto px-4">

        {/* HEADER */}
        <h1 className="text-2xl font-bold text-yellow-400">Your Orders</h1>
        <p className="text-gray-400 mb-6 text-sm">
          Track & manage your orders easily.
        </p>

        {/* EMPTY STATE */}
        {orders.length === 0 ? (
          <div className="text-center py-14 border border-gray-800 bg-gray-900/40 rounded-none shadow-xl backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-2 text-white">No Orders Found</h3>
            <p className="text-gray-400 mb-4 text-sm">
              You haven’t placed any order yet.
            </p>
            <Link to="/">
              <Button className="bg-yellow-400 text-black px-6 py-2 hover:bg-yellow-500 font-semibold rounded-none">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 pb-10">

            {orders.map((order) => {
              const { text: countdown, expired } = getCountdown(order.created_at);

              if (expired && ["pending", "cancelled"].includes(order.payment_status))
                return null;

              return (
                <div
                  key={order.id}
                  className="
                    bg-gray-900 border border-gray-800 
                    rounded-none shadow-lg hover:shadow-yellow-400/10 
                    transition-all duration-300 flex flex-col
                    h-[420px]
                  "
                >
                  {/* HEADER */}
                  <div className="p-4 border-b border-gray-800">
                    <h4 className="font-bold text-md text-white mb-2">
                      Order #{order.order_number}
                    </h4>

                    <div className="flex flex-wrap gap-1">
                      <span
                        className={`px-2 py-1 text-[10px] font-semibold rounded-none ${
                          order.payment_status === "paid"
                            ? "bg-green-400 text-black"
                            : order.payment_status === "pending"
                            ? "bg-yellow-400 text-black"
                            : "bg-red-500 text-white"
                        }`}
                      >
                        Payment - {order.payment_status}
                      </span>

                      <span
                        className={`px-2 py-1 text-[10px] font-semibold rounded-none ${
                          order.status === "delivered"
                            ? "bg-green-500 text-black"
                            : order.status === "cancelled"
                            ? "bg-red-500 text-white"
                            : order.status === "confirmed"
                            ? "bg-blue-500 text-black"
                            : order.status === "processing"
                            ? "bg-yellow-500 text-black"
                            : "bg-gray-600 text-white"
                        }`}
                      >
                        Status - {order.status}
                      </span>
                    </div>
                  </div>

                  {/* SCROLLABLE ITEMS (equal height cards) */}
                  <div className="p-4 space-y-1 overflow-y-auto flex-1 custom-scroll">
                    {order.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex gap-3 bg-black border border-gray-700 p-2 rounded-none"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-16 w-16 object-cover border border-gray-700 rounded-none"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white line-clamp-2">
                            {item.name}
                          </p>

                          <div className="flex gap-3 flex-wrap mt-1">
                            {item.sizes?.map((s, j) => (
                              <span key={j} className="text-xs text-gray-300">
                                <b>{s.size}</b> × {s.quantity}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* COUNTDOWN */}
                  {order.payment_status === "pending" && !expired && (
                    <p className="text-xs text-center text-yellow-400 font-medium px-3 pb-2">
                      Complete payment in <span className="text-white">{countdown}</span>
                    </p>
                  )}

                  {/* PAYMENT BUTTON */}
                {!["cancelled", "paid", "refunded", "refund-ss"].includes(order.payment_status) &&
  order.status !== "cancelled" && (
    <Button
      onClick={() => handleRetryPayment(order)}
      className="bg-green-600 hover:bg-green-700 text-white w-full text-sm font-semibold rounded-none py-2 mx-auto block"
    >
      Complete Payment
    </Button>
)}


                  {/* BOTTOM ACTIONS */}
<div className="p-4 border-t border-gray-800 grid grid-cols-2 gap-3">
  <Link to={`/order-preview/${order.order_number}`}>
    <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black text-sm font-semibold rounded-none h-10">
      View Details
    </Button>
  </Link>

  {["pending", "processing", "confirmed"].includes(order.status) && (
    <Button
      onClick={() => handleRemoveOrder(order.id)}
      disabled={expired}
      className={`w-full text-sm font-semibold rounded-none h-10 ${
        expired
          ? "bg-gray-700 text-gray-400"
          : "bg-red-600 hover:bg-red-700 text-white"
      }`}
    >
      Cancel
    </Button>
  )}
</div>

{/* EXTRA BUTTONS */}
<div className="px-4 pb-4 grid grid-cols-2 gap-3">
  {order.status !== "delivered" && (
    <Link to={`/payment-issue?orderId=${order.order_number}`}>
      <Button className="w-full bg-red-700 hover:bg-red-800 text-white h-10 text-sm rounded-none">
        Payment Issue
      </Button>
    </Link>
  )}

  <Link to={`/order-related-issue?orderId=${order.order_number}`}>
    <Button className="w-full bg-red-700 hover:bg-red-800 text-white h-10 text-sm rounded-none">
      Order Issue
    </Button>
  </Link>
</div>


                  {/* FOOTER DATE */}
                  <p className="text-[11px] text-center text-gray-400 pb-3">
                    Booked on{" "}
                    {new Date(order.created_at).toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  </Layout>
);

};

export default OrderHistory;
