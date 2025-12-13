// src/hooks/useGlobalPushNotification.ts
import { toast } from "sonner";

export function useGlobalPushNotifications() {
  const isMobile = /Android|iPhone|iPad/i.test(navigator.userAgent);

  const requestPermission = async () => {
    if (!("Notification" in window)) return;

    if (Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch (err) {
        console.warn("Notification permission request failed", err);
      }
    }
  };

  const send = (title: string, body: string) => {
    if ("Notification" in window && Notification.permission === "granted" && !isMobile) {
      new Notification(title, {
        body,
        icon: "/aijim.svg", // replace with your logo/icon
      });
      return;
    }

    // fallback for mobile or denied permissions
    toast(title, {
      description: body,
      duration: 5000,
    });
  };

  return { send, requestPermission };
}
