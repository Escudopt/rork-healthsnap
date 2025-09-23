import { useEffect, useState, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import createContextHook from '@nkzw/create-context-hook';

// Mock Health API for development (expo-health is not available in Expo Go)
const MockHealth = {
  isAvailableAsync: async () => Platform.OS === 'ios',
  getPermissionsAsync: async (read: string[], write: string[]) => ({ 
    granted: Platform.OS === 'ios' ? read : [] 
  }),
  requestPermissionsAsync: async (read: string[], write: string[]) => ({ 
    granted: Platform.OS === 'ios' ? read : [] 
  }),
  getHealthRecordsAsync: async ({ dataType }: { dataType: string; startDate: Date; endDate: Date }) => {
    // Generate realistic mock data based on time of day
    const hour = new Date().getHours();
    const progressFactor = hour / 24; // Progress through the day
    
    const mockData = {
      Steps: [{ value: Math.floor((Math.random() * 3000 + 5000) * progressFactor) }],
      ActiveEnergyBurned: [{ value: Math.floor((Math.random() * 200 + 300) * progressFactor) }],
      BasalEnergyBurned: [{ value: Math.floor((Math.random() * 300 + 1400) * progressFactor) }],
      DistanceWalkingRunning: [{ value: Math.round((Math.random() * 3 + 4) * progressFactor * 100) / 100 }],
      HeartRate: [{ value: Math.floor(Math.random() * 30) + 70 }],
      DietaryEnergyConsumed: [{ value: Math.floor((Math.random() * 800 + 1200) * progressFactor) }],
    };
    return mockData[dataType as keyof typeof mockData] || [];
  },
  writeHealthRecordsAsync: async (records: any[]) => {
    console.log('Mock: Writing health records:', records);
    return true;
  },
  HealthDataType: {
    Steps: 'Steps',
    ActiveEnergyBurned: 'ActiveEnergyBurned',
    BasalEnergyBurned: 'BasalEnergyBurned',
    DistanceWalkingRunning: 'DistanceWalkingRunning',
    HeartRate: 'HeartRate',
    DietaryEnergyConsumed: 'DietaryEnergyConsumed',
    DietaryProtein: 'DietaryProtein',
    DietaryCarbohydrates: 'DietaryCarbohydrates',
    DietaryFatTotal: 'DietaryFatTotal',
    DietarySodium: 'DietarySodium',
    DietarySugar: 'DietarySugar',
  },
};

// Use mock Health API for now (expo-health is not available in Expo Go)
const HealthAPI = MockHealth;

export interface HealthData {
  steps: number;
  activeCalories: number;
  basalCalories: number;
  totalCalories: number;
  distance: number;
  heartRate?: number;
  consumedCalories?: number;
  isLoading: boolean;
  error?: string;
}

export interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sodium: number;
  sugar: number;
}

export interface HealthContextType {
  healthData: HealthData;
  isHealthKitAvailable: boolean;
  requestPermissions: () => Promise<boolean>;
  refreshHealthData: () => Promise<void>;
  hasPermissions: boolean;
  writeSteps: (steps: number, date?: Date) => Promise<boolean>;
  writeCalories: (calories: number, date?: Date) => Promise<boolean>;
  writeNutritionData: (nutrition: NutritionData, date?: Date) => Promise<boolean>;
  writeMealData: (mealData: { calories: number; protein: number; carbs: number; fat: number; sodium: number; sugar: number; }, date?: Date) => Promise<boolean>;
}

const initialHealthData: HealthData = {
  steps: 0,
  activeCalories: 0,
  basalCalories: 0,
  totalCalories: 0,
  distance: 0,
  isLoading: false,
};

export const [HealthProvider, useHealth] = createContextHook(() => {
  const [healthData, setHealthData] = useState<HealthData>(initialHealthData);
  const [isHealthKitAvailable, setIsHealthKitAvailable] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);

  const refreshHealthData = useCallback(async (): Promise<void> => {
    try {
      setHealthData(prev => ({ ...prev, isLoading: true, error: undefined }));
      
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Get today's health data
      const [stepsData, activeCaloriesData, basalCaloriesData, distanceData, consumedCaloriesData] = await Promise.all([
        HealthAPI.getHealthRecordsAsync({
          dataType: HealthAPI.HealthDataType.Steps,
          startDate: startOfDay,
          endDate: now,
        }),
        HealthAPI.getHealthRecordsAsync({
          dataType: HealthAPI.HealthDataType.ActiveEnergyBurned,
          startDate: startOfDay,
          endDate: now,
        }),
        HealthAPI.getHealthRecordsAsync({
          dataType: HealthAPI.HealthDataType.BasalEnergyBurned,
          startDate: startOfDay,
          endDate: now,
        }),
        HealthAPI.getHealthRecordsAsync({
          dataType: HealthAPI.HealthDataType.DistanceWalkingRunning,
          startDate: startOfDay,
          endDate: now,
        }),
        HealthAPI.getHealthRecordsAsync({
          dataType: HealthAPI.HealthDataType.DietaryEnergyConsumed,
          startDate: startOfDay,
          endDate: now,
        }),
      ]);

      // Calculate totals
      const steps = stepsData.reduce((sum: number, record: any) => sum + (record.value as number), 0);
      const activeCalories = activeCaloriesData.reduce((sum: number, record: any) => sum + (record.value as number), 0);
      const basalCalories = basalCaloriesData.reduce((sum: number, record: any) => sum + (record.value as number), 0);
      const distance = distanceData.reduce((sum: number, record: any) => sum + (record.value as number), 0);
      const consumedCalories = consumedCaloriesData.reduce((sum: number, record: any) => sum + (record.value as number), 0);
      
      // Try to get latest heart rate (optional)
      let heartRate: number | undefined;
      try {
        const heartRateData = await HealthAPI.getHealthRecordsAsync({
          dataType: HealthAPI.HealthDataType.HeartRate,
          startDate: new Date(now.getTime() - 24 * 60 * 60 * 1000), // Last 24 hours
          endDate: now,
        });
        
        if (heartRateData.length > 0) {
          heartRate = heartRateData[heartRateData.length - 1].value as number;
        }
      } catch (error) {
        console.log('Heart rate data not available:', error);
      }

      setHealthData({
        steps: Math.round(steps),
        activeCalories: Math.round(activeCalories),
        basalCalories: Math.round(basalCalories),
        totalCalories: Math.round(activeCalories + basalCalories),
        distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
        heartRate,
        consumedCalories: Math.round(consumedCalories),
        isLoading: false,
      });
      
      console.log('Health data updated:', {
        steps: Math.round(steps),
        activeCalories: Math.round(activeCalories),
        basalCalories: Math.round(basalCalories),
        distance: Math.round(distance * 100) / 100,
        consumedCalories: Math.round(consumedCalories),
      });
    } catch (error) {
      console.error('Error fetching health data:', error);
      setHealthData(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to fetch health data' 
      }));
    }
  }, []);

  const checkExistingPermissions = useCallback(async () => {
    try {
      const permissions = await HealthAPI.getPermissionsAsync(
        [
          HealthAPI.HealthDataType.Steps,
          HealthAPI.HealthDataType.ActiveEnergyBurned,
          HealthAPI.HealthDataType.BasalEnergyBurned,
          HealthAPI.HealthDataType.DistanceWalkingRunning,
          HealthAPI.HealthDataType.HeartRate,
          HealthAPI.HealthDataType.DietaryEnergyConsumed,
        ],
        [
          HealthAPI.HealthDataType.Steps,
          HealthAPI.HealthDataType.ActiveEnergyBurned,
          HealthAPI.HealthDataType.DietaryEnergyConsumed,
          HealthAPI.HealthDataType.DietaryProtein,
          HealthAPI.HealthDataType.DietaryCarbohydrates,
          HealthAPI.HealthDataType.DietaryFatTotal,
          HealthAPI.HealthDataType.DietarySodium,
          HealthAPI.HealthDataType.DietarySugar,
        ]
      );
      
      const hasReadPermissions = permissions.granted.includes(HealthAPI.HealthDataType.Steps);
      setHasPermissions(hasReadPermissions);
      
      if (hasReadPermissions) {
        await refreshHealthData();
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  }, [refreshHealthData]);



  const checkHealthKitAvailability = useCallback(async () => {
    try {
      const available = await HealthAPI.isAvailableAsync();
      setIsHealthKitAvailable(available);
      console.log('HealthKit available:', available);
      
      if (available) {
        await checkExistingPermissions();
      }
    } catch (error) {
      console.error('Error checking HealthKit availability:', error);
      setHealthData(prev => ({ ...prev, error: 'Failed to check HealthKit availability' }));
    }
  }, [checkExistingPermissions]);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'ios' || !isHealthKitAvailable) {
      console.log('HealthKit not available');
      return false;
    }

    try {
      setHealthData(prev => ({ ...prev, isLoading: true, error: undefined }));
      
      const { granted } = await HealthAPI.requestPermissionsAsync(
        [
          HealthAPI.HealthDataType.Steps,
          HealthAPI.HealthDataType.ActiveEnergyBurned,
          HealthAPI.HealthDataType.BasalEnergyBurned,
          HealthAPI.HealthDataType.DistanceWalkingRunning,
          HealthAPI.HealthDataType.HeartRate,
          HealthAPI.HealthDataType.DietaryEnergyConsumed,
          HealthAPI.HealthDataType.DietaryProtein,
          HealthAPI.HealthDataType.DietaryCarbohydrates,
          HealthAPI.HealthDataType.DietaryFatTotal,
          HealthAPI.HealthDataType.DietarySodium,
          HealthAPI.HealthDataType.DietarySugar,
        ],
        [
          HealthAPI.HealthDataType.Steps,
          HealthAPI.HealthDataType.ActiveEnergyBurned,
          HealthAPI.HealthDataType.DietaryEnergyConsumed,
          HealthAPI.HealthDataType.DietaryProtein,
          HealthAPI.HealthDataType.DietaryCarbohydrates,
          HealthAPI.HealthDataType.DietaryFatTotal,
          HealthAPI.HealthDataType.DietarySodium,
          HealthAPI.HealthDataType.DietarySugar,
        ]
      );

      const hasStepsPermission = granted.includes(HealthAPI.HealthDataType.Steps);
      setHasPermissions(hasStepsPermission);
      
      if (hasStepsPermission) {
        await refreshHealthData();
      }
      
      setHealthData(prev => ({ ...prev, isLoading: false }));
      return hasStepsPermission;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      setHealthData(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to request permissions' 
      }));
      return false;
    }
  }, [isHealthKitAvailable, refreshHealthData]);

  // Write functions for health data
  const writeSteps = useCallback(async (steps: number, date: Date = new Date()): Promise<boolean> => {
    if (Platform.OS !== 'ios' || !isHealthKitAvailable || !hasPermissions) {
      console.log('HealthKit not available for writing steps');
      return false;
    }

    try {
      const success = await HealthAPI.writeHealthRecordsAsync([
        {
          dataType: HealthAPI.HealthDataType.Steps,
          value: steps,
          startDate: date,
          endDate: date,
        },
      ]);
      
      console.log('Steps written to HealthKit:', steps, success);
      return success;
    } catch (error) {
      console.error('Error writing steps to HealthKit:', error);
      return false;
    }
  }, [isHealthKitAvailable, hasPermissions]);

  const writeCalories = useCallback(async (calories: number, date: Date = new Date()): Promise<boolean> => {
    if (Platform.OS !== 'ios' || !isHealthKitAvailable || !hasPermissions) {
      console.log('HealthKit not available for writing calories');
      return false;
    }

    try {
      const success = await HealthAPI.writeHealthRecordsAsync([
        {
          dataType: HealthAPI.HealthDataType.ActiveEnergyBurned,
          value: calories,
          startDate: date,
          endDate: date,
        },
      ]);
      
      console.log('Calories written to HealthKit:', calories, success);
      return success;
    } catch (error) {
      console.error('Error writing calories to HealthKit:', error);
      return false;
    }
  }, [isHealthKitAvailable, hasPermissions]);

  const writeNutritionData = useCallback(async (nutrition: NutritionData, date: Date = new Date()): Promise<boolean> => {
    if (Platform.OS !== 'ios' || !isHealthKitAvailable || !hasPermissions) {
      console.log('HealthKit not available for writing nutrition data');
      return false;
    }

    try {
      const records = [
        {
          dataType: HealthAPI.HealthDataType.DietaryEnergyConsumed,
          value: nutrition.calories,
          startDate: date,
          endDate: date,
        },
        {
          dataType: HealthAPI.HealthDataType.DietaryProtein,
          value: nutrition.protein,
          startDate: date,
          endDate: date,
        },
        {
          dataType: HealthAPI.HealthDataType.DietaryCarbohydrates,
          value: nutrition.carbs,
          startDate: date,
          endDate: date,
        },
        {
          dataType: HealthAPI.HealthDataType.DietaryFatTotal,
          value: nutrition.fat,
          startDate: date,
          endDate: date,
        },
        {
          dataType: HealthAPI.HealthDataType.DietarySodium,
          value: nutrition.sodium,
          startDate: date,
          endDate: date,
        },
        {
          dataType: HealthAPI.HealthDataType.DietarySugar,
          value: nutrition.sugar,
          startDate: date,
          endDate: date,
        },
      ];

      const success = await HealthAPI.writeHealthRecordsAsync(records);
      
      console.log('Nutrition data written to HealthKit:', nutrition, success);
      return success;
    } catch (error) {
      console.error('Error writing nutrition data to HealthKit:', error);
      return false;
    }
  }, [isHealthKitAvailable, hasPermissions]);

  const writeMealData = useCallback(async (
    mealData: { calories: number; protein: number; carbs: number; fat: number; sodium: number; sugar: number; },
    date: Date = new Date()
  ): Promise<boolean> => {
    return await writeNutritionData({
      calories: mealData.calories,
      protein: mealData.protein,
      carbs: mealData.carbs,
      fat: mealData.fat,
      sodium: mealData.sodium,
      sugar: mealData.sugar,
    }, date);
  }, [writeNutritionData]);

  useEffect(() => {
    checkHealthKitAvailability();
  }, [checkHealthKitAvailability]);

  return useMemo(() => ({
    healthData,
    isHealthKitAvailable,
    requestPermissions,
    refreshHealthData,
    hasPermissions,
    writeSteps,
    writeCalories,
    writeNutritionData,
    writeMealData,
  }), [healthData, isHealthKitAvailable, requestPermissions, refreshHealthData, hasPermissions, writeSteps, writeCalories, writeNutritionData, writeMealData]);
});