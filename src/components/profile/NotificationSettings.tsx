import { Bell, BellOff } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { usePushNotifications } from '@/hooks/usePushNotifications';

const NotificationSettings = () => {
  const { isSupported, isSubscribed } = usePushNotifications();

  if (!isSupported) {
    return (
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="w-5 h-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>Not supported on this browser.</CardDescription>
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
          You’ll be asked for permission each visit until allowed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isSubscribed ? (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="font-medium text-green-900 dark:text-green-100">
              Notifications Enabled
            </p>
            <p className="text-sm text-green-700 dark:text-green-300">
              You’ll receive updates automatically.
            </p>
          </div>
        ) : (
          <div className="p-4 bg-muted rounded-lg border border-border">
            <p className="font-medium text-foreground">Waiting for permission...</p>
            <p className="text-sm text-muted-foreground">
              The browser will ask for permission automatically each visit.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
