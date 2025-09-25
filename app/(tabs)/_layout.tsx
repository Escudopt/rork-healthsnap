import { Tabs } from 'expo-router';
import { Home, BookOpen, Pill, User, Settings, Dumbbell } from 'lucide-react-native';

import { StyleSheet, Platform, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/providers/ThemeProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: Platform.OS === 'ios' ? 88 + insets.bottom : 72,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 0,
        },
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: 10,
          marginTop: 5,
          marginBottom: 2,
          textAlign: 'center' as const,
          fontWeight: '600' as const,
          letterSpacing: 0.2,
        },
        tabBarItemStyle: {
          paddingVertical: Platform.OS === 'ios' ? 10 : 8,
          paddingHorizontal: 4,
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
          minHeight: Platform.OS === 'ios' ? 52 : 56,
        },
        tabBarBackground: () => {
          const styles = StyleSheet.create({
            tabBarContainer: {
              flex: 1,
            },
            tabBarBorder: {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 0.5,
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            },
          });
          
          return Platform.OS === 'web' ? (
            <View style={[StyleSheet.absoluteFillObject, styles.tabBarContainer]}>
              <View style={[
                StyleSheet.absoluteFillObject,
                {
                  backgroundColor: isDark 
                    ? 'rgba(26, 29, 36, 0.95)' 
                    : 'rgba(250, 251, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                }
              ]} />
              <View style={styles.tabBarBorder} />
            </View>
          ) : (
            <BlurView
              intensity={100}
              tint={isDark ? "systemMaterialDark" : "systemMaterialLight"}
              style={[StyleSheet.absoluteFillObject, styles.tabBarContainer]}
            >
              <View style={styles.tabBarBorder} />
            </BlurView>
          );
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          tabBarIcon: ({ color, size }) => {
            return <Home color={color} size={22} strokeWidth={2.5} />;
          },
        }}
      />

      <Tabs.Screen
        name="nutrition-tips"
        options={{
          title: t('nutritionTips'),
          tabBarIcon: ({ color, size }) => {
            return <BookOpen color={color} size={22} strokeWidth={2.5} />;
          },
        }}
      />
      <Tabs.Screen
        name="supplements"
        options={{
          title: t('supplements'),
          tabBarIcon: ({ color, size }) => {
            return <Pill color={color} size={22} strokeWidth={2.5} />;
          },
        }}
      />

      <Tabs.Screen
        name="workouts"
        options={{
          title: t('workouts'),
          tabBarIcon: ({ color, size }) => {
            return <Dumbbell color={color} size={22} strokeWidth={2.5} />;
          },
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile'),
          tabBarIcon: ({ color, size, focused }) => {
            return <User color={color} size={22} strokeWidth={2.5} />;
          },
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settingsTitle'),
          tabBarIcon: ({ color, size }) => {
            return <Settings color={color} size={22} strokeWidth={2.5} />;
          },
        }}
      />

    </Tabs>
  );
}