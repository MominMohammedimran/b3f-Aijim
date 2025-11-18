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
import { cleanupServiceWorkers } from "./utils/cleanup-sw";
import { startVersionCheck, stopVersionCheck } from "./version-check";
import { unregisterServiceWorkers } from "./unregisterServiceWorker";

const queryClient = new QueryClient();

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  initializeSecurity();
  
  // 🚫 Unregister all existing service workers
  unregisterServiceWorkers();

  cleanupServiceWorkers();
  startVersionCheck(); // 🚀 start auto version updater

  /** 🚫 Disable right-click & inspector **/
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
    stopVersionCheck(); // cleanup
    clearTimeout(timer);
  };
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
