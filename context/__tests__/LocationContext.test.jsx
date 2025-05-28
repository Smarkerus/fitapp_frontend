import { render, act } from '@testing-library/react-native';
import axios from 'axios';
import { LocationProvider, LocationContext } from '../LocationContext';
import { AuthContext } from '../AuthContext';
import { useContext } from 'react';

jest.mock('axios');
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      backendUrl: 'http://mock-backend-url/',
    },
  },
}));

const TestComponent = ({ setContextValue }) => {
  const context = useContext(LocationContext);
  setContextValue(context);
  return null;
};

describe('LocationProvider', () => {
  const mockUser = {
    token: 'mock-token',
    id: 'mock-user-id',
    email: 'test@example.com',
    name: 'Test',
    last_name: 'User',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('poprawnie przesyła punkty GPS', async () => {
    const mockGpsPoints = [
      { latitude: 52.2297, longitude: 21.0122, timestamp: '2025-05-28T10:00:00Z' },
      { latitude: 52.2298, longitude: 21.0123, timestamp: '2025-05-28T10:00:01Z' },
    ];

    axios.post.mockResolvedValueOnce({ status: 200 });

    const mockAuthContext = { user: mockUser };

    let contextValue;
    const setContextValue = value => {
      contextValue = value;
    };

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <LocationProvider>
          <TestComponent setContextValue={setContextValue} />
        </LocationProvider>
      </AuthContext.Provider>
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(contextValue).toBeDefined();
    expect(contextValue.uploadGpsPoints).toBeDefined();

    let uploadResult;
    await act(async () => {
      uploadResult = await contextValue.uploadGpsPoints(mockGpsPoints);
    });

    expect(axios.post).toHaveBeenCalledWith('http://mock-backend-url/gps/', mockGpsPoints, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mockUser.token}`,
      },
    });

    expect(uploadResult).toBe(true);
  });

  test('obsługuje błąd podczas przesyłania punktów GPS', async () => {
    const mockGpsPoints = [{ latitude: 52.2297, longitude: 21.0122, timestamp: '2025-05-28T10:00:00Z' }];

    const mockError = new Error('Błąd przesyłania punktów GPS');
    axios.post.mockRejectedValueOnce(mockError);

    const mockAuthContext = { user: mockUser };

    let contextValue;
    const setContextValue = value => {
      contextValue = value;
    };

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <LocationProvider>
          <TestComponent setContextValue={setContextValue} />
        </LocationProvider>
      </AuthContext.Provider>
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(contextValue).toBeDefined();
    expect(contextValue.uploadGpsPoints).toBeDefined();

    let errorThrown;
    await act(async () => {
      try {
        await contextValue.uploadGpsPoints(mockGpsPoints);
      } catch (error) {
        errorThrown = error;
      }
    });

    expect(axios.post).toHaveBeenCalledWith('http://mock-backend-url/gps/', mockGpsPoints, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${mockUser.token}`,
      },
    });

    expect(errorThrown).toEqual(mockError);
  });
});
