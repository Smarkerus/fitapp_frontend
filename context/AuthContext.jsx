import React, { createContext, useState, useEffect, use } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';
import messaging from '@react-native-firebase/messaging';

export const AuthContext = createContext();

// TODO: Zmienić na adres backendu w chmurze, na razie localhost
// const BACKEND_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000/' : 'http://localhost:8000/';
const BACKEND_URL = Platform.OS === 'android' ? 'http://192.168.10.212:8000/' : 'http://localhost:8000/';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [activityTypes, setActivityTypes] = useState({});
  const [activityTypesLoaded, setActivityTypesLoaded] = useState(false);
  const [reminder, setReminder] = useState(null);
  const [fcmToken, setFcmToken] = useState(null);

  const mappedActivityTypes = {
    RUNNING: { label: 'Bieganie', value: 'RUNNING', icon: 'directions-run' },
    CYCLING: { label: 'Jazda na rowerze', value: 'CYCLING', icon: 'directions-bike' },
    WALKING: { label: 'Chodzenie', value: 'WALKING', icon: 'directions-walk' },
    CLIMBING: { label: 'Wspinaczka', value: 'CLIMBING', icon: 'terrain' },
    DIVING: { label: 'Nurkowanie', value: 'DIVING', icon: 'pool' },
    SWIMMING: { label: 'Pływanie', value: 'SWIMMING', icon: 'pool' },
    OTHER: { label: 'Inne', value: 'OTHER', icon: 'more-horiz' },
  };

  async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
  }

  const getToken = async () => {
    const token = await messaging().getToken();
    console.log('FCM Token:', token);
    if (Platform.OS === 'android') {
      await messaging().setAutoInitEnabled(true);
    }
    if (Platform.OS === 'ios') {
      await messaging().setAutoInitEnabled(true);
    }
    return token;
  };

  const ensureFcmToken = async () => {
    await requestUserPermission();
    const token = await getToken();
    setFcmToken(token);
  };

  useEffect(() => {
    if (fcmToken) {
      uploadFcmToken();
    }
  }, [fcmToken]);

  const loadActivityTypes = async () => {
    try {
      const types = await fetchActivityTypes();
      setActivityTypes(types);
      setActivityTypesLoaded(true);

      const updatedMappedActivityTypes = {};
      for (const key in mappedActivityTypes) {
        updatedMappedActivityTypes[key] = {
          ...mappedActivityTypes[key],
          apiValue: types[key],
        };
      }
      setActivityTypes(updatedMappedActivityTypes);
      console.log('Zaktualizowane typy aktywności: ', updatedMappedActivityTypes);
    } catch (error) {
      console.error('Nie udało się pobrać typów aktywności:', error);
    }
  };

  useEffect(() => {
    if (user && !activityTypesLoaded) {
      loadActivityTypes();
    }
  }, [user]);

  const loadUser = async () => {
    let token;
    if (Platform.OS === 'web') {
      token = await AsyncStorage.getItem('userToken');
    } else {
      token = await SecureStore.getItemAsync('userToken');
    }
    if (token) {
      try {
        let userData = await fetchUserData(token);
        setUser({ token: token, ...userData });
        await ensureFcmToken();
        console.log('Udało się wczytać token:', token, user);
      } catch (error) {
        await logout();
      }
    } else {
      setUser(null);
    }
  };

  const fetchUserData = async token => {
    try {
      const response = await axios.get(`${BACKEND_URL}users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Pobrano info o użytkowniku: ', response.data);
      return response.data;
    } catch (error) {
      console.error('Bład pobierania info o użytkowniku:', error);
      throw error;
    }
  };

  const login = async (username, password) => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await axios.post(`${BACKEND_URL}users/login`, formData.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const access_token = response.data.access_token;

      if (Platform.OS === 'web') {
        await AsyncStorage.setItem('userToken', access_token);
      } else {
        await SecureStore.setItemAsync('userToken', access_token);
      }

      const userData = await fetchUserData(access_token);
      setUser({ token: access_token, ...userData });
      if (Platform.OS !== 'web') {
        await ensureFcmToken();
      }
    } catch (error) {
      console.error('Bład logowania:', error);
      throw error;
    }
  };

  const logout = async () => {
    setUser(null);
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem('userToken');
    } else {
      await SecureStore.deleteItemAsync('userToken');
    }
    try {
      const response = await axios.post(`${BACKEND_URL}users/logout`);
      console.log('Użytkownik wylogowany pomyślnie.');
    } catch (error) {
      console.error('Bład wylogowywania:', error);
      throw error;
    }
  };

  const register = async (email, password, name, last_name) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}users/register`,
        {
          email: email,
          password: password,
          name: name,
          last_name: last_name,
          weight: null,
          height: null,
          age: null,
          gender: null,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            accept: 'application/json',
          },
        }
      );
    } catch (error) {
      console.error('Bład rejestracji użytkownika:', error);
      throw error;
    }
  };

  const editUserDetails = async (weight, height, age, gender) => {
    try {
      const response = await axios.put(
        `${BACKEND_URL}users/me/details`,
        {
          id: user.id,
          user_id: user.id,
          weight: weight,
          height: height,
          age: age,
          gender: gender,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      console.log('Dane użytkownika zaktualizowane pomyślnie:', response.data);
      await loadUser();
      return response.data;
    } catch (error) {
      console.error('Bład edytowania danych użytkownika:', error);
      throw error;
    }
  };

  const fetchUserStatistics = async (start_time, end_time) => {
    try {
      console.log('Pobieranie statystyk użytkownika...', {
        user_id: user.id,
        start_time: start_time,
        end_time: end_time,
      });
      const response = await axios.post(
        `${BACKEND_URL}statistics/statistics`,
        {
          user_id: user.id,
          start_time: start_time,
          end_time: end_time,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      console.log('Pobrano statystyki użytkownika: ', response.data);
      return response.data;
    } catch (error) {
      console.error('Błąd pobierania statystyk użytkownika:', error);
      throw error;
    }
  };

  const fetchUserTrips = async () => {
    try {
      const tripsListResponse = await axios.get(`${BACKEND_URL}trips/trips_list`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      console.log('Pobrano info o trasach użytkownika: ', tripsListResponse.data);

      // const tripIds = tripsListResponse.data.map(trip => trip.session_id);
      const tripIds = tripsListResponse.data.map(trip => trip);

      const tripDetailsPromises = tripIds.map(tripId => fetchUserTripsDetails(tripId));
      const tripDetails = await Promise.all(tripDetailsPromises);

      console.log('Pobrano szczegóły wszystkich tras użytkownika: ', tripDetails);
      return tripDetails;
    } catch (error) {
      console.error('Błąd pobierania danych o trasach użytkownika:', error);
      throw error;
    }
  };

  const fetchUserTripsDetails = async tripId => {
    try {
      const response = await axios.get(`${BACKEND_URL}trips/trips/${tripId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      console.log('Pobrano szczegóły trasy: ', response.data);
      return response.data;
    } catch (error) {
      console.error('Bład pobierania szczegółów trasy:', error);
      throw error;
    }
  };

  const uploadGpsPoints = async points => {
    try {
      console.log('Punkty GPS do przesłania:', points);
      const response = await axios.post(`${BACKEND_URL}gps/`, points, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      });
      console.log('Punkty GPS zostały przesłane pomyślnie:', response.data);
      return true;
    } catch (error) {
      console.error('Błąd przesyłania punktów GPS:', error);
      throw error;
    }
  };

  const fetchActivityTypes = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}trips/activity_types/`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      console.log('Pobrano typy aktywności: ', response.data);
      return response.data;
    } catch (error) {
      console.error('Błąd pobierania typów aktywności:', error);
      throw error;
    }
  };

  const fetchReminder = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}reminders/reminders/`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      console.log('Pobrano przypominajkę: ', response.data);
      setReminder(response.data);
      return response.data;
    } catch (error) {
      console.error('Błąd pobierania przypomninajki:', error);
      throw error;
    }
  };

  const createReminder = async (min_calories, min_distance, min_time) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}reminders/reminders/`,
        {
          id: user.id,
          user_id: user.id,
          min_calories: min_calories,
          min_distance: min_distance,
          min_time: min_time,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      console.log('Utworzono przypominajkę: ', response.data);
      setReminder(response.data);
      return response.data;
    } catch (error) {
      console.error('Błąd tworzenia przypominajki:', error);
      throw error;
    }
  };

  const editReminder = async (min_calories, min_distance, min_time) => {
    try {
      const response = await axios.put(
        `${BACKEND_URL}reminders/reminders/`,
        {
          id: user.id,
          user_id: user.id,
          min_calories: min_calories,
          min_distance: min_distance,
          min_time: min_time,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      console.log('Zaktualizowano przypominajkę: ', response.data);
      setReminder(response.data);
      return response.data;
    } catch (error) {
      console.error('Błąd aktualizacji przypominajki:', error);
      throw error;
    }
  };

  const deleteReminder = async () => {
    try {
      const response = await axios.delete(`${BACKEND_URL}reminders/reminders/`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      console.log('Usunięto przypominajkę: ', response.data);
      return response.data;
    } catch (error) {
      console.error('Błąd usuwania przypominajki:', error);
      throw error;
    }
  };

  const uploadFcmToken = async () => {
    if (!fcmToken || typeof fcmToken !== 'string' || fcmToken.trim() === '') {
      throw new Error('Nieprawidłowy token FCM');
    }

    try {
      console.log('Wysyłanie tokena powiadomień:', fcmToken, typeof fcmToken, fcmToken.length);
      const response = await axios.post(
        `${BACKEND_URL}users/fcm-push-token?fcm_push_token=${encodeURIComponent(fcmToken)}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      console.log('Zaktualizowano token powiadomień:', fcmToken, response.data);
    } catch (error) {
      console.error(
        'Błąd aktualizacji tokena powiadomień:',
        error.response?.status,
        error.response?.data,
        error.message
      );
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        activityTypes,
        user,
        reminder,
        login,
        logout,
        register,
        editUserDetails,
        loadUser,
        fetchUserTrips,
        fetchUserStatistics,
        fetchReminder,
        createReminder,
        editReminder,
        deleteReminder,
        uploadGpsPoints,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
