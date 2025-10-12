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
          height: Platform.OS === 'ios' ? 83 + insets.bottom : 68,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: isDark ? 0.2 : 0.05,
          shadowRadius: 8,
        },
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: 10,
          marginTop: 4,
          marginBottom: 0,
          textAlign: 'center' as const,
          fontWeight: '500' as const,
          letterSpacing: 0,
        },
        tabBarItemStyle: {
          paddingVertical: Platform.OS === 'ios' ? 8 : 6,
          paddingHorizontal: 0,
          justifyContent: 'center',
          alignItems: 'center',
          flex: 1,
          minHeight: Platform.OS === 'ios' ? 49 : 52,
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
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
            },
          });
          
          return Platform.OS === 'web' ? (
            <View style={[StyleSheet.absoluteFillObject, styles.tabBarContainer]}>
              <View style={[
                StyleSheet.absoluteFillObject,
                {
                  backgroundColor: isDark 
                    ? 'rgba(0, 0, 0, 0.98)' 
                    : 'rgba(255, 255, 255, 0.98)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                }
              ]} />
              <View style={styles.tabBarBorder} />
            </View>
          ) : (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
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
          tabBarIcon: ({ color, focused }) => {
            return <Home color={color} size={24} strokeWidth={focused ? 2 : 1.5} />;
          },
        }}
      />

      <Tabs.Screen
        name="nutrition-tips"
        options={{
          title: t('nutritionTips'),
          tabBarIcon: ({ color, focused }) => {
            return <BookOpen color={color} size={24} strokeWidth={focused ? 2 : 1.5} />;
          },
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: 'Treino',
          tabBarIcon: ({ color, focused }) => {
            return <Dumbbell color={color} size={24} strokeWidth={focused ? 2 : 1.5} />;
          },
        }}
      />
      <Tabs.Screen
        name="supplements"
        options={{
          title: t('supplements'),
          tabBarIcon: ({ color, focused }) => {
            return <Pill color={color} size={24} strokeWidth={focused ? 2 : 1.5} />;
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile'),
          tabBarIcon: ({ color, focused }) => {
            return <User color={color} size={24} strokeWidth={focused ? 2 : 1.5} />;
          },
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settingsTitle'),
          tabBarIcon: ({ color, focused }) => {
            return <Settings color={color} size={24} strokeWidth={focused ? 2 : 1.5} />;
          },
        }}
      />

    </Tabs>
  );
}