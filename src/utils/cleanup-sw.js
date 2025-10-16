// src/utils/cleanup-sw.js
export async function cleanupServiceWorkers() {
  try {
    // 🧹 Remove all service workers
    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      for (const reg of regs) {
        await reg.unregister();
        console.log("🧹 Unregistered SW:", reg.scope);
      }
    }

    // 🗑 Delete all caches
    if ("caches" in window) {
      const cacheNames = await caches.keys();
      for (const name of cacheNames) {
        await caches.delete(name);
        console.log("🗑 Deleted cache:", name);
      }
    }
  } catch (err) {
    console.error("❌ Cleanup failed:", err);
  }
}
