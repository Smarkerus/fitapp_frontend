import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';
import { globalStyles } from '../styles';

export default function Reminder({ navigation }) {
  const { user, fetchReminder, createReminder, editReminder, deleteReminder } = useContext(AuthContext);
  const [reminderData, setReminderData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    min_calories: '',
    min_distance: '',
    min_time: '',
  });

  useEffect(() => {
    loadReminder();
  }, []);

  const saveReminderLocally = async (email, data) => {
    try {
      await AsyncStorage.setItem(`reminder_${email}`, JSON.stringify(data));
    } catch (error) {
      console.error('Błąd zapisywania danych lokalnie', error);
    }
  };

  const loadReminderLocally = async email => {
    try {
      const data = await AsyncStorage.getItem(`reminder_${email}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Błąd ładowania danych lokalnie', error);
      return null;
    }
  };

  const loadReminder = async () => {
    try {
      const data = await fetchReminder();
      if (data) {
        setReminderData(data);
        setFormData({
          min_calories: data.min_calories.toString(),
          min_distance: (data.min_distance / 1000).toString(),
          min_time: (data.min_time / 60).toString(),
        });
        saveReminderLocally(user.email, data);
      } else {
        setReminderData(null);
      }
    } catch (err) {
      setError('Błąd pobierania przypominajki');
      const localData = await loadReminderLocally(user.email);
      if (localData) {
        setReminderData(localData);
        setFormData({
          min_calories: localData.min_calories.toString(),
          min_distance: (localData.min_distance / 1000).toString(),
          min_time: (localData.min_time / 60).toString(),
        });
      }
    }
  };

  const handleCreateOrUpdate = async () => {
    const min_calories = parseInt(formData.min_calories);
    const min_distance_km = parseFloat(formData.min_distance);
    const min_time_min = parseInt(formData.min_time);

    if (isNaN(min_calories) || isNaN(min_distance_km) || isNaN(min_time_min)) {
      setError('Wszystkie pola muszą być liczbami');
      return;
    }

    if (min_calories < 0 || min_distance_km < 0 || min_time_min < 0) {
      setError('Wartości nie mogą być ujemne');
      return;
    }

    const min_distance_m = min_distance_km * 1000;
    const min_time_s = min_time_min * 60;

    try {
      if (reminderData) {
        await editReminder(min_calories, min_distance_m, min_time_s);
      } else {
        await createReminder(min_calories, min_distance_m, min_time_s);
      }
      setIsEditing(false);
      loadReminder();
    } catch (err) {
      setError('Błąd zapisywania przypominajki');
    }
  };

  const handleDelete = () => {
    Alert.alert('Potwierdzenie', 'Czy na pewno chcesz usunąć przypominajkę?', [
      { text: 'Anuluj', style: 'cancel' },
      {
        text: 'Usuń',
        onPress: async () => {
          try {
            await deleteReminder();
            setReminderData(null);
            setIsEditing(false);
            await AsyncStorage.removeItem(`reminder_${user.email}`);
          } catch (err) {
            setError('Błąd usuwania przypominajki');
          }
        },
      },
    ]);
  };

  const renderForm = () => (
    <View>
      <Text style={globalStyles.subtitle}>Minimalna liczba kalorii</Text>
      <TextInput
        style={globalStyles.input}
        value={formData.min_calories}
        onChangeText={value => setFormData({ ...formData, min_calories: value })}
        placeholder="Wprowadź minimalną liczbę kalorii"
        keyboardType="numeric"
        onSubmitEditing={handleCreateOrUpdate}
      />
      <Text style={globalStyles.subtitle}>Minimalny dystans (km)</Text>
      <TextInput
        style={globalStyles.input}
        value={formData.min_distance}
        onChangeText={value => setFormData({ ...formData, min_distance: value })}
        placeholder="Wprowadź minimalny dystans"
        keyboardType="numeric"
        onSubmitEditing={handleCreateOrUpdate}
      />
      <Text style={globalStyles.subtitle}>Minimalny czas (minuty)</Text>
      <TextInput
        style={globalStyles.input}
        value={formData.min_time}
        onChangeText={value => setFormData({ ...formData, min_time: value })}
        placeholder="Wprowadź minimalny czas"
        keyboardType="numeric"
        onSubmitEditing={handleCreateOrUpdate}
      />
      {error ? <Text style={globalStyles.errorText}>{error}</Text> : null}
      <TouchableOpacity style={globalStyles.button} onPress={handleCreateOrUpdate}>
        <Text style={globalStyles.buttonText}>Zapisz</Text>
      </TouchableOpacity>
    </View>
  );

  const renderReminder = () => (
    <View>
      <Text style={globalStyles.title}>Twoja przypominajka</Text>
      <Text style={styles.infoText}>
        Zawsze możesz zaktualizować swoją przypominajkę, aby osiągać jeszcze lepsze rezultaty treningu!
      </Text>
      <View style={globalStyles.card}>
        <Text style={globalStyles.text}>Minimalna liczba kalorii: {reminderData.min_calories}</Text>
        <Text style={globalStyles.text}>Minimalny dystans: {reminderData.min_distance / 1000} km</Text>
        <Text style={globalStyles.text}>Minimalny czas: {reminderData.min_time / 60} minut</Text>
        <TouchableOpacity style={globalStyles.button} onPress={() => setIsEditing(true)}>
          <Text style={globalStyles.buttonText}>Edytuj</Text>
        </TouchableOpacity>
        <TouchableOpacity style={globalStyles.secondaryButton} onPress={handleDelete}>
          <Text style={globalStyles.buttonText}>Usuń</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderNoReminder = () => (
    <View>
      <Text style={globalStyles.title}>
        Nie masz jeszcze ustawionej przypominajki. Ustaw ją, by już zawsze pamiętać o swoim treningu!
      </Text>
      <TouchableOpacity style={globalStyles.button} onPress={() => setIsEditing(true)}>
        <Text style={globalStyles.buttonText}>Utwórz przypominajkę</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={globalStyles.background}>
      <View style={globalStyles.container}>
        {isEditing ? renderForm() : reminderData ? renderReminder() : renderNoReminder()}
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
});
