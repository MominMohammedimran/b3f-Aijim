import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const VAPID_PUBLIC_KEY =
  'BDzuk_ZfPRI35ntZhosL6y7uCtje2I6D6oXVufJLcOMYT__Zr5gIGhIl-WMcA08ahCMbfwyXfpEDOLVYIXNW37c'

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
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const initPush = async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
      setIsSupported(true);

      try {
        const reg = await navigator.serviceWorker.register('/service-worker.js');
        await navigator.serviceWorker.ready;
        setRegistration(reg);

        const existingSub = await reg.pushManager.getSubscription();

        if (!existingSub) {
          console.log('🔔 No existing subscription found — requesting permission...');
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            await subscribeToNotifications(reg);
          } else {
            console.log('⚠️ Notification permission denied');
          }
        } else {
          console.log('✅ Found existing subscription — syncing to Supabase...');
          await saveSubscription(existingSub);
          setIsSubscribed(true);
        }
      } catch (err) {
        console.error('Push setup failed:', err);
      }
    };

    initPush();
  }, []);

  const subscribeToNotifications = async (reg?: ServiceWorkerRegistration) => {
    try {
      setIsLoading(true);
      const regToUse = reg || registration;
      if (!regToUse) return toast.error('Service Worker not ready');

      const sub = await regToUse.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      await saveSubscription(sub);
      setIsSubscribed(true);
      toast.success('Notifications enabled!');
    } catch (err) {
      console.error('Push subscription failed:', err);
      toast.error('Failed to enable notifications');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Always sync to Supabase, even if already subscribed
  const saveSubscription = async (sub: PushSubscription) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const subJson = JSON.parse(JSON.stringify(sub.toJSON()));

      const { error } = await supabase
        .from('push_subscribers')
        .upsert(
          [
            {
              user_id: user?.id || null,
              endpoint: sub.endpoint,
              subscription: subJson,
            },
          ],
          { onConflict: 'endpoint' }
        );

      if (error) {
        console.error('❌ Error syncing subscription:', error);
      } else {
        console.log('✅ Subscription synced with Supabase');
      }
    } catch (err) {
      console.error('❌ Failed to save subscription:', err);
    }
  };

  return {
    isSupported,
    isSubscribed,
    isLoading,
    subscribeToNotifications,
  };
};