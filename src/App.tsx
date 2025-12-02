import React, { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster, toast } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./context/AuthContext";
import CartProvider, { useCart } from "./context/CartContext";
import { ActiveProductProvider } from "./context/ActiveProductContext";
import Preloader from "./Preloader";
import AppRoutes from "./routes";
import { initializeSecurity } from "./utils/securityUtils";
import { useReactQueryStorage } from "./utils/useReactQueryStorage";
import {trackReferral }from "./utils/trackReferral";


import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "./utils/product";
const queryClient = new QueryClient();

const PRODUCT_STORAGE_KEY = "toast_products"; // array of { id, lastShown }
const CART_STORAGE_KEY = "toast_cart"; // array of { id, lastShown }

function ProductSuggestionReminder() {
  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!products || products.length === 0) return;

    const now = Date.now();
    const DELAY = 55 * 60 * 1000; // 1 hour 5 min

    // Get stored product array or initialize
    const stored: { id: string; lastShown: number }[] = JSON.parse(
      localStorage.getItem(PRODUCT_STORAGE_KEY) || "[]"
    );

    // Filter products that were not shown recently
    const availableProducts = products.filter(
      (p) => !stored.some((s) => s.id === p.id && now - s.lastShown < DELAY)
    );

    if (availableProducts.length === 0) return;

    // Pick random product
    const product =
      availableProducts[Math.floor(Math.random() * availableProducts.length)];

    // Discount logic
    const salePrice = product.price;
    const originalPrice =
      typeof product.original_price === "number" &&
      product.original_price > salePrice
        ? product.original_price
        : salePrice;
    const discountPercent =
      originalPrice > salePrice
        ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
        : 0;

    // Show toast
    toast.custom(
      () => (
        <a
          href={`/product/${product.code}`}
          className="flex items-center gap-3 p-2 bg-white border border-gray-200 rounded-none text-black w-full"
        >
          <img
            src={product.image}
            className="w-12 h-12 rounded-md object-cover"
            alt={product.name}
          />
          <div className="flex flex-col">
            <p className="font-semibold text-sm line-clamp-1">{product.name}</p>

            {/* Highlight Sale Price and Discount */}
            {discountPercent > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-green-600 font-bold text-sm">
                  ₹{salePrice}
                </span>
                <span className="bg-red-500 text-white text-[10px] px-1 py-[1px] rounded">
                  {discountPercent}% OFF
                </span>
              </div>
            )}

            {!discountPercent && (
              <span className="text-black font-semibold mt-1">
                ₹{salePrice}
              </span>
            )}

            <span className="text-blue-500 text-xs underline mt-1">
              View Product →
            </span>
          </div>
        </a>
      ),
      { duration: 6000 }
    );

    // Update storage
    const others = stored.filter((s) => s.id !== product.id);
    localStorage.setItem(
      PRODUCT_STORAGE_KEY,
      JSON.stringify([...others, { id: product.id, lastShown: now }])
    );
  }, [products]);

  return null;
}

function CartReminders() {
  const { cartItems } = useCart();

  useEffect(() => {
    const now = Date.now();
    const ONE_HOUR = 60 * 60 * 1000;

    // Get stored cart reminders
    const stored: { id: string; lastShown: number }[] = JSON.parse(
      localStorage.getItem(CART_STORAGE_KEY) || "[]"
    );

    if (!cartItems || cartItems.length === 0) {
      // Empty cart reminder
      const emptyCart = stored.find((s) => s.id === "emptyCart");
      if (!emptyCart || now - emptyCart.lastShown >= ONE_HOUR) {
        toast.custom(
          () => (
            <div className="p-3 rounded-lg shadow bg-white border flex gap-2 items-center">
              <span className="text-sm font-medium text-black">
                Your cart is empty 🛒 — Continue shopping!
              </span>
            </div>
          ),
          { duration: 4000 }
        );

        const others = stored.filter((s) => s.id !== "emptyCart");
        localStorage.setItem(
          CART_STORAGE_KEY,
          JSON.stringify([...others, { id: "emptyCart", lastShown: now }])
        );
      }
      return;
    }

    // Cart item reminders
    cartItems.forEach((item) => {
      const lastItem = stored.find((s) => s.id === item.id);
      if (!lastItem || now - lastItem.lastShown >= ONE_HOUR) {
        toast.custom(
          () => (
            <div className="p-1 rounded-none shadow bg-white border flex gap-3 items-center w-full">
              <img
                src={item.image}
                className="w-12 h-12 rounded-md object-cover"
                alt={item.name}
              />
              <div>
                <div className="font-semibold text-sm text-black line-clamp-1">
                  {item.name}
                </div>
                <div className="flex flex-col text-[10px] font-semibold text-blue-500 gap-1">
                  <span>Still in your cart — complete order now!</span>
                  <a
                    href="/cart"
                    className="bg-red-500 text-white text-center w-full px-2 py-1 rounded"
                  >
                    Make Payment
                  </a>
                </div>
              </div>
            </div>
          ),
          { duration: 5000 }
        );

        const others = stored.filter((s) => s.id !== item.id);
        localStorage.setItem(
          CART_STORAGE_KEY,
          JSON.stringify([...others, { id: item.id, lastShown: now }])
        );
      }
    });
  }, [cartItems]);

  return null;
}

function App() {
  const [loading, setLoading] = useState(true);
  const [showPreloader, setShowPreloader] = useState(false);
  
  useReactQueryStorage(queryClient, "local");
  // 🧹 Auto-Unregister All Service Workers (runs once)
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((regs) => {
        regs.forEach((reg) => {
          reg.unregister();
          // console.log("Service Worker auto-unregistered");
        });
      });
    }
    trackReferral();
  }, []);

  // 🔥 VERSION CHECK — auto refresh if new version
  useEffect(() => {
    let currentVersion: string | null = null;

    const checkVersion = async () => {
      try {
        const res = await fetch(`/version.json?cache=${Date.now()}`);
        const data = await res.json();

        if (!currentVersion) {
          currentVersion = data.version;
        } else if (currentVersion !== data.version) {
          toast.info("New update available!", {
            action: {
              label: "Refresh",
              onClick: () => window.location.reload(),
            },
          });
        }
      } catch (error) {
        console.log("Version check failed", error);
      }
    };

    const interval = setInterval(checkVersion, 30000); // every 30 sec
    return () => clearInterval(interval);
  }, []);

  // 🔐 Security + preloader
  useEffect(() => {
    initializeSecurity();

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && ["s", "u", "i", "j", "p"].includes(e.key.toLowerCase()))
      ) {
        e.preventDefault();
        toast.warning("Action disabled for security");
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.userSelect = "none";

    const timer = setTimeout(() => setLoading(false), 1000);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
    };
  }, []);

  // ✅ OneSignal setup (singleton, safe)

  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisited");

    if (!hasVisited) {
      // Show preloader only first time
      setShowPreloader(true);

      // Mark as visited so next time it won't show
      localStorage.setItem("hasVisited", "true");
    }
  }, []);

  if (showPreloader) {
    return <Preloader onComplete={() => setShowPreloader(false)} />;
  }

  return (
    <div className="bg-black min-h-screen">
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <ProductSuggestionReminder />
          <AuthProvider>
            <CartProvider>
              <ActiveProductProvider>
                <TooltipProvider>
                  <CartReminders />
                  <AppRoutes />
                  <Toaster position="top-right" expand />
                </TooltipProvider>
              </ActiveProductProvider>
            </CartProvider>
          </AuthProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </div>
  );
}

export default App;
