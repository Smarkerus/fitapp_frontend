import { createStackNavigator } from "@react-navigation/stack";
import Home from "../screens/Home";
import MyTrips from "../screens/MyTrips";

const Stack = createStackNavigator();

const MainStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="FitApp" component={Home} />
      <Stack.Screen name="Moje Trasy" component={MyTrips} />
    </Stack.Navigator>
  );
};

export default MainStack;
