import { render, waitFor, act } from '@testing-library/react-native';
import { useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthProvider, AuthContext } from '../AuthContext';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

jest.mock('axios');
jest.mock('expo-secure-store');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      backendUrl: 'http://mock-backend-url/',
    },
  },
}));

const mockUserData = {
  id: 'mock-user-id',
  email: 'test@example.com',
  name: 'Test',
  last_name: 'User',
};

const mockToken = 'mock-token';
const BACKEND_URL = 'http://mock-backend-url/';

const TestComponent = ({ setContextValue }) => {
  const authContext = useContext(AuthContext);
  useEffect(() => {
    setContextValue(authContext);
  }, [authContext]);
  return null;
};

describe('AuthProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('poprawnie ładuje użytkownika z tokenem (natywne)', async () => {
    Platform.OS = 'ios';
    SecureStore.getItemAsync.mockResolvedValue(mockToken);
    axios.get.mockResolvedValue({ data: mockUserData });

    let contextValue;
    const setContextValue = value => {
      contextValue = value;
    };

    render(
      <AuthProvider>
        <TestComponent setContextValue={setContextValue} />
      </AuthProvider>
    );

    await waitFor(() => expect(contextValue).toBeDefined());

    await act(async () => {
      await contextValue.loadUser();
    });

    expect(contextValue.user).toEqual({ token: mockToken, ...mockUserData });
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('userToken');
  });

  test('poprawnie loguje użytkownika', async () => {
    Platform.OS = 'ios';
    const mockLoginResponse = { data: { access_token: mockToken } };
    axios.post.mockResolvedValue(mockLoginResponse);
    axios.get.mockResolvedValue({ data: mockUserData });

    let contextValue;
    const setContextValue = value => {
      contextValue = value;
    };

    render(
      <AuthProvider>
        <TestComponent setContextValue={setContextValue} />
      </AuthProvider>
    );

    await waitFor(() => expect(contextValue).toBeDefined());

    await act(async () => {
      await contextValue.login('test@example.com', 'password');
    });

    expect(axios.post).toHaveBeenCalledWith(
      `${BACKEND_URL}users/login`,
      'username=test%40example.com&password=password',
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('userToken', mockToken);
    expect(contextValue.user).toEqual({ token: mockToken, ...mockUserData });
  });

  test('poprawnie wylogowuje użytkownika', async () => {
    Platform.OS = 'ios';
    SecureStore.getItemAsync.mockResolvedValue(mockToken);
    axios.get.mockResolvedValue({ data: mockUserData });
    axios.post.mockResolvedValue({});

    let contextValue;
    const setContextValue = value => {
      contextValue = value;
    };

    render(
      <AuthProvider>
        <TestComponent setContextValue={setContextValue} />
      </AuthProvider>
    );

    await waitFor(() => expect(contextValue).toBeDefined());

    await act(async () => {
      await contextValue.loadUser();
    });

    await waitFor(() => expect(contextValue.user).not.toBeNull());

    await act(async () => {
      await contextValue.logout();
    });

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('userToken');
    expect(axios.post).toHaveBeenCalledWith(`${BACKEND_URL}users/logout`);
    expect(contextValue.user).toBeNull();
  });

  test('poprawnie edytuje szczegóły użytkownika', async () => {
    Platform.OS = 'ios';

    const mockToken = 'mock-token';
    const mockUserData = {
      id: 'mock-user-id',
      email: 'test@example.com',
      name: 'Test',
      last_name: 'User',
    };
    const updatedUserData = {
      ...mockUserData,
      weight: 70,
      height: 180,
      age: 30,
      gender: 'male',
    };

    SecureStore.getItemAsync.mockResolvedValue(mockToken);

    axios.get
      .mockResolvedValueOnce({ data: mockUserData })
      .mockResolvedValueOnce({ data: updatedUserData })
      .mockResolvedValueOnce({ data: updatedUserData });

    axios.put.mockResolvedValueOnce({ data: updatedUserData });

    let contextValue;
    const setContextValue = value => {
      contextValue = value;
    };

    render(
      <AuthProvider>
        <TestComponent setContextValue={setContextValue} />
      </AuthProvider>
    );

    await waitFor(
      () => {
        expect(contextValue).toBeDefined();
      },
      { timeout: 2000 }
    );

    await act(async () => {
      await contextValue.loadUser();
    });

    await waitFor(
      () => {
        expect(contextValue.user).not.toBeNull();
      },
      { timeout: 2000 }
    );
    expect(contextValue.user).toEqual({ token: mockToken, ...mockUserData });

    await act(async () => {
      await contextValue.editUserDetails(70, 180, 30, 'male');
    });

    expect(axios.put).toHaveBeenCalledWith(
      'http://mock-backend-url/users/me/details',
      {
        id: 'mock-user-id',
        user_id: 'mock-user-id',
        weight: 70,
        height: 180,
        age: 30,
        gender: 'male',
      },
      { headers: { Authorization: 'Bearer mock-token' } }
    );

    expect(contextValue.user).toEqual({ token: mockToken, ...updatedUserData });
  });
});
