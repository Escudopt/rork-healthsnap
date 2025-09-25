import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Animated,
  Platform,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Check, Sparkles, Info, Edit3, Plus, Minus, Calendar, Clock, Zap, Star, TrendingUp, Award } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCalorieTracker } from '@/providers/CalorieTrackerProvider';

import { useTheme } from '@/providers/ThemeProvider';
import { BlurCard } from '@/components/BlurCard';
import * as Haptics from 'expo-haptics';
import { AnalysisResult, FoodItem } from '@/types/food';
import { generateObject } from '@rork/toolkit-sdk';
import { z } from 'zod';

export default function AnalysisScreen() {
  const { imageBase64 } = useLocalSearchParams<{ imageBase64: string }>();
  const { addMeal } = useCalorieTracker();

  const { colors, isDark } = useTheme();
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [mealName, setMealName] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [editingFood, setEditingFood] = useState<{ food: FoodItem; index: number } | null>(null);
  const [editedFoods, setEditedFoods] = useState<FoodItem[]>([]);
  const [editedMealType, setEditedMealType] = useState<string>('');
  const [showMealTypeModal, setShowMealTypeModal] = useState(false);
  const [showMealNameModal, setShowMealNameModal] = useState(false);
  const [tempMealName, setTempMealName] = useState<string>('');
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const editMenuAnim = useRef(new Animated.Value(0)).current;

  const analyzeImageWithLogMeal = useCallback(async (retryCount = 0) => {
    const maxRetries = 3;
    
    try {
      setIsAnalyzing(true);
      setError(null);

      console.log(`Starting LogMeal analysis... (attempt ${retryCount + 1}/${maxRetries + 1})`);
      
      if (!imageBase64) {
        throw new Error('Nenhuma imagem foi fornecida para análise');
      }
      
      const startTime = Date.now();

      // Step 1: Use LogMeal API for food detection
      console.log('Calling LogMeal API for food detection...');
      
      const logMealResponse = await fetch('https://api.logmeal.es/v2/image/segmentation/complete', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer e581865f523ce3657b7882fbf3cd6fdfc5dd6ca6',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: imageBase64
        })
      });

      if (!logMealResponse.ok) {
        throw new Error(`LogMeal API error: ${logMealResponse.status}`);
      }

      const logMealData = await logMealResponse.json();
      console.log('LogMeal response:', logMealData);

      // Step 2: Process LogMeal results and enhance with AI
      const analysisSchema = z.object({
        mealName: z.string().describe('Nome automático gerado para a refeição'),
        foods: z.array(z.object({
          name: z.string(),
          weightInGrams: z.number(),
          calories: z.number(),
          protein: z.number(),
          carbs: z.number(),
          fat: z.number(),
          fiber: z.number().optional(),
          sugar: z.number().optional(),
          sodium: z.number().optional(),
          portion: z.string()
        })),
        totalCalories: z.number(),
        totalWeight: z.number(),
        mealType: z.enum(['Café da Manhã', 'Almoço', 'Jantar', 'Lanche']),
        confidence: z.enum(['high', 'medium', 'low'])
      });

      // Add timeout to the request
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: A análise demorou muito para responder')), 45000);
      });

      console.log('Processing LogMeal data with AI enhancement...');
      
      const analysisPromise = generateObject({
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Com base nos dados da API LogMeal abaixo, processe e melhore a identificação dos alimentos, separando CADA INGREDIENTE com informações nutricionais precisas em português. Gere também um NOME AUTOMÁTICO para a refeição.
                
                DADOS DA LOGMEAL API:
                ${JSON.stringify(logMealData, null, 2)}
                
                REGRAS CRÍTICAS PARA PROCESSAMENTO:
                - Use os dados da LogMeal como base, mas melhore a identificação
                - Separe CADA ingrediente individualmente com pesos realistas em GRAMAS
                - Calcule valores nutricionais precisos por 100g e ajuste para o peso estimado
                - Identifique 4-10 ingredientes diferentes quando possível
                - Seja específico: "Peito de frango grelhado", não apenas "Frango"
                - Para vegetais, estime peso individual (ex: "Tomate" 80g, "Alface" 30g)
                - Para carnes, estime porções realistas (ex: "Peito de frango" 120g)
                - Para carboidratos, use medidas precisas (ex: "Arroz cozido" 150g)
                - Inclua temperos e molhos visíveis se significativos
                
                REGRAS PARA NOME AUTOMÁTICO DA REFEIÇÃO:
                - Crie um nome atrativo e descritivo baseado nos ingredientes principais
                - Use nomes brasileiros típicos (ex: "Frango com Arroz e Brócolis", "Salada Tropical", "Bowl Proteico")
                - Seja criativo mas realista
                - Máximo 4-5 palavras
                - Evite nomes genéricos como "Refeição" ou "Prato"
                
                Exemplo de resposta:
                {
                  "mealName": "Frango Grelhado com Arroz e Brócolis",
                  "foods": [
                    {
                      "name": "Peito de frango grelhado",
                      "weightInGrams": 120,
                      "calories": 198,
                      "protein": 37,
                      "carbs": 0,
                      "fat": 4,
                      "fiber": 0,
                      "portion": "120g"
                    }
                  ],
                  "totalCalories": 503,
                  "totalWeight": 360,
                  "mealType": "Almoço",
                  "confidence": "high"
                }`
              },
              {
                type: 'image',
                image: imageBase64
              }
            ]
          }
        ],
        schema: analysisSchema
      });

      console.log('Waiting for enhanced analysis result...');
      const result = await Promise.race([analysisPromise, timeoutPromise]) as any;
      console.log('Enhanced analysis result received:', result);
      
      const processingTime = Date.now() - startTime;
      console.log(`LogMeal + AI analysis completed in ${processingTime}ms`);
      
      // Validate the result structure
      if (!result || typeof result !== 'object') {
        throw new Error('Resposta inválida da análise');
      }
      
      if (!result.foods || !Array.isArray(result.foods) || result.foods.length === 0) {
        console.warn('No foods detected, creating fallback food item');
        result.foods = [{
          name: 'Alimento não identificado',
          weightInGrams: 100,
          calories: 150,
          protein: 5,
          carbs: 20,
          fat: 5,
          fiber: 2,
          portion: '100g'
        }];
        result.confidence = 'low';
      }
      
      // Validate and fix each food item
      result.foods = result.foods.map((food: any, index: number) => {
        const weightInGrams = Math.max(1, Number(food.weightInGrams) || 100);
        const validFood = {
          name: food.name || `Ingrediente ${index + 1}`,
          weightInGrams: weightInGrams,
          calories: Math.max(0, Number(food.calories) || 100),
          protein: Math.max(0, Number(food.protein) || 0),
          carbs: Math.max(0, Number(food.carbs) || 0),
          fat: Math.max(0, Number(food.fat) || 0),
          fiber: Math.max(0, Number(food.fiber) || 0),
          sugar: food.sugar ? Math.max(0, Number(food.sugar)) : undefined,
          sodium: food.sodium ? Math.max(0, Number(food.sodium)) : undefined,
          portion: food.portion || `${weightInGrams}g`
        };
        return validFood;
      });
      
      // Calculate the correct total calories from individual foods
      const calculatedTotal = result.foods.reduce((sum: number, food: any) => {
        return sum + (Number(food.calories) || 0);
      }, 0);
      
      // Fix the totalCalories if it doesn't match the sum
      if (result.totalCalories !== calculatedTotal) {
        console.log(`Fixing totalCalories: AI said ${result.totalCalories}, calculated ${calculatedTotal}`);
        result.totalCalories = calculatedTotal;
      }
      
      // Ensure we have a valid total
      if (result.totalCalories <= 0) {
        result.totalCalories = calculatedTotal > 0 ? calculatedTotal : 150;
      }
      
      // Ensure we have a valid meal type
      if (!result.mealType || !['Café da Manhã', 'Almoço', 'Jantar', 'Lanche'].includes(result.mealType)) {
        const currentHour = new Date().getHours();
        if (currentHour < 10) {
          result.mealType = 'Café da Manhã';
        } else if (currentHour < 15) {
          result.mealType = 'Almoço';
        } else if (currentHour < 19) {
          result.mealType = 'Lanche';
        } else {
          result.mealType = 'Jantar';
        }
      }
      
      // Ensure we have a valid confidence level
      if (!result.confidence || !['high', 'medium', 'low'].includes(result.confidence)) {
        result.confidence = 'high'; // LogMeal + AI should have higher confidence
      }
      
      console.log('LogMeal + AI analysis result:', result);
      setAnalysisResult(result);
      setEditedFoods(result.foods);
      setEditedMealType(result.mealType);
      setMealName(result.mealName || 'Refeição Personalizada');
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 12,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();
      
      setTimeout(() => {
        setShowEditMenu(true);
        Animated.timing(editMenuAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }, 200);
      
      setIsAnalyzing(false);
    } catch (err) {
      console.error(`Error in LogMeal analysis (attempt ${retryCount + 1}):`, err);
      
      const isNetworkError = err instanceof Error && (
        err.message.includes('Network request failed') ||
        err.message.includes('fetch') ||
        err.message.includes('Timeout') ||
        err.message.includes('Failed to fetch') ||
        err.message.includes('NetworkError') ||
        err.message.includes('TypeError') ||
        err.message.includes('LogMeal API error')
      );
      
      if (isNetworkError && retryCount < maxRetries) {
        console.log(`Retrying LogMeal in ${(retryCount + 1) * 2} seconds...`);
        setTimeout(() => {
          analyzeImageWithLogMeal(retryCount + 1);
        }, (retryCount + 1) * 2000);
        return;
      }
      
      // If LogMeal fails, throw error to trigger fallback
      throw err;
    }
  }, [imageBase64, fadeAnim, slideAnim, editMenuAnim]);

  // Fallback function using the original AI analysis
  const analyzeImageFallback = useCallback(async (retryCount = 0) => {
    const maxRetries = 3;
    
    try {
      setIsAnalyzing(true);
      setError(null);

      console.log(`Starting fallback AI analysis... (attempt ${retryCount + 1}/${maxRetries + 1})`);
      
      if (!imageBase64) {
        throw new Error('Nenhuma imagem foi fornecida para análise');
      }
      
      const startTime = Date.now();

      const analysisSchema = z.object({
        mealName: z.string().describe('Nome automático gerado para a refeição'),
        foods: z.array(z.object({
          name: z.string(),
          weightInGrams: z.number(),
          calories: z.number(),
          protein: z.number(),
          carbs: z.number(),
          fat: z.number(),
          fiber: z.number().optional(),
          sugar: z.number().optional(),
          sodium: z.number().optional(),
          portion: z.string()
        })),
        totalCalories: z.number(),
        totalWeight: z.number(),
        mealType: z.enum(['Café da Manhã', 'Almoço', 'Jantar', 'Lanche']),
        confidence: z.enum(['high', 'medium', 'low'])
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: A análise demorou muito para responder')), 45000);
      });

      console.log('Calling generateObject with image data...');
      
      const analysisPromise = generateObject({
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analise esta imagem de comida e identifique CADA INGREDIENTE SEPARADAMENTE com informações nutricionais precisas em português. Também gere um NOME AUTOMÁTICO para a refeição.
                
                REGRAS CRÍTICAS PARA SEPARAÇÃO DE INGREDIENTES:
                - Separe CADA ingrediente individualmente (ex: se vê arroz com feijão, liste "Arroz branco" e "Feijão preto" separadamente)
                - Estime o peso em GRAMAS para cada ingrediente (muito importante!)
                - Use estimativas realistas baseadas no tamanho visual
                - Calcule valores nutricionais por 100g e ajuste para o peso estimado
                - Identifique 4-10 ingredientes diferentes quando possível
                - Seja específico: "Peito de frango grelhado", não apenas "Frango"
                - Inclua temperos e molhos visíveis se significativos
                - Para vegetais, estime peso individual (ex: "Tomate" 80g, "Alface" 30g)
                - Para carnes, estime porções realistas (ex: "Peito de frango" 120g)
                - Para carboidratos, use medidas precisas (ex: "Arroz cozido" 150g)
                - Separe até mesmo ingredientes pequenos como cebola, alho, azeite se visíveis
                - Para pratos compostos, decomponha em ingredientes básicos
                
                REGRAS PARA NOME AUTOMÁTICO DA REFEIÇÃO:
                - Crie um nome atrativo e descritivo baseado nos ingredientes principais
                - Use nomes brasileiros típicos (ex: "Frango com Arroz e Brócolis", "Salada Tropical", "Bowl Proteico")
                - Seja criativo mas realista
                - Máximo 4-5 palavras
                - Evite nomes genéricos como "Refeição" ou "Prato"
                
                Exemplo de resposta detalhada:
                {
                  "mealName": "Frango Grelhado com Arroz e Brócolis",
                  "foods": [
                    {
                      "name": "Peito de frango grelhado",
                      "weightInGrams": 120,
                      "calories": 198,
                      "protein": 37,
                      "carbs": 0,
                      "fat": 4,
                      "fiber": 0,
                      "portion": "120g"
                    },
                    {
                      "name": "Arroz branco cozido",
                      "weightInGrams": 150,
                      "calories": 195,
                      "protein": 4,
                      "carbs": 43,
                      "fat": 0.5,
                      "fiber": 1,
                      "portion": "150g"
                    },
                    {
                      "name": "Brócolis cozido",
                      "weightInGrams": 80,
                      "calories": 22,
                      "protein": 2,
                      "carbs": 4,
                      "fat": 0,
                      "fiber": 2,
                      "portion": "80g"
                    },
                    {
                      "name": "Azeite de oliva",
                      "weightInGrams": 10,
                      "calories": 88,
                      "protein": 0,
                      "carbs": 0,
                      "fat": 10,
                      "fiber": 0,
                      "portion": "1 colher de sopa"
                    }
                  ],
                  "totalCalories": 503,
                  "totalWeight": 360,
                  "mealType": "Almoço",
                  "confidence": "high"
                }`
              },
              {
                type: 'image',
                image: imageBase64
              }
            ]
          }
        ],
        schema: analysisSchema
      });

      console.log('Waiting for analysis result...');
      const result = await Promise.race([analysisPromise, timeoutPromise]) as any;
      console.log('Analysis result received:', result);
      
      const processingTime = Date.now() - startTime;
      console.log(`Analysis completed in ${processingTime}ms`);
      
      // Validate the result structure
      if (!result || typeof result !== 'object') {
        throw new Error('Resposta inválida da análise');
      }
      
      if (!result.foods || !Array.isArray(result.foods) || result.foods.length === 0) {
        console.warn('No foods detected, creating fallback food item');
        result.foods = [{
          name: 'Alimento não identificado',
          weightInGrams: 100,
          calories: 150,
          protein: 5,
          carbs: 20,
          fat: 5,
          fiber: 2,
          portion: '100g'
        }];
        result.confidence = 'low';
      }
      
      // Validate and fix each food item
      result.foods = result.foods.map((food: any, index: number) => {
        const weightInGrams = Math.max(1, Number(food.weightInGrams) || 100);
        const validFood = {
          name: food.name || `Ingrediente ${index + 1}`,
          weightInGrams: weightInGrams,
          calories: Math.max(0, Number(food.calories) || 100),
          protein: Math.max(0, Number(food.protein) || 0),
          carbs: Math.max(0, Number(food.carbs) || 0),
          fat: Math.max(0, Number(food.fat) || 0),
          fiber: Math.max(0, Number(food.fiber) || 0),
          sugar: food.sugar ? Math.max(0, Number(food.sugar)) : undefined,
          sodium: food.sodium ? Math.max(0, Number(food.sodium)) : undefined,
          portion: food.portion || `${weightInGrams}g`
        };
        return validFood;
      });
      
      // Calculate the correct total calories from individual foods
      const calculatedTotal = result.foods.reduce((sum: number, food: any) => {
        return sum + (Number(food.calories) || 0);
      }, 0);
      
      // Fix the totalCalories if it doesn't match the sum
      if (result.totalCalories !== calculatedTotal) {
        console.log(`Fixing totalCalories: AI said ${result.totalCalories}, calculated ${calculatedTotal}`);
        result.totalCalories = calculatedTotal;
      }
      
      // Ensure we have a valid total
      if (result.totalCalories <= 0) {
        result.totalCalories = calculatedTotal > 0 ? calculatedTotal : 150;
      }
      
      // Ensure we have a valid meal type
      if (!result.mealType || !['Café da Manhã', 'Almoço', 'Jantar', 'Lanche'].includes(result.mealType)) {
        const currentHour = new Date().getHours();
        if (currentHour < 10) {
          result.mealType = 'Café da Manhã';
        } else if (currentHour < 15) {
          result.mealType = 'Almoço';
        } else if (currentHour < 19) {
          result.mealType = 'Lanche';
        } else {
          result.mealType = 'Jantar';
        }
      }
      
      // Ensure we have a valid confidence level
      if (!result.confidence || !['high', 'medium', 'low'].includes(result.confidence)) {
        result.confidence = 'medium';
      }
      
      console.log('Analysis result:', result);
      setAnalysisResult(result);
      setEditedFoods(result.foods);
      setEditedMealType(result.mealType);
      setMealName(result.mealName || 'Refeição Personalizada');
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 12,
          tension: 80,
          useNativeDriver: true,
        }),
      ]).start();
      
      setTimeout(() => {
        setShowEditMenu(true);
        Animated.timing(editMenuAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }, 200);
      
      setIsAnalyzing(false);
    } catch (err) {
      console.error(`Error in fallback analysis (attempt ${retryCount + 1}):`, err);
      
      const isNetworkError = err instanceof Error && (
        err.message.includes('Network request failed') ||
        err.message.includes('fetch') ||
        err.message.includes('Timeout') ||
        err.message.includes('Failed to fetch') ||
        err.message.includes('NetworkError') ||
        err.message.includes('TypeError')
      );
      
      if (isNetworkError && retryCount < maxRetries) {
        console.log(`Retrying fallback in ${(retryCount + 1) * 2} seconds...`);
        setTimeout(() => {
          analyzeImageFallback(retryCount + 1);
        }, (retryCount + 1) * 2000);
        return;
      }
      
      if (retryCount >= maxRetries) {
        console.log('All fallback retries failed, creating final fallback...');
        const fallbackResult = {
          mealName: 'Refeição Mista',
          foods: [{
            name: 'Refeição mista (análise manual necessária)',
            weightInGrams: 200,
            calories: 300,
            protein: 15,
            carbs: 35,
            fat: 10,
            fiber: 5,
            portion: '200g'
          }],
          totalCalories: 300,
          totalWeight: 200,
          mealType: (() => {
            const currentHour = new Date().getHours();
            if (currentHour < 10) return 'Café da Manhã';
            if (currentHour < 15) return 'Almoço';
            if (currentHour < 19) return 'Lanche';
            return 'Jantar';
          })() as 'Café da Manhã' | 'Almoço' | 'Jantar' | 'Lanche',
          confidence: 'low' as 'high' | 'medium' | 'low'
        };
        
        setAnalysisResult(fallbackResult);
        setEditedFoods(fallbackResult.foods);
        setEditedMealType(fallbackResult.mealType);
        setMealName(fallbackResult.mealName);
        
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 250,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            friction: 12,
            tension: 80,
            useNativeDriver: true,
          }),
        ]).start();
        
        setTimeout(() => {
          setShowEditMenu(true);
          Animated.timing(editMenuAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start();
        }, 200);
        
        setIsAnalyzing(false);
        return;
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      let userFriendlyMessage = 'Não foi possível analisar a imagem automaticamente';
      
      if (isNetworkError) {
        userFriendlyMessage = 'Erro de conexão. Verifique sua internet e tente novamente';
      } else if (errorMessage.includes('Timeout')) {
        userFriendlyMessage = 'A análise demorou muito. Tente novamente';
      } else if (errorMessage.includes('generateObject')) {
        userFriendlyMessage = 'Serviço de análise temporariamente indisponível';
      }
      
      setError(userFriendlyMessage);
      setIsAnalyzing(false);
    }
  }, [imageBase64, fadeAnim, slideAnim, editMenuAnim]);

  // Main analysis function that tries LogMeal first, then falls back to AI
  const analyzeImage = useCallback(async (retryCount = 0) => {
    try {
      console.log('Starting analysis with LogMeal API...');
      await analyzeImageWithLogMeal(retryCount);
    } catch (logMealError) {
      console.warn('LogMeal API failed, falling back to AI analysis:', logMealError);
      try {
        await analyzeImageFallback(retryCount);
      } catch (fallbackError) {
        console.error('Both LogMeal and AI analysis failed:', fallbackError);
        setError('Não foi possível analisar a imagem. Tente novamente.');
        setIsAnalyzing(false);
      }
    }
  }, [analyzeImageWithLogMeal, analyzeImageFallback]);

  useEffect(() => {
    if (imageBase64) {
      analyzeImage();
    }
  }, [imageBase64]);

  const handleSave = async () => {
    if (!analysisResult) return;

    try {
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      const totalCalories = editedFoods.reduce((sum, food) => sum + food.calories, 0);

      // Save to local storage
      await addMeal({
        foods: editedFoods,
        totalCalories: totalCalories,
        mealType: editedMealType,
        imageBase64: imageBase64,
        mealName: mealName,
      });



      Alert.alert(
        'Refeição Salva!',
        `${totalCalories} calorias adicionadas ao seu dia.`,
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error saving meal:', error);
      Alert.alert(
        'Erro ao Salvar',
        'Não foi possível salvar a refeição. Tente novamente.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleEditFood = (food: FoodItem, index: number) => {
    setEditingFood({ food: { ...food }, index });
  };

  const handleSaveEditedFood = () => {
    if (!editingFood) return;
    
    const updatedFoods = [...editedFoods];
    updatedFoods[editingFood.index] = editingFood.food;
    setEditedFoods(updatedFoods);
    setEditingFood(null);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleRemoveFood = (index: number) => {
    Alert.alert(
      'Remover Alimento',
      'Tem certeza que deseja remover este alimento?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            const updatedFoods = editedFoods.filter((_, i) => i !== index);
            setEditedFoods(updatedFoods);
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
          }
        }
      ]
    );
  };

  const handleAddFood = () => {
    const newFood: FoodItem = {
      name: 'Novo Ingrediente',
      weightInGrams: 100,
      calories: 100,
      protein: 5,
      carbs: 15,
      fat: 3,
      fiber: 2,
      portion: '100g'
    };
    setEditedFoods([...editedFoods, newFood]);
    setEditingFood({ food: newFood, index: editedFoods.length });
  };

  const mealTypes = ['Café da Manhã', 'Almoço', 'Jantar', 'Lanche'];

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const totalEditedCalories = editedFoods.reduce((sum, food) => sum + food.calories, 0);

  const handleClose = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000000' : '#F2F2F7' }]}>
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
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={[styles.closeButton, { backgroundColor: colors.surfaceElevated }]}>
            <X color={colors.text} size={24} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Análise Nutricional</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {imageBase64 && (
            <BlurCard style={styles.imageCard}>
              <Image 
                source={{ uri: `data:image/jpeg;base64,${imageBase64}` }}
                style={styles.foodImage}
                resizeMode="cover"
              />
            </BlurCard>
          )}

          {isAnalyzing ? (
            <BlurCard style={styles.loadingCard}>
              <View style={styles.loadingIconContainer}>
                <Zap color="#FFD700" size={32} />
                <ActivityIndicator size="large" color={colors.text} style={styles.loadingSpinner} />
              </View>
              <Text style={[styles.loadingText, { color: colors.text }]}>Analisando com IA...</Text>
              <View style={styles.sparkleRow}>
                <Sparkles color="#FFD700" size={20} />
                <Text style={[styles.loadingSubtext, { color: colors.textSecondary }]}>
                  Usando LogMeal API + IA para identificação precisa
                </Text>
                <Sparkles color="#FFD700" size={20} />
              </View>
              <View style={styles.loadingProgress}>
                <View style={styles.progressBar}>
                  <Animated.View style={[styles.progressFill, { width: '85%' }]} />
                </View>
                <Text style={[styles.progressText, { color: colors.textSecondary }]}>85% concluído</Text>
              </View>
              <Text style={[styles.loadingTip, { color: colors.textTertiary }]}>
                🔬 LogMeal detecta alimentos + IA separa ingredientes e gera nome automático...
              </Text>
            </BlurCard>
          ) : error ? (
            <BlurCard style={styles.errorCard}>
              <Info color={colors.text} size={32} />
              <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
              <TouchableOpacity onPress={() => analyzeImage(0)} style={[styles.retryButton, { backgroundColor: colors.surfaceElevated }]}>
                <Text style={[styles.retryButtonText, { color: colors.text }]}>Tentar Novamente</Text>
              </TouchableOpacity>
            </BlurCard>
          ) : analysisResult ? (
            <Animated.View style={[
              styles.resultsContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}>
              <BlurCard style={styles.totalCard}>
                <View style={styles.mealNameContainer}>
                  <Sparkles color="#FFD700" size={20} />
                  <Text style={[styles.mealNameText, { color: colors.text }]}>{mealName}</Text>
                  <TouchableOpacity onPress={() => {
                    setTempMealName(mealName);
                    setShowMealNameModal(true);
                  }} style={styles.editMealNameButton}>
                    <Edit3 color={colors.textSecondary} size={16} />
                  </TouchableOpacity>
                </View>
                <View style={styles.totalHeader}>
                  <Award color="#FFD700" size={24} />
                  <Text style={[styles.totalLabel, { color: colors.textSecondary }]}>Total de Calorias</Text>
                  <Award color="#FFD700" size={24} />
                </View>
                <View style={styles.calorieDisplay}>
                  <Text style={[styles.totalValue, { color: colors.text }]}>{totalEditedCalories}</Text>
                  <Text style={[styles.totalUnit, { color: colors.textSecondary }]}>kcal</Text>
                </View>
                <View style={styles.calorieIndicator}>
                  <View style={styles.calorieBar}>
                    <View style={[styles.calorieBarFill, { width: `${Math.min((totalEditedCalories / 2000) * 100, 100)}%` }]} />
                  </View>
                  <Text style={[styles.caloriePercentage, { color: colors.textSecondary }]}>
                    {Math.round((totalEditedCalories / 2000) * 100)}% da meta diária
                  </Text>
                </View>
                <TouchableOpacity 
                  style={[styles.mealTypeChip, { backgroundColor: colors.surfaceElevated }]}
                  onPress={() => setShowMealTypeModal(true)}
                >
                  <Text style={[styles.mealTypeText, { color: colors.text }]}>{editedMealType}</Text>
                  <Edit3 color={colors.text} size={14} />
                </TouchableOpacity>
              </BlurCard>

              <View style={styles.foodsHeader}>
                <View style={styles.foodsTitleContainer}>
                  <TrendingUp color="#4ECDC4" size={20} />
                  <Text style={[styles.foodsTitle, { color: colors.text }]}>Ingredientes Identificados ({editedFoods.length})</Text>
                </View>
                <View style={styles.totalWeightContainer}>
                  <Text style={[styles.totalWeightText, { color: colors.textSecondary }]}>⚖️ {editedFoods.reduce((sum, food) => sum + food.weightInGrams, 0)}g total</Text>
                  <TouchableOpacity onPress={handleAddFood} style={[styles.addFoodButton, { backgroundColor: colors.surfaceElevated }]}>
                    <Plus color={colors.text} size={20} />
                  </TouchableOpacity>
                </View>
              </View>
              
              {editedFoods.map((food, index) => (
                <BlurCard key={`${food.name}-${index}`} style={styles.foodCard}>
                  <View style={styles.foodHeader}>
                    <View style={styles.foodNameContainer}>
                      <Star color="#FFD700" size={16} />
                      <Text style={[styles.foodName, { color: colors.text }]}>{food.name}</Text>
                    </View>
                    <View style={styles.foodActions}>
                      <View style={styles.caloriesBadge}>
                        <Text style={[styles.foodCalories, { color: colors.text }]}>{food.calories}</Text>
                        <Text style={[styles.caloriesUnit, { color: colors.textSecondary }]}>kcal</Text>
                      </View>
                      <TouchableOpacity 
                        onPress={() => handleEditFood(food, index)}
                        style={styles.editButton}
                      >
                        <Edit3 color={colors.textSecondary} size={16} />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => handleRemoveFood(index)}
                        style={styles.removeButton}
                      >
                        <Minus color={colors.textSecondary} size={16} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.portionContainer}>
                    <Text style={[styles.foodPortion, { color: colors.textSecondary }]}>📏 {food.portion}</Text>
                    <Text style={[styles.foodWeight, { color: colors.text }]}>⚖️ {food.weightInGrams}g</Text>
                  </View>
                  <View style={styles.macrosContainer}>
                    <View style={styles.macrosRow}>
                      <View style={[styles.macroItem, styles.proteinMacro]}>
                        <Text style={[styles.macroValue, { color: colors.text }]}>{food.protein}g</Text>
                        <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>🥩 Proteína</Text>
                      </View>
                      <View style={[styles.macroItem, styles.carbsMacro]}>
                        <Text style={[styles.macroValue, { color: colors.text }]}>{food.carbs}g</Text>
                        <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>🍞 Carbos</Text>
                      </View>
                      <View style={[styles.macroItem, styles.fatMacro]}>
                        <Text style={[styles.macroValue, { color: colors.text }]}>{food.fat}g</Text>
                        <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>🥑 Gordura</Text>
                      </View>
                    </View>
                  </View>
                </BlurCard>
              ))}

              {showEditMenu && (
                <Animated.View style={[
                  styles.editMenuContainer,
                  { opacity: editMenuAnim }
                ]}>
                  <BlurCard style={styles.editMenuCard}>
                    <View style={styles.editMenuHeader}>
                      <Calendar color={colors.text} size={20} />
                      <Text style={[styles.editMenuTitle, { color: colors.text }]}>Detalhes da Refeição</Text>
                      <Clock color={colors.text} size={20} />
                    </View>
                    
                    <View style={styles.mealDetailsRow}>
                      <Text style={[styles.mealDetailLabel, { color: colors.textSecondary }]}>Data:</Text>
                      <Text style={[styles.mealDetailValue, { color: colors.text }]}>{getCurrentDate()}</Text>
                    </View>
                    
                    <View style={styles.mealDetailsRow}>
                      <Text style={[styles.mealDetailLabel, { color: colors.textSecondary }]}>Hora:</Text>
                      <Text style={[styles.mealDetailValue, { color: colors.text }]}>{getCurrentTime()}</Text>
                    </View>
                    
                    <View style={styles.mealDetailsRow}>
                      <Text style={[styles.mealDetailLabel, { color: colors.textSecondary }]}>Tipo:</Text>
                      <TouchableOpacity 
                        onPress={() => setShowMealTypeModal(true)}
                        style={styles.mealTypeButton}
                      >
                        <Text style={[styles.mealDetailValue, { color: colors.text }]}>{editedMealType}</Text>
                        <Edit3 color={colors.textSecondary} size={14} />
                      </TouchableOpacity>
                    </View>
                    
                    <Text style={[styles.editMenuSubtitle, { color: colors.textTertiary }]}>
                      Toque nos alimentos para editar ou use + para adicionar mais
                    </Text>
                  </BlurCard>
                </Animated.View>
              )}

              <BlurCard style={styles.confidenceCard}>
                <View style={styles.confidenceHeader}>
                  <Sparkles color="#4ECDC4" size={20} />
                  <Text style={[styles.confidenceTitle, { color: colors.text }]}>Precisão da Análise</Text>
                </View>
                <View style={styles.confidenceIndicator}>
                  <View style={styles.confidenceBar}>
                    <View style={[
                      styles.confidenceBarFill,
                      {
                        width: analysisResult.confidence === 'high' ? '90%' :
                               analysisResult.confidence === 'medium' ? '70%' : '40%',
                        backgroundColor: analysisResult.confidence === 'high' ? '#4ECDC4' :
                                       analysisResult.confidence === 'medium' ? '#FFD700' : '#FF6B6B'
                      }
                    ]} />
                  </View>
                  <Text style={[styles.confidenceText, { color: colors.textSecondary }]}>
                    {
                      analysisResult.confidence === 'high' ? '🎯 Alta Precisão (90%)' :
                      analysisResult.confidence === 'medium' ? '👍 Boa Precisão (70%)' : '⚠️ Precisão Moderada (40%)'
                    }
                  </Text>
                </View>
                {analysisResult.notes && (
                  <Text style={[styles.notesText, { color: colors.textTertiary }]}>💡 {analysisResult.notes}</Text>
                )}
              </BlurCard>
            </Animated.View>
          ) : null}
        </ScrollView>

        {analysisResult && !isAnalyzing && (
          <View style={styles.bottomActions}>
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.saveButtonGradient}
              >
                <Check color="white" size={24} />
                <Text style={styles.saveButtonText}>Salvar Refeição ({totalEditedCalories} kcal)</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Food Edit Modal */}
        <Modal
          visible={editingFood !== null}
          transparent
          animationType="slide"
          onRequestClose={() => setEditingFood(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modalGradient}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Editar Alimento</Text>
                  <TouchableOpacity
                    onPress={() => setEditingFood(null)}
                    style={styles.modalCloseButton}
                  >
                    <X color="white" size={24} />
                  </TouchableOpacity>
                </View>
                
                {editingFood && (
                  <View style={styles.modalContent}>
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Nome do Alimento</Text>
                      <TextInput
                        style={styles.textInput}
                        value={editingFood.food.name}
                        onChangeText={(text) => setEditingFood({
                          ...editingFood,
                          food: { ...editingFood.food, name: text }
                        })}
                        placeholder="Nome do alimento"
                        placeholderTextColor="rgba(255, 255, 255, 0.6)"
                      />
                    </View>
                    
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Porção</Text>
                      <TextInput
                        style={styles.textInput}
                        value={editingFood.food.portion}
                        onChangeText={(text) => setEditingFood({
                          ...editingFood,
                          food: { ...editingFood.food, portion: text }
                        })}
                        placeholder="Ex: 1 xícara, 100g"
                        placeholderTextColor="rgba(255, 255, 255, 0.6)"
                      />
                    </View>
                    
                    <View style={styles.macroInputsRow}>
                      <View style={styles.macroInputGroup}>
                        <Text style={styles.inputLabel}>Calorias</Text>
                        <TextInput
                          style={styles.numberInput}
                          value={editingFood.food.calories.toString()}
                          onChangeText={(text) => setEditingFood({
                            ...editingFood,
                            food: { ...editingFood.food, calories: parseInt(text) || 0 }
                          })}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor="rgba(255, 255, 255, 0.6)"
                        />
                      </View>
                      
                      <View style={styles.macroInputGroup}>
                        <Text style={styles.inputLabel}>Proteína (g)</Text>
                        <TextInput
                          style={styles.numberInput}
                          value={editingFood.food.protein.toString()}
                          onChangeText={(text) => setEditingFood({
                            ...editingFood,
                            food: { ...editingFood.food, protein: parseInt(text) || 0 }
                          })}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor="rgba(255, 255, 255, 0.6)"
                        />
                      </View>
                    </View>
                    
                    <View style={styles.macroInputsRow}>
                      <View style={styles.macroInputGroup}>
                        <Text style={styles.inputLabel}>Carboidratos (g)</Text>
                        <TextInput
                          style={styles.numberInput}
                          value={editingFood.food.carbs.toString()}
                          onChangeText={(text) => setEditingFood({
                            ...editingFood,
                            food: { ...editingFood.food, carbs: parseInt(text) || 0 }
                          })}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor="rgba(255, 255, 255, 0.6)"
                        />
                      </View>
                      
                      <View style={styles.macroInputGroup}>
                        <Text style={styles.inputLabel}>Gordura (g)</Text>
                        <TextInput
                          style={styles.numberInput}
                          value={editingFood.food.fat.toString()}
                          onChangeText={(text) => setEditingFood({
                            ...editingFood,
                            food: { ...editingFood.food, fat: parseInt(text) || 0 }
                          })}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor="rgba(255, 255, 255, 0.6)"
                        />
                      </View>
                    </View>
                    
                    <View style={styles.macroInputsRow}>
                      <View style={styles.macroInputGroup}>
                        <Text style={styles.inputLabel}>Fibra (g)</Text>
                        <TextInput
                          style={styles.numberInput}
                          value={(editingFood.food.fiber || 0).toString()}
                          onChangeText={(text) => setEditingFood({
                            ...editingFood,
                            food: { ...editingFood.food, fiber: parseInt(text) || 0 }
                          })}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor="rgba(255, 255, 255, 0.6)"
                        />
                      </View>
                      
                      <View style={styles.macroInputGroup}>
                        <Text style={styles.inputLabel}>Peso (g)</Text>
                        <TextInput
                          style={styles.numberInput}
                          value={editingFood.food.weightInGrams.toString()}
                          onChangeText={(text) => setEditingFood({
                            ...editingFood,
                            food: { ...editingFood.food, weightInGrams: parseInt(text) || 0 }
                          })}
                          keyboardType="numeric"
                          placeholder="0"
                          placeholderTextColor="rgba(255, 255, 255, 0.6)"
                        />
                      </View>
                    </View>
                    
                    <View style={styles.modalButtons}>
                      <TouchableOpacity
                        style={styles.modalCancelButton}
                        onPress={() => setEditingFood(null)}
                      >
                        <Text style={styles.modalCancelText}>Cancelar</Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.modalSaveButton}
                        onPress={handleSaveEditedFood}
                      >
                        <Text style={styles.modalSaveText}>Salvar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </LinearGradient>
            </View>
          </View>
        </Modal>

        {/* Meal Type Modal */}
        <Modal
          visible={showMealTypeModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowMealTypeModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.mealTypeModalContainer}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.mealTypeModalGradient}
              >
                <Text style={styles.mealTypeModalTitle}>Tipo de Refeição</Text>
                
                {mealTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.mealTypeOption,
                      editedMealType === type && styles.mealTypeOptionSelected
                    ]}
                    onPress={() => {
                      setEditedMealType(type);
                      setShowMealTypeModal(false);
                      if (Platform.OS !== 'web') {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                    }}
                  >
                    <Text style={[
                      styles.mealTypeOptionText,
                      editedMealType === type && styles.mealTypeOptionTextSelected
                    ]}>
                      {type}
                    </Text>
                    {editedMealType === type && (
                      <Check color="white" size={20} />
                    )}
                  </TouchableOpacity>
                ))}
                
                <TouchableOpacity
                  style={styles.mealTypeModalClose}
                  onPress={() => setShowMealTypeModal(false)}
                >
                  <Text style={styles.mealTypeModalCloseText}>Fechar</Text>
                </TouchableOpacity>
              </LinearGradient>
            </View>
          </View>
        </Modal>

        {/* Meal Name Edit Modal */}
        <Modal
          visible={showMealNameModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowMealNameModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.mealNameModalContainer}>
              <LinearGradient
                colors={['#667eea', '#764ba2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.mealNameModalGradient}
              >
                <Text style={styles.mealNameModalTitle}>Nome da Refeição</Text>
                
                <TextInput
                  style={styles.mealNameInput}
                  value={tempMealName}
                  onChangeText={setTempMealName}
                  placeholder="Digite um nome para a refeição"
                  placeholderTextColor="rgba(255, 255, 255, 0.6)"
                  maxLength={50}
                  autoFocus
                />
                
                <View style={styles.mealNameModalButtons}>
                  <TouchableOpacity
                    style={styles.mealNameCancelButton}
                    onPress={() => setShowMealNameModal(false)}
                  >
                    <Text style={styles.mealNameCancelText}>Cancelar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.mealNameSaveButton}
                    onPress={() => {
                      if (tempMealName.trim()) {
                        setMealName(tempMealName.trim());
                      }
                      setShowMealNameModal(false);
                    }}
                  >
                    <Text style={styles.mealNameSaveText}>Salvar</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </View>
        </Modal>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  imageCard: {
    padding: 8,
    marginBottom: 20,
  },
  foodImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  loadingCard: {
    padding: 32,
    alignItems: 'center',
    marginTop: 40,
  },
  loadingText: {
    fontSize: 18,
    color: 'white',
    marginTop: 16,
    fontWeight: '600',
  },
  sparkleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  loadingSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  loadingTip: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: 16,
    fontStyle: 'italic',
  },
  errorCard: {
    padding: 32,
    alignItems: 'center',
    marginTop: 40,
  },
  errorText: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  resultsContainer: {
    marginTop: 20,
  },
  totalCard: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  totalLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  totalValue: {
    fontSize: 56,
    fontWeight: 'bold',
    color: 'white',
  },
  totalUnit: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  mealTypeChip: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mealTypeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  foodsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  foodCard: {
    padding: 16,
    marginBottom: 12,
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    flex: 1,
  },
  foodCalories: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  foodPortion: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
  },
  macrosRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  macroLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  confidenceContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  confidenceText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  notesText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  saveButton: {
    width: '100%',
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 40,
  },
  foodsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addFoodButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  foodActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editButton: {
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  removeButton: {
    padding: 6,
    backgroundColor: 'rgba(255, 100, 100, 0.2)',
    borderRadius: 8,
  },
  editMenuContainer: {
    marginTop: 20,
    marginBottom: 16,
  },
  editMenuCard: {
    padding: 20,
  },
  editMenuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  editMenuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  mealDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealDetailLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  mealDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  mealTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editMenuSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalGradient: {
    padding: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
    paddingTop: 10,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    fontWeight: '600',
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: 'white',
  },
  macroInputsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  macroInputGroup: {
    flex: 1,
  },
  numberInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalCancelText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  modalSaveText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mealTypeModalContainer: {
    width: '80%',
    maxWidth: 300,
    borderRadius: 20,
    overflow: 'hidden',
  },
  mealTypeModalGradient: {
    padding: 20,
  },
  mealTypeModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  mealTypeOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 8,
  },
  mealTypeOptionSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  mealTypeOptionText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  mealTypeOptionTextSelected: {
    color: 'white',
    fontWeight: 'bold',
  },
  mealTypeModalClose: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  mealTypeModalCloseText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  // New enhanced styles
  loadingIconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  loadingSpinner: {
    marginLeft: 8,
  },
  loadingProgress: {
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
  },
  progressBar: {
    width: '80%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
  },
  totalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  calorieDisplay: {
    alignItems: 'center',
    marginBottom: 16,
  },
  calorieIndicator: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },
  calorieBar: {
    width: '90%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  calorieBarFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 4,
  },
  caloriePercentage: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  foodsTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  foodNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  caloriesBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
  },
  caloriesUnit: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  macrosContainer: {
    marginTop: 8,
  },
  proteinMacro: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  carbsMacro: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  fatMacro: {
    backgroundColor: 'rgba(78, 205, 196, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  confidenceCard: {
    padding: 20,
    marginTop: 16,
  },
  confidenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    justifyContent: 'center',
  },
  confidenceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  confidenceIndicator: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  confidenceBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  confidenceBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  portionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  foodWeight: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    backgroundColor: 'rgba(78, 205, 196, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  totalWeightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  totalWeightText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  mealNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  mealNameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    flex: 1,
  },
  editMealNameButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  mealNameModalContainer: {
    width: '85%',
    maxWidth: 350,
    borderRadius: 20,
    overflow: 'hidden',
  },
  mealNameModalGradient: {
    padding: 24,
  },
  mealNameModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
  },
  mealNameInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  mealNameModalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  mealNameCancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  mealNameCancelText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  mealNameSaveButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  mealNameSaveText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});