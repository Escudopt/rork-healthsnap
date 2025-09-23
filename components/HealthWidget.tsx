import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useHealth } from '@/providers/HealthProvider';
import { Heart, Activity, Footprints } from 'lucide-react-native';
import { BlurCard } from './BlurCard';

interface HealthWidgetProps {
  onPress?: () => void;
}

export function HealthWidget({ onPress }: HealthWidgetProps) {
  const { healthData, hasPermissions, isHealthKitAvailable } = useHealth();

  if (!isHealthKitAvailable || !hasPermissions) {
    return null;
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <BlurCard style={styles.container}>
        <View style={styles.header}>
          <Heart size={20} color="#FF3B30" />
          <Text style={styles.title}>Health Today</Text>
        </View>
        
        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <Footprints size={16} color="#007AFF" />
            <Text style={styles.metricValue}>{healthData.steps.toLocaleString()}</Text>
            <Text style={styles.metricLabel}>steps</Text>
          </View>
          
          <View style={styles.metric}>
            <Activity size={16} color="#34C759" />
            <Text style={styles.metricValue}>{healthData.activeCalories}</Text>
            <Text style={styles.metricLabel}>cal</Text>
          </View>
          
          <View style={styles.metric}>
            <Heart size={16} color="#FF3B30" />
            <Text style={styles.metricValue}>{healthData.distance}</Text>
            <Text style={styles.metricLabel}>km</Text>
          </View>
        </View>
      </BlurCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginLeft: 8,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metric: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginTop: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});