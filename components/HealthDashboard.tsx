import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useHealth } from '@/providers/HealthProvider';
import { Heart, Activity, Footprints, Flame, RefreshCw } from 'lucide-react-native';

export default function HealthDashboard() {
  const { 
    healthData, 
    isHealthKitAvailable, 
    requestPermissions, 
    refreshHealthData, 
    hasPermissions 
  } = useHealth();

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
      <View style={styles.container}>
        <View style={styles.unavailableContainer}>
          <Heart size={48} color="#666" />
          <Text style={styles.unavailableTitle}>HealthKit Unavailable</Text>
          <Text style={styles.unavailableText}>
            HealthKit is only available on iOS devices. This feature will work when you run the app on an iPhone.
          </Text>
        </View>
      </View>
    );
  }

  if (!hasPermissions) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Heart size={48} color="#007AFF" />
          <Text style={styles.permissionTitle}>Health Access Required</Text>
          <Text style={styles.permissionText}>
            To show your health data, we need access to your HealthKit information.
          </Text>
          <TouchableOpacity 
            style={styles.permissionButton} 
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
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <Text style={styles.title}>Health Dashboard</Text>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={handleRefresh}
          disabled={healthData.isLoading}
        >
          <RefreshCw 
            size={20} 
            color="#007AFF" 
            style={healthData.isLoading ? styles.spinning : undefined}
          />
        </TouchableOpacity>
      </View>

      {healthData.error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{healthData.error}</Text>
        </View>
      )}

      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Footprints size={24} color="#007AFF" />
            <Text style={styles.metricLabel}>Steps</Text>
          </View>
          <Text style={styles.metricValue}>{healthData.steps.toLocaleString()}</Text>
          <Text style={styles.metricUnit}>steps today</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Flame size={24} color="#FF6B35" />
            <Text style={styles.metricLabel}>Active Calories</Text>
          </View>
          <Text style={styles.metricValue}>{healthData.activeCalories}</Text>
          <Text style={styles.metricUnit}>kcal burned</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Activity size={24} color="#34C759" />
            <Text style={styles.metricLabel}>Total Calories</Text>
          </View>
          <Text style={styles.metricValue}>{healthData.totalCalories}</Text>
          <Text style={styles.metricUnit}>kcal total</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Footprints size={24} color="#5856D6" />
            <Text style={styles.metricLabel}>Distance</Text>
          </View>
          <Text style={styles.metricValue}>{healthData.distance}</Text>
          <Text style={styles.metricUnit}>km walked</Text>
        </View>

        {healthData.heartRate && (
          <View style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Heart size={24} color="#FF3B30" />
              <Text style={styles.metricLabel}>Heart Rate</Text>
            </View>
            <Text style={styles.metricValue}>{healthData.heartRate}</Text>
            <Text style={styles.metricUnit}>bpm latest</Text>
          </View>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>About Health Data</Text>
        <Text style={styles.infoText}>
          This data is synced from your iPhone's Health app. Make sure your fitness tracking is enabled and your device is recording health data.
        </Text>
        <Text style={styles.infoText}>
          Data is updated in real-time when you refresh or open the app.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    color: '#1a1a1a',
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
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  unavailableText: {
    fontSize: 16,
    color: '#888',
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
    color: '#1a1a1a',
    marginTop: 16,
    marginBottom: 8,
  },
  permissionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#007AFF',
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
    backgroundColor: '#FFE5E5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#D32F2F',
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
    backgroundColor: '#fff',
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
    color: '#666',
    marginLeft: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  metricUnit: {
    fontSize: 12,
    color: '#888',
  },
  infoContainer: {
    backgroundColor: '#fff',
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
    color: '#1a1a1a',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
});