
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./context/AuthContext";
import CartProvider from "./context/CartContext";
import { ActiveProductProvider } from "./context/ActiveProductContext";
import { SettingsProvider } from "./context/SettingsContext"; // Import SettingsProvider
import Preloader from "./Preloader";
import AppRoutes from "./routes";

// New imports
import ProductSuggestionReminder from "./app/ProductSuggestionReminder";
import CartReminders from "./app/CartReminders";
import { useAppLogic } from "./app/useAppLogic";

const queryClient = new QueryClient();

function App() {
  const { showPreloader, setShowPreloader } = useAppLogic(queryClient);

  if (showPreloader) {
    return <Preloader onComplete={() => setShowPreloader(false)} />;
  }

  return (
    <div className="bg-black min-h-screen">
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <ProductSuggestionReminder />
          <AuthProvider>
            <SettingsProvider> {/* Add SettingsProvider here */}
              <CartProvider>
                <ActiveProductProvider>
                  <TooltipProvider>
                    <CartReminders />
                    <AppRoutes />
                    <Toaster position="top-right" expand />
                  </TooltipProvider>
                </ActiveProductProvider>
              </CartProvider>
            </SettingsProvider>
          </AuthProvider>
        </QueryClientProvider>
      </HelmetProvider>
    </div>
  );
}

export default App;
