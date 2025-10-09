import React, { useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle, AlertCircle } from 'lucide-react-native';
import { useTheme, useThemedStyles } from '@/providers/ThemeProvider';
import { useCalorieTracker } from '@/providers/CalorieTrackerProvider';

interface SupplementInfo {
  name: string;
  function: string;
  dailyDose: string;
  category: 'supplement' | 'vitamin';
}

const SUPPLEMENTS: SupplementInfo[] = [
  { name: 'Whey Protein', function: 'Crescimento muscular, recuperação pós-treino e saciedade', dailyDose: '25-30g', category: 'supplement' },
  { name: 'Creatina', function: 'Aumento de força, performance atlética e função cognitiva', dailyDose: '3-5g', category: 'supplement' },
  { name: 'Ómega-3', function: 'Saúde cardiovascular, função cerebral e redução de inflamação', dailyDose: '1000-2000mg', category: 'supplement' },
  { name: 'Colágeno', function: 'Saúde da pele, articulações, cabelo e unhas', dailyDose: '10g', category: 'supplement' },
  { name: 'Probióticos', function: 'Saúde intestinal, digestão e fortalecimento do sistema imunológico', dailyDose: '1-2 cápsulas', category: 'supplement' },
  { name: 'Coenzima Q10', function: 'Energia celular, saúde cardiovascular e ação antioxidante', dailyDose: '100-200mg', category: 'supplement' },
  { name: 'Curcumina', function: 'Propriedades anti-inflamatórias, antioxidantes e saúde articular', dailyDose: '500-1000mg', category: 'supplement' },
  { name: 'Ashwagandha', function: 'Redução de stress, aumento de energia e equilíbrio hormonal', dailyDose: '300-500mg', category: 'supplement' },
  { name: 'Melatonina', function: 'Melhoria da qualidade do sono e regulação do ritmo circadiano', dailyDose: '1-3mg', category: 'supplement' },
  { name: 'L-Teanina', function: 'Relaxamento mental, foco e redução de ansiedade', dailyDose: '200mg', category: 'supplement' },
  { name: 'Glucosamina', function: 'Saúde articular e manutenção da cartilagem', dailyDose: '1500mg', category: 'supplement' },
  { name: 'Condroitina', function: 'Saúde articular e melhoria da flexibilidade', dailyDose: '1200mg', category: 'supplement' },
  { name: 'MSM', function: 'Saúde das articulações, pele e propriedades anti-inflamatórias', dailyDose: '1000-3000mg', category: 'supplement' },
  { name: 'Spirulina', function: 'Fonte de proteína, antioxidantes e desintoxicação', dailyDose: '3-5g', category: 'supplement' },
  { name: 'Chlorella', function: 'Desintoxicação, fortalecimento imunológico e nutrientes essenciais', dailyDose: '3-5g', category: 'supplement' },
];

const VITAMINS: SupplementInfo[] = [
  { name: 'Vitamina A', function: 'Saúde da visão, sistema imunológico e pele saudável', dailyDose: '900mcg', category: 'vitamin' },
  { name: 'Vitamina B1 (Tiamina)', function: 'Metabolismo energético e função nervosa', dailyDose: '1.2mg', category: 'vitamin' },
  { name: 'Vitamina B2 (Riboflavina)', function: 'Produção de energia e saúde ocular', dailyDose: '1.3mg', category: 'vitamin' },
  { name: 'Vitamina B3 (Niacina)', function: 'Metabolismo e saúde cardiovascular', dailyDose: '16mg', category: 'vitamin' },
  { name: 'Vitamina B6 (Piridoxina)', function: 'Função cerebral e produção de hemoglobina', dailyDose: '1.7mg', category: 'vitamin' },
  { name: 'Vitamina B9 (Ácido Fólico)', function: 'Formação de DNA e gravidez saudável', dailyDose: '400mcg', category: 'vitamin' },
  { name: 'Vitamina B12', function: 'Energia, função nervosa e formação de glóbulos vermelhos', dailyDose: '2.4mcg', category: 'vitamin' },
  { name: 'Vitamina C', function: 'Antioxidante, imunidade e produção de colagénio', dailyDose: '90mg', category: 'vitamin' },
  { name: 'Vitamina D3', function: 'Saúde óssea, imunidade e regulação do humor', dailyDose: '2000UI', category: 'vitamin' },
  { name: 'Vitamina E', function: 'Antioxidante, saúde da pele e proteção celular', dailyDose: '15mg', category: 'vitamin' },
  { name: 'Vitamina K2', function: 'Coagulação sanguínea e saúde óssea', dailyDose: '120mcg', category: 'vitamin' },
  { name: 'Cálcio', function: 'Ossos e dentes fortes, função muscular', dailyDose: '1000mg', category: 'vitamin' },
  { name: 'Magnésio', function: 'Relaxamento muscular, sono e produção de energia', dailyDose: '300-400mg', category: 'vitamin' },
  { name: 'Zinco', function: 'Imunidade, cicatrização e saúde reprodutiva', dailyDose: '11mg', category: 'vitamin' },
  { name: 'Ferro', function: 'Transporte de oxigénio, energia e prevenção de anemia', dailyDose: '18mg', category: 'vitamin' },
  { name: 'Selénio', function: 'Antioxidante, função tiroideia e imunidade', dailyDose: '55mcg', category: 'vitamin' },
  { name: 'Iodo', function: 'Função tiroideia e metabolismo', dailyDose: '150mcg', category: 'vitamin' },
  { name: 'Potássio', function: 'Pressão arterial, função muscular e nervosa', dailyDose: '3500mg', category: 'vitamin' },
];

export default function SupplementsScreen() {
  const { isDark } = useTheme();
  const { meals, userProfile } = useCalorieTracker();
  const insets = useSafeAreaInsets();

  const todayNutrition = useMemo(() => {
    const today = new Date().toDateString();
    const todayMeals = meals.filter(meal => {
      if (!meal?.timestamp) return false;
      try {
        return new Date(meal.timestamp).toDateString() === today;
      } catch {
        return false;
      }
    });

    return todayMeals.reduce((acc, meal) => {
      meal.foods?.forEach((food: any) => {
        acc.protein += food.protein || 0;
        acc.vitaminC += food.vitaminC || 0;
        acc.vitaminD += food.vitaminD || 0;
        acc.calcium += food.calcium || 0;
        acc.iron += food.iron || 0;
        acc.omega3 += food.omega3 || 0;
      });
      return acc;
    }, {
      protein: 0,
      vitaminC: 0,
      vitaminD: 0,
      calcium: 0,
      iron: 0,
      omega3: 0,
    });
  }, [meals]);

  const nutritionStatus = useMemo(() => {
    const proteinTarget = userProfile ? userProfile.weight * 1.2 : 60;
    
    return {
      protein: { current: todayNutrition.protein, target: proteinTarget, met: todayNutrition.protein >= proteinTarget },
      vitaminC: { current: todayNutrition.vitaminC, target: 90, met: todayNutrition.vitaminC >= 90 },
      vitaminD: { current: todayNutrition.vitaminD, target: 2000, met: todayNutrition.vitaminD >= 2000 },
      calcium: { current: todayNutrition.calcium, target: 1000, met: todayNutrition.calcium >= 1000 },
      iron: { current: todayNutrition.iron, target: 18, met: todayNutrition.iron >= 18 },
      omega3: { current: todayNutrition.omega3, target: 1000, met: todayNutrition.omega3 >= 1000 },
    };
  }, [todayNutrition, userProfile]);

  const styles = useThemedStyles((colors, isDark) => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000000' : '#F2F2F7',
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 100,
    },
    header: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    title: {
      fontSize: 34,
      fontWeight: '700' as const,
      color: colors.text,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 17,
      color: colors.textSecondary,
    },
    section: {
      paddingHorizontal: 20,
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: '700' as const,
      color: colors.text,
      marginBottom: 12,
    },
    card: {
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.08,
      shadowRadius: isDark ? 3 : 8,
      elevation: isDark ? 2 : 3,
    },
    statusCard: {
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      borderRadius: 16,
      padding: 16,
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.2 : 0.05,
      shadowRadius: isDark ? 2 : 4,
      elevation: isDark ? 1 : 2,
    },
    statusLeft: {
      flex: 1,
    },
    statusName: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: colors.text,
      marginBottom: 4,
    },
    statusValues: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    statusIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    itemName: {
      fontSize: 17,
      fontWeight: '600' as const,
      color: colors.text,
      marginBottom: 6,
    },
    itemFunction: {
      fontSize: 15,
      color: colors.textSecondary,
      lineHeight: 22,
      marginBottom: 8,
    },
    itemDose: {
      fontSize: 13,
      fontWeight: '600' as const,
      color: colors.primary,
      textTransform: 'uppercase' as const,
      letterSpacing: 0.5,
    },
  }));

  const renderNutritionStatus = () => {
    const items = [
      { key: 'protein', label: 'Proteína', unit: 'g' },
      { key: 'vitaminC', label: 'Vitamina C', unit: 'mg' },
      { key: 'vitaminD', label: 'Vitamina D', unit: 'UI' },
      { key: 'calcium', label: 'Cálcio', unit: 'mg' },
      { key: 'iron', label: 'Ferro', unit: 'mg' },
      { key: 'omega3', label: 'Ómega-3', unit: 'mg' },
    ];

    return items.map((item) => {
      const status = nutritionStatus[item.key as keyof typeof nutritionStatus];
      const percentage = Math.min((status.current / status.target) * 100, 100);

      return (
        <View key={item.key} style={styles.statusCard}>
          <View style={styles.statusLeft}>
            <Text style={styles.statusName}>{item.label}</Text>
            <Text style={styles.statusValues}>
              {Math.round(status.current)}{item.unit} / {Math.round(status.target)}{item.unit} ({Math.round(percentage)}%)
            </Text>
          </View>
          <View style={[
            styles.statusIcon,
            { backgroundColor: status.met ? '#34C759' : '#FF9500' }
          ]}>
            {status.met ? (
              <CheckCircle color="white" size={18} strokeWidth={2.5} />
            ) : (
              <AlertCircle color="white" size={18} strokeWidth={2.5} />
            )}
          </View>
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isDark ? ['#000000', '#1C1C1E'] : ['#F2F2F7', '#FFFFFF']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent" 
        translucent 
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.title}>Suplementos & Vitaminas</Text>
          <Text style={styles.subtitle}>Integrado com seu perfil e refeições</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estado Nutricional de Hoje</Text>
          {renderNutritionStatus()}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suplementos</Text>
          {SUPPLEMENTS.map((supplement, index) => (
            <View key={`supplement-${index}`} style={styles.card}>
              <Text style={styles.itemName}>{supplement.name}</Text>
              <Text style={styles.itemFunction}>{supplement.function}</Text>
              <Text style={styles.itemDose}>Dose Diária: {supplement.dailyDose}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vitaminas & Minerais</Text>
          {VITAMINS.map((vitamin, index) => (
            <View key={`vitamin-${index}`} style={styles.card}>
              <Text style={styles.itemName}>{vitamin.name}</Text>
              <Text style={styles.itemFunction}>{vitamin.function}</Text>
              <Text style={styles.itemDose}>Dose Diária: {vitamin.dailyDose}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
