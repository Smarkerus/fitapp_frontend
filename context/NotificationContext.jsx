import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import messaging from '@react-native-firebase/messaging';
import { Platform } from 'react-native';
import { AuthContext } from './AuthContext';
import Constants from 'expo-constants';

export const NotificationContext = createContext();

const BACKEND_URL = Constants.expoConfig.extra.backendUrl;

export const NotificationProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [fcmToken, setFcmToken] = useState(null);
  const [reminder, setReminder] = useState(null);

  const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (enabled) {
      console.log('Przyznano uprawnienia do powiadomień FCM');
    }
  };

  const getToken = async () => {
    const token = await messaging().getToken();
    if (Platform.OS === 'android' || Platform.OS === 'ios') {
      await messaging().setAutoInitEnabled(true);
    }
    return token;
  };

  const ensureFcmToken = useCallback(async () => {
    await requestUserPermission();
    const token = await getToken();
    setFcmToken(token);
  }, []);

  useEffect(() => {
    if (user) {
      ensureFcmToken();
    }
  }, []);

  useEffect(() => {
    if (fcmToken && user) {
      uploadFcmToken();
    }
  }, []);

  const uploadFcmToken = useCallback(async () => {
    if (!fcmToken || typeof fcmToken !== 'string' || fcmToken.trim() === '') {
      throw new Error('Invalid FCM token');
    }
    try {
      await axios.post(`${BACKEND_URL}users/fcm-push-token?fcm_push_token=${encodeURIComponent(fcmToken)}`, null, {
        headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Błąd podczas przesyłania tokenu FCM:', error);
    }
  }, [fcmToken, user]);

  const fetchReminder = useCallback(async () => {
    const response = await axios.get(`${BACKEND_URL}reminders/reminders/`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    setReminder(response.data);
    return response.data;
  }, [user]);

  const createReminder = useCallback(
    async (min_calories, min_distance, min_time) => {
      const response = await axios.post(
        `${BACKEND_URL}reminders/reminders/`,
        {
          id: user.id,
          user_id: user.id,
          min_calories,
          min_distance,
          min_time,
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setReminder(response.data);
      return response.data;
    },
    [user]
  );

  const editReminder = useCallback(
    async (min_calories, min_distance, min_time) => {
      const response = await axios.put(
        `${BACKEND_URL}reminders/reminders/`,
        {
          id: user.id,
          user_id: user.id,
          min_calories,
          min_distance,
          min_time,
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      setReminder(response.data);
      return response.data;
    },
    [user]
  );

  const deleteReminder = useCallback(async () => {
    await axios.delete(`${BACKEND_URL}reminders/reminders/`, {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    setReminder(null);
  }, [user]);

  return (
    <NotificationContext.Provider value={{ reminder, fetchReminder, createReminder, editReminder, deleteReminder }}>
      {children}
    </NotificationContext.Provider>
  );
};
