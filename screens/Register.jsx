import React from "react";
import { View, Text, Button } from "react-native";

export default function Register({ navigation }) {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Rejestracja</Text>
      <Button title="Zarejestruj się" onPress={() => {}} />
      <Button title="Powrót do logowania" onPress={() => navigation.navigate("Login")} />
    </View>
  );
}
