import React from 'react';
import { Image } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import Home from '../screens/Home';
import MyTrips from '../screens/MyTrips';
// import MyAchievements from '../screens/MyAchievements';
// import ActivityMap from '../screens/ActivityMap';
import { globalStyles } from '../styles';

const Drawer = createDrawerNavigator();

const DrawerStack = () => {
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
      }}
    >
      <Drawer.Screen name="Home" component={Home} />
      <Drawer.Screen name="Moje trasy" component={MyTrips} />
      {/* <Drawer.Screen name="Moje osiągnięcia" component={MyAchievements} />
      <Drawer.Screen name="Nowa aktywność" component={ActivityMap} /> */}
    </Drawer.Navigator>
  );
};

export default DrawerStack;
