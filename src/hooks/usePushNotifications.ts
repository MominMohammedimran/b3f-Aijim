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
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    const initPush = async () => {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
      setIsSupported(true);
      
      if ('Notification' in window) {
        setPermission(Notification.permission);
      }

      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;
        setRegistration(reg);

        const existingSub = await reg.pushManager.getSubscription();

        if (existingSub) {
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

  const subscribe = async (reg?: ServiceWorkerRegistration) => {
    try {
      setIsLoading(true);
      
      // Request permission first
      const permResult = await Notification.requestPermission();
      setPermission(permResult);
      
      if (permResult !== 'granted') {
        toast.error('Notification permission denied');
        return false;
      }
      
      const regToUse = reg || registration;
      if (!regToUse) {
        // Register service worker if not already
        const newReg = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;
        setRegistration(newReg);
        return subscribe(newReg);
      }

      const sub = await regToUse.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      });

      await saveSubscription(sub);
      setIsSubscribed(true);
      toast.success('Notifications enabled!');
      return true;
    } catch (err) {
      console.error('Push subscription failed:', err);
      toast.error('Failed to enable notifications');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    try {
      setIsLoading(true);
      const regToUse = registration;
      if (!regToUse) return false;

      const existingSub = await regToUse.pushManager.getSubscription();
      if (existingSub) {
        await existingSub.unsubscribe();
        
        // Remove from database
        await (supabase as any)
          .from('push_subscribers')
          .delete()
          .eq('endpoint', existingSub.endpoint);
      }

      setIsSubscribed(false);
      toast.success('Notifications disabled');
      return true;
    } catch (err) {
      console.error('Failed to unsubscribe:', err);
      toast.error('Failed to disable notifications');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Always sync to Supabase, even if already subscribed
  const saveSubscription = async (sub: PushSubscription) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const subJson = JSON.parse(JSON.stringify(sub.toJSON()));

      const { error } = await (supabase as any)
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
    permission,
    subscribe,
    unsubscribe,
    subscribeToNotifications: subscribe, // backwards compat
  };
};