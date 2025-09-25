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
        {macros.map((macro, index) => {
          const IconComponent = macro.icon;
          const barHeight = maxValue > 0 ? (macro.value / maxValue) * 120 : 0;
          
          return (
            <View key={macro.name} style={styles.barItem}>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: macro.color,
                    }
                  ]}
                />
              </View>
              <View style={styles.barLabel}>
                <IconComponent color={macro.color} size={16} strokeWidth={2} />
                <Text style={[styles.barLabelText, { color: colors.text }]}>
                  {macro.name}
                </Text>
                <Text style={[styles.barValue, { color: colors.text }]}>
                  {macro.value.toFixed(1)}g
                </Text>
                <Text style={[styles.barPercentage, { color: colors.textSecondary }]}>
                  {macro.percentage.toFixed(0)}%
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderSimplePieChart = () => {
    const size = 120;
    const strokeWidth = 8;
    
    return (
      <View style={styles.simplePieContainer}>
        <View style={[styles.simplePieChart, { width: size, height: size }]}>
          {/* Background circle */}
          <View 
            style={[
              styles.pieBackground,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                borderWidth: strokeWidth,
                borderColor: colors.surfaceSecondary,
              }
            ]}
          />
          
          {/* Simplified pie segments using border approach */}
          {macros.map((macro, index) => {
            const cumulativePercentage = macros.slice(0, index).reduce((sum, m) => sum + m.percentage, 0);
            const rotation = (cumulativePercentage / 100) * 360;
            const segmentSize = (macro.percentage / 100) * 360;
            
            // Only show segments that are large enough to be visible
            if (macro.percentage < 5) return null;
            
            return (
              <View
                key={macro.name}
                style={[
                  styles.pieSegment,
                  {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderWidth: strokeWidth,
                    borderColor: 'transparent',
                    borderTopColor: segmentSize >= 90 ? macro.color : 'transparent',
                    borderRightColor: segmentSize >= 180 ? macro.color : (segmentSize >= 90 ? macro.color : 'transparent'),
                    borderBottomColor: segmentSize >= 270 ? macro.color : (segmentSize >= 180 ? macro.color : 'transparent'),
                    borderLeftColor: segmentSize >= 360 ? macro.color : (segmentSize >= 270 ? macro.color : 'transparent'),
                    position: 'absolute',
                    transform: [
                      { rotate: `${rotation}deg` }
                    ],
                  }
                ]}
              />
            );
          })}
          
          {/* Center content */}
          <View style={styles.simplePieCenter}>
            <Text style={[styles.simplePieCenterTitle, { color: colors.text }]}>Total</Text>
            <Text style={[styles.simplePieCenterValue, { color: colors.text }]}>
              {totalMacros.toFixed(0)}g
            </Text>
          </View>
        </View>
        
        {/* Compact legend */}
        <View style={styles.compactLegend}>
          {macros.map((macro) => {
            const IconComponent = macro.icon;
            return (
              <View key={macro.name} style={styles.compactLegendItem}>
                <View style={[styles.legendDot, { backgroundColor: macro.color }]} />
                <IconComponent color={macro.color} size={12} strokeWidth={2} />
                <Text style={[styles.compactLegendText, { color: colors.text }]}>
                  {macro.name.charAt(0)}
                </Text>
                <Text style={[styles.compactLegendValue, { color: colors.textSecondary }]}>
                  {macro.percentage.toFixed(0)}%
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
      
      {chartType === 'bar' ? renderBarChart() : renderSimplePieChart()}
    </BlurCard>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  
  // Bar Chart Styles
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 180,
    paddingHorizontal: 8,
  },
  barItem: {
    alignItems: 'center',
    flex: 1,
    maxWidth: 80,
  },
  barContainer: {
    height: 120,
    width: 24,
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  bar: {
    width: '100%',
    borderRadius: 12,
    minHeight: 4,
  },
  barLabel: {
    alignItems: 'center',
    gap: 2,
  },
  barLabelText: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
  barValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  barPercentage: {
    fontSize: 10,
  },
  
  // Simple Pie Chart Styles
  simplePieContainer: {
    alignItems: 'center',
    gap: 16,
  },
  simplePieChart: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieBackground: {
    position: 'absolute',
  },
  pieSegment: {
    // Pie segment styles handled inline
  },
  simplePieCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  simplePieCenterTitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  simplePieCenterValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  compactLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 240,
  },
  compactLegendItem: {
    alignItems: 'center',
    gap: 2,
    flex: 1,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  compactLegendText: {
    fontSize: 10,
    fontWeight: '500',
  },
  compactLegendValue: {
    fontSize: 10,
  },
});