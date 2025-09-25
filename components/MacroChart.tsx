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
                {/* Background bar */}
                <View style={[styles.barBackground, { backgroundColor: colors.surfaceSecondary }]} />
                {/* Animated bar with gradient effect */}
                <View 
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: macro.color,
                      shadowColor: macro.color,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.3,
                      shadowRadius: 4,
                      elevation: 3,
                    }
                  ]}
                >
                  {/* Inner glow effect */}
                  <View style={[
                    styles.barGlow,
                    { backgroundColor: macro.color + '40' }
                  ]} />
                </View>
              </View>
              <View style={styles.barLabel}>
                <View style={[styles.barIconContainer, { backgroundColor: macro.color + '15' }]}>
                  <IconComponent color={macro.color} size={14} strokeWidth={2.5} />
                </View>
                <Text style={[styles.barLabelText, { color: colors.text }]}>
                  {macro.name}
                </Text>
                <Text style={[styles.barValue, { color: colors.text }]}>
                  {macro.value.toFixed(1)}g
                </Text>
                <View style={[styles.percentageBadge, { backgroundColor: macro.color }]}>
                  <Text style={styles.percentageBadgeText}>
                    {macro.percentage.toFixed(0)}%
                  </Text>
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderEnhancedPieChart = () => {
    const size = 140;
    const strokeWidth = 12;
    
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
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 2,
              }
            ]}
          />
          
          {/* Enhanced pie segments with better visual representation */}
          {macros.map((macro, index) => {
            const cumulativePercentage = macros.slice(0, index).reduce((sum, m) => sum + m.percentage, 0);
            const rotation = (cumulativePercentage / 100) * 360;
            const segmentAngle = (macro.percentage / 100) * 360;
            
            // Only show segments that are large enough to be visible
            if (macro.percentage < 3) return null;
            
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
                    position: 'absolute',
                    transform: [{ rotate: `${rotation}deg` }],
                  }
                ]}
              >
                {/* Create segment using multiple borders for better control */}
                <View style={[
                  styles.pieSegmentInner,
                  {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderWidth: strokeWidth,
                    borderColor: 'transparent',
                    borderTopColor: segmentAngle >= 90 ? macro.color : 'transparent',
                    borderRightColor: segmentAngle >= 180 ? macro.color : (segmentAngle >= 90 ? macro.color : 'transparent'),
                    borderBottomColor: segmentAngle >= 270 ? macro.color : (segmentAngle >= 180 ? macro.color : 'transparent'),
                    borderLeftColor: segmentAngle >= 360 ? macro.color : (segmentAngle >= 270 ? macro.color : 'transparent'),
                  }
                ]} />
              </View>
            );
          })}
          
          {/* Enhanced center content */}
          <View style={[styles.enhancedPieCenter, { backgroundColor: colors.surface }]}>
            <Text style={[styles.pieCenterTitle, { color: colors.textSecondary }]}>Total</Text>
            <Text style={[styles.pieCenterValue, { color: colors.text }]}>
              {totalMacros.toFixed(0)}
            </Text>
            <Text style={[styles.pieCenterUnit, { color: colors.textSecondary }]}>gramas</Text>
          </View>
        </View>
        
        {/* Enhanced legend with better spacing */}
        <View style={styles.enhancedLegend}>
          {macros.map((macro) => {
            const IconComponent = macro.icon;
            return (
              <View key={macro.name} style={[styles.legendItem, { backgroundColor: colors.surfaceSecondary }]}>
                <View style={styles.legendItemContent}>
                  <View style={[styles.legendIconContainer, { backgroundColor: macro.color }]}>
                    <IconComponent color="white" size={12} strokeWidth={2.5} />
                  </View>
                  <View style={styles.legendTextContainer}>
                    <Text style={[styles.legendItemName, { color: colors.text }]}>
                      {macro.name}
                    </Text>
                    <View style={styles.legendItemStats}>
                      <Text style={[styles.legendItemValue, { color: colors.text }]}>
                        {macro.value.toFixed(1)}g
                      </Text>
                      <Text style={[styles.legendItemPercentage, { color: macro.color }]}>
                        {macro.percentage.toFixed(0)}%
                      </Text>
                    </View>
                  </View>
                </View>
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
  
  // Enhanced Bar Chart Styles
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 200,
    paddingHorizontal: 12,
    paddingTop: 16,
  },
  barItem: {
    alignItems: 'center',
    flex: 1,
    maxWidth: 90,
  },
  barContainer: {
    height: 120,
    width: 28,
    justifyContent: 'flex-end',
    marginBottom: 12,
    position: 'relative',
  },
  barBackground: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: '100%',
    borderRadius: 14,
    opacity: 0.2,
  },
  bar: {
    width: '100%',
    borderRadius: 14,
    minHeight: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  barGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '30%',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  barLabel: {
    alignItems: 'center',
    gap: 4,
  },
  barIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  barLabelText: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  barValue: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  percentageBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  percentageBadgeText: {
    color: 'white',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  
  // Enhanced Pie Chart Styles
  enhancedPieContainer: {
    alignItems: 'center',
    gap: 20,
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
  pieSegmentInner: {
    // Segment inner styles handled inline
  },
  enhancedPieCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  pieCenterTitle: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  pieCenterValue: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  pieCenterUnit: {
    fontSize: 9,
    fontWeight: '500',
    marginTop: 1,
  },
  enhancedLegend: {
    width: '100%',
    gap: 8,
  },
  legendItem: {
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  legendItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legendIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendTextContainer: {
    flex: 1,
  },
  legendItemName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  legendItemStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendItemValue: {
    fontSize: 12,
    fontWeight: '500',
  },
  legendItemPercentage: {
    fontSize: 12,
    fontWeight: '700',
  },
});