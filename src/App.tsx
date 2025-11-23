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
import InitFCM from "@/components/InitFCM";

const queryClient = new QueryClient();

function App() {
  const [loading, setLoading] = useState(true);

  // 🔵 FCM + Service Worker
  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((reg) => console.log("Service Worker registered:", reg))
        .catch((err) => console.error("SW registration failed:", err));
    }

    // Request notification permission
    if (Notification.permission === "default") {
      Notification.requestPermission().then((permission) => {
        if (permission === "granted") {
          console.log("User granted notifications");
        } else {
          console.log("User denied notifications");
        }
      });
    }
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

  if (loading) return <Preloader onComplete={() => setLoading(false)} />;

  return (
    <div className="bg-black min-h-screen">
      <HelmetProvider>
        {/* FCM Init — gets token & saves in Supabase */}
        <InitFCM />
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
