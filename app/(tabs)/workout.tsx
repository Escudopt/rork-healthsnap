import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Dumbbell, Zap, Target, TrendingUp, Clock, Flame, Award, ChevronRight, RefreshCw, Info, Repeat, Timer, AlertCircle } from 'lucide-react-native';
import { useCalorieTracker } from '@/providers/CalorieTrackerProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { BlurCard } from '@/components/BlurCard';


interface Exercise {
  name: string;
  sets: string;
  reps: string;
  rest: string;
  instructions: string;
}

interface WorkoutRecommendation {
  title: string;
  description: string;
  duration: string;
  intensity: 'Baixa' | 'Moderada' | 'Alta' | 'Muito Alta';
  caloriesBurn: string;
  exercises: Exercise[];
  benefits: string[];
  warmup: string[];
  cooldown: string[];
  tips: string[];
}

export default function WorkoutScreen() {
  const { userProfile, healthMetrics, todayCalories, dailyGoal } = useCalorieTracker();
  const { colors, isDark } = useTheme();
  const [recommendations, setRecommendations] = useState<WorkoutRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userMetrics = useMemo(() => {
    if (!userProfile || !healthMetrics) return null;

    return {
      age: userProfile.age,
      weight: userProfile.weight,
      height: userProfile.height,
      gender: userProfile.gender,
      activityLevel: userProfile.activityLevel,
      goal: userProfile.goal,
      bmi: healthMetrics.bmi,
      bmr: healthMetrics.bmr,
      tdee: healthMetrics.tdee,
      todayCalories,
      dailyGoal,
      calorieDeficit: dailyGoal - todayCalories,
    };
  }, [userProfile, healthMetrics, todayCalories, dailyGoal]);

  const generateWorkoutRecommendations = async () => {
    if (!userMetrics) {
      Alert.alert('Perfil Incompleto', 'Por favor, complete seu perfil primeiro na aba Perfil.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const prompt = `Você é um personal trainer profissional. Com base nas métricas do usuário, recomende 3 treinos personalizados DETALHADOS.

Métricas do Usuário:
- Idade: ${userMetrics.age} anos
- Peso: ${userMetrics.weight} kg
- Altura: ${userMetrics.height} cm
- Sexo: ${userMetrics.gender === 'male' ? 'Masculino' : 'Feminino'}
- Nível de Atividade: ${userMetrics.activityLevel}
- Objetivo: ${userMetrics.goal === 'lose' ? 'Perder peso' : userMetrics.goal === 'gain' ? 'Ganhar peso' : 'Manter peso'}
- IMC: ${userMetrics.bmi}
- TMB: ${userMetrics.bmr} kcal/dia
- TDEE: ${userMetrics.tdee} kcal/dia
- Calorias consumidas hoje: ${userMetrics.todayCalories} kcal
- Meta diária: ${userMetrics.dailyGoal} kcal

Forneça EXATAMENTE 3 recomendações de treino DETALHADAS em formato JSON válido:

[
  {
    "title": "Nome do Treino",
    "description": "Breve descrição (1 frase)",
    "duration": "30-45 min",
    "intensity": "Moderada",
    "caloriesBurn": "200-300 kcal",
    "exercises": [
      {
        "name": "Nome do Exercício",
        "sets": "3-4 séries",
        "reps": "10-12 repetições",
        "rest": "60 segundos",
        "instructions": "Instruções detalhadas de como executar o exercício corretamente"
      }
    ],
    "benefits": ["Benefício 1", "Benefício 2", "Benefício 3"],
    "warmup": ["Aquecimento 1", "Aquecimento 2", "Aquecimento 3"],
    "cooldown": ["Alongamento 1", "Alongamento 2"],
    "tips": ["Dica importante 1", "Dica importante 2"]
  }
]

IMPORTANTE:
- Intensity deve ser: "Baixa", "Moderada", "Alta" ou "Muito Alta"
- Adapte os treinos ao objetivo do usuário
- Considere o IMC e nível de atividade
- Seja específico e prático
- Inclua 4-6 exercícios por treino
- Forneça instruções detalhadas para cada exercício
- Inclua aquecimento e alongamento
- Retorne APENAS o JSON, sem texto adicional`;

      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      
      const data = await response.json();
      const aiResponse = data.completion;
      
      console.log('AI Response:', aiResponse);

      let jsonText = aiResponse.trim();
      if (jsonText.startsWith('```json')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```\n?/g, '');
      }

      const parsed = JSON.parse(jsonText);
      
      if (Array.isArray(parsed) && parsed.length > 0) {
        setRecommendations(parsed);
      } else {
        throw new Error('Formato de resposta inválido');
      }

    } catch (err) {
      console.error('Error generating workout recommendations:', err);
      setError('Não foi possível gerar recomendações. Tente novamente.');
      
      setRecommendations([
        {
          title: 'Caminhada Leve',
          description: 'Ideal para iniciantes e recuperação ativa',
          duration: '30-40 min',
          intensity: 'Baixa',
          caloriesBurn: '150-200 kcal',
          exercises: [
            {
              name: 'Caminhada em ritmo moderado',
              sets: 'Contínuo',
              reps: '30 minutos',
              rest: 'N/A',
              instructions: 'Mantenha um ritmo confortável onde você consegue conversar. Mantenha a postura ereta e balance os braços naturalmente.'
            },
            {
              name: 'Alongamento dinâmico',
              sets: '2 séries',
              reps: '10 repetições',
              rest: '30 segundos',
              instructions: 'Realize movimentos suaves e controlados. Foque em pernas, quadris e ombros.'
            }
          ],
          benefits: ['Melhora cardiovascular', 'Baixo impacto', 'Reduz estresse'],
          warmup: ['5 min de caminhada lenta', 'Rotação de tornozelos', 'Rotação de quadril'],
          cooldown: ['5 min de caminhada lenta', 'Alongamento de panturrilha', 'Alongamento de quadríceps'],
          tips: ['Use calçado adequado', 'Mantenha-se hidratado', 'Aumente gradualmente a intensidade']
        },
        {
          title: 'Treino HIIT',
          description: 'Alta intensidade para queima rápida de calorias',
          duration: '20-30 min',
          intensity: 'Alta',
          caloriesBurn: '300-400 kcal',
          exercises: [
            {
              name: 'Burpees',
              sets: '4 séries',
              reps: '10-15 repetições',
              rest: '45 segundos',
              instructions: 'Comece em pé, agache, apoie as mãos no chão, estenda as pernas para trás, faça uma flexão, volte à posição de agachamento e salte.'
            },
            {
              name: 'Mountain Climbers',
              sets: '4 séries',
              reps: '20 repetições',
              rest: '45 segundos',
              instructions: 'Em posição de prancha, traga alternadamente os joelhos em direção ao peito em movimento rápido.'
            },
            {
              name: 'Jump Squats',
              sets: '4 séries',
              reps: '12-15 repetições',
              rest: '60 segundos',
              instructions: 'Agache até as coxas ficarem paralelas ao chão, depois salte explosivamente. Aterrisse suavemente e repita.'
            },
            {
              name: 'High Knees',
              sets: '4 séries',
              reps: '30 segundos',
              rest: '45 segundos',
              instructions: 'Corra no lugar elevando os joelhos até a altura do quadril. Mantenha o core ativado e os braços em movimento.'
            }
          ],
          benefits: ['Queima calórica elevada', 'Melhora resistência', 'Acelera metabolismo'],
          warmup: ['Polichinelos - 2 min', 'Corrida estacionária - 2 min', 'Rotação de braços - 1 min'],
          cooldown: ['Caminhada leve - 3 min', 'Alongamento de pernas', 'Respiração profunda'],
          tips: ['Mantenha boa forma mesmo cansado', 'Respeite os intervalos', 'Hidrate-se bem']
        },
        {
          title: 'Musculação Funcional',
          description: 'Fortalecimento muscular com exercícios compostos',
          duration: '45-60 min',
          intensity: 'Moderada',
          caloriesBurn: '250-350 kcal',
          exercises: [
            {
              name: 'Agachamento',
              sets: '4 séries',
              reps: '12-15 repetições',
              rest: '90 segundos',
              instructions: 'Pés na largura dos ombros, desça até as coxas ficarem paralelas ao chão. Mantenha o peso nos calcanhares e o peito erguido.'
            },
            {
              name: 'Flexão de Braço',
              sets: '3 séries',
              reps: '10-15 repetições',
              rest: '60 segundos',
              instructions: 'Mãos na largura dos ombros, corpo reto da cabeça aos pés. Desça até o peito quase tocar o chão.'
            },
            {
              name: 'Prancha',
              sets: '3 séries',
              reps: '30-60 segundos',
              rest: '60 segundos',
              instructions: 'Apoie-se nos antebraços e pontas dos pés. Mantenha o corpo reto, core contraído e respire normalmente.'
            },
            {
              name: 'Remada com Peso',
              sets: '4 séries',
              reps: '12 repetições',
              rest: '75 segundos',
              instructions: 'Incline o tronco para frente, puxe o peso em direção ao abdômen, mantendo os cotovelos próximos ao corpo.'
            }
          ],
          benefits: ['Ganho de força', 'Tonificação muscular', 'Melhora postura'],
          warmup: ['Mobilidade articular - 5 min', 'Cardio leve - 5 min', 'Séries de aquecimento leves'],
          cooldown: ['Alongamento completo - 10 min', 'Foam roller', 'Respiração e relaxamento'],
          tips: ['Foque na técnica antes do peso', 'Progrida gradualmente', 'Descanse adequadamente entre treinos']
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userMetrics && recommendations.length === 0) {
      generateWorkoutRecommendations();
    }
  }, [userMetrics]);

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'Baixa':
        return '#4ECDC4';
      case 'Moderada':
        return '#FFD93D';
      case 'Alta':
        return '#FF6B6B';
      case 'Muito Alta':
        return '#C44569';
      default:
        return colors.primary;
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#000000' : '#FAFBFF',
    },
    safeArea: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 120,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 8,
      paddingBottom: 24,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '700' as const,
      color: colors.text,
      marginBottom: 4,
      letterSpacing: -0.5,
    },
    headerSubtitle: {
      fontSize: 15,
      fontWeight: '400' as const,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    metricsCard: {
      marginHorizontal: 20,
      marginBottom: 24,
      padding: 20,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.08,
      shadowRadius: isDark ? 4 : 8,
      elevation: isDark ? 2 : 3,
    },
    metricsTitle: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: colors.text,
      marginBottom: 16,
    },
    metricsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    metricItem: {
      width: '48%',
      padding: 14,
      borderRadius: 12,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
    },
    metricLabel: {
      fontSize: 11,
      fontWeight: '600' as const,
      color: colors.textSecondary,
      textTransform: 'uppercase' as const,
      letterSpacing: 0.5,
      marginBottom: 6,
    },
    metricValue: {
      fontSize: 20,
      fontWeight: '700' as const,
      color: colors.text,
      letterSpacing: -0.5,
    },
    refreshButton: {
      marginHorizontal: 20,
      marginBottom: 20,
      borderRadius: 16,
      overflow: 'hidden',
    },
    refreshButtonGradient: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      gap: 8,
    },
    refreshButtonText: {
      color: isDark ? '#000000' : '#FFFFFF',
      fontSize: 15,
      fontWeight: '600' as const,
      letterSpacing: 0.2,
    },
    loadingContainer: {
      padding: 60,
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 16,
      fontSize: 15,
      fontWeight: '500' as const,
      color: colors.textSecondary,
    },
    errorContainer: {
      marginHorizontal: 20,
      padding: 24,
      borderRadius: 16,
      backgroundColor: isDark ? 'rgba(255, 107, 107, 0.1)' : 'rgba(255, 107, 107, 0.05)',
      alignItems: 'center',
    },
    errorText: {
      fontSize: 15,
      fontWeight: '500' as const,
      color: '#FF6B6B',
      textAlign: 'center' as const,
      marginBottom: 16,
    },
    retryButton: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: '#FF6B6B',
    },
    retryButtonText: {
      color: 'white',
      fontSize: 14,
      fontWeight: '600' as const,
    },
    recommendationsSection: {
      paddingHorizontal: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700' as const,
      color: colors.text,
      marginBottom: 16,
      letterSpacing: -0.3,
    },
    workoutCard: {
      marginBottom: 16,
      borderRadius: 20,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.08,
      shadowRadius: isDark ? 4 : 8,
      elevation: isDark ? 2 : 3,
    },
    workoutCardGradient: {
      padding: 20,
    },
    workoutHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    workoutTitle: {
      flex: 1,
      fontSize: 18,
      fontWeight: '700' as const,
      color: colors.text,
      marginBottom: 6,
      letterSpacing: -0.3,
    },
    intensityBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      marginLeft: 12,
    },
    intensityText: {
      color: 'white',
      fontSize: 11,
      fontWeight: '700' as const,
      textTransform: 'uppercase' as const,
      letterSpacing: 0.5,
    },
    workoutDescription: {
      fontSize: 14,
      fontWeight: '400' as const,
      color: colors.textSecondary,
      lineHeight: 20,
      marginBottom: 16,
    },
    workoutStats: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 16,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    statText: {
      fontSize: 13,
      fontWeight: '600' as const,
      color: colors.text,
    },
    exercisesSection: {
      marginBottom: 16,
    },
    sectionLabel: {
      fontSize: 13,
      fontWeight: '700' as const,
      color: colors.text,
      textTransform: 'uppercase' as const,
      letterSpacing: 0.5,
      marginBottom: 10,
    },
    exerciseItem: {
      marginBottom: 16,
      padding: 14,
      borderRadius: 12,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
    },
    exerciseName: {
      fontSize: 15,
      fontWeight: '700' as const,
      color: colors.text,
      marginBottom: 8,
    },
    exerciseDetails: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 8,
    },
    exerciseDetailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    exerciseDetailText: {
      fontSize: 12,
      fontWeight: '600' as const,
      color: colors.textSecondary,
    },
    exerciseInstructions: {
      fontSize: 13,
      fontWeight: '400' as const,
      color: colors.textSecondary,
      lineHeight: 18,
      marginTop: 4,
    },
    exerciseBullet: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.primary,
    },
    exerciseText: {
      flex: 1,
      fontSize: 14,
      fontWeight: '500' as const,
      color: colors.text,
    },
    simpleListItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 8,
    },
    benefitsSection: {
      marginBottom: 8,
    },
    benefitItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      gap: 8,
    },
    benefitText: {
      flex: 1,
      fontSize: 14,
      fontWeight: '500' as const,
      color: colors.textSecondary,
    },
    emptyState: {
      padding: 40,
      alignItems: 'center',
      marginHorizontal: 20,
      borderRadius: 20,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
    },
    emptyIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    emptyTitle: {
      fontSize: 17,
      fontWeight: '600' as const,
      color: colors.text,
      textAlign: 'center' as const,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 15,
      fontWeight: '400' as const,
      color: colors.textSecondary,
      textAlign: 'center' as const,
      maxWidth: 280,
      lineHeight: 20,
    },
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isDark ? [
          '#000000',
          '#0A0A0B',
          '#1C1C1E',
          '#2C2C2E'
        ] : [
          '#FAFBFF',
          '#F8F9FE',
          '#F2F4F8',
          '#EBEEF5'
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
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Treino Inteligente</Text>
            <Text style={styles.headerSubtitle}>
              Recomendações personalizadas baseadas nas suas métricas
            </Text>
          </View>

          {userMetrics && (
            <BlurCard variant="default" style={styles.metricsCard}>
              <Text style={styles.metricsTitle}>Suas Métricas</Text>
              <View style={styles.metricsGrid}>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>IMC</Text>
                  <Text style={styles.metricValue}>{userMetrics.bmi}</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>TMB</Text>
                  <Text style={styles.metricValue}>{userMetrics.bmr}</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Idade</Text>
                  <Text style={styles.metricValue}>{userMetrics.age}</Text>
                </View>
                <View style={styles.metricItem}>
                  <Text style={styles.metricLabel}>Peso</Text>
                  <Text style={styles.metricValue}>{userMetrics.weight}kg</Text>
                </View>
              </View>
            </BlurCard>
          )}

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={generateWorkoutRecommendations}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.refreshButtonGradient}
            >
              <RefreshCw color={isDark ? '#000000' : '#FFFFFF'} size={18} strokeWidth={2.5} />
              <Text style={styles.refreshButtonText}>
                {isLoading ? 'Gerando...' : 'Gerar Novos Treinos'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={styles.loadingText}>Gerando treinos personalizados...</Text>
            </View>
          )}

          {error && !isLoading && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={generateWorkoutRecommendations}
                activeOpacity={0.8}
              >
                <Text style={styles.retryButtonText}>Tentar Novamente</Text>
              </TouchableOpacity>
            </View>
          )}

          {!isLoading && !error && recommendations.length === 0 && !userMetrics && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Target color={colors.textTertiary} size={40} strokeWidth={1.5} />
              </View>
              <Text style={styles.emptyTitle}>Complete seu perfil</Text>
              <Text style={styles.emptySubtitle}>
                Para receber recomendações personalizadas, complete seu perfil na aba Perfil
              </Text>
            </View>
          )}

          {!isLoading && recommendations.length > 0 && (
            <View style={styles.recommendationsSection}>
              <Text style={styles.sectionTitle}>Treinos Recomendados</Text>
              
              {recommendations.map((workout, index) => (
                <BlurCard key={index} variant="default" style={styles.workoutCard}>
                  <View style={styles.workoutCardGradient}>
                    <View style={styles.workoutHeader}>
                      <Text style={styles.workoutTitle}>{workout.title}</Text>
                      <View 
                        style={[
                          styles.intensityBadge, 
                          { backgroundColor: getIntensityColor(workout.intensity) }
                        ]}
                      >
                        <Text style={styles.intensityText}>{workout.intensity}</Text>
                      </View>
                    </View>

                    <Text style={styles.workoutDescription}>{workout.description}</Text>

                    <View style={styles.workoutStats}>
                      <View style={styles.statItem}>
                        <Clock color={colors.primary} size={16} strokeWidth={2} />
                        <Text style={styles.statText}>{workout.duration}</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Flame color={colors.primary} size={16} strokeWidth={2} />
                        <Text style={styles.statText}>{workout.caloriesBurn}</Text>
                      </View>
                    </View>

                    {workout.warmup && workout.warmup.length > 0 && (
                      <View style={styles.exercisesSection}>
                        <Text style={styles.sectionLabel}>🔥 Aquecimento</Text>
                        {workout.warmup.map((item, idx) => (
                          <View key={idx} style={styles.simpleListItem}>
                            <View style={styles.exerciseBullet} />
                            <Text style={styles.exerciseText}>{item}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    <View style={styles.exercisesSection}>
                      <Text style={styles.sectionLabel}>💪 Exercícios</Text>
                      {workout.exercises.map((exercise, idx) => (
                        <View key={idx} style={styles.exerciseItem}>
                          <Text style={styles.exerciseName}>{exercise.name}</Text>
                          <View style={styles.exerciseDetails}>
                            <View style={styles.exerciseDetailItem}>
                              <Repeat color={colors.primary} size={14} strokeWidth={2} />
                              <Text style={styles.exerciseDetailText}>{exercise.sets}</Text>
                            </View>
                            <View style={styles.exerciseDetailItem}>
                              <Target color={colors.primary} size={14} strokeWidth={2} />
                              <Text style={styles.exerciseDetailText}>{exercise.reps}</Text>
                            </View>
                            <View style={styles.exerciseDetailItem}>
                              <Timer color={colors.primary} size={14} strokeWidth={2} />
                              <Text style={styles.exerciseDetailText}>{exercise.rest}</Text>
                            </View>
                          </View>
                          <Text style={styles.exerciseInstructions}>{exercise.instructions}</Text>
                        </View>
                      ))}
                    </View>

                    {workout.cooldown && workout.cooldown.length > 0 && (
                      <View style={styles.exercisesSection}>
                        <Text style={styles.sectionLabel}>🧘 Alongamento</Text>
                        {workout.cooldown.map((item, idx) => (
                          <View key={idx} style={styles.simpleListItem}>
                            <View style={styles.exerciseBullet} />
                            <Text style={styles.exerciseText}>{item}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {workout.tips && workout.tips.length > 0 && (
                      <View style={styles.exercisesSection}>
                        <Text style={styles.sectionLabel}>💡 Dicas Importantes</Text>
                        {workout.tips.map((tip, idx) => (
                          <View key={idx} style={styles.simpleListItem}>
                            <AlertCircle color={colors.primary} size={14} strokeWidth={2} />
                            <Text style={styles.exerciseText}>{tip}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    <View style={styles.benefitsSection}>
                      <Text style={styles.sectionLabel}>Benefícios</Text>
                      {workout.benefits.map((benefit, idx) => (
                        <View key={idx} style={styles.benefitItem}>
                          <Award color={colors.primary} size={14} strokeWidth={2} />
                          <Text style={styles.benefitText}>{benefit}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </BlurCard>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
