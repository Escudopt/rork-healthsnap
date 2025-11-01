import { Platform } from 'react-native';

// iOS 26 Typography System
// Based on Apple's Human Interface Guidelines and iOS 26 design language

export const FontWeights = {
  ultraLight: Platform.select({ ios: '100', default: '100' }) as '100',
  thin: Platform.select({ ios: '200', default: '200' }) as '200',
  light: Platform.select({ ios: '300', default: '300' }) as '300',
  regular: Platform.select({ ios: '400', default: '400' }) as '400',
  medium: Platform.select({ ios: '500', default: '500' }) as '500',
  semibold: Platform.select({ ios: '600', default: '600' }) as '600',
  bold: Platform.select({ ios: '700', default: '700' }) as '700',
  heavy: Platform.select({ ios: '800', default: '800' }) as '800',
  black: Platform.select({ ios: '900', default: '900' }) as '900',
} as const;

export const FontFamilies = {
  // Modern, clean system fonts
  system: Platform.select({
    ios: '-apple-system',
    android: 'Roboto',
    web: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", "SF Pro Display", Roboto, "Helvetica Neue", Arial, sans-serif',
    default: '-apple-system',
  }),
  systemRounded: Platform.select({
    ios: '.SF UI Rounded',
    android: 'Roboto',
    web: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", "SF Pro Rounded", Roboto, "Helvetica Neue", Arial, sans-serif',
    default: '.SF UI Rounded',
  }),
  systemMono: Platform.select({
    ios: 'SF Mono',
    android: 'Roboto Mono',
    web: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Source Code Pro", Consolas, "Liberation Mono", Menlo, monospace',
    default: 'SF Mono',
  }),
  // Clean, modern display font for headings
  display: Platform.select({
    ios: '.SF UI Display',
    android: 'Roboto',
    web: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", "SF Pro Display", system-ui, sans-serif',
    default: '.SF UI Display',
  }),
} as const;

// iOS 26 Typography Scale
export const Typography = {
  // Large Titles - Threads-inspired hierarchy
  largeTitle: {
    fontFamily: FontFamilies.display,
    fontSize: 32,
    fontWeight: FontWeights.bold,
    lineHeight: 38,
    letterSpacing: -0.6,
  },
  
  // Titles - Clean hierarchy
  title1: {
    fontFamily: FontFamilies.display,
    fontSize: 26,
    fontWeight: FontWeights.bold,
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  title2: {
    fontFamily: FontFamilies.display,
    fontSize: 20,
    fontWeight: FontWeights.semibold,
    lineHeight: 26,
    letterSpacing: -0.4,
  },
  title3: {
    fontFamily: FontFamilies.display,
    fontSize: 18,
    fontWeight: FontWeights.semibold,
    lineHeight: 24,
    letterSpacing: -0.3,
  },
  
  // Headlines
  headline: {
    fontFamily: FontFamilies.display,
    fontSize: 16,
    fontWeight: FontWeights.semibold,
    lineHeight: 21,
    letterSpacing: -0.3,
  },
  
  // Body Text - Optimized for readability
  body: {
    fontFamily: FontFamilies.system,
    fontSize: 15,
    fontWeight: FontWeights.regular,
    lineHeight: 21,
    letterSpacing: -0.2,
  },
  bodyEmphasized: {
    fontFamily: FontFamilies.system,
    fontSize: 15,
    fontWeight: FontWeights.semibold,
    lineHeight: 21,
    letterSpacing: -0.2,
  },
  
  // Callout
  callout: {
    fontFamily: FontFamilies.system,
    fontSize: 16,
    fontWeight: FontWeights.regular,
    lineHeight: 21,
    letterSpacing: -0.32,
  },
  calloutEmphasized: {
    fontFamily: FontFamilies.system,
    fontSize: 16,
    fontWeight: FontWeights.semibold,
    lineHeight: 21,
    letterSpacing: -0.32,
  },
  
  // Subheadline
  subheadline: {
    fontFamily: FontFamilies.system,
    fontSize: 15,
    fontWeight: FontWeights.regular,
    lineHeight: 20,
    letterSpacing: -0.24,
  },
  subheadlineEmphasized: {
    fontFamily: FontFamilies.system,
    fontSize: 15,
    fontWeight: FontWeights.semibold,
    lineHeight: 20,
    letterSpacing: -0.24,
  },
  
  // Footnote
  footnote: {
    fontFamily: FontFamilies.system,
    fontSize: 13,
    fontWeight: FontWeights.regular,
    lineHeight: 18,
    letterSpacing: -0.08,
  },
  footnoteEmphasized: {
    fontFamily: FontFamilies.system,
    fontSize: 13,
    fontWeight: FontWeights.semibold,
    lineHeight: 18,
    letterSpacing: -0.08,
  },
  
  // Caption
  caption1: {
    fontFamily: FontFamilies.system,
    fontSize: 12,
    fontWeight: FontWeights.regular,
    lineHeight: 16,
    letterSpacing: 0,
  },
  caption1Emphasized: {
    fontFamily: FontFamilies.system,
    fontSize: 12,
    fontWeight: FontWeights.medium,
    lineHeight: 16,
    letterSpacing: 0,
  },
  caption2: {
    fontFamily: FontFamilies.system,
    fontSize: 11,
    fontWeight: FontWeights.regular,
    lineHeight: 13,
    letterSpacing: 0.07,
  },
  caption2Emphasized: {
    fontFamily: FontFamilies.system,
    fontSize: 11,
    fontWeight: FontWeights.semibold,
    lineHeight: 13,
    letterSpacing: 0.07,
  },
  
  // Special Cases
  tabBar: {
    fontFamily: FontFamilies.system,
    fontSize: 10,
    fontWeight: FontWeights.medium,
    lineHeight: 12,
    letterSpacing: 0.12,
  },
  
  // Numbers and Data
  largeNumber: {
    fontFamily: FontFamilies.systemRounded,
    fontSize: 48,
    fontWeight: FontWeights.bold,
    lineHeight: 52,
    letterSpacing: -1.2,
  },
  mediumNumber: {
    fontFamily: FontFamilies.systemRounded,
    fontSize: 24,
    fontWeight: FontWeights.semibold,
    lineHeight: 28,
    letterSpacing: -0.5,
  },
  smallNumber: {
    fontFamily: FontFamilies.systemRounded,
    fontSize: 18,
    fontWeight: FontWeights.semibold,
    lineHeight: 22,
    letterSpacing: -0.3,
  },
} as const;

// Helper function to get typography styles
export const getTypographyStyle = (variant: keyof typeof Typography) => {
  return Typography[variant];
};

// Helper function to create custom typography
export const createTypographyStyle = ({
  fontSize,
  fontWeight = 'regular' as keyof typeof FontWeights,
  fontFamily = FontFamilies.system,
  lineHeight,
  letterSpacing = 0,
}: {
  fontSize: number;
  fontWeight?: keyof typeof FontWeights;
  fontFamily?: string;
  lineHeight?: number;
  letterSpacing?: number;
}) => {
  return {
    fontFamily,
    fontSize,
    fontWeight: FontWeights[fontWeight],
    lineHeight: lineHeight || fontSize * 1.2,
    letterSpacing,
  };
};