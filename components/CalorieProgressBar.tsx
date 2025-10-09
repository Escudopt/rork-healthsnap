import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
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
                        toValue: 0.85,
                        duration: 150,
                        useNativeDriver: true,
                      }),
                      Animated.spring(vitaminsButtonScale, {
                        toValue: 1,
                        useNativeDriver: true,
                        tension: 100,
                        friction: 5,
                      }),
                    ]).start();
                    
                    onVitaminsPress();
                  }} 
                  style={[styles.liquidGlassButton, {
                    shadowColor: '#4CAF50',
                  }]}
                  activeOpacity={0.8}
                  disabled={isAnalyzing}
                >
                  <Animated.View style={[
                    styles.liquidGlassGlow,
                    {
                      opacity: vitaminsGlowAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.2, 0.5],
                      }),
                      backgroundColor: '#4CAF50',
                    }
                  ]} />
                  {Platform.OS === 'web' ? (
                    <View style={styles.liquidGlassContainer}>
                      <LinearGradient
                        colors={[
                          'rgba(102, 187, 106, 0.25)',
                          'rgba(76, 175, 80, 0.35)',
                          'rgba(67, 160, 71, 0.25)'
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.liquidGlassGradient}
                      >
                        <View style={styles.liquidGlassInner}>
                          <Pill color="#4CAF50" size={24} strokeWidth={2.5} />
                          <View style={[styles.liquidGlassShine, { backgroundColor: '#4CAF50' }]} />
                        </View>
                      </LinearGradient>
                    </View>
                  ) : (
                    <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={styles.liquidGlassContainer}>
                      <LinearGradient
                        colors={[
                          'rgba(102, 187, 106, 0.25)',
                          'rgba(76, 175, 80, 0.35)',
                          'rgba(67, 160, 71, 0.25)'
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.liquidGlassGradient}
                      >
                        <View style={styles.liquidGlassInner}>
                          <Pill color="#4CAF50" size={24} strokeWidth={2.5} />
                          <View style={[styles.liquidGlassShine, { backgroundColor: '#4CAF50' }]} />
                        </View>
                      </LinearGradient>
                    </BlurView>
                  )}
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
                        toValue: 0.85,
                        duration: 200,
                        useNativeDriver: true,
                      }),
                      Animated.timing(manualButtonScale, {
                        toValue: 1,
                        duration: 200,
                        useNativeDriver: true,
                      }),
                    ]).start();
                    
                    onManualPress();
                  }} 
                  style={[styles.liquidGlassButton, {
                    shadowColor: colors.primary,
                    width: 48,
                    height: 48,
                  }]}
                  activeOpacity={0.7}
                  disabled={isAnalyzing}
                >
                  {Platform.OS === 'web' ? (
                    <View style={[styles.liquidGlassContainer, { width: 48, height: 48, borderRadius: 24 }]}>
                      <LinearGradient
                        colors={[
                          isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.6)',
                          isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.4)'
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.liquidGlassGradient, { width: 48, height: 48, borderRadius: 24 }]}
                      >
                        <View style={styles.liquidGlassInner}>
                          <Edit3 color={colors.primary} size={20} strokeWidth={2} />
                        </View>
                      </LinearGradient>
                    </View>
                  ) : (
                    <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={[styles.liquidGlassContainer, { width: 48, height: 48, borderRadius: 24 }]}>
                      <LinearGradient
                        colors={[
                          isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.6)',
                          isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.4)'
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[styles.liquidGlassGradient, { width: 48, height: 48, borderRadius: 24 }]}
                      >
                        <View style={styles.liquidGlassInner}>
                          <Edit3 color={colors.primary} size={20} strokeWidth={2} />
                        </View>
                      </LinearGradient>
                    </BlurView>
                  )}
                </TouchableOpacity>
              </Animated.View>
              
              <Animated.View style={{ transform: [{ scale: Animated.multiply(pulseAnim, cameraButtonScale) }] }}>
                <TouchableOpacity 
                onPress={async () => {
                  if (isAnalyzing || !onCameraPress) return;
                  
                  if (Platform.OS !== 'web') {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  
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
                  
                  setIsAnalyzing(true);
                  
                  try {
                    await onCameraPress();
                  } finally {
                    setTimeout(() => {
                      setIsAnalyzing(false);
                    }, 2500);
                  }
                }} 
                style={[styles.liquidGlassButton, {
                  shadowColor: colors.primary,
                  width: 60,
                  height: 60,
                }]}
                activeOpacity={0.7}
                disabled={isAnalyzing}
              >
                <Animated.View style={[
                  styles.liquidGlassGlow,
                  {
                    opacity: pulseAnim.interpolate({
                      inputRange: [1, 1.05],
                      outputRange: [0.3, 0.6],
                    }),
                    backgroundColor: colors.primary,
                  }
                ]} />
                {Platform.OS === 'web' ? (
                  <View style={[styles.liquidGlassContainer, { width: 60, height: 60, borderRadius: 30 }]}>
                    <LinearGradient
                      colors={isAnalyzing 
                        ? [
                            `${colors.primaryDark}40`,
                            `${colors.primaryDark}50`
                          ]
                        : [
                            `${colors.primary}40`,
                            `${colors.primaryDark}50`
                          ]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[styles.liquidGlassGradient, { width: 60, height: 60, borderRadius: 30 }]}
                    >
                      <View style={styles.liquidGlassInner}>
                        {isAnalyzing ? (
                          <ActivityIndicator color={colors.primary} size="small" />
                        ) : (
                          <>
                            <Camera color={colors.primary} size={28} strokeWidth={2} />
                            <View style={[styles.liquidGlassShine, { backgroundColor: colors.primary }]} />
                          </>
                        )}
                      </View>
                    </LinearGradient>
                  </View>
                ) : (
                  <BlurView intensity={20} tint={isDark ? 'dark' : 'light'} style={[styles.liquidGlassContainer, { width: 60, height: 60, borderRadius: 30 }]}>
                    <LinearGradient
                      colors={isAnalyzing 
                        ? [
                            `${colors.primaryDark}40`,
                            `${colors.primaryDark}50`
                          ]
                        : [
                            `${colors.primary}40`,
                            `${colors.primaryDark}50`
                          ]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[styles.liquidGlassGradient, { width: 60, height: 60, borderRadius: 30 }]}
                    >
                      <View style={styles.liquidGlassInner}>
                        {isAnalyzing ? (
                          <ActivityIndicator color={colors.primary} size="small" />
                        ) : (
                          <>
                            <Camera color={colors.primary} size={28} strokeWidth={2} />
                            <View style={[styles.liquidGlassShine, { backgroundColor: colors.primary }]} />
                          </>
                        )}
                      </View>
                    </LinearGradient>
                  </BlurView>
                )}
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
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
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
  liquidGlassButton: {
    borderRadius: 28,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 12,
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },
  liquidGlassGlow: {
    position: 'absolute' as const,
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 34,
  },
  liquidGlassContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden' as const,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: Platform.select({
      web: 'rgba(255, 255, 255, 0.1)',
      default: 'transparent',
    }),
  },
  liquidGlassGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    position: 'relative' as const,
  },
  liquidGlassInner: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    position: 'relative' as const,
  },
  liquidGlassShine: {
    position: 'absolute' as const,
    top: -10,
    right: -10,
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.6,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
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