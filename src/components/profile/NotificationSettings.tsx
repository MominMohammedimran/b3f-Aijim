import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePushNotifications } from '@/hooks/usePushNotifications';

const NotificationSettings = () => {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    sendTestNotification,
  } = usePushNotifications();

  if (!isSupported) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="w-5 h-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Push notifications are not supported in your browser
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Get notified about order updates, new products, and special offers
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isSubscribed ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <Bell className="w-5 h-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-medium text-green-900 dark:text-green-100">
                  Notifications Enabled
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  You will receive push notifications
                </p>
              </div>
            </div>
            
            <div className="pt-4 border-t border-border">
              <Button
                onClick={sendTestNotification}
                variant="outline"
                className="w-full"
              >
                Send Test Notification
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
              <BellOff className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">
                  Notifications Disabled
                </p>
                <p className="text-sm text-muted-foreground">
                  Enable to receive updates about orders and offers
                </p>
              </div>
            </div>
            
            <Button
              onClick={subscribeToNotifications}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Enabling...' : 'Enable Notifications'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;