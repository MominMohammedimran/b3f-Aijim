import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const VAPID_PUBLIC_KEY =
  'BEZyguY1rRxan4xEdlHZ21O5x1XXZHS96WlokPAswM6TzeS7WdGzwTN1V4Tr3JLKN56iAZFZw3TJSIYNO7pvfi8';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  // ✅ Step 1: Register Service Worker on load
  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      registerServiceWorker();
    }
  }, []);

  // ✅ Step 2: Always check + auto-ask permission every time user opens site
  useEffect(() => {
    if (!isSupported) return;

    if (Notification.permission === 'default') {
      // Ask immediately if permission not yet granted/denied
      subscribeToNotifications();
    } else if (Notification.permission === 'granted') {
      // Ensure subscription is valid
      checkExistingSubscription();
    } else {
      console.warn('🔕 Notifications blocked by user.');
    }
  }, [isSupported, registration]);

  const registerServiceWorker = async () => {
    try {
      const reg = await navigator.serviceWorker.register('/service-worker.js');
      setRegistration(reg);

      const sub = await reg.pushManager.getSubscription();
      setIsSubscribed(!!sub);
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
    }
  };

  const checkExistingSubscription = async () => {
    if (!registration) return;
    const sub = await registration.pushManager.getSubscription();
    if (sub) {
      setIsSubscribed(true);
    }
  };

  const subscribeToNotifications = async () => {
    if (!registration) {
      console.warn('⚠️ Service worker not ready yet');
      return;
    }

    setIsLoading(true);
    try {
      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        console.warn('User denied notification permission');
        setIsLoading(false);
        return;
      }

      const key = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: key,
      });

      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from('push_subscribers').upsert(
        [
          {
            user_id: user?.id || null,
            subscription: subscription.toJSON(),
            endpoint: subscription.endpoint,
          },
        ],
        { onConflict: 'endpoint' }
      );

      if (error) throw error;

      setIsSubscribed(true);
      toast.success('Notifications enabled!', {
        description: 'You’ll now receive order updates and offers.',
      });
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isSupported,
    isSubscribed,
    isLoading,
  };
};
