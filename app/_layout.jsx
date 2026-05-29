import { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { ThemeProvider } from '../context/ThemeContext';
import { requestPermissions, setupAllNotifications } from '../services/notificationService';
import { initializePurchases } from '../services/purchaseService';
import { getDeviceId } from '../services/storageService';

export default function RootLayout() {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    (async () => {
      // Initialize RevenueCat with device ID
      const deviceId = await getDeviceId();
      await initializePurchases(deviceId);

      // Request permissions and setup notifications
      const granted = await requestPermissions();
      if (granted) {
        await setupAllNotifications();
      }
    })();

    // Listen for notifications received while app is open
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log('[Notification received]', notification.request.content.title);
    });

    // Listen for user tapping a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('[Notification tapped]', response.notification.request.content.title);
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ThemeProvider>
  );
}