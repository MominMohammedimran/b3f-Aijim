import React, { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster, toast } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./context/AuthContext";
import CartProvider from "./context/CartContext";
import { ActiveProductProvider } from "./context/ActiveProductContext";
import Preloader from "./Preloader";
import AppRoutes from "./routes";
import { initializeSecurity } from "./utils/securityUtils";

const queryClient = new QueryClient();

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeSecurity();

    /**
     * 🧹 1. Cleanup old Service Workers and Caches
     */
    const cleanupSW = async () => {
      try {
        if ("serviceWorker" in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          for (const reg of regs) {
            await reg.unregister();
            console.log("🧹 Unregistered SW:", reg.scope);
          }
        }
        if ("caches" in window) {
          const names = await caches.keys();
          for (const name of names) {
            await caches.delete(name);
            console.log("🗑 Deleted Cache:", name);
          }
        }
      } catch (e) {
        console.error("❌ Cleanup failed:", e);
      }
    };

    /**
     * ⚙️ 2. Register new Service Worker (auto-refresh when updated)
     */
    const registerSW = async () => {
      if (!("serviceWorker" in navigator)) return;

      try {
        const reg = await navigator.serviceWorker.register("/service-worker.js");
        console.log("✅ Registered Service Worker:", reg);

        reg.onupdatefound = () => {
          const newSW = reg.installing;
          if (!newSW) return;
          newSW.onstatechange = () => {
            if (
              newSW.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              toast.info("New version found. Updating...");
              newSW.postMessage({ type: "SKIP_WAITING" });
            }
          };
        };

        navigator.serviceWorker.addEventListener("controllerchange", () => {
          toast.success("App updated! Reloading...");
          setTimeout(() => window.location.reload(), 1500);
        });
      } catch (err) {
        console.error("SW registration failed:", err);
      }
    };

    /**
     * 🚫 3. Disable Chrome Download Options & Dev Tools Shortcuts
     */
    const disableDownloads = () => {
      const preventContext = (e: MouseEvent) => e.preventDefault();
      const preventKeys = (e: KeyboardEvent) => {
        // Disable Ctrl+S, Ctrl+U, Ctrl+Shift+I, F12
        if (
          (e.ctrlKey &&
            ["s", "u", "i", "j", "p"].includes(e.key.toLowerCase())) ||
          e.key === "F12"
        ) {
          e.preventDefault();
          toast.warning("Action disabled for security");
        }
      };

      document.addEventListener("contextmenu", preventContext);
      document.addEventListener("keydown", preventKeys);

      // Disable selection and dragging
      document.body.style.userSelect = "none";
      document.body.style.webkitUserDrag = "none";
      document.body.style.webkitTouchCallout = "none";

      return () => {
        document.removeEventListener("contextmenu", preventContext);
        document.removeEventListener("keydown", preventKeys);
      };
    };

    // Run tasks
    cleanupSW().then(registerSW);
    disableDownloads();

    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
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