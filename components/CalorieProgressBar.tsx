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
        {/* Enhanced header with gradient accent */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.textSecondary }]}>Progresso Diário</Text>
            <View style={[styles.statusIndicator, { backgroundColor: progressColor + '20' }]}>
              <View style={[styles.statusDot, { backgroundColor: progressColor }]} />
              <Text style={[styles.statusText, { color: progressColor }]}>
                {isOverGoal ? 'Excedido' : isNearGoal ? 'Quase lá' : 'Em progresso'}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={onCameraPress} 
            style={[styles.cameraButton, { backgroundColor: colors.primary }]}
            activeOpacity={0.7}
          >
            <View style={styles.cameraButtonInner}>
              <Camera color="white" size={18} strokeWidth={2.5} />
            </View>
          </TouchableOpacity>
        </View>
        
        {/* Enhanced calories display */}
        <View style={styles.caloriesSection}>
          <View style={styles.caloriesRow}>
            <Text style={[styles.currentCalories, { color: colors.text }]}>
              {currentCalories.toLocaleString()}
            </Text>
            <Text style={[styles.separator, { color: colors.textTertiary }]}>/</Text>
            <Text style={[styles.goalCalories, { color: colors.textSecondary }]}>
              {dailyGoal.toLocaleString()}
            </Text>
            <Text style={[styles.calorieUnit, { color: colors.textSecondary }]}>kcal</Text>
          </View>
          <Text style={[styles.caloriesSubtext, { color: colors.textTertiary }]}>
            {remaining > 0 ? `${remaining.toLocaleString()} calorias restantes` : 'Meta diária alcançada!'}
          </Text>
        </View>
        
        {/* Enhanced progress bar with glow effect */}
        <View style={styles.progressSection}>
          <View style={[styles.progressBarBackground, { backgroundColor }]}>
            <View 
              style={[
                styles.progressBar,
                {
                  backgroundColor: progressColor,
                  width: `${Math.min(animatedWidth, 100)}%`,
                  transition: Platform.OS === 'web' ? 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' : undefined,
                  shadowColor: progressColor,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.4,
                  shadowRadius: 4,
                }
              ]}
            />
          </View>
          <View style={styles.progressInfo}>
            <Text style={[styles.progressPercentage, { color: colors.text }]}>
              {Math.round(percentage)}%
            </Text>
            <TouchableOpacity onPress={onGoalPress} activeOpacity={0.7}>
              <Text style={[styles.goalButton, { color: colors.primary }]}>
                Ajustar Meta
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  card: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
    gap: 8,
  },
  title: {
    ...Typography.caption1Emphasized,
    fontSize: 13,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
    opacity: 0.7,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
  },
  cameraButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  cameraButtonInner: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  caloriesSection: {
    marginBottom: 20,
    gap: 6,
  },
  caloriesRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  currentCalories: {
    ...Typography.largeNumber,
    fontSize: 32,
    fontWeight: '300' as const,
    letterSpacing: -1.2,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  separator: {
    fontSize: 24,
    fontWeight: '200' as const,
    opacity: 0.4,
  },
  goalCalories: {
    fontSize: 20,
    fontWeight: '400' as const,
    opacity: 0.6,
  },
  calorieUnit: {
    fontSize: 16,
    fontWeight: '500' as const,
    opacity: 0.5,
    marginLeft: 4,
  },
  caloriesSubtext: {
    fontSize: 13,
    fontWeight: '400' as const,
    opacity: 0.6,
    letterSpacing: 0.1,
  },
  progressSection: {
    gap: 12,
  },
  progressBarBackground: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
    minWidth: 4,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
  },
  goalButton: {
    fontSize: 13,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
  },
});