// --- AIJIM Service Worker (Auto Updating) ---
const CACHE_NAME = `aijim-cache-v-1.02-${Date.now()}`;
const CORE_ASSETS = ["/", "/index.html", "/favicon.ico"];

self.addEventListener("install", (event) => {
  console.log("🪄 Installing new Service Worker...");
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(CORE_ASSETS)));
});

self.addEventListener("activate", (event) => {
  console.log("⚡ Activating Service Worker...");
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      for (const name of names) {
        if (name !== CACHE_NAME) await caches.delete(name);
      }
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.url.startsWith("chrome-extension") || req.url.includes("devtools")) return;

  event.respondWith(
    fetch(req)
      .then((netRes) => {
        if (req.method === "GET" && netRes.ok && req.url.startsWith(self.location.origin)) {
          const copy = netRes.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy));
        }
        return netRes;
      })
      .catch(() => caches.match(req))
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    console.log("⏩ Skip waiting triggered");
    self.skipWaiting();
  }
});