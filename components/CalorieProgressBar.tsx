import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Target, TrendingUp, Flame, Camera } from 'lucide-react-native';
import { BlurCard } from './BlurCard';
import { useTheme } from '@/providers/ThemeProvider';
import { Typography } from '@/constants/typography';

interface CalorieProgressBarProps {
  currentCalories: number;
  dailyGoal: number;
  onGoalPress?: () => void;
  onCameraPress?: () => void;
}

export function CalorieProgressBar({ currentCalories, dailyGoal, onGoalPress, onCameraPress }: CalorieProgressBarProps) {
  const { colors, isDark } = useTheme();
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const iconRotateAnim = useRef(new Animated.Value(0)).current;
  const cameraButtonScale = useRef(new Animated.Value(1)).current;
  const cameraButtonGlow = useRef(new Animated.Value(0)).current;
  
  const percentage = Math.min((currentCalories / dailyGoal) * 100, 100);
  const isOverGoal = currentCalories > dailyGoal;
  const remaining = Math.max(dailyGoal - currentCalories, 0);
  const isNearGoal = percentage >= 80 && !isOverGoal;
  
  const progressColor = isOverGoal 
    ? '#FF3B30'
    : currentCalories >= dailyGoal 
    ? '#34C759'
    : isNearGoal 
    ? '#FF9500'
    : '#007AFF';
  
  const backgroundColor = isDark 
    ? 'rgba(255, 255, 255, 0.1)' 
    : 'rgba(0, 0, 0, 0.05)';

  useEffect(() => {
    // Animate progress bar
    Animated.spring(progressAnim, {
      toValue: percentage,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();

    // Scale animation with more refined spring
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
      delay: 100,
    }).start();

    // Shimmer animation for progress bar
    const shimmerLoop = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };
    
    if (percentage > 0) {
      shimmerLoop();
    }

    // Icon rotation for over goal
    if (isOverGoal) {
      Animated.loop(
        Animated.timing(iconRotateAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        })
      ).start();
    }

    // Camera button pulsing animation
    const startCameraPulse = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(cameraButtonScale, {
            toValue: 1.1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(cameraButtonScale, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    // Camera button glow animation
    const startCameraGlow = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(cameraButtonGlow, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(cameraButtonGlow, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    setTimeout(startCameraPulse, 500);
    setTimeout(startCameraGlow, 800);

    // Pulse animation for near goal or over goal
    let pulseTimeout: NodeJS.Timeout;
    if (isNearGoal || isOverGoal) {
      const pulse = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.03,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (isNearGoal || isOverGoal) {
            pulseTimeout = setTimeout(pulse, 800);
          }
        });
      };
      pulse();
    }

    return () => {
      if (pulseTimeout) {
        clearTimeout(pulseTimeout);
      }
    };
  }, [percentage, isNearGoal, isOverGoal, progressAnim, pulseAnim, scaleAnim, shimmerAnim, iconRotateAnim, cameraButtonScale, cameraButtonGlow]);
  
  return (
    <Animated.View style={[styles.animatedContainer, { transform: [{ scale: scaleAnim }] }]}>
      <View style={[styles.container, { backgroundColor: colors.surfaceElevated }]}>
        {/* Apple Health-style header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]}>Calorias Ativas</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {isOverGoal ? 'Meta ultrapassada' : currentCalories >= dailyGoal ? 'Meta alcançada' : 'Progresso do dia'}
            </Text>
          </View>
          <Animated.View style={[
            styles.cameraButtonContainer,
            {
              transform: [{ scale: cameraButtonScale }]
            }
          ]}>
            <Animated.View style={[
              styles.cameraButtonGlow,
              {
                opacity: cameraButtonGlow.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 0.8],
                })
              }
            ]} />
            <TouchableOpacity 
              onPress={onCameraPress} 
              style={styles.cameraButton}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#007AFF', '#0056CC', '#003D99']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cameraButtonGradient}
              >
                <View style={styles.cameraIconContainer}>
                  <Camera color="white" size={18} strokeWidth={2.8} />
                  <View style={styles.cameraIconHighlight} />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
        
        {/* Apple Health-style calories display */}
        <View style={styles.caloriesSection}>
          <View style={styles.caloriesContainer}>
            <Text style={[styles.currentCalories, { color: colors.text }]}>
              {currentCalories.toLocaleString()}
            </Text>
            <Text style={[styles.calorieUnit, { color: colors.textSecondary }]}>KCAL</Text>
          </View>
          
          <Text style={[styles.goalText, { color: colors.textSecondary }]}>
            META {dailyGoal.toLocaleString()}
          </Text>
        </View>
        
        {/* Apple Health-style circular progress */}
        <View style={styles.progressSection}>
          <View style={styles.circularProgressContainer}>
            <View style={[styles.circularProgress, { borderColor: colors.surfaceSecondary }]}>
              {/* Background circle */}
              <View style={[styles.circularProgressBackground, { borderColor: colors.surfaceSecondary }]} />
              
              {/* Progress circle - first half */}
              <Animated.View 
                style={[
                  styles.circularProgressFill,
                  styles.circularProgressLeft,
                  {
                    borderTopColor: progressColor,
                    borderRightColor: progressColor,
                    transform: [{
                      rotate: progressAnim.interpolate({
                        inputRange: [0, 50, 100],
                        outputRange: ['-90deg', '0deg', '0deg'],
                        extrapolate: 'clamp',
                      })
                    }]
                  }
                ]}
              />
              
              {/* Progress circle - second half */}
              <Animated.View 
                style={[
                  styles.circularProgressFill,
                  styles.circularProgressRight,
                  {
                    borderBottomColor: progressColor,
                    borderRightColor: progressColor,
                    opacity: progressAnim.interpolate({
                      inputRange: [0, 50, 50.01, 100],
                      outputRange: [0, 0, 1, 1],
                      extrapolate: 'clamp',
                    }),
                    transform: [{
                      rotate: progressAnim.interpolate({
                        inputRange: [50, 100],
                        outputRange: ['-90deg', '0deg'],
                        extrapolate: 'clamp',
                      })
                    }]
                  }
                ]}
              />
              
              <View style={styles.circularProgressCenter}>
                <Text style={[styles.progressPercentage, { color: colors.text }]}>
                  {Math.round(percentage)}%
                </Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Apple Health-style stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {remaining.toLocaleString()}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>RESTANTES</Text>
          </View>
          
          <View style={[styles.statDivider, { backgroundColor: colors.surfaceSecondary }]} />
          
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {Math.round(percentage)}%
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>DA META</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 0,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.04)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  iconContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
    }),
  },
  iconGradient: {
    width: 56,
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  iconInnerShadow: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  titleTextContainer: {
    flex: 1,
  },
  title: {
    ...Typography.caption1Emphasized,
    fontSize: 14,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
    marginBottom: 2,
    opacity: 0.9,
  },
  subtitle: {
    ...Typography.caption2,
    fontSize: 12,
    fontWeight: '500' as const,
    opacity: 0.7,
    letterSpacing: 0.2,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  cameraButtonContainer: {
    position: 'relative',
  },
  cameraButtonGlow: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 21,
    backgroundColor: '#007AFF',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  cameraButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cameraButtonGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cameraIconContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIconHighlight: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: 'rgba(255, 255, 255, 0.8)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },

  caloriesSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  caloriesContainer: {
    alignItems: 'center',
    marginBottom: 6,
  },
  currentCalories: {
    ...Typography.largeNumber,
    fontSize: 42,
    fontWeight: '200' as const,
    letterSpacing: -2.1,
    marginBottom: 3,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  calorieUnit: {
    ...Typography.caption1Emphasized,
    fontSize: 13,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.6,
    opacity: 0.7,
  },
  goalText: {
    ...Typography.caption1,
    fontSize: 12,
    fontWeight: '500' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.4,
    opacity: 0.7,
  },
  statusIndicator: {
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusGradient: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
  },
  statusText: {
    textAlign: 'center' as const,
    letterSpacing: 0.2,
  },
  progressSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  circularProgressContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularProgress: {
    width: 90,
    height: 90,
    borderRadius: 45,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularProgressBackground: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  circularProgressFill: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: 'transparent',
  },
  circularProgressLeft: {
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
    transform: [{ rotate: '-90deg' }],
  },
  circularProgressRight: {
    borderTopColor: 'transparent',
    borderLeftColor: 'transparent',
    transform: [{ rotate: '-90deg' }],
  },
  circularProgressCenter: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    ...Typography.smallNumber,
    fontSize: 18,
    fontWeight: '600' as const,
    letterSpacing: -0.4,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  progressBarTrack: {
    flex: 1,
    position: 'relative',
  },
  progressBarBackground: {
    height: '100%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  progressBarShimmer: {
    position: 'absolute',
    top: 2,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 10,
  },
  progressGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  goalMarker: {
    position: 'absolute',
    right: 0,
    top: -4,
    width: 3,
    height: 24,
    borderRadius: 1.5,
    opacity: 0.5,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  progressLabel: {
    opacity: 0.6,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...Typography.smallNumber,
    fontSize: 20,
    fontWeight: '500' as const,
    marginBottom: 2,
    letterSpacing: -0.5,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  statLabel: {
    ...Typography.caption2Emphasized,
    fontSize: 10,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.6,
    opacity: 0.6,
  },
  statDivider: {
    width: 1,
    height: 20,
    borderRadius: 0.5,
    opacity: 0.15,
  },
  animatedContainer: {
    // Container for animated view
  },
});