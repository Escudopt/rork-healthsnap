import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { 
  ChevronLeft, 
  Clock, 
  Utensils,
  Zap,
  Activity,
  Target,
  TrendingUp,
  Droplets,
  Wheat,
  Beef
} from 'lucide-react-native';
import { BlurCard } from '@/components/BlurCard';
import { useCalorieTracker } from '@/providers/CalorieTrackerProvider';
import { FoodItem } from '@/types/food';

export default function MealDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { meals } = useCalorieTracker();
  
  const meal = useMemo(() => {
    return meals.find(m => m.id === id);
  }, [meals, id]);
  
  const nutritionTotals = useMemo(() => {
    if (!meal) return null;
    
    return meal.foods.reduce((totals, food) => {
      return {
        calories: totals.calories + (food.calories || 0),
        protein: totals.protein + (food.protein || 0),
        carbs: totals.carbs + (food.carbs || 0),
        fat: totals.fat + (food.fat || 0),
        sugar: totals.sugar + (food.sugar || 0),
        sodium: totals.sodium + (food.sodium || 0),
      };
    }, {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      sugar: 0,
      sodium: 0,
    });
  }, [meal]);
  
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      time: date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      date: date.toLocaleDateString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    };
  };
  
  const renderFoodItem = (food: FoodItem, index: number) => {
    return (
      <BlurCard key={`food-${index}`} style={styles.foodCard}>
        <View style={styles.foodHeader}>
          <View style={styles.foodInfo}>
            <Text style={styles.foodName}>{food.name}</Text>
            <Text style={styles.foodPortion}>{food.portion}</Text>
          </View>
          <View style={styles.foodCalories}>
            <Text style={styles.foodCaloriesValue}>{food.calories}</Text>
            <Text style={styles.foodCaloriesUnit}>kcal</Text>
          </View>
        </View>
        
        <View style={styles.macroGrid}>
          <View style={styles.macroItem}>
            <Beef color="#FF6B6B" size={16} />
            <Text style={styles.macroValue}>{food.protein}g</Text>
            <Text style={styles.macroLabel}>Proteína</Text>
          </View>
          <View style={styles.macroItem}>
            <Wheat color="#4ECDC4" size={16} />
            <Text style={styles.macroValue}>{food.carbs}g</Text>
            <Text style={styles.macroLabel}>Carboidratos</Text>
          </View>
          <View style={styles.macroItem}>
            <Droplets color="#FFE66D" size={16} />
            <Text style={styles.macroValue}>{food.fat}g</Text>
            <Text style={styles.macroLabel}>Gorduras</Text>
          </View>
        </View>
        
        {(food.sugar || food.sodium) && (
          <View style={styles.additionalNutrients}>
            {food.sugar && (
              <View style={styles.nutrientItem}>
                <Text style={styles.nutrientLabel}>Açúcar:</Text>
                <Text style={styles.nutrientValue}>{food.sugar}g</Text>
              </View>
            )}
            {food.sodium && (
              <View style={styles.nutrientItem}>
                <Text style={styles.nutrientLabel}>Sódio:</Text>
                <Text style={styles.nutrientValue}>{food.sodium}mg</Text>
              </View>
            )}
          </View>
        )}
      </BlurCard>
    );
  };
  
  if (!meal) {
    return (
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.notFoundContainer}>
            <Text style={styles.notFoundText}>Refeição não encontrada</Text>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backToHistoryButton}
            >
              <Text style={styles.backToHistoryText}>Voltar ao Histórico</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }
  
  const timeInfo = formatTime(meal.timestamp);
  
  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#f093fb']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Stack.Screen 
        options={{
          title: 'Detalhes da Refeição',
          headerStyle: { backgroundColor: 'transparent' },
          headerTintColor: 'white',
          headerTitleStyle: { fontWeight: 'bold' },
          headerTransparent: true,
        }} 
      />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ChevronLeft color="white" size={24} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Detalhes da Refeição</Text>
            <View style={styles.timeInfo}>
              <Clock color="rgba(255, 255, 255, 0.8)" size={16} />
              <Text style={styles.headerTime}>{timeInfo.time} • {timeInfo.date}</Text>
            </View>
          </View>
        </View>
        
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Meal Image */}
          {meal.imageBase64 && (
            <BlurCard style={styles.imageCard}>
              <Image
                source={{ uri: `data:image/jpeg;base64,${meal.imageBase64}` }}
                style={styles.mealImage}
              />
            </BlurCard>
          )}
          
          {/* Meal Type and Name */}
          <BlurCard style={styles.mealInfoCard}>
            <View style={styles.mealTypeContainer}>
              <Utensils color="white" size={20} />
              <Text style={styles.mealType}>{meal.mealType || 'Refeição'}</Text>
            </View>
            {meal.name && (
              <Text style={styles.mealName}>{meal.name}</Text>
            )}
          </BlurCard>
          
          {/* Nutrition Summary */}
          {nutritionTotals && (
            <BlurCard style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <TrendingUp color="white" size={24} />
                <Text style={styles.summaryTitle}>Resumo Nutricional</Text>
              </View>
              
              <View style={styles.totalCalories}>
                <Text style={styles.totalCaloriesValue}>{nutritionTotals.calories}</Text>
                <Text style={styles.totalCaloriesUnit}>kcal totais</Text>
              </View>
              
              <View style={styles.macroSummary}>
                <View style={styles.macroSummaryItem}>
                  <Beef color="#FF6B6B" size={20} />
                  <Text style={styles.macroSummaryValue}>{nutritionTotals.protein.toFixed(1)}g</Text>
                  <Text style={styles.macroSummaryLabel}>Proteína</Text>
                </View>
                <View style={styles.macroSummaryItem}>
                  <Wheat color="#4ECDC4" size={20} />
                  <Text style={styles.macroSummaryValue}>{nutritionTotals.carbs.toFixed(1)}g</Text>
                  <Text style={styles.macroSummaryLabel}>Carboidratos</Text>
                </View>
                <View style={styles.macroSummaryItem}>
                  <Droplets color="#FFE66D" size={20} />
                  <Text style={styles.macroSummaryValue}>{nutritionTotals.fat.toFixed(1)}g</Text>
                  <Text style={styles.macroSummaryLabel}>Gorduras</Text>
                </View>
              </View>
              
              {(nutritionTotals.sugar > 0 || nutritionTotals.sodium > 0) && (
                <View style={styles.additionalSummary}>
                  {nutritionTotals.sugar > 0 && (
                    <View style={styles.additionalSummaryItem}>
                      <Text style={styles.additionalSummaryLabel}>Açúcar Total:</Text>
                      <Text style={styles.additionalSummaryValue}>{nutritionTotals.sugar.toFixed(1)}g</Text>
                    </View>
                  )}
                  {nutritionTotals.sodium > 0 && (
                    <View style={styles.additionalSummaryItem}>
                      <Text style={styles.additionalSummaryLabel}>Sódio Total:</Text>
                      <Text style={styles.additionalSummaryValue}>{nutritionTotals.sodium.toFixed(0)}mg</Text>
                    </View>
                  )}
                </View>
              )}
            </BlurCard>
          )}
          
          {/* Individual Foods */}
          <View style={styles.foodsSection}>
            <View style={styles.foodsSectionHeader}>
              <Target color="white" size={24} />
              <Text style={styles.foodsSectionTitle}>Alimentos ({meal.foods.length})</Text>
            </View>
            {meal.foods.map((food, index) => renderFoodItem(food, index))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTime: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  imageCard: {
    padding: 0,
    marginBottom: 16,
    overflow: 'hidden',
  },
  mealImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
  },
  mealInfoCard: {
    padding: 20,
    marginBottom: 16,
  },
  mealTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  mealType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textTransform: 'uppercase',
  },
  mealName: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  summaryCard: {
    padding: 20,
    marginBottom: 24,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  totalCalories: {
    alignItems: 'center',
    marginBottom: 20,
  },
  totalCaloriesValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: 'white',
  },
  totalCaloriesUnit: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  macroSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  macroSummaryItem: {
    alignItems: 'center',
    gap: 8,
  },
  macroSummaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  macroSummaryLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  additionalSummary: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 16,
    gap: 8,
  },
  additionalSummaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  additionalSummaryLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  additionalSummaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  foodsSection: {
    marginTop: 8,
  },
  foodsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  foodsSectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  foodCard: {
    padding: 16,
    marginBottom: 12,
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  foodInfo: {
    flex: 1,
    marginRight: 16,
  },
  foodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  foodPortion: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  foodCalories: {
    alignItems: 'flex-end',
  },
  foodCaloriesValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  foodCaloriesUnit: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  macroGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  macroItem: {
    alignItems: 'center',
    gap: 4,
  },
  macroValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  macroLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  additionalNutrients: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 12,
    gap: 6,
  },
  nutrientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nutrientLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  nutrientValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notFoundText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  backToHistoryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backToHistoryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});