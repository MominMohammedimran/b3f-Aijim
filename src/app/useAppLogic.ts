
import { useState, useEffect } from "react";
import { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { initializeSecurity } from "../utils/securityUtils";
import { useReactQueryStorage } from "../utils/useReactQueryStorage";
import { trackReferral } from "../utils/trackReferral";

export function useAppLogic(queryClient: QueryClient) {
  const [showPreloader, setShowPreloader] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPreloader(false);
    }, 1000); // <-- ideal timing for Google Lighthouse

    return () => clearTimeout(timer);
  }, []);

  useReactQueryStorage(queryClient, "local");

  useEffect(() => {
    trackReferral();
  }, []);

  // 🔥 VERSION CHECK — auto refresh if new version
  useEffect(() => {
    let currentVersion: string | null = null;

    const checkVersion = async () => {
      try {
        const res = await fetch(`/version.json?cache=${Date.now()}`);
        const data = await res.json();

        if (!currentVersion) {
          currentVersion = data.version;
        } else if (currentVersion !== data.version) {
          toast.info("New update available!", {
            action: {
              label: "Refresh",
              onClick: () => window.location.reload(),
            },
          });
        }
      } catch (error) {
        console.warn("Version check failed", error);
      }
    };

    const interval = setInterval(checkVersion, 30000); // every 30 sec
    return () => clearInterval(interval);
  }, []);

  // 🔐 Security
  useEffect(() => {
    initializeSecurity();

    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && ["s", "u", "i", "j", "p"].includes(e.key.toLowerCase()))
      ) {
        e.preventDefault();
        toast.warning("Action disabled for security");
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Preloader logic for first visit
  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisited");

    if (!hasVisited) {
      setShowPreloader(true);
      localStorage.setItem("hasVisited", "true");
    }
  }, []);

  return { showPreloader, setShowPreloader };
}
