import { useEffect, useState, useCallback, useMemo } from 'react';
import { Platform } from 'react-native';
import createContextHook from '@nkzw/create-context-hook';

// Mock Health API for development since expo-health might not be available
const Health = {
  isAvailableAsync: async () => Platform.OS === 'ios',
  getPermissionsAsync: async (read: string[], write: string[]) => ({ granted: read }),
  requestPermissionsAsync: async (read: string[], write: string[]) => ({ granted: read }),
  getHealthRecordsAsync: async ({ dataType }: { dataType: string; startDate: Date; endDate: Date }) => {
    // Mock data for development
    const mockData = {
      Steps: [{ value: Math.floor(Math.random() * 5000) + 3000 }],
      ActiveEnergyBurned: [{ value: Math.floor(Math.random() * 300) + 200 }],
      BasalEnergyBurned: [{ value: Math.floor(Math.random() * 800) + 1200 }],
      DistanceWalkingRunning: [{ value: Math.random() * 5 + 2 }],
      HeartRate: [{ value: Math.floor(Math.random() * 40) + 60 }],
    };
    return mockData[dataType as keyof typeof mockData] || [];
  },
  HealthDataType: {
    Steps: 'Steps',
    ActiveEnergyBurned: 'ActiveEnergyBurned',
    BasalEnergyBurned: 'BasalEnergyBurned',
    DistanceWalkingRunning: 'DistanceWalkingRunning',
    HeartRate: 'HeartRate',
  },
};

export interface HealthData {
  steps: number;
  activeCalories: number;
  basalCalories: number;
  totalCalories: number;
  distance: number;
  heartRate?: number;
  isLoading: boolean;
  error?: string;
}

export interface HealthContextType {
  healthData: HealthData;
  isHealthKitAvailable: boolean;
  requestPermissions: () => Promise<boolean>;
  refreshHealthData: () => Promise<void>;
  hasPermissions: boolean;
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

  const checkHealthKitAvailability = useCallback(async () => {
    if (Platform.OS !== 'ios') {
      console.log('HealthKit is only available on iOS');
      return;
    }

    try {
      const available = await Health.isAvailableAsync();
      setIsHealthKitAvailable(available);
      console.log('HealthKit available:', available);
      
      if (available) {
        await checkExistingPermissions();
      }
    } catch (error) {
      console.error('Error checking HealthKit availability:', error);
      setHealthData(prev => ({ ...prev, error: 'Failed to check HealthKit availability' }));
    }
  }, []);

  const checkExistingPermissions = useCallback(async () => {
    try {
      const permissions = await Health.getPermissionsAsync(
        [Health.HealthDataType.Steps],
        [Health.HealthDataType.ActiveEnergyBurned]
      );
      
      const hasReadPermissions = permissions.granted.includes(Health.HealthDataType.Steps);
      setHasPermissions(hasReadPermissions);
      
      if (hasReadPermissions) {
        await refreshHealthData();
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  }, []);

  const refreshHealthData = useCallback(async (): Promise<void> => {
    if (Platform.OS !== 'ios' || !isHealthKitAvailable || !hasPermissions) {
      return;
    }

    try {
      setHealthData(prev => ({ ...prev, isLoading: true, error: undefined }));
      
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      // Get today's health data
      const [stepsData, activeCaloriesData, basalCaloriesData, distanceData] = await Promise.all([
        Health.getHealthRecordsAsync({
          dataType: Health.HealthDataType.Steps,
          startDate: startOfDay,
          endDate: now,
        }),
        Health.getHealthRecordsAsync({
          dataType: Health.HealthDataType.ActiveEnergyBurned,
          startDate: startOfDay,
          endDate: now,
        }),
        Health.getHealthRecordsAsync({
          dataType: Health.HealthDataType.BasalEnergyBurned,
          startDate: startOfDay,
          endDate: now,
        }),
        Health.getHealthRecordsAsync({
          dataType: Health.HealthDataType.DistanceWalkingRunning,
          startDate: startOfDay,
          endDate: now,
        }),
      ]);

      // Calculate totals
      const steps = stepsData.reduce((sum: number, record: any) => sum + (record.value as number), 0);
      const activeCalories = activeCaloriesData.reduce((sum: number, record: any) => sum + (record.value as number), 0);
      const basalCalories = basalCaloriesData.reduce((sum: number, record: any) => sum + (record.value as number), 0);
      const distance = distanceData.reduce((sum: number, record: any) => sum + (record.value as number), 0);
      
      // Try to get latest heart rate (optional)
      let heartRate: number | undefined;
      try {
        const heartRateData = await Health.getHealthRecordsAsync({
          dataType: Health.HealthDataType.HeartRate,
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
        isLoading: false,
      });
      
      console.log('Health data updated:', {
        steps: Math.round(steps),
        activeCalories: Math.round(activeCalories),
        basalCalories: Math.round(basalCalories),
        distance: Math.round(distance * 100) / 100,
      });
    } catch (error) {
      console.error('Error fetching health data:', error);
      setHealthData(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Failed to fetch health data' 
      }));
    }
  }, [isHealthKitAvailable, hasPermissions]);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'ios' || !isHealthKitAvailable) {
      console.log('HealthKit not available');
      return false;
    }

    try {
      setHealthData(prev => ({ ...prev, isLoading: true, error: undefined }));
      
      const { granted } = await Health.requestPermissionsAsync(
        [
          Health.HealthDataType.Steps,
          Health.HealthDataType.ActiveEnergyBurned,
          Health.HealthDataType.BasalEnergyBurned,
          Health.HealthDataType.DistanceWalkingRunning,
          Health.HealthDataType.HeartRate,
        ],
        [Health.HealthDataType.ActiveEnergyBurned]
      );

      const hasStepsPermission = granted.includes(Health.HealthDataType.Steps);
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

  useEffect(() => {
    checkHealthKitAvailability();
  }, [checkHealthKitAvailability]);

  return useMemo(() => ({
    healthData,
    isHealthKitAvailable,
    requestPermissions,
    refreshHealthData,
    hasPermissions,
  }), [healthData, isHealthKitAvailable, requestPermissions, refreshHealthData, hasPermissions]);
});