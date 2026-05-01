import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { useFonts } from 'expo-font';
import { DancingScript_400Regular } from '@expo-google-fonts/dancing-script/400Regular';
import { DancingScript_700Bold } from '@expo-google-fonts/dancing-script/700Bold';
import { requestPermissions, scheduleDailyReminders } from './src/notifications/scheduler';
import AppNavigator from './src/navigation';

export default function App() {
  const [fontsLoaded] = useFonts({ DancingScript_400Regular, DancingScript_700Bold });
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

  if (!fontsLoaded) return null;

  return (
    <>
      <StatusBar style="auto" />
      <AppNavigator ref={navigationRef} />
    </>
  );
}
