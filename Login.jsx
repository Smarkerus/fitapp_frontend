import React, { useState, useContext } from "react";
import { View, TextInput, Button, TouchableOpacity, Text, StyleSheet } from "react-native";
import { AuthContext } from "./context/AuthContext";
import { globalStyles } from "./styles";

export default function Login({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    try {
      await login(username, password);
      navigation.navigate("Home");
    } catch (err) {
      setError("Nieprawidłowe dane logowania");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="Nazwa użytkownika" value={username} onChangeText={setUsername} style={styles.input} />
      <TextInput placeholder="Hasło" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={globalStyles.button} onPress={handleLogin}>
        <Text style={globalStyles.buttonText}>Zaloguj</Text>
      </TouchableOpacity>

      <TouchableOpacity style={globalStyles.button} onPress={() => navigation.navigate("")}>
        <Text style={globalStyles.buttonText}>Zarejestruj się</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 10 },
  error: { color: "red", marginBottom: 10 },
});
