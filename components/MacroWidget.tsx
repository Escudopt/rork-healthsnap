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
    shortName: 'Prot',
    icon: Beef,
    color: '#FF6B6B',
    lightColor: '#FFE5E5',
    gradientColors: ['#FF6B6B', '#FF8E8E'],
    unit: 'g',
    defaultGoal: 120,
  },
  carbs: {
    name: 'Carboidratos',
    shortName: 'Carb',
    icon: Wheat,
    color: '#4ECDC4',
    lightColor: '#E5F9F7',
    gradientColors: ['#4ECDC4', '#6FE6DD'],
    unit: 'g',
    defaultGoal: 200,
  },
  fat: {
    name: 'Gorduras',
    shortName: 'Gord',
    icon: Droplets,
    color: '#FFB800',
    lightColor: '#FFF4E5',
    gradientColors: ['#FFB800', '#FFCC33'],
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
        <View style={styles.cardContent}>
          {/* Enhanced Header */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: config.color + '15' }]}>
              <IconComponent 
                color={config.color} 
                size={14} 
                strokeWidth={2.5} 
              />
            </View>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, { color: colors.textTertiary }]}>
                {config.shortName}
              </Text>
              <View style={[styles.statusDot, { 
                backgroundColor: isOverGoal ? '#FF6B6B' : percentage >= 80 ? config.color : colors.textTertiary 
              }]} />
            </View>
          </View>
          
          {/* Enhanced Value Display */}
          <View style={styles.valueSection}>
            <View style={styles.valueContainer}>
              <Text style={[styles.value, { color: colors.text }]}>
                {currentValue.toFixed(0)}
              </Text>
              <Text style={[styles.unit, { color: colors.textSecondary }]}>
                {config.unit}
              </Text>
            </View>
            <Text style={[styles.goalText, { color: colors.textTertiary }]}>
              de {targetGoal}{config.unit}
            </Text>
          </View>
          
          {/* Enhanced Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={[styles.progressTrack, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)' }]}>
              <View 
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(percentage, 100)}%`,
                    backgroundColor: isOverGoal ? '#FF6B6B' : config.color,
                    shadowColor: isOverGoal ? '#FF6B6B' : config.color,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.3,
                    shadowRadius: 2,
                  }
                ]} 
              />
            </View>
            <View style={styles.progressInfo}>
              <Text style={[styles.progressPercentage, { color: colors.text }]}>
                {Math.round(percentage)}%
              </Text>
              {isOverGoal && (
                <View style={styles.overGoalIndicator}>
                  <TrendingUp color="#FF6B6B" size={10} strokeWidth={2.5} />
                </View>
              )}
            </View>
          </View>
        </View>
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
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  cardContent: {
    padding: 16,
    minHeight: 110,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    ...Typography.caption1Emphasized,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    opacity: 0.7,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  valueSection: {
    marginBottom: 12,
    gap: 2,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  value: {
    ...Typography.mediumNumber,
    fontSize: 22,
    fontWeight: '600',
    letterSpacing: -0.4,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  unit: {
    ...Typography.caption1Emphasized,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    opacity: 0.6,
  },
  goalText: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.2,
    opacity: 0.6,
  },
  progressContainer: {
    gap: 8,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
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
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  overGoalIndicator: {
    padding: 2,
  },
});