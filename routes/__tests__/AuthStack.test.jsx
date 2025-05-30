import { render } from '@testing-library/react-native';
import AuthStack from '../AuthStack';

jest.mock('@react-navigation/stack', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    createStackNavigator: () => ({
      Navigator: ({ children }) => <>{children}</>,
      Screen: ({ name }) => <Text>{name}</Text>,
    }),
  };
});

jest.mock('../../screens/Login', () => () => {
  const {Text } = require('react-native');
  return <Text>Zaloguj się</Text>;
});
jest.mock('../../screens/Register', () => () => {
  const { Text } = require('react-native');
  return <Text>Zarejestruj się</Text>;
});

describe('Komponent AuthStack', () => {
  it('Renderuje dwa ekrany z poprawnymi nazwami', () => {
    const { getByText } = render(<AuthStack />);
    expect(getByText('Zaloguj się')).toBeTruthy();
    expect(getByText('Zarejestruj się')).toBeTruthy();
  });

});
