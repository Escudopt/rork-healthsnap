import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Sunrise, 
  Sun, 
  Moon, 
  Clock, 
  Coffee, 
  Utensils, 
  Heart,
  Lightbulb,
  Droplets,
  Activity,
  Calendar,
  Zap,
  Leaf,
  Sparkles
} from 'lucide-react-native';
import { BlurCard } from '@/components/BlurCard';
import { useTheme, useThemedStyles } from '@/providers/ThemeProvider';

interface NutritionTip {
  id: string;
  title: string;
  description: string;
  foods: string[];
  icon: React.ReactNode;
  time: string;
  category: 'morning' | 'lunch' | 'night';
  color: string;
}

const nutritionTips: NutritionTip[] = [
  {
    id: '1',
    title: 'Café da Manhã Energético',
    description: 'Comece o dia com alimentos ricos em proteínas e fibras para manter a energia estável.',
    foods: ['Aveia com frutas', 'Ovos mexidos', 'Iogurte grego', 'Banana com pasta de amendoim'],
    icon: <Sunrise color="white" size={24} />,
    time: 'Ao Acordar',
    category: 'morning',
    color: '#FF6B6B'
  },
  {
    id: '2',
    title: 'Hidratação Matinal',
    description: 'Beba água logo ao acordar para reidratar o corpo após horas de sono.',
    foods: ['Água com limão', 'Chá verde', 'Água de coco', 'Suco natural'],
    icon: <Coffee color="white" size={24} />,
    time: 'Primeira Hora',
    category: 'morning',
    color: '#4ECDC4'
  },
  {
    id: '3',
    title: 'Almoço Balanceado',
    description: 'Combine proteínas, carboidratos complexos e vegetais para uma refeição completa.',
    foods: ['Arroz integral', 'Frango grelhado', 'Salada colorida', 'Feijão'],
    icon: <Sun color="white" size={24} />,
    time: 'Meio-dia',
    category: 'lunch',
    color: '#45B7D1'
  },
  {
    id: '4',
    title: 'Digestão Saudável',
    description: 'Mastigue bem os alimentos e evite líquidos em excesso durante as refeições.',
    foods: ['Gengibre', 'Hortelã', 'Camomila', 'Frutas digestivas'],
    icon: <Utensils color="white" size={24} />,
    time: 'Durante o Almoço',
    category: 'lunch',
    color: '#96CEB4'
  },
  {
    id: '5',
    title: 'Jantar Leve',
    description: 'Opte por alimentos de fácil digestão para um sono mais reparador.',
    foods: ['Sopa de legumes', 'Peixe grelhado', 'Salada verde', 'Chá de camomila'],
    icon: <Moon color="white" size={24} />,
    time: 'Antes de Dormir',
    category: 'night',
    color: '#A8E6CF'
  },
  {
    id: '6',
    title: 'Relaxamento Noturno',
    description: 'Evite cafeína e alimentos pesados 3 horas antes de dormir.',
    foods: ['Leite morno', 'Banana', 'Amêndoas', 'Chá de melissa'],
    icon: <Clock color="white" size={24} />,
    time: '3h Antes do Sono',
    category: 'night',
    color: '#DDA0DD'
  }
];

const categories = [
  { key: 'all', label: 'Todas', icon: <Heart color="white" size={20} /> },
  { key: 'morning', label: 'Manhã', icon: <Sunrise color="white" size={20} /> },
  { key: 'lunch', label: 'Almoço', icon: <Sun color="white" size={20} /> },
  { key: 'night', label: 'Noite', icon: <Moon color="white" size={20} /> }
];

export default function NutritionTipsScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const { colors, isDark } = useTheme();

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const filteredTips = selectedCategory === 'all' 
    ? nutritionTips 
    : nutritionTips.filter(tip => tip.category === selectedCategory);

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

    categoriesContainer: {
      marginBottom: 30,
    },
    categoriesGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: 20,
      gap: 12,
      justifyContent: 'space-between',
    },
    categoryGridItem: {
      width: '48%',
      minWidth: 140,
    },
    categoryCard: {
      paddingHorizontal: 20,
      paddingVertical: 14,
      alignItems: 'center',
      flexDirection: 'row',
      gap: 10,
      borderRadius: 16,
      flex: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.08,
      shadowRadius: isDark ? 3 : 8,
      elevation: isDark ? 2 : 3,
      borderWidth: isDark ? 0 : 0.5,
      borderColor: isDark ? 'transparent' : 'rgba(0, 0, 0, 0.05)',
    },
    selectedCategoryCard: {
      backgroundColor: isDark ? 'rgba(0, 212, 255, 0.25)' : 'rgba(0, 122, 255, 0.15)',
      borderWidth: 1.5,
      borderColor: isDark ? 'rgba(0, 212, 255, 0.5)' : 'rgba(0, 122, 255, 0.3)',
    },
    categoryText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    selectedCategoryText: {
      color: colors.text,
    },
    tipsContainer: {
      paddingHorizontal: 20,
      gap: 16,
    },
    tipCardContainer: {
      marginBottom: 16,
    },
    tipCard: {
      padding: 24,
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.08,
      shadowRadius: isDark ? 3 : 8,
      elevation: isDark ? 2 : 3,
      borderWidth: isDark ? 0 : 0.5,
      borderColor: isDark ? 'transparent' : 'rgba(0, 0, 0, 0.05)',
    },
    tipHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    iconContainer: {
      padding: 14,
      borderRadius: 20,
      marginRight: 18,
      shadowColor: 'rgba(0, 0, 0, 0.3)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.8,
      shadowRadius: 4,
    },
    tipHeaderText: {
      flex: 1,
    },
    tipTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 6,
      letterSpacing: 0.3,
    },
    tipTime: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    tipDescription: {
      fontSize: 15,
      color: colors.textSecondary,
      lineHeight: 22,
      marginBottom: 20,
    },
    foodsSection: {
      marginTop: 8,
    },
    foodsTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    foodsList: {
      gap: 8,
    },
    foodItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    foodBullet: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.textSecondary,
    },
    foodText: {
      fontSize: 14,
      color: colors.textSecondary,
      flex: 1,
    },
    sectionContainer: {
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    sectionCard: {
      padding: 24,
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.08,
      shadowRadius: isDark ? 3 : 8,
      elevation: isDark ? 2 : 3,
      borderWidth: isDark ? 0 : 0.5,
      borderColor: isDark ? 'transparent' : 'rgba(0, 0, 0, 0.05)',
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    sectionIcon: {
      padding: 14,
      borderRadius: 20,
      marginRight: 18,
      shadowColor: 'rgba(0, 0, 0, 0.3)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.8,
      shadowRadius: 4,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      flex: 1,
      letterSpacing: 0.3,
    },
    sectionDescription: {
      fontSize: 15,
      color: colors.textSecondary,
      lineHeight: 22,
      marginBottom: 20,
    },
    tipsList: {
      gap: 12,
    },
    tipItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    tipBullet: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.textSecondary,
    },
    tipText: {
      fontSize: 14,
      color: colors.textSecondary,
      flex: 1,
      lineHeight: 20,
    },
    exerciseNutrition: {
      gap: 16,
    },
    exercisePhase: {
      backgroundColor: colors.surfaceSecondary,
      padding: 18,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.border,
    },
    exercisePhaseTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    exercisePhaseText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 6,
      lineHeight: 20,
    },
    exerciseExample: {
      fontSize: 13,
      color: colors.textTertiary,
      fontStyle: 'italic',
      lineHeight: 18,
    },
    planningSteps: {
      gap: 16,
    },
    planningStep: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 16,
    },
    stepNumber: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: isDark ? 'rgba(0, 212, 255, 0.25)' : 'rgba(0, 122, 255, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: isDark ? 'rgba(0, 212, 255, 0.4)' : 'rgba(0, 122, 255, 0.3)',
    },
    stepNumberText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
    },
    stepContent: {
      flex: 1,
    },
    stepTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    stepDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    superfoodsGrid: {
      flexDirection: 'row',
      gap: 12,
    },
    superfoodsColumn: {
      flex: 1,
      gap: 12,
    },
    superfoodItem: {
      backgroundColor: colors.surfaceSecondary,
      padding: 18,
      borderRadius: 24,
      alignItems: 'center',
      minHeight: 110,
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    superfoodEmoji: {
      fontSize: 24,
      marginBottom: 8,
    },
    superfoodName: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
      textAlign: 'center',
    },
    superfoodBenefit: {
      fontSize: 12,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 16,
    },
    seasonalGrid: {
      flexDirection: 'row',
      gap: 12,
    },
    seasonalColumn: {
      flex: 1,
      gap: 12,
    },
    seasonItem: {
      backgroundColor: colors.surfaceSecondary,
      padding: 18,
      borderRadius: 24,
      alignItems: 'center',
      minHeight: 100,
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    seasonEmoji: {
      fontSize: 20,
      marginBottom: 6,
    },
    seasonName: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
      textAlign: 'center',
    },
    seasonFoods: {
      fontSize: 11,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 14,
    },
    generalTipsContainer: {
      paddingHorizontal: 20,
      marginTop: 20,
    },
    generalTipsCard: {
      padding: 24,
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.08,
      shadowRadius: isDark ? 3 : 8,
      elevation: isDark ? 2 : 3,
      borderWidth: isDark ? 0 : 0.5,
      borderColor: isDark ? 'transparent' : 'rgba(0, 0, 0, 0.05)',
    },
    generalTipsTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 16,
      textAlign: 'center',
    },
    generalTipsList: {
      gap: 12,
    },
    generalTip: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 8,
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
                  Nutrição Inteligente
                </Text>
                <Text style={[styles.date, { color: colors.textSecondary }]}>
                  Guia completo para uma alimentação equilibrada e saudável
                </Text>
              </View>
            </View>
          </Animated.View>

        <Animated.View style={[styles.categoriesContainer, { opacity: fadeAnim }]}>
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.key}
                onPress={() => setSelectedCategory(category.key)}
                activeOpacity={0.8}
                style={styles.categoryGridItem}
              >
                <View 
                  style={[
                    styles.categoryCard,
                    { backgroundColor: colors.surfaceElevated },
                    selectedCategory === category.key && styles.selectedCategoryCard
                  ]}
                >
                  {React.cloneElement(category.icon, { color: selectedCategory === category.key ? colors.text : colors.textSecondary })}
                  <Text style={[
                    styles.categoryText,
                    selectedCategory === category.key && styles.selectedCategoryText
                  ]}>
                    {category.label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        <Animated.View style={[styles.tipsContainer, { opacity: fadeAnim }]}>
          {filteredTips.map((tip, index) => (
            <Animated.View
              key={tip.id}
              style={[
                styles.tipCardContainer,
                {
                  transform: [{
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50 * (index + 1), 0],
                    })
                  }]
                }
              ]}
            >
              <View style={[styles.tipCard, { backgroundColor: colors.surfaceElevated }]}>
                <View style={styles.tipHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: tip.color }]}>
                    {tip.icon}
                  </View>
                  <View style={styles.tipHeaderText}>
                    <Text style={styles.tipTitle}>{tip.title}</Text>
                    <Text style={styles.tipTime}>{tip.time}</Text>
                  </View>
                </View>
                
                <Text style={styles.tipDescription}>{tip.description}</Text>
                
                <View style={styles.foodsSection}>
                  <Text style={styles.foodsTitle}>Alimentos Recomendados:</Text>
                  <View style={styles.foodsList}>
                    {tip.foods.map((food, foodIndex) => (
                      <View key={`${tip.id}-food-${foodIndex}`} style={styles.foodItem}>
                        <View style={styles.foodBullet} />
                        <Text style={styles.foodText}>{food}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </Animated.View>
          ))}
        </Animated.View>

        {/* Hydration Section */}
        <Animated.View style={[styles.sectionContainer, { opacity: fadeAnim }]}>
          <View style={[styles.sectionCard, { backgroundColor: colors.surfaceElevated }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: '#4FC3F7' }]}>
                <Droplets color="white" size={24} />
              </View>
              <Text style={styles.sectionTitle}>Hidratação Inteligente</Text>
            </View>
            <Text style={styles.sectionDescription}>
              A hidratação adequada é fundamental para o metabolismo e absorção de nutrientes.
            </Text>
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <View style={styles.tipBullet} />
                <Text style={styles.tipText}>2-3L de água por dia (35ml por kg de peso)</Text>
              </View>
              <View style={styles.tipItem}>
                <View style={styles.tipBullet} />
                <Text style={styles.tipText}>Beba água 30min antes das refeições</Text>
              </View>
              <View style={styles.tipItem}>
                <View style={styles.tipBullet} />
                <Text style={styles.tipText}>Adicione limão ou pepino para variar</Text>
              </View>
              <View style={styles.tipItem}>
                <View style={styles.tipBullet} />
                <Text style={styles.tipText}>Monitore a cor da urina (deve ser clara)</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Exercise Nutrition Section */}
        <Animated.View style={[styles.sectionContainer, { opacity: fadeAnim }]}>
          <View style={[styles.sectionCard, { backgroundColor: colors.surfaceElevated }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: '#FF7043' }]}>
                <Activity color="white" size={24} />
              </View>
              <Text style={styles.sectionTitle}>Nutrição e Exercício</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Otimize seus treinos com a alimentação adequada antes e depois.
            </Text>
            <View style={styles.exerciseNutrition}>
              <View style={styles.exercisePhase}>
                <Text style={styles.exercisePhaseTitle}>🏃‍♂️ Pré-Treino (1-2h antes)</Text>
                <Text style={styles.exercisePhaseText}>Carboidratos de fácil digestão + pouca proteína</Text>
                <Text style={styles.exerciseExample}>Ex: Banana com mel, aveia, torrada integral</Text>
              </View>
              <View style={styles.exercisePhase}>
                <Text style={styles.exercisePhaseTitle}>💪 Pós-Treino (até 30min)</Text>
                <Text style={styles.exercisePhaseText}>Proteína + carboidratos para recuperação</Text>
                <Text style={styles.exerciseExample}>Ex: Whey + banana, ovo + batata doce</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Meal Planning Section */}
        <Animated.View style={[styles.sectionContainer, { opacity: fadeAnim }]}>
          <View style={[styles.sectionCard, { backgroundColor: colors.surfaceElevated }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: '#66BB6A' }]}>
                <Calendar color="white" size={24} />
              </View>
              <Text style={styles.sectionTitle}>Planejamento Semanal</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Organize suas refeições para manter uma alimentação consistente.
            </Text>
            <View style={styles.planningSteps}>
              <View style={styles.planningStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Defina suas metas</Text>
                  <Text style={styles.stepDescription}>Perda de peso, ganho de massa, manutenção</Text>
                </View>
              </View>
              <View style={styles.planningStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Calcule suas necessidades</Text>
                  <Text style={styles.stepDescription}>Calorias, proteínas, carboidratos e gorduras</Text>
                </View>
              </View>
              <View style={styles.planningStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Prepare com antecedência</Text>
                  <Text style={styles.stepDescription}>Meal prep aos domingos para a semana</Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Superfoods Section */}
        <Animated.View style={[styles.sectionContainer, { opacity: fadeAnim }]}>
          <View style={[styles.sectionCard, { backgroundColor: colors.surfaceElevated }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: '#AB47BC' }]}>
                <Zap color="white" size={24} />
              </View>
              <Text style={styles.sectionTitle}>Superalimentos</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Alimentos ricos em nutrientes que potencializam sua saúde.
            </Text>
            <View style={styles.superfoodsGrid}>
              <View style={styles.superfoodsColumn}>
                <View style={styles.superfoodItem}>
                  <Text style={styles.superfoodEmoji}>🥑</Text>
                  <Text style={styles.superfoodName}>Abacate</Text>
                  <Text style={styles.superfoodBenefit}>Gorduras boas + Fibras</Text>
                </View>
                <View style={styles.superfoodItem}>
                  <Text style={styles.superfoodEmoji}>🥬</Text>
                  <Text style={styles.superfoodName}>Couve</Text>
                  <Text style={styles.superfoodBenefit}>Ferro + Vitamina K</Text>
                </View>
                <View style={styles.superfoodItem}>
                  <Text style={styles.superfoodEmoji}>🥜</Text>
                  <Text style={styles.superfoodName}>Nozes</Text>
                  <Text style={styles.superfoodBenefit}>Gorduras boas + Magnésio</Text>
                </View>
              </View>
              <View style={styles.superfoodsColumn}>
                <View style={styles.superfoodItem}>
                  <Text style={styles.superfoodEmoji}>🫐</Text>
                  <Text style={styles.superfoodName}>Mirtilo</Text>
                  <Text style={styles.superfoodBenefit}>Antioxidantes + Vitamina C</Text>
                </View>
                <View style={styles.superfoodItem}>
                  <Text style={styles.superfoodEmoji}>🐟</Text>
                  <Text style={styles.superfoodName}>Salmão</Text>
                  <Text style={styles.superfoodBenefit}>Ômega-3 + Proteína</Text>
                </View>
                <View style={styles.superfoodItem}>
                  <Text style={styles.superfoodEmoji}>🍠</Text>
                  <Text style={styles.superfoodName}>Batata Doce</Text>
                  <Text style={styles.superfoodBenefit}>Carboidrato + Beta-caroteno</Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Seasonal Nutrition Section */}
        <Animated.View style={[styles.sectionContainer, { opacity: fadeAnim }]}>
          <View style={[styles.sectionCard, { backgroundColor: colors.surfaceElevated }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: '#FFA726' }]}>
                <Leaf color="white" size={24} />
              </View>
              <Text style={styles.sectionTitle}>Nutrição Sazonal</Text>
            </View>
            <Text style={styles.sectionDescription}>
              Adapte sua alimentação às estações do ano para máximo benefício.
            </Text>
            <View style={styles.seasonalGrid}>
              <View style={styles.seasonalColumn}>
                <View style={styles.seasonItem}>
                  <Text style={styles.seasonEmoji}>🌸</Text>
                  <Text style={styles.seasonName}>Primavera</Text>
                  <Text style={styles.seasonFoods}>Aspargos, ervilhas, morangos</Text>
                </View>
                <View style={styles.seasonItem}>
                  <Text style={styles.seasonEmoji}>🍂</Text>
                  <Text style={styles.seasonName}>Outono</Text>
                  <Text style={styles.seasonFoods}>Abóbora, maçã, castanhas</Text>
                </View>
              </View>
              <View style={styles.seasonalColumn}>
                <View style={styles.seasonItem}>
                  <Text style={styles.seasonEmoji}>☀️</Text>
                  <Text style={styles.seasonName}>Verão</Text>
                  <Text style={styles.seasonFoods}>Melancia, tomate, pepino</Text>
                </View>
                <View style={styles.seasonItem}>
                  <Text style={styles.seasonEmoji}>❄️</Text>
                  <Text style={styles.seasonName}>Inverno</Text>
                  <Text style={styles.seasonFoods}>Couve, laranja, gengibre</Text>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* General Tips Section */}
        <Animated.View style={[styles.generalTipsContainer, { opacity: fadeAnim }]}>
          <View style={[styles.generalTipsCard, { backgroundColor: colors.surfaceElevated }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: '#42A5F5' }]}>
                <Lightbulb color="white" size={24} />
              </View>
              <Text style={styles.generalTipsTitle}>Dicas Essenciais</Text>
            </View>
            <View style={styles.generalTipsList}>
              <Text style={styles.generalTip}>🍽️ Faça 5-6 refeições pequenas ao invés de 3 grandes</Text>
              <Text style={styles.generalTip}>🌈 Inclua pelo menos 5 cores diferentes no seu prato</Text>
              <Text style={styles.generalTip}>⏰ Evite comer 3 horas antes de dormir</Text>
              <Text style={styles.generalTip}>🥗 Comece sempre pelas saladas e vegetais</Text>
              <Text style={styles.generalTip}>🧘 Mastigue devagar e saboreie cada garfada</Text>
              <Text style={styles.generalTip}>📱 Evite distrações durante as refeições</Text>
              <Text style={styles.generalTip}>🏃‍♀️ Caminhe 10 minutos após as refeições principais</Text>
              <Text style={styles.generalTip}>📊 Monitore como os alimentos afetam seu humor e energia</Text>
            </View>
          </View>
        </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

