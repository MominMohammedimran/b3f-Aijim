import React from "react";
import { Link } from "react-router-dom";
import Layout from "../components/layout/Layout";
import NewSEOHelmet from "@/components/seo/NewSEOHelmet";
import useSEO from "@/hooks/useSEO";
import { Button } from "@/components/ui/button";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { addInventoryUpdateListener } from "@/hooks/useProductInventory";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckoutStepper } from "@/components/checkout/CheckoutStepper";
import CartItems from "@/components/cart/CartItems";
import OrderSummary from "@/components/cart/OrderSummary";
import EmptyCart from "@/components/cart/EmptyCart";

const Cart = () => {
  const { currentUser } = useAuth();
  const [productStocks, setProductStocks] = React.useState<
    Record<string, Record<string, number>>
  >({});
  const [stocksLoading, setStocksLoading] = React.useState(true);

  const seo = useSEO("/cart");

  const { cartItems, clearCart, loading } = useCart();

  // Fetch product stocks for all cart items
  const fetchProductStocks = React.useCallback(async () => {
    if (cartItems.length === 0) {
      setStocksLoading(false);
      return;
    }

    setStocksLoading(true);
    try {
      const stocks: Record<string, Record<string, number>> = {};

      for (const item of cartItems) {
        const { data: product, error } = await supabase
          .from("products")
          .select("variants")
          .eq("id", item.product_id)
          .single();

        if (!error && product?.variants && Array.isArray(product.variants)) {
          const productStockMap: Record<string, number> = {};
          product.variants.forEach((variant: any) => {
            if (
              variant &&
              typeof variant === "object" &&
              variant.size &&
              typeof variant.stock === "number"
            ) {
              productStockMap[variant.size] = variant.stock;
            }
          });
          stocks[item.product_id] = productStockMap;
        }
      }

      setProductStocks(stocks);
    } catch (error) {
      // console.error('Error fetching product stocks:', error);
    } finally {
      setStocksLoading(false);
    }
  }, [cartItems]);

  // Check if any item is out of stock
  const hasOutOfStockItems = React.useMemo(() => {
    return cartItems.some((item) => {
      const productStock = productStocks[item.product_id];
      if (!productStock) return false;

      return item.sizes.some((sizeItem) => {
        const availableStock = productStock[sizeItem.size] || 0;
        return sizeItem.quantity > availableStock;
      });
    });
  }, [cartItems, productStocks]);

  // Fetch stocks on component mount and when cart changes
  React.useEffect(() => {
    fetchProductStocks();
  }, [fetchProductStocks]);

  // Listen for inventory updates
  React.useEffect(() => {
    const unsubscribe = addInventoryUpdateListener(() => {
      fetchProductStocks();
    });

    return unsubscribe;
  }, [fetchProductStocks]);

  // Monitor orders table and clear cart when new orders are created
  React.useEffect(() => {
    if (!currentUser) return;

    let lastOrderCount = 0;

    const checkNewOrders = async () => {
      try {
        const { data: orders, error } = await supabase
          .from("orders")
          .select("id")
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false });

        if (!error && orders) {
          const currentOrderCount = orders.length;

          // If there are new orders since last check, clear cart
          if (lastOrderCount > 0 && currentOrderCount > lastOrderCount) {
            await clearCart();
            toast.success("Cart cleared - order placed successfully!");
          }

          lastOrderCount = currentOrderCount;
        }
      } catch (error) {
        //  console.error('Error checking orders:', error);
      }
    };

    // Initial check
    checkNewOrders();

    // Set up real-time subscription for orders
    const subscription = supabase
      .channel("orders")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `user_id=eq.${currentUser.id}`,
        },
        () => {
          clearCart();
          toast.success("Cart cleared - order placed successfully!");
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentUser, clearCart]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-10 mt-12 text-center">
          <div className="flex justify-center items-center h-64 mt-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
          </div>

          {!currentUser && (
            <div className="mt-6">
              <p className="text-gray-300 mb-2">You are not signed in</p>
              <Link to="/signin">
                <Button variant="outline">Sign In</Button>
              </Link>
            </div>
          )}
        </div>
      </Layout>
    );
  }

  if (cartItems.length === 0) {
    return <EmptyCart />;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 mt-10">
        <CheckoutStepper currentStep={1} />
        <div className="flex justify-between items-center mt-5 mb-6">
          <h1 className="text-lg font-bold leading-relaxed">
            Shopping Cart ({cartItems.length})
          </h1>
          <Button
            variant="outline"
            size="sm"
            className="px-2 hover:bg-red-500 hover:text-white"
            onClick={clearCart}
          >
            Clear Cart
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <CartItems cartItems={cartItems} productStocks={productStocks} />
          <OrderSummary hasOutOfStockItems={hasOutOfStockItems} />
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
