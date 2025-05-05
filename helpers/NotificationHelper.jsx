import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';


Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const scheduleDailyNotification = async (hour, minute) => {

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  console.log(`Aktualna godzina w telefonie: ${currentHour}:${currentMinute < 10 ? '0' : ''}${currentMinute}`);


  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    console.error('Niepoprawna godzina lub minuta:', hour, minute);
    return;
  }


  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('fitness-reminder-channel', {
      name: 'Przypomnienia o treningu',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }


  const trigger = {
    hour: hour,
    minute: minute,
    repeats: true,
  };

  const content = {
    title: 'Czas na działanie!',
    body: 'Sprawdź swoje cele na dziś!',
    sound: 'default',
  };

  try {
    await Notifications.scheduleNotificationAsync({
      content: content,
      trigger: trigger,
    });
    console.log('Powiadomienie zaplanowane', `godzina: ${hour}, minuta: ${minute}`);
  } catch (error) {
    console.error('Błąd podczas planowania powiadomienia:', error);
  }
};