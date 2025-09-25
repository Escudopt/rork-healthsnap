import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Beef, Wheat, Droplets, Zap } from 'lucide-react-native';
import { BlurCard } from './BlurCard';
import { FoodItem } from '@/types/food';
import { useTheme } from '@/providers/ThemeProvider';

interface NutritionBreakdownProps {
  foods: FoodItem[];
  title?: string;
}

export function NutritionBreakdown({ foods, title = 'Informações Nutricionais' }: NutritionBreakdownProps) {
  const { colors } = useTheme();
  const totals = foods.reduce((acc, food) => ({
    calories: acc.calories + (food.calories || 0),
    protein: acc.protein + (food.protein || 0),
    carbs: acc.carbs + (food.carbs || 0),
    fat: acc.fat + (food.fat || 0),
    sugar: acc.sugar + (food.sugar || 0),
    sodium: acc.sodium + (food.sodium || 0),
  }), {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    sugar: 0,
    sodium: 0,
  });

  // Calculate percentages for macronutrients
  const totalMacros = totals.protein + totals.carbs + totals.fat;
  const proteinPercentage = totalMacros > 0 ? (totals.protein / totalMacros) * 100 : 0;
  const carbsPercentage = totalMacros > 0 ? (totals.carbs / totalMacros) * 100 : 0;
  const fatPercentage = totalMacros > 0 ? (totals.fat / totalMacros) * 100 : 0;

  const macros = [
    {
      name: 'Proteína',
      value: totals.protein,
      percentage: proteinPercentage,
      color: '#FF6B6B',
      icon: Beef,
    },
    {
      name: 'Carboidratos',
      value: totals.carbs,
      percentage: carbsPercentage,
      color: '#4ECDC4',
      icon: Wheat,
    },
    {
      name: 'Gorduras',
      value: totals.fat,
      percentage: fatPercentage,
      color: '#FFE66D',
      icon: Droplets,
    },
  ];

  return (
    <BlurCard style={[styles.container, { backgroundColor: colors.surfaceElevated }]}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      
      {/* Enhanced Total Calories Section */}
      <View style={[styles.caloriesSection, { backgroundColor: colors.surfaceSecondary }]}>
        <View style={styles.caloriesIconContainer}>
          <Zap color="#FF6B35" size={24} strokeWidth={2.5} />
        </View>
        <View style={styles.caloriesContent}>
          <Text style={[styles.caloriesLabel, { color: colors.textSecondary }]}>Total de Calorias</Text>
          <View style={styles.caloriesValueContainer}>
            <Text style={[styles.caloriesValue, { color: colors.text }]}>
              {totals.calories.toLocaleString()}
            </Text>
            <Text style={[styles.caloriesUnit, { color: colors.textSecondary }]}>kcal</Text>
          </View>
        </View>
      </View>

      {/* Enhanced Macronutrients */}
      <View style={styles.macrosSection}>
        {macros.map((macro) => {
          const IconComponent = macro.icon;
          return (
            <View key={macro.name} style={[styles.macroItem, { backgroundColor: colors.surfaceSecondary }]}>
              <View style={styles.macroHeader}>
                <View style={[styles.macroIconContainer, { backgroundColor: macro.color }]}>
                  <IconComponent color="white" size={16} strokeWidth={2.5} />
                </View>
                <View style={styles.macroInfo}>
                  <Text style={[styles.macroLabel, { color: colors.text }]}>{macro.name}</Text>
                  <Text style={[styles.macroPercentage, { color: macro.color }]}>
                    {macro.percentage.toFixed(0)}% do total
                  </Text>
                </View>
                <Text style={[styles.macroValue, { color: colors.text }]}>
                  {macro.value.toFixed(1)}g
                </Text>
              </View>
              
              {/* Enhanced progress bar */}
              <View style={[styles.macroBar, { backgroundColor: colors.surface }]}>
                <View 
                  style={[
                    styles.macroBarFill, 
                    { 
                      width: `${macro.percentage}%`,
                      backgroundColor: macro.color,
                      shadowColor: macro.color,
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.3,
                      shadowRadius: 2,
                      elevation: 1,
                    }
                  ]} 
                >
                  {/* Inner glow effect */}
                  <View style={[
                    styles.macroBarGlow,
                    { backgroundColor: macro.color + '40' }
                  ]} />
                </View>
              </View>
            </View>
          );
        })}
      </View>

      {/* Enhanced Additional nutrients */}
      {(totals.sugar > 0 || totals.sodium > 0) && (
        <View style={[styles.additionalSection, { borderTopColor: colors.surfaceSecondary }]}>
          <Text style={[styles.additionalTitle, { color: colors.text }]}>Outros Nutrientes</Text>
          <View style={styles.additionalGrid}>
            {totals.sugar > 0 && (
              <View style={[styles.additionalItem, { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={[styles.additionalLabel, { color: colors.textSecondary }]}>Açúcar</Text>
                <Text style={[styles.additionalValue, { color: colors.text }]}>
                  {totals.sugar.toFixed(1)}g
                </Text>
              </View>
            )}
            {totals.sodium > 0 && (
              <View style={[styles.additionalItem, { backgroundColor: colors.surfaceSecondary }]}>
                <Text style={[styles.additionalLabel, { color: colors.textSecondary }]}>Sódio</Text>
                <Text style={[styles.additionalValue, { color: colors.text }]}>
                  {totals.sodium.toFixed(0)}mg
                </Text>
              </View>
            )}
          </View>
        </View>
      )}
    </BlurCard>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  
  // Enhanced Calories Section
  caloriesSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  caloriesIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FF6B35' + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  caloriesContent: {
    flex: 1,
  },
  caloriesLabel: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  caloriesValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  caloriesValue: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -1,
  },
  caloriesUnit: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Enhanced Macros Section
  macrosSection: {
    gap: 12,
    marginBottom: 20,
  },
  macroItem: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  macroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  macroIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  macroInfo: {
    flex: 1,
  },
  macroLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  macroPercentage: {
    fontSize: 12,
    fontWeight: '500',
  },
  macroValue: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  macroBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  macroBarFill: {
    height: '100%',
    borderRadius: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  macroBarGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  
  // Enhanced Additional Section
  additionalSection: {
    borderTopWidth: 1,
    paddingTop: 20,
  },
  additionalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  additionalGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  additionalItem: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  additionalLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  additionalValue: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});