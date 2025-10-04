import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Beef, Wheat, Droplets, TrendingUp } from 'lucide-react-native';
import { BlurCard } from './BlurCard';
import { FoodItem } from '@/types/food';
import { useTheme } from '@/providers/ThemeProvider';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography } from '@/constants/typography';

interface MacroWidgetProps {
  foods: FoodItem[];
  type: 'protein' | 'carbs' | 'fat';
  goal?: number;
  onPress?: () => void;
}

const macroConfig = {
  protein: {
    name: 'Proteína',
    icon: Beef,
    color: '#FF6B6B',
    gradientColors: ['#FF6B6B', '#FF8E8E'],
    unit: 'g',
    defaultGoal: 120,
  },
  carbs: {
    name: 'Carboidratos',
    icon: Wheat,
    color: '#4ECDC4',
    gradientColors: ['#4ECDC4', '#6FE6DD'],
    unit: 'g',
    defaultGoal: 200,
  },
  fat: {
    name: 'Gorduras',
    icon: Droplets,
    color: '#FFE66D',
    gradientColors: ['#FFE66D', '#FFF08A'],
    unit: 'g',
    defaultGoal: 70,
  },
};

export function MacroWidget({ foods, type, goal, onPress }: MacroWidgetProps) {
  const { colors, isDark } = useTheme();
  const config = macroConfig[type];
  const IconComponent = config.icon;
  
  const currentValue = foods.reduce((sum, food) => {
    const value = food[type] || 0;
    return sum + value;
  }, 0);
  
  const targetGoal = goal || config.defaultGoal;
  const percentage = Math.min((currentValue / targetGoal) * 100, 100);
  const isOverGoal = currentValue > targetGoal;
  
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={styles.container}
    >
      <BlurCard style={[styles.card, { backgroundColor: colors.surfaceElevated }]}>
        <LinearGradient
          colors={isDark ? 
            [`${config.color}15`, `${config.color}08`] : 
            [`${config.color}10`, `${config.color}05`]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientOverlay}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: config.color + '20' }]}>
              <IconComponent 
                color={config.color} 
                size={16} 
                strokeWidth={2.5} 
              />
            </View>
            <Text style={[styles.title, { color: colors.textSecondary }]}>
              {config.name}
            </Text>
          </View>
          
          {/* Value */}
          <View style={styles.valueContainer}>
            <Text style={[styles.value, { color: colors.text }]}>
              {currentValue.toFixed(0)}
            </Text>
            <Text style={[styles.unit, { color: colors.textSecondary }]}>
              {config.unit}
            </Text>
          </View>
          
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressTrack, { backgroundColor: colors.surfaceSecondary }]}>
              <View 
                style={[
                  styles.progressFill,
                  {
                    width: `${percentage}%`,
                    backgroundColor: isOverGoal ? '#FF6B6B' : config.color,
                  }
                ]} 
              />
            </View>
            <Text style={[styles.progressText, { color: colors.textTertiary }]}>
              {percentage.toFixed(0)}% de {targetGoal}{config.unit}
            </Text>
          </View>
          
          {/* Status Indicator */}
          {isOverGoal && (
            <View style={styles.statusContainer}>
              <TrendingUp color="#FF6B6B" size={12} strokeWidth={2} />
              <Text style={[styles.statusText, { color: '#FF6B6B' }]}>
                Meta excedida
              </Text>
            </View>
          )}
          
          {currentValue >= targetGoal * 0.8 && !isOverGoal && (
            <View style={styles.statusContainer}>
              <TrendingUp color={config.color} size={12} strokeWidth={2} />
              <Text style={[styles.statusText, { color: config.color }]}>
                Quase lá!
              </Text>
            </View>
          )}
        </LinearGradient>
      </BlurCard>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 0,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  gradientOverlay: {
    padding: 16,
    minHeight: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...Typography.caption1Emphasized,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    opacity: 0.8,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
    gap: 3,
  },
  value: {
    ...Typography.mediumNumber,
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.6,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  unit: {
    ...Typography.caption1Emphasized,
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    opacity: 0.7,
  },
  progressContainer: {
    gap: 5,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  progressText: {
    ...Typography.caption2,
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.1,
    opacity: 0.7,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    gap: 3,
  },
  statusText: {
    ...Typography.caption2Emphasized,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});