import { useState, useEffect, useCallback, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import { Appearance, StatusBar, Platform } from 'react-native';
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
  background: '#FAFBFF',
  backgroundSecondary: '#F5F7FA',
  backgroundTertiary: '#FFFFFF',
  
  // Surface colors
  surface: '#FFFFFF',
  surfaceSecondary: 'rgba(0, 122, 255, 0.06)',
  surfaceElevated: 'rgba(255, 255, 255, 0.95)',
  
  // Text colors
  text: '#1A1D29',
  textSecondary: 'rgba(26, 29, 41, 0.65)',
  textTertiary: 'rgba(26, 29, 41, 0.35)',
  
  // Border colors
  border: 'rgba(26, 29, 41, 0.12)',
  borderSecondary: 'rgba(26, 29, 41, 0.06)',
  
  // Accent colors
  primary: '#0066FF',
  primaryLight: '#4D94FF',
  primaryDark: '#0052CC',
  
  // Status colors
  success: '#00C851',
  warning: '#FF8800',
  error: '#FF4444',
  
  // Glass/blur effects
  glassBackground: 'rgba(255, 255, 255, 0.85)',
  glassBorder: 'rgba(26, 29, 41, 0.08)',
  glassOverlay: 'rgba(255, 255, 255, 0.6)',
  
  // Tab bar
  tabBarBackground: 'rgba(255, 255, 255, 0.9)',
  tabBarBorder: 'rgba(26, 29, 41, 0.08)',
  tabBarActive: '#0066FF',
  tabBarInactive: 'rgba(26, 29, 41, 0.5)',
};

const darkTheme: ThemeColors = {
  // Background colors
  background: '#0A0B0F',
  backgroundSecondary: '#111318',
  backgroundTertiary: '#1A1D24',
  
  // Surface colors
  surface: 'rgba(102, 148, 255, 0.08)',
  surfaceSecondary: 'rgba(102, 148, 255, 0.12)',
  surfaceElevated: 'rgba(255, 255, 255, 0.08)',
  
  // Text colors
  text: '#F8FAFC',
  textSecondary: 'rgba(248, 250, 252, 0.7)',
  textTertiary: 'rgba(248, 250, 252, 0.4)',
  
  // Border colors
  border: 'rgba(248, 250, 252, 0.12)',
  borderSecondary: 'rgba(248, 250, 252, 0.06)',
  
  // Accent colors
  primary: '#6694FF',
  primaryLight: '#99B8FF',
  primaryDark: '#3366FF',
  
  // Status colors
  success: '#00D97E',
  warning: '#FFB800',
  error: '#FF6B6B',
  
  // Glass/blur effects
  glassBackground: 'rgba(26, 29, 36, 0.85)',
  glassBorder: 'rgba(248, 250, 252, 0.08)',
  glassOverlay: 'rgba(255, 255, 255, 0.06)',
  
  // Tab bar
  tabBarBackground: 'rgba(26, 29, 36, 0.9)',
  tabBarBorder: 'rgba(248, 250, 252, 0.08)',
  tabBarActive: '#6694FF',
  tabBarInactive: 'rgba(248, 250, 252, 0.6)',
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
  const [systemColorScheme, setSystemColorScheme] = useState<ColorScheme>(
    Appearance.getColorScheme() === 'dark' ? 'dark' : 'light'
  );
  const [hydrated, setHydrated] = useState(false);

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

  // Load theme mode on mount with hydration handling
  useEffect(() => {
    const initializeTheme = async () => {
      // For web, add a small delay to prevent hydration mismatch
      if (Platform.OS === 'web') {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      await loadThemeMode();
      setHydrated(true);
    };
    
    initializeTheme();
  }, [loadThemeMode]);

  // Update status bar style based on theme
  useEffect(() => {
    StatusBar.setBarStyle(isDark ? 'light-content' : 'dark-content', true);
  }, [isDark]);

  return useMemo(() => ({
    themeMode: hydrated ? themeMode : 'system',
    colorScheme: hydrated ? colorScheme : 'light',
    colors: hydrated ? colors : lightTheme,
    typography: Typography,
    isDark: hydrated ? isDark : false,
    setThemeMode,
    toggleTheme,
    getTypographyStyle,
  }), [themeMode, colorScheme, colors, isDark, setThemeMode, toggleTheme, hydrated]);
});

// Helper hook for creating themed styles
export const useThemedStyles = <T extends Record<string, any>>(
  createStyles: (colors: ThemeColors, isDark: boolean) => T
): T => {
  const { colors, isDark } = useTheme();
  return createStyles(colors, isDark);
};