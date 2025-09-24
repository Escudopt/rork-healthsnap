import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useHealth } from '@/providers/HealthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { Heart, Activity, Footprints, Flame, RefreshCw } from 'lucide-react-native';

export default function HealthDashboard() {
  const { 
    healthData, 
    isHealthKitAvailable, 
    requestPermissions, 
    refreshHealthData, 
    hasPermissions 
  } = useHealth();
  const { colors, isDark } = useTheme();

  const handleRequestPermissions = async () => {
    const granted = await requestPermissions();
    if (granted) {
      Alert.alert('Success', 'Health permissions granted!');
    } else {
      Alert.alert('Error', 'Failed to get health permissions');
    }
  };

  const handleRefresh = async () => {
    await refreshHealthData();
  };

  if (!isHealthKitAvailable) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.unavailableContainer}>
          <Heart size={48} color={colors.textSecondary} />
          <Text style={[styles.unavailableTitle, { color: colors.textSecondary }]}>HealthKit Unavailable</Text>
          <Text style={[styles.unavailableText, { color: colors.textTertiary }]}>
            HealthKit is only available on iOS devices. This feature will work when you run the app on an iPhone.
          </Text>
        </View>
      </View>
    );
  }

  if (!hasPermissions) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.permissionContainer}>
          <Heart size={48} color={colors.primary} />
          <Text style={[styles.permissionTitle, { color: colors.text }]}>Health Access Required</Text>
          <Text style={[styles.permissionText, { color: colors.textSecondary }]}>
            To show your health data, we need access to your HealthKit information.
          </Text>
          <TouchableOpacity 
            style={[styles.permissionButton, { backgroundColor: colors.primary }]} 
            onPress={handleRequestPermissions}
            disabled={healthData.isLoading}
          >
            {healthData.isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.permissionButtonText}>Grant Access</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Health Dashboard</Text>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={handleRefresh}
          disabled={healthData.isLoading}
        >
          <RefreshCw 
            size={20} 
            color={colors.primary} 
            style={healthData.isLoading ? styles.spinning : undefined}
          />
        </TouchableOpacity>
      </View>

      {healthData.error && (
        <View style={[styles.errorContainer, { backgroundColor: isDark ? 'rgba(255, 69, 58, 0.15)' : '#FFE5E5' }]}>
          <Text style={[styles.errorText, { color: colors.error }]}>{healthData.error}</Text>
        </View>
      )}

      <View style={styles.metricsGrid}>
        <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
          <View style={styles.metricHeader}>
            <Footprints size={24} color={colors.primary} />
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Steps</Text>
          </View>
          <Text style={[styles.metricValue, { color: colors.text }]}>{healthData.steps.toLocaleString()}</Text>
          <Text style={[styles.metricUnit, { color: colors.textTertiary }]}>steps today</Text>
        </View>

        <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
          <View style={styles.metricHeader}>
            <Flame size={24} color={colors.warning} />
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Active Calories</Text>
          </View>
          <Text style={[styles.metricValue, { color: colors.text }]}>{healthData.activeCalories}</Text>
          <Text style={[styles.metricUnit, { color: colors.textTertiary }]}>kcal burned</Text>
        </View>

        <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
          <View style={styles.metricHeader}>
            <Activity size={24} color={colors.success} />
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Total Calories</Text>
          </View>
          <Text style={[styles.metricValue, { color: colors.text }]}>{healthData.totalCalories}</Text>
          <Text style={[styles.metricUnit, { color: colors.textTertiary }]}>kcal total</Text>
        </View>

        <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
          <View style={styles.metricHeader}>
            <Footprints size={24} color={colors.primaryLight} />
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Distance</Text>
          </View>
          <Text style={[styles.metricValue, { color: colors.text }]}>{healthData.distance}</Text>
          <Text style={[styles.metricUnit, { color: colors.textTertiary }]}>km walked</Text>
        </View>

        {healthData.heartRate && (
          <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
            <View style={styles.metricHeader}>
              <Heart size={24} color={colors.error} />
              <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>Heart Rate</Text>
            </View>
            <Text style={[styles.metricValue, { color: colors.text }]}>{healthData.heartRate}</Text>
            <Text style={[styles.metricUnit, { color: colors.textTertiary }]}>bpm latest</Text>
          </View>
        )}
      </View>

      <View style={[styles.infoContainer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.infoTitle, { color: colors.text }]}>About Health Data</Text>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          This data is synced from your iPhone&apos;s Health app. Make sure your fitness tracking is enabled and your device is recording health data.
        </Text>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          Data is updated in real-time when you refresh or open the app.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 8,
  },
  spinning: {
    transform: [{ rotate: '180deg' }],
  },
  unavailableContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  unavailableTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  unavailableText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 120,
    alignItems: 'center',
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  metricCard: {
    borderRadius: 16,
    padding: 20,
    flex: 1,
    minWidth: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metricUnit: {
    fontSize: 12,
  },
  infoContainer: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
});