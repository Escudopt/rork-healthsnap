import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Animated,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Shield, Zap, Brain, Bone, Eye, AlertTriangle, Pill, Info, Target } from 'lucide-react-native';
import { BlurCard } from '@/components/BlurCard';
import { useTheme, useThemedStyles } from '@/providers/ThemeProvider';
import { useCalorieTracker } from '@/providers/CalorieTrackerProvider';

interface Supplement {
  id: string;
  name: string;
  description: string;
  benefits: string[];
  dosage: string;
  icon: React.ReactNode;
  color: string;
  priority?: 'high' | 'medium' | 'low';
  ageWarnings?: {
    minAge?: number;
    maxAge?: number;
    warning: string;
  }[];
}

// Vitamin recommendation system based on age and diet
const getVitaminRecommendations = (age: number, gender: 'male' | 'female', activityLevel: string, goal: string) => {
  const recommendations: Supplement[] = [];
  
  // Age-based recommendations
  if (age < 18) {
    recommendations.push({
      id: 'teen-multi',
      name: 'Multivitamínico Teen',
      description: 'Fórmula específica para adolescentes em crescimento',
      benefits: ['Suporte ao crescimento', 'Desenvolvimento cognitivo', 'Sistema imunológico'],
      dosage: '1 comprimido ao dia com refeição',
      icon: <Shield color="white" size={24} />,
      color: '#4CAF50',
      priority: 'high'
    });
    
    recommendations.push({
      id: 'teen-calcium',
      name: 'Cálcio + Vitamina D',
      description: 'Essencial para desenvolvimento ósseo na adolescência',
      benefits: ['Formação óssea', 'Crescimento', 'Dentes fortes'],
      dosage: '600-800mg de cálcio + 600 UI de vitamina D',
      icon: <Bone color="white" size={24} />,
      color: '#FF9800',
      priority: 'high'
    });
  } else if (age >= 18 && age <= 30) {
    recommendations.push({
      id: 'young-adult-multi',
      name: 'Multivitamínico Adulto',
      description: 'Suporte nutricional para vida ativa',
      benefits: ['Energia', 'Imunidade', 'Metabolismo'],
      dosage: '1 comprimido ao dia',
      icon: <Shield color="white" size={24} />,
      color: '#2196F3',
      priority: 'medium'
    });
    
    if (gender === 'female') {
      recommendations.push({
        id: 'iron-women',
        name: 'Ferro para Mulheres',
        description: 'Prevenção de anemia em mulheres em idade fértil',
        benefits: ['Prevenção anemia', 'Energia', 'Concentração'],
        dosage: '18mg ao dia com vitamina C',
        icon: <Heart color="white" size={24} />,
        color: '#E91E63',
        priority: 'high'
      });
    }
  } else if (age >= 31 && age <= 50) {
    recommendations.push({
      id: 'adult-multi',
      name: 'Multivitamínico 30+',
      description: 'Fórmula para adultos com vida ativa',
      benefits: ['Antioxidantes', 'Energia', 'Saúde cardiovascular'],
      dosage: '1 comprimido ao dia',
      icon: <Shield color="white" size={24} />,
      color: '#9C27B0',
      priority: 'medium'
    });
    
    recommendations.push({
      id: 'coq10-adult',
      name: 'Coenzima Q10',
      description: 'Antioxidante para energia celular e coração',
      benefits: ['Energia celular', 'Saúde cardíaca', 'Antioxidante'],
      dosage: '100mg ao dia',
      icon: <Heart color="white" size={24} />,
      color: '#F44336',
      priority: 'medium'
    });
  } else if (age >= 51 && age <= 65) {
    recommendations.push({
      id: 'senior-multi',
      name: 'Multivitamínico 50+',
      description: 'Fórmula específica para maturidade',
      benefits: ['Saúde óssea', 'Memória', 'Imunidade'],
      dosage: '1 comprimido ao dia',
      icon: <Shield color="white" size={24} />,
      color: '#607D8B',
      priority: 'high'
    });
    
    recommendations.push({
      id: 'calcium-senior',
      name: 'Cálcio + Magnésio + D3',
      description: 'Prevenção de osteoporose e saúde óssea',
      benefits: ['Densidade óssea', 'Prevenção fraturas', 'Absorção mineral'],
      dosage: '1000mg cálcio + 400mg magnésio + 1000 UI D3',
      icon: <Bone color="white" size={24} />,
      color: '#795548',
      priority: 'high'
    });
    
    recommendations.push({
      id: 'omega3-senior',
      name: 'Ômega-3 EPA/DHA',
      description: 'Proteção cardiovascular e cerebral',
      benefits: ['Saúde cardíaca', 'Função cerebral', 'Anti-inflamatório'],
      dosage: '1000-2000mg ao dia',
      icon: <Brain color="white" size={24} />,
      color: '#00BCD4',
      priority: 'high'
    });
  } else if (age > 65) {
    recommendations.push({
      id: 'elderly-multi',
      name: 'Multivitamínico Sênior',
      description: 'Suporte nutricional para terceira idade',
      benefits: ['Imunidade', 'Energia', 'Saúde cognitiva'],
      dosage: '1 comprimido ao dia com refeição',
      icon: <Shield color="white" size={24} />,
      color: '#8BC34A',
      priority: 'high'
    });
    
    recommendations.push({
      id: 'b12-elderly',
      name: 'Vitamina B12',
      description: 'Essencial para idosos - absorção reduzida com idade',
      benefits: ['Energia', 'Memória', 'Sistema nervoso'],
      dosage: '500-1000mcg ao dia',
      icon: <Brain color="white" size={24} />,
      color: '#FF5722',
      priority: 'high'
    });
    
    recommendations.push({
      id: 'vitamin-d-elderly',
      name: 'Vitamina D3 Alta Potência',
      description: 'Dose elevada para idosos com pouca exposição solar',
      benefits: ['Saúde óssea', 'Imunidade', 'Força muscular'],
      dosage: '2000-4000 UI ao dia',
      icon: <Bone color="white" size={24} />,
      color: '#FFC107',
      priority: 'high'
    });
  }
  
  // Activity level based recommendations
  if (activityLevel === 'active' || activityLevel === 'very_active') {
    if (age >= 18) {
      recommendations.push({
        id: 'magnesium-active',
        name: 'Magnésio para Atletas',
        description: 'Recuperação muscular e redução de cãibras',
        benefits: ['Recuperação muscular', 'Reduz cãibras', 'Qualidade do sono'],
        dosage: '300-400mg antes de dormir',
        icon: <Zap color="white" size={24} />,
        color: '#4CAF50',
        priority: 'medium'
      });
    }
  }
  
  // Goal-based recommendations
  if (goal === 'lose' && age >= 18) {
    recommendations.push({
      id: 'chromium-weight',
      name: 'Cromo + L-Carnitina',
      description: 'Suporte ao metabolismo e controle de açúcar',
      benefits: ['Metabolismo', 'Controle glicêmico', 'Queima de gordura'],
      dosage: '200mcg cromo + 1000mg L-carnitina',
      icon: <Target color="white" size={24} />,
      color: '#E91E63',
      priority: 'medium'
    });
  }
  
  // Universal recommendations for all ages
  recommendations.push({
    id: 'vitamin-c-universal',
    name: 'Vitamina C',
    description: 'Antioxidante essencial para todas as idades',
    benefits: ['Sistema imunológico', 'Antioxidante', 'Absorção de ferro'],
    dosage: age < 18 ? '65-75mg ao dia' : '500-1000mg ao dia',
    icon: <Shield color="white" size={24} />,
    color: '#FF9800',
    priority: 'medium'
  });
  
  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
  });
};

const supplements: Supplement[] = [
  {
    id: '1',
    name: 'Multivitamínico',
    description: 'Suporte nutricional completo com vitaminas e minerais essenciais',
    benefits: ['Fortalece sistema imunológico', 'Melhora energia e disposição', 'Suporte ao metabolismo'],
    dosage: '1 comprimido ao dia com refeição',
    icon: <Shield color="white" size={24} />,
    color: '#00d4ff'
  },
  {
    id: '2',
    name: 'Ômega-3',
    description: 'Ácidos graxos essenciais para cérebro e coração',
    benefits: ['Melhora função cerebral', 'Protege saúde cardiovascular', 'Reduz inflamação'],
    dosage: '1000-2000mg ao dia com refeição',
    icon: <Brain color="white" size={24} />,
    color: '#4fc3f7'
  },
  {
    id: '3',
    name: 'Vitamina D3',
    description: 'Essencial para ossos fortes e imunidade robusta',
    benefits: ['Fortalece ossos e dentes', 'Melhora absorção de cálcio', 'Suporte imunológico'],
    dosage: '2000-4000 UI ao dia',
    icon: <Bone color="white" size={24} />,
    color: '#ffa726'
  },
  {
    id: '4',
    name: 'Whey Protein',
    description: 'Suporte para massa muscular e recuperação',
    benefits: ['Ganho muscular', 'Recuperação pós-treino', 'Saciedade'],
    dosage: '25-30g pós-treino',
    icon: <Zap color="white" size={24} />,
    color: '#E91E63',
    ageWarnings: [
      {
        maxAge: 16,
        warning: 'Não recomendado para menores de 16 anos. O crescimento natural deve ser priorizado.'
      }
    ]
  },
  {
    id: '5',
    name: 'Creatina',
    description: 'Melhora performance e força muscular',
    benefits: ['Força muscular', 'Performance atlética', 'Recuperação'],
    dosage: '3-5g ao dia',
    icon: <Zap color="white" size={24} />,
    color: '#FF6B35',
    ageWarnings: [
      {
        maxAge: 18,
        warning: 'Não recomendado para menores de 18 anos. Pode interferir no desenvolvimento natural.'
      }
    ]
  },
  {
    id: '6',
    name: 'Cafeína (Suplemento)',
    description: 'Estimulante para energia e foco',
    benefits: ['Energia', 'Foco mental', 'Performance física'],
    dosage: '100-200mg ao dia',
    icon: <Zap color="white" size={24} />,
    color: '#8B4513',
    ageWarnings: [
      {
        maxAge: 18,
        warning: 'Perigoso para menores de 18 anos. Pode causar ansiedade, insônia e problemas cardíacos.'
      },
      {
        minAge: 65,
        warning: 'Cuidado em idosos. Pode interferir com medicamentos e causar problemas cardíacos.'
      }
    ]
  },
  {
    id: '7',
    name: 'Complexo B',
    description: 'Energia e metabolismo saudável',
    benefits: ['Energia', 'Metabolismo', 'Sistema nervoso'],
    dosage: '1 cápsula ao dia',
    icon: <Zap color="white" size={24} />,
    color: '#9C27B0'
  },
  {
    id: '8',
    name: 'Magnésio',
    description: 'Relaxamento muscular e qualidade do sono',
    benefits: ['Relaxamento', 'Qualidade do sono', 'Função muscular'],
    dosage: '200-400mg antes de dormir',
    icon: <Heart color="white" size={24} />,
    color: '#607D8B'
  },
  {
    id: '9',
    name: 'Coenzima Q10',
    description: 'Antioxidante para saúde cardiovascular',
    benefits: ['Saúde cardíaca', 'Energia celular', 'Antioxidante'],
    dosage: '100-200mg ao dia',
    icon: <Heart color="white" size={24} />,
    color: '#F44336'
  },
  {
    id: '10',
    name: 'Probióticos',
    description: 'Saúde intestinal e imunidade',
    benefits: ['Saúde digestiva', 'Imunidade', 'Absorção de nutrientes'],
    dosage: '1-2 cápsulas ao dia',
    icon: <Shield color="white" size={24} />,
    color: '#4CAF50'
  },
  {
    id: '11',
    name: 'Vitamina C',
    description: 'Antioxidante e suporte imunológico',
    benefits: ['Sistema imunológico', 'Antioxidante', 'Síntese de colágeno'],
    dosage: '500-1000mg ao dia',
    icon: <Shield color="white" size={24} />,
    color: '#FF5722'
  },
  {
    id: '12',
    name: 'Colágeno',
    description: 'Saúde da pele, articulações e ossos',
    benefits: ['Saúde da pele', 'Articulações', 'Elasticidade'],
    dosage: '10g ao dia',
    icon: <Eye color="white" size={24} />,
    color: '#E91E63'
  },
  {
    id: '13',
    name: 'Ginkgo Biloba',
    description: 'Circulação e função cognitiva',
    benefits: ['Circulação', 'Memória', 'Concentração'],
    dosage: '120-240mg ao dia',
    icon: <Brain color="white" size={24} />,
    color: '#009688',
    ageWarnings: [
      {
        maxAge: 18,
        warning: 'Não recomendado para menores de 18 anos. Pode interferir com medicamentos.'
      }
    ]
  },
  {
    id: '14',
    name: 'Melatonina',
    description: 'Regulação do sono e ritmo circadiano',
    benefits: ['Qualidade do sono', 'Regulação do ritmo', 'Antioxidante'],
    dosage: '1-3mg antes de dormir',
    icon: <Heart color="white" size={24} />,
    color: '#6A5ACD',
    ageWarnings: [
      {
        maxAge: 18,
        warning: 'Perigoso para menores de 18 anos. Pode interferir no desenvolvimento hormonal natural.'
      }
    ]
  },
  {
    id: '15',
    name: 'Ferro',
    description: 'Prevenção de anemia e transporte de oxigênio',
    benefits: ['Prevenção anemia', 'Energia', 'Transporte oxigênio'],
    dosage: '18mg ao dia (mulheres), 8mg (homens)',
    icon: <Shield color="white" size={24} />,
    color: '#B22222',
    ageWarnings: [
      {
        minAge: 50,
        warning: 'Cuidado em homens acima de 50 anos. Excesso de ferro pode ser prejudicial ao coração.'
      }
    ]
  }
];

export default function SupplementsScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const { colors, isDark } = useTheme();
  const { userProfile } = useCalorieTracker();
  
  // Get personalized recommendations
  const personalizedRecommendations = userProfile 
    ? getVitaminRecommendations(userProfile.age, userProfile.gender, userProfile.activityLevel, userProfile.goal)
    : [];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const styles = useThemedStyles((colors, isDark) => StyleSheet.create({
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
      paddingBottom: 120,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 16,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 24,
    },
    headerLeft: {
      flex: 1,
    },
    greeting: {
      fontSize: 34,
      fontWeight: '700' as const,
      marginBottom: 2,
      letterSpacing: -0.4,
      ...Platform.select({
        ios: {
          fontFamily: 'System',
        },
      }),
    },
    date: {
      fontSize: 17,
      fontWeight: '400' as const,
      textTransform: 'capitalize' as const,
      lineHeight: 22,
      opacity: 0.6,
    },

    supplementsSection: {
      paddingHorizontal: 20,
    },
    supplementCard: {
      padding: 24,
      marginBottom: 20,
      borderRadius: 24,
      position: 'relative',
      overflow: 'hidden',
    },
    supplementGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    supplementHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 20,
      zIndex: 1,
    },
    supplementIcon: {
      width: 60,
      height: 60,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 16,
      shadowColor: 'rgba(0, 0, 0, 0.2)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
    },
    supplementInfo: {
      flex: 1,
      paddingRight: 110,
    },
    supplementName: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 6,
      letterSpacing: 0.3,
    },
    supplementDescription: {
      fontSize: 15,
      color: colors.textSecondary,
      lineHeight: 22,
      fontWeight: '500',
    },
    benefitsSection: {
      marginBottom: 20,
    },
    benefitsTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 12,
      letterSpacing: 0.2,
    },
    benefitsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    benefitChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceSecondary,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 6,
    },
    benefitDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    benefitText: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    dosageSection: {
      backgroundColor: colors.surfaceSecondary,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
    },
    dosageHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 8,
    },
    dosageTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: 0.2,
    },
    dosageText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '600',
      lineHeight: 20,
    },
    warningSection: {
      backgroundColor: isDark ? 'rgba(255, 107, 53, 0.12)' : 'rgba(255, 107, 53, 0.08)',
      padding: 16,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: isDark ? 'rgba(255, 107, 53, 0.3)' : 'rgba(255, 107, 53, 0.2)',
    },
    warningHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 8,
    },
    warningTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: '#ff6b35',
      letterSpacing: 0.2,
    },
    warningContent: {
      gap: 8,
    },
    warningItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
    },
    warningBullet: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#ff6b35',
      marginTop: 7,
    },
    warningText: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      fontWeight: '500',
      flex: 1,
    },
    disclaimerCard: {
      padding: 24,
      marginTop: 20,
      backgroundColor: isDark ? 'rgba(255, 107, 53, 0.15)' : 'rgba(255, 107, 53, 0.08)',
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: isDark ? 'rgba(255, 107, 53, 0.35)' : 'rgba(255, 107, 53, 0.2)',
    },
    disclaimerHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 12,
    },
    disclaimerTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: 0.3,
    },
    disclaimerText: {
      fontSize: 15,
      color: colors.textSecondary,
      lineHeight: 22,
      fontWeight: '500',
    },
    safetyCard: {
      padding: 24,
      marginTop: 16,
      backgroundColor: isDark ? 'rgba(0, 212, 255, 0.12)' : 'rgba(0, 122, 255, 0.08)',
      borderRadius: 20,
      borderWidth: 1.5,
      borderColor: isDark ? 'rgba(0, 212, 255, 0.3)' : 'rgba(0, 122, 255, 0.2)',
    },
    safetyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      gap: 12,
    },
    safetyTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: 0.3,
    },
    safetyTips: {
      gap: 10,
    },
    safetyTip: {
      fontSize: 15,
      color: colors.textSecondary,
      lineHeight: 22,
      fontWeight: '500',
      paddingLeft: 4,
    },
    
    // Personalized recommendations styles
    personalizedSection: {
      marginBottom: 24,
    },
    personalizedHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
      paddingHorizontal: 4,
    },
    personalizedTitle: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text,
      marginLeft: 12,
      letterSpacing: 0.3,
    },
    personalizedSubtitle: {
      fontSize: 15,
      color: colors.textSecondary,
      marginBottom: 20,
      paddingHorizontal: 4,
      lineHeight: 22,
    },
    priorityBadge: {
      position: 'absolute',
      top: 16,
      right: 16,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      zIndex: 2,
      shadowColor: 'rgba(0, 0, 0, 0.15)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.8,
      shadowRadius: 4,
      elevation: 3,
      maxWidth: 100,
    },
    priorityText: {
      fontSize: 10,
      fontWeight: '800',
      color: 'white',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      textAlign: 'center',
    },
    noProfileCard: {
      padding: 24,
      marginBottom: 20,
      borderRadius: 20,
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(255, 152, 0, 0.15)' : 'rgba(255, 152, 0, 0.08)',
      borderWidth: 1.5,
      borderColor: isDark ? 'rgba(255, 152, 0, 0.3)' : 'rgba(255, 152, 0, 0.2)',
    },
    noProfileIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: '#FF9800',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    noProfileTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    noProfileText: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    generalSupplementsTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
      paddingHorizontal: 4,
      letterSpacing: 0.2,
    },
    summaryCardIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
  }));

  return (
    <View style={styles.container}>
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
          <Animated.View style={[
            styles.header, 
            { 
              opacity: fadeAnim,
            }
          ]}>
            <View style={styles.headerTop}>
              <View style={styles.headerLeft}>
                <Text style={[styles.greeting, { color: colors.text }]}>
                  Suplementos Inteligentes
                </Text>
                <Text style={[styles.date, { color: colors.textSecondary }]}>
                  Guia completo com informações seguras e avisos importantes
                </Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View style={[styles.supplementsSection, { opacity: fadeAnim }]}>
            {/* Personalized Recommendations */}
            {userProfile ? (
              <View style={styles.personalizedSection}>
                <View style={styles.personalizedHeader}>
                  <View style={[styles.summaryCardIcon, { backgroundColor: '#4CAF50' }]}>
                    <Target color="white" size={20} strokeWidth={2.5} />
                  </View>
                  <Text style={styles.personalizedTitle}>Recomendações Personalizadas</Text>
                </View>
                <Text style={styles.personalizedSubtitle}>
                  Baseado no seu perfil: {userProfile.age} anos, {userProfile.gender === 'male' ? 'masculino' : 'feminino'}, 
                  objetivo de {userProfile.goal === 'lose' ? 'perder peso' : userProfile.goal === 'gain' ? 'ganhar peso' : 'manter peso'}
                </Text>
                
                {personalizedRecommendations.map((supplement, index) => (
                  <Animated.View
                    key={supplement.id}
                    style={[
                      {
                        transform: [{
                          translateY: fadeAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [30 + (index * 15), 0],
                          })
                        }]
                      }
                    ]}
                  >
                    <BlurCard style={styles.supplementCard}>
                      <LinearGradient
                        colors={[
                          `${supplement.color}20`,
                          `${supplement.color}10`,
                          'transparent'
                        ]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.supplementGradient}
                      />
                      
                      {supplement.priority && (
                        <View style={[
                          styles.priorityBadge,
                          {
                            backgroundColor: supplement.priority === 'high' ? '#4CAF50' : 
                                           supplement.priority === 'medium' ? '#FF9800' : '#9E9E9E'
                          }
                        ]}>
                          <Text style={styles.priorityText}>
                            {supplement.priority === 'high' ? 'PRIORIDADE' : 
                             supplement.priority === 'medium' ? 'RECOMENDADO' : 'OPCIONAL'}
                          </Text>
                        </View>
                      )}
                      
                      <View style={styles.supplementHeader}>
                        <View style={[
                          styles.supplementIcon,
                          { backgroundColor: supplement.color }
                        ]}>
                          {supplement.icon}
                        </View>
                        <View style={styles.supplementInfo}>
                          <Text style={styles.supplementName}>{supplement.name}</Text>
                          <Text style={styles.supplementDescription}>{supplement.description}</Text>
                        </View>
                      </View>
                      
                      <View style={styles.benefitsSection}>
                        <Text style={styles.benefitsTitle}>Principais Benefícios</Text>
                        <View style={styles.benefitsGrid}>
                          {supplement.benefits.map((benefit, benefitIndex) => (
                            <View key={`${supplement.id}-benefit-${benefitIndex}`} style={styles.benefitChip}>
                              <View style={[styles.benefitDot, { backgroundColor: supplement.color }]} />
                              <Text style={styles.benefitText}>{benefit}</Text>
                            </View>
                          ))}
                        </View>
                      </View>
                      
                      <View style={styles.dosageSection}>
                        <View style={styles.dosageHeader}>
                          <Pill color={colors.textSecondary} size={16} />
                          <Text style={styles.dosageTitle}>Dosagem Recomendada</Text>
                        </View>
                        <Text style={styles.dosageText}>{supplement.dosage}</Text>
                      </View>

                      {supplement.ageWarnings && supplement.ageWarnings.length > 0 && (
                        <View style={styles.warningSection}>
                          <View style={styles.warningHeader}>
                            <AlertTriangle color="#FF6B35" size={18} />
                            <Text style={styles.warningTitle}>Avisos Importantes</Text>
                          </View>
                          <View style={styles.warningContent}>
                            {supplement.ageWarnings.map((warning, warningIndex) => (
                              <View key={`${supplement.id}-warning-${warningIndex}`} style={styles.warningItem}>
                                <View style={styles.warningBullet} />
                                <Text style={styles.warningText}>{warning.warning}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}
                    </BlurCard>
                  </Animated.View>
                ))}
              </View>
            ) : (
              <BlurCard style={styles.noProfileCard}>
                <View style={styles.noProfileIcon}>
                  <AlertTriangle color="white" size={24} />
                </View>
                <Text style={styles.noProfileTitle}>Configure seu Perfil</Text>
                <Text style={styles.noProfileText}>
                  Para receber recomendações personalizadas de vitaminas baseadas na sua idade e estilo de vida, 
                  configure seu perfil na aba &ldquo;Perfil&rdquo;.
                </Text>
              </BlurCard>
            )}
            
            {/* General Supplements */}
            <Text style={styles.generalSupplementsTitle}>Guia Geral de Suplementos</Text>
            {supplements.map((supplement, index) => (
              <Animated.View
                key={supplement.id}
                style={[
                  {
                    transform: [{
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [30 + (index * 15), 0],
                      })
                    }]
                  }
                ]}
              >
                <BlurCard style={styles.supplementCard}>
                  <LinearGradient
                    colors={[
                      `${supplement.color}15`,
                      `${supplement.color}08`,
                      'transparent'
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.supplementGradient}
                  />
                  
                  <View style={styles.supplementHeader}>
                    <View style={[
                      styles.supplementIcon,
                      { backgroundColor: supplement.color }
                    ]}>
                      {supplement.icon}
                    </View>
                    <View style={styles.supplementInfo}>
                      <Text style={styles.supplementName}>{supplement.name}</Text>
                      <Text style={styles.supplementDescription}>{supplement.description}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.benefitsSection}>
                    <Text style={styles.benefitsTitle}>Principais Benefícios</Text>
                    <View style={styles.benefitsGrid}>
                      {supplement.benefits.map((benefit, benefitIndex) => (
                        <View key={`${supplement.id}-benefit-${benefitIndex}`} style={styles.benefitChip}>
                          <View style={[styles.benefitDot, { backgroundColor: supplement.color }]} />
                          <Text style={styles.benefitText}>{benefit}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                  
                  <View style={styles.dosageSection}>
                    <View style={styles.dosageHeader}>
                      <Pill color={colors.textSecondary} size={16} />
                      <Text style={styles.dosageTitle}>Dosagem Recomendada</Text>
                    </View>
                    <Text style={styles.dosageText}>{supplement.dosage}</Text>
                  </View>

                  {supplement.ageWarnings && supplement.ageWarnings.length > 0 && (
                    <View style={styles.warningSection}>
                      <View style={styles.warningHeader}>
                        <AlertTriangle color="#FF6B35" size={18} />
                        <Text style={styles.warningTitle}>Avisos Importantes</Text>
                      </View>
                      <View style={styles.warningContent}>
                        {supplement.ageWarnings.map((warning, warningIndex) => (
                          <View key={`${supplement.id}-warning-${warningIndex}`} style={styles.warningItem}>
                            <View style={styles.warningBullet} />
                            <Text style={styles.warningText}>{warning.warning}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </BlurCard>
              </Animated.View>
            ))}

            <BlurCard style={styles.disclaimerCard}>
              <View style={styles.disclaimerHeader}>
                <AlertTriangle color="#ff6b35" size={24} />
                <Text style={styles.disclaimerTitle}>Aviso Médico Importante</Text>
              </View>
              <Text style={styles.disclaimerText}>
                Estas informações são apenas educativas. Sempre consulte um médico ou nutricionista 
                antes de iniciar qualquer suplementação. Alguns suplementos podem ser perigosos 
                para certas idades, condições de saúde ou interagir com medicamentos.
              </Text>
            </BlurCard>

            <BlurCard style={styles.safetyCard}>
              <View style={styles.safetyHeader}>
                <Info color={isDark ? "#00d4ff" : "#007AFF"} size={24} />
                <Text style={styles.safetyTitle}>Dicas de Segurança</Text>
              </View>
              <View style={styles.safetyTips}>
                <Text style={styles.safetyTip}>• Comece sempre com doses menores</Text>
                <Text style={styles.safetyTip}>• Observe reações do seu corpo</Text>
                <Text style={styles.safetyTip}>• Mantenha longe de crianças</Text>
                <Text style={styles.safetyTip}>• Verifique data de validade</Text>
                <Text style={styles.safetyTip}>• Armazene em local seco e fresco</Text>
              </View>
            </BlurCard>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

