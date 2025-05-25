import React, { createContext, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import Constants from 'expo-constants';

export const LocationContext = createContext();

const BACKEND_URL = Constants.expoConfig.extra.backendUrl;

export const LocationProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

  const uploadGpsPoints = useCallback(
    async points => {
      try {
        await axios.post(`${BACKEND_URL}gps/`, points, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
        });
        console.log('Punkty GPS zostały pomyślnie przesłane.');
        return true;
      } catch (error) {
        throw error;
      }
    },
    [user]
  );

  return <LocationContext.Provider value={{ uploadGpsPoints }}>{children}</LocationContext.Provider>;
};
