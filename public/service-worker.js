// --- AIJIM Service Worker ---
// ⚡ Always auto-update and refresh clients

const CACHE_NAME = `aijim-cache-v${Date.now()}`; // Unique each build
const CORE_ASSETS = [
  "/", 
  "/index.html", 
  "/favicon.ico"
];

// 🧹 Install: pre-cache minimal core assets
self.addEventListener("install", (event) => {
  console.log("🪄 Installing new Service Worker...");
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
  );
});

// ⚙️ Activate: remove old caches immediately
self.addEventListener("activate", (event) => {
  console.log("⚡ Activating Service Worker...");
  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      for (const name of cacheNames) {
        if (name !== CACHE_NAME) {
          console.log("🗑 Removing old cache:", name);
          await caches.delete(name);
        }
      }
      await self.clients.claim();
    })()
  );
});

// 🔁 Fetch: prefer network, fallback to cache (no stale data)
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Skip chrome-extension and devtools requests
  if (req.url.startsWith("chrome-extension") || req.url.includes("devtools")) {
    return;
  }

  event.respondWith(
    fetch(req)
      .then((networkRes) => {
        // Optional: cache static assets only (not API calls)
        if (req.method === "GET" && networkRes.ok && req.url.startsWith(self.location.origin)) {
          const cloned = networkRes.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, cloned));
        }
        return networkRes;
      })
      .catch(() => caches.match(req))
  );
});

// 🚀 Receive skipWaiting message from app
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    console.log("⏩ Skip waiting and activate new SW immediately");
    self.skipWaiting();
  }
});