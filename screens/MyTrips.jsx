import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { globalStyles } from '../styles';
import React, { useContext, useState, useCallback } from 'react';
import { ApiContext } from '../context/ApiContext';
import MapView, { PROVIDER_GOOGLE, Polyline } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { FlatList } from 'react-native-gesture-handler';

export default function MyTrips({ navigation }) {
  const { fetchUserTrips } = useContext(ApiContext);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedTripId, setExpandedTripId] = useState(null);

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
    }, [])
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

  const getRegionForCoordinates = points => {
    let minLat = points[0].latitude;
    let maxLat = points[0].latitude;
    let minLon = points[0].longitude;
    let maxLon = points[0].longitude;

    points.forEach(point => {
      minLat = Math.min(minLat, point.latitude);
      maxLat = Math.max(maxLat, point.latitude);
      minLon = Math.min(minLon, point.longitude);
      maxLon = Math.max(maxLon, point.longitude);
    });

    const latitude = (minLat + maxLat) / 2;
    const longitude = (minLon + maxLon) / 2;
    const latitudeDelta = (maxLat - minLat) * 1.2;
    const longitudeDelta = (maxLon - minLon) * 1.2;

    return {
      latitude,
      longitude,
      latitudeDelta: latitudeDelta || 0.05,
      longitudeDelta: longitudeDelta || 0.05,
    };
  };

  const toggleTripDetails = tripId => {
    setExpandedTripId(prevId => (prevId === tripId ? null : tripId));
  };

  const renderTripItem = ({ item }) => {
    return (
      <View style={globalStyles.card}>
        <TouchableOpacity onPress={() => toggleTripDetails(item.summary.trip_id)}>
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
        </TouchableOpacity>
        {expandedTripId === item.summary.trip_id && (
          <Animated.View
            entering={FadeIn.duration(300)}
            exiting={FadeOut.duration(300)}
            style={styles.expandedContainer}
          >
            <Text style={globalStyles.listItemText}>Czas: {(item.summary.duration / 3600).toFixed(2)} h</Text>
            <Text style={globalStyles.listItemText}>Średnia prędkość: {computeAverageSpeed(item).toFixed(2)} km/h</Text>
            <Text style={globalStyles.listItemText}>
              Liczba spalonych kalorii: {Number(item.summary.calories_burned).toFixed(0)} kcal
            </Text>
            <View style={styles.mapContainer}>
              <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                region={getRegionForCoordinates(item.points)}
                scrollEnabled={false}
                zoomEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
              >
                <Polyline coordinates={item.points} strokeColor={globalStyles.colors.primary} strokeWidth={3} />
              </MapView>
            </View>
          </Animated.View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[globalStyles.background, globalStyles.centeredContainer]}>
        <ActivityIndicator size="large" color={globalStyles.colors.primary} />
        <Text style={[globalStyles.text, styles.loadingText]}>Ładowanie tras...</Text>
      </View>
    );
  }

  if (trips.length === 0) {
    return (
      <View style={[globalStyles.background, globalStyles.centeredContainer]}>
        <Text style={globalStyles.infoText}>
          Hej, nie masz jeszcze żadnych tras! Może czas rozpocząć jakąś aktywność?
        </Text>
        <TouchableOpacity style={globalStyles.button} onPress={() => navigation.navigate('Nowa aktywność')}>
          <Text style={globalStyles.buttonText}>Przejdź do aktywności</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={globalStyles.background} edges={['right', 'bottom', 'left']}>
      <View style={globalStyles.container}>
        <Text style={globalStyles.title}>Moje trasy</Text>
        <FlatList data={trips} renderItem={renderTripItem} keyExtractor={item => item.summary.session_id.toString()} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  expandedContainer: {
    marginTop: 16,
  },
  mapContainer: {
    height: 200,
    marginTop: 16,
  },
  map: {
    flex: 1,
  },
  loadingText: {
    marginTop: 16,
  },
});
