import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { useTheme } from '@/providers/ThemeProvider';
import { useCalorieTracker } from '@/providers/CalorieTrackerProvider';
import { BlurCard } from '@/components/BlurCard';
import {
  Play,
  Pause,
  Square,
  MapPin,
  Timer,
  Activity,
  Zap,
  Target,
  TrendingUp,
  Heart,
  Navigation,
  Footprints,
  ArrowLeft,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

type WorkoutMode = 'walking' | 'running' | 'live';

interface WorkoutStats {
  duration: number;
  distance: number;
  avgSpeed: number;
  maxSpeed: number;
  calories: number;
  steps: number;
  pace: number;
}

interface LocationPoint {
  latitude: number;
  longitude: number;
  timestamp: number;
  accuracy?: number;
}

export default function LiveWorkoutScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userProfile, addWorkoutSession } = useCalorieTracker();
  
  // Workout state
  const [selectedMode, setSelectedMode] = useState<WorkoutMode>('walking');
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [stats, setStats] = useState<WorkoutStats>({
    duration: 0,
    distance: 0,
    avgSpeed: 0,
    maxSpeed: 0,
    calories: 0,
    steps: 0,
    pace: 0,
  });
  
  // Location tracking
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean>(false);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [locationHistory, setLocationHistory] = useState<LocationPoint[]>([]);
  const [locationSubscription, setLocationSubscription] = useState<Location.LocationSubscription | null>(null);
  
  // Refs for timers
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  
  // Request location permissions
  const requestLocationPermission = useCallback(async () => {
    try {
      console.log('🗺️ Requesting location permissions...');
      
      if (Platform.OS === 'web') {
        // Web geolocation API
        if ('geolocation' in navigator) {
          const permission = await navigator.permissions.query({ name: 'geolocation' });
          if (permission.state === 'granted' || permission.state === 'prompt') {
            setHasLocationPermission(true);
            console.log('✅ Web geolocation permission granted');
            return true;
          } else {
            console.log('❌ Web geolocation permission denied');
            Alert.alert('Permissão Necessária', 'Permita o acesso à localização para usar o GPS durante o treino.');
            return false;
          }
        } else {
          console.log('❌ Geolocation not supported on this browser');
          Alert.alert('GPS Não Suportado', 'Seu navegador não suporta GPS. Use um dispositivo móvel para melhor experiência.');
          return false;
        }
      } else {
        // Mobile location permissions
        const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
        
        if (foregroundStatus !== 'granted') {
          Alert.alert(
            'Permissão Necessária',
            'Permita o acesso à localização para rastrear seu treino com GPS.',
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Configurações', onPress: () => Location.requestForegroundPermissionsAsync() }
            ]
          );
          return false;
        }
        
        // Request background location for better tracking
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        console.log('📍 Background location status:', backgroundStatus);
        
        setHasLocationPermission(true);
        console.log('✅ Mobile location permissions granted');
        return true;
      }
    } catch (error) {
      console.error('❌ Error requesting location permission:', error);
      Alert.alert('Erro', 'Erro ao solicitar permissão de localização.');
      return false;
    }
  }, []);
  
  // Get current location
  const getCurrentLocation = useCallback(async () => {
    try {
      if (Platform.OS === 'web') {
        return new Promise<Location.LocationObject>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const location: Location.LocationObject = {
                coords: {
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  altitude: position.coords.altitude,
                  accuracy: position.coords.accuracy,
                  altitudeAccuracy: position.coords.altitudeAccuracy,
                  heading: position.coords.heading,
                  speed: position.coords.speed,
                },
                timestamp: position.timestamp,
              };
              resolve(location);
            },
            (error) => reject(error),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 }
          );
        });
      } else {
        return await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 1,
        });
      }
    } catch (error) {
      console.error('❌ Error getting current location:', error);
      throw error;
    }
  }, []);
  
  // Start location tracking
  const startLocationTracking = useCallback(async () => {
    try {
      console.log('🎯 Starting location tracking...');
      
      if (Platform.OS === 'web') {
        // Web geolocation tracking
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            const location: Location.LocationObject = {
              coords: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                altitude: position.coords.altitude,
                accuracy: position.coords.accuracy,
                altitudeAccuracy: position.coords.altitudeAccuracy,
                heading: position.coords.heading,
                speed: position.coords.speed,
              },
              timestamp: position.timestamp,
            };
            
            console.log(`📍 Web GPS Update: Speed: ${location.coords.speed ? (location.coords.speed * 3.6).toFixed(1) : 'N/A'}km/h, Accuracy: ${location.coords.accuracy?.toFixed(0)}m`);
            
            setCurrentLocation(location);
            
            const locationPoint: LocationPoint = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              timestamp: location.timestamp,
              accuracy: location.coords.accuracy || undefined,
            };
            
            setLocationHistory(prev => {
              const newHistory = [...prev, locationPoint];
              // Keep only last 100 points to avoid memory issues
              return newHistory.length > 100 ? newHistory.slice(-100) : newHistory;
            });
          },
          (error) => {
            console.error('❌ Web geolocation error:', error);
          },
          { enableHighAccuracy: true, timeout: 3000, maximumAge: 500 } // More frequent updates
        );
        
        // Store watchId for cleanup
        const subscription = {
          remove: () => navigator.geolocation.clearWatch(watchId)
        } as Location.LocationSubscription;
        
        setLocationSubscription(subscription);
      } else {
        // Mobile location tracking
        const subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 500, // More frequent updates for better speed calculation
            distanceInterval: 0.5, // Smaller distance interval for better tracking
          },
          (location) => {
            console.log(`📍 GPS Update: Speed: ${location.coords.speed ? (location.coords.speed * 3.6).toFixed(1) : 'N/A'}km/h, Accuracy: ${location.coords.accuracy?.toFixed(0)}m`);
            
            setCurrentLocation(location);
            
            const locationPoint: LocationPoint = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              timestamp: location.timestamp,
              accuracy: location.coords.accuracy || undefined,
            };
            
            setLocationHistory(prev => {
              const newHistory = [...prev, locationPoint];
              // Keep only last 100 points to avoid memory issues
              return newHistory.length > 100 ? newHistory.slice(-100) : newHistory;
            });
          }
        );
        
        setLocationSubscription(subscription);
      }
      
      console.log('✅ Location tracking started');
    } catch (error) {
      console.error('❌ Error starting location tracking:', error);
      Alert.alert('Erro GPS', 'Não foi possível iniciar o rastreamento GPS.');
    }
  }, []);
  
  // Stop location tracking
  const stopLocationTracking = useCallback(() => {
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
      console.log('🛑 Location tracking stopped');
    }
  }, [locationSubscription]);
  
  // Calculate distance between two points (Haversine formula)
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }, []);
  
  // Calculate workout statistics
  const updateStats = useCallback(() => {
    if (locationHistory.length < 2) return;
    
    let totalDistance = 0;
    let maxSpeed = 0;
    const speeds: number[] = [];
    const recentSpeeds: number[] = []; // For more accurate current speed
    
    console.log(`📊 Calculating stats from ${locationHistory.length} GPS points`);
    
    for (let i = 1; i < locationHistory.length; i++) {
      const prev = locationHistory[i - 1];
      const curr = locationHistory[i];
      
      // Calculate distance between consecutive points
      const distance = calculateDistance(prev.latitude, prev.longitude, curr.latitude, curr.longitude);
      totalDistance += distance;
      
      // Calculate time difference in seconds, then convert to hours for speed calculation
      const timeDiffSeconds = (curr.timestamp - prev.timestamp) / 1000;
      const timeDiffHours = timeDiffSeconds / 3600;
      
      // Only calculate speed if we have a reasonable time difference (avoid division by very small numbers)
      if (timeDiffSeconds > 0.5 && timeDiffHours > 0) {
        const speed = distance / timeDiffHours; // km/h
        
        // Filter out unrealistic speeds (GPS noise) but be more lenient
        if (speed >= 0 && speed <= 80) {
          speeds.push(speed);
          maxSpeed = Math.max(maxSpeed, speed);
          
          // Keep recent speeds for current speed calculation (last 10 points)
          if (i >= locationHistory.length - 10) {
            recentSpeeds.push(speed);
          }
        }
      }
    }
    
    // Calculate average speed from all valid speeds
    const avgSpeed = speeds.length > 0 ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0;
    
    // Calculate current speed from recent GPS points for more responsive display
    const currentSpeed = recentSpeeds.length > 0 ? 
      recentSpeeds.reduce((a, b) => a + b, 0) / recentSpeeds.length : avgSpeed;
    
    // Use GPS speed if available (more accurate than calculated speed)
    const gpsSpeed = currentLocation?.coords?.speed;
    const displaySpeed = gpsSpeed && gpsSpeed >= 0 ? gpsSpeed * 3.6 : currentSpeed; // Convert m/s to km/h
    
    const pace = avgSpeed > 0 ? 60 / avgSpeed : 0; // minutes per km
    
    // Calculate calories based on mode and user profile
    let caloriesPerKm = 50; // Default
    if (userProfile?.weight) {
      switch (selectedMode) {
        case 'walking':
          caloriesPerKm = userProfile.weight * 0.5; // Rough estimate
          break;
        case 'running':
          caloriesPerKm = userProfile.weight * 1.0;
          break;
        case 'live':
          caloriesPerKm = userProfile.weight * 0.8;
          break;
      }
    }
    
    const calories = totalDistance * caloriesPerKm;
    const steps = Math.round(totalDistance * 1300); // Rough estimate: 1300 steps per km
    
    console.log(`📊 Stats updated: Distance: ${totalDistance.toFixed(3)}km, Avg Speed: ${avgSpeed.toFixed(1)}km/h, Current Speed: ${displaySpeed.toFixed(1)}km/h, Max Speed: ${maxSpeed.toFixed(1)}km/h`);
    
    setStats(prev => ({
      ...prev,
      distance: totalDistance,
      avgSpeed: displaySpeed, // Use current speed for real-time display
      maxSpeed,
      calories,
      steps,
      pace,
    }));
  }, [locationHistory, calculateDistance, selectedMode, userProfile, currentLocation]);
  
  // Update statistics when location history changes
  useEffect(() => {
    updateStats();
  }, [locationHistory, updateStats]);
  
  // Timer management
  const startTimer = useCallback(() => {
    if (!timerRef.current) {
      startTimeRef.current = Date.now() - pausedTimeRef.current;
      
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setStats(prev => ({ ...prev, duration: Math.floor(elapsed / 1000) }));
      }, 1000);
    }
  }, []);
  
  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      pausedTimeRef.current = Date.now() - startTimeRef.current;
    }
  }, []);
  
  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    startTimeRef.current = 0;
    pausedTimeRef.current = 0;
    setStats({
      duration: 0,
      distance: 0,
      avgSpeed: 0,
      maxSpeed: 0,
      calories: 0,
      steps: 0,
      pace: 0,
    });
  }, []);
  
  // Start workout
  const startWorkout = useCallback(async () => {
    console.log('🏃 Starting workout...');
    
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;
    
    try {
      // Get initial location
      const location = await getCurrentLocation();
      setCurrentLocation(location);
      
      const initialPoint: LocationPoint = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: location.timestamp,
        accuracy: location.coords.accuracy || undefined,
      };
      
      setLocationHistory([initialPoint]);
      
      // Start tracking
      await startLocationTracking();
      startTimer();
      
      setIsActive(true);
      setIsPaused(false);
      
      console.log('✅ Workout started successfully');
    } catch (error) {
      console.error('❌ Error starting workout:', error);
      Alert.alert('Erro', 'Não foi possível iniciar o treino. Verifique se o GPS está ativado.');
    }
  }, [requestLocationPermission, getCurrentLocation, startLocationTracking, startTimer]);
  
  // Pause workout
  const pauseWorkout = useCallback(() => {
    console.log('⏸️ Pausing workout...');
    pauseTimer();
    stopLocationTracking();
    setIsPaused(true);
  }, [pauseTimer, stopLocationTracking]);
  
  // Resume workout
  const resumeWorkout = useCallback(async () => {
    console.log('▶️ Resuming workout...');
    await startLocationTracking();
    startTimer();
    setIsPaused(false);
  }, [startLocationTracking, startTimer]);
  
  // Stop workout
  const stopWorkout = useCallback(() => {
    console.log('🛑 Stopping workout...');
    
    Alert.alert(
      'Finalizar Treino',
      'Deseja finalizar este treino? Os dados serão salvos no seu histórico.',
      [
        { text: 'Continuar', style: 'cancel' },
        {
          text: 'Finalizar',
          style: 'destructive',
          onPress: async () => {
            pauseTimer();
            stopLocationTracking();
            
            // Save workout session
            if (addWorkoutSession && stats.duration > 0) {
              const workoutData = {
                type: selectedMode,
                duration: stats.duration,
                calories: Math.round(stats.calories),
                distance: stats.distance,
                date: new Date().toISOString(),
              };
              
              console.log('💾 Saving workout session:', workoutData);
              
              try {
                await addWorkoutSession(workoutData);
                console.log('✅ Workout session saved successfully');
              } catch (error) {
                console.error('❌ Failed to save workout session:', error);
                Alert.alert('Erro', 'Não foi possível salvar o treino no histórico.');
              }
            } else {
              console.log('⚠️ Workout not saved - missing data or function');
              console.log('Debug info:', {
                hasAddWorkoutSession: !!addWorkoutSession,
                duration: stats.duration,
                calories: stats.calories,
                distance: stats.distance
              });
            }
            
            setIsActive(false);
            setIsPaused(false);
            resetTimer();
            setLocationHistory([]);
            setCurrentLocation(null);
            
            router.back();
          }
        }
      ]
    );
  }, [pauseTimer, stopLocationTracking, addWorkoutSession, stats, selectedMode, resetTimer, router]);
  
  // Format time
  const formatTime = useCallback((seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);
  
  // Format distance
  const formatDistance = useCallback((km: number): string => {
    if (km < 1) {
      return `${Math.round(km * 1000)}m`;
    }
    return `${km.toFixed(2)}km`;
  }, []);
  
  // Format speed
  const formatSpeed = useCallback((kmh: number): string => {
    return `${kmh.toFixed(1)} km/h`;
  }, []);
  
  // Format pace
  const formatPace = useCallback((minPerKm: number): string => {
    if (minPerKm === 0 || !isFinite(minPerKm)) return '--:--';
    const minutes = Math.floor(minPerKm);
    const seconds = Math.round((minPerKm - minutes) * 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
  }, []);
  
  // Workout modes
  const workoutModes = [
    {
      id: 'walking' as WorkoutMode,
      name: 'Caminhada',
      icon: <Footprints size={24} color={colors.primary} />,
      description: 'Caminhada com GPS',
      color: colors.success,
    },
    {
      id: 'running' as WorkoutMode,
      name: 'Corrida',
      icon: <Activity size={24} color={colors.primary} />,
      description: 'Corrida com GPS',
      color: colors.warning,
    },
    {
      id: 'live' as WorkoutMode,
      name: 'Live Treino',
      icon: <Zap size={24} color={colors.primary} />,
      description: 'Treino ao vivo com GPS',
      color: colors.error || '#F44336',
    },
  ];
  
  // Check permissions on mount
  useEffect(() => {
    requestLocationPermission();
  }, [requestLocationPermission]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      stopLocationTracking();
    };
  }, [stopLocationTracking]);
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Treino GPS',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => {
                if (isActive) {
                  Alert.alert(
                    'Treino Ativo',
                    'Você tem um treino ativo. Deseja finalizar antes de sair?',
                    [
                      { text: 'Continuar Treino', style: 'cancel' },
                      { text: 'Finalizar e Sair', onPress: () => {
                        stopLocationTracking();
                        if (timerRef.current) clearInterval(timerRef.current);
                        router.back();
                      }}
                    ]
                  );
                } else {
                  router.back();
                }
              }}
              style={styles.backButton}
            >
              <ArrowLeft size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Mode Selection */}
        {!isActive && (
          <View style={styles.modeSelection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Escolha o Modo</Text>
            <View style={styles.modesContainer}>
              {workoutModes.map((mode) => (
                <TouchableOpacity
                  key={mode.id}
                  style={[
                    styles.modeCard,
                    {
                      backgroundColor: selectedMode === mode.id ? mode.color + '20' : 'transparent',
                      borderColor: selectedMode === mode.id ? mode.color : colors.border,
                    }
                  ]}
                  onPress={() => setSelectedMode(mode.id)}
                  activeOpacity={0.7}
                >
                  {mode.icon}
                  <Text style={[
                    styles.modeName,
                    {
                      color: selectedMode === mode.id ? mode.color : colors.text
                    }
                  ]}>
                    {mode.name}
                  </Text>
                  <Text style={[
                    styles.modeDescription,
                    {
                      color: selectedMode === mode.id ? mode.color : colors.textSecondary
                    }
                  ]}>
                    {mode.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        
        {/* GPS Status */}
        <BlurCard style={styles.gpsStatus}>
          <View style={styles.statusHeader}>
            <Navigation size={20} color={hasLocationPermission ? colors.success : colors.error || '#F44336'} />
            <Text style={[styles.statusTitle, { color: colors.text }]}>Status GPS</Text>
          </View>
          <Text style={[
            styles.statusText,
            { color: hasLocationPermission ? colors.success : colors.error || '#F44336' }
          ]}>
            {hasLocationPermission ? 'GPS Conectado' : 'GPS Desconectado'}
          </Text>
          {currentLocation && (
            <Text style={[styles.locationText, { color: colors.textSecondary }]}>
              Precisão: {currentLocation.coords.accuracy?.toFixed(0) || 'N/A'}m
            </Text>
          )}
        </BlurCard>
        
        {/* Workout Stats */}
        <BlurCard style={styles.statsContainer}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Timer size={24} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {formatTime(stats.duration)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Tempo</Text>
            </View>
            
            <View style={styles.statCard}>
              <MapPin size={24} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {formatDistance(stats.distance)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Distância</Text>
            </View>
            
            <View style={styles.statCard}>
              <Activity size={24} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {formatSpeed(stats.avgSpeed)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Velocidade</Text>
            </View>
            
            <View style={styles.statCard}>
              <Target size={24} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {formatPace(stats.pace)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Ritmo</Text>
            </View>
            
            <View style={styles.statCard}>
              <Zap size={24} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {Math.round(stats.calories)}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Calorias</Text>
            </View>
            
            <View style={styles.statCard}>
              <Footprints size={24} color={colors.primary} />
              <Text style={[styles.statValue, { color: colors.text }]}>
                {stats.steps.toLocaleString()}
              </Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Passos</Text>
            </View>
          </View>
        </BlurCard>
        
        {/* Additional Stats */}
        {isActive && (
          <BlurCard style={styles.additionalStats}>
            <View style={styles.additionalStatsRow}>
              <View style={styles.additionalStat}>
                <TrendingUp size={18} color={colors.warning} />
                <Text style={[styles.additionalStatLabel, { color: colors.textSecondary }]}>Vel. Máx</Text>
                <Text style={[styles.additionalStatValue, { color: colors.text }]}>
                  {formatSpeed(stats.maxSpeed)}
                </Text>
              </View>
              
              <View style={styles.additionalStat}>
                <Heart size={18} color={colors.error || '#F44336'} />
                <Text style={[styles.additionalStatLabel, { color: colors.textSecondary }]}>Pontos GPS</Text>
                <Text style={[styles.additionalStatValue, { color: colors.text }]}>
                  {locationHistory.length}
                </Text>
              </View>
            </View>
          </BlurCard>
        )}
        
        {/* Control Buttons */}
        <View style={styles.controlsContainer}>
          {!isActive ? (
            <TouchableOpacity
              style={[
                styles.startButton,
                {
                  backgroundColor: colors.primary,
                  opacity: hasLocationPermission ? 1 : 0.5
                }
              ]}
              onPress={startWorkout}
              disabled={!hasLocationPermission}
              activeOpacity={0.8}
            >
              <Play size={24} color="white" />
              <Text style={styles.startButtonText}>Iniciar Treino</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.activeControls}>
              <TouchableOpacity
                style={[
                  styles.controlButton,
                  { backgroundColor: isPaused ? colors.success : colors.warning }
                ]}
                onPress={isPaused ? resumeWorkout : pauseWorkout}
                activeOpacity={0.8}
              >
                {isPaused ? (
                  <Play size={24} color="white" />
                ) : (
                  <Pause size={24} color="white" />
                )}
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.controlButton,
                  { backgroundColor: colors.error || '#F44336' }
                ]}
                onPress={stopWorkout}
                activeOpacity={0.8}
              >
                <Square size={24} color="white" />
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* Workout Status */}
        {isActive && (
          <BlurCard style={styles.workoutStatus}>
            <View style={styles.statusIndicator}>
              <View style={[
                styles.statusDot,
                { backgroundColor: isPaused ? colors.warning : colors.success }
              ]} />
              <Text style={[styles.workoutStatusText, { color: colors.text }]}>
                {isPaused ? 'Treino Pausado' : `Treino Ativo - ${workoutModes.find(m => m.id === selectedMode)?.name}`}
              </Text>
            </View>
            {isPaused && (
              <Text style={[styles.pausedHint, { color: colors.textSecondary }]}>
                Toque em play para continuar
              </Text>
            )}
          </BlurCard>
        )}
        
        {/* Permission Prompt */}
        {!hasLocationPermission && (
          <BlurCard style={styles.permissionPrompt}>
            <Navigation size={32} color={colors.warning} />
            <Text style={[styles.permissionTitle, { color: colors.text }]}>GPS Necessário</Text>
            <Text style={[styles.permissionDescription, { color: colors.textSecondary }]}>
              Para usar o treino com GPS, é necessário permitir o acesso à localização.
            </Text>
            <TouchableOpacity
              style={[styles.permissionButton, { backgroundColor: colors.primary }]}
              onPress={requestLocationPermission}
              activeOpacity={0.8}
            >
              <Text style={styles.permissionButtonText}>Permitir GPS</Text>
            </TouchableOpacity>
          </BlurCard>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  
  // Mode Selection
  modeSelection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  modesContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  modeCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  modeName: {
    fontSize: 14,
    fontWeight: '600',
  },
  modeDescription: {
    fontSize: 12,
    textAlign: 'center',
  },
  
  // GPS Status
  gpsStatus: {
    padding: 16,
    marginBottom: 16,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  locationText: {
    fontSize: 12,
    marginTop: 4,
  },
  
  // Stats
  statsContainer: {
    padding: 20,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 80) / 3,
    alignItems: 'center',
    gap: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
  },
  
  // Additional Stats
  additionalStats: {
    padding: 16,
    marginBottom: 16,
  },
  additionalStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  additionalStat: {
    alignItems: 'center',
    gap: 4,
  },
  additionalStatLabel: {
    fontSize: 12,
  },
  additionalStatValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Controls
  controlsContainer: {
    marginBottom: 24,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    gap: 12,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  activeControls: {
    flexDirection: 'row',
    gap: 16,
    justifyContent: 'center',
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Workout Status
  workoutStatus: {
    padding: 16,
    marginBottom: 16,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  workoutStatusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  pausedHint: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  
  // Permission Prompt
  permissionPrompt: {
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  permissionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  permissionDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  permissionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
