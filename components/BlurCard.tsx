import React from 'react';
import { View, StyleSheet, Platform, ViewStyle } from 'react-native';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';

interface BlurCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  variant?: 'default' | 'premium' | 'subtle';
}

export function BlurCard({ children, style, intensity = 85, variant = 'default' }: BlurCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'premium':
        return {
          borderRadius: 28,
          shadowRadius: 24,
          shadowOpacity: 0.4,
        };
      case 'subtle':
        return {
          borderRadius: 18,
          shadowRadius: 14,
          shadowOpacity: 0.2,
        };
      default:
        return {
          borderRadius: 24,
          shadowRadius: 18,
          shadowOpacity: 0.3,
        };
    }
  };

  const variantStyles = getVariantStyles();

  if (Platform.OS === 'ios' && isLiquidGlassAvailable()) {
    return (
      <GlassView 
        style={[styles.glassCard, variantStyles, style]}
        glassEffectStyle="regular"
      >
        {children}
      </GlassView>
    );
  }

  return (
    <View style={[styles.simpleCard, variantStyles, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  glassCard: {
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  simpleCard: {
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
});