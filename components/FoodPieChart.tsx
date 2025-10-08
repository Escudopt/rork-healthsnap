import React, { useMemo } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { useCalorieTracker } from '@/providers/CalorieTrackerProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { PieChart } from 'lucide-react-native';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';

interface FoodData {
  name: string;
  count: number;
  totalCalories: number;
  percentage: number;
  color: string;
}

const CHART_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#FFA07A',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E2',
];

export function FoodPieChart() {
  const { meals } = useCalorieTracker();
  const { colors, isDark } = useTheme();

  const foodData = useMemo(() => {
    const foodMap = new Map<string, { count: number; totalCalories: number }>();

    meals.forEach(meal => {
      meal.foods.forEach(food => {
        const existing = foodMap.get(food.name);
        if (existing) {
          existing.count += 1;
          existing.totalCalories += food.calories;
        } else {
          foodMap.set(food.name, {
            count: 1,
            totalCalories: food.calories,
          });
        }
      });
    });

    const sortedFoods = Array.from(foodMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 8);

    const totalCalories = sortedFoods.reduce((sum, [, data]) => sum + data.totalCalories, 0);

    return sortedFoods.map(([name, data], index) => ({
      name,
      count: data.count,
      totalCalories: data.totalCalories,
      percentage: (data.totalCalories / totalCalories) * 100,
      color: CHART_COLORS[index % CHART_COLORS.length],
    }));
  }, [meals]);

  if (foodData.length === 0) {
    return null;
  }

  const styles = createStyles(colors, isDark);

  const size = 200;
  const strokeWidth = 30;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let currentAngle = -90;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <PieChart color={colors.primary} size={16} strokeWidth={2} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>
          Distribuição de Alimentos
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.chartContainer}>
          <Svg width={size} height={size}>
            <G rotation={0} origin={`${center}, ${center}`}>
              {foodData.map((food, index) => {
                const angle = (food.percentage / 100) * 360;
                const startAngle = currentAngle;
                currentAngle += angle;

                const x1 = center + radius * Math.cos((startAngle * Math.PI) / 180);
                const y1 = center + radius * Math.sin((startAngle * Math.PI) / 180);
                const x2 = center + radius * Math.cos((currentAngle * Math.PI) / 180);
                const y2 = center + radius * Math.sin((currentAngle * Math.PI) / 180);

                const largeArcFlag = angle > 180 ? 1 : 0;

                const pathData = [
                  `M ${center} ${center}`,
                  `L ${x1} ${y1}`,
                  `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                  'Z',
                ].join(' ');

                return (
                  <G key={food.name}>
                    <Circle
                      cx={center}
                      cy={center}
                      r={radius}
                      fill="none"
                      stroke={food.color}
                      strokeWidth={strokeWidth}
                      strokeDasharray={`${(food.percentage / 100) * circumference} ${circumference}`}
                      strokeDashoffset={-((startAngle + 90) / 360) * circumference}
                      rotation={0}
                      origin={`${center}, ${center}`}
                    />
                  </G>
                );
              })}
            </G>
          </Svg>
        </View>

        <View style={styles.legend}>
          {foodData.map((food) => (
            <View key={food.name} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: food.color }]} />
              <View style={styles.legendInfo}>
                <Text style={[styles.legendName, { color: colors.text }]} numberOfLines={1}>
                  {food.name}
                </Text>
                <Text style={[styles.legendStats, { color: colors.textSecondary }]}>
                  {food.count}x • {Math.round(food.percentage)}%
                </Text>
              </View>
              <Text style={[styles.legendCalories, { color: colors.text }]}>
                {Math.round(food.totalCalories)} kcal
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    marginTop: 10,
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: isDark ? 'rgba(22, 24, 33, 0.6)' : 'rgba(255, 255, 255, 0.7)',
    borderWidth: 0.5,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
    shadowColor: isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(0, 122, 255, 0.08)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.08,
    shadowRadius: isDark ? 8 : 12,
    elevation: isDark ? 4 : 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
  },
  headerIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  content: {
    padding: 16,
    gap: 16,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  legend: {
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendInfo: {
    flex: 1,
  },
  legendName: {
    fontSize: 13,
    fontWeight: '500' as const,
    marginBottom: 2,
    letterSpacing: -0.1,
  },
  legendStats: {
    fontSize: 11,
    fontWeight: '400' as const,
  },
  legendCalories: {
    fontSize: 13,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
  },
});
