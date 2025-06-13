import { render, fireEvent, waitFor, cleanup } from '@testing-library/react-native';
import { act } from 'react-test-renderer';
import Home from '../Home';
import { NavigationContainer } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { ApiContext } from '../../context/ApiContext';

jest.mock('../../styles', () => ({
  globalStyles: {
    background: { backgroundColor: '#f0f0f0' },
    container: { flex: 1, padding: 20 },
    welcome: { fontSize: 24, fontWeight: 'bold' },
    card: { backgroundColor: '#fff', borderRadius: 8, padding: 10 },
    colors: {
      primary: '#007AFF',
      lightGray: '#E0E0E0',
      darkGray: '#333',
      white: '#FFF',
    },
    sizes: { medium: 16, large: 20 },
    subtitle: { fontSize: 16, textAlign: 'center' },
    button: { backgroundColor: '#007AFF', padding: 10, borderRadius: 5 },
    buttonText: { color: '#FFF', textAlign: 'center' },
    centeredContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  },
}));

jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      backendUrl: 'http://mock-backend-url/',
    },
  },
}));

const mockUser = { name: 'Jan Kowalski' };
const mockActivityTypes = {
  running: { apiValue: 'running', label: 'Bieganie' },
  cycling: { apiValue: 'cycling', label: 'Jazda na rowerze' },
};
const mockFetchUserStatistics = jest.fn();

const mockNavigation = {
  navigate: jest.fn(),
};

const mockStatistics = {
  average_speed: 10.5,
  total_distance: 15000,
  total_time: 7200,
  total_calories_burned: 500,
  most_liked_activity: 'running',
  activities: [
    { activity: 'running', count: 5, distance: 10000, time: 3600, calories_burned: 300 },
    { activity: 'cycling', count: 3, distance: 5000, time: 1800, calories_burned: 200 },
  ],
};

const renderWithProviders = (component, { authValue = {}, apiValue = {} } = {}) => {
  return render(
    <NavigationContainer>
      <AuthContext.Provider value={{ user: mockUser, ...authValue }}>
        <ApiContext.Provider
          value={{
            fetchUserStatistics: mockFetchUserStatistics,
            activityTypes: mockActivityTypes,
            ...apiValue,
          }}
        >
          {component}
        </ApiContext.Provider>
      </AuthContext.Provider>
    </NavigationContainer>
  );
};

describe('Komponent główny (Home)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchUserStatistics.mockResolvedValue(mockStatistics);
  });

  afterEach(() => {
    cleanup();
  });

  it('Renderuje wskaźnik ładowania podczas pobierania statystyk', async () => {
    mockFetchUserStatistics.mockImplementation(() => new Promise(() => {}));

    const { getByTestId } = renderWithProviders(<Home navigation={mockNavigation} />);
    expect(getByTestId('loading-indicator')).toBeTruthy();

    mockFetchUserStatistics.mockReset();
    mockFetchUserStatistics.mockResolvedValue(mockStatistics);
  });

  it('Renderuje wiadomość powitalną z imieniem użytkownika', async () => {
    const { getByTestId } = renderWithProviders(<Home navigation={mockNavigation} />);
    await waitFor(() => expect(mockFetchUserStatistics).toHaveBeenCalled());
    expect(getByTestId('welcome-message')).toHaveTextContent('Witaj, Jan Kowalski!');
  });

  it('Renderuje selektory okresów i umożliwia przełączanie okresów', async () => {
    const { getByTestId } = renderWithProviders(<Home navigation={mockNavigation} />);
    await waitFor(() => expect(mockFetchUserStatistics).toHaveBeenCalled());

    const periodValues = ['all', 'year', '30days', '7days', 'today'];
    const periodLabels = ['Cały okres', '1 rok', '30 dni', '7 dni', 'Dzisiaj'];

    periodValues.forEach((value, index) => {
      expect(getByTestId(`period-text-${value}`)).toHaveTextContent(periodLabels[index]);
    });

    await act(async () => {
      fireEvent.press(getByTestId('period-button-7days'));
    });
    expect(mockFetchUserStatistics).toHaveBeenCalledWith(expect.any(String), expect.any(String));
  });

  it('Wyświetla statystyki poprawnie', async () => {
    const { getByTestId } = renderWithProviders(<Home navigation={mockNavigation} />);
    await waitFor(() => expect(mockFetchUserStatistics).toHaveBeenCalled());

    expect(getByTestId('stat-label-average-speed')).toHaveTextContent('Średnia prędkość:');
    expect(getByTestId('stat-value-average-speed')).toHaveTextContent('10.50 km/h');
    expect(getByTestId('stat-label-total-distance')).toHaveTextContent('Całkowity dystans:');
    expect(getByTestId('stat-value-total-distance')).toHaveTextContent('15.00 km');
    expect(getByTestId('stat-label-total-time')).toHaveTextContent('Całkowity czas:');
    expect(getByTestId('stat-value-total-time')).toHaveTextContent('2 godz. 0 min.');
    expect(getByTestId('stat-label-calories-burned')).toHaveTextContent('Spalone kalorie:');
    expect(getByTestId('stat-value-calories-burned')).toHaveTextContent('500 kcal');
    expect(getByTestId('stat-label-most-liked')).toHaveTextContent('Najbardziej lubisz:');
    expect(getByTestId('stat-value-most-liked')).toHaveTextContent('Bieganie');
  });

  it('Wyświetla ranking aktywności poprawnie', async () => {
    const { getByTestId } = renderWithProviders(<Home navigation={mockNavigation} />);
    await waitFor(() => expect(mockFetchUserStatistics).toHaveBeenCalled());

    expect(getByTestId('activity-ranking-title')).toHaveTextContent('Twój ranking aktywności');
    expect(getByTestId('activity-title-0')).toHaveTextContent('Bieganie');
    expect(getByTestId('activity-count-0')).toHaveTextContent('Liczba wystąpień: 5');
    expect(getByTestId('activity-distance-0')).toHaveTextContent('Dystans: 10.00 km');
    expect(getByTestId('activity-time-0')).toHaveTextContent('Czas: 1 godz. 0 min.');
    expect(getByTestId('activity-calories-0')).toHaveTextContent('Spalone Kalorie: 300 kcal');

    expect(getByTestId('activity-title-1')).toHaveTextContent('Jazda na rowerze');
    expect(getByTestId('activity-count-1')).toHaveTextContent('Liczba wystąpień: 3');
    expect(getByTestId('activity-distance-1')).toHaveTextContent('Dystans: 5.00 km');
    expect(getByTestId('activity-time-1')).toHaveTextContent('Czas: 0 godz. 30 min.');
    expect(getByTestId('activity-calories-1')).toHaveTextContent('Spalone Kalorie: 200 kcal');
  });

  it('Wyświetla wiadomość kiedy użytkownik nie ma żadnych aktywności', async () => {
    mockFetchUserStatistics.mockResolvedValue({
      ...mockStatistics,
      activities: [],
    });

    const { getByTestId } = renderWithProviders(<Home navigation={mockNavigation} />);
    await waitFor(() => expect(mockFetchUserStatistics).toHaveBeenCalled());

    expect(getByTestId('no-activities-message')).toHaveTextContent(
      'Hej, nie masz jeszcze żadnych aktywności w tym okresie! Może czas się poruszać?'
    );
    expect(getByTestId('new-activity-button')).toBeTruthy();
  });

  it('Nawiguje do ekranu Nowa aktywność', async () => {
    mockFetchUserStatistics.mockResolvedValue({
      ...mockStatistics,
      activities: [],
    });

    const { getByTestId } = renderWithProviders(<Home navigation={mockNavigation} />);
    await waitFor(() => expect(mockFetchUserStatistics).toHaveBeenCalled());

    await act(async () => {
      fireEvent.press(getByTestId('new-activity-button'));
    });
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Nowa aktywność');
  });

  it('Obsługuje błąd kiedy pobieranie statystyk się nie powiedzie', async () => {
    mockFetchUserStatistics.mockRejectedValue(new Error('Błąd pobierania'));
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { queryByTestId } = renderWithProviders(<Home navigation={mockNavigation} />);
    await waitFor(() => expect(mockFetchUserStatistics).toHaveBeenCalled());

    expect(queryByTestId('loading-indicator')).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith('Błąd podczas pobierania statystyk:', expect.any(Error));

    consoleErrorSpy.mockRestore();
  });

  it('Wyświetla "Ładowanie typów aktywności..." kiedy activityTypes (pobierane z API) nie są dostępne', async () => {
    const { getAllByTestId } = renderWithProviders(<Home navigation={mockNavigation} />, {
      apiValue: { activityTypes: null },
    });
    await waitFor(() => expect(mockFetchUserStatistics).toHaveBeenCalled());

    const loadingTexts = getAllByTestId('activity-title-0');
    expect(loadingTexts).toHaveLength(1);
    expect(loadingTexts[0]).toHaveTextContent('Ładowanie typów aktywności...');
  });
});
