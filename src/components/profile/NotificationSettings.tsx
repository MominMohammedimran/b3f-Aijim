import { Bell, BellOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePushNotifications } from '@/hooks/usePushNotifications';

const NotificationSettings = () => {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    
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
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">
              {isSubscribed ? 'Notifications Enabled' : 'Notifications Disabled'}
            </p>
            <p className="text-sm text-muted-foreground">
              {isSubscribed 
                ? 'You will receive push notifications' 
                : 'Enable to receive updates'}
            </p>
          </div>
          <Button
            onClick={isSubscribed ? unsubscribeFromNotifications : subscribeToNotifications}
            disabled={isLoading}
            variant={isSubscribed ? 'destructive' : 'default'}
          >
            {isLoading ? 'Processing...' : isSubscribed ? 'Disable' : 'Enable'}
          </Button>
        </div>

      
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
