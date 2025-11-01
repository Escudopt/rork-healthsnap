import { Tabs } from 'expo-router';
import { Home, BookOpen, Pill, User, Settings, Dumbbell } from 'lucide-react-native';

import { StyleSheet, Platform, View } from 'react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const { colors } = useTheme();
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
          height: Platform.OS === 'ios' ? 80 + insets.bottom : 68,
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          shadowOpacity: 0,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: 11,
          marginTop: 4,
          marginBottom: 0,
          textAlign: 'center' as const,
          fontWeight: '500' as const,
          letterSpacing: 0,
        },
        tabBarItemStyle: {
          paddingVertical: Platform.OS === 'ios' ? 4 : 6,
          paddingHorizontal: 0,
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
        },
        tabBarBackground: () => {
          return (
            <View style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: colors.surface,
              }
            ]} />
          );
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('home'),
          tabBarIcon: ({ color, focused }) => {
            return <Home color={color} size={22} strokeWidth={focused ? 2 : 1.5} />;
          },
        }}
      />

      <Tabs.Screen
        name="nutrition-tips"
        options={{
          title: t('nutritionTips'),
          tabBarIcon: ({ color, focused }) => {
            return <BookOpen color={color} size={22} strokeWidth={focused ? 2 : 1.5} />;
          },
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: 'Treino',
          tabBarIcon: ({ color, focused }) => {
            return <Dumbbell color={color} size={22} strokeWidth={focused ? 2 : 1.5} />;
          },
        }}
      />
      <Tabs.Screen
        name="supplements"
        options={{
          title: t('supplements'),
          tabBarIcon: ({ color, focused }) => {
            return <Pill color={color} size={22} strokeWidth={focused ? 2 : 1.5} />;
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile'),
          tabBarIcon: ({ color, focused }) => {
            return <User color={color} size={22} strokeWidth={focused ? 2 : 1.5} />;
          },
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settingsTitle'),
          tabBarIcon: ({ color, focused }) => {
            return <Settings color={color} size={22} strokeWidth={focused ? 2 : 1.5} />;
          },
        }}
      />

    </Tabs>
  );
}
