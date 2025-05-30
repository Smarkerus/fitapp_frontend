
import { render, fireEvent, act } from '@testing-library/react-native';
import MyActivity from '../MyActivity';
import { AuthContext } from '../../context/AuthContext';
import { ApiContext } from '../../context/ApiContext';
import { LocationContext } from '../../context/LocationContext';
import * as Location from 'expo-location';


jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');


jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  Accuracy: {
    High: 4,
  },
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      backendUrl: 'http://mock-backend-url/',
    },
  },
}));

const mockAuthContext = {
  user: { id: '123' },
};

const mockApiContext = {
  activityTypes: {
    running: { label: 'Bieganie', icon: 'directions-run', apiValue: 'running' },
    cycling: { label: 'Jazda na rowerze', icon: 'directions-bike', apiValue: 'cycling' },
  },
};

const mockLocationContext = {
  uploadGpsPoints: jest.fn(),
};

describe('Ekran Moja Aktuywność', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Renderuje poprawnie w stanie bez aktywnej aktywności', () => {
    const { getByText } = render(
      <AuthContext.Provider value={mockAuthContext}>
        <ApiContext.Provider value={mockApiContext}>
          <LocationContext.Provider value={mockLocationContext}>
            <MyActivity />
          </LocationContext.Provider>
        </ApiContext.Provider>
      </AuthContext.Provider>
    );

    expect(getByText('Rozpocznij nową aktywność')).toBeTruthy();
    expect(getByText('Bieganie')).toBeTruthy();
    expect(getByText('Jazda na rowerze')).toBeTruthy();
    expect(getByText('Resetuj pamięć GPS')).toBeTruthy();
  });

  it('Rozpoczyna aktywność po kliknięciu na przycisk aktywności', async () => {
    Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    Location.watchPositionAsync.mockImplementation((options, callback) => {
      callback({ coords: { latitude: 0, longitude: 0 } });
      return { remove: jest.fn() };
    });

    const { getByText } = render(
      <AuthContext.Provider value={mockAuthContext}>
        <ApiContext.Provider value={mockApiContext}>
          <LocationContext.Provider value={mockLocationContext}>
            <MyActivity />
          </LocationContext.Provider>
        </ApiContext.Provider>
      </AuthContext.Provider>
    );

    await act(async () => {
      fireEvent.press(getByText('Bieganie'));
    });

    expect(getByText('Bieganie')).toBeTruthy();
    expect(getByText('00:00:00')).toBeTruthy();
    expect(getByText('Zakończ aktywność')).toBeTruthy();
  });

  it('Kończy aktywność po kliknięciu na przycisk "Zakończ aktywność"', async () => {
    Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    Location.watchPositionAsync.mockImplementation((options, callback) => {
      callback({ coords: { latitude: 0, longitude: 0 } });
      return { remove: jest.fn() };
    });
    Location.getCurrentPositionAsync.mockResolvedValue({ coords: { latitude: 0, longitude: 0 } });

    const { getByText, queryByText } = render(
      <AuthContext.Provider value={mockAuthContext}>
        <ApiContext.Provider value={mockApiContext}>
          <LocationContext.Provider value={mockLocationContext}>
            <MyActivity />
          </LocationContext.Provider>
        </ApiContext.Provider>
      </AuthContext.Provider>
    );

    await act(async () => {
      fireEvent.press(getByText('Bieganie'));
    });

    await act(async () => {
      fireEvent.press(getByText('Zakończ aktywność'));
    });


    expect(queryByText('00:00:00')).toBeNull();
    expect(queryByText('Zakończ aktywność')).toBeNull();
    expect(getByText('Rozpocznij nową aktywność')).toBeTruthy();
  });

  it('Aktualizuje licznik czasu podczas aktywności', async () => {
    jest.useFakeTimers();
    Location.requestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    Location.watchPositionAsync.mockImplementation((options, callback) => {
      callback({ coords: { latitude: 0, longitude: 0 } });
      return { remove: jest.fn() };
    });

    const { getByText } = render(
      <AuthContext.Provider value={mockAuthContext}>
        <ApiContext.Provider value={mockApiContext}>
          <LocationContext.Provider value={mockLocationContext}>
            <MyActivity />
          </LocationContext.Provider>
        </ApiContext.Provider>
      </AuthContext.Provider>
    );

    await act(async () => {
      fireEvent.press(getByText('Bieganie'));
    });

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });

    expect(getByText('00:00:05')).toBeTruthy();

    jest.useRealTimers();
  });
});