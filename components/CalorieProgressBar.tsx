import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform, ActivityIndicator } from 'react-native';
import { Camera, Edit3, Pill } from 'lucide-react-native';
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

export function CalorieProgressBar({ currentCalories, dailyGoal, onCameraPress, onManualPress, onVitaminsPress }: CalorieProgressBarProps) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0.98)).current;
  const cameraButtonScale = useRef(new Animated.Value(1)).current;
  const manualButtonScale = useRef(new Animated.Value(1)).current;
  const vitaminsButtonScale = useRef(new Animated.Value(1)).current;
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  const percentage = Math.min((currentCalories / dailyGoal) * 100, 100);

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 40,
      friction: 8,
    }).start();
  }, [scaleAnim]);
  
  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <View
        style={[styles.card, {
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }]}
      >
        <View style={styles.topRow}>
          <View style={styles.caloriesDisplay}>
            <Text style={[styles.currentCalories, { color: colors.text }]}>{currentCalories}</Text>
            <Text style={[styles.separator, { color: colors.textSecondary }]}>/</Text>
            <Text style={[styles.goalCalories, { color: colors.textSecondary }]}>{dailyGoal}</Text>
          </View>
          <Text style={[styles.percentageText, { color: colors.textSecondary }]}>{Math.round(percentage)}%</Text>
        </View>

        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                width: `${percentage}%`,
                backgroundColor: colors.text,
              },
            ]}
          />
        </View>

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
                    toValue: 0.92,
                    duration: 80,
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
              style={styles.button}
              activeOpacity={0.7}
              disabled={isAnalyzing}
            >
              <View
                style={[styles.buttonInner, {
                  backgroundColor: colors.text,
                  borderColor: colors.border,
                }]}
              >
                {isAnalyzing ? (
                  <ActivityIndicator color={colors.background} size="small" />
                ) : (
                  <Camera color={colors.background} size={20} strokeWidth={2} />
                )}
              </View>
              <Text style={[styles.buttonLabel, { color: colors.textSecondary }]}>Scan</Text>
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
                    toValue: 0.92,
                    duration: 80,
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
              style={styles.button}
              activeOpacity={0.7}
              disabled={isAnalyzing}
            >
              <View
                style={[styles.buttonInner, {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }]}
              >
                <Edit3 color={colors.text} size={20} strokeWidth={2} />
              </View>
              <Text style={[styles.buttonLabel, { color: colors.textSecondary }]}>Manual</Text>
            </TouchableOpacity>
          </Animated.View>
          
          <Animated.View style={{ transform: [{ scale: vitaminsButtonScale }] }}>
            <TouchableOpacity 
              onPress={async () => {
                if (isAnalyzing || !onVitaminsPress) return;
                
                if (Platform.OS !== 'web') {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                
                Animated.sequence([
                  Animated.timing(vitaminsButtonScale, {
                    toValue: 0.92,
                    duration: 80,
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
              style={styles.button}
              activeOpacity={0.7}
              disabled={isAnalyzing}
            >
              <View
                style={[styles.buttonInner, {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                }]}
              >
                <Pill color={colors.text} size={20} strokeWidth={2} />
              </View>
              <Text style={[styles.buttonLabel, { color: colors.textSecondary }]}>Nutrients</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {isAnalyzing && (
          <Text style={[styles.analyzingText, { color: colors.textSecondary }]}>
            Analyzing meal...
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  card: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  caloriesDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  currentCalories: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1,
    lineHeight: 36,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  separator: {
    fontSize: 24,
    fontWeight: '300',
    letterSpacing: 0,
  },
  goalCalories: {
    fontSize: 20,
    fontWeight: '400',
    letterSpacing: -0.5,
  },
  percentageText: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  buttonInner: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  buttonLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  analyzingText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '400',
    letterSpacing: -0.1,
  },
});
