import { render, fireEvent, waitFor, screen } from '@testing-library/react-native';
import Reminder from '../Reminder';
import { AuthContext } from '../../context/AuthContext';
import { NotificationContext } from '../../context/NotificationContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.NativeModules.RNFBAppModule = {};
  return RN;
});

jest.mock('@react-native-firebase/messaging', () => {
  return () => ({
    requestPermission: jest.fn().mockResolvedValue(true),
    getToken: jest.fn().mockResolvedValue('mock-token'),
    setAutoInitEnabled: jest.fn(),
  });
});

jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
}));

let mockAsyncStore = {};
AsyncStorage.getItem = jest.fn().mockImplementation(key => Promise.resolve(mockAsyncStore[key] || null));
AsyncStorage.setItem = jest.fn().mockImplementation((key, value) => {
  mockAsyncStore[key] = value;
  return Promise.resolve();
});
AsyncStorage.removeItem = jest.fn().mockImplementation(key => {
  delete mockAsyncStore[key];
  return Promise.resolve();
});

jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      backendUrl: 'http://mock-backend-url/',
    },
  },
}));

describe('Komponent Przypominajki', () => {
  let mockFetchReminder;
  let mockCreateReminder;
  let mockEditReminder;
  let mockDeleteReminder;
  let currentReminder;

  beforeEach(() => {
    mockAsyncStore = {};
    currentReminder = null;
    mockFetchReminder = jest.fn().mockImplementation(() => Promise.resolve(currentReminder));
    mockCreateReminder = jest.fn().mockImplementation((cal, dist, time) => {
      currentReminder = { min_calories: cal, min_distance: dist, min_time: time };
      return Promise.resolve(currentReminder);
    });
    mockEditReminder = jest.fn().mockImplementation((cal, dist, time) => {
      currentReminder = { min_calories: cal, min_distance: dist, min_time: time };
      return Promise.resolve(currentReminder);
    });
    mockDeleteReminder = jest.fn().mockImplementation(() => {
      currentReminder = null;
      return Promise.resolve();
    });
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    const wrapper = ({ children }) => (
      <AuthContext.Provider value={{ user: { email: 'test@example.com', token: 'mock-token' } }}>
        <NotificationContext.Provider
          value={{
            fetchReminder: mockFetchReminder,
            createReminder: mockCreateReminder,
            editReminder: mockEditReminder,
            deleteReminder: mockDeleteReminder,
          }}
        >
          {children}
        </NotificationContext.Provider>
      </AuthContext.Provider>
    );
    return render(<Reminder />, { wrapper });
  };

  test('Tworzy wiadomość o braku Przypominajki', async () => {
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Nie masz jeszcze/)).toBeTruthy();
    });
    expect(screen.getByText('Utwórz przypominajkę')).toBeTruthy();
  });

  test('Tworzy Przypominajkę', async () => {
    renderComponent();
    fireEvent.press(screen.getByText('Utwórz przypominajkę'));
    const calInput = screen.getByPlaceholderText('Wprowadź minimalną liczbę kalorii');
    const distInput = screen.getByPlaceholderText('Wprowadź minimalny dystans');
    const timeInput = screen.getByPlaceholderText('Wprowadź minimalny czas');
    fireEvent.changeText(calInput, '500');
    fireEvent.changeText(distInput, '5');
    fireEvent.changeText(timeInput, '50');
    fireEvent.press(screen.getByText('Zapisz'));
    await waitFor(() => expect(mockCreateReminder).toHaveBeenCalledWith(500, 5000, 3000));
    await waitFor(() =>
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'reminder_test@example.com',
        JSON.stringify({ min_calories: 500, min_distance: 5000, min_time: 3000 })
      )
    );
    expect(screen.getByText('Twoja przypominajka')).toBeTruthy();
    expect(screen.getByText('Minimalna liczba kalorii: 500')).toBeTruthy();
    expect(screen.getByText('Minimalny dystans: 5 km')).toBeTruthy();
    expect(screen.getByText('Minimalny czas: 50 minut')).toBeTruthy();
  });

  test('Pozwala edytować istniejącą Przypominajkę', async () => {
    currentReminder = { min_calories: 500, min_distance: 5000, min_time: 3000 };
    renderComponent();
    await waitFor(() => expect(screen.getByText('Twoja przypominajka')).toBeTruthy());
    fireEvent.press(screen.getByText('Edytuj'));
    const calInput = screen.getByPlaceholderText('Wprowadź minimalną liczbę kalorii');
    const distInput = screen.getByPlaceholderText('Wprowadź minimalny dystans');
    const timeInput = screen.getByPlaceholderText('Wprowadź minimalny czas');
    fireEvent.changeText(calInput, '600');
    fireEvent.changeText(distInput, '6');
    fireEvent.changeText(timeInput, '60');
    fireEvent.press(screen.getByText('Zapisz'));
    await waitFor(() => expect(mockEditReminder).toHaveBeenCalledWith(600, 6000, 3600));
    await waitFor(() =>
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'reminder_test@example.com',
        JSON.stringify({ min_calories: 600, min_distance: 6000, min_time: 3600 })
      )
    );
    expect(screen.getByText('Minimalna liczba kalorii: 600')).toBeTruthy();
    expect(screen.getByText('Minimalny dystans: 6 km')).toBeTruthy();
    expect(screen.getByText('Minimalny czas: 60 minut')).toBeTruthy();
  });

  test('Pozwala usunąć Przypominajkę', async () => {
    currentReminder = { min_calories: 500, min_distance: 5000, min_time: 3000 };
    renderComponent();
    await waitFor(() => expect(screen.getByText('Twoja przypominajka')).toBeTruthy());
    const toastSpy = jest.spyOn(Toast, 'show').mockImplementation(options => {
      if (options.onPress) {
        options.onPress();
      }
    });
    fireEvent.press(screen.getByText('Usuń'));
    await waitFor(() => expect(mockDeleteReminder).toHaveBeenCalled());
    await waitFor(() => expect(AsyncStorage.removeItem).toHaveBeenCalledWith('reminder_test@example.com'));
    await waitFor(() =>
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'success',
        text1: 'Sukces',
        text2: 'Przypominajka została usunięta',
      })
    );
    toastSpy.mockRestore();

    await waitFor(() => {
      expect(screen.getByText(/Nie masz jeszcze/)).toBeTruthy();
    });
  });

  test('OBsługuje błąd tworzenia Przypominajki', async () => {
    mockCreateReminder.mockRejectedValueOnce(new Error('Create error'));
    renderComponent();
    fireEvent.press(screen.getByText('Utwórz przypominajkę'));
    fireEvent.changeText(screen.getByPlaceholderText('Wprowadź minimalną liczbę kalorii'), '500');
    fireEvent.changeText(screen.getByPlaceholderText('Wprowadź minimalny dystans'), '5');
    fireEvent.changeText(screen.getByPlaceholderText('Wprowadź minimalny czas'), '50');
    fireEvent.press(screen.getByText('Zapisz'));
    await waitFor(() => expect(screen.getByText('Błąd zapisywania przypominajki')).toBeTruthy());
  });

  test('Nie wyświetla Przypominajki jeżeli dane z API nie zostały poprawnie pobrane', async () => {
    mockFetchReminder.mockRejectedValue(new Error('Fetch error'));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/Nie masz jeszcze/)).toBeTruthy();
    });
  });
});
