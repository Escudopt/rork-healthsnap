import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StyleSheet, View } from "react-native";
import { CalorieTrackerProvider, useCalorieTracker } from "@/providers/CalorieTrackerProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { LanguageProvider } from "@/providers/LanguageProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import AsyncStorage from "@react-native-async-storage/async-storage";



SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

const ONBOARDING_COMPLETE_KEY = 'onboarding_complete';

function RootLayoutNav() {
  const router = useRouter();
  const segments = useSegments();
  const { userProfile, isLoading } = useCalorieTracker();
  const [isCheckingOnboarding, setIsCheckingOnboarding] = useState(true);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const onboardingComplete = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
        const hasProfile = userProfile !== null;
        
        if (!isLoading) {
          if (!onboardingComplete || !hasProfile) {
            if (segments[0] !== 'onboarding') {
              router.replace('/onboarding');
            }
          } else {
            if (segments[0] === 'onboarding') {
              router.replace('/(tabs)');
            }
          }
          setIsCheckingOnboarding(false);
        }
      } catch (error) {
        console.error('Error checking onboarding:', error);
        setIsCheckingOnboarding(false);
      }
    };

    checkOnboarding();
  }, [userProfile, isLoading, segments, router]);

  if (isCheckingOnboarding || isLoading) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <Stack screenOptions={{ 
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: 'transparent' }
      }}>
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen 
          name="analysis" 
          options={{ 
            presentation: 'modal',
            animation: 'slide_from_bottom'
          }} 
        />
      </Stack>

    </View>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={styles.container}>
          <LanguageProvider>
            <ThemeProvider>
              <CalorieTrackerProvider>
                <RootLayoutNav />
              </CalorieTrackerProvider>
            </ThemeProvider>
          </LanguageProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});