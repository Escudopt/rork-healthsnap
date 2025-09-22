import React, { useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  Animated,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { 
  ArrowLeft, 
  Star, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Zap,
  Shield,
  Heart,
  Brain,
  Eye,
  Bone,
  Activity
} from 'lucide-react-native';
import { BlurCard } from '@/components/BlurCard';
import { useTheme, useThemedStyles } from '@/providers/ThemeProvider';
import { HealthyFood } from '@/types/food';

const healthyFoodsData: HealthyFood[] = [
  {
    id: '1',
    name: 'Abacate',
    calories: 160,
    protein: 2.0,
    carbs: 8.5,
    fat: 14.7,
    portion: '100g',
    benefits: ['Rico em gorduras boas', 'Fonte de fibras', 'Vitamina K'],
    category: 'Frutas',
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&h=300&fit=crop',
    rating: 4.8,
    description: 'Excelente fonte de gorduras monoinsaturadas saudáveis',
    advantages: [
      'Rico em gorduras monoinsaturadas que ajudam a reduzir o colesterol ruim',
      'Fonte excelente de fibras que promovem saciedade',
      'Contém potássio que ajuda a regular a pressão arterial',
      'Rico em folato, importante para formação de células',
      'Contém luteína e zeaxantina, antioxidantes que protegem os olhos',
      'Ajuda na absorção de vitaminas lipossolúveis (A, D, E, K)'
    ],
    disadvantages: [
      'Alto teor calórico pode contribuir para ganho de peso se consumido em excesso',
      'Pode causar reações alérgicas em pessoas sensíveis ao látex',
      'Rico em histamina, pode causar problemas em pessoas com intolerância',
      'Pode interferir com medicamentos anticoagulantes devido à vitamina K'
    ],
    nutritionalHighlights: {
      vitamins: ['Vitamina K', 'Folato', 'Vitamina C', 'Vitamina E'],
      minerals: ['Potássio', 'Magnésio', 'Cobre'],
      compounds: ['Ácido oleico', 'Luteína', 'Zeaxantina', 'Beta-sitosterol']
    },
    bestTimeToEat: 'Manhã ou tarde, evitar à noite devido ao alto teor calórico',
    preparationTips: [
      'Consuma maduro para melhor digestibilidade',
      'Adicione limão para evitar oxidação',
      'Combine com proteínas magras para refeições balanceadas',
      'Use em smoothies para textura cremosa'
    ],
    contraindications: ['Alergia ao látex', 'Uso de anticoagulantes', 'Intolerância à histamina']
  },
  {
    id: '2',
    name: 'Banana',
    calories: 89,
    protein: 1.1,
    carbs: 22.8,
    fat: 0.3,
    portion: '100g',
    benefits: ['Potássio', 'Vitamina B6', 'Energia rápida'],
    category: 'Frutas',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop',
    rating: 4.5,
    description: 'Rica em potássio e carboidratos para energia',
    advantages: [
      'Excelente fonte de potássio para saúde cardiovascular',
      'Rica em vitamina B6, essencial para função cerebral',
      'Fornece energia rápida através de açúcares naturais',
      'Contém fibras que ajudam na digestão',
      'Rica em antioxidantes que combatem radicais livres',
      'Ajuda a regular o humor através do triptofano'
    ],
    disadvantages: [
      'Alto índice glicêmico pode causar picos de açúcar no sangue',
      'Pode causar constipação se consumida verde',
      'Rica em frutose, pode ser problemática para pessoas com intolerância',
      'Pode interferir com alguns medicamentos devido ao potássio'
    ],
    nutritionalHighlights: {
      vitamins: ['Vitamina B6', 'Vitamina C', 'Folato'],
      minerals: ['Potássio', 'Magnésio', 'Manganês'],
      compounds: ['Dopamina', 'Triptofano', 'Pectina']
    },
    bestTimeToEat: 'Antes ou após exercícios, manhã para energia',
    preparationTips: [
      'Consuma madura para melhor digestão',
      'Combine com proteínas para estabilizar açúcar no sangue',
      'Use em smoothies pós-treino',
      'Congele para fazer "nice cream" saudável'
    ]
  },
  {
    id: '7',
    name: 'Salmão',
    calories: 208,
    protein: 25.4,
    carbs: 0.0,
    fat: 12.4,
    portion: '100g',
    benefits: ['Ômega-3', 'Proteína completa', 'Vitamina D'],
    category: 'Peixes',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
    rating: 4.9,
    description: 'Rico em ácidos graxos essenciais para o cérebro',
    advantages: [
      'Excelente fonte de ômega-3 EPA e DHA para saúde cerebral',
      'Proteína completa com todos os aminoácidos essenciais',
      'Rico em vitamina D, importante para ossos e imunidade',
      'Contém astaxantina, poderoso antioxidante',
      'Ajuda a reduzir inflamação no corpo',
      'Benéfico para saúde cardiovascular'
    ],
    disadvantages: [
      'Pode conter mercúrio, especialmente salmão selvagem',
      'Alto custo comparado a outras proteínas',
      'Salmão de cativeiro pode conter antibióticos e corantes',
      'Pode causar reações alérgicas em pessoas sensíveis a peixes'
    ],
    nutritionalHighlights: {
      vitamins: ['Vitamina D', 'Vitamina B12', 'Niacina', 'Vitamina B6'],
      minerals: ['Selênio', 'Fósforo', 'Potássio'],
      compounds: ['EPA', 'DHA', 'Astaxantina', 'Coenzima Q10']
    },
    bestTimeToEat: 'Almoço ou jantar, evitar cru se imunidade baixa',
    preparationTips: [
      'Prefira salmão selvagem quando possível',
      'Cozinhe até 63°C para segurança',
      'Tempere com ervas para potencializar antioxidantes',
      'Evite frituras para preservar ômega-3'
    ],
    contraindications: ['Alergia a peixes', 'Gravidez (limitar consumo)']
  }
];

export default function FoodDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const { colors, isDark } = useTheme();
  const { width: screenWidth } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  
  const food = healthyFoodsData.find(f => f.id === id);
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
  }, [fadeAnim, slideAnim]);
  
  const styles = useThemedStyles((colors, isDark) => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 100,
    },
    header: {
      position: 'relative',
      height: 300,
      overflow: 'hidden',
    },
    headerImage: {
      width: '100%',
      height: '100%',
    },
    headerGradient: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    headerContent: {
      position: 'absolute',
      top: insets.top + 20,
      left: 20,
      right: 20,
      bottom: 20,
      justifyContent: 'space-between',
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    backButton: {
      backgroundColor: 'rgba(0,0,0,0.3)',
      padding: 12,
      borderRadius: 20,
      backdropFilter: 'blur(10px)',
    },
    ratingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.3)',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 16,
      gap: 6,
    },
    ratingText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '700',
    },
    headerBottom: {
      alignItems: 'flex-start',
    },
    foodTitle: {
      fontSize: 32,
      fontWeight: '800',
      color: 'white',
      marginBottom: 8,
      textShadowColor: 'rgba(0,0,0,0.5)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 4,
    },
    foodCategory: {
      fontSize: 16,
      color: 'rgba(255,255,255,0.9)',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 12,
    },
    foodDescription: {
      fontSize: 16,
      color: 'rgba(255,255,255,0.9)',
      lineHeight: 22,
      maxWidth: '80%',
    },
    content: {
      padding: 20,
      gap: 24,
    },
    nutritionCard: {
      borderRadius: 20,
      padding: 20,
      overflow: 'hidden',
    },
    nutritionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
    },
    nutritionGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    nutritionItem: {
      flex: 1,
      minWidth: (screenWidth - 80) / 2,
      backgroundColor: colors.surfaceSecondary,
      padding: 16,
      borderRadius: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    nutritionValue: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.text,
      marginBottom: 4,
    },
    nutritionLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      textTransform: 'uppercase',
      fontWeight: '600',
      letterSpacing: 0.5,
    },
    sectionCard: {
      borderRadius: 20,
      padding: 20,
      overflow: 'hidden',
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    advantagesList: {
      gap: 12,
    },
    advantageItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      padding: 12,
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
    },
    advantageIcon: {
      marginTop: 2,
    },
    advantageText: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
    disadvantageItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      padding: 12,
      backgroundColor: 'rgba(255, 59, 48, 0.1)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(255, 59, 48, 0.2)',
    },
    disadvantageIcon: {
      marginTop: 2,
    },
    disadvantageText: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
    highlightsGrid: {
      gap: 16,
    },
    highlightCategory: {
      backgroundColor: colors.surfaceSecondary,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    highlightCategoryTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
    },
    highlightTags: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    highlightTag: {
      backgroundColor: colors.primary + '20',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.primary + '30',
    },
    highlightTagText: {
      fontSize: 12,
      color: colors.primary,
      fontWeight: '600',
    },
    timeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      backgroundColor: colors.surfaceSecondary,
      padding: 16,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
    },
    timeText: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
    tipsList: {
      gap: 8,
    },
    tipItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      paddingVertical: 4,
    },
    tipBullet: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.primary,
      marginTop: 7,
    },
    tipText: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
    notFoundContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    notFoundText: {
      fontSize: 18,
      color: colors.text,
      textAlign: 'center',
    },
  }));
  
  if (!food) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Alimento não encontrado</Text>
      </View>
    );
  }
  
  const getIconForBenefit = (benefit: string) => {
    if (!benefit || typeof benefit !== 'string' || benefit.trim().length === 0) {
      return <Shield color={colors.primary} size={16} />;
    }
    
    const lowerBenefit = benefit.toLowerCase().trim();
    if (lowerBenefit.includes('coração') || lowerBenefit.includes('cardiovascular')) {
      return <Heart color={colors.primary} size={16} />;
    }
    if (lowerBenefit.includes('cérebro') || lowerBenefit.includes('brain') || lowerBenefit.includes('mental')) {
      return <Brain color={colors.primary} size={16} />;
    }
    if (lowerBenefit.includes('olhos') || lowerBenefit.includes('visão')) {
      return <Eye color={colors.primary} size={16} />;
    }
    if (lowerBenefit.includes('ossos') || lowerBenefit.includes('cálcio')) {
      return <Bone color={colors.primary} size={16} />;
    }
    if (lowerBenefit.includes('energia') || lowerBenefit.includes('performance')) {
      return <Activity color={colors.primary} size={16} />;
    }
    return <Shield color={colors.primary} size={16} />;
  };
  

  
  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: false,
          presentation: 'card'
        }} 
      />
      <View style={styles.container}>
        {isDark && (
          <LinearGradient
            colors={[
              '#000000',
              '#0A0A0F',
              '#0F0F1A',
              '#1A1A2E',
            ]}
            style={StyleSheet.absoluteFillObject}
          />
        )}
        
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Image source={{ uri: food.image }} style={styles.headerImage} />
            <LinearGradient
              colors={['rgba(0,0,0,0.3)', 'transparent', 'rgba(0,0,0,0.8)']}
              style={styles.headerGradient}
            />
            
            <View style={styles.headerContent}>
              <View style={styles.headerTop}>
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={() => router.back()}
                  activeOpacity={0.8}
                >
                  <ArrowLeft color="white" size={24} />
                </TouchableOpacity>
                
                <View style={styles.ratingBadge}>
                  <Star color="#FFD700" size={16} fill="#FFD700" />
                  <Text style={styles.ratingText}>{food.rating}</Text>
                </View>
              </View>
              
              <View style={styles.headerBottom}>
                <Text style={styles.foodTitle}>{food.name}</Text>
                <Text style={styles.foodCategory}>{food.category}</Text>
                <Text style={styles.foodDescription}>{food.description}</Text>
              </View>
            </View>
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Nutrition Facts */}
            <BlurCard style={styles.nutritionCard}>
              <Text style={styles.nutritionTitle}>Informações Nutricionais</Text>
              <View style={styles.nutritionGrid}>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{food.calories}</Text>
                  <Text style={styles.nutritionLabel}>CALORIAS</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{food.protein}g</Text>
                  <Text style={styles.nutritionLabel}>PROTEÍNA</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{food.carbs}g</Text>
                  <Text style={styles.nutritionLabel}>CARBOIDRATOS</Text>
                </View>
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionValue}>{food.fat}g</Text>
                  <Text style={styles.nutritionLabel}>GORDURAS</Text>
                </View>
              </View>
            </BlurCard>
            
            {/* Advantages */}
            <BlurCard style={styles.sectionCard}>
              <View style={styles.sectionTitle}>
                <CheckCircle color="#34C759" size={24} />
                <Text style={styles.nutritionTitle}>Vantagens</Text>
              </View>
              <View style={styles.advantagesList}>
                {food.advantages.map((advantage, index) => (
                  <View key={`advantage-${food.id}-${index}`} style={styles.advantageItem}>
                    <View style={styles.advantageIcon}>
                      {getIconForBenefit(advantage)}
                    </View>
                    <Text style={styles.advantageText}>{advantage}</Text>
                  </View>
                ))}
              </View>
            </BlurCard>
            
            {/* Disadvantages */}
            <BlurCard style={styles.sectionCard}>
              <View style={styles.sectionTitle}>
                <XCircle color="#FF3B30" size={24} />
                <Text style={styles.nutritionTitle}>Desvantagens</Text>
              </View>
              <View style={styles.advantagesList}>
                {food.disadvantages.map((disadvantage, index) => (
                  <View key={`disadvantage-${food.id}-${index}`} style={styles.disadvantageItem}>
                    <View style={styles.disadvantageIcon}>
                      <XCircle color="#FF3B30" size={16} />
                    </View>
                    <Text style={styles.disadvantageText}>{disadvantage}</Text>
                  </View>
                ))}
              </View>
            </BlurCard>
            
            {/* Nutritional Highlights */}
            <BlurCard style={styles.sectionCard}>
              <View style={styles.sectionTitle}>
                <Zap color={colors.primary} size={24} />
                <Text style={styles.nutritionTitle}>Destaques Nutricionais</Text>
              </View>
              <View style={styles.highlightsGrid}>
                <View style={styles.highlightCategory}>
                  <Text style={styles.highlightCategoryTitle}>Vitaminas</Text>
                  <View style={styles.highlightTags}>
                    {food.nutritionalHighlights.vitamins.map((vitamin, index) => (
                      <View key={`vitamin-${food.id}-${index}`} style={styles.highlightTag}>
                        <Text style={styles.highlightTagText}>{vitamin}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                
                <View style={styles.highlightCategory}>
                  <Text style={styles.highlightCategoryTitle}>Minerais</Text>
                  <View style={styles.highlightTags}>
                    {food.nutritionalHighlights.minerals.map((mineral, index) => (
                      <View key={`mineral-${food.id}-${index}`} style={styles.highlightTag}>
                        <Text style={styles.highlightTagText}>{mineral}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                
                <View style={styles.highlightCategory}>
                  <Text style={styles.highlightCategoryTitle}>Compostos Ativos</Text>
                  <View style={styles.highlightTags}>
                    {food.nutritionalHighlights.compounds.map((compound, index) => (
                      <View key={`compound-${food.id}-${index}`} style={styles.highlightTag}>
                        <Text style={styles.highlightTagText}>{compound}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </BlurCard>
            
            {/* Best Time to Eat */}
            <BlurCard style={styles.sectionCard}>
              <View style={styles.sectionTitle}>
                <Clock color={colors.primary} size={24} />
                <Text style={styles.nutritionTitle}>Melhor Horário para Consumir</Text>
              </View>
              <View style={styles.timeCard}>
                <Clock color={colors.textSecondary} size={20} />
                <Text style={styles.timeText}>{food.bestTimeToEat}</Text>
              </View>
            </BlurCard>
            
            {/* Preparation Tips */}
            <BlurCard style={styles.sectionCard}>
              <View style={styles.sectionTitle}>
                <Shield color={colors.primary} size={24} />
                <Text style={styles.nutritionTitle}>Dicas de Preparo</Text>
              </View>
              <View style={styles.tipsList}>
                {food.preparationTips.map((tip, index) => (
                  <View key={`tip-${food.id}-${index}`} style={styles.tipItem}>
                    <View style={styles.tipBullet} />
                    <Text style={styles.tipText}>{tip}</Text>
                  </View>
                ))}
              </View>
            </BlurCard>
            
            {/* Contraindications */}
            {food.contraindications && food.contraindications.length > 0 && (
              <BlurCard style={styles.sectionCard}>
                <View style={styles.sectionTitle}>
                  <XCircle color="#FF9500" size={24} />
                  <Text style={styles.nutritionTitle}>Contraindicações</Text>
                </View>
                <View style={styles.tipsList}>
                  {food.contraindications.map((contraindication, index) => (
                    <View key={`contraindication-${food.id}-${index}`} style={styles.tipItem}>
                      <View style={[styles.tipBullet, { backgroundColor: '#FF9500' }]} />
                      <Text style={styles.tipText}>{contraindication}</Text>
                    </View>
                  ))}
                </View>
              </BlurCard>
            )}
          </Animated.View>
        </ScrollView>
      </View>
    </>
  );
}