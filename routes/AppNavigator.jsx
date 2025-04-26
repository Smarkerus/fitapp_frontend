import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import AuthStack from './AuthStack';
import MainStack from './MainStack';
import * as SplashScreen from 'expo-splash-screen';

function AppNavigator() {
  const { user, loadUser } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      await loadUser();
      setIsLoading(false);
      await SplashScreen.hideAsync();
    };
    fetchUser();
  }, []);

  if (isLoading) {
    return null;
  }

  return user ? <MainStack /> : <AuthStack />;
}

export default AppNavigator;
