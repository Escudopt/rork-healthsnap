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
  const { colors } = useTheme();
  
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
      name: 'Proteína',
      value: totals.protein,
      percentage: (totals.protein / totalMacros) * 100,
      color: '#FF6B6B',
      icon: Beef,
    },
    {
      name: 'Carboidratos',
      value: totals.carbs,
      percentage: (totals.carbs / totalMacros) * 100,
      color: '#4ECDC4',
      icon: Wheat,
    },
    {
      name: 'Gorduras',
      value: totals.fat,
      percentage: (totals.fat / totalMacros) * 100,
      color: '#FFE66D',
      icon: Droplets,
    },
  ].sort((a, b) => b.percentage - a.percentage);

  const renderBarChart = () => {
    const maxValue = Math.max(...macros.map(m => m.value));
    
    return (
      <View style={styles.barChartContainer}>
        <View style={styles.barsRow}>
          {macros.map((macro, index) => {
            const barHeight = maxValue > 0 ? (macro.value / maxValue) * 100 : 0;
            
            return (
              <View key={macro.name} style={styles.barItem}>
                <View style={styles.barContainer}>
                  {/* Background bar */}
                  <View style={[styles.barBackground, { backgroundColor: colors.surfaceSecondary }]} />
                  {/* Animated bar with gradient effect */}
                  <View 
                    style={[
                      styles.bar,
                      {
                        height: `${barHeight}%`,
                        backgroundColor: macro.color,
                        shadowColor: macro.color,
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 3,
                        elevation: 2,
                      }
                    ]}
                  >
                    {/* Inner glow effect */}
                    <View style={[
                      styles.barGlow,
                      { backgroundColor: macro.color + '30' }
                    ]} />
                  </View>
                </View>
                <View style={styles.barValueLabel}>
                  <Text style={[styles.barValue, { color: colors.text }]}>
                    {macro.value.toFixed(0)}g
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
        
        {/* Legend below bars */}
        <View style={styles.barLegend}>
          {macros.map((macro) => {
            const IconComponent = macro.icon;
            return (
              <View key={macro.name} style={styles.barLegendItem}>
                <View style={[styles.barLegendIcon, { backgroundColor: macro.color }]}>
                  <IconComponent color="white" size={12} strokeWidth={2.5} />
                </View>
                <Text style={[styles.barLegendText, { color: colors.text }]}>
                  {macro.name}
                </Text>
                <Text style={[styles.barLegendPercentage, { color: macro.color }]}>
                  {macro.percentage.toFixed(0)}%
                </Text>
              </View>
            );
          })}
        </View>
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
    <BlurCard style={[styles.container, { backgroundColor: colors.surfaceElevated }]}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      
      {chartType === 'bar' ? renderBarChart() : renderEnhancedPieChart()}
    </BlurCard>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  
  // Improved Bar Chart Styles
  barChartContainer: {
    gap: 16,
  },
  barsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 100,
    paddingHorizontal: 8,
  },
  barItem: {
    alignItems: 'center',
    flex: 1,
    maxWidth: 60,
  },
  barContainer: {
    height: 80,
    width: 20,
    justifyContent: 'flex-end',
    marginBottom: 8,
    position: 'relative',
  },
  barBackground: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '100%',
    borderRadius: 10,
    opacity: 0.15,
  },
  bar: {
    width: '100%',
    borderRadius: 10,
    minHeight: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  barGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  barValueLabel: {
    alignItems: 'center',
  },
  barValue: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  barLegend: {
    gap: 8,
    paddingTop: 8,
  },
  barLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  barLegendIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  barLegendText: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  barLegendPercentage: {
    fontSize: 12,
    fontWeight: '600',
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