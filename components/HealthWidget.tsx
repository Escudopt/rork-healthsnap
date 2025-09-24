import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useHealth } from '@/providers/HealthProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { Heart, Activity, Footprints } from 'lucide-react-native';
import { BlurCard } from './BlurCard';

interface HealthWidgetProps {
  onPress?: () => void;
}

export function HealthWidget({ onPress }: HealthWidgetProps) {
  const { healthData, hasPermissions, isHealthKitAvailable } = useHealth();
  const { colors } = useTheme();

  if (!isHealthKitAvailable || !hasPermissions) {
    return null;
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <BlurCard style={styles.container}>
        <View style={styles.header}>
          <Heart size={20} color={colors.error} />
          <Text style={[styles.title, { color: colors.text }]}>Health Today</Text>
        </View>
        
        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <Footprints size={16} color={colors.primary} />
            <Text style={[styles.metricValue, { color: colors.text }]}>{healthData.steps.toLocaleString()}</Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>steps</Text>
          </View>
          
          <View style={styles.metric}>
            <Activity size={16} color={colors.success} />
            <Text style={[styles.metricValue, { color: colors.text }]}>{healthData.activeCalories}</Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>cal</Text>
          </View>
          
          <View style={styles.metric}>
            <Heart size={16} color={colors.error} />
            <Text style={[styles.metricValue, { color: colors.text }]}>{healthData.distance}</Text>
            <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>km</Text>
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
    marginTop: 4,
  },
  metricLabel: {
    fontSize: 12,
    marginTop: 2,
  },
});