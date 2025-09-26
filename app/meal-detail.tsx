import React, { useMemo, useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { 
  ChevronLeft, 
  Clock, 
  Utensils,
  Target,
  TrendingUp,
  Droplets,
  Wheat,
  Beef,
  Brain,
  AlertTriangle
} from 'lucide-react-native';
import { BlurCard } from '@/components/BlurCard';
import { useCalorieTracker } from '@/providers/CalorieTrackerProvider';
import { useTheme, useThemedStyles } from '@/providers/ThemeProvider';
import { FoodItem } from '@/types/food';


export default function MealDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { meals, userProfile } = useCalorieTracker();
  const { colors, isDark } = useTheme();
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  
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
            <Text style={[styles.foodName, { color: colors.text }]}>{food.name}</Text>
            <Text style={[styles.foodPortion, { color: colors.textSecondary }]}>{food.portion}</Text>
          </View>
          <View style={styles.foodCalories}>
            <Text style={[styles.foodCaloriesValue, { color: colors.text }]}>{food.calories}</Text>
            <Text style={[styles.foodCaloriesUnit, { color: colors.textSecondary }]}>kcal</Text>
          </View>
        </View>
        
        <View style={styles.macroGrid}>
          <View style={styles.macroItem}>
            <Beef color="#FF6B6B" size={16} />
            <Text style={[styles.macroValue, { color: colors.text }]}>{food.protein}g</Text>
            <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>Proteína</Text>
          </View>
          <View style={styles.macroItem}>
            <Wheat color="#4ECDC4" size={16} />
            <Text style={[styles.macroValue, { color: colors.text }]}>{food.carbs}g</Text>
            <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>Carboidratos</Text>
          </View>
          <View style={styles.macroItem}>
            <Droplets color="#FFE66D" size={16} />
            <Text style={[styles.macroValue, { color: colors.text }]}>{food.fat}g</Text>
            <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>Gorduras</Text>
          </View>
        </View>
        
        {(food.sugar || food.sodium) && (
          <View style={styles.additionalNutrients}>
            {food.sugar && (
              <View style={styles.nutrientItem}>
                <Text style={[styles.nutrientLabel, { color: colors.textSecondary }]}>Açúcar:</Text>
                <Text style={[styles.nutrientValue, { color: colors.text }]}>{food.sugar}g</Text>
              </View>
            )}
            {food.sodium && (
              <View style={styles.nutrientItem}>
                <Text style={[styles.nutrientLabel, { color: colors.textSecondary }]}>Sódio:</Text>
                <Text style={[styles.nutrientValue, { color: colors.text }]}>{food.sodium}mg</Text>
              </View>
            )}
          </View>
        )}
      </BlurCard>
    );
  };
  
  const generateMealAnalysis = React.useCallback(async () => {
    if (!meal || !nutritionTotals) return;
    
    setIsLoadingAnalysis(true);
    setAiAnalysis('');
    
    try {
      const foodList = meal.foods.map(food => `${food.name} (${food.portion})`).join(', ');
      const age = userProfile?.age || 30;
      const weight = userProfile?.weight || 70;
      const height = userProfile?.height || 170;
      const activityLevel = userProfile?.activityLevel || 'moderado';
      
      console.log('Iniciando análise da refeição...');
      console.log('Dados da refeição:', {
        foods: foodList,
        calories: nutritionTotals.calories,
        protein: nutritionTotals.protein,
        carbs: nutritionTotals.carbs,
        fat: nutritionTotals.fat
      });
      
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Analise esta refeição detalhadamente para uma pessoa de ${age} anos, ${weight}kg, ${height}cm, nível de atividade ${activityLevel}:

Refeição: ${meal.mealType || 'Refeição'}
Alimentos: ${foodList}
Calorias totais: ${nutritionTotals.calories}kcal
Proteína: ${nutritionTotals.protein.toFixed(1)}g
Carboidratos: ${nutritionTotals.carbs.toFixed(1)}g
Gorduras: ${nutritionTotals.fat.toFixed(1)}g
${nutritionTotals.sugar > 0 ? `Açúcar: ${nutritionTotals.sugar.toFixed(1)}g\n` : ''}${nutritionTotals.sodium > 0 ? `Sódio: ${nutritionTotals.sodium.toFixed(0)}mg\n` : ''}

Forneça uma análise detalhada em português brasileiro com:

**PONTOS POSITIVOS:**
- Aspectos nutricionais benéficos
- Adequação para a idade e perfil
- Benefícios específicos dos alimentos

**PONTOS DE ATENÇÃO:**
- Possíveis excessos ou deficiências
- Sugestões de melhoria
- Considerações para o perfil do usuário

**RECOMENDAÇÕES:**
- Como otimizar esta refeição
- Sugestões de acompanhamentos
- Dicas específicas para a idade

Seja específico, educativo e construtivo. Mantenha um tom profissional mas acessível.`
            }
          ]
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na API:', response.status, errorText);
        throw new Error(`Erro na análise: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Resposta da API recebida:', data);
      
      if (!data.completion) {
        throw new Error('Resposta inválida da API');
      }
      
      const analysis = data.completion.trim();
      console.log('Análise gerada com sucesso:', analysis.substring(0, 100) + '...');
      
      setAiAnalysis(analysis);
    } catch (error) {
      console.error('Erro ao gerar análise:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setAiAnalysis(`Não foi possível gerar a análise da refeição: ${errorMessage}. Tente novamente mais tarde.`);
    } finally {
      setIsLoadingAnalysis(false);
    }
  }, [meal, nutritionTotals, userProfile]);
  
  useEffect(() => {
    if (meal && nutritionTotals && !aiAnalysis && !isLoadingAnalysis) {
      console.log('Executando análise da refeição...');
      generateMealAnalysis();
    }
  }, [meal, nutritionTotals, generateMealAnalysis, aiAnalysis, isLoadingAnalysis]);
  
  const styles = useThemedStyles((colors, isDark) => createStyles(colors, isDark));

  if (!meal) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={isDark ? [
            '#000000',
            '#1C1C1E',
            '#2C2C2E'
          ] : [
            '#F2F2F7',
            '#FAFAFA',
            '#F2F2F7'
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        
        <StatusBar 
          barStyle={isDark ? 'light-content' : 'dark-content'} 
          backgroundColor="transparent" 
          translucent 
        />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.notFoundContainer}>
            <Text style={[styles.notFoundText, { color: colors.text }]}>Refeição não encontrada</Text>
            <TouchableOpacity
              onPress={() => router.back()}
              style={[styles.backToHistoryButton, { backgroundColor: colors.surfaceElevated }]}
            >
              <Text style={[styles.backToHistoryText, { color: colors.text }]}>Voltar ao Histórico</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }
  
  const timeInfo = formatTime(meal.timestamp);
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isDark ? [
          '#000000',
          '#1C1C1E',
          '#2C2C2E'
        ] : [
          '#F2F2F7',
          '#FAFAFA',
          '#F2F2F7'
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent" 
        translucent 
      />
      <Stack.Screen 
        options={{
          title: 'Detalhes da Refeição',
          headerStyle: { backgroundColor: 'transparent' },
          headerTintColor: colors.text,
          headerTitleStyle: { fontWeight: 'bold' },
          headerTransparent: true,
        }} 
      />
      
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: colors.surfaceElevated }]}
          >
            <ChevronLeft color={colors.text} size={24} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Detalhes da Refeição</Text>
            <View style={styles.timeInfo}>
              <Clock color={colors.textSecondary} size={16} />
              <Text style={[styles.headerTime, { color: colors.textSecondary }]}>{timeInfo.time} • {timeInfo.date}</Text>
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
              <Utensils color={colors.primary} size={20} />
              <Text style={[styles.mealType, { color: colors.text }]}>{meal.mealType || 'Refeição'}</Text>
            </View>
            {meal.name && (
              <Text style={[styles.mealName, { color: colors.textSecondary }]}>{meal.name}</Text>
            )}
          </BlurCard>
          
          {/* Nutrition Summary */}
          {nutritionTotals && (
            <BlurCard style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <TrendingUp color={colors.primary} size={24} />
                <Text style={[styles.summaryTitle, { color: colors.text }]}>Resumo Nutricional</Text>
              </View>
              
              <View style={styles.totalCalories}>
                <Text style={[styles.totalCaloriesValue, { color: colors.text }]}>{nutritionTotals.calories}</Text>
                <Text style={[styles.totalCaloriesUnit, { color: colors.textSecondary }]}>kcal totais</Text>
              </View>
              
              <View style={styles.macroSummary}>
                <View style={styles.macroSummaryItem}>
                  <Beef color="#FF6B6B" size={20} />
                  <Text style={[styles.macroSummaryValue, { color: colors.text }]}>{nutritionTotals.protein.toFixed(1)}g</Text>
                  <Text style={[styles.macroSummaryLabel, { color: colors.textSecondary }]}>Proteína</Text>
                </View>
                <View style={styles.macroSummaryItem}>
                  <Wheat color="#4ECDC4" size={20} />
                  <Text style={[styles.macroSummaryValue, { color: colors.text }]}>{nutritionTotals.carbs.toFixed(1)}g</Text>
                  <Text style={[styles.macroSummaryLabel, { color: colors.textSecondary }]}>Carboidratos</Text>
                </View>
                <View style={styles.macroSummaryItem}>
                  <Droplets color="#FFE66D" size={20} />
                  <Text style={[styles.macroSummaryValue, { color: colors.text }]}>{nutritionTotals.fat.toFixed(1)}g</Text>
                  <Text style={[styles.macroSummaryLabel, { color: colors.textSecondary }]}>Gorduras</Text>
                </View>
              </View>
              
              {(nutritionTotals.sugar > 0 || nutritionTotals.sodium > 0) && (
                <View style={styles.additionalSummary}>
                  {nutritionTotals.sugar > 0 && (
                    <View style={styles.additionalSummaryItem}>
                      <Text style={[styles.additionalSummaryLabel, { color: colors.textSecondary }]}>Açúcar Total:</Text>
                      <Text style={[styles.additionalSummaryValue, { color: colors.text }]}>{nutritionTotals.sugar.toFixed(1)}g</Text>
                    </View>
                  )}
                  {nutritionTotals.sodium > 0 && (
                    <View style={styles.additionalSummaryItem}>
                      <Text style={[styles.additionalSummaryLabel, { color: colors.textSecondary }]}>Sódio Total:</Text>
                      <Text style={[styles.additionalSummaryValue, { color: colors.text }]}>{nutritionTotals.sodium.toFixed(0)}mg</Text>
                    </View>
                  )}
                </View>
              )}
            </BlurCard>
          )}
          
          {/* AI Analysis */}
          <BlurCard style={styles.analysisCard}>
            <View style={styles.analysisHeader}>
              <Brain color={colors.primary} size={24} />
              <Text style={[styles.analysisTitle, { color: colors.text }]}>Análise Nutricional Inteligente</Text>
            </View>
            
            {isLoadingAnalysis ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Analisando sua refeição...</Text>
              </View>
            ) : aiAnalysis ? (
              <View style={styles.analysisContent}>
                <Text style={[styles.analysisText, { color: colors.text }]}>{aiAnalysis}</Text>
              </View>
            ) : (
              <View style={styles.analysisError}>
                <AlertTriangle color={colors.textSecondary} size={20} />
                <View style={styles.analysisErrorContent}>
                  <Text style={[styles.analysisErrorText, { color: colors.textSecondary }]}>Análise não disponível</Text>
                  <TouchableOpacity 
                    onPress={generateMealAnalysis}
                    style={[styles.retryAnalysisButton, { backgroundColor: colors.surfaceElevated }]}
                  >
                    <Text style={[styles.retryAnalysisText, { color: colors.text }]}>Tentar Novamente</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </BlurCard>
          
          {/* Individual Foods */}
          <View style={styles.foodsSection}>
            <View style={styles.foodsSectionHeader}>
              <Target color={colors.primary} size={24} />
              <Text style={[styles.foodsSectionTitle, { color: colors.text }]}>Alimentos ({meal.foods.length})</Text>
            </View>
            {meal.foods.map((food, index) => renderFoodItem(food, index))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    borderRadius: 12,
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.2 : 0.1,
    shadowRadius: 2,
    elevation: isDark ? 0 : 1,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTime: {
    fontSize: 14,
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
    textTransform: 'uppercase',
  },
  mealName: {
    fontSize: 16,
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
  },
  totalCalories: {
    alignItems: 'center',
    marginBottom: 20,
  },
  totalCaloriesValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  totalCaloriesUnit: {
    fontSize: 16,
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
  },
  macroSummaryLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  additionalSummary: {
    borderTopWidth: 1,
    borderTopColor: colors.borderSecondary,
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
  },
  additionalSummaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
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
    marginBottom: 4,
  },
  foodPortion: {
    fontSize: 14,
  },
  foodCalories: {
    alignItems: 'flex-end',
  },
  foodCaloriesValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  foodCaloriesUnit: {
    fontSize: 12,
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
  },
  macroLabel: {
    fontSize: 10,
    textAlign: 'center',
  },
  additionalNutrients: {
    borderTopWidth: 1,
    borderTopColor: colors.borderSecondary,
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
  },
  nutrientValue: {
    fontSize: 12,
    fontWeight: 'bold',
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
    textAlign: 'center',
    marginBottom: 20,
  },
  backToHistoryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.2 : 0.1,
    shadowRadius: 2,
    elevation: isDark ? 0 : 1,
  },
  backToHistoryText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  analysisCard: {
    padding: 20,
    marginBottom: 24,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  analysisTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
  },
  analysisContent: {
    paddingVertical: 8,
  },
  analysisText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'justify',
  },
  analysisError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  analysisErrorText: {
    fontSize: 14,
  },
  analysisErrorContent: {
    flex: 1,
    marginLeft: 8,
  },
  retryAnalysisButton: {
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  retryAnalysisText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});