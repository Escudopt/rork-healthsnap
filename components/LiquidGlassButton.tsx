import React from 'react';
import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Platform,
  ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/providers/ThemeProvider';
import type { LucideIcon } from 'lucide-react-native';

interface LiquidGlassButtonProps {
  title: string;
  onPress: () => void;
  icon?: LucideIcon;
  disabled?: boolean;
  variant?: 'default' | 'small' | 'large';
  style?: ViewStyle;
}

export const LiquidGlassButton: React.FC<LiquidGlassButtonProps> = ({
  title,
  onPress,
  icon: Icon,
  disabled = false,
  variant = 'default',
  style,
}) => {
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const sizes = {
    small: { height: 44, paddingHorizontal: 16, fontSize: 14, iconSize: 16 },
    default: { height: 52, paddingHorizontal: 20, fontSize: 15, iconSize: 18 },
    large: { height: 60, paddingHorizontal: 24, fontSize: 16, iconSize: 20 },
  };

  const size = sizes[variant];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    if (disabled) return;

    scale.value = withSpring(0.97, {
      damping: 15,
      stiffness: 400,
    });
    opacity.value = withTiming(0.85, { duration: 100 });

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePressOut = () => {
    if (disabled) return;

    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 400,
    });
    opacity.value = withTiming(1, { duration: 100 });
  };

  const handlePress = () => {
    if (disabled) return;
    onPress();
  };

  const borderColor = isDark
    ? 'rgba(255, 255, 255, 0.15)'
    : 'rgba(255, 255, 255, 0.18)';

  const glassBackground = isDark
    ? 'rgba(22, 24, 33, 0.6)'
    : 'rgba(255, 255, 255, 0.65)';

  return (
    <Animated.View style={[animatedStyle, style]}>
      <TouchableOpacity
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={1}
        style={[
          styles.container,
          {
            height: size.height,
            paddingHorizontal: size.paddingHorizontal,
            opacity: disabled ? 0.5 : 1,
          },
        ]}
      >
        {Platform.OS === 'ios' ? (
          <BlurView
            intensity={isDark ? 30 : 20}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFillObject}
          />
        ) : (
          <View
            style={[
              StyleSheet.absoluteFillObject,
              { backgroundColor: glassBackground },
            ]}
          />
        )}

        <LinearGradient
          colors={
            isDark
              ? ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)']
              : ['rgba(255, 255, 255, 0.5)', 'rgba(255, 255, 255, 0.2)']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFillObject, styles.highlightGradient]}
        />

        <View style={styles.contentContainer}>
          {Icon && (
            <Icon
              color={colors.text}
              size={size.iconSize}
              strokeWidth={2.5}
            />
          )}
          <Text
            style={[
              styles.title,
              {
                color: colors.text,
                fontSize: size.fontSize,
              },
            ]}
          >
            {title}
          </Text>
        </View>

        <View
          style={[
            StyleSheet.absoluteFillObject,
            styles.border,
            { borderColor },
          ]}
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 18,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  highlightGradient: {
    borderRadius: 18,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 1,
  },
  title: {
    fontWeight: '600' as const,
    letterSpacing: 0.2,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  border: {
    borderRadius: 18,
    borderWidth: 1,
    pointerEvents: 'none',
  },
});
