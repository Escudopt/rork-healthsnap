import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import {
  Settings,
  Moon,
  Sun,
  Bell,
  Shield,
  HelpCircle,
  Info,
  ChevronRight,
  Palette,
  Globe,
  Database,
  User,

} from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { useLanguage } from '@/providers/LanguageProvider';


import { BlurCard } from '@/components/BlurCard';

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { t, language } = useLanguage();


  const settingsOptions = [
    {
      id: 'theme',
      title: t('theme'),
      subtitle: isDark ? t('darkModeActive') : t('lightModeActive'),
      icon: isDark ? Moon : Sun,
      type: 'toggle' as const,
      value: isDark,
      onToggle: toggleTheme,
    },
    {
      id: 'notifications',
      title: t('notifications'),
      subtitle: t('mealReminders'),
      icon: Bell,
      type: 'toggle' as const,
      value: true,
      onToggle: () => {},
    },
    {
      id: 'language',
      title: t('language'),
      subtitle: language === 'pt' ? t('portuguese') : t('english'),
      icon: Globe,
      type: 'navigation' as const,
      onPress: () => router.push('/language-selection'),
    },
    {
      id: 'appearance',
      title: t('appearance'),
      subtitle: t('customizeColors'),
      icon: Palette,
      type: 'navigation' as const,
      onPress: () => {},
    },
  ];

  const supportOptions = [
    {
      id: 'privacy',
      title: t('privacy'),
      subtitle: t('privacyPolicy'),
      icon: Shield,
      type: 'navigation' as const,
      onPress: () => router.push('/privacy-policy'),
    },
    {
      id: 'help',
      title: t('help'),
      subtitle: t('faqSupport'),
      icon: HelpCircle,
      type: 'navigation' as const,
      onPress: () => router.push('/help'),
    },
    {
      id: 'about',
      title: t('about'),
      subtitle: t('version'),
      icon: Info,
      type: 'navigation' as const,
      onPress: () => {},
    },
    {
      id: 'data',
      title: t('data'),
      subtitle: t('backupSync'),
      icon: Database,
      type: 'navigation' as const,
      onPress: () => {},
    },
  ];

  const renderSettingItem = (item: typeof settingsOptions[0]) => {
    const IconComponent = item.icon;
    
    return (
      <TouchableOpacity
        key={item.id}
        onPress={item.type === 'navigation' ? item.onPress : undefined}
        activeOpacity={0.7}
        disabled={item.type === 'toggle'}
        style={styles.settingItemContainer}
      >
        <View style={[styles.settingContent, { backgroundColor: colors.surfaceSecondary }]}>
          <View style={[styles.settingIcon, { backgroundColor: colors.primary + '20' }]}>
            <IconComponent color={colors.primary} size={18} strokeWidth={2} />
          </View>
          
          <View style={styles.settingText}>
            <Text style={[styles.settingTitle, { color: colors.text }]}>
              {item.title}
            </Text>
            <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
              {item.subtitle}
            </Text>
          </View>
          
          <View style={styles.settingAction}>
            {item.type === 'toggle' ? (
              <Switch
                value={item.value}
                onValueChange={item.onToggle}
                trackColor={{
                  false: colors.surfaceSecondary,
                  true: colors.primary + '40',
                }}
                thumbColor={item.value ? colors.primary : colors.textTertiary}
                ios_backgroundColor={colors.surfaceSecondary}
              />
            ) : (
              <ChevronRight color={colors.textTertiary} size={18} strokeWidth={2} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };



  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isDark ? [
          '#000000',
          '#1C1C1E',
          '#2C2C2E'
        ] : [
          '#F2F2F7',
          '#FAFAFA',
          '#F2F2F7'
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      
      <Stack.Screen
        options={{
          title: t('settingsTitle'),
          headerShown: false,
        }}
      />
      
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent" 
        translucent 
      />
      
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <BlurCard variant="premium" style={[styles.headerCard, { backgroundColor: colors.surface }]}>
              <View style={[styles.headerIcon, { backgroundColor: colors.primary + '20' }]}>
                <Settings color={colors.primary} size={32} strokeWidth={2} />
              </View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                {t('settingsTitle')}
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                {t('personalizeExperience')}
              </Text>
            </BlurCard>
          </View>

          <View style={styles.section}>
            <BlurCard variant="default" style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: colors.primary + '15' }]}>
                  <User color={colors.primary} size={20} strokeWidth={2} />
                </View>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {t('preferences')}
                </Text>
              </View>
              <View style={styles.sectionContent}>
                {settingsOptions.map(renderSettingItem)}
              </View>
            </BlurCard>
          </View>

          <View style={styles.section}>
            <BlurCard variant="default" style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: colors.primary + '15' }]}>
                  <Shield color={colors.primary} size={20} strokeWidth={2} />
                </View>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {t('support')}
                </Text>
              </View>
              <View style={styles.sectionContent}>
                {supportOptions.map(renderSettingItem)}
              </View>
            </BlurCard>
          </View>



          <View style={styles.section}>
            <BlurCard variant="default" style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: colors.primary + '15' }]}>
                  <Info color={colors.primary} size={20} strokeWidth={2} />
                </View>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Informações da App
                </Text>
              </View>
              <View style={styles.appInfoContent}>
                <View style={styles.appInfoRow}>
                  <Text style={[styles.appInfoLabel, { color: colors.textSecondary }]}>Versão</Text>
                  <Text style={[styles.appInfoValue, { color: colors.text }]}>1.0.0</Text>
                </View>
                <View style={styles.appInfoRow}>
                  <Text style={[styles.appInfoLabel, { color: colors.textSecondary }]}>Build</Text>
                  <Text style={[styles.appInfoValue, { color: colors.text }]}>2025.01</Text>
                </View>
                <View style={styles.appInfoRow}>
                  <Text style={[styles.appInfoLabel, { color: colors.textSecondary }]}>Plataforma</Text>
                  <Text style={[styles.appInfoValue, { color: colors.text }]}>React Native</Text>
                </View>
              </View>
            </BlurCard>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },
  headerCard: {
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.05)',
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
    marginBottom: 24,
  },
  sectionCard: {
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  sectionContent: {
    gap: 8,
  },
  settingItemContainer: {
    marginBottom: 8,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  settingAction: {
    marginLeft: 12,
  },
  appInfoContent: {
    gap: 12,
  },
  appInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  appInfoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  appInfoValue: {
    fontSize: 14,
    fontWeight: '600',
  },

});