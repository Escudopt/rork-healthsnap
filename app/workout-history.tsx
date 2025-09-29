import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/providers/ThemeProvider';
import { useCalorieTracker } from '@/providers/CalorieTrackerProvider';
import { BlurCard } from '@/components/BlurCard';
import {
  ArrowLeft,
  Calendar,
  Timer,
  MapPin,
  Zap,
  Activity,
  Footprints,
  TrendingUp,
  Target,
} from 'lucide-react-native';

export default function WorkoutHistoryScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { workoutSessions, getTodayWorkouts, getWeeklyWorkouts } = useCalorieTracker();
  
  // Calculate statistics
  const stats = useMemo(() => {
    const todayWorkouts = getTodayWorkouts();
    const weeklyWorkouts = getWeeklyWorkouts();
    
    const todayStats = todayWorkouts.reduce(
      (acc, workout) => {
        acc.duration += workout.duration;
        acc.calories += workout.calories;
        acc.distance += workout.distance || 0;
        return acc;
      },
      { duration: 0, calories: 0, distance: 0 }
    );
    
    const weeklyStats = weeklyWorkouts.reduce(
      (acc, workout) => {
        acc.duration += workout.duration;
        acc.calories += workout.calories;
        acc.distance += workout.distance || 0;
        acc.sessions += 1;
        return acc;
      },
      { duration: 0, calories: 0, distance: 0, sessions: 0 }
    );
    
    return {
      today: {
        ...todayStats,
        sessions: todayWorkouts.length,
      },
      weekly: weeklyStats,
    };
  }, [getTodayWorkouts, getWeeklyWorkouts]);
  
  // Format time
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };
  
  // Format distance
  const formatDistance = (km: number): string => {
    if (km < 1) {
      return `${Math.round(km * 1000)}m`;
    }
    return `${km.toFixed(2)}km`;
  };
  
  // Format date
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (date.toDateString() === today.toDateString()) {
        return 'Hoje';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Ontem';
      } else {
        return date.toLocaleDateString('pt-PT', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
      }
    } catch {
      return 'Data inválida';
    }
  };
  
  // Get workout mode icon and color
  const getWorkoutModeInfo = (type: string) => {
    switch (type) {
      case 'walking':
        return {
          icon: <Footprints size={20} color={colors.success} />,
          name: 'Caminhada',
          color: colors.success,
        };
      case 'running':
        return {
          icon: <Activity size={20} color={colors.warning} />,
          name: 'Corrida',
          color: colors.warning,
        };
      case 'live':
        return {
          icon: <Zap size={20} color={colors.error || '#F44336'} />,
          name: 'Live Treino',
          color: colors.error || '#F44336',
        };
      default:
        return {
          icon: <Activity size={20} color={colors.primary} />,
          name: 'Treino',
          color: colors.primary,
        };
    }
  };
  
  // Group workouts by date
  const groupedWorkouts = useMemo(() => {
    const groups: { [key: string]: typeof workoutSessions } = {};
    
    workoutSessions.forEach(workout => {
      const dateKey = formatDate(workout.date);
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(workout);
    });
    
    // Sort groups by date (most recent first)
    const sortedGroups = Object.entries(groups).sort(([a], [b]) => {
      if (a === 'Hoje') return -1;
      if (b === 'Hoje') return 1;
      if (a === 'Ontem') return -1;
      if (b === 'Ontem') return 1;
      return new Date(b).getTime() - new Date(a).getTime();
    });
    
    return sortedGroups;
  }, [workoutSessions]);
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Histórico de Treinos',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Statistics Summary */}
        <View style={styles.statsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Resumo</Text>
          
          {/* Today Stats */}
          <BlurCard style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <Calendar size={20} color={colors.primary} />
              <Text style={[styles.statsTitle, { color: colors.text }]}>Hoje</Text>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>{stats.today.sessions}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Treinos</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>{formatTime(stats.today.duration)}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Tempo</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>{Math.round(stats.today.calories)}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Calorias</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>{formatDistance(stats.today.distance)}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Distância</Text>
              </View>
            </View>
          </BlurCard>
          
          {/* Weekly Stats */}
          <BlurCard style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <TrendingUp size={20} color={colors.primary} />
              <Text style={[styles.statsTitle, { color: colors.text }]}>Esta Semana</Text>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>{stats.weekly.sessions}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Treinos</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>{formatTime(stats.weekly.duration)}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Tempo</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>{Math.round(stats.weekly.calories)}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Calorias</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.text }]}>{formatDistance(stats.weekly.distance)}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Distância</Text>
              </View>
            </View>
          </BlurCard>
        </View>
        
        {/* Workout History */}
        <View style={styles.historySection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Histórico</Text>
          
          {workoutSessions.length === 0 ? (
            <BlurCard style={styles.emptyState}>
              <Target size={48} color={colors.textSecondary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>Nenhum treino registado</Text>
              <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
                Comece um treino GPS para ver o seu histórico aqui.
              </Text>
            </BlurCard>
          ) : (
            groupedWorkouts.map(([dateGroup, workouts]) => (
              <View key={dateGroup} style={styles.dateGroup}>
                <Text style={[styles.dateGroupTitle, { color: colors.text }]}>{dateGroup}</Text>
                {workouts.map((workout) => {
                  const modeInfo = getWorkoutModeInfo(workout.type);
                  
                  return (
                    <BlurCard key={workout.id} style={styles.workoutHistoryCard}>
                      <View style={styles.workoutHistoryHeader}>
                        <View style={styles.workoutModeInfo}>
                          {modeInfo.icon}
                          <Text style={[styles.workoutModeName, { color: modeInfo.color }]}>
                            {modeInfo.name}
                          </Text>
                        </View>
                        <Text style={[styles.workoutTime, { color: colors.textSecondary }]}>
                          {new Date(workout.timestamp).toLocaleTimeString('pt-PT', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </View>
                      
                      <View style={styles.workoutHistoryStats}>
                        <View style={styles.historyStatItem}>
                          <Timer size={16} color={colors.textSecondary} />
                          <Text style={[styles.historyStatText, { color: colors.textSecondary }]}>
                            {formatTime(workout.duration)}
                          </Text>
                        </View>
                        
                        {workout.distance && workout.distance > 0 && (
                          <View style={styles.historyStatItem}>
                            <MapPin size={16} color={colors.textSecondary} />
                            <Text style={[styles.historyStatText, { color: colors.textSecondary }]}>
                              {formatDistance(workout.distance)}
                            </Text>
                          </View>
                        )}
                        
                        <View style={styles.historyStatItem}>
                          <Zap size={16} color={colors.textSecondary} />
                          <Text style={[styles.historyStatText, { color: colors.textSecondary }]}>
                            {Math.round(workout.calories)} kcal
                          </Text>
                        </View>
                      </View>
                    </BlurCard>
                  );
                })}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  
  // Statistics
  statsSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  statsCard: {
    padding: 20,
    marginBottom: 16,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
  },
  
  // History
  historySection: {
    flex: 1,
  },
  dateGroup: {
    marginBottom: 24,
  },
  dateGroupTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    paddingLeft: 4,
  },
  workoutHistoryCard: {
    padding: 16,
    marginBottom: 12,
  },
  workoutHistoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutModeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  workoutModeName: {
    fontSize: 16,
    fontWeight: '600',
  },
  workoutTime: {
    fontSize: 14,
  },
  workoutHistoryStats: {
    flexDirection: 'row',
    gap: 16,
  },
  historyStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyStatText: {
    fontSize: 14,
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
