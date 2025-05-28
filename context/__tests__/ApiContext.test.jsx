import { render, waitFor } from '@testing-library/react-native';
import { useContext, useEffect } from 'react';
import axios from 'axios';
import { ApiProvider, ApiContext } from '../ApiContext';
import { AuthContext } from '../AuthContext';

jest.mock('axios');
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      backendUrl: 'http://mock-backend-url/',
    },
  },
}));

const mockUser = {
  token: 'mock-token',
  id: 'mock-user-id',
};

const TestComponent = ({ setContextValue }) => {
  const apiContext = useContext(ApiContext);
  useEffect(() => {
    setContextValue(apiContext);
  }, [apiContext]);
  return null;
};

describe('ApiProvider', () => {
  beforeEach(() => {
    axios.get.mockClear();
    axios.post.mockClear();
  });

  test('poprawnie pobiera typy aktywności', async () => {
    axios.get.mockImplementation(url => {
      if (url === 'http://mock-backend-url/trips/activity_types/') {
        return Promise.resolve({
          data: {
            RUNNING: 'running',
            CYCLING: 'cycling',
            WALKING: 'walking',
          },
        });
      }
      return Promise.reject(new Error('not found'));
    });

    let contextValue;
    const setContextValue = value => {
      contextValue = value;
    };

    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <ApiProvider>
          <TestComponent setContextValue={setContextValue} />
        </ApiProvider>
      </AuthContext.Provider>
    );

    await waitFor(() => expect(contextValue.activityTypes).toBeDefined());

    expect(contextValue.activityTypes).toEqual({
      RUNNING: { label: 'Bieganie', value: 'RUNNING', icon: 'directions-run', apiValue: 'running' },
      CYCLING: { label: 'Jazda na rowerze', value: 'CYCLING', icon: 'directions-bike', apiValue: 'cycling' },
      WALKING: { label: 'Chodzenie', value: 'WALKING', icon: 'directions-walk', apiValue: 'walking' },
    });
  });

  test('poprawnie pobiera statystyki użytkownika', async () => {
    const mockStats = { total_distance: 100, total_time: 3600 };
    axios.post.mockImplementation((url, data, config) => {
      if (
        url === 'http://mock-backend-url/statistics/statistics' &&
        data.user_id === mockUser.id &&
        data.start_time === 'start_time' &&
        data.end_time === 'end_time' &&
        config.headers.Authorization === `Bearer ${mockUser.token}`
      ) {
        return Promise.resolve({ data: mockStats });
      }
      return Promise.reject(new Error('invalid call'));
    });

    axios.get.mockImplementation(url => {
      if (url === 'http://mock-backend-url/trips/activity_types/') {
        return Promise.resolve({
          data: {
            RUNNING: 'running',
            CYCLING: 'cycling',
            WALKING: 'walking',
          },
        });
      }
      return Promise.reject(new Error('not found'));
    });

    let contextValue;
    const setContextValue = value => {
      contextValue = value;
    };

    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <ApiProvider>
          <TestComponent setContextValue={setContextValue} />
        </ApiProvider>
      </AuthContext.Provider>
    );

    await waitFor(() => expect(contextValue.activityTypes).toBeDefined());

    const { fetchUserStatistics } = contextValue;
    const stats = await fetchUserStatistics('start_time', 'end_time');
    expect(stats).toEqual(mockStats);
  });

  test('poprawnie pobiera listę podróży użytkownika', async () => {
    axios.get.mockImplementation(url => {
      if (url === 'http://mock-backend-url/trips/activity_types/') {
        return Promise.resolve({
          data: {
            RUNNING: 'running',
            CYCLING: 'cycling',
            WALKING: 'walking',
          },
        });
      }
      if (url === 'http://mock-backend-url/trips/trips_list') {
        return Promise.resolve({ data: ['trip1', 'trip2'] });
      }
      if (url === 'http://mock-backend-url/trips/trips/trip1') {
        return Promise.resolve({ data: { id: 'trip1', name: 'Trip 1' } });
      }
      if (url === 'http://mock-backend-url/trips/trips/trip2') {
        return Promise.resolve({ data: { id: 'trip2', name: 'Trip 2' } });
      }
      return Promise.reject(new Error('not found'));
    });

    let contextValue;
    const setContextValue = value => {
      contextValue = value;
    };

    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <ApiProvider>
          <TestComponent setContextValue={setContextValue} />
        </ApiProvider>
      </AuthContext.Provider>
    );

    await waitFor(() => expect(contextValue.activityTypes).toBeDefined());

    const { fetchUserTrips } = contextValue;
    const trips = await fetchUserTrips();
    expect(trips).toEqual([
      { id: 'trip1', name: 'Trip 1' },
      { id: 'trip2', name: 'Trip 2' },
    ]);
  });

  test('poprawnie pobiera szczegóły podróży użytkownika', async () => {
    axios.get.mockImplementation(url => {
      if (url === 'http://mock-backend-url/trips/activity_types/') {
        return Promise.resolve({
          data: {
            RUNNING: 'running',
            CYCLING: 'cycling',
            WALKING: 'walking',
          },
        });
      }
      if (url === 'http://mock-backend-url/trips/trips/trip1') {
        return Promise.resolve({ data: { id: 'trip1', name: 'Trip 1' } });
      }
      return Promise.reject(new Error('not found'));
    });

    let contextValue;
    const setContextValue = value => {
      contextValue = value;
    };

    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <ApiProvider>
          <TestComponent setContextValue={setContextValue} />
        </ApiProvider>
      </AuthContext.Provider>
    );

    await waitFor(() => expect(contextValue.activityTypes).toBeDefined());

    const { fetchUserTripsDetails } = contextValue;
    const tripDetails = await fetchUserTripsDetails('trip1');
    expect(tripDetails).toEqual({ id: 'trip1', name: 'Trip 1' });
  });

  test('nie pobiera typów aktywności, gdy użytkownik jest wylogowany (null)', () => {
    render(
      <AuthContext.Provider value={{ user: null }}>
        <ApiProvider>
          <TestComponent setContextValue={() => {}} />
        </ApiProvider>
      </AuthContext.Provider>
    );
    expect(axios.get).not.toHaveBeenCalled();
  });
});
