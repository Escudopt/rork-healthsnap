import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera } from 'lucide-react-native';

interface CalorieProgressBarProps {
  currentCalories: number;
  dailyGoal: number;
  onGoalPress?: () => void;
  onCameraPress?: () => void;
}

export function CalorieProgressBar({ currentCalories, dailyGoal, onGoalPress, onCameraPress }: CalorieProgressBarProps) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  
  const percentage = Math.min((currentCalories / dailyGoal) * 100, 100);
  const progressColor = '#2196F3';

  useEffect(() => {
    Animated.parallel([
      Animated.timing(progressAnim, {
        toValue: percentage,
        duration: 800,
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
    ]).start();
  }, [percentage, progressAnim, scaleAnim]);
  
  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <LinearGradient
        colors={['#0D0D0D', '#1A1F24']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.card}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Calorias</Text>
          <TouchableOpacity 
            onPress={onCameraPress} 
            style={styles.cameraButton}
            activeOpacity={0.7}
          >
            <Camera color="#2196F3" size={22} strokeWidth={2} />
          </TouchableOpacity>
        </View>
        
        <Text style={styles.calorieValue}>
          {currentCalories} kcal
        </Text>
        
        <View style={styles.progressBarBackground}>
          <Animated.View 
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0%', '100%'],
                  extrapolate: 'clamp',
                }),
                backgroundColor: progressColor,
              }
            ]}
          />
        </View>
        
        <Text style={styles.goalText}>
          Meta: {dailyGoal} kcal | {Math.round(percentage)}%
        </Text>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  card: {
    borderRadius: 14,
    padding: 8,
    margin: 10,
    height: 120,
    flexDirection: 'column' as const,
    justifyContent: 'space-between' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  title: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  cameraButton: {
    backgroundColor: 'transparent',
    padding: 4,
  },
  calorieValue: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    textAlign: 'center' as const,
    marginTop: 4,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  progressBarBackground: {
    height: 6,
    borderRadius: 6,
    backgroundColor: '#222222',
    marginVertical: 6,
    overflow: 'hidden' as const,
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
  goalText: {
    fontSize: 13,
    color: '#A0A0A0',
    textAlign: 'center' as const,
  },
});