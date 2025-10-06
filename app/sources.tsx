import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, router } from 'expo-router';
import { ExternalLink, ChevronLeft, BookOpen } from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { BlurCard } from '@/components/BlurCard';

export default function SourcesScreen() {
  const { colors, isDark } = useTheme();

  const sources = [
    {
      title: 'World Health Organization (WHO)',
      description: 'Global health and nutrition recommendations, BMI classification, and dietary guidelines',
      url: 'https://www.who.int',
    },
    {
      title: 'U.S. Department of Agriculture Food Database (USDA)',
      description: 'Official food composition database from the United States Department of Agriculture',
      url: 'https://fdc.nal.usda.gov',
    },
    {
      title: 'European Food Safety Authority (EFSA)',
      description: 'European dietary reference values and nutritional recommendations',
      url: 'https://www.efsa.europa.eu',
    },
  ];

  const handleOpenLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Error opening link:', error);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000000' : '#F2F2F7',
    },
    safeArea: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 40,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 16,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16,
      alignSelf: 'flex-start',
    },
    backButtonText: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.primary,
    },
    title: {
      fontSize: 34,
      fontWeight: '700',
      marginBottom: 8,
      letterSpacing: -0.4,
      color: colors.text,
    },
    subtitle: {
      fontSize: 17,
      fontWeight: '400',
      lineHeight: 22,
      opacity: 0.6,
      color: colors.textSecondary,
    },
    content: {
      paddingHorizontal: 20,
    },
    introCard: {
      padding: 24,
      marginBottom: 20,
    },
    introIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    introTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
    },
    introText: {
      fontSize: 15,
      fontWeight: '400',
      lineHeight: 22,
      color: colors.textSecondary,
    },
    sourcesTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
      marginTop: 8,
    },
    sourceCard: {
      padding: 20,
      marginBottom: 16,
    },
    sourceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    sourceTitle: {
      fontSize: 17,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
      marginRight: 12,
    },
    sourceDescription: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
      color: colors.textSecondary,
      marginBottom: 16,
    },
    linkButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary + '15',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 12,
      gap: 8,
    },
    linkButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primary,
    },
    disclaimerCard: {
      padding: 20,
      marginTop: 8,
      marginBottom: 20,
      backgroundColor: colors.surfaceSecondary,
    },
    disclaimerTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    disclaimerText: {
      fontSize: 13,
      fontWeight: '400',
      lineHeight: 18,
      color: colors.textSecondary,
    },
  });

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      <LinearGradient
        colors={isDark ? [
          '#000000',
          '#1C1C1E',
          '#2C2C2E'
        ] : [
          '#F2F2F7',
          '#FFFFFF',
          '#F2F2F7'
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent" 
        translucent 
      />
      
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <ChevronLeft color={colors.primary} size={24} strokeWidth={2} />
              <Text style={styles.backButtonText}>Voltar</Text>
            </TouchableOpacity>
            
            <Text style={styles.title}>Fontes & Referências</Text>
            <Text style={styles.subtitle}>
              Bases científicas dos nossos cálculos nutricionais
            </Text>
          </View>

          <View style={styles.content}>
            <BlurCard variant="premium" style={styles.introCard}>
              <View style={styles.introIcon}>
                <BookOpen color={colors.primary} size={24} strokeWidth={2} />
              </View>
              <Text style={styles.introTitle}>Informação Baseada em Ciência</Text>
              <Text style={styles.introText}>
                Os cálculos nutricionais desta aplicação baseiam-se em bases de dados e recomendações de organismos oficiais reconhecidos internacionalmente.
              </Text>
            </BlurCard>

            <Text style={styles.sourcesTitle}>Fontes Oficiais</Text>

            {sources.map((source, index) => (
              <BlurCard key={index} variant="default" style={styles.sourceCard}>
                <View style={styles.sourceHeader}>
                  <Text style={styles.sourceTitle}>{source.title}</Text>
                </View>
                <Text style={styles.sourceDescription}>{source.description}</Text>
                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => handleOpenLink(source.url)}
                  activeOpacity={0.7}
                >
                  <ExternalLink color={colors.primary} size={16} strokeWidth={2} />
                  <Text style={styles.linkButtonText}>Visitar Website</Text>
                </TouchableOpacity>
              </BlurCard>
            ))}

            <BlurCard variant="default" style={styles.disclaimerCard}>
              <Text style={styles.disclaimerTitle}>Aviso Importante</Text>
              <Text style={styles.disclaimerText}>
                Esta aplicação fornece informações nutricionais para fins educacionais e de acompanhamento pessoal. Não substitui aconselhamento médico ou nutricional profissional. Consulte sempre um profissional de saúde qualificado para orientação personalizada.
              </Text>
            </BlurCard>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
