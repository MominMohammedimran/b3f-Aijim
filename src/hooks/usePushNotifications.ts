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
        console.warn('🚫 Push not supported');
        return;
      }

      setIsSupported(true);

      try {
        console.log('🔄 Registering service worker...');
        const reg = await navigator.serviceWorker.register('/service-worker.js');

        await navigator.serviceWorker.ready; // ✅ Wait until it's active

        console.log('✅ Service worker ready:', reg);
        setRegistration(reg);

        const sub = await reg.pushManager.getSubscription();
        setIsSubscribed(!!sub);

        if (!sub) {
          console.log('🔔 Requesting notification permission...');
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            console.log('✅ Permission granted. Subscribing user...');
            await subscribeToNotifications(reg);
          } else {
            console.log('⚠️ Notification permission not granted:', permission);
          }
        } else {
          console.log('🔗 User already subscribed to push notifications.');
        }
      } catch (error) {
        console.error('❌ Error setting up push notifications:', error);
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

      console.log('📩 Subscribing to push...');
      const sub = await registrationToUse.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      console.log('✅ Subscription created:', sub.endpoint);

      const { data: { user } } = await supabase.auth.getUser();

      const subscriptionData = JSON.parse(JSON.stringify(sub.toJSON()));

      const { error } = await supabase
        .from('push_subscribers')
        .upsert([
          {
            user_id: user?.id || null,
            endpoint: sub.endpoint,
            subscription: subscriptionData,
          },
        ], { onConflict: 'endpoint' });

      if (error) {
        console.error('❌ Failed to save subscription to Supabase:', error);
        toast.error('Failed to save subscription');
      } else {
        setIsSubscribed(true);
        toast.success('✅ Notifications enabled!');
        console.log('✅ Subscription saved in Supabase');
      }
    } catch (err) {
      console.error('❌ Push subscription error:', err);
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