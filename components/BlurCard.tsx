import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';

interface BlurCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'flat';
}

export function BlurCard({ children, style, variant = 'default' }: BlurCardProps) {
  const { colors } = useTheme();
  
  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return {
          borderRadius: 16,
          backgroundColor: colors.surfaceElevated,
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'flat':
        return {
          borderRadius: 12,
          backgroundColor: colors.surface,
          borderWidth: 0,
        };
      default:
        return {
          borderRadius: 16,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        };
    }
  };

  const variantStyles = getVariantStyles();

  return (
    <View style={[styles.card, variantStyles, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
});
