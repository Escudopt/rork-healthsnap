import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Calendar, TrendingUp } from 'lucide-react-native';
import { router, Stack } from 'expo-router';
import { useCalorieTracker } from '@/providers/CalorieTrackerProvider';
import { BlurCard } from '@/components/BlurCard';
import { MealCard } from '@/components/MealCard';
import { NutritionBreakdown } from '@/components/NutritionBreakdown';
import { Meal } from '@/types/food';

interface DayData {
  date: string;
  dateString: string;
  meals: Meal[];
  totalCalories: number;
  mealCount: number;
}

export default function MealHistoryScreen() {
  const { meals, dailyGoal } = useCalorieTracker();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Group meals by date and calculate daily totals
  const dailyData = useMemo(() => {
    const grouped: { [key: string]: DayData } = {};
    const today = new Date().toDateString();

    meals.forEach(meal => {
      if (!meal?.timestamp || !meal.id) return;
      
      try {
        const mealDate = new Date(meal.timestamp);
        const dateString = mealDate.toDateString();
        
        // Skip today's meals as they're shown on the main screen
        if (dateString === today) return;
        
        if (!grouped[dateString]) {
          grouped[dateString] = {
            date: mealDate.toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }),
            dateString,
            meals: [],
            totalCalories: 0,
            mealCount: 0
          };
        }
        
        grouped[dateString].meals.push(meal);
        grouped[dateString].totalCalories += meal.totalCalories || 0;
        grouped[dateString].mealCount += 1;
      } catch (error) {
        console.error('Error processing meal date:', error);
      }
    });

    // Convert to array and sort by date (most recent first)
    return Object.values(grouped).sort((a, b) => 
      new Date(b.dateString).getTime() - new Date(a.dateString).getTime()
    );
  }, [meals]);

  const selectedDayData = useMemo(() => {
    if (!selectedDate) return null;
    return dailyData.find(day => day.dateString === selectedDate);
  }, [selectedDate, dailyData]);

  const renderDayItem = ({ item }: { item: DayData }) => {
    const progressPercentage = Math.min((item.totalCalories / dailyGoal) * 100, 100);
    const isOverGoal = item.totalCalories > dailyGoal;
    
    return (
      <TouchableOpacity
        onPress={() => setSelectedDate(item.dateString)}
        activeOpacity={0.8}
      >
        <BlurCard style={styles.dayCard}>
          <View style={styles.dayHeader}>
            <View style={styles.dayInfo}>
              <Text style={styles.dayDate}>{item.date}</Text>
              <Text style={styles.dayStats}>
                {item.mealCount} refeições • {item.totalCalories} kcal
              </Text>
            </View>
            <View style={styles.dayCalories}>
              <Text style={[styles.calorieValue, isOverGoal && styles.overGoal]}>
                {item.totalCalories}
              </Text>
              <Text style={styles.calorieUnit}>kcal</Text>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  {
                    width: `${progressPercentage}%`,
                    backgroundColor: isOverGoal ? '#FF6B6B' : '#4ECDC4'
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {Math.round(progressPercentage)}% da meta ({dailyGoal} kcal)
            </Text>
          </View>
        </BlurCard>
      </TouchableOpacity>
    );
  };

  if (selectedDate && selectedDayData) {
    return (
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <Stack.Screen 
          options={{
            title: 'Detalhes do Dia',
            headerStyle: { backgroundColor: 'transparent' },
            headerTintColor: 'white',
            headerTitleStyle: { fontWeight: 'bold' },
            headerTransparent: true,
          }} 
        />
        
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.detailHeader}>
            <TouchableOpacity
              onPress={() => setSelectedDate(null)}
              style={styles.backButton}
            >
              <ChevronLeft color="white" size={24} />
            </TouchableOpacity>
            <View style={styles.detailHeaderInfo}>
              <Text style={styles.detailDate}>{selectedDayData.date}</Text>
              <Text style={styles.detailStats}>
                {selectedDayData.mealCount} refeições • {selectedDayData.totalCalories} kcal
              </Text>
            </View>
          </View>

          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <BlurCard style={styles.summaryCard}>
              <View style={styles.summaryContent}>
                <View style={styles.summaryItem}>
                  <TrendingUp color="white" size={20} />
                  <Text style={styles.summaryValue}>{selectedDayData.totalCalories}</Text>
                  <Text style={styles.summaryLabel}>Total de Calorias</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Calendar color="white" size={20} />
                  <Text style={styles.summaryValue}>{selectedDayData.mealCount}</Text>
                  <Text style={styles.summaryLabel}>Refeições</Text>
                </View>
              </View>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min((selectedDayData.totalCalories / dailyGoal) * 100, 100)}%`,
                        backgroundColor: selectedDayData.totalCalories > dailyGoal ? '#FF6B6B' : '#4ECDC4'
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.progressText}>
                  {Math.round((selectedDayData.totalCalories / dailyGoal) * 100)}% da meta ({dailyGoal} kcal)
                </Text>
              </View>
            </BlurCard>

            {/* Nutrition Breakdown */}
            <NutritionBreakdown 
              foods={selectedDayData.meals.flatMap(meal => meal.foods)}
              title="Resumo Nutricional do Dia"
            />

            <View style={styles.mealsSection}>
              <Text style={styles.sectionTitle}>Refeições do Dia</Text>
              {selectedDayData.meals.map((meal) => (
                <MealCard key={meal.id} meal={meal} showDetailButton={true} />
              ))}
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2', '#f093fb']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <Stack.Screen 
        options={{
          title: 'Histórico de Refeições',
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
            <Text style={styles.headerTitle}>Histórico de Refeições</Text>
            <Text style={styles.headerSubtitle}>
              {dailyData.length} {dailyData.length === 1 ? 'dia' : 'dias'} com refeições registradas
            </Text>
          </View>
        </View>

        {dailyData.length === 0 ? (
          <View style={styles.emptyContainer}>
            <BlurCard style={styles.emptyCard}>
              <Calendar color="rgba(255, 255, 255, 0.6)" size={48} />
              <Text style={styles.emptyText}>
                Nenhum histórico encontrado
              </Text>
              <Text style={styles.emptySubtext}>
                Suas refeições dos dias anteriores aparecerão aqui
              </Text>
            </BlurCard>
          </View>
        ) : (
          <FlatList
            data={dailyData}
            renderItem={renderDayItem}
            keyExtractor={(item) => item.dateString}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
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
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  dayCard: {
    padding: 20,
    marginBottom: 16,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  dayInfo: {
    flex: 1,
    marginRight: 16,
  },
  dayDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  dayStats: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  dayCalories: {
    alignItems: 'flex-end',
  },
  calorieValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  overGoal: {
    color: '#FF6B6B',
  },
  calorieUnit: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  emptyCard: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Detail view styles
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  detailHeaderInfo: {
    flex: 1,
    marginLeft: 16,
  },
  detailDate: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  detailStats: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  summaryCard: {
    padding: 20,
    marginBottom: 24,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  mealsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
});