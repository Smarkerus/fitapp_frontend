import React, { useContext, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { AuthContext } from "../context/AuthContext";
import { globalStyles } from "../styles";

export default function Home() {
  const { user, logout, loadUser } = useContext(AuthContext);

  useEffect(() => {
    const fetchUser = async () => {
      await loadUser();
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={globalStyles.container}>
      <Text style={globalStyles.welcome}>Witaj, {user?.name ?? "Użytkowniku"}!</Text>
      <TouchableOpacity style={globalStyles.button} onPress={handleLogout}>
        <Text style={globalStyles.buttonText}>Wyloguj</Text>
      </TouchableOpacity>
    </View>
  );
}
