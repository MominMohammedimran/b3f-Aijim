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

const queryClient = new QueryClient();

function CartReminders() {
  const { cartItems } = useCart();

  useEffect(() => {
    const now = Date.now();
    const ONE_HOUR = 60 * 60 * 1000;

    if (!cartItems || cartItems.length === 0) {
      const key = "toast_empty_cart_last";
      const last = Number(localStorage.getItem(key) || 0);
      if (now - last >= ONE_HOUR) {
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
        localStorage.setItem(key, now.toString());
      }
      return;
    }

    cartItems.forEach((item) => {
      const key = `toast_item_${item.id}_last`;
      const lastShown = Number(localStorage.getItem(key) || 0);

      if (now - lastShown >= ONE_HOUR) {
        toast.custom(
          () => (
            <div className="p-1 rounded-none shadow bg-white border flex gap-3 items-center w-full">
              <img
                src={item.image}
                className="w-12 h-12 rounded-md object-cover"
                alt={item.name}
              />
              <div>
                <div className="font-semibold text-sm text-black">
                  {item.name}
                </div>
                <div className="flex flex-col text-xs font-semibold text-blue-500 gap-1">
                  <span>Still in your cart — complete your order now!</span>
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
        localStorage.setItem(key, now.toString());
      }
    });
  }, [cartItems]);

  return null;
}

function App() {
  const [loading, setLoading] = useState(true);

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
    if (typeof window === "undefined") return;

    // @ts-ignore
    window.OneSignal = window.OneSignal || [];
    // @ts-ignore
    const OneSignal = window.OneSignal;

    if (!(OneSignal as any)._initialized) {
      OneSignal.push(() => {
        OneSignal.init({
          appId: "c7a8a632-b947-44d9-90f2-8044adf9fdcc",
          serviceWorkerParam: { scope: "/" },
          serviceWorkerPath: "/OneSignalSDKWorker.js",
          serviceWorkerUpdaterPath: "/OneSignalSDKUpdaterWorker.js",
          notifyButton: { enable: true },
          allowLocalhostAsSecureOrigin: true,
          promptOptions: {
            slidedown: {
              enabled: true,
              autoPrompt: true, // 🔥 automatically ask user
            },
          },
        });

        (OneSignal as any)._initialized = true;

        // Attach event listeners safely
        OneSignal.on("subscriptionChange", (isSubscribed: boolean) => {
          console.log("User subscription changed:", isSubscribed);
        });

        OneSignal.on("notificationDisplay", (event: any) => {
          console.log("Notification displayed:", event);
        });
      });
    }
  }, []);

  if (loading) return <Preloader onComplete={() => setLoading(false)} />;

  return (
    <div className="bg-black min-h-screen">
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
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
