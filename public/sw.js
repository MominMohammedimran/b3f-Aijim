// Custom Service Worker for Push Notifications
const VAPID_PUBLIC_KEY = "BDzuk_ZfPRI35ntZhosL6y7uCtje2I6D6oXVufJLcOMYT__Zr5gIGhIl-WMcA08ahCMbfwyXfpEDOLVYIXNW37c";
const ICON_PATH = "/aijim-uploads/aijim-black.png";

// Listen for push events
self.addEventListener("push", (event) => {
  console.log("[SW] Push received:", event);

  let notificationData = {
    title: "AIJIM",
    body: "You have a new notification",
    icon: ICON_PATH,
    badge: ICON_PATH,
    data: {},
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = {
        ...notificationData,
        ...payload,
      };
    } catch (e) {
      notificationData.body = event.data.text();
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon || ICON_PATH,
    badge: notificationData.badge || ICON_PATH,
    data: notificationData.data || {},
    actions: notificationData.actions || [],
    tag: notificationData.tag || "default",
    requireInteraction: notificationData.requireInteraction || false,
    vibrate: [200, 100, 200],
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event);
  event.notification.close();

  const data = event.notification.data || {};
  let targetUrl = "/";

  // Route based on notification type
  if (data.link) {
    targetUrl = data.link;
  } else if (data.type === "order" && data.orderId) {
    targetUrl = `/orders`;
  } else if (data.type === "payment_issue" && data.orderId) {
    targetUrl = `/orders`;
  } else if (data.type === "product" && data.productSlug) {
    targetUrl = `/product/${data.productSlug}`;
  } else if (data.type === "article" && data.articleSlug) {
    targetUrl = `/articles/${data.articleSlug}`;
  }

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // Focus existing window if available
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Open new window if needed
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Handle install event
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...");
  self.skipWaiting();
});

// Handle activate event
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...");
  event.waitUntil(clients.claim());
});