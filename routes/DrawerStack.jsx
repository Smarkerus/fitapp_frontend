import { useContext, lazy } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Home from '../screens/Home';
const MyTrips = lazy(() => import('../screens/MyTrips'));
const MyActivity = lazy(() => import('../screens/MyActivity'));
const Account = lazy(() => import('../screens/Account'));
const Reminder = lazy(() => import('../screens/Reminder'));
import { AuthContext } from '../context/AuthContext';

const Drawer = createDrawerNavigator();

const NullComponent = () => null;

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
      <Drawer.Screen
        name="Ekran Główny"
        component={Home}
        options={{
          drawerLabel: 'Ekran Główny',
          drawerIcon: ({ color }) => <Icon name="home" size={24} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Moje trasy"
        component={MyTrips}
        options={{
          drawerLabel: 'Moje trasy',
          drawerIcon: ({ color }) => <Icon name="map" size={24} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Nowa aktywność"
        component={MyActivity}
        options={{
          drawerLabel: 'Nowa aktywność',
          drawerIcon: ({ color }) => <Icon name="plus" size={24} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Moje konto"
        component={Account}
        options={{
          drawerLabel: 'Moje konto',
          drawerIcon: ({ color }) => <Icon name="account" size={24} color={color} />,
        }}
      />
      <Drawer.Screen
        name="Przypominajka"
        component={Reminder}
        options={{
          drawerLabel: 'Przypominajka',
          drawerIcon: ({ color }) => <Icon name="alarm" size={24} color={color} />,
        }}
      />
      <Drawer.Screen
        component={NullComponent}
        name="Wyloguj"
        options={{
          drawerLabel: 'Wyloguj',
          drawerIcon: ({ color }) => <Icon name="logout" size={24} color={color} />,
        }}
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
