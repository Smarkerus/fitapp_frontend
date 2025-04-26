import React from 'react';
import { View, Text } from 'react-native';
import { globalStyles } from '../styles';

export default function MyTrips() {
  return (
    <View style={globalStyles.background}>
      <View style={globalStyles.container}>
        <Text style={globalStyles.title}>Moje trasy</Text>
      </View>
    </View>
  );
}
