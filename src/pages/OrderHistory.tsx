import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import SEOHelmet from "@/components/seo/SEOHelmet";
import useSEO from "@/hooks/useSEO";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../integrations/supabase/client";
import { Order, CartItem } from "../lib/types";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateInventoryFromPaidOrders } from "@/hooks/useProductInventory";
import { Loader2 } from "lucide-react";

const OrderHistory = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const seo = useSEO("/orders");

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
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

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

  if (loading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center pt-20 text-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-yellow-400 mb-4" />
          <p className="text-gray-400 text-sm font-semibold">Fetching your orders...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEOHelmet {...{ ...seo, keywords: seo.keywords?.join(", ") }} />
      <div className="min-h-screen bg-black text-white pt-20">
        <div className="container mx-auto px-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-yellow-400 mb-1">
            Your Orders
          </h1>
          <p className="text-gray-400 mb-6 text-sm">
            Track and manage all your orders easily
          </p>

          {orders.length === 0 ? (
            <div className="text-center py-12 border border-gray-700 bg-gray-900/30 rounded-md shadow-md">
              <h3 className="text-lg font-semibold mb-3">No Orders Found</h3>
              <Link to="/">
                <Button className="bg-yellow-400 text-black font-semibold hover:bg-yellow-500 rounded-none">
                  Start Shopping
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {orders.map((order) => {
                const { text: countdown, expired } = getCountdown(order.created_at);
                if (
                  expired &&
                  (order.payment_status === "pending" || order.status === "cancelled")
                )
                  return null;

                return (
                  <div
                    key={order.id}
                    className="relative bg-gradient-to-b from-gray-900 to-black border border-gray-800 rounded-md shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    {/* Header */}
                    <div className="p-3 border-b border-gray-800 flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-white text-sm">
                          Order #{order.order_number}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {new Date(order.created_at).toLocaleDateString("en-US", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>

                      <div className="text-right text-[10px]">
                        <span
                          className={`block font-bold uppercase px-2 py-0.5 rounded-sm ${
                            order.payment_status === "paid"
                              ? "bg-green-500 text-black"
                              : "bg-red-600 text-white"
                          }`}
                        >
                          {order.payment_status}
                        </span>
                        <span
                          className={`mt-1 block font-bold uppercase px-2 py-0.5 rounded-sm ${
                            order.status === "delivered"
                              ? "bg-green-400 text-black"
                              : "bg-yellow-400 text-black"
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="p-3 space-y-2">
                      {order.items.map((item, i) => (
                        <div
                          key={i}
                          className="flex gap-3 bg-gray-950 border border-gray-800 p-2 rounded-md"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            loading="lazy"
                            className="h-14 w-14 object-cover rounded-sm border border-gray-700"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-semibold line-clamp-2">{item.name}</p>
                            <div className='flex items-center gap-4  flex-wrap '>
                            {item.sizes?.map((s, j) => (
                              
                              <p
                                key={j}
                                className="text-[11px] text-gray-200 font-medium mt-1"
                              >
                                 <b>{s.size}</b> x <b>{s.quantity}</b> 
                              </p>
                            ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Timer */}
                    {order.payment_status === "pending" && (
                      <div className="text-center text-xs text-yellow-400 font-semibold px-3 pb-2">
                        Complete payment within{" "}
                        <span className="text-white">{countdown}</span> before expiry.
                      </div>
                    )}
                    {order.status === "cancelled" && (
                      <p className="text-center text-xs text-red-400 font-semibold px-3 pb-2">
                        Order cancelled. Auto-removal after {countdown}.
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 p-3 border-t border-gray-800">
                      <Link to={`/order-preview/${order.order_number}`} className="flex-1">
                        <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-sm rounded-none">
                          View Details
                        </Button>
                      </Link>
                      {["pending", "processing", "confirmed"].includes(order.status) && (
                        <Button
                          onClick={() => handleRemoveOrder(order.id)}
                          disabled={expired}
                          className={`flex-1 text-sm font-semibold rounded-none ${
                            expired
                              ? "bg-gray-700 text-gray-400 cursor-not-allowed"
                              : "bg-red-600 hover:bg-red-700 text-white"
                          }`}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
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
