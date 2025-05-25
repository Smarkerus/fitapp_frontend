import { useEffect, useCallback } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from './context/AuthContext';
import { ApiProvider } from './context/ApiContext';
import { LocationProvider } from './context/LocationContext';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './routes/AppNavigator';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import { NotificationProvider } from './context/NotificationContext';

enableScreens();

SplashScreen.preventAutoHideAsync();

export default function App() {
  const onAppReady = useCallback(async () => {
    try {
      console.log('Inicjalizacja aplikacji...');
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
        <ApiProvider>
          <LocationProvider>
            <NotificationProvider>
              <NavigationContainer>
                <AppNavigator />
              </NavigationContainer>
            </NotificationProvider>
          </LocationProvider>
        </ApiProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
