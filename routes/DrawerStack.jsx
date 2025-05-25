import { useContext, lazy } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Home from '../screens/Home';
const MyTrips = lazy(() => import('../screens/MyTrips'));
const MyActivity = lazy(() => import('../screens/MyActivity'));
const Account = lazy(() => import('../screens/Account'));
const Reminder = lazy(() => import('../screens/Reminder'));
import { AuthContext } from '../context/AuthContext';

const Drawer = createDrawerNavigator();

const DrawerStack = () => {
  const { logout } = useContext(AuthContext);

  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true,
        drawerStyle: {
          backgroundColor: '#f4f4f4',
          width: 250,
        },
        drawerActiveTintColor: '#007AFF',
        drawerInactiveTintColor: '#666',
        drawerType: 'slide',
        drawerPosition: 'right',
      }}
    >
      <Drawer.Screen name="Ekran Główny" component={Home} />
      <Drawer.Screen name="Moje trasy" component={MyTrips} />
      <Drawer.Screen name="Nowa aktywność" component={MyActivity} />
      <Drawer.Screen name="Moje konto" component={Account} />
      <Drawer.Screen name="Przypominajka" component={Reminder} />
      <Drawer.Screen
        name="Wyloguj"
        component={Home}
        listeners={{
          drawerItemPress: e => {
            e.preventDefault();
            logout();
          },
        }}
      />
    </Drawer.Navigator>
  );
};

export default DrawerStack;
