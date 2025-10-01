import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
  StatusBar,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Target, Zap, Clock, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react-native';
import { BlurCard } from '@/components/BlurCard';
import { useTheme, useThemedStyles } from '@/providers/ThemeProvider';
import { useCalorieTracker } from '@/providers/CalorieTrackerProvider';
import { generateText } from '@rork/toolkit-sdk';

interface WorkoutPlan {
  title: string;
  description: string;
  duration: string;
  difficulty: 'Iniciante' | 'Intermediário' | 'Avançado';
  exercises: Exercise[];
  benefits: string[];
  caloriesBurn: string;
}

interface Exercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  instructions: string;
}

export default function SmartWorkoutScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const { colors, isDark } = useTheme();
  const { userProfile, healthMetrics } = useCalorieTracker();
  
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const generateWorkoutPlan = async () => {
    if (!userProfile) {
      Alert.alert(
        'Perfil Necessário',
        'Por favor, configure seu perfil na aba "Perfil" para receber um plano de treino personalizado.'
      );
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const prompt = `Você é um personal trainer profissional. Crie um plano de treino personalizado em português para:

Perfil do Usuário:
- Nome: ${userProfile.name}
- Idade: ${userProfile.age} anos
- Sexo: ${userProfile.gender === 'male' ? 'Masculino' : 'Feminino'}
- Peso: ${userProfile.weight} kg
- Altura: ${userProfile.height} cm
- Nível de atividade: ${userProfile.activityLevel}
- Objetivo: ${userProfile.goal === 'lose' ? 'Perder peso' : userProfile.goal === 'gain' ? 'Ganhar massa muscular' : 'Manter peso'}
${healthMetrics ? `- IMC: ${healthMetrics.bmi}
- TMB: ${healthMetrics.bmr} kcal/dia
- TDEE: ${healthMetrics.tdee} kcal/dia` : ''}

Crie um plano de treino completo seguindo EXATAMENTE este formato JSON (sem markdown, sem \`\`\`json):

{
  "title": "Nome do Plano de Treino",
  "description": "Descrição breve do plano (1-2 frases)",
  "duration": "30-45 min",
  "difficulty": "Iniciante" ou "Intermediário" ou "Avançado",
  "caloriesBurn": "200-300 kcal",
  "benefits": ["Benefício 1", "Benefício 2", "Benefício 3"],
  "exercises": [
    {
      "name": "Nome do Exercício",
      "sets": "3 séries",
      "reps": "12 repetições",
      "rest": "60 segundos",
      "instructions": "Instruções detalhadas de como executar"
    }
  ]
}

Inclua 6-8 exercícios variados. Seja específico e prático. Retorne APENAS o JSON, sem texto adicional.`;

      const response = await generateText({ messages: [{ role: 'user', content: prompt }] });
      
      console.log('🤖 AI Response:', response);
      
      let cleanedResponse = response.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
      }
      
      const parsedPlan = JSON.parse(cleanedResponse) as WorkoutPlan;
      
      if (!parsedPlan.title || !parsedPlan.exercises || parsedPlan.exercises.length === 0) {
        throw new Error('Plano de treino inválido recebido da IA');
      }
      
      setWorkoutPlan(parsedPlan);
      console.log('✅ Workout plan generated successfully');
      
    } catch (err) {
      console.error('❌ Error generating workout plan:', err);
      setError('Erro ao gerar plano de treino. Tente novamente.');
      
      const fallbackPlan: WorkoutPlan = {
        title: 'Treino Funcional Completo',
        description: 'Treino de corpo inteiro para iniciantes, focado em movimentos funcionais',
        duration: '30-40 min',
        difficulty: 'Iniciante',
        caloriesBurn: '200-250 kcal',
        benefits: ['Melhora condicionamento', 'Fortalece músculos', 'Queima calorias'],
        exercises: [
          {
            name: 'Agachamento Livre',
            sets: '3 séries',
            reps: '15 repetições',
            rest: '60 segundos',
            instructions: 'Pés na largura dos ombros, desça até 90 graus, mantenha as costas retas'
          },
          {
            name: 'Flexão de Braço',
            sets: '3 séries',
            reps: '10 repetições',
            rest: '60 segundos',
            instructions: 'Mãos na largura dos ombros, desça o corpo mantendo o core ativado'
          },
          {
            name: 'Prancha Abdominal',
            sets: '3 séries',
            reps: '30 segundos',
            rest: '45 segundos',
            instructions: 'Apoie antebraços e pés, mantenha corpo alinhado, contraia abdômen'
          },
          {
            name: 'Afundo Alternado',
            sets: '3 séries',
            reps: '12 repetições (cada perna)',
            rest: '60 segundos',
            instructions: 'Dê um passo à frente, desça até 90 graus, alterne as pernas'
          },
          {
            name: 'Burpee',
            sets: '3 séries',
            reps: '8 repetições',
            rest: '90 segundos',
            instructions: 'Agache, apoie as mãos, estenda as pernas, flexão, pule e levante'
          },
          {
            name: 'Mountain Climbers',
            sets: '3 séries',
            reps: '20 repetições',
            rest: '60 segundos',
            instructions: 'Posição de prancha, traga joelhos alternadamente ao peito rapidamente'
          }
        ]
      };
      
      setWorkoutPlan(fallbackPlan);
    } finally {
      setIsGenerating(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Iniciante':
        return '#4CAF50';
      case 'Intermediário':
        return '#FF9800';
      case 'Avançado':
        return '#F44336';
      default:
        return colors.primary;
    }
  };

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
    subtitle: {
      fontSize: 17,
      fontWeight: '400' as const,
      lineHeight: 22,
      opacity: 0.6,
    },
    content: {
      paddingHorizontal: 20,
    },
    generateButton: {
      marginBottom: 24,
      borderRadius: 20,
      overflow: 'hidden',
    },
    generateButtonGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 18,
      paddingHorizontal: 24,
      gap: 12,
    },
    generateButtonText: {
      fontSize: 18,
      fontWeight: '700' as const,
      color: 'white',
      letterSpacing: 0.3,
    },
    loadingContainer: {
      padding: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: colors.textSecondary,
      marginTop: 16,
      textAlign: 'center',
    },
    errorCard: {
      padding: 20,
      marginBottom: 20,
      borderRadius: 20,
      backgroundColor: isDark ? 'rgba(244, 67, 54, 0.15)' : 'rgba(244, 67, 54, 0.08)',
      borderWidth: 1.5,
      borderColor: isDark ? 'rgba(244, 67, 54, 0.3)' : 'rgba(244, 67, 54, 0.2)',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    errorText: {
      flex: 1,
      fontSize: 15,
      color: colors.textSecondary,
      lineHeight: 22,
    },
    planCard: {
      padding: 24,
      marginBottom: 20,
      borderRadius: 24,
      overflow: 'hidden',
    },
    planHeader: {
      marginBottom: 20,
    },
    planTitle: {
      fontSize: 28,
      fontWeight: '800' as const,
      color: colors.text,
      marginBottom: 8,
      letterSpacing: 0.3,
    },
    planDescription: {
      fontSize: 16,
      color: colors.textSecondary,
      lineHeight: 24,
      marginBottom: 16,
    },
    planMetrics: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 16,
    },
    metricChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surfaceSecondary,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 8,
    },
    metricText: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '600' as const,
    },
    difficultyBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 16,
      marginBottom: 16,
    },
    difficultyText: {
      fontSize: 13,
      fontWeight: '800' as const,
      color: 'white',
      textTransform: 'uppercase' as const,
      letterSpacing: 0.5,
    },
    benefitsSection: {
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700' as const,
      color: colors.text,
      marginBottom: 12,
      letterSpacing: 0.2,
    },
    benefitsList: {
      gap: 8,
    },
    benefitItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    benefitText: {
      flex: 1,
      fontSize: 15,
      color: colors.textSecondary,
      lineHeight: 22,
    },
    exercisesSection: {
      gap: 16,
    },
    exerciseCard: {
      padding: 20,
      borderRadius: 20,
      backgroundColor: colors.surfaceSecondary,
      borderWidth: 1,
      borderColor: colors.border,
    },
    exerciseHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 12,
    },
    exerciseNumber: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    exerciseNumberText: {
      fontSize: 14,
      fontWeight: '800' as const,
      color: 'white',
    },
    exerciseName: {
      flex: 1,
      fontSize: 18,
      fontWeight: '700' as const,
      color: colors.text,
      letterSpacing: 0.2,
    },
    exerciseDetails: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 12,
    },
    exerciseDetailChip: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
    },
    exerciseDetailText: {
      fontSize: 13,
      color: colors.textSecondary,
      fontWeight: '600' as const,
    },
    exerciseInstructions: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 20,
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
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: '#FF9800',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    noProfileTitle: {
      fontSize: 20,
      fontWeight: '700' as const,
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
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
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
                  Treino Inteligente
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  Planos personalizados gerados por IA
                </Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            {!userProfile ? (
              <BlurCard style={styles.noProfileCard}>
                <View style={styles.noProfileIcon}>
                  <Target color="white" size={32} />
                </View>
                <Text style={styles.noProfileTitle}>Configure seu Perfil</Text>
                <Text style={styles.noProfileText}>
                  Para receber um plano de treino personalizado, configure seu perfil na aba &ldquo;Perfil&rdquo; 
                  com suas informações de idade, peso, altura e objetivos.
                </Text>
              </BlurCard>
            ) : (
              <TouchableOpacity 
                style={styles.generateButton}
                onPress={generateWorkoutPlan}
                disabled={isGenerating}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#FF6B35', '#F7931E']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.generateButtonGradient}
                >
                  {isGenerating ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Sparkles color="white" size={24} strokeWidth={2.5} />
                  )}
                  <Text style={styles.generateButtonText}>
                    {isGenerating ? 'Gerando Plano...' : workoutPlan ? 'Gerar Novo Plano' : 'Gerar Plano de Treino'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {isGenerating && (
              <BlurCard style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>
                  Analisando seu perfil e criando{'\n'}um plano de treino personalizado...
                </Text>
              </BlurCard>
            )}

            {error && !isGenerating && (
              <View style={styles.errorCard}>
                <AlertCircle color="#F44336" size={24} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {workoutPlan && !isGenerating && (
              <BlurCard style={styles.planCard}>
                <View style={styles.planHeader}>
                  <Text style={styles.planTitle}>{workoutPlan.title}</Text>
                  <Text style={styles.planDescription}>{workoutPlan.description}</Text>
                  
                  <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(workoutPlan.difficulty) }]}>
                    <Text style={styles.difficultyText}>{workoutPlan.difficulty}</Text>
                  </View>
                  
                  <View style={styles.planMetrics}>
                    <View style={styles.metricChip}>
                      <Clock color={colors.textSecondary} size={16} />
                      <Text style={styles.metricText}>{workoutPlan.duration}</Text>
                    </View>
                    <View style={styles.metricChip}>
                      <Zap color={colors.textSecondary} size={16} />
                      <Text style={styles.metricText}>{workoutPlan.caloriesBurn}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.benefitsSection}>
                  <Text style={styles.sectionTitle}>Benefícios</Text>
                  <View style={styles.benefitsList}>
                    {workoutPlan.benefits.map((benefit, index) => (
                      <View key={index} style={styles.benefitItem}>
                        <CheckCircle2 color="#4CAF50" size={20} strokeWidth={2.5} />
                        <Text style={styles.benefitText}>{benefit}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                <View style={styles.exercisesSection}>
                  <Text style={styles.sectionTitle}>Exercícios</Text>
                  {workoutPlan.exercises.map((exercise, index) => (
                    <View key={index} style={styles.exerciseCard}>
                      <View style={styles.exerciseHeader}>
                        <View style={styles.exerciseNumber}>
                          <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                        </View>
                        <Text style={styles.exerciseName}>{exercise.name}</Text>
                      </View>
                      
                      <View style={styles.exerciseDetails}>
                        <View style={styles.exerciseDetailChip}>
                          <Text style={styles.exerciseDetailText}>{exercise.sets}</Text>
                        </View>
                        <View style={styles.exerciseDetailChip}>
                          <Text style={styles.exerciseDetailText}>{exercise.reps}</Text>
                        </View>
                        <View style={styles.exerciseDetailChip}>
                          <Text style={styles.exerciseDetailText}>Descanso: {exercise.rest}</Text>
                        </View>
                      </View>
                      
                      <Text style={styles.exerciseInstructions}>{exercise.instructions}</Text>
                    </View>
                  ))}
                </View>
              </BlurCard>
            )}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
