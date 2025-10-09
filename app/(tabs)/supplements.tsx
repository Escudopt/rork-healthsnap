import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Animated,
  StatusBar,
  Platform,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Shield, Zap, Brain, Bone, Eye, AlertTriangle, Pill, Info, Target, Plus, X, Edit2, Check, ChevronDown, Search } from 'lucide-react-native';
import { BlurCard } from '@/components/BlurCard';
import { useTheme, useThemedStyles } from '@/providers/ThemeProvider';
import { useCalorieTracker } from '@/providers/CalorieTrackerProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

interface MyVitamin {
  id: string;
  name: string;
  dosage: string;
  time: string;
  notes?: string;
}

const MY_VITAMINS_STORAGE_KEY = 'my_vitamins_v1';

const COMMON_DOSAGES = [
  '1 comprimido/dia',
  '2 comprimidos/dia',
  '1 cápsula/dia',
  '2 cápsulas/dia',
  '1 comprimido 2x/dia',
  '500 mg/dia',
  '1000 mg/dia',
  '1500 mg/dia',
  '2000 mg/dia',
  '100 mcg/dia',
  '200 mcg/dia',
  '500 mcg/dia',
  '1000 UI/dia',
  '2000 UI/dia',
  '4000 UI/dia',
  '5 ml/dia',
  '10 ml/dia',
  '1 colher de sopa/dia',
  '1 sachê/dia',
  '1 gota/dia',
  '5 gotas/dia',
  '10 gotas/dia',
];

const COMMON_TIMES = [
  'Após o pequeno-almoço',
  'Antes do pequeno-almoço',
  'Após o almoço',
  'Antes do almoço',
  'Após o jantar',
  'Antes do jantar',
  'Antes de dormir',
  'Ao acordar',
  'Com as refeições',
  'Entre as refeições',
  'Manhã',
  'Tarde',
  'Noite',
  '2x ao dia (manhã e noite)',
  '3x ao dia (manhã, tarde e noite)',
  'Em jejum',
  'Com água',
  'Com alimentos',
];

const COMMON_VITAMINS = [
  { name: 'Vitamina A', defaultDosage: '900 mcg/dia' },
  { name: 'Vitamina B1 (Tiamina)', defaultDosage: '1.2 mg/dia' },
  { name: 'Vitamina B2 (Riboflavina)', defaultDosage: '1.3 mg/dia' },
  { name: 'Vitamina B3 (Niacina)', defaultDosage: '16 mg/dia' },
  { name: 'Vitamina B5 (Ácido Pantoténico)', defaultDosage: '5 mg/dia' },
  { name: 'Vitamina B6 (Piridoxina)', defaultDosage: '1.7 mg/dia' },
  { name: 'Vitamina B7 (Biotina)', defaultDosage: '30 mcg/dia' },
  { name: 'Vitamina B9 (Ácido Fólico)', defaultDosage: '400 mcg/dia' },
  { name: 'Vitamina B12 (Cobalamina)', defaultDosage: '2.4 mcg/dia' },
  { name: 'Vitamina C (Ácido Ascórbico)', defaultDosage: '500-1000 mg/dia' },
  { name: 'Vitamina D3 (Colecalciferol)', defaultDosage: '2000-4000 UI/dia' },
  { name: 'Vitamina E (Tocoferol)', defaultDosage: '15 mg/dia' },
  { name: 'Vitamina K', defaultDosage: '120 mcg/dia' },
  { name: 'Complexo B', defaultDosage: '1 cápsula/dia' },
  { name: 'Multivitamínico', defaultDosage: '1 comprimido/dia' },
  { name: 'Ómega-3 (EPA/DHA)', defaultDosage: '1000-2000 mg/dia' },
  { name: 'Cálcio', defaultDosage: '1000 mg/dia' },
  { name: 'Magnésio', defaultDosage: '300-400 mg/dia' },
  { name: 'Zinco', defaultDosage: '11 mg/dia' },
  { name: 'Ferro', defaultDosage: '18 mg/dia' },
  { name: 'Selénio', defaultDosage: '55 mcg/dia' },
  { name: 'Iodo', defaultDosage: '150 mcg/dia' },
  { name: 'Crómio', defaultDosage: '200-400 mcg/dia' },
  { name: 'Potássio', defaultDosage: '3500-4700 mg/dia' },
  { name: 'Coenzima Q10', defaultDosage: '100-200 mg/dia' },
  { name: 'Colágeno', defaultDosage: '10 g/dia' },
  { name: 'Probióticos', defaultDosage: '1-2 cápsulas/dia' },
  { name: 'Melatonina', defaultDosage: '1-3 mg/dia' },
  { name: 'Whey Protein', defaultDosage: '25-30 g/dia' },
  { name: 'Creatina', defaultDosage: '3-5 g/dia' },
  { name: 'L-Carnitina', defaultDosage: '1000 mg/dia' },
  { name: 'Ginkgo Biloba', defaultDosage: '120-240 mg/dia' },
  { name: 'Curcuma (Açafrão)', defaultDosage: '500-1000 mg/dia' },
  { name: 'Ashwagandha', defaultDosage: '300-500 mg/dia' },
  { name: 'Glucosamina', defaultDosage: '1500 mg/dia' },
  { name: 'Condroitina', defaultDosage: '1200 mg/dia' },
].sort((a, b) => a.name.localeCompare(b.name));

// Intelligent supplement recommendation system based on age, diet, and nutritional analysis
const getIntelligentSupplementRecommendations = (
  age: number, 
  gender: 'male' | 'female', 
  activityLevel: string, 
  goal: string,
  meals: any[],
  healthMetrics: any
) => {
  const recommendations: Supplement[] = [];
  
  // Analyze nutritional intake from recent meals (last 7 days)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const recentMeals = meals.filter(meal => {
    if (!meal?.timestamp) return false;
    try {
      return new Date(meal.timestamp) >= oneWeekAgo;
    } catch {
      return false;
    }
  });
  
  // Calculate average daily nutritional intake
  const nutritionalAnalysis = recentMeals.reduce((acc, meal) => {
    meal.foods?.forEach((food: any) => {
      acc.protein += food.protein || 0;
      acc.carbs += food.carbs || 0;
      acc.fat += food.fat || 0;
      acc.fiber += food.fiber || 0;
      acc.sugar += food.sugar || 0;
      acc.sodium += food.sodium || 0;
      acc.calcium += food.calcium || 0;
      acc.iron += food.iron || 0;
      acc.vitaminC += food.vitaminC || 0;
      acc.vitaminD += food.vitaminD || 0;
    });
    return acc;
  }, {
    protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0,
    calcium: 0, iron: 0, vitaminC: 0, vitaminD: 0
  });
  
  // Calculate daily averages
  const daysAnalyzed = Math.max(1, Math.ceil((Date.now() - oneWeekAgo.getTime()) / (1000 * 60 * 60 * 24)));
  Object.keys(nutritionalAnalysis).forEach(key => {
    nutritionalAnalysis[key as keyof typeof nutritionalAnalysis] /= daysAnalyzed;
  });
  
  console.log('📊 Nutritional Analysis (daily avg):', nutritionalAnalysis);
  
  // INTELLIGENT RECOMMENDATIONS BASED ON NUTRITIONAL DEFICIENCIES
  
  // Protein deficiency check
  const proteinTarget = (healthMetrics?.bmr || 1500) * 0.15 / 4; // 15% of BMR in grams
  if (nutritionalAnalysis.protein < proteinTarget * 0.8) {
    recommendations.push({
      id: 'protein-deficiency',
      name: 'Whey Protein (Deficiência Detectada)',
      description: `Sua ingestão média de proteína (${Math.round(nutritionalAnalysis.protein)}g/dia) está abaixo do recomendado (${Math.round(proteinTarget)}g/dia)`,
      benefits: ['Suprir deficiência proteica', 'Manutenção muscular', 'Saciedade'],
      dosage: `${Math.round((proteinTarget - nutritionalAnalysis.protein) * 1.2)}g ao dia`,
      icon: <Zap color="white" size={24} />,
      color: '#E91E63',
      priority: 'high' as const
    });
  }
  
  // Fiber deficiency check
  const fiberTarget = age < 50 ? (gender === 'male' ? 38 : 25) : (gender === 'male' ? 30 : 21);
  if (nutritionalAnalysis.fiber < fiberTarget * 0.7) {
    recommendations.push({
      id: 'fiber-supplement',
      name: 'Suplemento de Fibras',
      description: `Sua ingestão de fibras (${Math.round(nutritionalAnalysis.fiber)}g/dia) está muito baixa. Meta: ${fiberTarget}g/dia`,
      benefits: ['Saúde digestiva', 'Controle glicêmico', 'Saciedade'],
      dosage: '10-15g ao dia com bastante água',
      icon: <Shield color="white" size={24} />,
      color: '#4CAF50',
      priority: 'high' as const
    });
  }
  
  // Iron deficiency (especially for women)
  const ironTarget = gender === 'female' && age < 51 ? 18 : 8;
  if (nutritionalAnalysis.iron < ironTarget * 0.6) {
    recommendations.push({
      id: 'iron-deficiency',
      name: 'Ferro + Vitamina C',
      description: `Baixa ingestão de ferro detectada (${Math.round(nutritionalAnalysis.iron)}mg/dia). Recomendado: ${ironTarget}mg/dia`,
      benefits: ['Prevenção anemia', 'Energia', 'Transporte de oxigênio'],
      dosage: `${Math.round(ironTarget - nutritionalAnalysis.iron)}mg com vitamina C`,
      icon: <Heart color="white" size={24} />,
      color: '#F44336',
      priority: 'high' as const
    });
  }
  
  // Calcium deficiency
  const calciumTarget = age < 51 ? 1000 : 1200;
  if (nutritionalAnalysis.calcium < calciumTarget * 0.5) {
    recommendations.push({
      id: 'calcium-deficiency',
      name: 'Cálcio + Magnésio + D3',
      description: `Ingestão de cálcio muito baixa (${Math.round(nutritionalAnalysis.calcium)}mg/dia). Meta: ${calciumTarget}mg/dia`,
      benefits: ['Saúde óssea', 'Prevenção osteoporose', 'Função muscular'],
      dosage: `${Math.round((calciumTarget - nutritionalAnalysis.calcium) * 0.8)}mg com magnésio e D3`,
      icon: <Bone color="white" size={24} />,
      color: '#FF9800',
      priority: 'high' as const
    });
  }
  
  // High sodium intake warning
  if (nutritionalAnalysis.sodium > 2300) {
    recommendations.push({
      id: 'potassium-high-sodium',
      name: 'Potássio (Alto Sódio Detectado)',
      description: `Sua ingestão de sódio (${Math.round(nutritionalAnalysis.sodium)}mg/dia) está alta. Potássio ajuda a equilibrar`,
      benefits: ['Equilibra sódio', 'Pressão arterial', 'Função cardíaca'],
      dosage: '3500-4700mg ao dia',
      icon: <Heart color="white" size={24} />,
      color: '#2196F3',
      priority: 'medium' as const
    });
  }
  
  // High sugar intake warning
  if (nutritionalAnalysis.sugar > 50) {
    recommendations.push({
      id: 'chromium-high-sugar',
      name: 'Cromo (Alto Açúcar Detectado)',
      description: `Ingestão elevada de açúcar (${Math.round(nutritionalAnalysis.sugar)}g/dia). Cromo ajuda no controle glicêmico`,
      benefits: ['Controle glicêmico', 'Reduz desejos por doce', 'Metabolismo'],
      dosage: '200-400mcg ao dia',
      icon: <Target color="white" size={24} />,
      color: '#9C27B0',
      priority: 'medium' as const
    });
  }
  
  // AGE-BASED RECOMMENDATIONS
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
  const { userProfile, meals, healthMetrics } = useCalorieTracker();
  
  const [myVitamins, setMyVitamins] = useState<MyVitamin[]>([]);
  const [isAddingVitamin, setIsAddingVitamin] = useState<boolean>(false);
  const [editingVitaminId, setEditingVitaminId] = useState<string | null>(null);
  const [newVitaminName, setNewVitaminName] = useState<string>('');
  const [showVitaminPicker, setShowVitaminPicker] = useState<boolean>(false);
  const [vitaminSearchQuery, setVitaminSearchQuery] = useState<string>('');
  const [newVitaminDosage, setNewVitaminDosage] = useState<string>('');
  const [newVitaminTime, setNewVitaminTime] = useState<string>('');
  const [newVitaminNotes, setNewVitaminNotes] = useState<string>('');
  const [showDosagePicker, setShowDosagePicker] = useState<boolean>(false);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);
  const [deficiencyAnalysis, setDeficiencyAnalysis] = useState<{
    covered: string[];
    missing: string[];
    suggestions: string[];
  } | null>(null);
  
  // Get intelligent personalized recommendations
  const personalizedRecommendations = userProfile 
    ? getIntelligentSupplementRecommendations(
        userProfile.age, 
        userProfile.gender, 
        userProfile.activityLevel, 
        userProfile.goal,
        meals,
        healthMetrics
      )
    : [];

  // Analyze vitamin coverage vs deficiencies
  const analyzeVitaminCoverage = useCallback(() => {
    if (!userProfile || personalizedRecommendations.length === 0 || myVitamins.length === 0) {
      setDeficiencyAnalysis(null);
      return;
    }

    const covered: string[] = [];
    const missing: string[] = [];
    const suggestions: string[] = [];

    // Extract nutrients from user's vitamins
    const userNutrients = myVitamins.map(v => v.name.toLowerCase());

    // Check each recommendation
    personalizedRecommendations.forEach(rec => {
      const recName = rec.name.toLowerCase();
      
      // Check if user is taking something that covers this deficiency
      const isCovered = userNutrients.some(nutrient => {
        // Check for direct matches or related nutrients
        if (nutrient.includes('multivitamínico') || nutrient.includes('multivitaminico')) {
          return true; // Multivitamin covers many deficiencies
        }
        
        // Check for specific nutrient matches
        if (recName.includes('proteína') || recName.includes('protein')) {
          return nutrient.includes('whey') || nutrient.includes('proteína') || nutrient.includes('protein');
        }
        if (recName.includes('ferro')) {
          return nutrient.includes('ferro') || nutrient.includes('iron');
        }
        if (recName.includes('cálcio') || recName.includes('calcio')) {
          return nutrient.includes('cálcio') || nutrient.includes('calcio') || nutrient.includes('calcium');
        }
        if (recName.includes('magnésio') || recName.includes('magnesio')) {
          return nutrient.includes('magnésio') || nutrient.includes('magnesio') || nutrient.includes('magnesium');
        }
        if (recName.includes('vitamina d')) {
          return nutrient.includes('vitamina d') || nutrient.includes('vitamin d') || nutrient.includes('d3');
        }
        if (recName.includes('ómega') || recName.includes('omega')) {
          return nutrient.includes('ómega') || nutrient.includes('omega') || nutrient.includes('epa') || nutrient.includes('dha');
        }
        if (recName.includes('fibra')) {
          return nutrient.includes('fibra') || nutrient.includes('fiber');
        }
        if (recName.includes('potássio') || recName.includes('potassio')) {
          return nutrient.includes('potássio') || nutrient.includes('potassio') || nutrient.includes('potassium');
        }
        if (recName.includes('cromo') || recName.includes('chromium')) {
          return nutrient.includes('cromo') || nutrient.includes('chromium');
        }
        
        return false;
      });

      if (isCovered) {
        covered.push(rec.name);
      } else {
        missing.push(rec.name);
        
        // Generate specific suggestion
        if (rec.priority === 'high') {
          suggestions.push(`⚠️ PRIORIDADE: ${rec.name} - ${rec.description}`);
        } else {
          suggestions.push(`💡 Considere adicionar: ${rec.name}`);
        }
      }
    });

    setDeficiencyAnalysis({ covered, missing, suggestions });
    console.log('📊 Vitamin coverage analysis:', { covered: covered.length, missing: missing.length });
  }, [userProfile, personalizedRecommendations, myVitamins]);

  // Run analysis when vitamins or recommendations change
  useEffect(() => {
    analyzeVitaminCoverage();
  }, [analyzeVitaminCoverage]);

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
    
    loadMyVitamins();
  }, [fadeAnim, scaleAnim]);
  
  const loadMyVitamins = async () => {
    try {
      const stored = await AsyncStorage.getItem(MY_VITAMINS_STORAGE_KEY);
      if (stored) {
        try {
          const vitamins = JSON.parse(stored) as MyVitamin[];
          if (Array.isArray(vitamins)) {
            setMyVitamins(vitamins);
            console.log('💊 Loaded my vitamins:', vitamins.length);
          } else {
            console.error('❌ Invalid vitamins data format, clearing storage');
            await AsyncStorage.removeItem(MY_VITAMINS_STORAGE_KEY);
            setMyVitamins([]);
          }
        } catch (parseError) {
          console.error('❌ JSON Parse error for vitamins, clearing corrupted data:', parseError);
          await AsyncStorage.removeItem(MY_VITAMINS_STORAGE_KEY);
          setMyVitamins([]);
        }
      }
    } catch (error) {
      console.error('❌ Error loading my vitamins:', error);
    }
  };
  
  const saveMyVitamins = async (vitamins: MyVitamin[]) => {
    try {
      await AsyncStorage.setItem(MY_VITAMINS_STORAGE_KEY, JSON.stringify(vitamins));
      console.log('💾 Saved my vitamins:', vitamins.length);
    } catch (error) {
      console.error('❌ Error saving my vitamins:', error);
    }
  };
  
  const selectVitamin = (vitamin: { name: string; defaultDosage: string }) => {
    setNewVitaminName(vitamin.name);
    if (!newVitaminDosage.trim()) {
      setNewVitaminDosage(vitamin.defaultDosage);
    }
    setShowVitaminPicker(false);
    setVitaminSearchQuery('');
  };
  
  const addVitamin = async () => {
    if (!newVitaminName.trim()) {
      Alert.alert('Erro', 'Por favor, selecione a vitamina');
      return;
    }
    
    if (!newVitaminDosage.trim()) {
      Alert.alert('Erro', 'Por favor, insira a dosagem');
      return;
    }
    
    const newVitamin: MyVitamin = {
      id: `vitamin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: newVitaminName.trim(),
      dosage: newVitaminDosage.trim(),
      time: newVitaminTime.trim() || 'Não especificado',
      notes: newVitaminNotes.trim(),
    };
    
    const updatedVitamins = [...myVitamins, newVitamin];
    setMyVitamins(updatedVitamins);
    await saveMyVitamins(updatedVitamins);
    
    setNewVitaminName('');
    setNewVitaminDosage('');
    setNewVitaminTime('');
    setNewVitaminNotes('');
    setIsAddingVitamin(false);
  };
  
  const updateVitamin = async (id: string) => {
    if (!newVitaminName.trim() || !newVitaminDosage.trim()) {
      Alert.alert('Erro', 'Por favor, preencha os campos obrigatórios');
      return;
    }
    
    const updatedVitamins = myVitamins.map(v => 
      v.id === id 
        ? {
            ...v,
            name: newVitaminName.trim(),
            dosage: newVitaminDosage.trim(),
            time: newVitaminTime.trim() || 'Não especificado',
            notes: newVitaminNotes.trim(),
          }
        : v
    );
    
    setMyVitamins(updatedVitamins);
    await saveMyVitamins(updatedVitamins);
    
    setEditingVitaminId(null);
    setNewVitaminName('');
    setNewVitaminDosage('');
    setNewVitaminTime('');
    setNewVitaminNotes('');
  };
  
  const deleteVitamin = async (id: string) => {
    Alert.alert(
      'Eliminar Vitamina',
      'Tem a certeza que deseja eliminar esta vitamina?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const updatedVitamins = myVitamins.filter(v => v.id !== id);
            setMyVitamins(updatedVitamins);
            await saveMyVitamins(updatedVitamins);
          },
        },
      ]
    );
  };
  
  const startEditVitamin = (vitamin: MyVitamin) => {
    setEditingVitaminId(vitamin.id);
    setNewVitaminName(vitamin.name);
    setNewVitaminDosage(vitamin.dosage);
    setNewVitaminTime(vitamin.time === 'Não especificado' ? '' : vitamin.time);
    setNewVitaminNotes(vitamin.notes || '');
  };
  
  const cancelEdit = () => {
    setEditingVitaminId(null);
    setIsAddingVitamin(false);
    setNewVitaminName('');
    setNewVitaminDosage('');
    setNewVitaminTime('');
    setNewVitaminNotes('');
    setShowVitaminPicker(false);
    setVitaminSearchQuery('');
  };
  
  const filteredVitamins = COMMON_VITAMINS.filter(vitamin => 
    vitamin.name.toLowerCase().includes(vitaminSearchQuery.toLowerCase())
  );

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
      paddingRight: 16,
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
      alignSelf: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      shadowColor: 'rgba(0, 0, 0, 0.15)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.8,
      shadowRadius: 4,
      elevation: 3,
      marginBottom: 16,
    },
    priorityText: {
      fontSize: 11,
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
    myVitaminsSection: {
      marginBottom: 32,
    },
    myVitaminsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
      paddingHorizontal: 4,
    },
    myVitaminsTitle: {
      fontSize: 22,
      fontWeight: '800' as const,
      color: colors.text,
      letterSpacing: 0.3,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#4CAF50',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 20,
      gap: 6,
    },
    addButtonText: {
      fontSize: 14,
      fontWeight: '700' as const,
      color: 'white',
    },
    myVitaminCard: {
      padding: 16,
      marginBottom: 10,
      borderRadius: 16,
      backgroundColor: isDark ? 'rgba(76, 175, 80, 0.12)' : 'rgba(76, 175, 80, 0.06)',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(76, 175, 80, 0.25)' : 'rgba(76, 175, 80, 0.15)',
    },
    myVitaminHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    myVitaminInfo: {
      flex: 1,
      gap: 8,
    },
    myVitaminName: {
      fontSize: 18,
      fontWeight: '800' as const,
      color: colors.text,
      letterSpacing: 0.2,
      marginBottom: 4,
    },
    myVitaminDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flexWrap: 'wrap',
    },
    myVitaminDosage: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '600' as const,
    },
    myVitaminTime: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '500' as const,
    },
    myVitaminSeparator: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '400' as const,
    },
    myVitaminNotes: {
      fontSize: 12,
      color: colors.textSecondary,
      fontStyle: 'italic' as const,
      marginTop: 6,
      lineHeight: 16,
    },
    myVitaminActions: {
      flexDirection: 'row',
      gap: 6,
    },
    actionButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    editButton: {
      backgroundColor: isDark ? 'rgba(33, 150, 243, 0.2)' : 'rgba(33, 150, 243, 0.15)',
    },
    deleteButton: {
      backgroundColor: isDark ? 'rgba(244, 67, 54, 0.2)' : 'rgba(244, 67, 54, 0.15)',
    },
    addVitaminForm: {
      padding: 20,
      marginBottom: 16,
      borderRadius: 20,
      backgroundColor: isDark ? 'rgba(76, 175, 80, 0.15)' : 'rgba(76, 175, 80, 0.08)',
      borderWidth: 1.5,
      borderColor: isDark ? 'rgba(76, 175, 80, 0.3)' : 'rgba(76, 175, 80, 0.2)',
    },
    formTitle: {
      fontSize: 18,
      fontWeight: '700' as const,
      color: colors.text,
      marginBottom: 16,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 15,
      color: colors.text,
      marginBottom: 16,
    },
    inputMultiline: {
      height: 80,
      textAlignVertical: 'top' as const,
    },
    formActions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    formButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      borderRadius: 12,
      gap: 8,
    },
    saveButton: {
      backgroundColor: '#4CAF50',
    },
    cancelButton: {
      backgroundColor: isDark ? 'rgba(158, 158, 158, 0.2)' : 'rgba(158, 158, 158, 0.15)',
    },
    formButtonText: {
      fontSize: 15,
      fontWeight: '700' as const,
      color: 'white',
    },
    cancelButtonText: {
      color: colors.text,
    },
    vitaminPickerButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    vitaminPickerButtonText: {
      fontSize: 15,
      color: colors.text,
      flex: 1,
    },
    vitaminPickerPlaceholder: {
      color: colors.textSecondary,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      width: '100%',
      maxHeight: '80%',
      overflow: 'hidden',
    },
    modalHeader: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700' as const,
      color: colors.text,
      marginBottom: 12,
    },
    searchInput: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 10,
      fontSize: 15,
      color: colors.text,
      flexDirection: 'row',
      alignItems: 'center',
    },
    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    searchInputField: {
      flex: 1,
      fontSize: 15,
      color: colors.text,
      marginLeft: 8,
    },
    vitaminList: {
      maxHeight: 400,
    },
    vitaminItem: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    vitaminItemName: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: colors.text,
      marginBottom: 4,
    },
    vitaminItemDosage: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    modalCloseButton: {
      padding: 16,
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    modalCloseButtonText: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: '#4CAF50',
    },
    emptyVitaminsCard: {
      padding: 24,
      marginBottom: 16,
      borderRadius: 20,
      alignItems: 'center',
      backgroundColor: isDark ? 'rgba(76, 175, 80, 0.15)' : 'rgba(76, 175, 80, 0.08)',
      borderWidth: 1.5,
      borderColor: isDark ? 'rgba(76, 175, 80, 0.3)' : 'rgba(76, 175, 80, 0.2)',
    },
    emptyVitaminsIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: '#4CAF50',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    emptyVitaminsTitle: {
      fontSize: 18,
      fontWeight: '700' as const,
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptyVitaminsText: {
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
    analysisCard: {
      padding: 20,
      marginBottom: 20,
      borderRadius: 20,
      backgroundColor: isDark ? 'rgba(255, 152, 0, 0.15)' : 'rgba(255, 152, 0, 0.08)',
      borderWidth: 1.5,
      borderColor: isDark ? 'rgba(255, 152, 0, 0.3)' : 'rgba(255, 152, 0, 0.2)',
    },
    analysisHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    analysisTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginLeft: 12,
      letterSpacing: 0.2,
    },
    analysisText: {
      fontSize: 15,
      color: colors.textSecondary,
      lineHeight: 22,
      fontWeight: '500',
    },
    analysisSection: {
      marginBottom: 32,
    },
    coverageCard: {
      padding: 20,
      marginBottom: 16,
      borderRadius: 20,
      backgroundColor: isDark ? 'rgba(76, 175, 80, 0.15)' : 'rgba(76, 175, 80, 0.08)',
      borderWidth: 1.5,
      borderColor: isDark ? 'rgba(76, 175, 80, 0.3)' : 'rgba(76, 175, 80, 0.2)',
    },
    coverageTitle: {
      fontSize: 18,
      fontWeight: '700' as const,
      color: colors.text,
      marginBottom: 8,
      letterSpacing: 0.2,
    },
    coverageDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 16,
      lineHeight: 20,
    },
    coverageList: {
      gap: 10,
    },
    coverageItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    coverageBullet: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    coverageItemText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '600' as const,
      flex: 1,
    },
    missingCard: {
      padding: 20,
      marginBottom: 16,
      borderRadius: 20,
      backgroundColor: isDark ? 'rgba(255, 152, 0, 0.15)' : 'rgba(255, 152, 0, 0.08)',
      borderWidth: 1.5,
      borderColor: isDark ? 'rgba(255, 152, 0, 0.3)' : 'rgba(255, 152, 0, 0.2)',
    },
    missingTitle: {
      fontSize: 18,
      fontWeight: '700' as const,
      color: colors.text,
      marginBottom: 8,
      letterSpacing: 0.2,
    },
    missingDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 16,
      lineHeight: 20,
    },
    suggestionsList: {
      gap: 12,
    },
    suggestionItem: {
      backgroundColor: isDark ? 'rgba(255, 152, 0, 0.1)' : 'rgba(255, 152, 0, 0.05)',
      padding: 14,
      borderRadius: 12,
      borderLeftWidth: 3,
      borderLeftColor: '#FF9800',
    },
    suggestionText: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
      fontWeight: '500' as const,
    },
    successCard: {
      padding: 20,
      borderRadius: 20,
      backgroundColor: isDark ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.12)',
      borderWidth: 1.5,
      borderColor: isDark ? 'rgba(76, 175, 80, 0.4)' : 'rgba(76, 175, 80, 0.3)',
      alignItems: 'center',
    },
    successText: {
      fontSize: 15,
      color: colors.text,
      textAlign: 'center',
      lineHeight: 22,
      fontWeight: '600' as const,
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


            {/* My Vitamins Section */}
            <View style={styles.myVitaminsSection}>
              <View style={styles.myVitaminsHeader}>
                <Text style={styles.myVitaminsTitle}>As Minhas Vitaminas</Text>
                {!isAddingVitamin && (
                  <TouchableOpacity 
                    style={styles.addButton}
                    onPress={() => setIsAddingVitamin(true)}
                  >
                    <Plus color="white" size={18} strokeWidth={2.5} />
                    <Text style={styles.addButtonText}>Adicionar</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {isAddingVitamin && (
                <BlurCard style={styles.addVitaminForm}>
                  <Text style={styles.formTitle}>Adicionar Nova Vitamina</Text>
                  
                  <Text style={styles.inputLabel}>Nome da Vitamina *</Text>
                  <TouchableOpacity 
                    style={styles.vitaminPickerButton}
                    onPress={() => setShowVitaminPicker(true)}
                  >
                    <Text style={[
                      styles.vitaminPickerButtonText,
                      !newVitaminName && styles.vitaminPickerPlaceholder
                    ]}>
                      {newVitaminName || 'Selecione uma vitamina'}
                    </Text>
                    <ChevronDown color={colors.textSecondary} size={20} />
                  </TouchableOpacity>
                  
                  <Text style={styles.inputLabel}>Dosagem *</Text>
                  <TouchableOpacity 
                    style={styles.vitaminPickerButton}
                    onPress={() => setShowDosagePicker(true)}
                  >
                    <Text style={[
                      styles.vitaminPickerButtonText,
                      !newVitaminDosage && styles.vitaminPickerPlaceholder
                    ]}>
                      {newVitaminDosage || 'Selecione a dosagem'}
                    </Text>
                    <ChevronDown color={colors.textSecondary} size={20} />
                  </TouchableOpacity>
                  
                  <Text style={styles.inputLabel}>Horário</Text>
                  <TouchableOpacity 
                    style={styles.vitaminPickerButton}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <Text style={[
                      styles.vitaminPickerButtonText,
                      !newVitaminTime && styles.vitaminPickerPlaceholder
                    ]}>
                      {newVitaminTime || 'Selecione o horário'}
                    </Text>
                    <ChevronDown color={colors.textSecondary} size={20} />
                  </TouchableOpacity>
                  
                  <Text style={styles.inputLabel}>Notas</Text>
                  <TextInput
                    style={[styles.input, styles.inputMultiline]}
                    placeholder="Notas adicionais (opcional)"
                    placeholderTextColor={colors.textSecondary}
                    value={newVitaminNotes}
                    onChangeText={setNewVitaminNotes}
                    multiline
                  />
                  
                  <View style={styles.formActions}>
                    <TouchableOpacity 
                      style={[styles.formButton, styles.cancelButton]}
                      onPress={cancelEdit}
                    >
                      <X color={colors.text} size={18} strokeWidth={2.5} />
                      <Text style={[styles.formButtonText, styles.cancelButtonText]}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.formButton, styles.saveButton]}
                      onPress={addVitamin}
                    >
                      <Check color="white" size={18} strokeWidth={2.5} />
                      <Text style={styles.formButtonText}>Guardar</Text>
                    </TouchableOpacity>
                  </View>
                </BlurCard>
              )}
              
              {myVitamins.length === 0 && !isAddingVitamin && (
                <BlurCard style={styles.emptyVitaminsCard}>
                  <View style={styles.emptyVitaminsIcon}>
                    <Pill color="white" size={24} />
                  </View>
                  <Text style={styles.emptyVitaminsTitle}>Nenhuma Vitamina Adicionada</Text>
                  <Text style={styles.emptyVitaminsText}>
                    Adicione as vitaminas e suplementos que toma diariamente para manter um registo organizado.
                  </Text>
                </BlurCard>
              )}
              
              {myVitamins.map((vitamin) => (
                editingVitaminId === vitamin.id ? (
                  <BlurCard key={vitamin.id} style={styles.addVitaminForm}>
                    <Text style={styles.formTitle}>Editar Vitamina</Text>
                    
                    <Text style={styles.inputLabel}>Nome da Vitamina *</Text>
                    <TouchableOpacity 
                      style={styles.vitaminPickerButton}
                      onPress={() => setShowVitaminPicker(true)}
                    >
                      <Text style={[
                        styles.vitaminPickerButtonText,
                        !newVitaminName && styles.vitaminPickerPlaceholder
                      ]}>
                        {newVitaminName || 'Selecione uma vitamina'}
                      </Text>
                      <ChevronDown color={colors.textSecondary} size={20} />
                    </TouchableOpacity>
                    
                    <Text style={styles.inputLabel}>Dosagem *</Text>
                    <TouchableOpacity 
                      style={styles.vitaminPickerButton}
                      onPress={() => setShowDosagePicker(true)}
                    >
                      <Text style={[
                        styles.vitaminPickerButtonText,
                        !newVitaminDosage && styles.vitaminPickerPlaceholder
                      ]}>
                        {newVitaminDosage || 'Selecione a dosagem'}
                      </Text>
                      <ChevronDown color={colors.textSecondary} size={20} />
                    </TouchableOpacity>
                    
                    <Text style={styles.inputLabel}>Horário</Text>
                    <TouchableOpacity 
                      style={styles.vitaminPickerButton}
                      onPress={() => setShowTimePicker(true)}
                    >
                      <Text style={[
                        styles.vitaminPickerButtonText,
                        !newVitaminTime && styles.vitaminPickerPlaceholder
                      ]}>
                        {newVitaminTime || 'Selecione o horário'}
                      </Text>
                      <ChevronDown color={colors.textSecondary} size={20} />
                    </TouchableOpacity>
                    
                    <Text style={styles.inputLabel}>Notas</Text>
                    <TextInput
                      style={[styles.input, styles.inputMultiline]}
                      placeholder="Notas adicionais (opcional)"
                      placeholderTextColor={colors.textSecondary}
                      value={newVitaminNotes}
                      onChangeText={setNewVitaminNotes}
                      multiline
                    />
                    
                    <View style={styles.formActions}>
                      <TouchableOpacity 
                        style={[styles.formButton, styles.cancelButton]}
                        onPress={cancelEdit}
                      >
                        <X color={colors.text} size={18} strokeWidth={2.5} />
                        <Text style={[styles.formButtonText, styles.cancelButtonText]}>Cancelar</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.formButton, styles.saveButton]}
                        onPress={() => updateVitamin(vitamin.id)}
                      >
                        <Check color="white" size={18} strokeWidth={2.5} />
                        <Text style={styles.formButtonText}>Guardar</Text>
                      </TouchableOpacity>
                    </View>
                  </BlurCard>
                ) : (
                  <BlurCard key={vitamin.id} style={styles.myVitaminCard}>
                    <View style={styles.myVitaminHeader}>
                      <View style={styles.myVitaminInfo}>
                        <Text style={styles.myVitaminName} numberOfLines={2}>{vitamin.name}</Text>
                        <View style={styles.myVitaminDetails}>
                          <Text style={styles.myVitaminDosage} numberOfLines={1}>{vitamin.dosage}</Text>
                          <Text style={styles.myVitaminSeparator}>•</Text>
                          <Text style={styles.myVitaminTime} numberOfLines={1}>{vitamin.time}</Text>
                        </View>
                      </View>
                      <View style={styles.myVitaminActions}>
                        <TouchableOpacity 
                          style={[styles.actionButton, styles.editButton]}
                          onPress={() => startEditVitamin(vitamin)}
                        >
                          <Edit2 color="#2196F3" size={16} strokeWidth={2} />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.actionButton, styles.deleteButton]}
                          onPress={() => deleteVitamin(vitamin.id)}
                        >
                          <X color="#F44336" size={16} strokeWidth={2} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    {vitamin.notes && (
                      <Text style={styles.myVitaminNotes} numberOfLines={2}>{vitamin.notes}</Text>
                    )}
                  </BlurCard>
                )
              ))}
            </View>
            
            {/* Personalized Recommendations */}
            {userProfile && personalizedRecommendations.length > 0 && (
              <View style={styles.personalizedSection}>
                <View style={styles.personalizedHeader}>
                  <View style={[styles.summaryCardIcon, { backgroundColor: '#4CAF50' }]}>
                    <Target color="white" size={20} strokeWidth={2.5} />
                  </View>
                  <Text style={styles.personalizedTitle}>Recomendações Personalizadas</Text>
                </View>
                <Text style={styles.personalizedSubtitle}>
                  Baseado no seu perfil e análise nutricional
                </Text>
                
                {personalizedRecommendations.slice(0, 3).map((supplement, index) => (
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
                            backgroundColor: supplement.priority === 'high' ? '#FF6B35' : '#4CAF50'
                          }
                        ]}>
                          <Text style={styles.priorityText}>
                            {supplement.priority === 'high' ? 'PRIORIDADE' : 'RECOMENDADO'}
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
                    </BlurCard>
                  </Animated.View>
                ))}
              </View>
            )}
            
            {/* General Supplements */}
            <Text style={styles.generalSupplementsTitle}>Guia de Suplementos</Text>
            {supplements.slice(0, 5).map((supplement, index) => (
              <BlurCard key={supplement.id} style={styles.supplementCard}>
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
                
                <View style={styles.dosageSection}>
                  <View style={styles.dosageHeader}>
                    <Pill color={colors.textSecondary} size={16} />
                    <Text style={styles.dosageTitle}>Dosagem</Text>
                  </View>
                  <Text style={styles.dosageText}>{supplement.dosage}</Text>
                </View>
              </BlurCard>
            ))}

            <BlurCard style={styles.disclaimerCard}>
              <View style={styles.disclaimerHeader}>
                <AlertTriangle color="#ff6b35" size={24} />
                <Text style={styles.disclaimerTitle}>Aviso Importante</Text>
              </View>
              <Text style={styles.disclaimerText}>
                Consulte sempre um médico antes de iniciar qualquer suplementação.
              </Text>
            </BlurCard>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
      
      <Modal
        visible={showVitaminPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowVitaminPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Vitamina</Text>
              <View style={styles.searchInputContainer}>
                <Search color={colors.textSecondary} size={18} />
                <TextInput
                  style={styles.searchInputField}
                  placeholder="Pesquisar vitamina..."
                  placeholderTextColor={colors.textSecondary}
                  value={vitaminSearchQuery}
                  onChangeText={setVitaminSearchQuery}
                  autoFocus
                />
              </View>
            </View>
            
            <ScrollView style={styles.vitaminList}>
              {filteredVitamins.map((vitamin, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.vitaminItem}
                  onPress={() => selectVitamin(vitamin)}
                >
                  <Text style={styles.vitaminItemName}>{vitamin.name}</Text>
                  <Text style={styles.vitaminItemDosage}>Dosagem sugerida: {vitamin.defaultDosage}</Text>
                </TouchableOpacity>
              ))}
              {filteredVitamins.length === 0 && (
                <View style={styles.vitaminItem}>
                  <Text style={styles.vitaminItemDosage}>Nenhuma vitamina encontrada</Text>
                </View>
              )}
            </ScrollView>
            
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setShowVitaminPicker(false);
                setVitaminSearchQuery('');
              }}
            >
              <Text style={styles.modalCloseButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      <Modal
        visible={showDosagePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDosagePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Dosagem</Text>
            </View>
            
            <ScrollView style={styles.vitaminList}>
              {COMMON_DOSAGES.map((dosage, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.vitaminItem}
                  onPress={() => {
                    setNewVitaminDosage(dosage);
                    setShowDosagePicker(false);
                  }}
                >
                  <Text style={styles.vitaminItemName}>{dosage}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowDosagePicker(false)}
            >
              <Text style={styles.modalCloseButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      <Modal
        visible={showTimePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Horário</Text>
            </View>
            
            <ScrollView style={styles.vitaminList}>
              {COMMON_TIMES.map((time, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.vitaminItem}
                  onPress={() => {
                    setNewVitaminTime(time);
                    setShowTimePicker(false);
                  }}
                >
                  <Text style={styles.vitaminItemName}>{time}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowTimePicker(false)}
            >
              <Text style={styles.modalCloseButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

