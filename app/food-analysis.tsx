import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Animated,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { 
  ArrowLeft, 
  Check, 
  X, 
  Sparkles, 
  Scale,
  Utensils,
  ChefHat,
  Heart,
  Info
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

import { useCalorieTracker } from '@/providers/CalorieTrackerProvider';
import { useTheme } from '@/providers/ThemeProvider';

import { foodRecognitionService } from '@/services/FoodRecognitionService';
import { AnalysisResult, FoodItem } from '@/types/food';



export default function FoodAnalysisScreen() {
  const { imageBase64 } = useLocalSearchParams<{ imageBase64: string }>();
  const { addMeal } = useCalorieTracker();
  const { colors, isDark } = useTheme();
  
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [nutritionSuggestions, setNutritionSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!imageBase64) {
      console.error('Imagem não encontrada');
      router.back();
      return;
    }

    analyzeFood();
  }, [imageBase64]);

  useEffect(() => {
    // Start animations when analysis is complete
    if (analysisResult && !isAnalyzing) {
      Animated.stagger(200, [
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      // Sparkle animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(sparkleAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(sparkleAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [analysisResult, isAnalyzing]);

  const analyzeFood = async () => {
    try {
      setIsAnalyzing(true);
      console.log('🔍 Starting food analysis...');
      
      // Use the enhanced food recognition service
      const result = await foodRecognitionService.recognizeFood(imageBase64);
      setAnalysisResult(result);
      
      // Get nutrition suggestions
      const suggestions = await foodRecognitionService.getNutritionSuggestions(result.foods);
      setNutritionSuggestions(suggestions);
      
      console.log('✅ Analysis completed:', result);
      
    } catch (error) {
      console.error('❌ Analysis failed:', error);
      // For web compatibility, we'll just go back instead of showing alert
      router.back();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveMeal = async () => {
    if (!analysisResult) return;

    try {
      setIsSaving(true);
      
      if (Platform.OS !== 'web') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      await addMeal({
        name: analysisResult.mealName,
        mealName: analysisResult.mealName,
        foods: analysisResult.foods,
        totalCalories: analysisResult.totalCalories,
        mealType: analysisResult.mealType,
        imageBase64: imageBase64
      });

      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      console.log('Refeição salva:', analysisResult.mealName);
      router.back();

    } catch (error) {
      console.error('❌ Error saving meal:', error);
      console.error('Não foi possível salvar a refeição. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return '#4ECDC4';
      case 'medium': return '#FFE66D';
      case 'low': return '#FF6B6B';
      default: return colors.textSecondary;
    }
  };

  const getConfidenceText = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'Alta Precisão';
      case 'medium': return 'Precisão Média';
      case 'low': return 'Baixa Precisão';
      default: return 'Desconhecida';
    }
  };

  const renderFoodItem = (food: FoodItem, index: number) => {
    if (!food?.name?.trim()) return null;
    return (
      <Animated.View
        key={index}
        style={[
          styles.foodItem,
          {
            backgroundColor: colors.surfaceElevated,
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        <View style={styles.foodHeader}>
          <View style={[styles.foodIcon, { backgroundColor: colors.primary + '15' }]}>
            <Utensils color={colors.primary} size={16} strokeWidth={2} />
          </View>
          <View style={styles.foodInfo}>
            <Text style={[styles.foodName, { color: colors.text }]}>{food.name}</Text>
            <Text style={[styles.foodPortion, { color: colors.textSecondary }]}>
              {food.portion} • {food.weightInGrams}g
            </Text>
          </View>
          <View style={styles.foodCalories}>
            <Text style={[styles.calorieValue, { color: colors.text }]}>{food.calories}</Text>
            <Text style={[styles.calorieUnit, { color: colors.textSecondary }]}>kcal</Text>
          </View>
        </View>
        
        <View style={styles.macroRow}>
          <View style={styles.macroItem}>
            <Text style={[styles.macroValue, { color: colors.text }]}>{food.protein.toFixed(1)}g</Text>
            <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>Proteína</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={[styles.macroValue, { color: colors.text }]}>{food.carbs.toFixed(1)}g</Text>
            <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>Carbs</Text>
          </View>
          <View style={styles.macroItem}>
            <Text style={[styles.macroValue, { color: colors.text }]}>{food.fat.toFixed(1)}g</Text>
            <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>Gordura</Text>
          </View>
          {food.fiber && (
            <View style={styles.macroItem}>
              <Text style={[styles.macroValue, { color: colors.text }]}>{food.fiber.toFixed(1)}g</Text>
              <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>Fibra</Text>
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  const renderSuggestionItem = (suggestion: string, index: number) => {
    if (!suggestion?.trim()) return null;
    return (
      <Animated.View
        key={index}
        style={[
          styles.suggestionItem,
          {
            backgroundColor: colors.surfaceSecondary,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <View style={[styles.suggestionIcon, { backgroundColor: colors.primary + '15' }]}>
          <Heart color={colors.primary} size={14} strokeWidth={2} />
        </View>
        <Text style={[styles.suggestionText, { color: colors.text }]}>{suggestion}</Text>
      </Animated.View>
    );
  };

  if (isAnalyzing) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={isDark ? [
            '#0A0B0F',
            '#111318',
            '#1A1D24'
          ] : [
            '#FAFBFF',
            '#F5F7FA',
            '#F0F2F5'
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.loadingContainer}>
            <Animated.View style={[
              styles.loadingIcon,
              {
                backgroundColor: colors.surfaceElevated,
                transform: [{
                  rotate: sparkleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  })
                }]
              }
            ]}>
              <Sparkles color={colors.primary} size={32} strokeWidth={2} />
            </Animated.View>
            
            <Text style={[styles.loadingTitle, { color: colors.text }]}>
              Analisando Alimentos
            </Text>
            <Text style={[styles.loadingSubtitle, { color: colors.textSecondary }]}>
              Identificando ingredientes e calculando nutrição...
            </Text>
            
            <ActivityIndicator 
              size="large" 
              color={colors.primary} 
              style={styles.loadingSpinner}
            />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (!analysisResult) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: colors.text }]}>
              Erro na análise da imagem
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
              onPress={analyzeFood}
            >
              <Text style={styles.retryButtonText}>Tentar Novamente</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={isDark ? [
          '#0A0B0F',
          '#111318',
          '#1A1D24',
          '#242831'
        ] : [
          '#FAFBFF',
          '#F5F7FA',
          '#F0F2F5',
          '#E8EBF0'
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animated.View style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: colors.surfaceElevated }]}
          >
            <ArrowLeft color={colors.text} size={20} strokeWidth={2} />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Análise Nutricional
            </Text>
            <View style={[
              styles.confidenceBadge,
              { backgroundColor: getConfidenceColor(analysisResult.confidence) + '20' }
            ]}>
              <Text style={[
                styles.confidenceText,
                { color: getConfidenceColor(analysisResult.confidence) }
              ]}>
                {getConfidenceText(analysisResult.confidence)}
              </Text>
            </View>
          </View>
          
          <Animated.View style={[
            styles.sparkleContainer,
            {
              opacity: sparkleAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.4, 1, 0.4],
              }),
            }
          ]}>
            <Sparkles color={colors.primary} size={24} strokeWidth={2} />
          </Animated.View>
        </Animated.View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Food Image */}
          <Animated.View style={[
            styles.imageContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}>
            <Image
              source={{ uri: `data:image/jpeg;base64,${imageBase64}` }}
              style={styles.foodImage}
              resizeMode="cover"
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.3)']}
              style={styles.imageOverlay}
            />
          </Animated.View>

          {/* Meal Summary */}
          <Animated.View style={[
            styles.summaryCard,
            {
              backgroundColor: colors.surfaceElevated,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}>
            <View style={styles.summaryHeader}>
              <View style={[styles.mealIcon, { backgroundColor: colors.primary + '15' }]}>
                <ChefHat color={colors.primary} size={20} strokeWidth={2} />
              </View>
              <View style={styles.summaryInfo}>
                <Text style={[styles.mealName, { color: colors.text }]}>
                  {analysisResult.mealName}
                </Text>
                <Text style={[styles.mealType, { color: colors.textSecondary }]}>
                  {analysisResult.mealType} • {analysisResult.foods.length} ingredientes
                </Text>
              </View>
            </View>
            
            <View style={styles.totalCalories}>
              <Text style={[styles.totalCaloriesValue, { color: colors.text }]}>
                {analysisResult.totalCalories}
              </Text>
              <Text style={[styles.totalCaloriesUnit, { color: colors.textSecondary }]}>
                kcal total
              </Text>
            </View>
            
            {analysisResult.totalWeight && (
              <View style={styles.totalWeight}>
                <Scale color={colors.textSecondary} size={14} strokeWidth={2} />
                <Text style={[styles.totalWeightText, { color: colors.textSecondary }]}>
                  {analysisResult.totalWeight}g total
                </Text>
              </View>
            )}
          </Animated.View>

          {/* Food Items */}
          <View style={styles.foodSection}>
            <Animated.View style={[
              styles.sectionHeader,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Ingredientes Identificados
              </Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                Análise nutricional detalhada
              </Text>
            </Animated.View>
            
            {analysisResult.foods.map((food, index) => renderFoodItem(food, index))}
          </View>

          {/* Nutrition Suggestions */}
          {nutritionSuggestions.length > 0 && (
            <View style={styles.suggestionsSection}>
              <Animated.View style={[
                styles.sectionHeader,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}>
                <TouchableOpacity
                  onPress={() => setShowSuggestions(!showSuggestions)}
                  style={styles.suggestionToggle}
                >
                  <Heart color={colors.primary} size={18} strokeWidth={2} />
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Dicas Nutricionais
                  </Text>
                  <Info color={colors.textSecondary} size={16} strokeWidth={2} />
                </TouchableOpacity>
              </Animated.View>
              
              {showSuggestions && nutritionSuggestions.map((suggestion, index) => 
                renderSuggestionItem(suggestion, index)
              )}
            </View>
          )}

          {/* Notes */}
          {analysisResult.notes && (
            <Animated.View style={[
              styles.notesCard,
              {
                backgroundColor: colors.surfaceSecondary,
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}>
              <View style={styles.notesHeader}>
                <Info color={colors.textSecondary} size={16} strokeWidth={2} />
                <Text style={[styles.notesTitle, { color: colors.text }]}>
                  Observações
                </Text>
              </View>
              <Text style={[styles.notesText, { color: colors.textSecondary }]}>
                {analysisResult.notes}
              </Text>
            </Animated.View>
          )}
        </ScrollView>

        {/* Action Buttons */}
        <Animated.View style={[
          styles.actionButtons,
          {
            backgroundColor: colors.surface,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={[styles.cancelButton, { backgroundColor: colors.surfaceSecondary }]}
            disabled={isSaving}
          >
            <X color={colors.textSecondary} size={20} strokeWidth={2} />
            <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>
              Cancelar
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleSaveMeal}
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Check color="white" size={20} strokeWidth={2} />
            )}
            <Text style={styles.saveButtonText}>
              {isSaving ? 'Salvando...' : 'Salvar Refeição'}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
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
    paddingVertical: 16,
    gap: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  confidenceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  imageContainer: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  foodImage: {
    width: '100%',
    height: 200,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  summaryCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  mealIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryInfo: {
    flex: 1,
  },
  mealName: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  mealType: {
    fontSize: 14,
    fontWeight: '400' as const,
  },
  totalCalories: {
    alignItems: 'center',
    marginBottom: 12,
  },
  totalCaloriesValue: {
    fontSize: 32,
    fontWeight: '300' as const,
    letterSpacing: -1,
  },
  totalCaloriesUnit: {
    fontSize: 14,
    fontWeight: '500' as const,
    marginTop: 2,
  },
  totalWeight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  totalWeightText: {
    fontSize: 13,
    fontWeight: '400' as const,
  },
  foodSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '400' as const,
  },
  foodItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  foodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  foodIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  foodPortion: {
    fontSize: 13,
    fontWeight: '400' as const,
  },
  foodCalories: {
    alignItems: 'flex-end',
  },
  calorieValue: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  calorieUnit: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  macroLabel: {
    fontSize: 11,
    fontWeight: '400' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  suggestionsSection: {
    marginBottom: 24,
  },
  suggestionToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
  },
  suggestionIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  notesCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  notesTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  notesText: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: '600' as const,
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  loadingSubtitle: {
    fontSize: 16,
    fontWeight: '400' as const,
    textAlign: 'center' as const,
    lineHeight: 22,
    marginBottom: 32,
  },
  loadingSpinner: {
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '500' as const,
    textAlign: 'center' as const,
    marginBottom: 24,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  sparkleContainer: {
    // Container for sparkle animation
  },
});