import { useEffect } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';

const PushNotificationSetup = () => {
  const { isSupported, isSubscribed } = usePushNotifications();

  useEffect(() => {
    if (isSupported) {
      console.log('✅ Push notifications supported');
      console.log('📱 Subscribed:', isSubscribed);
    } else {
      console.log('⚠️ Push notifications not supported');
    }
  }, [isSupported, isSubscribed]);

  return null; // This is a setup component, no UI needed
};

export default PushNotificationSetup;