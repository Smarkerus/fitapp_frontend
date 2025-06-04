import React, { useState, useContext } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { globalStyles } from '../styles';
import Checkbox from 'expo-checkbox';

export default function Account({ navigation }) {
  const { user, editUserDetails } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [age, setAge] = useState(user?.details?.age?.toString() || '');
  const [weight, setWeight] = useState(user?.details?.weight?.toString() || '');
  const [height, setHeight] = useState(user?.details?.height?.toString() || '');
  const [isMale, setIsMale] = useState(user?.details?.gender !== 'female');
  const [isFemale, setIsFemale] = useState(user?.details?.gender === 'female');

  const handleSave = async () => {
    const ageNum = parseInt(age);
    const weightNum = parseFloat(weight);
    const heightNum = parseFloat(height);
    const gender = isMale ? 'male' : 'female';

    if (isNaN(ageNum) || ageNum <= 0) {
      Alert.alert('Błąd', 'Wiek musi być dodatnią liczbą całkowitą.');
      return;
    }
    if (isNaN(weightNum) || weightNum <= 0) {
      Alert.alert('Błąd', 'Waga musi być dodatnią liczbą.');
      return;
    }
    if (isNaN(heightNum) || heightNum <= 0) {
      Alert.alert('Błąd', 'Wzrost musi być dodatnią liczbą.');
      return;
    }

    try {
      await editUserDetails(weightNum, heightNum, ageNum, gender);
      Alert.alert('Sukces', 'Dane zostały zapisane!');
      setIsEditing(false);
    } catch (error) {
      console.error('Błąd podczas zapisywania danych:', error);
      Alert.alert('Błąd', 'Wystąpił błąd podczas zapisywania danych.');
    }
  };

  const handleCancel = () => {
    setAge(user?.details?.age?.toString() || '');
    setWeight(user?.details?.weight?.toString() || '');
    setHeight(user?.details?.height?.toString() || '');
    setIsMale(user?.details?.gender !== 'female');
    setIsFemale(user?.details?.gender === 'female');
    setIsEditing(false);
  };

  return (
    <View style={globalStyles.background}>
      <View style={globalStyles.container}>
        <Text style={globalStyles.title}>Profil użytkownika</Text>
        <Text style={styles.infoText}>
          Tutaj możesz zaktualizować swoje dane – dzięki nim dostosujemy Twój plan, byś zawsze był w szczytowej formie i
          osiągał swoje cele!
        </Text>
        <View style={globalStyles.card}>
          <Text style={globalStyles.text}>Imię: {user?.name || 'Brak informacji'}</Text>
          <Text style={globalStyles.text}>Nazwisko: {user?.last_name || 'Brak informacji'}</Text>
          <Text style={globalStyles.text}>Email: {user?.email || 'Brak informacji'}</Text>
          <View style={styles.separator} />
          {isEditing ? (
            <>
              <Text style={globalStyles.subtitle}>Edytuj dane:</Text>
              <Text style={globalStyles.text}>Wiek:</Text>
              <TextInput
                style={globalStyles.input}
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                placeholder="Wiek"
              />
              <Text style={globalStyles.text}>Waga:</Text>
              <TextInput
                style={globalStyles.input}
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                placeholder="Waga (kg)"
              />
              <Text style={globalStyles.text}>Wzrost:</Text>
              <TextInput
                style={globalStyles.input}
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
                placeholder="Wzrost (cm)"
              />
              <Text style={globalStyles.text}>Płeć:</Text>
              <View style={styles.checkboxContainer}>
                <View style={styles.checkboxItem}>
                  <Checkbox
                    value={isMale}
                    onValueChange={newValue => {
                      setIsMale(newValue);
                      setIsFemale(!newValue);
                    }}
                    color={isMale ? globalStyles.colors.primary : undefined}
                  />
                  <Text style={styles.checkboxLabel}>Mężczyzna</Text>
                </View>
                <View style={styles.checkboxItem}>
                  <Checkbox
                    value={isFemale}
                    onValueChange={newValue => {
                      setIsFemale(newValue);
                      setIsMale(!newValue);
                    }}
                    color={isFemale ? globalStyles.colors.primary : undefined}
                  />
                  <Text style={styles.checkboxLabel}>Kobieta</Text>
                </View>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity style={globalStyles.button} onPress={handleSave}>
                  <Text style={globalStyles.buttonText}>Zapisz</Text>
                </TouchableOpacity>
                <TouchableOpacity style={globalStyles.outlineButton} onPress={handleCancel}>
                  <Text style={globalStyles.outlineButtonText}>Anuluj</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={globalStyles.text}>
                Wiek: {user?.details?.age ? `${user?.details?.age} lat` : 'Brak informacji'}
              </Text>
              <Text style={globalStyles.text}>
                Waga: {user?.details?.weight ? `${user?.details?.weight} kg` : 'Brak informacji'}
              </Text>
              <Text style={globalStyles.text}>
                Wzrost: {user?.details?.height ? `${user?.details?.height} cm` : 'Brak informacji'}
              </Text>
              <Text style={globalStyles.text}>
                Płeć:{' '}
                {user?.details?.gender === 'male'
                  ? 'Mężczyzna'
                  : user?.details?.gender === 'female'
                    ? 'Kobieta'
                    : 'Brak informacji'}
              </Text>
              <TouchableOpacity style={globalStyles.button} onPress={() => setIsEditing(true)}>
                <Text style={globalStyles.buttonText}>Edytuj dane</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  infoText: {
    fontSize: globalStyles.sizes.medium,
    color: globalStyles.colors.darkGray,
    marginBottom: globalStyles.spacing.medium,
    textAlign: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: globalStyles.colors.lightGray,
    marginVertical: globalStyles.spacing.medium,
  },
  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: globalStyles.spacing.small,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    marginLeft: globalStyles.spacing.small,
    fontSize: globalStyles.sizes.medium,
    color: globalStyles.colors.text,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: globalStyles.spacing.medium,
  },
});
