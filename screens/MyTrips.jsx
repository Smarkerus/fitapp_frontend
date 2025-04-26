import { View, Text } from 'react-native';
import { globalStyles } from '../styles';
import React, { useEffect, useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function MyTrips() {
  const { fetchUserTrips } = useContext(AuthContext);
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const getTrips = async () => {
      const userTrips = await fetchUserTrips();
      setTrips(userTrips);
      console.log('Pobrano informacje o trasach: ', userTrips);
    };
    getTrips();
  }, []);

  return (
    <View style={globalStyles.background}>
      <View style={globalStyles.container}>
        <Text style={globalStyles.title}>Moje trasy</Text>
      </View>
    </View>
  );
}
