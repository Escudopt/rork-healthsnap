import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Camera } from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { Typography } from '@/constants/typography';

interface CalorieProgressBarProps {
  currentCalories: number;
  dailyGoal: number;
  onGoalPress?: () => void;
  onCameraPress?: () => void;
}

export function CalorieProgressBar({ currentCalories, dailyGoal, onGoalPress, onCameraPress }: CalorieProgressBarProps) {
  const { colors, isDark } = useTheme();
  const [animatedWidth, setAnimatedWidth] = useState<number>(0);
  
  const percentage = Math.min((currentCalories / dailyGoal) * 100, 100);
  const isOverGoal = currentCalories > dailyGoal;
  const remaining = Math.max(dailyGoal - currentCalories, 0);
  const isNearGoal = percentage >= 80 && !isOverGoal;
  
  const progressColor = isOverGoal 
    ? '#FF3B30'
    : currentCalories >= dailyGoal 
    ? '#34C759'
    : isNearGoal 
    ? '#FF9500'
    : '#007AFF';
  
  const backgroundColor = isDark 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.05)';

  useEffect(() => {
    // Simple timeout-based animation
    const timer = setTimeout(() => {
      setAnimatedWidth(percentage);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [percentage]);
  
  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: colors.surfaceElevated }]}>
        {/* Compact header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]}>Calorias Ativas</Text>
          </View>
          <TouchableOpacity 
            onPress={onCameraPress} 
            style={[styles.cameraButton, { backgroundColor: '#007AFF' }]}
            activeOpacity={0.8}
          >
            <Camera color="white" size={16} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
        
        {/* Compact calories display */}
        <View style={styles.caloriesRow}>
          <Text style={[styles.currentCalories, { color: colors.text }]}>
            {currentCalories.toLocaleString()}
          </Text>
          <Text style={[styles.separator, { color: colors.textSecondary }]}>/</Text>
          <Text style={[styles.goalCalories, { color: colors.textSecondary }]}>
            {dailyGoal.toLocaleString()}
          </Text>
          <Text style={[styles.calorieUnit, { color: colors.textSecondary }]}>kcal</Text>
        </View>
        
        {/* Simple progress bar */}
        <View style={styles.progressSection}>
          <View style={[styles.progressBarBackground, { backgroundColor }]}>
            <View 
              style={[
                styles.progressBar,
                {
                  backgroundColor: progressColor,
                  width: `${Math.min(animatedWidth, 100)}%`,
                  transition: Platform.OS === 'web' ? 'width 0.5s ease-out' : undefined,
                }
              ]}
            />
          </View>
          <View style={styles.progressInfo}>
            <Text style={[styles.progressPercentage, { color: colors.text }]}>
              {Math.round(percentage)}%
            </Text>
            <Text style={[styles.remainingText, { color: colors.textSecondary }]}>
              {remaining > 0 ? `${remaining.toLocaleString()} restantes` : 'Meta alcançada!'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...Typography.caption1Emphasized,
    fontSize: 14,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    opacity: 0.8,
  },
  cameraButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  caloriesRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 12,
    gap: 6,
  },
  currentCalories: {
    ...Typography.largeNumber,
    fontSize: 24,
    fontWeight: '600' as const,
    letterSpacing: -0.5,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  separator: {
    fontSize: 20,
    fontWeight: '300' as const,
    opacity: 0.5,
  },
  goalCalories: {
    fontSize: 18,
    fontWeight: '400' as const,
    opacity: 0.7,
  },
  calorieUnit: {
    fontSize: 14,
    fontWeight: '500' as const,
    opacity: 0.6,
    marginLeft: 4,
  },
  progressSection: {
    gap: 8,
  },
  progressBarBackground: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
    minWidth: 2,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
  },
  remainingText: {
    fontSize: 12,
    fontWeight: '500' as const,
    opacity: 0.7,
  },
});