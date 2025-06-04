import { useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import AuthStack from './AuthStack';
import DrawerStack from './DrawerStack';

function AppNavigator() {
  const { user, loadUser } = useContext(AuthContext);

useEffect(() => {
  const fetchUser = async () => {
    await loadUser();
  };
  fetchUser();
}, [loadUser]);

  return user ? <DrawerStack /> : <AuthStack />;
}

export default AppNavigator;
