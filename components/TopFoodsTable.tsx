import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView, Platform } from 'react-native';
import { useCalorieTracker } from '@/providers/CalorieTrackerProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { TrendingUp, Award } from 'lucide-react-native';

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
      .slice(0, 10);
  }, [meals]);

  if (topFoods.length === 0) {
    return null;
  }

  const styles = createStyles(colors, isDark);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <TrendingUp color={colors.primary} size={18} strokeWidth={2} />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>
          Alimentos Mais Ingeridos
        </Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.table}>
          <View style={[styles.tableHeader, { backgroundColor: colors.surfaceSecondary }]}>
            <View style={styles.rankColumn}>
              <Text style={[styles.headerText, { color: colors.textSecondary }]}>#</Text>
            </View>
            <View style={styles.nameColumn}>
              <Text style={[styles.headerText, { color: colors.textSecondary }]}>Alimento</Text>
            </View>
            <View style={styles.countColumn}>
              <Text style={[styles.headerText, { color: colors.textSecondary }]}>Vezes</Text>
            </View>
            <View style={styles.caloriesColumn}>
              <Text style={[styles.headerText, { color: colors.textSecondary }]}>Calorias Médias</Text>
            </View>
            <View style={styles.totalColumn}>
              <Text style={[styles.headerText, { color: colors.textSecondary }]}>Total</Text>
            </View>
          </View>

          {topFoods.map((food, index) => (
            <View 
              key={food.name} 
              style={[
                styles.tableRow,
                { 
                  backgroundColor: index % 2 === 0 
                    ? colors.surface 
                    : colors.surfaceElevated 
                }
              ]}
            >
              <View style={styles.rankColumn}>
                {index < 3 ? (
                  <View style={[
                    styles.medalBadge,
                    { backgroundColor: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32' }
                  ]}>
                    <Award color="white" size={12} strokeWidth={2.5} />
                  </View>
                ) : (
                  <Text style={[styles.rankText, { color: colors.textSecondary }]}>
                    {index + 1}
                  </Text>
                )}
              </View>
              <View style={styles.nameColumn}>
                <Text 
                  style={[styles.nameText, { color: colors.text }]}
                  numberOfLines={2}
                >
                  {food.name}
                </Text>
              </View>
              <View style={styles.countColumn}>
                <View style={[styles.countBadge, { backgroundColor: colors.primary + '15' }]}>
                  <Text style={[styles.countText, { color: colors.primary }]}>
                    {food.count}x
                  </Text>
                </View>
              </View>
              <View style={styles.caloriesColumn}>
                <Text style={[styles.caloriesText, { color: colors.text }]}>
                  {Math.round(food.avgCalories)}
                </Text>
                <Text style={[styles.unitText, { color: colors.textSecondary }]}>
                  kcal
                </Text>
              </View>
              <View style={styles.totalColumn}>
                <Text style={[styles.totalText, { color: colors.text }]}>
                  {Math.round(food.totalCalories)}
                </Text>
                <Text style={[styles.unitText, { color: colors.textSecondary }]}>
                  kcal
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.surfaceSecondary }]}>
        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          Mostrando os {topFoods.length} alimentos mais consumidos
        </Text>
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  table: {
    minWidth: 600,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 2,
    alignItems: 'center',
  },
  rankColumn: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameColumn: {
    flex: 1,
    minWidth: 180,
    paddingHorizontal: 8,
  },
  countColumn: {
    width: 70,
    alignItems: 'center',
  },
  caloriesColumn: {
    width: 100,
    alignItems: 'center',
  },
  totalColumn: {
    width: 100,
    alignItems: 'center',
  },
  headerText: {
    fontSize: 11,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  medalBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  nameText: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 18,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  countText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  caloriesText: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  totalText: {
    fontSize: 15,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  unitText: {
    fontSize: 10,
    fontWeight: '500' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.3,
  },
  footer: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
  },
  footerText: {
    fontSize: 11,
    fontWeight: '500' as const,
    textAlign: 'center' as const,
    fontStyle: 'italic' as const,
  },
});
