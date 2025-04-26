import React, { useState, useContext } from "react";
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from "react-native";
import { AuthContext } from "../context/AuthContext";
import { globalStyles } from "../styles";

export default function Login({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useContext(AuthContext);

  const handleLogin = async () => {
    try {
      await login(username, password);
    } catch (err) {
      setError("Nieprawidłowe dane logowania");
    }
  };

  return (
    <View style={globalStyles.background}>
      <View style={globalStyles.container}>
        <Text style={globalStyles.title}>Podaj dane logowania</Text>
        <Text style={globalStyles.subtitle}>Email</Text>
        <TextInput
          placeholder="Nazwa użytkownika"
          value={username}
          onChangeText={setUsername}
          style={globalStyles.input}
          onSubmitEditing={handleLogin}
        />
        <Text style={globalStyles.subtitle}>Hasło</Text>
        <TextInput
          placeholder="Hasło"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={globalStyles.input}
          onSubmitEditing={handleLogin}
        />
        {error ? <Text style={globalStyles.errorText}>{error}</Text> : null}
        <TouchableOpacity style={globalStyles.button} onPress={handleLogin}>
          <Text style={globalStyles.buttonText}>Zaloguj</Text>
        </TouchableOpacity>
        <TouchableOpacity style={globalStyles.button} onPress={() => navigation.navigate("Zarejestruj się")}>
          <Text style={globalStyles.buttonText}>Zarejestruj się</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
