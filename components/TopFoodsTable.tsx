import React, { useMemo } from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { useCalorieTracker } from '@/providers/CalorieTrackerProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { TrendingUp } from 'lucide-react-native';

interface FoodFrequency {
  name: string;
  count: number;
  totalCalories: number;
  avgCalories: number;
}

export function TopFoodsTable() {
  const { meals } = useCalorieTracker();
  const { colors, isDark } = useTheme();

  const topFoods = useMemo(() => {
    const foodMap = new Map<string, FoodFrequency>();

    meals.forEach(meal => {
      meal.foods.forEach(food => {
        const existing = foodMap.get(food.name);
        if (existing) {
          existing.count += 1;
          existing.totalCalories += food.calories;
          existing.avgCalories = existing.totalCalories / existing.count;
        } else {
          foodMap.set(food.name, {
            name: food.name,
            count: 1,
            totalCalories: food.calories,
            avgCalories: food.calories,
          });
        }
      });
    });

    return Array.from(foodMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [meals]);

  if (topFoods.length === 0) {
    return null;
  }

  const styles = createStyles(colors, isDark);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <TrendingUp color={colors.primary} size={16} strokeWidth={2} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>
          Top 5 Alimentos
        </Text>
      </View>

      <View style={styles.compactList}>
        {topFoods.map((food, index) => (
          <View 
            key={food.name} 
            style={[
              styles.compactRow,
              { borderBottomColor: colors.surfaceSecondary }
            ]}
          >
            <View style={styles.compactLeft}>
              {index < 3 ? (
                <View style={[
                  styles.compactMedal,
                  { backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32' }
                ]}>
                  <Text style={styles.compactMedalText}>{index + 1}</Text>
                </View>
              ) : (
                <View style={[styles.compactRank, { backgroundColor: colors.surfaceSecondary }]}>
                  <Text style={[styles.compactRankText, { color: colors.textSecondary }]}>
                    {index + 1}
                  </Text>
                </View>
              )}
              <View style={styles.compactInfo}>
                <Text 
                  style={[styles.compactName, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {food.name}
                </Text>
                <Text style={[styles.compactStats, { color: colors.textSecondary }]}>
                  {food.count}x • {Math.round(food.avgCalories)} kcal
                </Text>
              </View>
            </View>
            <View style={styles.compactRight}>
              <Text style={[styles.compactTotal, { color: colors.text }]}>
                {Math.round(food.totalCalories)}
              </Text>
              <Text style={[styles.compactUnit, { color: colors.textSecondary }]}>
                kcal
              </Text>
            </View>
          </View>
        ))}
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
  compactList: {
    paddingVertical: 4,
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
  },
  compactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  compactMedal: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactMedalText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700' as const,
  },
  compactRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  compactRankText: {
    fontSize: 11,
    fontWeight: '600' as const,
  },
  compactInfo: {
    flex: 1,
  },
  compactName: {
    fontSize: 13,
    fontWeight: '500' as const,
    marginBottom: 2,
    letterSpacing: -0.1,
  },
  compactStats: {
    fontSize: 11,
    fontWeight: '400' as const,
  },
  compactRight: {
    alignItems: 'flex-end',
  },
  compactTotal: {
    fontSize: 15,
    fontWeight: '600' as const,
    letterSpacing: -0.3,
  },
  compactUnit: {
    fontSize: 10,
    fontWeight: '400' as const,
    marginTop: 1,
  },
});
