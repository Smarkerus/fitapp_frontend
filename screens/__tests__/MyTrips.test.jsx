import { render, screen, waitFor, act } from '@testing-library/react-native';
import { ApiContext } from '../../context/ApiContext';
import MyTrips from '../MyTrips';

jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      backendUrl: 'http://mock-backend-url/',
    },
  },
}));

jest.mock('react-native-maps', () => ({
  __esModule: true,
  default: require('react-native').View,
  PROVIDER_GOOGLE: 'google',
  Polyline: require('react-native').View,
}));

jest.mock('react-native-reanimated', () => ({
  FadeIn: { duration: jest.fn().mockReturnValue({}) },
  FadeOut: { duration: jest.fn().mockReturnValue({}) },
  default: require('react-native'),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
  useFocusEffect: jest.fn(),
}));

const mockTrip = [
  {
    summary: {
      trip_id: 1,
      session_id: 1,
      start_time: '2023-01-01T00:00:00Z',
      distance: 5000,
    },
    points: [{ latitude: 52.2297, longitude: 21.0122 }],
    name: 'Testowa Trasa',
  },
];

describe('Ekran Moje Trasy', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Wyświetla komunikat gdy brak tras', async () => {
    const mockFetchUserTrips = jest.fn().mockResolvedValue([]);
    jest.spyOn(require('@react-navigation/native'), 'useFocusEffect').mockImplementationOnce(callback => {
      act(() => {
        callback();
      });
    });

    render(
      <ApiContext.Provider value={{ fetchUserTrips: mockFetchUserTrips }}>
        <MyTrips />
      </ApiContext.Provider>
    );

    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    await waitFor(() => {
      expect(screen.getByText(/Hej, nie masz jeszcze żadnych tras/i)).toBeTruthy();
    });
  });

  it('Wyświetla komponent z trasą', async () => {
    const mockFetchUserTrips = jest.fn().mockResolvedValue(mockTrip);
    jest.spyOn(require('@react-navigation/native'), 'useFocusEffect').mockImplementationOnce(callback => {
      act(() => {
        callback();
      });
    });

    render(
      <ApiContext.Provider value={{ fetchUserTrips: mockFetchUserTrips }}>
        <MyTrips />
      </ApiContext.Provider>
    );

    await act(async () => {
      jest.advanceTimersByTime(0);
    });

    await waitFor(() => {
      expect(screen.getByText('Testowa Trasa')).toBeTruthy();
    });
  });
});
