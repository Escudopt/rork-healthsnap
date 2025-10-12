import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Beef, Wheat, Droplets } from 'lucide-react-native';
import { BlurCard } from './BlurCard';
import { FoodItem } from '@/types/food';
import { useTheme } from '@/providers/ThemeProvider';

interface MacroChartProps {
  foods: FoodItem[];
  title?: string;
  chartType?: 'bar' | 'pie';
}

export function MacroChart({ foods, title = 'Distribuição de Macros', chartType = 'bar' }: MacroChartProps) {
  const { colors, isDark } = useTheme();
  
  const totals = foods.reduce((acc, food) => ({
    protein: acc.protein + (food.protein || 0),
    carbs: acc.carbs + (food.carbs || 0),
    fat: acc.fat + (food.fat || 0),
  }), {
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  const totalMacros = totals.protein + totals.carbs + totals.fat;
  
  if (totalMacros === 0) {
    return (
      <BlurCard style={[styles.container, { backgroundColor: colors.surfaceElevated }]}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Nenhum dado de macronutrientes disponível
          </Text>
        </View>
      </BlurCard>
    );
  }

  const macros = [
    {
      name: 'Carboidratos',
      value: totals.carbs,
      percentage: (totals.carbs / totalMacros) * 100,
      color: colors.text,
      icon: Wheat,
    },
    {
      name: 'Proteína',
      value: totals.protein,
      percentage: (totals.protein / totalMacros) * 100,
      color: isDark ? '#999999' : '#666666',
      icon: Beef,
    },
    {
      name: 'Gorduras',
      value: totals.fat,
      percentage: (totals.fat / totalMacros) * 100,
      color: isDark ? '#666666' : '#999999',
      icon: Droplets,
    },
  ];

  const renderBarChart = () => {
    return (
      <View style={styles.barChartContainer}>
        {macros.map((macro) => {
          return (
            <View key={macro.name} style={styles.barRow}>
              <Text style={[styles.barLabel, { color: colors.text }]}>
                {macro.name}
              </Text>
              <View style={styles.barTrack}>
                <View 
                  style={[
                    styles.barFill,
                    {
                      width: `${macro.percentage}%`,
                      backgroundColor: macro.color,
                    }
                  ]}
                />
              </View>
              <Text style={[styles.barValue, { color: colors.text }]}>
                {macro.value.toFixed(0)}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  const renderEnhancedPieChart = () => {
    const size = 120;
    const strokeWidth = 8;
    
    return (
      <View style={styles.enhancedPieContainer}>
        <View style={[styles.enhancedPieChart, { width: size, height: size }]}>
          {/* Background circle with subtle shadow */}
          <View 
            style={[
              styles.pieBackground,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: colors.surfaceSecondary,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.08,
                shadowRadius: 2,
                elevation: 1,
              }
            ]}
          />
          
          {/* Simple pie representation using border trick */}
          {macros.map((macro, index) => {
            const cumulativePercentage = macros.slice(0, index).reduce((sum, m) => sum + m.percentage, 0);
            const rotation = (cumulativePercentage / 100) * 360;
            
            // Only show segments that are large enough to be visible
            if (macro.percentage < 5) return null;
            
            return (
              <View
                key={macro.name}
                style={[
                  styles.pieSegment,
                  {
                    width: size - strokeWidth,
                    height: size - strokeWidth,
                    borderRadius: (size - strokeWidth) / 2,
                    borderWidth: strokeWidth,
                    borderColor: macro.color,
                    position: 'absolute',
                    top: strokeWidth / 2,
                    left: strokeWidth / 2,
                    transform: [{ rotate: `${rotation}deg` }],
                    opacity: 0.9,
                  }
                ]}
              />
            );
          })}
          
          {/* Enhanced center content */}
          <View style={[styles.enhancedPieCenter, { backgroundColor: colors.surface }]}>
            <Text style={[styles.pieCenterTitle, { color: colors.textSecondary }]}>Total</Text>
            <Text style={[styles.pieCenterValue, { color: colors.text }]}>
              {totalMacros.toFixed(0)}
            </Text>
            <Text style={[styles.pieCenterUnit, { color: colors.textSecondary }]}>g</Text>
          </View>
        </View>
        
        {/* Compact legend */}
        <View style={styles.compactLegend}>
          {macros.map((macro) => {
            return (
              <View key={macro.name} style={styles.compactLegendItem}>
                <View style={[styles.compactLegendDot, { backgroundColor: macro.color }]} />
                <Text style={[styles.compactLegendText, { color: colors.text }]}>
                  {macro.name}
                </Text>
                <Text style={[styles.compactLegendValue, { color: colors.textSecondary }]}>
                  {macro.value.toFixed(0)}g
                </Text>
                <Text style={[styles.compactLegendPercentage, { color: macro.color }]}>
                  ({macro.percentage.toFixed(0)}%)
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { 
      backgroundColor: colors.surfaceElevated,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.05,
      shadowRadius: isDark ? 8 : 12,
      elevation: isDark ? 3 : 2,
      borderWidth: isDark ? 0 : 0.5,
      borderColor: isDark ? 'transparent' : 'rgba(0, 0, 0, 0.05)',
    }]}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      
      {chartType === 'bar' ? renderBarChart() : renderEnhancedPieChart()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
    marginBottom: 14,
    borderRadius: 14,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  
  barChartContainer: {
    gap: 10,
  },
  barRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
  },
  barLabel: {
    fontSize: 13,
    fontWeight: '500',
    width: 90,
  },
  barTrack: {
    flex: 1,
    height: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 9,
    overflow: 'hidden' as const,
  },
  barFill: {
    height: '100%',
    borderRadius: 9,
  },
  barValue: {
    fontSize: 13,
    fontWeight: '600',
    width: 40,
    textAlign: 'right' as const,
  },
  
  // Improved Pie Chart Styles
  enhancedPieContainer: {
    alignItems: 'center',
    gap: 16,
  },
  enhancedPieChart: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieBackground: {
    position: 'absolute',
  },
  pieSegment: {
    position: 'absolute',
  },
  enhancedPieCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  pieCenterTitle: {
    fontSize: 9,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 1,
  },
  pieCenterValue: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  pieCenterUnit: {
    fontSize: 8,
    fontWeight: '400',
    marginTop: 1,
  },
  compactLegend: {
    width: '100%',
    gap: 6,
  },
  compactLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  compactLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  compactLegendText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  compactLegendValue: {
    fontSize: 11,
    fontWeight: '400',
  },
  compactLegendPercentage: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
});