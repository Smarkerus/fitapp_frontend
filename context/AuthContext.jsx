import React, { createContext, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';

export const AuthContext = createContext();

// TODO: Zmienić na adres backendu w chmurze, na razie localhost
const BACKEND_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000/' : 'http://localhost:8000/';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

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
        console.log('Udało się wczytać token:', token, userData, user);
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
    } catch (error) {
      console.error('Bład logowania:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const response = await axios.post(`${BACKEND_URL}users/logout`);
      if (response.status === 200) {
        if (Platform.OS === 'web') {
          await AsyncStorage.removeItem('userToken');
        } else {
          await SecureStore.deleteItemAsync('userToken');
        }
        setUser(null);
      }
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

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loadUser, fetchUserTrips, uploadGpsPoints }}>
      {children}
    </AuthContext.Provider>
  );
};
