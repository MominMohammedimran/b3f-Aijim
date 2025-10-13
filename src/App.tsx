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

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then((registration) => {
            console.log('✅ Service Worker registered:', registration);

            // Listen for updates to the Service Worker
            registration.onupdatefound = () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.onstatechange = () => {
                  if (
                    newWorker.state === 'installed' &&
                    navigator.serviceWorker.controller
                  ) {
                    console.log('🆕 New Service Worker detected. Preparing to update...');

                    // Notify user and prepare reload
                    toast.info('Refreshing to latest version...', {
                      duration: 2500,
                      position: 'top-right',
                    });

                    const scheduleReload = () => {
                      const connection = (navigator as any).connection;
                      const goodNetwork =
                        !connection ||
                        connection.effectiveType === '4g' ||
                        connection.downlink > 1.5;

                      if (goodNetwork && document.visibilityState === 'visible') {
                        console.log('♻️ Triggering update...');
                        newWorker.postMessage({ type: 'SKIP_WAITING' });
                      } else {
                        console.log('⏳ Waiting for idle or better network...');
                        setTimeout(scheduleReload, 5000);
                      }
                    };

                    if ('requestIdleCallback' in window) {
                      (window as any).requestIdleCallback(scheduleReload, {
                        timeout: 8000,
                      });
                    } else {
                      setTimeout(scheduleReload, 8000);
                    }
                  }
                };
              }
            };
          })
          .catch((err) =>
            console.error('❌ Service Worker registration failed:', err)
          );

        // When the new Service Worker takes control
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          console.log('✅ New Service Worker activated — refreshing...');
          toast.success('App updated! Reloading...', {
            duration: 1500,
            position: 'top-right',
          });
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        });
      });
    }

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
