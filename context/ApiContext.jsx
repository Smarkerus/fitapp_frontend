import { createContext, useContext, useCallback, useState, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import Constants from 'expo-constants';

export const ApiContext = createContext();

const BACKEND_URL = Constants.expoConfig.extra.backendUrl;

const mappedActivityTypes = {
  RUNNING: { label: 'Bieganie', value: 'RUNNING', icon: 'directions-run' },
  CYCLING: { label: 'Jazda na rowerze', value: 'CYCLING', icon: 'directions-bike' },
  WALKING: { label: 'Chodzenie', value: 'WALKING', icon: 'directions-walk' },
  CLIMBING: { label: 'Wspinaczka', value: 'CLIMBING', icon: 'terrain' },
  DIVING: { label: 'Nurkowanie', value: 'DIVING', icon: 'pool' },
  SWIMMING: { label: 'Pływanie', value: 'SWIMMING', icon: 'pool' },
  OTHER: { label: 'Inne', value: 'OTHER', icon: 'more-horiz' },
};

export const ApiProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [activityTypes, setActivityTypes] = useState({});

  const fetchActivityTypes = useCallback(async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}trips/activity_types/`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const apiActivityTypes = response.data;

      const integratedTypes = {};
      for (const [key, value] of Object.entries(apiActivityTypes)) {
        if (mappedActivityTypes[key]) {
          integratedTypes[key] = {
            ...mappedActivityTypes[key],
            apiValue: value,
          };
        }
      }
      setActivityTypes(integratedTypes);
      return integratedTypes;
    } catch (error) {
      throw error;
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchActivityTypes();
    }
  }, [user, fetchActivityTypes]);

  const fetchUserStatistics = useCallback(
    async (start_time, end_time) => {
      try {
        const response = await axios.post(
          `${BACKEND_URL}statistics/statistics`,
          {
            user_id: user.id,
            start_time,
            end_time,
          },
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    [user]
  );

  const fetchUserTrips = useCallback(async () => {
    try {
      const tripsListResponse = await axios.get(`${BACKEND_URL}trips/trips_list`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const tripIds = tripsListResponse.data.map(trip => trip);
      const tripDetailsPromises = tripIds.map(tripId => fetchUserTripsDetails(tripId));
      return await Promise.all(tripDetailsPromises);
    } catch (error) {
      throw error;
    }
  }, [user]);

  const fetchUserTripsDetails = useCallback(
    async tripId => {
      try {
        const response = await axios.get(`${BACKEND_URL}trips/trips/${tripId}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        return response.data;
      } catch (error) {
        throw error;
      }
    },
    [user]
  );

  return (
    <ApiContext.Provider
      value={{
        fetchUserStatistics,
        fetchActivityTypes,
        fetchUserTrips,
        fetchUserTripsDetails,
        activityTypes,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};
