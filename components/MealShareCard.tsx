import React from 'react';
import { StyleSheet, Text, View, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Meal } from '@/types/food';
import { Flame, Activity, Beef, Wheat, Droplets } from 'lucide-react-native';

interface MealShareCardProps {
  meal: Meal;
}

export const MealShareCard = React.forwardRef<View, MealShareCardProps>(
  ({ meal }, ref) => {
    const macros = meal.foods.reduce(
      (acc, food) => ({
        protein: acc.protein + (food.protein || 0),
        carbs: acc.carbs + (food.carbs || 0),
        fat: acc.fat + (food.fat || 0),
      }),
      { protein: 0, carbs: 0, fat: 0 }
    );

    const timeInfo = new Date(meal.timestamp).toLocaleString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <View ref={ref} style={styles.container}>
        <LinearGradient
          colors={['#10B981', '#059669', '#047857']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <View style={styles.appBranding}>
              <View style={styles.logoCircle}>
                <Activity color="#FFFFFF" size={24} strokeWidth={2.5} />
              </View>
              <Text style={styles.appName}>NutriTrack</Text>
            </View>
            <Text style={styles.date}>{timeInfo}</Text>
          </View>

          <View style={styles.mainContent}>
            {meal.imageBase64 && (
              <View style={styles.imageContainer}>
                <Image
                  source={{
                    uri: meal.imageBase64.startsWith('data:')
                      ? meal.imageBase64
                      : `data:image/jpeg;base64,${meal.imageBase64}`,
                  }}
                  style={styles.mealImage}
                  resizeMode="cover"
                />
              </View>
            )}

            <View style={styles.mealInfo}>
              <Text style={styles.mealType}>{meal.mealType || 'Refeição'}</Text>
              <View style={styles.caloriesDisplay}>
                <Flame color="#FFFFFF" size={40} strokeWidth={2} />
                <Text style={styles.caloriesValue}>{meal.totalCalories}</Text>
                <Text style={styles.caloriesUnit}>kcal</Text>
              </View>
            </View>

            <View style={styles.foodsList}>
              <Text style={styles.foodsTitle}>Alimentos</Text>
              <View style={styles.foodsGrid}>
                {meal.foods.slice(0, 4).map((food, index) => (
                  <View key={index} style={styles.foodItem}>
                    <Text style={styles.foodName} numberOfLines={1}>
                      • {food.name}
                    </Text>
                    <Text style={styles.foodCalories}>{food.calories} kcal</Text>
                  </View>
                ))}
                {meal.foods.length > 4 && (
                  <Text style={styles.moreItems}>
                    +{meal.foods.length - 4} mais...
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.macrosSection}>
              <Text style={styles.macrosTitle}>Macronutrientes</Text>
              <View style={styles.macrosGrid}>
                <View style={styles.macroItem}>
                  <Beef color="#FFFFFF" size={20} strokeWidth={2} />
                  <Text style={styles.macroValue}>{macros.protein.toFixed(0)}g</Text>
                  <Text style={styles.macroLabel}>Proteína</Text>
                </View>
                <View style={styles.macroItem}>
                  <Wheat color="#FFFFFF" size={20} strokeWidth={2} />
                  <Text style={styles.macroValue}>{macros.carbs.toFixed(0)}g</Text>
                  <Text style={styles.macroLabel}>Carboidratos</Text>
                </View>
                <View style={styles.macroItem}>
                  <Droplets color="#FFFFFF" size={20} strokeWidth={2} />
                  <Text style={styles.macroValue}>{macros.fat.toFixed(0)}g</Text>
                  <Text style={styles.macroLabel}>Gorduras</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.divider} />
            <Text style={styles.hashtags}>#nutrição #saúde #fitness</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }
);

MealShareCard.displayName = 'MealShareCard';

const styles = StyleSheet.create({
  container: {
    width: 1080,
    height: 1920,
    backgroundColor: '#FFFFFF',
  },
  gradient: {
    flex: 1,
    padding: 60,
  },
  header: {
    marginBottom: 50,
  },
  appBranding: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  appName: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  date: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
    gap: 40,
  },
  imageContainer: {
    width: '100%',
    height: 500,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  mealImage: {
    width: '100%',
    height: '100%',
  },
  mealInfo: {
    alignItems: 'center',
    gap: 20,
  },
  mealType: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  caloriesDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 40,
    paddingVertical: 24,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  caloriesValue: {
    fontSize: 72,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 72,
  },
  caloriesUnit: {
    fontSize: 32,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 8,
  },
  foodsList: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    padding: 32,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  foodsTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  foodsGrid: {
    gap: 12,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  foodName: {
    fontSize: 26,
    color: '#FFFFFF',
    fontWeight: '500',
    flex: 1,
    marginRight: 16,
  },
  foodCalories: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
  },
  moreItems: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.8)',
    fontStyle: 'italic',
    marginTop: 8,
  },
  macrosSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    padding: 32,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  macrosTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 24,
    textAlign: 'center',
  },
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  macroItem: {
    alignItems: 'center',
    gap: 12,
  },
  macroValue: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  macroLabel: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    textAlign: 'center',
  },
  footer: {
    paddingTop: 30,
  },
  divider: {
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginBottom: 20,
  },
  hashtags: {
    fontSize: 26,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    textAlign: 'center',
  },
});
