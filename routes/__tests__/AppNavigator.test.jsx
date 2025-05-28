import { render, screen, waitFor } from '@testing-library/react-native';
import AppNavigator from '../AppNavigator';
import { AuthContext } from '../../context/AuthContext';

jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      backendUrl: 'http://mock-backend-url/',
    },
  },
}));

jest.mock('../AuthStack', () => {
  const { View, Text } = require('react-native');
  return () => (
    <View>
      <Text>AuthStack</Text>
    </View>
  );
});

jest.mock('../DrawerStack', () => {
  const { View, Text } = require('react-native');
  return () => (
    <View>
      <Text>DrawerStack</Text>
    </View>
  );
});

describe('AppNavigator', () => {
  test('Renderuje AuthStacka jeżeli użytkownik jest niezalogowany', async () => {
    const mockLoadUser = jest.fn().mockResolvedValue(undefined);
    const mockContext = {
      user: null,
      loadUser: mockLoadUser,
    };

    render(
      <AuthContext.Provider value={mockContext}>
        <AppNavigator />
      </AuthContext.Provider>
    );

    expect(screen.getByText('AuthStack')).toBeTruthy();
    await waitFor(() => expect(mockLoadUser).toHaveBeenCalledTimes(1));
  });

  test('Renderuje DrawerStack w przypadku zalogowania użytkownika', async () => {
    const mockLoadUser = jest.fn().mockResolvedValue(undefined);
    const mockContext = {
      user: { id: 1 },
      loadUser: mockLoadUser,
    };

    render(
      <AuthContext.Provider value={mockContext}>
        <AppNavigator />
      </AuthContext.Provider>
    );

    expect(screen.getByText('DrawerStack')).toBeTruthy();
    await waitFor(() => expect(mockLoadUser).toHaveBeenCalledTimes(1));
  });
});
