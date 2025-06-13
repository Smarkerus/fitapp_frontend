import { useContext, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { ApiContext } from '../context/ApiContext';
import { globalStyles } from '../styles';

export default function Home({ navigation }) {
  const { user } = useContext(AuthContext);
  const { fetchUserStatistics, activityTypes } = useContext(ApiContext);

  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [statistics, setStatistics] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  const periods = [
    { label: 'Cały okres', value: 'all' },
    { label: '1 rok', value: 'year' },
    { label: '30 dni', value: '30days' },
    { label: '7 dni', value: '7days' },
    { label: 'Dzisiaj', value: 'today' },
  ];

  useFocusEffect(
    useCallback(() => {
      const fetchStats = async () => {
        setIsLoadingStats(true);
        const { start_date, end_date } = getDateRange(selectedPeriod);
        try {
          const stats = await fetchUserStatistics(start_date, end_date);
          setStatistics(stats);
        } catch (error) {
          console.error('Błąd podczas pobierania statystyk:', error);
        } finally {
          setIsLoadingStats(false);
        }
      };

      fetchStats();
    }, [selectedPeriod, fetchUserStatistics])
  );

  const getActivityTypeName = activityValue => {
    if (!activityTypes) {
      return 'Ładowanie typów aktywności...';
    }
    const [activityType] = Object.values(activityTypes).filter(type => type.apiValue === activityValue);
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

  const formatTime = seconds => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours} godz. ${minutes} min.`;
  };

  return (
    <View style={globalStyles.background} testID="home-screen">
      {isLoadingStats ? (
        <ActivityIndicator size="large" color={globalStyles.colors.primary} testID="loading-indicator" />
      ) : (
        <View style={globalStyles.container}>
          <Text style={globalStyles.welcome} testID="welcome-message">
            Witaj, {user.name}!
          </Text>
          <View style={styles.statsCard} testID="stats-card">
            <View style={styles.periodSelectors}>
              {periods.map(period => (
                <TouchableOpacity
                  key={period.value}
                  style={[styles.periodButton, period.value === selectedPeriod && styles.selectedPeriodButton]}
                  onPress={() => setSelectedPeriod(period.value)}
                  testID={`period-button-${period.value}`}
                >
                  <Text
                    style={[styles.periodText, period.value === selectedPeriod && styles.periodTextSelected]}
                    testID={`period-text-${period.value}`}
                  >
                    {period.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {statistics && (
              <ScrollView style={styles.statsScroll} testID="stats-scroll">
                <View style={styles.statsContainer} testID="stats-container">
                  <Text style={styles.sectionTitle} testID="stats-title">
                    Twoje statystyki
                  </Text>
                  <View style={styles.statRow} testID="stat-row-average-speed">
                    <Text style={styles.statLabel} testID="stat-label-average-speed">
                      Średnia prędkość:
                    </Text>
                    <Text style={styles.statValue} testID="stat-value-average-speed">
                      {statistics.average_speed.toFixed(2)} km/h
                    </Text>
                  </View>
                  <View style={styles.statRow} testID="stat-row-total-distance">
                    <Text style={styles.statLabel} testID="stat-label-total-distance">
                      Całkowity dystans:
                    </Text>
                    <Text style={styles.statValue} testID="stat-value-total-distance">
                      {(statistics.total_distance / 1000).toFixed(2)} km
                    </Text>
                  </View>
                  <View style={styles.statRow} testID="stat-row-total-time">
                    <Text style={styles.statLabel} testID="stat-label-total-time">
                      Całkowity czas:
                    </Text>
                    <Text style={styles.statValue} testID="stat-value-total-time">
                      {formatTime(statistics.total_time)}
                    </Text>
                  </View>
                  <View style={styles.statRow} testID="stat-row-calories-burned">
                    <Text style={styles.statLabel} testID="stat-label-calories-burned">
                      Spalone kalorie:
                    </Text>
                    <Text style={styles.statValue} testID="stat-value-calories-burned">
                      {statistics.total_calories_burned.toFixed(0)} kcal
                    </Text>
                  </View>
                  {statistics.most_liked_activity && (
                    <View style={styles.statRow} testID="stat-row-most-liked">
                      <Text style={styles.statLabel} testID="stat-label-most-liked">
                        Najbardziej lubisz:
                      </Text>
                      <Text style={styles.statValue} testID="stat-value-most-liked">
                        {getActivityTypeName(statistics.most_liked_activity)}
                      </Text>
                    </View>
                  )}
                </View>
              </ScrollView>
            )}
          </View>

          <View style={styles.statsCard} testID="activity-ranking-card">
            {statistics && (
              <>
                <Text style={styles.sectionTitle} testID="activity-ranking-title">
                  Twój ranking aktywności
                </Text>
                <ScrollView style={styles.statsScroll} testID="activity-ranking-scroll">
                  <View style={styles.statsContainer} testID="activity-ranking-container">
                    {statistics.activities.length === 0 ? (
                      <View style={globalStyles.centeredContainer} testID="no-activities-container">
                        <Text style={globalStyles.infoText} testID="no-activities-message">
                          Hej, nie masz jeszcze żadnych aktywności w tym okresie! Może czas się poruszać?
                        </Text>
                        <TouchableOpacity
                          style={globalStyles.button}
                          onPress={() => navigation.navigate('Nowa aktywność')}
                          testID="new-activity-button"
                        >
                          <Text style={globalStyles.buttonText}>Przejdź do aktywności</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      statistics.activities
                        .sort((a, b) => b.count - a.count)
                        .map((activity, index) => (
                          <View key={index} style={styles.activityCard} testID={`activity-card-${index}`}>
                            <Text style={styles.activityTitle} testID={`activity-title-${index}`}>
                              {getActivityTypeName(activity.activity)}
                            </Text>
                            <Text testID={`activity-count-${index}`}>Liczba wystąpień: {activity.count}</Text>
                            <Text testID={`activity-distance-${index}`}>
                              Dystans: {(activity.distance / 1000).toFixed(2)} km
                            </Text>
                            <Text testID={`activity-time-${index}`}>Czas: {formatTime(activity.time)}</Text>
                            <Text testID={`activity-calories-${index}`}>
                              Spalone Kalorie: {activity.calories_burned.toFixed(0)} kcal
                            </Text>
                          </View>
                        ))
                    )}
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  statsCard: {
    ...globalStyles.card,
    flex: 1,
    marginTop: 20,
  },
  periodSelectors: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'nowrap',
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
