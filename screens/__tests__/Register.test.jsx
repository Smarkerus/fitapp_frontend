import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Register from '../Register';
import { AuthContext } from '../../context/AuthContext';

jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      backendUrl: 'http://mock-backend-url/',
    },
  },
}));

describe('Komponent Zarejestruj się', () => {
  const mockRegister = jest.fn();
  const mockLogin = jest.fn();
  const mockNavigation = { navigate: jest.fn() };

  const renderComponent = (overrideProps = {}) =>
    render(
      <AuthContext.Provider value={{ register: mockRegister, login: mockLogin }}>
        <Register navigation={mockNavigation} {...overrideProps} />
      </AuthContext.Provider>
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Renderuje komponent poprawnie', () => {
    const { getByText, getByPlaceholderText } = renderComponent();

    expect(getByText('Rejestracja')).toBeTruthy();
    expect(getByText('Wypełnij formularz, aby się zarejestrować')).toBeTruthy();
    expect(getByPlaceholderText('Wprowadź swój adres e-mail')).toBeTruthy();
    expect(getByPlaceholderText('Wprowadź swoje hasło')).toBeTruthy();
    expect(getByPlaceholderText('Podaj swoje imię')).toBeTruthy();
    expect(getByPlaceholderText('Podaj swoje nazwisko')).toBeTruthy();
    expect(getByText('Zarejestruj się')).toBeTruthy();
  });

  it('Aktualizuje pole email po wpisaniu tekstu', () => {
    const { getByPlaceholderText } = renderComponent();
    const emailInput = getByPlaceholderText('Wprowadź swój adres e-mail');

    fireEvent.changeText(emailInput, 'test@example.com');
    expect(emailInput.props.value).toBe('test@example.com');
  });

  it('Aktualizuje pole hasła po wpisaniu tekstu', () => {
    const { getByPlaceholderText } = renderComponent();
    const passwordInput = getByPlaceholderText('Wprowadź swoje hasło');

    fireEvent.changeText(passwordInput, 'testpassword');
    expect(passwordInput.props.value).toBe('testpassword');
  });

  it('Aktualizuje pole imię po wpisaniu tekstu', () => {
    const { getByPlaceholderText } = renderComponent();
    const nameInput = getByPlaceholderText('Podaj swoje imię');

    fireEvent.changeText(nameInput, 'Jan');
    expect(nameInput.props.value).toBe('Jan');
  });

  it('Aktualizuje pole nazwisko po wpisaniu tekstu', () => {
    const { getByPlaceholderText } = renderComponent();
    const lastNameInput = getByPlaceholderText('Podaj swoje nazwisko');

    fireEvent.changeText(lastNameInput, 'Kowalski');
    expect(lastNameInput.props.value).toBe('Kowalski');
  });

  it('Wywołuje funkcję register i login po naciśnięciu przycisku Zarejestruj się', async () => {
    const { getByPlaceholderText, getByText } = renderComponent();
    const emailInput = getByPlaceholderText('Wprowadź swój adres e-mail');
    const passwordInput = getByPlaceholderText('Wprowadź swoje hasło');
    const nameInput = getByPlaceholderText('Podaj swoje imię');
    const lastNameInput = getByPlaceholderText('Podaj swoje nazwisko');
    const registerButton = getByText('Zarejestruj się');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'testpassword');
    fireEvent.changeText(nameInput, 'Jan');
    fireEvent.changeText(lastNameInput, 'Kowalski');
    fireEvent.press(registerButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('test@example.com', 'testpassword', 'Jan', 'Kowalski');
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'testpassword');
      expect(mockNavigation.navigate).toHaveBeenCalledWith('Zaloguj się');
    });
  });

  it('Wywołuje funkcję register po naciśnięciu Enter w polu email', async () => {
    const { getByPlaceholderText } = renderComponent();
    const emailInput = getByPlaceholderText('Wprowadź swój adres e-mail');
    const passwordInput = getByPlaceholderText('Wprowadź swoje hasło');
    const nameInput = getByPlaceholderText('Podaj swoje imię');
    const lastNameInput = getByPlaceholderText('Podaj swoje nazwisko');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'testpassword');
    fireEvent.changeText(nameInput, 'Jan');
    fireEvent.changeText(lastNameInput, 'Kowalski');
    fireEvent(emailInput, 'submitEditing');

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('test@example.com', 'testpassword', 'Jan', 'Kowalski');
    });
  });

  it('Wyświetla błąd przy nieudanej rejestracji', async () => {
    mockRegister.mockRejectedValueOnce({ response: { data: { detail: 'Błąd rejestracji' } } });
    const { getByPlaceholderText, getByText, findByText } = renderComponent();
    const emailInput = getByPlaceholderText('Wprowadź swój adres e-mail');
    const passwordInput = getByPlaceholderText('Wprowadź swoje hasło');
    const nameInput = getByPlaceholderText('Podaj swoje imię');
    const lastNameInput = getByPlaceholderText('Podaj swoje nazwisko');
    const registerButton = getByText('Zarejestruj się');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'testpassword');
    fireEvent.changeText(nameInput, 'Jan');
    fireEvent.changeText(lastNameInput, 'Kowalski');
    fireEvent.press(registerButton);

    const errorText = await findByText('Nieprawidłowe dane rejestracji: Błąd rejestracji');
    expect(errorText).toBeTruthy();
  });

  it('Wyświetla ogólny błąd gdy odpowiedź serwera nie zawiera szczegółów', async () => {
    mockRegister.mockRejectedValueOnce(new Error('Błąd serwera'));
    const { getByPlaceholderText, getByText, findByText } = renderComponent();
    const emailInput = getByPlaceholderText('Wprowadź swój adres e-mail');
    const passwordInput = getByPlaceholderText('Wprowadź swoje hasło');
    const nameInput = getByPlaceholderText('Podaj swoje imię');
    const lastNameInput = getByPlaceholderText('Podaj swoje nazwisko');
    const registerButton = getByText('Zarejestruj się');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent.changeText(passwordInput, 'testpassword');
    fireEvent.changeText(nameInput, 'Jan');
    fireEvent.changeText(lastNameInput, 'Kowalski');
    fireEvent.press(registerButton);

    const errorText = await findByText('Nieprawidłowe dane rejestracji: Błąd serwera');
    expect(errorText).toBeTruthy();
  });
});