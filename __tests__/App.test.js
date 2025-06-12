import { render, waitFor } from '@testing-library/react-native';
import App from '../App';
import * as SplashScreen from 'expo-splash-screen';

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('react-native-orientation-locker', () => ({
  lockToPortrait: jest.fn(),
  unlockAllOrientations: jest.fn(),
}));

jest.mock('../routes/AppNavigator', () => 'AppNavigator');

jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
}));

jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      backendUrl: 'http://mock-backend-url/',
    },
  },
}));

jest.mock('../context/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
}));

jest.mock('../context/ApiContext', () => ({
  ApiProvider: ({ children }) => children,
}));

jest.mock('../context/LocationContext', () => ({
  LocationProvider: ({ children }) => children,
}));

jest.mock('../context/NotificationContext', () => ({
  NotificationProvider: ({ children }) => children,
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
}));

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }) => children,
}));

describe('Aplikacja', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Renderuje komponent App i ukrywa ekran startowy po inicjalizacji', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    render(<App />);
    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith('Inicjalizacja aplikacji...');
      expect(SplashScreen.hideAsync).toHaveBeenCalledTimes(1);
      expect(SplashScreen.hideAsync).toHaveBeenCalledWith();
    });
    consoleLogSpy.mockRestore();
  });

  test('Obsługuje błąd w onAppReady i nadal ukrywa ekran startowy', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const error = new Error('Błąd podczas inicjalizacji aplikacji:');
    jest.spyOn(console, 'log').mockImplementationOnce(() => {
      throw error;
    });
    render(<App />);
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Błąd podczas inicjalizacji aplikacji:', error);
      expect(SplashScreen.hideAsync).toHaveBeenCalledTimes(1);
      expect(SplashScreen.hideAsync).toHaveBeenCalledWith();
    });
    consoleErrorSpy.mockRestore();
    jest.spyOn(console, 'log').mockRestore();
  });

  test('Blokuje orientację na portret przy montowaniu i odblokowuje przy odmontowaniu', async () => {
    const { unmount } = render(<App />);
    await waitFor(() => {
      expect(require('react-native-orientation-locker').lockToPortrait).toHaveBeenCalledTimes(1);
    });
    unmount();
    expect(require('react-native-orientation-locker').unlockAllOrientations).toHaveBeenCalledTimes(1);
  });
});
