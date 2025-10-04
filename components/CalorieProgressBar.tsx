import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';

interface CalorieProgressBarProps {
  currentCalories: number;
  dailyGoal: number;
  onGoalPress?: () => void;
  onCameraPress?: () => void;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function CalorieProgressBar({ currentCalories, dailyGoal, onGoalPress, onCameraPress }: CalorieProgressBarProps) {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const cameraButtonScale = useRef(new Animated.Value(1)).current;
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const percentage = Math.min((currentCalories / dailyGoal) * 100, 100);
  const progressColor = '#2196F3';
  
  const size = 90;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(progressAnim, {
        toValue: percentage,
        duration: 1000,
        useNativeDriver: false,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
    ]).start();
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [percentage, progressAnim, scaleAnim, pulseAnim]);
  
  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });
  
  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <LinearGradient
        colors={['#0F1A2B', '#0B0B0C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.card}
      >
        <View style={styles.content}>
          <View style={styles.circularProgressContainer}>
            <Svg width={size} height={size}>
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke="#1E1E1E"
                strokeWidth={strokeWidth}
                fill="none"
              />
              <AnimatedCircle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={progressColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                rotation="-90"
                origin={`${size / 2}, ${size / 2}`}
              />
            </Svg>
            <View style={styles.circularProgressCenter}>
              <Text style={styles.circularProgressValue}>{currentCalories}</Text>
              <Text style={styles.circularProgressUnit}>kcal</Text>
            </View>
          </View>
          
          <View style={styles.rightContent}>
            <Animated.View style={{ transform: [{ scale: Animated.multiply(pulseAnim, cameraButtonScale) }] }}>
              <TouchableOpacity 
                onPress={async () => {
                  if (isAnalyzing || !onCameraPress) return;
                  
                  // Haptic feedback
                  if (Platform.OS !== 'web') {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  
                  // Scale down animation
                  Animated.sequence([
                    Animated.timing(cameraButtonScale, {
                      toValue: 0.85,
                      duration: 200,
                      useNativeDriver: true,
                    }),
                    Animated.timing(cameraButtonScale, {
                      toValue: 1,
                      duration: 200,
                      useNativeDriver: true,
                    }),
                  ]).start();
                  
                  // Show loading state
                  setIsAnalyzing(true);
                  
                  // Call the camera press handler
                  try {
                    await onCameraPress();
                  } finally {
                    // Hide loading after a delay to show the analyzing message
                    setTimeout(() => {
                      setIsAnalyzing(false);
                    }, 2500);
                  }
                }} 
                style={styles.cameraButton}
                activeOpacity={0.7}
                disabled={isAnalyzing}
              >
                <LinearGradient
                  colors={isAnalyzing ? ['#1976D2', '#1565C0'] : ['#2196F3', '#1976D2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cameraButtonGradient}
                >
                  {isAnalyzing ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Camera color="#FFFFFF" size={28} strokeWidth={2} />
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
            {isAnalyzing ? (
              <Text style={styles.analyzingText}>
                🍽️ A analisar refeição...
              </Text>
            ) : (
              <Text style={styles.goalText}>
                Meta: {dailyGoal} kcal ({Math.round(percentage)}%)
              </Text>
            )}
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  card: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  content: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  circularProgressContainer: {
    position: 'relative' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  circularProgressCenter: {
    position: 'absolute' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  circularProgressValue: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  circularProgressUnit: {
    fontSize: 12,
    color: '#A0A0A0',
    marginTop: 2,
  },
  rightContent: {
    alignItems: 'flex-end' as const,
    gap: 8,
  },
  cameraButton: {
    borderRadius: 30,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 14,
    elevation: 8,
  },
  cameraButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  goalText: {
    fontSize: 13,
    color: '#A0A0A0',
    textAlign: 'right' as const,
    marginTop: 8,
  },
  analyzingText: {
    fontSize: 13,
    color: '#2196F3',
    textAlign: 'right' as const,
    marginTop: 8,
    fontWeight: '600' as const,
    fontStyle: 'italic' as const,
  },
});