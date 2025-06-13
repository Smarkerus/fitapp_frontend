import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { globalStyles } from '../styles';
import { AuthContext } from '../context/AuthContext';
import { ApiContext } from '../context/ApiContext';
import { LocationContext } from '../context/LocationContext';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

const MyActivity = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const { activityTypes } = useContext(ApiContext);
  const { uploadGpsPoints } = useContext(LocationContext);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isActive, setIsActive] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [gpsPoints, setGpsPoints] = useState([]);
  const [locationSubscription, setLocationSubscription] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const generateSessionId = () => {
    const timestamp = Number(Date.now());
    return `${timestamp}_${user.id}`;
  };

  const requestLocationPermissions = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Toast.show({
        type: 'error',
        text1: 'Błąd',
        text2: 'Brak uprawnień do lokalizacji',
      });
      return false;
    }
    return true;
  };

  const saveGpsPoint = async point => {
    try {
      const storedPoints = await AsyncStorage.getItem('gpsPoints');
      const points = storedPoints ? JSON.parse(storedPoints) : [];
      points.push(point);
      await AsyncStorage.setItem('gpsPoints', JSON.stringify(points));
      attemptUpload(points);
    } catch (error) {
      console.error('Błąd zapisu punktu GPS:', error);
    }
  };

  const resetGpsPointsStorage = async () => {
    try {
      await AsyncStorage.removeItem('gpsPoints');
      console.log('Pamięć gpsPoints została zresetowana.');
    } catch (error) {
      console.error('Błąd podczas resetowania pamięci gpsPoints:', error);
    }
  };

  const attemptUpload = async points => {
    try {
      const success = await uploadGpsPoints(points);
      if (success) {
        await AsyncStorage.removeItem('gpsPoints');
        setGpsPoints([]);
      }
    } catch (error) {
      console.warn('Upload nie powiódł się, punkty pozostają w pamięci:', error);
    }
  };

  const startTracking = async (sessionId, activityType) => {
    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 3000,
        distanceInterval: 10,
      },
      location => {
        const point = {
          session_id: sessionId,
          timestamp: new Date().toISOString(),
          user_id: user.id,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          acceleration: 0,
          activity: activityTypes[activityType].apiValue,
          last_entry: false,
        };
        setGpsPoints(prev => [...prev, point]);
        saveGpsPoint(point);
      }
    );
    setLocationSubscription(subscription);
  };

  const handleStartActivity = async activityType => {
    if (!(await requestLocationPermissions())) return;
    setSelectedActivity(activityType);
    const newSessionId = generateSessionId();
    setSessionId(newSessionId);
    setIsActive(true);
    setStartTime(Date.now());
    console.log('Start: aktywności ', activityType, 'wartość z API: ', activityTypes[activityType].apiValue);
    await startTracking(newSessionId, activityType);
  };

  const handleEndActivity = async () => {
    if (gpsPoints.length > 0) {
      const lastPoint = { ...gpsPoints[gpsPoints.length - 1], last_entry: true };
      await saveGpsPoint(lastPoint);
    } else {
      try {
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const point = {
          session_id: sessionId,
          timestamp: new Date().toISOString(),
          user_id: user.id,
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          acceleration: 0,
          activity: activityTypes[selectedActivity].apiValue,
          last_entry: true,
        };
        await saveGpsPoint(point);
      } catch (error) {
        console.error('Błąd pobierania lokalizacji:', error);
      }
    }
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
    setIsActive(false);
    setSessionId(null);
    setSelectedActivity(null);
    setStartTime(null);
    setElapsedTime(0);
  };

  useEffect(() => {
    let interval;
    if (isActive && startTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTime) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, startTime]);

  const formatTime = seconds => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  };

  const getActivityIcon = activityValue => {
    const activityIcon = activityTypes[activityValue].icon;
    return activityIcon ? activityIcon : 'more-horiz';
  };

  return (
    <SafeAreaView style={globalStyles.background} edges={['right', 'bottom', 'left']}>
      <View style={globalStyles.container}>
        {!isActive && <Text style={globalStyles.title}>Rozpocznij nową aktywność</Text>}
        {!isActive ? (
          <View style={styles.activityList}>
            {Object.keys(activityTypes).map(key => (
              <TouchableOpacity
                key={key}
                style={[globalStyles.button, styles.activityButton]}
                onPress={() => handleStartActivity(key)}
              >
                <Icon name={activityTypes[key].icon} size={24} color={globalStyles.colors.white} style={styles.icon} />
                <Text style={globalStyles.buttonText}>{activityTypes[key].label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={resetGpsPointsStorage} style={globalStyles.button}>
              <Text style={globalStyles.buttonText}>Resetuj pamięć GPS</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={globalStyles.centeredContainer}>
            <View style={styles.activeActivityContainer}>
              <Icon name={getActivityIcon(selectedActivity)} size={48} color={globalStyles.colors.primary} />
              <Text style={styles.subtitle}>{activityTypes[selectedActivity]?.label}</Text>
              <Text style={styles.timer}>{formatTime(elapsedTime)}</Text>
            </View>
            <TouchableOpacity style={[globalStyles.button, styles.stopButton]} onPress={handleEndActivity}>
              <Text style={globalStyles.buttonText}>Zakończ aktywność</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = {
  activityList: {
    flex: 1,
    justifyContent: 'center',
  },
  activityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: globalStyles.spacing.medium,
  },
  icon: {
    marginRight: globalStyles.spacing.small,
  },
  activeActivityContainer: {
    alignItems: 'center',
    marginBottom: globalStyles.spacing.large,
  },
  timer: {
    fontSize: globalStyles.sizes.xLarge,
    fontWeight: 'bold',
    color: globalStyles.colors.text,
    marginTop: globalStyles.spacing.medium,
  },
  stopButton: {
    backgroundColor: globalStyles.colors.error,
    marginTop: globalStyles.spacing.large,
  },
};

export default MyActivity;
