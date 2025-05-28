import { render, waitFor } from '@testing-library/react-native';
import App from '../App';
import * as SplashScreen from 'expo-splash-screen';

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
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

  test('wywołuje onAppReady przy załadowaniu i ukrywa ekran startowy', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    render(<App />);
    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalledWith('Inicjalizacja aplikacji...');
      expect(SplashScreen.hideAsync).toHaveBeenCalled();
    });
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  test('obsługuje błąd w onAppReady i ukrywa ekran startowy', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    const error = new Error('Initialization error');
    jest.spyOn(console, 'log').mockImplementation(() => {
      throw error;
    });
    render(<App />);
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Błąd podczas inicjalizacji aplikacji:', error);
      expect(SplashScreen.hideAsync).toHaveBeenCalled();
    });
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});
