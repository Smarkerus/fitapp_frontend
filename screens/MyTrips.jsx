import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { globalStyles } from '../styles';
import React, { useContext, useState, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import MapView, { PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function MyTrips() {
  const { fetchUserTrips } = useContext(AuthContext);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedTripId, setExpandedTripId] = useState(null);
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      const getTrips = async () => {
        setLoading(true);
        const userTrips = await fetchUserTrips();
        setTrips(userTrips.slice(0, 25));
        setLoading(false);
        console.log('Pobrano informacje o trasach: ', userTrips[0]);
      };
      getTrips();
    }, [fetchUserTrips])
  );

  const computeAverageSpeed = trip => {
    if (trip.summary.duration > 0 && trip.summary.distance > 0) {
      let averageSpeed = trip.summary.distance / 1000 / (trip.summary.duration / 3600);
      return averageSpeed;
    } else if (trip.summary.distance > 0) {
      let tempEndTime = new Date(trip.points[trip.points.length - 1].timestamp);
      let tempAverageSpeed =
        trip.summary.distance / 1000 / ((tempEndTime - new Date(trip.summary.start_time)) / 3600000);
      return tempAverageSpeed;
    }
    return 0;
  };

  const toggleTripDetails = tripId => {
    setExpandedTripId(prevId => (prevId === tripId ? null : tripId));
  };

  const renderTripItem = ({ item }) => {
    return (
      <TouchableOpacity style={globalStyles.card} onPress={() => toggleTripDetails(item.summary.trip_id)}>
        <Text style={globalStyles.cardTitle}>{item.name || `Trasa ${item.summary.trip_id}`}</Text>
        <Text style={globalStyles.listItemSubtitle}>
          Data rozpoczęcia:{' '}
          {new Date(item.summary.start_time).toLocaleString('pl-PL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
        {item.summary.end_time && (
          <Text style={globalStyles.listItemSubtitle}>
            Data zakończenia:{' '}
            {new Date(item.summary.end_time).toLocaleString('pl-PL', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        )}
        <Text style={globalStyles.listItemSubtitle}>Dystans: {(item.summary.distance / 1000).toFixed(2)} km</Text>
        {expandedTripId === item.summary.trip_id && (
          <View style={{ marginTop: 16 }}>
            <Text style={globalStyles.listItemText}>Czas: {(item.summary.duration / 3600).toFixed(2)} h</Text>
            <Text style={globalStyles.listItemText}>Średnia prędkość: {computeAverageSpeed(item).toFixed(2)} km/h</Text>
            <View style={{ height: 200, marginTop: 16 }}>
              <MapView
                provider={PROVIDER_GOOGLE}
                style={{ flex: 1 }}
                initialRegion={{
                  latitude: item.points[0].latitude,
                  longitude: item.points[0].longitude,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
              >
                <Polyline coordinates={item.points} strokeColor={globalStyles.colors.primary} strokeWidth={3} />
              </MapView>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={[globalStyles.background, globalStyles.centeredContainer]}>
        <ActivityIndicator size="large" color={globalStyles.colors.primary} />
        <Text style={[globalStyles.text, { marginTop: 16 }]}>Ładowanie tras...</Text>
      </View>
    );
  }

  if (trips.length === 0) {
    return (
      <View style={[globalStyles.background, globalStyles.centeredContainer]}>
        <Text style={globalStyles.subtitle}>
          Hej, nie masz jeszcze żadnych tras! Może czas rozpocząć jakąś aktywność?
        </Text>
        <TouchableOpacity style={globalStyles.button} onPress={() => navigation.navigate('Nowa aktywność')}>
          <Text style={globalStyles.buttonText}>Przejdź do aktywności</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={globalStyles.background}>
        <FlatList
          data={trips}
          renderItem={renderTripItem}
          keyExtractor={item => item.summary.session_id}
          showsVerticalScrollIndicator={true}
          ListHeaderComponent={
            <View style={globalStyles.container}>
              <Text style={globalStyles.title}>Moje trasy</Text>
            </View>
          }
          contentContainerStyle={globalStyles.listContainer}
        />
      </View>
    </SafeAreaView>
  );
}
