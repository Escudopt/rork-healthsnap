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
  // Background colors - Pure white
  background: '#FFFFFF',
  backgroundSecondary: '#FAFAFA',
  backgroundTertiary: '#FFFFFF',
  
  // Surface colors - Clean white surfaces
  surface: '#FFFFFF',
  surfaceSecondary: '#F8F8F8',
  surfaceElevated: '#FFFFFF',
  
  // Text colors - Pure black hierarchy
  text: '#000000',
  textSecondary: '#666666',
  textTertiary: '#999999',
  
  // Border colors - Subtle gray lines
  border: '#E5E5E5',
  borderSecondary: '#F0F0F0',
  
  // Accent colors - Black accents
  primary: '#000000',
  primaryLight: '#333333',
  primaryDark: '#000000',
  
  // Status colors - Monochrome
  success: '#000000',
  warning: '#666666',
  error: '#000000',
  
  // Glass/blur effects - Clean white glass
  glassBackground: 'rgba(255, 255, 255, 0.95)',
  glassBorder: 'rgba(0, 0, 0, 0.06)',
  glassOverlay: 'rgba(255, 255, 255, 0.9)',
  
  // Tab bar - Minimal white
  tabBarBackground: 'rgba(255, 255, 255, 0.95)',
  tabBarBorder: 'rgba(0, 0, 0, 0.06)',
  tabBarActive: '#000000',
  tabBarInactive: '#999999',
};

const darkTheme: ThemeColors = {
  // Background colors - Pure black
  background: '#000000',
  backgroundSecondary: '#0A0A0A',
  backgroundTertiary: '#000000',
  
  // Surface colors - Dark surfaces
  surface: '#000000',
  surfaceSecondary: '#1A1A1A',
  surfaceElevated: '#0F0F0F',
  
  // Text colors - Pure white hierarchy
  text: '#FFFFFF',
  textSecondary: '#999999',
  textTertiary: '#666666',
  
  // Border colors - Subtle white lines
  border: '#2A2A2A',
  borderSecondary: '#1A1A1A',
  
  // Accent colors - White accents
  primary: '#FFFFFF',
  primaryLight: '#CCCCCC',
  primaryDark: '#FFFFFF',
  
  // Status colors - Monochrome
  success: '#FFFFFF',
  warning: '#999999',
  error: '#FFFFFF',
  
  // Glass/blur effects - Clean black glass
  glassBackground: 'rgba(0, 0, 0, 0.98)',
  glassBorder: 'rgba(255, 255, 255, 0.04)',
  glassOverlay: 'rgba(0, 0, 0, 0.9)',
  
  // Tab bar - Minimal black
  tabBarBackground: 'rgba(0, 0, 0, 0.98)',
  tabBarBorder: 'rgba(255, 255, 255, 0.04)',
  tabBarActive: '#FFFFFF',
  tabBarInactive: '#555555',
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