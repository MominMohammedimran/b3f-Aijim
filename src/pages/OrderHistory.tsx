import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import SEOHelmet from "@/components/seo/SEOHelmet";
import useSEO from "@/hooks/useSEO";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../integrations/supabase/client";
import { Order } from "../lib/types";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import NewSEOHelmet from "@/components/seo/NewSEOHelmet";
import { orderService } from "@/services/microservices/api";

const OrderHistory = () => {
  const { currentUser } = useAuth();
  const { clearCart } = useCart();
  const navigate = useNavigate();
  const seo = useSEO("/orders");

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // LIVE TICK FOR TIMER
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // FETCH ORDERS
  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) return;
      try {
        setLoading(true);

        // Delete pending expired orders
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

        const formatted = data?.map((order: any) => ({
          ...order,
          items: Array.isArray(order.items) ? order.items : [],
        }));

        setOrders(formatted);

        // Clear cart after successful order
        if (formatted.length > 0) {
          const latestOrderId = formatted[0].id;
          const lastCleared = localStorage.getItem("lastOrderId");
          if (lastCleared !== latestOrderId) {
            await clearCart();
            localStorage.setItem("lastOrderId", latestOrderId);
            toast.success("Your cart has been cleared.");
          }
        }
      } catch (err) {
        console.error("Order fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser, clearCart]);

  const getCountdown = (createdAt: string) => {
    const expiry = new Date(createdAt).getTime() + 24 * 60 * 60 * 1000;
    const diff = expiry - now.getTime();
    if (diff <= 0) return { expired: true, text: "Expired" };

    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    return { expired: false, text: `${h}h ${m}m ${s}s` };
  };

  const confirmCancelOrder = (orderId: string) => {
    toast.warning("Cancel this order?", {
      description: "This action cannot be undone.",
      action: {
        label: "Yes, Cancel",
        onClick: () => cancelOrder(orderId),
      },
  
    });
  };

  const cancelOrder = async (orderId: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: "cancelled" ,status_note:"user cancelled"})
        .eq("id", orderId);

      if (error) throw error;

      toast.success("Order cancelled");
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      setTimeout(() => {
    // This function will execute after the specified delay
    toast.success(`Refreshing the page in ${5000 / 1000} seconds...`);
    window.location.reload();}, 5000);
    } catch {
      toast.error("Cancel failed");
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

  return (
    <Layout>
      <div className="min-h-screen bg-black text-white pt-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-yellow-400">Your Orders</h1>
          <p className="text-gray-400 mb-6 text-sm">
            View, track & manage all your orders.
          </p>

          {/* EMPTY STATE */}
          {orders.length === 0 ? (
            <div className="text-center py-16 mt-10 pt-10 bg-gray-900/40 border border-gray-800 rounded-xl">
              <h3 className="text-lg font-semibold text-white bg-gray-900">
                No Orders Yet
              </h3>
              <p className="text-gray-400 text-sm mt-1">
                Start shopping your favourite apparel.
              </p>
              <Link to="/">
                <Button className="mt-5 bg-yellow-400 text-black font-semibold px-6 py-2 rounded-none hover:bg-yellow-500">
                  Shop Now
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-10">
              {orders.map((order,index) => {
                const { expired, text: timer } = getCountdown(order.created_at);

                if (expired && order.payment_status === "pending") return null;

                return (
                  <div
                    key={order.id}
                    className="bg-gray-900 border border-gray-800 rounded-none shadow-lg flex flex-col overflow-hidden"
                  >
                    {/* HEADER */}
                    <div className="p-4 border-b border-gray-800">
                        <div className="flex flex-row justify-between items-center ">
                      <h4 className="font-semibold text-md text-white">
                       {index+1}{' )'}&nbsp;&nbsp; {order.order_number}
                      </h4>
                       <div className="flex gap-3">
                            {["pending", "processing", "confirmed"].includes(
                              order.status
                            ) &&
                              !expired && (
                                <Button
                                  onClick={() => confirmCancelOrder(order.id)}
                                  className="bg-red-600 hover:bg-red-700 text-white text-sm rounded-none h-6 px-2 "
                                >
                                  Cancel
                                </Button>
                              )}
                          </div>
                          </div>

                      <div className="flex flex-wrap gap-1 mt-2">
                        <span
                          className={`px-2 py-1 text-[10px] font-semibold rounded-none ${
                            order.payment_status === "paid"
                              ? "bg-green-400 text-black"
                              : order.payment_status === "pending"
                              ? "bg-yellow-400 text-black"
                              : "bg-red-500 text-white"
                          }`}
                        >
                          Payment – {order.payment_status}
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
                           Order Status – {order.status}
                        </span>
                      </div>
                      
                      <div className="flex gap-3 items-center mt-1">
           
                {order.status_note && (
                <p className=" rounded text-white text-xs font-medium">
                     Cancellation Reason - &nbsp;
                        <span className="text-sm text-gray-300">
                                                 {order.status_note}
                                            </span>
                   
                </p>
            )}
           
            </div>
                      
                    </div>

                    {/* ITEMS LIST */}
                    <div className="p-4 space-y-3 overflow-y-auto h-auto custom-scroll">
                      {order.items.map((item, i) => (
                        <div
                          key={i}
                          className="flex gap-3 bg-black border border-gray-700 p-2 rounded-md"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-16 w-16 object-cover rounded-md border border-gray-700"
                          />

                          <div className="flex-1">
                            <p className="text-sm font-semibold text-white line-clamp-2">
                              {item.name}
                            </p>

                            {/* SIZE × QTY */}
                            <div className="flex flex-wrap gap-2 mt-1">
                              {item.sizes?.map((s, j) => (
                                <span
                                  key={j}
                                  className="text-xs text-gray-300 bg-gray-800 px-2 py-1 rounded"
                                >
                                  {s.size} × {s.quantity}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                     

                     <div className='p-2  shadow-lg rounded-none '>
    {/* COUNTDOWN BANNER (Stays at the top, clear and high-contrast) */}
{/* Displays EITHER the Payment Warning/Countdown OR the Cancelled Message */}
{(order.payment_status === "pending" || order.status === "cancelled") && (
    <div className="mb-4">
        <p className="text-xs text-center py-2.5 px-3 bg-black text-yellow-400 font-semibold rounded-none">
            {/* Conditional content based on order status */}
            {order.status === 'cancelled' ? (
                // Content for CANCELLED order
                <>
                    ❌ Cancelled order will be removed. If you have any queries, raise an issue.
                    <span className="text-white text-xs font-medium ml-2">{timer}</span>
                </>
            ) : (
                // Content for PENDING payment (URGENT WARNING)
                <>
                    Complete payment or your order will be deleted in{" "}
                    <span className="text-white text-xs font-medium">{timer}</span>
                </>
            )}
        </p>
    </div>
)}

    {/* ACTION BUTTONS CONTAINER (Flex layout for horizontal/vertical arrangement) */}
    <div className="flex flex-col space-y-3">
        {/* PAYMENT BUTTON (Primary action, high visibility) */}
        
        {order.payment_status === "pending" &&
        order.status !== "cancelled" && (
            <Button
                onClick={() => handleRetryPayment(order)}
                className="bg-green-600 hover:bg-green-700 w-full h-11 text-white text-sm font-medium rounded-none shadow-md transition duration-150 ease-in-out transform hover:scale-[1.01]"
            >
                 Complete Payment Now
            </Button>
        )}
          

        {/* VIEW DETAILS BUTTON (Secondary action, clear contrast) */}
        <Link
            to={`/order-preview/${order.order_number}`}
            className="w-full"
        >
            <Button 
             onClick={() =>  window.scrollTo(0, 0) }
            
            className="bg-gray-100 hover:bg-gray-200 w-full h-11 text-gray-800 text-sm font-semibold rounded-none border border-gray-300 transition duration-150 ease-in-out">
                View Order Details
            </Button>
        </Link>
    </div>
</div>

                    {/* DROPDOWN */}
                    <div className="border-t border-gray-800">
                      <button
                        onClick={() =>
                          setOpenDropdown(
                            openDropdown === order.id ? null : order.id
                          )
                        }
                        className="flex justify-between items-center w-full p-4 text-sm"
                      >
                        <span className="text-gray-300">Report issue</span>
                        {openDropdown === order.id ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>

                      {openDropdown === order.id && (
                        <div className="p-4 pt-0 space-y-3">
                          {/* View Details + Cancel */}
                       

                          {/* Issues */}
                          <div className="flex gap-3">
                            {order.status !== "delivered" && (
                              <Link
                                to={`/payment-issue?orderId=${order.order_number}`}
                                className="w-full"
                              >
                                <Button
                                 onClick={() =>  window.scrollTo(0, 0) }
                                 className="w-full bg-red-700 hover:bg-red-800 text-white h-10 text-sm rounded-none">
                                  Payment Issue
                                </Button>
                              </Link>
                            )}

                            <Link
                              to={`/order-related-issue?orderId=${order.order_number}`}
                              className="w-full"
                            >
                              <Button 
                               onClick={() =>  window.scrollTo(0, 0) }
                              className="w-full bg-red-700 hover:bg-red-800 text-white h-10 text-sm rounded-none">
                                Order Issue
                              </Button>
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* DATE */}
                    <p className="text-[11px] text-center font-semibold text-gray-200 py-3">
                      Placed on{" "}
                      {new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
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
