import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { globalStyles } from '../styles';

export default function Home({ navigation }) {
  const { user, fetchUserStatistics, activityTypes } = useContext(AuthContext);

  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [statistics, setStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const periods = [
    { label: 'Cały okres', value: 'all' },
    { label: '1 rok', value: 'year' },
    { label: '30 dni', value: '30days' },
    { label: '7 dni', value: '7days' },
    { label: 'Dzisiaj', value: 'today' },
  ];

  const getActivityTypeName = activityValue => {
    const activityType = Object.values(activityTypes).find(type => type.apiValue === activityValue);
    return activityType ? activityType.label : 'Nieznany typ aktywności';
  };

  const getDateRange = period => {
    const end_date = new Date();
    let start_date = null;
    if (period === 'today') {
      start_date = new Date();
      start_date.setHours(0, 0, 0, 0);
    } else if (period === '7days') {
      start_date = new Date();
      start_date.setDate(start_date.getDate() - 7);
    } else if (period === '30days') {
      start_date = new Date();
      start_date.setDate(start_date.getDate() - 30);
    } else if (period === 'year') {
      start_date = new Date();
      start_date.setFullYear(start_date.getFullYear() - 1);
    } else if (period === 'all') {
      start_date = new Date();
      start_date.setFullYear(2000, 0, 1);
    }
    return { start_date: start_date.toISOString(), end_date: end_date.toISOString() };
  };

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      const { start_date, end_date } = getDateRange(selectedPeriod);
      try {
        const stats = await fetchUserStatistics(start_date, end_date);
        setStatistics(stats);
      } catch (error) {
        console.error('Błąd podczas pobierania statystyk:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [selectedPeriod]);

  const formatTime = seconds => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours} godz. ${minutes} min.`;
  };

  return (
    <View style={globalStyles.background}>
      <View style={globalStyles.container}>
        <Text style={globalStyles.welcome}>Witaj, {user.name}!</Text>
        <View style={styles.statsCard}>
          <View style={styles.periodSelectors}>
            {periods.map(period => (
              <TouchableOpacity
                key={period.value}
                style={[styles.periodButton, period.value === selectedPeriod && styles.selectedPeriodButton]}
                onPress={() => setSelectedPeriod(period.value)}
              >
                <Text style={[styles.periodText, period.value === selectedPeriod && styles.periodTextSelected]}>
                  {period.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color={globalStyles.colors.primary} />
          ) : (
            statistics && (
              <ScrollView style={styles.statsScroll}>
                <View style={styles.statsContainer}>
                  <Text style={styles.sectionTitle}>Twoje statystyki</Text>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Średnia prędkość:</Text>
                    <Text style={styles.statValue}>{statistics.average_speed.toFixed(2)} km/h</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Całkowity dystans:</Text>
                    <Text style={styles.statValue}>{(statistics.total_distance / 1000).toFixed(2)} km</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Całkowity czas:</Text>
                    <Text style={styles.statValue}>{formatTime(statistics.total_time)}</Text>
                  </View>
                  <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Spalone kalorie:</Text>
                    <Text style={styles.statValue}>{statistics.total_calories_burned.toFixed(0)} kcal</Text>
                  </View>
                  {statistics.most_liked_activity && (
                    <View style={styles.statRow}>
                      <Text style={styles.statLabel}>Najbardziej lubisz:</Text>
                      <Text style={styles.statValue}>{getActivityTypeName(statistics.most_liked_activity)}</Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            )
          )}
        </View>
      </View>

      <View style={globalStyles.container}>
        <View style={styles.statsCard}>
          {isLoading ? (
            <ActivityIndicator size="large" color={globalStyles.colors.primary} />
          ) : (
            statistics && (
              <>
                <Text style={styles.sectionTitle}>Twój ranking aktywności</Text>
                <ScrollView style={styles.statsScroll}>
                  <View style={styles.statsContainer}>
                    {statistics.activities.length === 0 ? (
                      <View style={globalStyles.centeredContainer}>
                        <Text style={globalStyles.subtitle}>
                          Hej, nie masz jeszcze żadnych aktywności w tym okresie! Może czas się poruszać?
                        </Text>
                        <TouchableOpacity
                          style={globalStyles.button}
                          onPress={() => navigation.navigate('Nowa aktywność')}
                        >
                          <Text style={globalStyles.buttonText}>Przejdź do aktywności</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      statistics.activities.map((activity, index) => (
                        <View key={index} style={styles.activityCard}>
                          <Text style={styles.activityTitle}>{getActivityTypeName(activity.activity)}</Text>
                          <Text>Liczba wystąpień: {activity.count}</Text>
                          <Text>Dystans: {(activity.distance / 1000).toFixed(2)} km</Text>
                          <Text>Czas: {formatTime(activity.time)}</Text>
                          <Text>Spalone Kalorie: {activity.calories_burned.toFixed(0)} kcal</Text>
                        </View>
                      ))
                    )}
                  </View>
                </ScrollView>
              </>
            )
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsCard: {
    ...globalStyles.card,
    marginTop: 20,
  },
  periodSelectors: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
  },
  periodButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: globalStyles.colors.lightGray,
  },
  selectedPeriodButton: {
    backgroundColor: globalStyles.colors.primary,
  },
  periodText: {
    color: globalStyles.colors.darkGray,
    fontSize: globalStyles.sizes.medium,
  },
  periodTextSelected: {
    color: globalStyles.colors.white,
  },
  statsScroll: {
    minHeight: 150,
  },
  statsContainer: {
    padding: 10,
  },
  sectionTitle: {
    fontSize: globalStyles.sizes.large,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: globalStyles.sizes.medium,
    color: globalStyles.colors.darkGray,
  },
  statValue: {
    fontSize: globalStyles.sizes.medium,
    fontWeight: 'bold',
  },
  activityCard: {
    backgroundColor: globalStyles.colors.white,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activityTitle: {
    fontSize: globalStyles.sizes.medium,
    fontWeight: 'bold',
    marginBottom: 5,
  },
});
