import React, { useState, useContext } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { AuthContext } from "../context/AuthContext";
import { globalStyles } from "../styles";

export default function Register({ navigation }) {
  const { register, login } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    name: "",
    last_name: "",
  });

  const handleRegister = async () => {
    try {
      console.log(newUser);
      await register(newUser.email, newUser.password, newUser.name, newUser.last_name);
      setError("");
      await login(newUser.email, newUser.password);
      setNewUser({
        email: "",
        password: "",
        name: "",
        last_name: "",
      });
      navigation.navigate("Zaloguj się");
    } catch (err) {
      console.error("Błąd rejestracji:", err.response?.data);
      setError("Nieprawidłowe dane rejestracji: " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <View style={globalStyles.background}>
      <View style={globalStyles.container}>
        <Text style={globalStyles.title}>Rejestracja</Text>
        <View style={globalStyles.listContainer}>
          <Text style={globalStyles.cardTitle}>Wypełnij formularz, aby się zarejestrować</Text>
          <Text style={globalStyles.subtitle}>Email</Text>
          <TextInput
            style={globalStyles.input}
            value={newUser.email}
            onChangeText={(value) => setNewUser({ ...newUser, email: value })}
            placeholder="Wprowadź swój adres e-mail"
            keyboardType="email-address"
            onSubmitEditing={handleRegister}
            textContentType="email"
            autoCompleteType="email"
          />
          <Text style={globalStyles.subtitle}>Hasło</Text>
          <TextInput
            style={globalStyles.input}
            value={newUser.password}
            onChangeText={(value) => setNewUser({ ...newUser, password: value })}
            placeholder="Wprowadź swoje hasło"
            secureTextEntry={true}
            autoCapitalize="none"
            onSubmitEditing={handleRegister}
            textContentType="password"
            autoCompleteType="password"
          />
          <Text style={globalStyles.subtitle}>Imię</Text>
          <TextInput
            style={globalStyles.input}
            value={newUser.name}
            onChangeText={(value) => setNewUser({ ...newUser, name: value })}
            placeholder="Podaj swoje imię"
            onSubmitEditing={handleRegister}
            autoCapitalize="none"
            textContentType="name"
            autoCompleteType="name"
          />
          <Text style={globalStyles.subtitle}>Nazwisko</Text>
          <TextInput
            style={globalStyles.input}
            value={newUser.last_name}
            onChangeText={(value) => setNewUser({ ...newUser, last_name: value })}
            placeholder="Podaj swoje nazwisko"
            onSubmitEditing={handleRegister}
            autoCapitalize="none"
            textContentType="familyName"
            autoCompleteType="name"
          />
          {error ? <Text style={globalStyles.errorText}>{error}</Text> : null}
          <TouchableOpacity style={globalStyles.button} onPress={handleRegister}>
            <Text style={globalStyles.buttonText}>Zarejestruj się</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
