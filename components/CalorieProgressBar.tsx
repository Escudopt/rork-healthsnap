import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, Edit3, Pill } from 'lucide-react-native';
import Svg, { Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/providers/ThemeProvider';

interface CalorieProgressBarProps {
  currentCalories: number;
  dailyGoal: number;
  onGoalPress?: () => void;
  onCameraPress?: () => void;
  onManualPress?: () => void;
  onVitaminsPress?: () => void;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function CalorieProgressBar({ currentCalories, dailyGoal, onGoalPress, onCameraPress, onManualPress, onVitaminsPress }: CalorieProgressBarProps) {
  const { colors, isDark } = useTheme();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const cameraButtonScale = useRef(new Animated.Value(1)).current;
  const manualButtonScale = useRef(new Animated.Value(1)).current;
  const vitaminsButtonScale = useRef(new Animated.Value(1)).current;
  const vitaminsPulseAnim = useRef(new Animated.Value(1)).current;
  const vitaminsGlowAnim = useRef(new Animated.Value(0)).current;
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const percentage = Math.min((currentCalories / dailyGoal) * 100, 100);
  const progressColor = colors.primary;
  
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
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(vitaminsPulseAnim, {
          toValue: 1.08,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(vitaminsPulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(vitaminsGlowAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(vitaminsGlowAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [percentage, progressAnim, scaleAnim, pulseAnim, vitaminsPulseAnim, vitaminsGlowAnim]);
  
  const strokeDashoffset = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });
  
  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <View
        style={[styles.card, {
          backgroundColor: isDark ? 'rgba(22, 24, 33, 0.75)' : 'rgba(255, 255, 255, 0.85)',
          shadowColor: isDark ? 'rgba(59, 130, 246, 0.4)' : 'rgba(0, 122, 255, 0.2)',
          shadowOpacity: isDark ? 0.5 : 0.15,
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 122, 255, 0.12)',
        }]}
      >
        <View style={styles.content}>
          <View style={styles.circularProgressContainer}>
            <Svg width={size} height={size}>
              <Circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 122, 255, 0.12)'}
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
              <Text style={[styles.circularProgressValue, { color: colors.text }]}>{currentCalories}</Text>
              <Text style={[styles.circularProgressUnit, { color: colors.textSecondary }]}>kcal</Text>
            </View>
          </View>
          
          <View style={styles.rightContent}>
            <View style={styles.buttonsRow}>
              <Animated.View style={{ transform: [{ scale: cameraButtonScale }] }}>
                <TouchableOpacity 
                  onPress={async () => {
                    if (isAnalyzing || !onCameraPress) return;
                    
                    if (Platform.OS !== 'web') {
                      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    
                    Animated.sequence([
                      Animated.timing(cameraButtonScale, {
                        toValue: 0.9,
                        duration: 100,
                        useNativeDriver: true,
                      }),
                      Animated.spring(cameraButtonScale, {
                        toValue: 1,
                        useNativeDriver: true,
                        tension: 300,
                        friction: 10,
                      }),
                    ]).start();
                    
                    setIsAnalyzing(true);
                    
                    try {
                      await onCameraPress();
                    } finally {
                      setTimeout(() => {
                        setIsAnalyzing(false);
                      }, 2500);
                    }
                  }} 
                  style={styles.flatButton}
                  activeOpacity={0.7}
                  disabled={isAnalyzing}
                >
                  <View
                    style={[styles.flatButtonGradient, {
                      backgroundColor: isDark ? '#FFFFFF' : '#000000',
                    }]}
                  >
                    {isAnalyzing ? (
                      <ActivityIndicator color={isDark ? '#000000' : '#FFFFFF'} size="small" />
                    ) : (
                      <Camera color={isDark ? '#000000' : '#FFFFFF'} size={24} strokeWidth={2.5} />
                    )}
                  </View>
                </TouchableOpacity>
              </Animated.View>
              
              <Animated.View style={{ transform: [{ scale: manualButtonScale }] }}>
                <TouchableOpacity 
                  onPress={async () => {
                    if (isAnalyzing || !onManualPress) return;
                    
                    if (Platform.OS !== 'web') {
                      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }
                    
                    Animated.sequence([
                      Animated.timing(manualButtonScale, {
                        toValue: 0.9,
                        duration: 100,
                        useNativeDriver: true,
                      }),
                      Animated.spring(manualButtonScale, {
                        toValue: 1,
                        useNativeDriver: true,
                        tension: 300,
                        friction: 10,
                      }),
                    ]).start();
                    
                    onManualPress();
                  }} 
                  style={styles.flatButton}
                  activeOpacity={0.7}
                  disabled={isAnalyzing}
                >
                  <View
                    style={[styles.flatButtonGradient, {
                      backgroundColor: isDark ? '#FFFFFF' : '#000000',
                    }]}
                  >
                    <Edit3 color={isDark ? '#000000' : '#FFFFFF'} size={24} strokeWidth={2.5} />
                  </View>
                </TouchableOpacity>
              </Animated.View>
              
              <Animated.View style={{ 
                transform: [{ 
                  scale: Animated.multiply(vitaminsPulseAnim, vitaminsButtonScale) 
                }] 
              }}>
                <TouchableOpacity 
                  onPress={async () => {
                    if (isAnalyzing || !onVitaminsPress) return;
                    
                    if (Platform.OS !== 'web') {
                      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }
                    
                    Animated.sequence([
                      Animated.timing(vitaminsButtonScale, {
                        toValue: 0.9,
                        duration: 100,
                        useNativeDriver: true,
                      }),
                      Animated.spring(vitaminsButtonScale, {
                        toValue: 1,
                        useNativeDriver: true,
                        tension: 300,
                        friction: 10,
                      }),
                    ]).start();
                    
                    onVitaminsPress();
                  }} 
                  style={styles.flatButton}
                  activeOpacity={0.7}
                  disabled={isAnalyzing}
                >
                  <Animated.View style={[
                    styles.flatButtonGlow,
                    {
                      opacity: vitaminsGlowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 0.4],
                      }),
                    }
                  ]} />
                  <View
                    style={[styles.flatButtonGradient, {
                      backgroundColor: isDark ? '#FFFFFF' : '#000000',
                    }]}
                  >
                    <Pill color={isDark ? '#000000' : '#FFFFFF'} size={24} strokeWidth={2.5} />
                  </View>
                </TouchableOpacity>
              </Animated.View>
            </View>
            {isAnalyzing ? (
              <Text style={[styles.analyzingText, { color: colors.primary }]}>
                🍽️ A analisar refeição...
              </Text>
            ) : (
              <Text style={[styles.goalText, { color: colors.textSecondary }]}>
                Meta: {dailyGoal} kcal ({Math.round(percentage)}%)
              </Text>
            )}
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    overflow: 'hidden' as const,
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
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  circularProgressUnit: {
    fontSize: 12,
    marginTop: 2,
  },
  rightContent: {
    alignItems: 'flex-end' as const,
    gap: 8,
  },
  buttonsRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
  },
  flatButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    overflow: 'hidden' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative' as const,
  },
  flatButtonGlow: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    zIndex: 0,
  },
  flatButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    position: 'relative' as const,
  },
  goalText: {
    fontSize: 13,
    textAlign: 'right' as const,
    marginTop: 8,
  },
  analyzingText: {
    fontSize: 13,
    textAlign: 'right' as const,
    marginTop: 8,
    fontWeight: '600' as const,
    fontStyle: 'italic' as const,
  },
});