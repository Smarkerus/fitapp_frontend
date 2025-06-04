import React, { createContext, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const AuthContext = createContext();

const BACKEND_URL = Constants.expoConfig.extra.backendUrl;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const loadUser = async () => {
    let token;
    token = await SecureStore.getItemAsync('userToken');
    if (token) {
      try {
        const userData = await fetchUserData(token);
        setUser({ token, ...userData });
      } catch (error) {
        console.error("Błąd podczas pobierania danych użytkownika:", error);
        await logout();
      }
    } else {
      setUser(null);
    }
  };

  const fetchUserData = async token => {
      const response = await axios.get(`${BACKEND_URL}users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
  };

  const login = async (username, password) => {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await axios.post(`${BACKEND_URL}users/login`, formData.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const access_token = response.data.access_token;

      if (Platform.OS === 'web') {
        await AsyncStorage.setItem('userToken', access_token);
      } else {
        await SecureStore.setItemAsync('userToken', access_token);
      }

      const userData = await fetchUserData(access_token);
      setUser({ token: access_token, ...userData });
  };

  const logout = async () => {
    setUser(null);
    try {
      await SecureStore.deleteItemAsync('userToken');
      await axios.post(`${BACKEND_URL}users/logout`);
    } catch (error) {
      console.error("Błąd podczas wylogowywania:", error);
      throw error;
    }
  };

  const register = async (email, password, name, last_name) => {
      await axios.post(
        `${BACKEND_URL}users/register`,
        {
          email,
          password,
          name,
          last_name,
          weight: null,
          height: null,
          age: null,
          gender: null,
        },
        {
          headers: { 'Content-Type': 'application/json', accept: 'application/json' },
        }
      );
  };

  const editUserDetails = async (weight, height, age, gender) => {
      const response = await axios.put(
        `${BACKEND_URL}users/me/details`,
        {
          id: user.id,
          user_id: user.id,
          weight,
          height,
          age,
          gender,
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      await loadUser();
      return response.data;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, editUserDetails, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};
