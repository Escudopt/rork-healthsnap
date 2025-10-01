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
  HelpCircle,
  ArrowLeft,
  Home,
  Apple,
  Target,
  BarChart3,
  BookOpen,
  Pill,
  User,
  Shield,
  FileText,
  ExternalLink,
} from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { BlurCard } from '@/components/BlurCard';

interface HelpSection {
  id: string;
  title: string;
  icon: React.ComponentType<any>;
  content: string[];
}

export default function HelpScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const helpSections: HelpSection[] = [
    {
      id: 'getting-started',
      title: 'Como Começar',
      icon: Target,
      content: [
        'Defina as suas metas diárias de calorias na página inicial',
        'Explore os alimentos saudáveis disponíveis na aplicação',
        'Adicione refeições ao seu registo diário',
        'Acompanhe o seu progresso através dos gráficos'
      ]
    },
    {
      id: 'tracking-meals',
      title: 'Registar Refeições',
      icon: Apple,
      content: [
        'Toque no botão "+" para adicionar uma nova refeição',
        'Seleccione o tipo de refeição (pequeno-almoço, almoço, jantar, lanche)',
        'Escolha os alimentos da lista ou pesquise por nome',
        'Ajuste as quantidades conforme necessário',
        'Confirme para adicionar ao seu registo diário'
      ]
    },
    {
      id: 'healthy-foods',
      title: 'Alimentos Saudáveis',
      icon: Apple,
      content: [
        'Navegue pelas categorias: Todos, Super Alimentos, Nutrição Sazonal',
        'Toque em qualquer alimento para ver informações detalhadas',
        'Descubra os benefícios e propriedades nutricionais',
        'Adicione directamente às suas refeições'
      ]
    },
    {
      id: 'progress-tracking',
      title: 'Acompanhar Progresso',
      icon: BarChart3,
      content: [
        'Visualize o seu progresso diário na página inicial',
        'Consulte gráficos detalhados na página de análise',
        'Acompanhe tendências semanais e mensais',
        'Identifique padrões nos seus hábitos alimentares'
      ]
    },
    {
      id: 'nutrition-tips',
      title: 'Dicas de Nutrição',
      icon: BookOpen,
      content: [
        'Leia artigos sobre nutrição e alimentação saudável',
        'Descubra receitas nutritivas e equilibradas',
        'Aprenda sobre macronutrientes e micronutrientes',
        'Mantenha-se actualizado com as últimas tendências'
      ]
    },
    {
      id: 'supplements',
      title: 'Suplementos',
      icon: Pill,
      content: [
        'Explore informações sobre suplementos alimentares',
        'Compreenda quando e como usar cada suplemento',
        'Consulte dosagens recomendadas',
        'Identifique possíveis interacções'
      ]
    },
    {
      id: 'profile-settings',
      title: 'Perfil e Definições',
      icon: User,
      content: [
        'Personalize o seu perfil com informações pessoais',
        'Ajuste as suas metas calóricas e nutricionais',
        'Configure notificações e lembretes',
        'Altere o tema da aplicação (claro/escuro)'
      ]
    },
    {
      id: 'privacy-data',
      title: 'Privacidade e Dados',
      icon: Shield,
      content: [
        'Os seus dados são armazenados localmente no dispositivo',
        'Nenhuma informação pessoal é partilhada com terceiros',
        'Pode exportar ou eliminar os seus dados a qualquer momento',
        'Consulte a política de privacidade para mais detalhes'
      ]
    }
  ];

  const renderHelpSection = (section: HelpSection) => {
    const IconComponent = section.icon;
    
    return (
      <BlurCard key={section.id} variant="default" style={styles.helpSection}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIcon, { backgroundColor: colors.primary + '20' }]}>
            <IconComponent color={colors.primary} size={24} strokeWidth={2} />
          </View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {section.title}
          </Text>
        </View>
        
        <View style={styles.sectionContent}>
          {section.content.map((item, index) => (
            <View key={`${section.id}-${index}`} style={styles.contentItem}>
              <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
              <Text style={[styles.contentText, { color: colors.textSecondary }]}>
                {item}
              </Text>
            </View>
          ))}
        </View>
      </BlurCard>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: t('help'),
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
              <HelpCircle color={colors.primary} size={32} strokeWidth={2} />
            </View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {t('helpTitle')}
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              Encontre respostas às suas questões e aprenda a usar todas as funcionalidades da aplicação
            </Text>
          </View>

          <View style={styles.sectionsContainer}>
            {helpSections.map(renderHelpSection)}
          </View>

          <BlurCard variant="default" style={styles.referencesSection}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: colors.primary + '20' }]}>
                <FileText color={colors.primary} size={24} strokeWidth={2} />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Fontes Oficiais
              </Text>
            </View>
            
            <Text style={[styles.referencesIntro, { color: colors.textSecondary }]}>
              Os dados e recomendações apresentados nesta aplicação têm base em fontes oficiais e científicas:
            </Text>
            
            <View style={styles.referencesList}>
              <View style={styles.referenceItem}>
                <ExternalLink color={colors.primary} size={16} strokeWidth={2} />
                <View style={styles.referenceContent}>
                  <Text style={[styles.referenceTitle, { color: colors.text }]}>
                    Tabela de Composição de Alimentos – INSA
                  </Text>
                  <Text style={[styles.referenceUrl, { color: colors.textTertiary }]}>
                    portfir.insa.pt/foodcomp
                  </Text>
                </View>
              </View>
              
              <View style={styles.referenceItem}>
                <ExternalLink color={colors.primary} size={16} strokeWidth={2} />
                <View style={styles.referenceContent}>
                  <Text style={[styles.referenceTitle, { color: colors.text }]}>
                    USDA FoodData Central
                  </Text>
                  <Text style={[styles.referenceUrl, { color: colors.textTertiary }]}>
                    fdc.nal.usda.gov
                  </Text>
                </View>
              </View>
              
              <View style={styles.referenceItem}>
                <ExternalLink color={colors.primary} size={16} strokeWidth={2} />
                <View style={styles.referenceContent}>
                  <Text style={[styles.referenceTitle, { color: colors.text }]}>
                    Organização Mundial de Saúde (OMS)
                  </Text>
                  <Text style={[styles.referenceUrl, { color: colors.textTertiary }]}>
                    who.int/health-topics/nutrition
                  </Text>
                </View>
              </View>
              
              <View style={styles.referenceItem}>
                <ExternalLink color={colors.primary} size={16} strokeWidth={2} />
                <View style={styles.referenceContent}>
                  <Text style={[styles.referenceTitle, { color: colors.text }]}>
                    European Food Safety Authority (EFSA)
                  </Text>
                  <Text style={[styles.referenceUrl, { color: colors.textTertiary }]}>
                    efsa.europa.eu/en/topics/topic/dietary-reference-values
                  </Text>
                </View>
              </View>
            </View>
          </BlurCard>

          <View style={styles.footer}>
            <TouchableOpacity
              onPress={() => router.push('/')}
              style={[styles.homeButton, { backgroundColor: colors.primary }]}
              activeOpacity={0.8}
            >
              <Home color="#ffffff" size={20} strokeWidth={2} />
              <Text style={styles.homeButtonText}>
                {t('back')}
              </Text>
            </TouchableOpacity>
            
            <Text style={[styles.footerText, { color: colors.textTertiary }]}>
              Aplicação desenvolvida por Tomé Teixeira
            </Text>
            <Text style={[styles.footerSubtext, { color: colors.textTertiary }]}>
              Projeto informativo
            </Text>
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
    maxWidth: 320,
    lineHeight: 22,
  },
  sectionsContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  helpSection: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  sectionContent: {
    gap: 12,
  },
  contentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    marginRight: 12,
    flexShrink: 0,
  },
  contentText: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
    flex: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 32,
    alignItems: 'center',
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    marginBottom: 20,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  homeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },
  helpContent: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '400',
  },
  referencesSection: {
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  referencesIntro: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 22,
    marginBottom: 16,
  },
  referencesList: {
    gap: 16,
  },
  referenceItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  referenceContent: {
    flex: 1,
  },
  referenceTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 20,
  },
  referenceUrl: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
  },
});