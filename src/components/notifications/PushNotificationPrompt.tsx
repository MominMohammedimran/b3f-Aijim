import { useState, useEffect } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { supabase } from "@/integrations/supabase/client";

const PushNotificationPrompt = () => {
  const [user, setUser] = useState<any>(null);
  const { isSupported, isSubscribed, permission, isLoading, subscribe } = usePushNotifications();
  const [showPrompt, setShowPrompt] = useState(false);

  
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => {
    // Show prompt after 3 seconds if user is logged in, supported, not subscribed, and not dismissed
    if (user && isSupported && !isSubscribed && permission === "default" && !dismissed) {
      const dismissedAt = localStorage.getItem("push_prompt_dismissed");
      if (dismissedAt) {
        const dismissedDate = new Date(dismissedAt);
        const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceDismissed < 7) {
          return; // Don't show for 7 days after dismissal
        }
      }

      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [user, isSupported, isSubscribed, permission, dismissed]);

  const handleDismiss = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem("push_prompt_dismissed", new Date().toISOString());
  };

  const handleEnable = async () => {
    const success = await subscribe();
    if (success) {
      setShowPrompt(false);
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-background border border-border rounded-lg shadow-lg p-4 z-50 animate-in slide-in-from-bottom-4">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
      
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/10 rounded-full">
          <Bell className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground">Enable Notifications</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Get instant updates on orders, new drops, and exclusive offers.
          </p>
          <div className="flex gap-2 mt-3">
            <Button
              size="sm"
              onClick={handleEnable}
              disabled={isLoading}
            >
              {isLoading ? "Enabling..." : "Enable"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
            >
              Not now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PushNotificationPrompt;