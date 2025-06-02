import React, { createContext, useState, useEffect } from 'react';
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
    if (Platform.OS === 'web') {
      token = await AsyncStorage.getItem('userToken');
    } else {
      token = await SecureStore.getItemAsync('userToken');
    }
    if (token) {
      try {
        const userData = await fetchUserData(token);
        setUser({ token, ...userData });
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
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const login = async (username, password) => {
    try {
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
    } catch (error) {
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
      await axios.post(`${BACKEND_URL}users/logout`);
    } catch (error) {
      throw error;
    }
  };

  const register = async (email, password, name, last_name) => {
    try {
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
    } catch (error) {
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
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, editUserDetails, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
};
