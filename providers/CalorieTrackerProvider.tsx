import { useState, useEffect, useMemo, useCallback } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';
import { Meal, UserProfile, HealthMetrics } from '@/types/food';
import { generateText } from '@rork/toolkit-sdk';

// Health sync types (mock implementation for demonstration)
interface HealthRecord {
  value: number;
  startDate: Date;
  endDate: Date;
}

interface CalorieTrackerContextType {
  meals: Meal[];
  todayCalories: number;
  weeklyAverage: number;
  dailyGoal: number;
  isLoading: boolean;
  userProfile: UserProfile | null;
  healthMetrics: HealthMetrics | null;
  isHealthSyncEnabled: boolean;
  healthSyncStatus: 'idle' | 'syncing' | 'success' | 'error';
  addMeal: (mealData: Omit<Meal, 'id' | 'timestamp'>) => Promise<void>;
  addManualCalories: (calories: number, description?: string) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  resetData: () => Promise<void>;
  setDailyGoal: (goal: number) => Promise<void>;
  updateUserProfile: (profile: UserProfile) => Promise<void>;
  calculateHealthMetrics: (profile: UserProfile) => Promise<HealthMetrics>;
  calculateHealthScore: () => number;
  enableHealthSync: () => Promise<boolean>;
  disableHealthSync: () => Promise<void>;
  syncWithHealthApp: () => Promise<void>;
  importHealthData: () => Promise<void>;
  emergencyCleanup: () => Promise<void>;
}

const STORAGE_KEY = 'calorie_tracker_meals_v4'; // Updated version for better persistence
const BACKUP_STORAGE_KEY = 'calorie_tracker_meals_backup_v4';
const RESET_FLAG_KEY = 'calorie_tracker_reset_flag';
const GOAL_STORAGE_KEY = 'calorie_tracker_daily_goal';
const PROFILE_STORAGE_KEY = 'user_profile';
const HEALTH_SYNC_KEY = 'health_sync_enabled';
const LAST_HEALTH_SYNC_KEY = 'last_health_sync';

// Simplified global state management
let isInitialized = false;

// Force save meals to storage immediately with backup
const forceSaveMeals = async (meals: Meal[]) => {
  try {
    if (!Array.isArray(meals)) {
      console.error('Invalid meals data - not an array');
      return;
    }
    
    const validMeals = meals.filter(meal => {
      if (!meal || typeof meal !== 'object') return false;
      if (!meal.id || typeof meal.id !== 'string') return false;
      if (!meal.foods || !Array.isArray(meal.foods)) return false;
      if (typeof meal.totalCalories !== 'number' || isNaN(meal.totalCalories)) return false;
      return true;
    });
    
    const cleanedMeals = validMeals.map(meal => ({
      ...meal,
      totalCalories: isNaN(meal.totalCalories) ? 0 : meal.totalCalories,
      foods: meal.foods.map(food => ({
        ...food,
        calories: isNaN(food.calories) ? 0 : food.calories,
        protein: isNaN(food.protein) ? 0 : food.protein,
        carbs: isNaN(food.carbs) ? 0 : food.carbs,
        fat: isNaN(food.fat) ? 0 : food.fat
      }))
    }));
    
    const dataToSave = JSON.stringify(cleanedMeals, null, 0);
    
    // Save to both primary and backup storage
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEY, dataToSave),
      AsyncStorage.setItem(BACKUP_STORAGE_KEY, dataToSave)
    ]);
    
    console.log(`💾 FORCE SAVED ${cleanedMeals.length} meals to primary and backup storage`);
  } catch (error) {
    console.error('❌ Error force saving meals:', error);
    
    // Try to save to backup at least
    try {
      const validMeals = meals.filter(meal => meal && meal.id && meal.foods);
      const dataToSave = JSON.stringify(validMeals, null, 0);
      await AsyncStorage.setItem(BACKUP_STORAGE_KEY, dataToSave);
      console.log('💾 Saved to backup storage as fallback');
    } catch (backupError) {
      console.error('❌ Even backup save failed:', backupError);
    }
  }
};

export const [CalorieTrackerProvider, useCalorieTracker] = createContextHook<CalorieTrackerContextType>(() => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dailyGoal, setDailyGoalState] = useState<number>(2000); // Default 2000 calories
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics | null>(null);
  const [isHealthSyncEnabled, setIsHealthSyncEnabled] = useState<boolean>(false);
  const [healthSyncStatus, setHealthSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  
  console.log('🔢 Provider state - meals count:', meals.length, 'isInitialized:', isInitialized);

  const loadDailyGoal = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(GOAL_STORAGE_KEY);
      if (stored) {
        const goal = parseInt(stored);
        if (!isNaN(goal) && goal > 0) {
          setDailyGoalState(goal);
          console.log('📊 Loaded daily goal:', goal);
        }
      }
    } catch (error) {
      console.error('❌ Error loading daily goal:', error);
    }
  }, []);

  const calculateHealthMetrics = useCallback(async (profile: UserProfile): Promise<HealthMetrics> => {
    try {
      // Calculate BMI
      const heightInMeters = profile.height / 100;
      const bmi = profile.weight / (heightInMeters * heightInMeters);
      
      // Calculate BMR using Mifflin-St Jeor Equation
      let bmr: number;
      if (profile.gender === 'male') {
        bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age + 5;
      } else {
        bmr = 10 * profile.weight + 6.25 * profile.height - 5 * profile.age - 161;
      }
      
      // Calculate TDEE based on activity level
      const activityMultipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9
      };
      
      const tdee = bmr * activityMultipliers[profile.activityLevel];
      
      // Calculate recommended calories based on goal
      let recommendedCalories: number;
      switch (profile.goal) {
        case 'lose':
          recommendedCalories = Math.round(tdee - 500); // 500 calorie deficit
          break;
        case 'gain':
          recommendedCalories = Math.round(tdee + 300); // 300 calorie surplus
          break;
        default:
          recommendedCalories = Math.round(tdee);
      }
      
      // Calculate ideal weight range (BMI 18.5-24.9)
      const idealWeight = {
        min: Math.round(18.5 * heightInMeters * heightInMeters),
        max: Math.round(24.9 * heightInMeters * heightInMeters)
      };
      
      // Determine BMI category
      let bmiCategory: string;
      if (bmi < 18.5) bmiCategory = 'Abaixo do peso';
      else if (bmi < 25) bmiCategory = 'Peso normal';
      else if (bmi < 30) bmiCategory = 'Sobrepeso';
      else bmiCategory = 'Obesidade';
      
      // Use AI to generate personalized recommendations
      const aiPrompt = `
Analise os seguintes dados de saúde e forneça 3-4 recomendações personalizadas em português:

Perfil:
- Nome: ${profile.name}
- Idade: ${profile.age} anos
- Peso: ${profile.weight} kg
- Altura: ${profile.height} cm
- Sexo: ${profile.gender === 'male' ? 'Masculino' : 'Feminino'}
- Nível de atividade: ${profile.activityLevel}
- Objetivo: ${profile.goal === 'lose' ? 'Perder peso' : profile.goal === 'gain' ? 'Ganhar peso' : 'Manter peso'}

Métricas calculadas:
- IMC: ${bmi.toFixed(1)}
- TMB: ${Math.round(bmr)} kcal/dia
- TDEE: ${Math.round(tdee)} kcal/dia
- Categoria IMC: ${bmiCategory}
- Peso ideal: ${idealWeight.min}-${idealWeight.max} kg

Forneça recomendações práticas e específicas sobre:
1. Nutrição
2. Exercício
3. Estilo de vida
4. Metas realistas

Seja conciso e prático. Máximo 4 recomendações de 1-2 frases cada.`;
      
      let recommendations: string[] = [];
      try {
        const response = await generateText({
          messages: [
            {
              role: 'user',
              content: aiPrompt
            }
          ]
        });
        
        // Split the AI response into individual recommendations
        recommendations = response
          .split(/\d+\.\s*/)
          .filter((rec: string) => rec.trim().length > 0)
          .map((rec: string) => rec.trim())
          .slice(0, 4);
      } catch (aiError) {
        console.error('Error generating AI recommendations:', aiError);
        // Fallback recommendations
        recommendations = [
          'Mantenha uma alimentação equilibrada com proteínas, carboidratos e gorduras saudáveis.',
          'Pratique exercícios regularmente, combinando cardio e musculação.',
          'Beba pelo menos 2 litros de água por dia.',
          'Durma 7-9 horas por noite para uma recuperação adequada.'
        ];
      }
      
      const metrics: HealthMetrics = {
        bmi: Math.round(bmi * 10) / 10,
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        recommendedCalories,
        idealWeight,
        bmiCategory,
        recommendations
      };
      
      console.log('📊 Health metrics calculated:', metrics);
      return metrics;
      
    } catch (error) {
      console.error('❌ Error calculating health metrics:', error);
      throw error;
    }
  }, []);

  const saveMeals = useCallback(async (mealsToSave: Meal[]) => {
    try {
      if (!Array.isArray(mealsToSave)) {
        console.error('Invalid meals data - not an array');
        return;
      }
      
      // Validate each meal before saving
      const validMeals = mealsToSave.filter(meal => {
        if (!meal || typeof meal !== 'object') return false;
        if (!meal.id || typeof meal.id !== 'string') return false;
        if (!meal.foods || !Array.isArray(meal.foods)) return false;
        if (typeof meal.totalCalories !== 'number' || isNaN(meal.totalCalories)) return false;
        return true;
      });
      
      // Clean the data to prevent JSON issues
      const cleanedMeals = validMeals.map(meal => ({
        ...meal,
        totalCalories: isNaN(meal.totalCalories) ? 0 : meal.totalCalories,
        foods: meal.foods.map(food => ({
          ...food,
          calories: isNaN(food.calories) ? 0 : food.calories,
          protein: isNaN(food.protein) ? 0 : food.protein,
          carbs: isNaN(food.carbs) ? 0 : food.carbs,
          fat: isNaN(food.fat) ? 0 : food.fat
        }))
      }));
      
      const dataToSave = JSON.stringify(cleanedMeals, null, 0);
      
      // Validate the JSON string before saving
      try {
        JSON.parse(dataToSave); // Test if it's valid JSON
      } catch (jsonError) {
        console.error('❌ Generated invalid JSON, not saving:', jsonError);
        return;
      }
      
      // Save to both primary and backup storage
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEY, dataToSave),
        AsyncStorage.setItem(BACKUP_STORAGE_KEY, dataToSave)
      ]);
      
      console.log(`💾 Saved ${cleanedMeals.length} valid meals to primary and backup storage`);
    } catch (error) {
      console.error('❌ Error saving meals:', error);
    }
  }, []);

  const loadUserProfile = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
      if (stored) {
        try {
          const profile = JSON.parse(stored) as UserProfile;
          setUserProfile(profile);
          console.log('👤 Loaded user profile:', profile.name);
          
          // Calculate health metrics when profile is loaded
          const metrics = await calculateHealthMetrics(profile);
          setHealthMetrics(metrics);
        } catch (parseError) {
          console.error('❌ Error parsing user profile JSON:', parseError);
          console.error('❌ Corrupted profile data:', stored);
          // Clear corrupted profile data
          await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
        }
      }
      
      // Load health sync preference
      const healthSyncEnabled = await AsyncStorage.getItem(HEALTH_SYNC_KEY);
      setIsHealthSyncEnabled(healthSyncEnabled === 'true');
    } catch (error) {
      console.error('❌ Error loading user profile:', error);
    }
  }, [calculateHealthMetrics]);

  const loadMeals = useCallback(async () => {
    if (isInitialized) {
      console.log('⚠️ Meals already loaded, skipping...');
      return;
    }
    
    console.log('📥 Loading meals from storage...');
    setIsLoading(true);
    
    try {
      let stored = await AsyncStorage.getItem(STORAGE_KEY);
      console.log('📦 Raw stored data length:', stored?.length || 0);
      
      // Try backup if primary is empty
      if (!stored || stored === 'null' || stored === '[]' || stored === '') {
        console.log('🔄 Trying backup storage...');
        const backupStored = await AsyncStorage.getItem(BACKUP_STORAGE_KEY);
        if (backupStored && backupStored !== 'null' && backupStored !== '[]' && backupStored !== '') {
          stored = backupStored;
          console.log('✅ Restored from backup');
          // Restore primary from backup
          await AsyncStorage.setItem(STORAGE_KEY, stored);
        }
      }
      
      if (!stored || stored === 'null' || stored === '[]' || stored === '') {
        console.log('📭 No stored meals found');
        setMeals([]);
        return;
      }
      
      try {
        const parsedMeals = JSON.parse(stored) as Meal[];
        
        if (!Array.isArray(parsedMeals)) {
          console.log('❌ Invalid data format');
          setMeals([]);
          return;
        }
        
        // Filter valid meals
        const validMeals = parsedMeals.filter(meal => 
          meal && 
          meal.id && 
          meal.foods && 
          Array.isArray(meal.foods) &&
          typeof meal.totalCalories === 'number' &&
          meal.totalCalories >= 0 &&
          meal.timestamp
        );
        
        console.log(`✅ Loaded ${validMeals.length} valid meals`);
        setMeals(validMeals);
        
      } catch (parseError) {
        console.error('❌ JSON Parse error:', parseError);
        // Clear corrupted data
        await AsyncStorage.removeItem(STORAGE_KEY);
        await AsyncStorage.removeItem(BACKUP_STORAGE_KEY);
        setMeals([]);
      }
      
    } catch (error) {
      console.error('❌ Error loading meals:', error);
      setMeals([]);
    } finally {
      setIsLoading(false);
      isInitialized = true;
    }
  }, []);

  // Initialize app data
  useEffect(() => {
    const initializeApp = async () => {
      try {
        await Promise.all([
          loadDailyGoal(),
          loadUserProfile(),
          loadMeals()
        ]);
      } catch (error) {
        console.error('❌ Error during app initialization:', error);
        setIsLoading(false);
      }
    };
    
    initializeApp();
  }, [loadMeals, loadDailyGoal, loadUserProfile]);

  const addMeal = useCallback(async (mealData: Omit<Meal, 'id' | 'timestamp'>) => {
    try {
      if (!mealData.foods || !Array.isArray(mealData.foods) || mealData.foods.length === 0) {
        throw new Error('Dados da refeição inválidos');
      }
      
      const totalCalories = mealData.foods.reduce((sum, food) => {
        const calories = typeof food.calories === 'number' && food.calories > 0 ? food.calories : 0;
        return sum + calories;
      }, 0);
      
      if (totalCalories <= 0) {
        throw new Error('Calorias inválidas - deve ser maior que 0');
      }

      const newMeal: Meal = {
        ...mealData,
        totalCalories,
        id: `meal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
      };
      
      console.log(`➕ Adding meal: ${totalCalories} kcal`);
      
      const updatedMeals = [newMeal, ...meals];
      setMeals(updatedMeals);
      
      // Force immediate save to ensure persistence
      await saveMeals(updatedMeals);
      await forceSaveMeals(updatedMeals);
      
      // Verify the save worked
      const verification = await AsyncStorage.getItem(STORAGE_KEY);
      if (verification) {
        try {
          const parsed = JSON.parse(verification);
          console.log(`✅ Verified save: ${parsed.length} meals in storage`);
        } catch (verifyError) {
          console.error('❌ Verification parse error:', verifyError);
        }
      }
      
    } catch (error) {
      console.error('❌ Error adding meal:', error);
      throw error;
    }
  }, [meals, saveMeals]);

  const addManualCalories = useCallback(async (calories: number, description = 'Entrada Manual') => {
    try {
      if (typeof calories !== 'number' || calories <= 0) {
        throw new Error('Calorias inválidas - deve ser um número maior que 0');
      }
      
      const newMeal: Meal = {
        name: description,
        foods: [{
          name: description,
          calories: calories,
          portion: '1 porção',
          protein: 0,
          carbs: 0,
          fat: 0
        }],
        totalCalories: calories,
        id: `manual_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
      };
      
      console.log(`➕ Adding manual calories: ${calories} kcal - ${description}`);
      
      const updatedMeals = [newMeal, ...meals];
      setMeals(updatedMeals);
      
      // Force immediate save to ensure persistence
      await saveMeals(updatedMeals);
      await forceSaveMeals(updatedMeals);
      
      // Verify the save worked
      const verification = await AsyncStorage.getItem(STORAGE_KEY);
      if (verification) {
        try {
          const parsed = JSON.parse(verification);
          console.log(`✅ Verified manual save: ${parsed.length} meals in storage`);
        } catch (verifyError) {
          console.error('❌ Manual verification parse error:', verifyError);
        }
      }
      
    } catch (error) {
      console.error('❌ Error adding manual calories:', error);
      throw error;
    }
  }, [meals, saveMeals]);

  const deleteMeal = useCallback(async (id: string) => {
    try {
      const updatedMeals = meals.filter(meal => meal.id !== id);
      setMeals(updatedMeals);
      
      // Force immediate save after deletion
      await saveMeals(updatedMeals);
      await forceSaveMeals(updatedMeals);
      
      console.log(`🗑️ Deleted meal: ${id}`);
      
      // Verify the deletion was saved
      const verification = await AsyncStorage.getItem(STORAGE_KEY);
      if (verification) {
        try {
          const parsed = JSON.parse(verification);
          console.log(`✅ Verified deletion: ${parsed.length} meals remaining in storage`);
        } catch (verifyError) {
          console.error('❌ Deletion verification parse error:', verifyError);
        }
      }
    } catch (error) {
      console.error('❌ Error deleting meal:', error);
      throw error;
    }
  }, [meals, saveMeals]);

  const clearHistory = useCallback(async () => {
    try {
      console.log('🧹 Clearing all meals');
      setMeals([]);
      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log('✅ All meals cleared - calories now 0');
    } catch (error) {
      console.error('❌ Error clearing history:', error);
      setMeals([]);
    }
  }, []);

  const setDailyGoal = useCallback(async (goal: number) => {
    try {
      if (typeof goal !== 'number' || goal <= 0) {
        throw new Error('Meta inválida - deve ser um número maior que 0');
      }
      
      setDailyGoalState(goal);
      await AsyncStorage.setItem(GOAL_STORAGE_KEY, goal.toString());
      console.log('💾 Daily goal saved:', goal);
    } catch (error) {
      console.error('❌ Error saving daily goal:', error);
      throw error;
    }
  }, []);

  const updateUserProfile = useCallback(async (profile: UserProfile) => {
    try {
      setUserProfile(profile);
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
      console.log('💾 User profile saved:', profile.name);
      
      // Calculate and update health metrics
      const metrics = await calculateHealthMetrics(profile);
      setHealthMetrics(metrics);
      
      // Update daily goal based on calculated TDEE if not manually set
      if (metrics.recommendedCalories !== dailyGoal) {
        await setDailyGoal(metrics.recommendedCalories);
      }
    } catch (error) {
      console.error('❌ Error saving user profile:', error);
      throw error;
    }
  }, [dailyGoal, setDailyGoal, calculateHealthMetrics]);

  // Calculate health score based on calories, sugar, salt and protein
  const calculateHealthScore = useCallback(() => {
    if (!userProfile || !healthMetrics || meals.length === 0) return 0;
    
    // Get today's meals
    const today = new Date().toDateString();
    const todayMeals = meals.filter(meal => {
      if (!meal.timestamp) return false;
      try {
        return new Date(meal.timestamp).toDateString() === today;
      } catch {
        return false;
      }
    });
    
    if (todayMeals.length === 0) return 0;
    
    // Calculate totals for today
    const totals = todayMeals.reduce((acc, meal) => {
      meal.foods.forEach(food => {
        acc.calories += food.calories || 0;
        acc.protein += food.protein || 0;
        acc.sugar += food.sugar || 0;
        acc.sodium += food.sodium || 0;
      });
      return acc;
    }, { calories: 0, protein: 0, sugar: 0, sodium: 0 });
    
    // Define healthy targets based on user profile
    const targets = {
      calories: healthMetrics.recommendedCalories,
      protein: userProfile.weight * 1.2, // 1.2g per kg body weight
      sugar: 25, // WHO recommendation: max 25g per day
      sodium: 2300 // WHO recommendation: max 2300mg per day
    };
    
    // Calculate individual scores (0-100)
    let calorieScore = 100;
    const calorieRatio = totals.calories / targets.calories;
    if (calorieRatio < 0.8 || calorieRatio > 1.2) {
      calorieScore = Math.max(0, 100 - Math.abs(calorieRatio - 1) * 100);
    }
    
    // Protein score (higher is better, up to 2x target)
    const proteinRatio = totals.protein / targets.protein;
    const proteinScore = Math.min(100, proteinRatio * 50);
    
    // Sugar score (lower is better)
    const sugarScore = totals.sugar <= targets.sugar ? 100 : Math.max(0, 100 - ((totals.sugar - targets.sugar) / targets.sugar) * 100);
    
    // Sodium score (lower is better)
    const sodiumScore = totals.sodium <= targets.sodium ? 100 : Math.max(0, 100 - ((totals.sodium - targets.sodium) / targets.sodium) * 100);
    
    // Weighted average (calories 30%, protein 25%, sugar 25%, sodium 20%)
    const healthScore = Math.round(
      calorieScore * 0.30 +
      proteinScore * 0.25 +
      sugarScore * 0.25 +
      sodiumScore * 0.20
    );
    
    console.log('🏥 Health Score Calculation:', {
      totals,
      targets,
      scores: { calorieScore, proteinScore, sugarScore, sodiumScore },
      finalScore: healthScore
    });
    
    return Math.max(0, Math.min(100, healthScore));
  }, [meals, userProfile, healthMetrics]);

  const importHealthData = useCallback(async () => {
    if (Platform.OS === 'web' || !isHealthSyncEnabled) return;
    
    try {
      setHealthSyncStatus('syncing');
      
      // This is a mock implementation - real implementation would use native health APIs
      const calorieData: HealthRecord[] = [
        // Mock data for demonstration
        {
          value: 500,
          startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
          endDate: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      ];
      
      console.log('📊 Health data imported:', calorieData.length, 'records');
      
      // Process and add health data as meals
      for (const record of calorieData) {
        const calories = Math.round(record.value);
        if (calories > 0) {
          const existingMeal = meals.find(meal => 
            meal.timestamp && 
            new Date(meal.timestamp).toDateString() === new Date(record.startDate).toDateString() &&
            meal.name === 'Dados do App Saúde'
          );
          
          if (!existingMeal) {
            // Add health data as manual calories
            const newMeal: Meal = {
              name: 'Dados do App Saúde',
              foods: [{
                name: 'Dados do App Saúde',
                calories: calories,
                portion: '1 porção',
                protein: 0,
                carbs: 0,
                fat: 0
              }],
              totalCalories: calories,
              id: `health_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              timestamp: record.startDate.toISOString(),
            };
            
            const updatedMeals = [newMeal, ...meals];
            setMeals(updatedMeals);
            
            // Force immediate save for health data
            await saveMeals(updatedMeals);
            await forceSaveMeals(updatedMeals);
          }
        }
      }
      
      await AsyncStorage.setItem(LAST_HEALTH_SYNC_KEY, new Date().toISOString());
      setHealthSyncStatus('success');
      
    } catch (error) {
      console.error('❌ Error importing health data:', error);
      setHealthSyncStatus('error');
    }
  }, [isHealthSyncEnabled, meals, saveMeals]);

  const enableHealthSync = useCallback(async (): Promise<boolean> => {
    if (Platform.OS === 'web') {
      Alert.alert('Não Disponível', 'Sincronização com app de saúde não está disponível na web.');
      return false;
    }
    
    try {
      setHealthSyncStatus('syncing');
      
      // Mock permission request for demonstration
      const granted = await new Promise<boolean>(resolve => {
        Alert.alert(
          'Sincronização com App de Saúde',
          'Deseja permitir acesso aos dados de saúde? (Esta é uma demonstração - funcionalidade completa requer configuração nativa)',
          [
            { text: 'Cancelar', onPress: () => resolve(false) },
            { text: 'Permitir', onPress: () => resolve(true) }
          ]
        );
      });
      
      if (granted) {
        setIsHealthSyncEnabled(true);
        await AsyncStorage.setItem(HEALTH_SYNC_KEY, 'true');
        setHealthSyncStatus('success');
        console.log('✅ Health sync enabled successfully');
        
        // Automatically import existing health data
        await importHealthData();
        
        return true;
      } else {
        setHealthSyncStatus('error');
        Alert.alert(
          'Permissões Necessárias',
          'Para sincronizar com o app de saúde, precisamos de acesso aos seus dados de calorias e peso.'
        );
        return false;
      }
    } catch (error) {
      console.error('❌ Error enabling health sync:', error);
      setHealthSyncStatus('error');
      Alert.alert('Erro', 'Não foi possível ativar a sincronização com o app de saúde.');
      return false;
    }
  }, [importHealthData]);
  
  const disableHealthSync = useCallback(async () => {
    try {
      setIsHealthSyncEnabled(false);
      await AsyncStorage.setItem(HEALTH_SYNC_KEY, 'false');
      setHealthSyncStatus('idle');
      console.log('🔄 Health sync disabled');
    } catch (error) {
      console.error('❌ Error disabling health sync:', error);
    }
  }, []);
  
  const syncWithHealthApp = useCallback(async () => {
    if (Platform.OS === 'web' || !isHealthSyncEnabled) return;
    
    try {
      setHealthSyncStatus('syncing');
      
      // Mock health data export - real implementation would use native health APIs
      const currentCalories = todayCalories;
      console.log('📤 Would export', currentCalories, 'calories to health app');
      
      // Simulate successful export
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Import any new health data
      await importHealthData();
      
      setHealthSyncStatus('success');
      
    } catch (error) {
      console.error('❌ Error syncing with health app:', error);
      setHealthSyncStatus('error');
    }
  }, [isHealthSyncEnabled, importHealthData, todayCalories]);
  
  // Emergency cleanup function
  const emergencyCleanup = useCallback(async () => {
    console.log('🚨 Emergency cleanup');
    
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEY,
        BACKUP_STORAGE_KEY,
        GOAL_STORAGE_KEY,
        PROFILE_STORAGE_KEY,
        HEALTH_SYNC_KEY,
        LAST_HEALTH_SYNC_KEY,
        RESET_FLAG_KEY
      ]);
      
      // Reset state
      isInitialized = false;
      
      console.log('✅ Emergency cleanup completed');
      
    } catch (error) {
      console.error('❌ Emergency cleanup failed:', error);
    }
  }, []);

  const resetData = useCallback(async () => {
    console.log('🚨 Resetting all data');
    
    // Clear state
    setMeals([]);
    setUserProfile(null);
    setHealthMetrics(null);
    setIsHealthSyncEnabled(false);
    setHealthSyncStatus('idle');
    setDailyGoalState(2000);
    
    // Clear storage
    await emergencyCleanup();
    
    console.log('✅ Reset completed');
  }, [emergencyCleanup]);

  const todayCalories = useMemo(() => {
    console.log('🧮 CALCULATING TODAY CALORIES - Starting from 0');
    console.log('Current meals array:', meals);
    console.log('Meals length:', meals?.length || 0);
    
    // ALWAYS start from 0 - no exceptions
    if (!meals || !Array.isArray(meals) || meals.length === 0) {
      console.log('📊 NO MEALS FOUND - RETURNING 0');
      return 0;
    }
    
    const today = new Date().toDateString();
    console.log('Today date string:', today);
    
    const todayMeals = meals.filter(meal => {
      if (!meal || !meal.timestamp) {
        console.log('Invalid meal filtered out:', meal);
        return false;
      }
      try {
        const mealDate = new Date(meal.timestamp);
        const mealDateString = mealDate.toDateString();
        const isToday = mealDateString === today;
        console.log(`Meal date: ${mealDateString}, Is today: ${isToday}, Calories: ${meal.totalCalories}`);
        return isToday;
      } catch (error) {
        console.log('Error parsing meal date:', error);
        return false;
      }
    });
    
    console.log(`Found ${todayMeals.length} meals for today`);
    
    const total = todayMeals.reduce((sum, meal) => {
      const calories = (typeof meal.totalCalories === 'number' && meal.totalCalories > 0) ? meal.totalCalories : 0;
      console.log(`Adding ${calories} calories to total (was ${sum})`);
      return sum + calories;
    }, 0);
    
    const finalTotal = Math.max(0, Math.round(total));
    console.log(`📊 FINAL CALCULATION: ${todayMeals.length} meals = ${finalTotal} kcal`);
    return finalTotal;
  }, [meals]);

  const weeklyAverage = useMemo(() => {
    if (!meals || meals.length === 0) return 0;
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weekMeals = meals.filter(meal => {
      if (!meal || !meal.timestamp) return false;
      try {
        return new Date(meal.timestamp) >= oneWeekAgo;
      } catch {
        return false;
      }
    });
    
    if (weekMeals.length === 0) return 0;
    
    const totalCalories = weekMeals.reduce((sum, meal) => {
      const calories = typeof meal.totalCalories === 'number' && meal.totalCalories > 0 ? meal.totalCalories : 0;
      return sum + calories;
    }, 0);
    return Math.round(totalCalories / 7);
  }, [meals]);

  // Auto-sync with health app when meals are added (if enabled)
  useEffect(() => {
    if (isHealthSyncEnabled && Platform.OS !== 'web') {
      const syncTimeout = setTimeout(() => {
        syncWithHealthApp();
      }, 2000); // Sync 2 seconds after meal changes
      
      return () => clearTimeout(syncTimeout);
    }
  }, [meals, isHealthSyncEnabled, syncWithHealthApp]);
  
  // Auto-save meals when they change
  useEffect(() => {
    if (isInitialized && meals.length >= 0) {
      const saveTimeout = setTimeout(async () => {
        console.log('💾 Auto-saving meals...');
        await saveMeals(meals);
      }, 500);
      
      return () => clearTimeout(saveTimeout);
    }
  }, [meals, saveMeals]);
  
  return {
    meals,
    todayCalories,
    weeklyAverage,
    dailyGoal,
    isLoading,
    userProfile,
    healthMetrics,
    isHealthSyncEnabled,
    healthSyncStatus,
    addMeal,
    addManualCalories,
    deleteMeal,
    clearHistory,
    resetData,
    setDailyGoal,
    updateUserProfile,
    calculateHealthMetrics,
    calculateHealthScore,
    enableHealthSync,
    disableHealthSync,
    syncWithHealthApp,
    importHealthData,
    emergencyCleanup,
  };
});