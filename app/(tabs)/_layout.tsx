import { Tabs } from 'expo-router';
import { Home, BookOpen, Pill, User, Settings } from 'lucide-react-native';

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
        },
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarLabelStyle: {
          fontSize: 10,
          marginTop: 4,
          marginBottom: 0,
          textAlign: 'center' as const,
          fontWeight: '600' as const,
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
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            },
          });
          
          return Platform.OS === 'web' ? (
            <View style={[StyleSheet.absoluteFillObject, styles.tabBarContainer]}>
              <View style={[
                StyleSheet.absoluteFillObject,
                {
                  backgroundColor: isDark 
                    ? 'rgba(28, 28, 30, 0.95)' 
                    : 'rgba(248, 248, 248, 0.95)',
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
            return <Home color={color} size={24} strokeWidth={2} />;
          },
        }}
      />

      <Tabs.Screen
        name="nutrition-tips"
        options={{
          title: t('nutritionTips'),
          tabBarIcon: ({ color, size }) => {
            return <BookOpen color={color} size={24} strokeWidth={2} />;
          },
        }}
      />
      <Tabs.Screen
        name="supplements"
        options={{
          title: t('supplements'),
          tabBarIcon: ({ color, size }) => {
            return <Pill color={color} size={24} strokeWidth={2} />;
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile'),
          tabBarIcon: ({ color, size, focused }) => {
            return <User color={color} size={24} strokeWidth={2} />;
          },
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('settingsTitle'),
          tabBarIcon: ({ color, size }) => {
            return <Settings color={color} size={24} strokeWidth={2} />;
          },
        }}
      />

    </Tabs>
  );
}