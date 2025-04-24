import React, { useContext } from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { AuthContext } from "./context/AuthContext";

export default function Home({ navigation }) {
  const { user, logout } = useContext(AuthContext);

  const handleLogout = async () => {
    await logout();
    navigation.navigate("Login");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Witaj, {user.name || "Użytkowniku"}!</Text>
      <Button title="Wyloguj" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  welcome: { fontSize: 20, marginBottom: 20 },
});
