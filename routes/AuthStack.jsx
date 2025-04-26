import { createStackNavigator } from "@react-navigation/stack";
import Login from "../screens/Login";
import Register from "../screens/Register";

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
