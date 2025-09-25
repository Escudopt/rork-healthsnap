import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Beef, Wheat, Droplets } from 'lucide-react-native';
import { BlurCard } from './BlurCard';
import { FoodItem } from '@/types/food';

interface NutritionBreakdownProps {
  foods: FoodItem[];
  title?: string;
}

export function NutritionBreakdown({ foods, title = 'Informações Nutricionais' }: NutritionBreakdownProps) {
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

  return (
    <BlurCard style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      {/* Total Calories */}
      <View style={styles.caloriesSection}>
        <Text style={styles.caloriesValue}>{totals.calories}</Text>
        <Text style={styles.caloriesUnit}>kcal</Text>
      </View>

      {/* Macronutrients */}
      <View style={styles.macrosSection}>
        <View style={styles.macroItem}>
          <View style={styles.macroHeader}>
            <Beef color="#FF6B6B" size={20} />
            <Text style={styles.macroLabel}>Proteína</Text>
          </View>
          <Text style={styles.macroValue}>{totals.protein.toFixed(1)}g</Text>
          <View style={styles.macroBar}>
            <View 
              style={[
                styles.macroBarFill, 
                { 
                  width: `${proteinPercentage}%`,
                  backgroundColor: '#FF6B6B'
                }
              ]} 
            />
          </View>
          <Text style={styles.macroPercentage}>{proteinPercentage.toFixed(0)}%</Text>
        </View>

        <View style={styles.macroItem}>
          <View style={styles.macroHeader}>
            <Wheat color="#4ECDC4" size={20} />
            <Text style={styles.macroLabel}>Carboidratos</Text>
          </View>
          <Text style={styles.macroValue}>{totals.carbs.toFixed(1)}g</Text>
          <View style={styles.macroBar}>
            <View 
              style={[
                styles.macroBarFill, 
                { 
                  width: `${carbsPercentage}%`,
                  backgroundColor: '#4ECDC4'
                }
              ]} 
            />
          </View>
          <Text style={styles.macroPercentage}>{carbsPercentage.toFixed(0)}%</Text>
        </View>

        <View style={styles.macroItem}>
          <View style={styles.macroHeader}>
            <Droplets color="#FFE66D" size={20} />
            <Text style={styles.macroLabel}>Gorduras</Text>
          </View>
          <Text style={styles.macroValue}>{totals.fat.toFixed(1)}g</Text>
          <View style={styles.macroBar}>
            <View 
              style={[
                styles.macroBarFill, 
                { 
                  width: `${fatPercentage}%`,
                  backgroundColor: '#FFE66D'
                }
              ]} 
            />
          </View>
          <Text style={styles.macroPercentage}>{fatPercentage.toFixed(0)}%</Text>
        </View>
      </View>

      {/* Additional nutrients */}
      {(totals.sugar > 0 || totals.sodium > 0) && (
        <View style={styles.additionalSection}>
          <Text style={styles.additionalTitle}>Outros Nutrientes</Text>
          {totals.sugar > 0 && (
            <View style={styles.additionalItem}>
              <Text style={styles.additionalLabel}>Açúcar</Text>
              <Text style={styles.additionalValue}>{totals.sugar.toFixed(1)}g</Text>
            </View>
          )}
          {totals.sodium > 0 && (
            <View style={styles.additionalItem}>
              <Text style={styles.additionalLabel}>Sódio</Text>
              <Text style={styles.additionalValue}>{totals.sodium.toFixed(0)}mg</Text>
            </View>
          )}
        </View>
      )}
    </BlurCard>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    textAlign: 'center',
  },
  caloriesSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  caloriesValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  caloriesUnit: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  macrosSection: {
    gap: 16,
    marginBottom: 20,
  },
  macroItem: {
    gap: 8,
  },
  macroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  macroLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    flex: 1,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'right',
    marginTop: -24,
  },
  macroBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  macroBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  macroPercentage: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'right',
  },
  additionalSection: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 16,
  },
  additionalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 12,
  },
  additionalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  additionalLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  additionalValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
});