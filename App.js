import React, { useEffect, useCallback } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from './context/AuthContext';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './routes/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { scheduleDailyNotification } from './helpers/NotificationHelper';

SplashScreen.preventAutoHideAsync();

const requestPermissions = async () => {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      alert('Potrzebujemy Twojej zgody na wysyłanie powiadomień!');
    }
    return status;
  } catch (error) {
    console.error('Błąd podczas żądania uprawnień do powiadomień:', error);
  }
};

export default function App() {
  const onAppReady = useCallback(async () => {
    try {
      await requestPermissions();
      const now = new Date();
      await scheduleDailyNotification(now.getHours(), now.getMinutes() + 2); // Za 2 minuty
    } catch (error) {
      console.error('Błąd podczas inicjalizacji aplikacji:', error);
    } finally {
      await SplashScreen.hideAsync();
    }
  }, []);

  useEffect(() => {
    onAppReady();
  }, [onAppReady]);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
