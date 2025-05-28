import { render, act, waitFor } from '@testing-library/react-native';
import axios from 'axios';
import messaging from '@react-native-firebase/messaging';
import { NotificationProvider, NotificationContext } from '../NotificationContext';
import { AuthContext } from '../AuthContext';
import React from 'react';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn().mockResolvedValue('mock-token'),
  setItemAsync: jest.fn().mockResolvedValue(undefined),
  deleteItemAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@react-native-firebase/messaging', () => {
  const mockInstance = {
    requestPermission: jest.fn().mockResolvedValue(1),
    getToken: jest.fn().mockResolvedValue('mock-fcm-token'),
    setAutoInitEnabled: jest.fn().mockResolvedValue(undefined),
  };
  const mockModule = jest.fn(() => mockInstance);
  mockModule.AuthorizationStatus = {
    AUTHORIZED: 1,
    PROVISIONAL: 2,
  };
  return mockModule;
});

jest.mock('axios');
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      backendUrl: 'http://mock-backend-url/',
    },
  },
}));
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

const TestComponent = ({ setContextValue }) => {
  const context = React.useContext(NotificationContext);
  setContextValue(context);
  return null;
};

describe('NotificationProvider', () => {
  const mockUser = {
    token: 'mock-token',
    id: 'mock-user-id',
    email: 'test@example.com',
    name: 'Test',
    last_name: 'User',
  };

  const mockReminder = {
    id: 'mock-reminder-id',
    user_id: 'mock-user-id',
    min_calories: 500,
    min_distance: 5,
    min_time: 30,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('poprawnie pobiera przypomnienie', async () => {
    axios.get.mockResolvedValueOnce({ data: mockReminder });
    const mockAuthContext = { user: mockUser };
    let contextValue;
    const setContextValue = value => {
      contextValue = value;
    };

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <NotificationProvider>
          <TestComponent setContextValue={setContextValue} />
        </NotificationProvider>
      </AuthContext.Provider>
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    let result;
    await act(async () => {
      result = await contextValue.fetchReminder();
    });

    expect(axios.get).toHaveBeenCalledWith('http://mock-backend-url/reminders/reminders/', {
      headers: { Authorization: `Bearer ${mockUser.token}` },
    });
    expect(result).toEqual(mockReminder);
    expect(contextValue.reminder).toEqual(mockReminder);
  });

  test('poprawnie tworzy przypomnienie', async () => {
    axios.post.mockImplementation(url => {
      if (url.includes('fcm-push-token')) {
        return Promise.resolve({ status: 200 });
      } else if (url.includes('reminders')) {
        return Promise.resolve({ data: mockReminder });
      }
    });
    const mockAuthContext = { user: mockUser };
    let contextValue;
    const setContextValue = value => {
      contextValue = value;
    };

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <NotificationProvider>
          <TestComponent setContextValue={setContextValue} />
        </NotificationProvider>
      </AuthContext.Provider>
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    let result;
    await act(async () => {
      result = await contextValue.createReminder(500, 5, 30);
    });

    expect(axios.post).toHaveBeenCalledWith(
      'http://mock-backend-url/reminders/reminders/',
      {
        id: mockUser.id,
        user_id: mockUser.id,
        min_calories: 500,
        min_distance: 5,
        min_time: 30,
      },
      { headers: { Authorization: `Bearer ${mockUser.token}` } }
    );
    expect(result).toEqual(mockReminder);
    expect(contextValue.reminder).toEqual(mockReminder);
  });

  test('poprawnie edytuje przypomnienie', async () => {
    const updatedReminder = { ...mockReminder, min_calories: 600, min_distance: 10, min_time: 45 };
    axios.put.mockResolvedValueOnce({ data: updatedReminder });
    const mockAuthContext = { user: mockUser };
    let contextValue;
    const setContextValue = value => {
      contextValue = value;
    };

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <NotificationProvider>
          <TestComponent setContextValue={setContextValue} />
        </NotificationProvider>
      </AuthContext.Provider>
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    let result;
    await act(async () => {
      result = await contextValue.editReminder(600, 10, 45);
    });

    expect(axios.put).toHaveBeenCalledWith(
      'http://mock-backend-url/reminders/reminders/',
      {
        id: mockUser.id,
        user_id: mockUser.id,
        min_calories: 600,
        min_distance: 10,
        min_time: 45,
      },
      { headers: { Authorization: `Bearer ${mockUser.token}` } }
    );
    expect(result).toEqual(updatedReminder);
    expect(contextValue.reminder).toEqual(updatedReminder);
  });

  test('poprawnie usuwa przypomnienie', async () => {
    axios.delete.mockResolvedValueOnce({});
    const mockAuthContext = { user: mockUser };
    let contextValue;
    const setContextValue = value => {
      contextValue = value;
    };

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <NotificationProvider>
          <TestComponent setContextValue={setContextValue} />
        </NotificationProvider>
      </AuthContext.Provider>
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    await act(async () => {
      await contextValue.deleteReminder();
    });

    expect(axios.delete).toHaveBeenCalledWith('http://mock-backend-url/reminders/reminders/', {
      headers: { Authorization: `Bearer ${mockUser.token}` },
    });
    expect(contextValue.reminder).toBeNull();
  });

  test('poprawnie obsługuje błąd w fetchReminder', async () => {
    const mockError = new Error('Błąd pobierania przypomnienia');
    axios.get.mockRejectedValueOnce(mockError);
    const mockAuthContext = { user: mockUser };
    let contextValue;
    const setContextValue = value => {
      contextValue = value;
    };

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <NotificationProvider>
          <TestComponent setContextValue={setContextValue} />
        </NotificationProvider>
      </AuthContext.Provider>
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    let errorThrown;
    await act(async () => {
      try {
        await contextValue.fetchReminder();
      } catch (error) {
        errorThrown = error;
      }
    });

    expect(axios.get).toHaveBeenCalledWith('http://mock-backend-url/reminders/reminders/', {
      headers: { Authorization: `Bearer ${mockUser.token}` },
    });
    expect(errorThrown).toEqual(mockError);
  });

  test('poprawnie ustawia i przesyła fcmToken', async () => {
    axios.post.mockImplementation(url => {
      if (url.includes('fcm-push-token')) {
        return Promise.resolve({ status: 200 });
      }
    });
    const mockAuthContext = { user: mockUser };
    let contextValue;
    const setContextValue = value => {
      contextValue = value;
    };

    render(
      <AuthContext.Provider value={mockAuthContext}>
        <NotificationProvider>
          <TestComponent setContextValue={setContextValue} />
        </NotificationProvider>
      </AuthContext.Provider>
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    await waitFor(() => {
      expect(messaging().requestPermission).toHaveBeenCalled();
      expect(messaging().getToken).toHaveBeenCalled();
      expect(messaging().setAutoInitEnabled).toHaveBeenCalledWith(true);
      expect(axios.post).toHaveBeenCalledWith(
        'http://mock-backend-url/users/fcm-push-token?fcm_push_token=mock-fcm-token',
        null,
        {
          headers: {
            Authorization: `Bearer ${mockUser.token}`,
            'Content-Type': 'application/json',
          },
        }
      );
    });
  });
});
