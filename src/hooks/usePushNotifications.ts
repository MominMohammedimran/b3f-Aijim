// usePushNotifications.ts
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// PUT your VAPID public key here (URL-safe base64)
const VAPID_PUBLIC_KEY = 'BEZyguY1rRxan4xEdlHZ21O5x1XXZHS96WlokPAswM6TzeS7WdGzwTN1V4Tr3JLKN56iAZFZw3TJSIYNO7pvfi8';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const usePushNotifications = (autoPrompt = false) => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      init();
    }
  }, []);

  const init = async () => {
    try {
      const reg = await navigator.serviceWorker.register('/service-worker.js');
      setRegistration(reg);

      const sub = await reg.pushManager.getSubscription();
      setIsSubscribed(Boolean(sub));

      // optional auto prompt on first visit
      if (autoPrompt && Notification.permission === 'default') {
        // small delay so it doesn't trigger right on page load UX-wise
        setTimeout(() => requestPermissionAndSubscribe(reg), 1200);
      }
    } catch (err) {
      console.error('SW register failed', err);
    }
  };

  const requestPermissionAndSubscribe = async (reg?: ServiceWorkerRegistration) => {
    const regInstance = reg || registration;
    if (!regInstance) {
      toast.error('Service worker not ready');
      return;
    }
    setIsLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('Notification permission denied');
        return;
      }

      if (!VAPID_PUBLIC_KEY) {
        toast.error('VAPID public key missing on frontend. Add it to env.');
        console.error('VAPID_PUBLIC_KEY is empty');
        return;
      }

      const sub = await regInstance.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // optional: if user signed in, attach user_id
      const { data: { user } } = await supabase.auth.getUser();

      const payload = {
        user_id: user?.id ?? null,
        endpoint: (sub as any).endpoint,
        subscription: sub.toJSON(),
        created_at: new Date().toISOString(),
      };

      // upsert by endpoint
      const { error } = await supabase
        .from('push_subscribers')
        .upsert([payload], { onConflict: 'endpoint' });

      if (error) {
        console.error('Failed to save subscription to DB', error);
        toast.error('Failed to save subscription');
      } else {
        setIsSubscribed(true);
        toast.success('Notifications enabled!');
      }
    } catch (err) {
      console.error('subscribe error', err);
      toast.error('Could not subscribe to notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    if (!registration) return;
    setIsLoading(true);
    try {
      const sub = await registration.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        // delete from DB (by endpoint)
        await supabase.from('push_subscribers').delete().eq('endpoint', (sub as any).endpoint);
      }
      setIsSubscribed(false);
      toast.success('Notifications disabled');
    } catch (err) {
      console.error('unsubscribe error', err);
      toast.error('Failed to unsubscribe');
    } finally {
      setIsLoading(false);
    }
  };

  const sendTestNotification = async () => {
    try {
      // Call server function/endpoint that sends the push via web-push (server will use VAPID keys)
      const res = await fetch('/api/send-notification-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test — AIJIM',
          body: 'This is a test push notification',
          url: '/',
        }),
      });

      const json = await res.json();
      if (res.ok) toast.success(`Sent: ${json.sent || 0}`);
      else toast.error(json.error || 'Failed to send test');
    } catch (err) {
      console.error(err);
      toast.error('Failed to call send endpoint');
    }
  };

  return {
    isSupported,
    isSubscribed,
    isLoading,
    subscribe: () => requestPermissionAndSubscribe(),
    unsubscribe,
    sendTestNotification,
  };
};
