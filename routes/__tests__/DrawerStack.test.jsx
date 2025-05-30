import { render, fireEvent } from '@testing-library/react-native';
import DrawerStack from '../DrawerStack';
import { AuthContext } from '../../context/AuthContext';

jest.mock('@react-navigation/drawer', () => {
  const { Text } = require('react-native');
  return {
    createDrawerNavigator: () => ({
      Navigator: ({ children }) => <>{children}</>,
      Screen: ({ name, listeners }) => (
        <Text
          testID={`screen-${name}`}
          onPress={() => {
            const event = { preventDefault: jest.fn() };
            listeners?.drawerItemPress?.(event);
          }}
        >
          {name}
        </Text>
      ),
    }),
  };
});

jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      backendUrl: 'http://mock-backend-url/',
    },
  },
}));

jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => {
  const { Text } = require('react-native');
  return props => <Text testID="icon" {...props} />;
});

jest.mock('../../screens/Home', () => () => {
  const { Text } = require('react-native');
  return <Text>Ekran Główny</Text>;
});

jest.mock('../../screens/MyTrips', () => () => {
  const { Text } = require('react-native');
  return <Text>Moje trasy</Text>;
});

jest.mock('../../screens/MyActivity', () => () => {
  const { Text } = require('react-native');
  return <Text>Nowa aktywność</Text>;
});

jest.mock('../../screens/Account', () => () => {
  const { Text } = require('react-native');
  return <Text>Moje konto</Text>;
});

jest.mock('../../screens/Reminder', () => () => {
  const { Text } = require('react-native');
  return <Text>Przypominajka</Text>;
});

describe('Komponent DrawerStack', () => {
  it('Renderuje ekrany z poprawnymi nazwami', () => {
    const dummyLogout = jest.fn();
    const { getByText } = render(
      <AuthContext.Provider value={{ logout: dummyLogout }}>
        <DrawerStack />
      </AuthContext.Provider>
    );
    expect(getByText('Ekran Główny')).toBeTruthy();
    expect(getByText('Moje trasy')).toBeTruthy();
    expect(getByText('Nowa aktywność')).toBeTruthy();
    expect(getByText('Moje konto')).toBeTruthy();
    expect(getByText('Przypominajka')).toBeTruthy();
    expect(getByText('Wyloguj')).toBeTruthy();
  });

  it('Wywołuje logout, gdy naciśnięto Wyloguj', () => {
    const mockLogout = jest.fn();
    const { getByTestId } = render(
      <AuthContext.Provider value={{ logout: mockLogout }}>
        <DrawerStack />
      </AuthContext.Provider>
    );
    const logoutScreen = getByTestId('screen-Wyloguj');
    fireEvent.press(logoutScreen);
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
