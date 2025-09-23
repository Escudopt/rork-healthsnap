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
  Smartphone,
  Send,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { useCalorieTracker } from '@/providers/CalorieTrackerProvider';
import { useHealth } from '@/providers/HealthProvider';
import { BlurCard } from '@/components/BlurCard';

export default function SettingsScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { t, language } = useLanguage();
  const {
    isHealthSyncEnabled,
    healthSyncStatus,
    enableHealthSync,
    disableHealthSync,
    syncWithHealthApp,
  } = useCalorieTracker();
  
  const {
    isHealthKitAvailable,
    hasPermissions,
    requestPermissions,
    refreshHealthData,
    healthData,
  } = useHealth();

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
        <View style={[styles.settingContent, { backgroundColor: colors.surfaceSecondary + '40' }]}>
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

  const renderHealthSyncSection = () => {
    const getHealthStatus = () => {
      if (!isHealthKitAvailable) return { icon: XCircle, color: '#F44336', text: 'Não disponível' };
      if (!hasPermissions) return { icon: Clock, color: '#FF9800', text: 'Permissões necessárias' };
      if (healthData.isLoading) return { icon: Clock, color: '#FF9800', text: 'Carregando...' };
      if (healthData.error) return { icon: XCircle, color: '#F44336', text: 'Erro na sincronização' };
      return { icon: CheckCircle, color: '#4CAF50', text: 'Conectado' };
    };

    const status = getHealthStatus();
    const StatusIcon = status.icon;

    return (
      <View style={styles.section}>
        <BlurCard variant="default" style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIcon, { backgroundColor: colors.primary + '15' }]}>
              <Smartphone color={colors.primary} size={20} strokeWidth={2} />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Apple Health (HealthKit)
            </Text>
          </View>
          
          <View style={styles.healthSyncContent}>
            <Text style={[styles.healthSyncDescription, { color: colors.textSecondary }]}>
              Conecte com o app Saúde do iPhone para ler e escrever dados de saúde automaticamente.
            </Text>
            
            <View style={styles.healthSyncStatus}>
              <View style={styles.statusIndicator}>
                <StatusIcon color={status.color} size={20} />
                <Text style={[styles.statusText, { color: colors.text }]}>
                  {status.text}
                </Text>
              </View>
              
              {isHealthKitAvailable && (
                <View style={styles.healthDataPreview}>
                  <Text style={[styles.healthDataTitle, { color: colors.text }]}>Dados de Hoje:</Text>
                  <View style={styles.healthDataGrid}>
                    <View style={styles.healthDataItem}>
                      <Text style={[styles.healthDataValue, { color: colors.primary }]}>
                        {healthData.steps.toLocaleString()}
                      </Text>
                      <Text style={[styles.healthDataLabel, { color: colors.textSecondary }]}>Passos</Text>
                    </View>
                    <View style={styles.healthDataItem}>
                      <Text style={[styles.healthDataValue, { color: colors.primary }]}>
                        {healthData.totalCalories}
                      </Text>
                      <Text style={[styles.healthDataLabel, { color: colors.textSecondary }]}>Calorias</Text>
                    </View>
                    <View style={styles.healthDataItem}>
                      <Text style={[styles.healthDataValue, { color: colors.primary }]}>
                        {healthData.distance.toFixed(1)}km
                      </Text>
                      <Text style={[styles.healthDataLabel, { color: colors.textSecondary }]}>Distância</Text>
                    </View>
                  </View>
                </View>
              )}
              
              <View style={styles.healthSyncButtons}>
                {!isHealthKitAvailable ? (
                  <View style={[styles.unavailableButton, { backgroundColor: colors.surfaceSecondary }]}>
                    <Text style={[styles.unavailableButtonText, { color: colors.textSecondary }]}>
                      Disponível apenas no iOS
                    </Text>
                  </View>
                ) : !hasPermissions ? (
                  <TouchableOpacity
                    style={[styles.enableSyncButton, { backgroundColor: colors.primary }]}
                    onPress={requestPermissions}
                    disabled={healthData.isLoading}
                  >
                    <Text style={styles.enableSyncButtonText}>Solicitar Permissões</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.syncButtonsRow}>
                    <TouchableOpacity
                      style={[styles.syncButton, { backgroundColor: colors.primary }]}
                      onPress={refreshHealthData}
                      disabled={healthData.isLoading}
                    >
                      <Send color="white" size={14} />
                      <Text style={styles.syncButtonText}>Atualizar Dados</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={[styles.disableSyncButton, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
                      onPress={() => console.log('Configurações do HealthKit')}
                    >
                      <Text style={[styles.disableSyncButtonText, { color: colors.text }]}>Configurar</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
            
            <Text style={[styles.healthSyncNote, { color: colors.textTertiary }]}>
              🍎 Integração completa com Apple Health. Dados são sincronizados automaticamente.
            </Text>
          </View>
        </BlurCard>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: t('settingsTitle'),
          headerShown: false,
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

          {renderHealthSyncSection()}

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
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Add extra padding for tab bar
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
  },
  headerCard: {
    padding: 24,
    alignItems: 'center',
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
  healthSyncContent: {
    gap: 16,
  },
  healthSyncDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  healthSyncStatus: {
    gap: 16,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  healthSyncButtons: {
    gap: 12,
  },
  enableSyncButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  enableSyncButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  syncButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  syncButton: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  syncButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  disableSyncButton: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  disableSyncButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  healthSyncNote: {
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  healthDataPreview: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  healthDataTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  healthDataGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  healthDataItem: {
    alignItems: 'center',
    flex: 1,
  },
  healthDataValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  healthDataLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  unavailableButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  unavailableButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
});