import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Animated,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Trash2, Clock, Utensils, ChevronRight, Brain, ThumbsUp, AlertTriangle } from 'lucide-react-native';
import { BlurCard } from './BlurCard';
import { Meal } from '@/types/food';
import { useCalorieTracker } from '@/providers/CalorieTrackerProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { generateText } from '@rork/toolkit-sdk';

interface MealCardProps {
  meal: Meal;
  showDetailButton?: boolean;
}

interface MealAnalysis {
  pros: string[];
  cons: string[];
}

export function MealCard({ meal, showDetailButton = true }: MealCardProps) {
  const { deleteMeal } = useCalorieTracker();
  const { colors, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const handleViewDetails = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/meal-detail?id=${meal.id}`);
  };

  const handleDelete = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    Alert.alert(
      'Excluir Refeição',
      'Tem certeza que deseja excluir esta refeição?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              Animated.timing(scaleAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }).start(async () => {
                await deleteMeal(meal.id);
              });
            } catch (error) {
              console.error('Error deleting meal:', error);
              // Reset animation on error
              Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }).start();
              
              Alert.alert(
                'Erro ao Excluir',
                'Não foi possível excluir a refeição. Tente novamente.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const generateMealAnalysis = useCallback(async () => {
    if (analysis || isLoadingAnalysis) return;
    
    setIsLoadingAnalysis(true);
    try {
      const foodList = meal.foods.map(f => `${f.name} (${f.portion})`).join(', ');
      const totalNutrition = {
        calories: meal.totalCalories,
        protein: meal.foods.reduce((sum, f) => sum + (f.protein || 0), 0),
        carbs: meal.foods.reduce((sum, f) => sum + (f.carbs || 0), 0),
        fat: meal.foods.reduce((sum, f) => sum + (f.fat || 0), 0),
      };
      
      const prompt = `Analise esta refeição (${meal.mealType}):

Alimentos: ${foodList}

Informação nutricional:
- Calorias: ${totalNutrition.calories} kcal
- Proteínas: ${totalNutrition.protein.toFixed(1)}g
- Carboidratos: ${totalNutrition.carbs.toFixed(1)}g
- Gorduras: ${totalNutrition.fat.toFixed(1)}g

Por favor, forneça uma análise concisa em português com:
1. 2-3 pontos positivos (prós)
2. 2-3 pontos de atenção ou melhorias (contras)

Formato da resposta:
PRÓS:
- [ponto positivo 1]
- [ponto positivo 2]
- [ponto positivo 3]

CONTRAS:
- [ponto de atenção 1]
- [ponto de atenção 2]
- [ponto de atenção 3]`;
      
      const response = await generateText(prompt);
      
      // Parse the response
      const prosMatch = response.match(/PRÓS:\s*([\s\S]*?)(?=CONTRAS:|$)/);
      const consMatch = response.match(/CONTRAS:\s*([\s\S]*)/);
      
      const pros = prosMatch ? prosMatch[1].split('\n').filter(line => line.trim().startsWith('-')).map(line => line.replace(/^-\s*/, '').trim()) : [];
      const cons = consMatch ? consMatch[1].split('\n').filter(line => line.trim().startsWith('-')).map(line => line.replace(/^-\s*/, '').trim()) : [];
      
      setAnalysis({ pros, cons });
    } catch (error) {
      console.error('Error generating meal analysis:', error);
    } finally {
      setIsLoadingAnalysis(false);
    }
  }, [meal.foods, meal.totalCalories, meal.mealType, analysis, isLoadingAnalysis]);

  useEffect(() => {
    // Generate analysis automatically when component mounts
    generateMealAnalysis();
  }, [generateMealAnalysis]);

  const toggleAnalysis = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowAnalysis(!showAnalysis);
  };

  const styles = createStyles(colors, isDark);

  return (
    <Animated.View style={[
      styles.container,
      { transform: [{ scale: scaleAnim }] }
    ]}>
      <BlurCard variant="default" style={styles.card}>
        <View style={styles.content}>
          {meal.imageBase64 ? (
            <Image
              source={{ uri: `data:image/jpeg;base64,${meal.imageBase64}` }}
              style={styles.thumbnail}
            />
          ) : (
            <View style={styles.placeholderThumbnail}>
              <Utensils color={colors.textTertiary} size={24} strokeWidth={1.5} />
            </View>
          )}
          
          <View style={styles.info}>
            <View style={styles.header}>
              <View style={styles.mealTypeContainer}>
                <Text style={styles.mealType}>{meal.mealType}</Text>
              </View>
              <View style={styles.timeContainer}>
                <Clock color={colors.textSecondary} size={12} strokeWidth={2} />
                <Text style={[styles.time, { color: colors.textSecondary }]}>{formatTime(meal.timestamp)}</Text>
              </View>
            </View>
            
            <View style={styles.foodsContainer}>
              <Text style={[styles.foods, { color: colors.text }]} numberOfLines={2}>
                {meal.foods.map(f => f.name).join(', ')}
              </Text>
              {meal.foods.length > 2 && (
                <Text style={[styles.foodCount, { color: colors.textTertiary }]}>
                  +{meal.foods.length - 2} mais
                </Text>
              )}
            </View>
            
            <View style={styles.footer}>
              <View style={styles.caloriesContainer}>
                <Text style={[styles.calories, { color: colors.text }]}>{meal.totalCalories}</Text>
                <Text style={[styles.caloriesUnit, { color: colors.textSecondary }]}>kcal</Text>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity onPress={toggleAnalysis} style={styles.analysisButton}>
                  <View style={styles.analysisButtonInner}>
                    {isLoadingAnalysis ? (
                      <ActivityIndicator size={16} color={colors.secondary} />
                    ) : (
                      <Brain color={colors.secondary} size={18} strokeWidth={2} />
                    )}
                  </View>
                </TouchableOpacity>
                {showDetailButton && (
                  <TouchableOpacity onPress={handleViewDetails} style={styles.detailButton}>
                    <View style={styles.detailButtonInner}>
                      <ChevronRight color={colors.primary} size={18} strokeWidth={2} />
                    </View>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                  <View style={styles.deleteButtonInner}>
                    <Trash2 color={colors.error} size={18} strokeWidth={2} />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        
        {/* AI Analysis Section */}
        {showAnalysis && analysis && (
          <View style={styles.analysisSection}>
            <View style={styles.analysisDivider} />
            <View style={styles.analysisContent}>
              <View style={styles.analysisHeader}>
                <Brain color={colors.secondary} size={16} strokeWidth={2} />
                <Text style={[styles.analysisTitle, { color: colors.text }]}>Análise IA</Text>
              </View>
              
              {analysis.pros.length > 0 && (
                <View style={styles.analysisGroup}>
                  <View style={styles.analysisGroupHeader}>
                    <ThumbsUp color="#4CAF50" size={14} strokeWidth={2} />
                    <Text style={[styles.analysisGroupTitle, { color: '#4CAF50' }]}>Pontos Positivos</Text>
                  </View>
                  {analysis.pros.map((pro, index) => (
                    <Text key={`pro-${index}`} style={[styles.analysisPoint, { color: colors.textSecondary }]}>• {pro}</Text>
                  ))}
                </View>
              )}
              
              {analysis.cons.length > 0 && (
                <View style={styles.analysisGroup}>
                  <View style={styles.analysisGroupHeader}>
                    <AlertTriangle color="#FF9800" size={14} strokeWidth={2} />
                    <Text style={[styles.analysisGroupTitle, { color: '#FF9800' }]}>Pontos de Atenção</Text>
                  </View>
                  {analysis.cons.map((con, index) => (
                    <Text key={`con-${index}`} style={[styles.analysisPoint, { color: colors.textSecondary }]}>• {con}</Text>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}
      </BlurCard>
    </Animated.View>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    padding: 20,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  content: {
    flexDirection: 'row',
    gap: 16,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  placeholderThumbnail: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  mealTypeContainer: {
    backgroundColor: '#007AFF' + '15',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  mealType: {
    fontSize: 11,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    color: '#007AFF',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  time: {
    fontSize: 13,
    fontWeight: '400' as const,
    letterSpacing: 0.1,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  foodsContainer: {
    marginBottom: 12,
    gap: 4,
  },
  foods: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
    letterSpacing: -0.24,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  foodCount: {
    fontSize: 13,
    fontWeight: '400' as const,
    letterSpacing: 0.1,
    opacity: 0.6,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  caloriesContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  calories: {
    fontSize: 28,
    fontWeight: '300' as const,
    letterSpacing: -0.8,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  caloriesUnit: {
    fontSize: 13,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    opacity: 0.6,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  deleteButton: {
    borderRadius: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  detailButton: {
    borderRadius: 12,
  },
  detailButtonInner: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: colors.primary + '15',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  deleteButtonInner: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: colors.error + '15',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  analysisButton: {
    borderRadius: 12,
  },
  analysisButtonInner: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: colors.secondary + '15',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  analysisSection: {
    marginTop: 16,
  },
  analysisDivider: {
    height: 1,
    backgroundColor: colors.border + '30',
    marginBottom: 16,
  },
  analysisContent: {
    gap: 12,
  },
  analysisHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  analysisTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  analysisGroup: {
    gap: 6,
  },
  analysisGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  analysisGroupTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.3,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  analysisPoint: {
    fontSize: 13,
    lineHeight: 18,
    marginLeft: 8,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
});