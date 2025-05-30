import { render, fireEvent, waitFor } from '@testing-library/react-native';
import Login from '../Login';
import { AuthContext } from '../../context/AuthContext';

jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      backendUrl: 'http://mock-backend-url/',
    },
  },
}));

describe('Komponent Login', () => {
  const mockLogin = jest.fn();
  const mockNavigation = { navigate: jest.fn() };

  const renderComponent = (overrideProps = {}) =>
    render(
      <AuthContext.Provider value={{ login: mockLogin }}>
        <Login navigation={mockNavigation} {...overrideProps} />
      </AuthContext.Provider>
    );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Renderuje komponent poprawnie', () => {
    const { getByText, getByPlaceholderText } = renderComponent();
    
    expect(getByText('Podaj dane logowania')).toBeTruthy();
    expect(getByPlaceholderText('Nazwa użytkownika')).toBeTruthy();
    expect(getByPlaceholderText('Hasło')).toBeTruthy();
    expect(getByText('Zaloguj')).toBeTruthy();
    expect(getByText('Zarejestruj się')).toBeTruthy();
  });

  it('Aktualizuje pole username po wpisaniu tekstu', () => {
    const { getByPlaceholderText } = renderComponent();
    const usernameInput = getByPlaceholderText('Nazwa użytkownika');
    
    fireEvent.changeText(usernameInput, 'testuser');
    expect(usernameInput.props.value).toBe('testuser');
  });

  it('Aktualizuje pole hasła po wpisaniu tekstu', () => {
    const { getByPlaceholderText } = renderComponent();
    const passwordInput = getByPlaceholderText('Hasło');
    
    fireEvent.changeText(passwordInput, 'testpassword');
    expect(passwordInput.props.value).toBe('testpassword');
  });

  it('Wywołuje funkcję login po naciśnięciu przycisku Zaloguj', async () => {
    const { getByPlaceholderText, getByText } = renderComponent();
    const usernameInput = getByPlaceholderText('Nazwa użytkownika');
    const passwordInput = getByPlaceholderText('Hasło');
    const loginButton = getByText('Zaloguj');

    fireEvent.changeText(usernameInput, 'testuser');
    fireEvent.changeText(passwordInput, 'testpassword');
    fireEvent.press(loginButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'testpassword');
    });
  });

  it('Wywołuje funkcję login po naciśnięciu Enter w polu username', async () => {
    const { getByPlaceholderText } = renderComponent();
    const usernameInput = getByPlaceholderText('Nazwa użytkownika');
    const passwordInput = getByPlaceholderText('Hasło');

    fireEvent.changeText(usernameInput, 'testuser');
    fireEvent.changeText(passwordInput, 'testpassword');
    fireEvent(usernameInput, 'submitEditing');

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'testpassword');
    });
  });

  it('Wywołuje funkcję login po naciśnięciu Enter w polu hasła', async () => {
    const { getByPlaceholderText } = renderComponent();
    const usernameInput = getByPlaceholderText('Nazwa użytkownika');
    const passwordInput = getByPlaceholderText('Hasło');

    fireEvent.changeText(usernameInput, 'testuser');
    fireEvent.changeText(passwordInput, 'testpassword');
    fireEvent(passwordInput, 'submitEditing');

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('testuser', 'testpassword');
    });
  });

  it('Przekierowuje do ekranu rejestracji po naciśnięciu przycisku Zarejestruj się', () => {
    const { getByText } = renderComponent();
    const registerButton = getByText('Zarejestruj się');

    fireEvent.press(registerButton);
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Zarejestruj się');
  });

  it('Wyświetla błąd przy nieudanym logowaniu', async () => {
    mockLogin.mockRejectedValueOnce(new Error('Błąd logowania'));
    const { getByPlaceholderText, getByText, findByText } = renderComponent();
    const usernameInput = getByPlaceholderText('Nazwa użytkownika');
    const passwordInput = getByPlaceholderText('Hasło');
    const loginButton = getByText('Zaloguj');

    fireEvent.changeText(usernameInput, 'testuser');
    fireEvent.changeText(passwordInput, 'testpassword');
    fireEvent.press(loginButton);

    const errorText = await findByText('Nieprawidłowe dane logowania');
    expect(errorText).toBeTruthy();
  });
});