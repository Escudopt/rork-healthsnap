import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import {
  Globe,
  ArrowLeft,
  Check,
} from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { useLanguage, Language } from '@/providers/LanguageProvider';
import { BlurCard } from '@/components/BlurCard';

export default function LanguageSelectionScreen() {
  const { colors, isDark } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const languages: Array<{ code: Language; name: string; nativeName: string }> = [
    { code: 'pt', name: 'Portuguese (Portugal)', nativeName: 'Português (Portugal)' },
    { code: 'en', name: 'English', nativeName: 'English' },
  ];

  const handleLanguageSelect = async (languageCode: Language) => {
    await setLanguage(languageCode);
    router.back();
  };

  const renderLanguageItem = (item: typeof languages[0]) => {
    const isSelected = language === item.code;
    
    return (
      <TouchableOpacity
        key={item.code}
        onPress={() => handleLanguageSelect(item.code)}
        activeOpacity={0.7}
      >
        <BlurCard variant="default" style={styles.languageItem}>
          <View style={styles.languageContent}>
            <View style={styles.languageInfo}>
              <Text style={[styles.languageName, { color: colors.text }]}>
                {item.nativeName}
              </Text>
              <Text style={[styles.languageSubtitle, { color: colors.textSecondary }]}>
                {item.name}
              </Text>
            </View>
            
            {isSelected && (
              <View style={[styles.checkIcon, { backgroundColor: colors.primary + '20' }]}>
                <Check color={colors.primary} size={20} strokeWidth={2} />
              </View>
            )}
          </View>
        </BlurCard>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: t('language'),
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 17,
          },
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <ArrowLeft color={colors.text} size={24} strokeWidth={2} />
            </TouchableOpacity>
          ),
        }}
      />
      
      {isDark && (
        <>
          <LinearGradient
            colors={[
              '#000000',
              '#0A0A0F',
              '#0F0F1A',
              '#1A1A2E',
              '#16213E',
              '#0F3460',
              '#1E3A8A'
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <LinearGradient
            colors={[
              'rgba(102, 126, 234, 0.08)',
              'transparent',
              'rgba(118, 75, 162, 0.06)',
              'transparent'
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
        </>
      )}
      
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent" 
        translucent 
      />
      
      <SafeAreaView style={styles.safeArea} edges={['bottom']}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={[styles.headerIcon, { backgroundColor: colors.primary + '20' }]}>
              <Globe color={colors.primary} size={32} strokeWidth={2} />
            </View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {t('language')}
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              Choose your preferred language
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionContent}>
              {languages.map(renderLanguageItem)}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  headerIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 22,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionContent: {
    gap: 12,
  },
  languageItem: {
    padding: 0,
  },
  languageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  languageSubtitle: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
  checkIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
});