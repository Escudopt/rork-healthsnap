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
  // Background colors
  background: '#FFFFFF',
  backgroundSecondary: '#F2F2F7',
  backgroundTertiary: '#FFFFFF',
  
  // Surface colors
  surface: '#FFFFFF',
  surfaceSecondary: 'rgba(0, 122, 255, 0.08)',
  surfaceElevated: '#FFFFFF',
  
  // Text colors
  text: '#1C1C1E',
  textSecondary: 'rgba(60, 60, 67, 0.6)',
  textTertiary: 'rgba(60, 60, 67, 0.3)',
  
  // Border colors
  border: 'rgba(60, 60, 67, 0.29)',
  borderSecondary: 'rgba(60, 60, 67, 0.12)',
  
  // Accent colors
  primary: '#007AFF',
  primaryLight: '#5AC8FA',
  primaryDark: '#0051D5',
  
  // Status colors
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  
  // Glass/blur effects
  glassBackground: 'rgba(255, 255, 255, 0.8)',
  glassBorder: 'rgba(60, 60, 67, 0.18)',
  glassOverlay: 'rgba(255, 255, 255, 0.5)',
  
  // Tab bar
  tabBarBackground: 'rgba(255, 255, 255, 0.8)',
  tabBarBorder: 'rgba(60, 60, 67, 0.18)',
  tabBarActive: '#007AFF',
  tabBarInactive: 'rgba(60, 60, 67, 0.6)',
};

const darkTheme: ThemeColors = {
  // Background colors
  background: '#000000',
  backgroundSecondary: '#0A0A0B',
  backgroundTertiary: '#1A1A1C',
  
  // Surface colors
  surface: 'rgba(10, 132, 255, 0.08)',
  surfaceSecondary: 'rgba(10, 132, 255, 0.12)',
  surfaceElevated: 'rgba(255, 255, 255, 0.05)',
  
  // Text colors
  text: '#FFFFFF',
  textSecondary: 'rgba(235, 235, 245, 0.6)',
  textTertiary: 'rgba(235, 235, 245, 0.3)',
  
  // Border colors
  border: 'rgba(84, 84, 88, 0.65)',
  borderSecondary: 'rgba(84, 84, 88, 0.36)',
  
  // Accent colors
  primary: '#0A84FF',
  primaryLight: '#64D2FF',
  primaryDark: '#0056CC',
  
  // Status colors
  success: '#30D158',
  warning: '#FF9F0A',
  error: '#FF453A',
  
  // Glass/blur effects
  glassBackground: 'rgba(28, 28, 30, 0.8)',
  glassBorder: 'rgba(84, 84, 88, 0.65)',
  glassOverlay: 'rgba(255, 255, 255, 0.05)',
  
  // Tab bar
  tabBarBackground: 'rgba(28, 28, 30, 0.8)',
  tabBarBorder: 'rgba(84, 84, 88, 0.65)',
  tabBarActive: '#0A84FF',
  tabBarInactive: 'rgba(235, 235, 245, 0.6)',
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