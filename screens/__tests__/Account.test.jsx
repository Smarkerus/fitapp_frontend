import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Account from '../Account';
import { AuthContext } from '../../context/AuthContext';
import Toast from 'react-native-toast-message';


jest.spyOn(Toast, 'show').mockImplementation(() => {});

jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      backendUrl: 'http://mock-backend-url/',
    },
  },
}));

describe('Komponent Account', () => {
  const mockEditUserDetails = jest.fn();
  const mockNavigation = { navigate: jest.fn() };
  const mockUser = {
    name: 'Jan',
    last_name: 'Kowalski',
    email: 'test@example.com',
    details: {
      age: 30,
      weight: 80,
      height: 180,
      gender: 'male',
    },
  };

  const renderComponent = (overrideProps = {}, userOverride = mockUser) =>
    render(
      <AuthContext.Provider value={{ user: userOverride, editUserDetails: mockEditUserDetails }}>
        <Account navigation={mockNavigation} {...overrideProps} />
      </AuthContext.Provider>
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Renderuje komponent poprawnie w trybie wyświetlania', () => {
    const { getByText } = renderComponent();

    expect(getByText('Profil użytkownika')).toBeTruthy();
    expect(getByText('Imię: Jan')).toBeTruthy();
    expect(getByText('Nazwisko: Kowalski')).toBeTruthy();
    expect(getByText('Email: test@example.com')).toBeTruthy();
    expect(getByText('Wiek: 30 lat')).toBeTruthy();
    expect(getByText('Waga: 80 kg')).toBeTruthy();
    expect(getByText('Wzrost: 180 cm')).toBeTruthy();
    expect(getByText('Płeć: Mężczyzna')).toBeTruthy();
    expect(getByText('Edytuj dane')).toBeTruthy();
  });

  it('Przełącza na tryb edycji po naciśnięciu przycisku Edytuj dane', () => {
    const { getByText, getByPlaceholderText } = renderComponent();

    fireEvent.press(getByText('Edytuj dane'));
    expect(getByText('Edytuj dane:')).toBeTruthy();
    expect(getByPlaceholderText('Wiek')).toBeTruthy();
    expect(getByPlaceholderText('Waga (kg)')).toBeTruthy();
    expect(getByPlaceholderText('Wzrost (cm)')).toBeTruthy();
    expect(getByText('Mężczyzna')).toBeTruthy();
    expect(getByText('Kobieta')).toBeTruthy();
    expect(getByText('Zapisz')).toBeTruthy();
    expect(getByText('Anuluj')).toBeTruthy();
  });

  it('Aktualizuje pole wiek po wpisaniu tekstu', () => {
    const { getByText, getByPlaceholderText } = renderComponent();

    fireEvent.press(getByText('Edytuj dane'));
    const ageInput = getByPlaceholderText('Wiek');
    fireEvent.changeText(ageInput, '25');
    expect(ageInput.props.value).toBe('25');
  });

  it('Aktualizuje pole waga po wpisaniu tekstu', () => {
    const { getByText, getByPlaceholderText } = renderComponent();

    fireEvent.press(getByText('Edytuj dane'));
    const weightInput = getByPlaceholderText('Waga (kg)');
    fireEvent.changeText(weightInput, '75.5');
    expect(weightInput.props.value).toBe('75.5');
  });

  it('Aktualizuje pole wzrost po wpisaniu tekstu', () => {
    const { getByText, getByPlaceholderText } = renderComponent();

    fireEvent.press(getByText('Edytuj dane'));
    const heightInput = getByPlaceholderText('Wzrost (cm)');
    fireEvent.changeText(heightInput, '175');
    expect(heightInput.props.value).toBe('175');
  });

  it('Zmienia wybór płci na kobietę', () => {
    const { getByText, getAllByRole } = renderComponent();

    fireEvent.press(getByText('Edytuj dane'));
    const checkboxes = getAllByRole('checkbox');
    const maleCheckbox = checkboxes[0];
    const femaleCheckbox = checkboxes[1];

    fireEvent(femaleCheckbox, 'valueChange', true);

    expect(femaleCheckbox.props.accessibilityState.checked).toBe(true);
    expect(maleCheckbox.props.accessibilityState.checked).toBe(false);
  });

  it('Zmienia wybór płci na mężczyznę', () => {
    const { getByText, getAllByRole } = renderComponent();

    fireEvent.press(getByText('Edytuj dane'));
    const checkboxes = getAllByRole('checkbox');
    const maleCheckbox = checkboxes[0];
    const femaleCheckbox = checkboxes[1];

    fireEvent(maleCheckbox, 'valueChange', true);

    expect(maleCheckbox.props.accessibilityState.checked).toBe(true);
    expect(femaleCheckbox.props.accessibilityState.checked).toBe(false);
  });

  it('Wywołuje editUserDetails po naciśnięciu Zapisz z prawidłowymi danymi', async () => {
    const { getByText, getByPlaceholderText, getAllByRole } = renderComponent();

    fireEvent.press(getByText('Edytuj dane'));
    fireEvent.changeText(getByPlaceholderText('Wiek'), '25');
    fireEvent.changeText(getByPlaceholderText('Waga (kg)'), '75.5');
    fireEvent.changeText(getByPlaceholderText('Wzrost (cm)'), '175');
    const checkboxes = getAllByRole('checkbox');
    const femaleCheckbox = checkboxes[1];
    fireEvent(femaleCheckbox, 'valueChange', true);
    fireEvent.press(getByText('Zapisz'));

    await waitFor(() => {
      expect(mockEditUserDetails).toHaveBeenCalledWith(75.5, 175, 25, 'female');
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'success',
        text1: 'Sukces',
        text2: 'Dane zostały zapisane!',
      });
    });
  });

  it('Wyświetla błąd dla nieprawidłowego wieku', async () => {
    const { getByText, getByPlaceholderText } = renderComponent();

    fireEvent.press(getByText('Edytuj dane'));
    fireEvent.changeText(getByPlaceholderText('Wiek'), '-5');
    fireEvent.changeText(getByPlaceholderText('Waga (kg)'), '75.5');
    fireEvent.changeText(getByPlaceholderText('Wzrost (cm)'), '175');
    fireEvent.press(getByText('Zapisz'));

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Błąd',
        text2: 'Wiek musi być dodatnią liczbą całkowitą.',
      });
      expect(mockEditUserDetails).not.toHaveBeenCalled();
    });
  });

  it('Wyświetla błąd dla nieprawidłowej wagi', async () => {
    const { getByText, getByPlaceholderText } = renderComponent();

    fireEvent.press(getByText('Edytuj dane'));
    fireEvent.changeText(getByPlaceholderText('Wiek'), '25');
    fireEvent.changeText(getByPlaceholderText('Waga (kg)'), '-75.5');
    fireEvent.changeText(getByPlaceholderText('Wzrost (cm)'), '175');
    fireEvent.press(getByText('Zapisz'));

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Błąd',
        text2: 'Waga musi być dodatnią liczbą.',
      });
      expect(mockEditUserDetails).not.toHaveBeenCalled();
    });
  });

  it('Wyświetla błąd dla nieprawidłowego wzrostu', async () => {
    const { getByText, getByPlaceholderText } = renderComponent();

    fireEvent.press(getByText('Edytuj dane'));
    fireEvent.changeText(getByPlaceholderText('Wiek'), '25');
    fireEvent.changeText(getByPlaceholderText('Waga (kg)'), '75.5');
    fireEvent.changeText(getByPlaceholderText('Wzrost (cm)'), '-175');
    fireEvent.press(getByText('Zapisz'));

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Błąd',
        text2: 'Wzrost musi być dodatnią liczbą.',
      });
      expect(mockEditUserDetails).not.toHaveBeenCalled();
    });
  });

  it('Wyświetla błąd przy nieudanym zapisie', async () => {
    mockEditUserDetails.mockRejectedValueOnce(new Error('Błąd zapisu'));
    const { getByText, getByPlaceholderText } = renderComponent();

    fireEvent.press(getByText('Edytuj dane'));
    fireEvent.changeText(getByPlaceholderText('Wiek'), '25');
    fireEvent.changeText(getByPlaceholderText('Waga (kg)'), '75.5');
    fireEvent.changeText(getByPlaceholderText('Wzrost (cm)'), '175');
    fireEvent.press(getByText('Zapisz'));

    await waitFor(() => {
      expect(Toast.show).toHaveBeenCalledWith({
        type: 'error',
        text1: 'Błąd',
        text2: 'Wystąpił błąd podczas zapisywania danych.',
      });
    });
  });

  it('Resetuje dane po naciśnięciu Anuluj', async () => {
    const { getByText, getByPlaceholderText, getAllByRole } = renderComponent();

    fireEvent.press(getByText('Edytuj dane'));
    fireEvent.changeText(getByPlaceholderText('Wiek'), '25');
    fireEvent.changeText(getByPlaceholderText('Waga (kg)'), '75.5');
    fireEvent.changeText(getByPlaceholderText('Wzrost (cm)'), '175');
    const checkboxes = getAllByRole('checkbox');
    const femaleCheckbox = checkboxes[1];
    fireEvent(femaleCheckbox, 'valueChange', true);
    fireEvent.press(getByText('Anuluj'));

    fireEvent.press(getByText('Edytuj dane'));

    const updatedCheckboxes = getAllByRole('checkbox');
    const maleCheckbox = updatedCheckboxes[0];
    const femaleCheckboxUpdated = updatedCheckboxes[1];

    expect(getByPlaceholderText('Wiek').props.value).toBe('30');
    expect(getByPlaceholderText('Waga (kg)').props.value).toBe('80');
    expect(getByPlaceholderText('Wzrost (cm)').props.value).toBe('180');
    expect(maleCheckbox.props.accessibilityState.checked).toBe(true);
    expect(femaleCheckboxUpdated.props.accessibilityState.checked).toBe(false);
  });

  it('Renderuje domyślne wartości przy braku danych użytkownika', () => {
    const { getByText } = renderComponent({}, {});

    expect(getByText('Imię: Brak informacji')).toBeTruthy();
    expect(getByText('Nazwisko: Brak informacji')).toBeTruthy();
    expect(getByText('Email: Brak informacji')).toBeTruthy();
    expect(getByText('Wiek: Brak informacji')).toBeTruthy();
    expect(getByText('Waga: Brak informacji')).toBeTruthy();
    expect(getByText('Wzrost: Brak informacji')).toBeTruthy();
    expect(getByText('Płeć: Brak informacji')).toBeTruthy();
  });
});