// ✅ AIJIM PWA + Push Notification Service Worker
const CACHE_NAME = 'aijim-store-v2.12';
const urlsToCache = [
  '/',
  '/index.html',
  '/aijim-uploads/aijim-192.png',
  '/aijim-uploads/aijim-512.png',
];

// 🔹 INSTALL: Cache essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// 🔹 ACTIVATE: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[ServiceWorker] Deleting old cache:', name);
            return caches.delete(name);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// 🔹 FETCH: Serve cached content when offline
self.addEventListener('fetch', (event) => {
  // Only handle GET requests (avoid interfering with Supabase or POST APIs)
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request)
          .then((response) => {
            if (
              !response ||
              response.status !== 200 ||
              response.type !== 'basic'
            ) {
              return response;
            }

            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
            return response;
          })
          .catch(() => cached) // fallback to cache on network failure
      );
    })
  );
});

// 🔹 PUSH: Handle incoming push messages
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push received:', event);

  let data = {
    title: 'AIJIM',
    body: 'You have a new update!',
    icon: '/aijim-uploads/aijim-192.png',
    badge: '/aijim-uploads/aijim-192.png',
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.warn('Failed to parse push data:', e);
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    vibrate: [100, 50, 100],
    data: data.data || {},
    tag: data.tag || 'aijim-default',
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// 🔹 CLICK: Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification click:', event);
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
      // Focus open tab if it exists
      for (const client of clientsArr) {
        if (client.url.includes(self.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new tab
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// 🔹 MESSAGE: Handle updates or forced refresh from the main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[ServiceWorker] Received SKIP_WAITING message');
    self.skipWaiting();
  }
});
