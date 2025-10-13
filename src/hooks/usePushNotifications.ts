import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const VAPID_PUBLIC_KEY =
  'BEZyguY1rRxan4xEdlHZ21O5x1XXZHS96WlokPAswM6TzeS7WdGzwTN1V4Tr3JLKN56iAZFZw3TJSIYNO7pvfi8';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Register service worker and auto-ask permission
  useEffect(() => {
    const setupPush = async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push not supported');
        return;
      }
      setIsSupported(true);

      try {
        const reg = await navigator.serviceWorker.register('/service-worker.js');
        setRegistration(reg);

        const sub = await reg.pushManager.getSubscription();
        setIsSubscribed(!!sub);

        if (!sub) {
          // Ask for permission immediately
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            await subscribeToNotifications(reg);
          }
        }
      } catch (error) {
        console.error('Error setting up push:', error);
      }
    };

    setupPush();
  }, []);

  // ✅ Subscribe user and save to Supabase
  const subscribeToNotifications = async (reg?: ServiceWorkerRegistration) => {
    try {
      setIsLoading(true);
      const registrationToUse = reg || registration;
      if (!registrationToUse) {
        toast.error('Service worker not ready');
        return;
      }

      const sub = await registrationToUse.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('push_subscribers')
        .upsert([
          {
            user_id: user?.id || null,
            endpoint: sub.endpoint,
            subscription: sub.toJSON(),
          },
        ], { onConflict: 'endpoint' });

      if (error) {
        console.error('Failed to save push subscription:', error);
        toast.error('Failed to save subscription');
      } else {
        setIsSubscribed(true);
        toast.success('Notifications enabled!');
      }
    } catch (err) {
      console.error('Push subscription error:', err);
      toast.error('Failed to enable notifications');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isSupported,
    isSubscribed,
    isLoading,
    subscribeToNotifications,
  };
};