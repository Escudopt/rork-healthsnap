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
import { ArrowLeft, Lock } from 'lucide-react-native';
import { useTheme } from '@/providers/ThemeProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { BlurCard } from '@/components/BlurCard';

export default function PrivacyPolicyScreen() {
  const { colors, isDark } = useTheme();
  const { t } = useLanguage();

  const sections = [
    {
      title: '1. Informações que Recolhemos',
      content: [
        'Dados de perfil: Nome, idade, peso, altura e objectivos de saúde que fornece voluntariamente.',
        'Dados de utilização: Informações sobre como utiliza a aplicação, incluindo alimentos registados, calorias consumidas e progresso das metas.',
        'Dados do dispositivo: Informações técnicas sobre o seu dispositivo para melhorar a funcionalidade da aplicação.',
      ],
    },
    {
      title: '2. Como Utilizamos as Suas Informações',
      content: [
        'Fornecer funcionalidades personalizadas de rastreamento nutricional.',
        'Calcular e exibir o seu progresso em relação às metas de saúde.',
        'Melhorar a experiência do utilizador e desenvolver novos recursos.',
        'Enviar notificações relevantes sobre as suas metas (se activadas).',
      ],
    },
    {
      title: '3. Partilha de Dados',
      content: [
        'Não vendemos, alugamos ou partilhamos as suas informações pessoais com terceiros para fins comerciais.',
        'Podemos partilhar dados agregados e anonimizados para fins de investigação e melhoria do produto.',
        'As suas informações podem ser partilhadas apenas quando exigido por lei ou para proteger os nossos direitos legais.',
      ],
    },
    {
      title: '4. Armazenamento e Segurança',
      content: [
        'Os seus dados são armazenados localmente no seu dispositivo por defeito.',
        'Implementamos medidas de segurança técnicas e organizacionais para proteger as suas informações.',
        'Pode fazer cópia de segurança dos seus dados através das definições da aplicação.',
      ],
    },
    {
      title: '5. Os Seus Direitos',
      content: [
        'Acesso: Pode visualizar todos os seus dados através da aplicação.',
        'Correcção: Pode editar as suas informações pessoais a qualquer momento.',
        'Eliminação: Pode eliminar a sua conta e todos os dados associados.',
        'Portabilidade: Pode exportar os seus dados em formato legível.',
      ],
    },
    {
      title: '6. Cookies e Tecnologias Similares',
      content: [
        'Utilizamos tecnologias de armazenamento local para guardar as suas preferências e dados da aplicação.',
        'Estas informações são essenciais para o funcionamento da aplicação e não são partilhadas.',
      ],
    },
    {
      title: '7. Alterações na Política',
      content: [
        'Podemos actualizar esta política de privacidade periodicamente.',
        'Notificaremos sobre mudanças significativas através da aplicação.',
        'A utilização continuada da aplicação constitui aceitação das alterações.',
      ],
    },
    {
      title: '8. Contacto',
      content: [
        'Para questões sobre privacidade ou esta política, entre em contacto connosco:',
        'Email: privacidade@nutriapp.com',
        'Última actualização: Janeiro de 2025',
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: t('privacyPolicyTitle'),
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
            <BlurCard variant="premium" style={[styles.headerCard, { backgroundColor: colors.surface }]}>
              <View style={[styles.headerIcon, { backgroundColor: colors.primary + '20' }]}>
                <Lock color={colors.primary} size={32} strokeWidth={2} />
              </View>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Política de Privacidade
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                Como protegemos e utilizamos os seus dados
              </Text>
            </BlurCard>
          </View>

          <View style={styles.content}>
            <BlurCard variant="premium" style={[styles.introCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.introText, { color: colors.text }]}>
                Esta política de privacidade explica como recolhemos, utilizamos e protegemos as suas informações pessoais quando utiliza a nossa aplicação de rastreamento nutricional.
              </Text>
            </BlurCard>

            {sections.map((section) => (
              <BlurCard key={section.title} variant="default" style={[styles.sectionCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {section.title}
                </Text>
                {section.content.map((item) => (
                  <Text key={item} style={[styles.sectionContent, { color: colors.textSecondary }]}>
                    • {item}
                  </Text>
                ))}
              </BlurCard>
            ))}

            <BlurCard variant="subtle" style={[styles.footerCard, { backgroundColor: colors.surfaceSecondary }]}>
              <Text style={[styles.footerText, { color: colors.textSecondary }]}>
                Esta política foi actualizada pela última vez em Janeiro de 2025. Ao continuar a utilizar a aplicação, concorda com os termos aqui descritos.
              </Text>
            </BlurCard>

            <TouchableOpacity
              style={[styles.homeButton, { backgroundColor: colors.primary }]}
              onPress={() => router.back()}
              activeOpacity={0.8}
            >
              <ArrowLeft color="white" size={20} strokeWidth={2} />
              <Text style={styles.homeButtonText}>Voltar às Definições</Text>
            </TouchableOpacity>
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
  content: {
    paddingHorizontal: 20,
    gap: 16,
  },
  introCard: {
    padding: 24,
  },
  introText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    textAlign: 'center',
  },
  sectionCard: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    lineHeight: 24,
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
    fontWeight: '400',
  },
  footerCard: {
    padding: 20,
    marginTop: 8,
  },
  footerText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginTop: 24,
    gap: 8,
  },
  homeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});