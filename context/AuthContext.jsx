import React, { createContext, useState } from "react";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Platform } from "react-native";

export const AuthContext = createContext();
const BACKEND_URL = "http://localhost:8000/";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadUser = async () => {
    let token;
    if (Platform.OS === "web") {
      token = await AsyncStorage.getItem("userToken");
    } else {
      token = await SecureStore.getItemAsync("userToken");
    }
    if (token) {
      try {
        let userData = await fetchUserData(token);
        setUser({ token: token, ...userData });
        console.log("Udało się wczytać token:", token, userData, user);
      } catch (error) {
        await logout();
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  const fetchUserData = async (token) => {
    try {
      const response = await axios.get(`${BACKEND_URL}users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Pobrano info o użytkowniku: ", response.data);
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const login = async (username, password) => {
    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const response = await axios.post(`${BACKEND_URL}users/login`, formData.toString(), {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const access_token = response.data.access_token;

      if (Platform.OS === "web") {
        await AsyncStorage.setItem("userToken", access_token);
      } else {
        await SecureStore.setItemAsync("userToken", access_token);
      }

      const userData = await fetchUserData(access_token);
      setUser({ token: access_token, ...userData });
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    if (Platform.OS === "web") {
      await AsyncStorage.removeItem("userToken");
    } else {
      await SecureStore.deleteItemAsync("userToken");
    }
    setUser(null);
  };

  const register = async (name, last_name, email, password) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}users/register`,
        {
          name,
          last_name,
          email,
          password,
        },
        {
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
        }
      );
      console.log("Rejestracja udana:", response.data);
    } catch (error) {
      console.error("Błąd rejestracji:", error.response?.data || error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading, loadUser }}>{children}</AuthContext.Provider>
  );
};
