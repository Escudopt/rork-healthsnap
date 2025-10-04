import { useState, useEffect, useCallback, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { Appearance, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Typography, getTypographyStyle } from '@/constants/typography';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorScheme = 'light' | 'dark';

export interface ThemeColors {
  // Background colors
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  
  // Surface colors
  surface: string;
  surfaceSecondary: string;
  surfaceElevated: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  
  // Border colors
  border: string;
  borderSecondary: string;
  
  // Accent colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  
  // Glass/blur effects
  glassBackground: string;
  glassBorder: string;
  glassOverlay: string;
  
  // Tab bar
  tabBarBackground: string;
  tabBarBorder: string;
  tabBarActive: string;
  tabBarInactive: string;
}

const lightTheme: ThemeColors = {
  // Background colors - Soft, clean whites
  background: '#FAFBFF',
  backgroundSecondary: '#F5F7FA',
  backgroundTertiary: '#FFFFFF',
  
  // Surface colors - Elevated with subtle depth
  surface: '#FFFFFF',
  surfaceSecondary: 'rgba(0, 122, 255, 0.06)',
  surfaceElevated: '#FFFFFF',
  
  // Text colors - High contrast, readable
  text: '#1A1A1C',
  textSecondary: 'rgba(60, 60, 67, 0.65)',
  textTertiary: 'rgba(60, 60, 67, 0.4)',
  
  // Border colors - Subtle separation
  border: 'rgba(0, 0, 0, 0.08)',
  borderSecondary: 'rgba(0, 0, 0, 0.04)',
  
  // Accent colors - Vibrant iOS blue
  primary: '#007AFF',
  primaryLight: '#5AC8FA',
  primaryDark: '#0051D5',
  
  // Status colors - iOS standard
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  
  // Glass/blur effects - Premium frosted glass
  glassBackground: 'rgba(255, 255, 255, 0.85)',
  glassBorder: 'rgba(0, 0, 0, 0.06)',
  glassOverlay: 'rgba(255, 255, 255, 0.6)',
  
  // Tab bar - Clean and modern
  tabBarBackground: 'rgba(255, 255, 255, 0.92)',
  tabBarBorder: 'rgba(0, 0, 0, 0.06)',
  tabBarActive: '#007AFF',
  tabBarInactive: 'rgba(60, 60, 67, 0.6)',
};

const darkTheme: ThemeColors = {
  // Background colors - Rich, deep blacks with subtle blue tint
  background: '#0A0B0D',
  backgroundSecondary: '#12141A',
  backgroundTertiary: '#1A1D26',
  
  // Surface colors - Elevated with depth
  surface: '#161821',
  surfaceSecondary: '#1E2230',
  surfaceElevated: '#1C1F2E',
  
  // Text colors - Crystal clear whites
  text: '#FFFFFF',
  textSecondary: '#A8B0C0',
  textTertiary: '#6B7280',
  
  // Border colors - Subtle glowing edges
  border: 'rgba(255, 255, 255, 0.08)',
  borderSecondary: 'rgba(255, 255, 255, 0.04)',
  
  // Accent colors - Electric blue with glow
  primary: '#3B82F6',
  primaryLight: '#60A5FA',
  primaryDark: '#2563EB',
  
  // Status colors - Vibrant and clear
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  
  // Glass/blur effects - Premium frosted dark glass
  glassBackground: 'rgba(22, 24, 33, 0.88)',
  glassBorder: 'rgba(59, 130, 246, 0.12)',
  glassOverlay: 'rgba(255, 255, 255, 0.03)',
  
  // Tab bar - Sleek and modern
  tabBarBackground: 'rgba(22, 24, 33, 0.95)',
  tabBarBorder: 'rgba(59, 130, 246, 0.15)',
  tabBarActive: '#3B82F6',
  tabBarInactive: '#6B7280',
};

interface ThemeContextType {
  themeMode: ThemeMode;
  colorScheme: ColorScheme;
  colors: ThemeColors;
  typography: typeof Typography;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
  getTypographyStyle: typeof getTypographyStyle;
}



export const [ThemeProvider, useTheme] = createContextHook<ThemeContextType>(() => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [systemColorScheme, setSystemColorScheme] = useState<ColorScheme>('light'); // Default to light to prevent hydration mismatch

  // Determine the actual color scheme based on theme mode
  const colorScheme: ColorScheme = themeMode === 'system' ? systemColorScheme : themeMode;
  const isDark = colorScheme === 'dark';
  const colors = isDark ? darkTheme : lightTheme;

  // Load theme preference from AsyncStorage
  const loadThemeMode = useCallback(async () => {
    try {
      const storedTheme = await AsyncStorage.getItem('theme_mode');
      console.log('Raw stored theme data:', storedTheme);
      
      if (storedTheme && storedTheme !== 'null' && storedTheme !== '' && ['light', 'dark', 'system'].includes(storedTheme)) {
        setThemeModeState(storedTheme as ThemeMode);
        console.log('🎨 Theme mode loaded from storage:', storedTheme);
      } else {
        console.log('🎨 Theme mode initialized with system default');
        // Clear any corrupted theme data
        if (storedTheme && !['light', 'dark', 'system'].includes(storedTheme)) {
          console.log('🧹 Clearing corrupted theme data:', storedTheme);
          await AsyncStorage.removeItem('theme_mode');
        }
      }
    } catch (error) {
      console.error('❌ Error loading theme mode:', error);
      // Clear corrupted data on error
      try {
        await AsyncStorage.removeItem('theme_mode');
      } catch (clearError) {
        console.error('❌ Error clearing corrupted theme data:', clearError);
      }
    }
  }, []);

  // Save theme preference to AsyncStorage
  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    // Validate input
    if (!mode || !['light', 'dark', 'system'].includes(mode)) {
      console.error('❌ Invalid theme mode:', mode);
      return;
    }
    
    try {
      setThemeModeState(mode);
      // Ensure we're saving a plain string, not JSON
      await AsyncStorage.setItem('theme_mode', mode);
      console.log('💾 Theme mode saved:', mode);
    } catch (error) {
      console.error('❌ Error saving theme mode:', error);
      // Fallback to default theme on save error
      setThemeModeState('system');
    }
  }, []);

  // Toggle between light and dark (skip system)
  const toggleTheme = useCallback(async () => {
    const newMode: ThemeMode = isDark ? 'light' : 'dark';
    await setThemeMode(newMode);
  }, [isDark, setThemeMode]);

  // Listen to system appearance changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme === 'dark' ? 'dark' : 'light');
      console.log('🌓 System color scheme changed:', colorScheme);
    });

    return () => subscription?.remove();
  }, []);

  // Load theme mode on mount - non-blocking
  useEffect(() => {
    // Set initial system color scheme
    const initialColorScheme = Appearance.getColorScheme() === 'dark' ? 'dark' : 'light';
    setSystemColorScheme(initialColorScheme);
    
    // Load theme preference in background
    const timeoutId = setTimeout(() => {
      loadThemeMode();
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [loadThemeMode]);

  // Update status bar style based on theme
  useEffect(() => {
    StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content', true);
  }, [isDark]);

  return useMemo(() => ({
    themeMode,
    colorScheme,
    colors,
    typography: Typography,
    isDark,
    setThemeMode,
    toggleTheme,
    getTypographyStyle,
  }), [themeMode, colorScheme, colors, isDark, setThemeMode, toggleTheme]);
});

// Helper hook for creating themed styles
export const useThemedStyles = <T extends Record<string, any>>(
  createStyles: (colors: ThemeColors, isDark: boolean) => T
): T => {
  const { colors, isDark } = useTheme();
  return createStyles(colors, isDark);
};