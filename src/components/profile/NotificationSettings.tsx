import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { usePushNotifications } from "@/hooks/usePushNotifications";

const NotificationSettings = () => {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    sendTestNotification,
  } = usePushNotifications();

  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>(
    Notification.permission
  );

  useEffect(() => {
    // Update state whenever permission changes (on some browsers)
    if ("permissions" in navigator && (navigator as any).permissions?.query) {
      (navigator as any)
        .permissions.query({ name: "notifications" })
        .then((permissionStatusObj: any) => {
          permissionStatusObj.onchange = () => {
            setPermissionStatus(Notification.permission);
          };
        });
    }
  }, []);

  const requestPermission = async () => {
    const permission = await Notification.requestPermission();
    setPermissionStatus(permission);

    if (permission === "granted") {
      toast.success("Notifications allowed! You can enable them now.");
    } else if (permission === "denied") {
      toast.error("Permission denied. Please allow notifications in browser settings.");
    } else {
      toast.message("You can enable notifications later.");
    }
  };

  if (!isSupported) {
    return (
      <Card className="border-border bg-card text-center">
        <CardHeader>
          <CardTitle className="flex items-center justify-center gap-2 text-gray-400">
            <BellOff className="w-5 h-5" />
            Push Notifications
          </CardTitle>
          <CardDescription className="text-gray-500">
            Your browser does not support push notifications.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-800 bg-gray-900 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-yellow-400" />
          Push Notifications
        </CardTitle>
        <CardDescription className="text-gray-400">
          Control when you receive updates about orders and offers.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {permissionStatus === "default" && (
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-gray-300">
              This app would like to send you notifications. Please allow permission first.
            </p>
            <Button
              className="bg-yellow-400 text-black hover:bg-yellow-500"
              onClick={requestPermission}
            >
              Allow Notifications
            </Button>
          </div>
        )}

        {permissionStatus === "denied" && (
          <div className="text-center">
            <p className="text-red-400 font-medium">
              Permission denied — notifications won’t work.
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Please enable notifications manually in your browser settings.
            </p>
          </div>
        )}

        {permissionStatus === "granted" && (
          <>
            <div className="flex items-center justify-between border-b border-gray-700 pb-3">
              <div>
                <p className="font-semibold">
                  {isSubscribed ? "Notifications Enabled" : "Notifications Disabled"}
                </p>
                <p className="text-sm text-gray-400">
                  {isSubscribed
                    ? "You’ll receive updates automatically."
                    : "Click below to enable notifications."}
                </p>
              </div>

              <Button
                onClick={
                  isSubscribed
                    ? unsubscribeFromNotifications
                    : subscribeToNotifications
                }
                disabled={isLoading}
                className={`px-5 font-semibold ${
                  isSubscribed
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-yellow-400 hover:bg-yellow-500 text-black"
                }`}
              >
                {isLoading
                  ? "Processing..."
                  : isSubscribed
                  ? "Disable"
                  : "Enable"}
              </Button>
            </div>

            {isSubscribed && (
              <div className="flex justify-end">
                <Button
                  onClick={sendTestNotification}
                  variant="outline"
                  className="text-xs border-gray-600 hover:bg-gray-800"
                >
                  Send Test Notification
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
