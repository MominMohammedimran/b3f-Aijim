export const unregisterServiceWorkers = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log("Service worker unregistered:", registration);
      }
    } catch (err) {
      console.error("Error unregistering service workers:", err);
    }
  }
};
