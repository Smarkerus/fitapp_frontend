import { createStackNavigator } from '@react-navigation/stack';
import { lazy } from 'react';
import Login from '../screens/Login';
const Register = lazy(() => import('../screens/Register'));

const Stack = createStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Zaloguj się" component={Login} />
      <Stack.Screen name="Zarejestruj się" component={Register} />
    </Stack.Navigator>
  );
};

export default AuthStack;
