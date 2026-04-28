import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { requestPermissions, scheduleDailyReminders } from './src/notifications/scheduler';
import AppNavigator from './src/navigation';

export default function App() {
  const navigationRef = useRef(null);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    (async () => {
      const granted = await requestPermissions();
      if (granted) await scheduleDailyReminders();
    })();

    // When a notification arrives while app is open
    notificationListener.current = Notifications.addNotificationReceivedListener(() => {});

    // When user taps a notification — open the prompt
    responseListener.current = Notifications.addNotificationResponseReceivedListener(() => {
      if (navigationRef.current) {
        navigationRef.current.navigate('GratitudePrompt');
      }
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  return (
    <>
      <StatusBar style="auto" />
      <AppNavigator ref={navigationRef} />
    </>
  );
}
