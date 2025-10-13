import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster, toast } from 'sonner';
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

    // ✅ Register Service Worker and handle updates automatically
    {/*if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then((registration) => {
            console.log('✅ Service Worker registered');

            // 🔹 Watch for new SW versions being installed
            registration.onupdatefound = () => {
              const newWorker = registration.installing;
              if (!newWorker) return;

              newWorker.onstatechange = () => {
                if (
                  newWorker.state === 'installed' &&
                  navigator.serviceWorker.controller
                ) {
                  console.log('🆕 New Service Worker detected — preparing to activate.');

                  // Notify user visually
                  toast.info('Updating to the latest version...', {
                    duration: 3000,
                    position: 'top-right',
                  });

                  const attemptActivation = () => {
                    const connection = (navigator as any).connection;
                    const isGoodNetwork =
                      !connection ||
                      connection.effectiveType === '4g' ||
                      connection.downlink > 1.5;

                    // Only activate when online & page visible
                    if (
                      navigator.onLine &&
                      isGoodNetwork &&
                      document.visibilityState === 'visible'
                    ) {
                      console.log('♻️ Activating new Service Worker...');
                      newWorker.postMessage({ type: 'SKIP_WAITING' });
                    } else {
                      console.log('⏳ Waiting for good network or active tab...');
                      setTimeout(attemptActivation, 4000);
                    }
                  };

                  if ('requestIdleCallback' in window) {
                    (window as any).requestIdleCallback(attemptActivation, {
                      timeout: 7000,
                    });
                  } else {
                    setTimeout(attemptActivation, 7000);
                  }
                }
              };
            };
          })
          .catch((err) => {
            console.error('❌ Service Worker registration failed:', err);
            toast.error('Failed to register service worker', {
              position: 'top-right',
            });
          });

        // 🔹 Listen when a new SW takes control
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('✅ New Service Worker activated — refreshing...');
          toast.success('AIJIM updated! Reloading...', {
            duration: 1800,
            position: 'top-right',
          });

          setTimeout(() => {
            window.location.reload();
          }, 1800);
        });
      });
    }*/}

    // Simulated initial loading
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <Preloader onComplete={() => setLoading(false)} />;
  }

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
