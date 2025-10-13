import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from './context/AuthContext';
import CartProvider from './context/CartContext';
import { ActiveProductProvider } from './context/ActiveProductContext';
import Preloader from './Preloader';
import AppRoutes from './routes';
import { initializeSecurity } from './utils/securityUtils';

const queryClient = new QueryClient();

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initializeSecurity();

    // 🧹 Automatically remove old Service Workers and Caches
    const cleanupOldCachesAndSW = async () => {
      try {
        // Unregister all service workers
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.unregister();
            console.log('🧹 Unregistered Service Worker:', registration.scope);
          }
        }

        // Delete all caches
        if ('caches' in window) {
          const cacheNames = await caches.keys();
          for (const cacheName of cacheNames) {
            await caches.delete(cacheName);
            console.log('🗑 Deleted Cache:', cacheName);
          }
        }

        console.log('✅ All service workers and caches cleared');
      } catch (err) {
        console.error('❌ Error clearing service workers/caches:', err);
      }
    };

    cleanupOldCachesAndSW();

    // Simulated preloader delay
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