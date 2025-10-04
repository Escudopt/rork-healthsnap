import React, { useRef, useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Platform,
  Animated,
  Alert,
  TextInput,
  Modal,
  FlatList,
  StatusBar,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, TrendingUp, Calendar, Hash, X, User, History, Clock, Camera, RotateCcw, Settings, Sparkles, Zap, Award, Target, Star, Flame, Trophy, CheckCircle, Heart, Activity, Info } from 'lucide-react-native';
import { FloatingAIChat } from '@/components/FloatingAIChat';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useCalorieTracker } from '@/providers/CalorieTrackerProvider';
import { useTheme, useThemedStyles } from '@/providers/ThemeProvider';
import { useLanguage } from '@/providers/LanguageProvider';
import { BlurCard } from '@/components/BlurCard';
import { CalorieProgressBar } from '@/components/CalorieProgressBar';
import { MealCard } from '@/components/MealCard';
import { MacroChart } from '@/components/MacroChart';
import { MacroWidget } from '@/components/MacroWidget';
import { Meal } from '@/types/food';
import * as Haptics from 'expo-haptics';

const { width: screenWidth } = Dimensions.get('window');


export default function HomeScreen() {
  const { meals, todayCalories, weeklyAverage, dailyGoal, isLoading, resetData, addManualCalories, setDailyGoal, userProfile, healthMetrics } = useCalorieTracker();
  const { colors, isDark, getTypographyStyle } = useTheme();
  const { t } = useLanguage();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const headerSlideAnim = useRef(new Animated.Value(-50)).current;
  const statsSlideAnim = useRef(new Animated.Value(50)).current;
  const floatingAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnim = useRef(new Animated.Value(0)).current;
  const motivationAnim = useRef(new Animated.Value(0)).current;
  
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualCalories, setManualCalories] = useState('');
  const [manualDescription, setManualDescription] = useState('');
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalInput, setGoalInput] = useState('');
  const [activeTab, setActiveTab] = useState<'today' | 'history'>('today');
  const [selectedHistoryDate, setSelectedHistoryDate] = useState<string | null>(null);
  const [showQuickGoals, setShowQuickGoals] = useState(false);

  useEffect(() => {
    // Staggered entrance animations
    Animated.stagger(150, [
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(headerSlideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(statsSlideAnim, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Floating animation for add button
    const startFloating = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatingAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(floatingAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    // Sparkle animation
    const startSparkle = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(sparkleAnim, {
            toValue: 1,
            duration: 3000,
            useNativeDriver: true,
          }),
          Animated.timing(sparkleAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    // Motivation pulse
    const startMotivationPulse = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(motivationAnim, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(motivationAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };
    
    setTimeout(startFloating, 1000);
    setTimeout(startSparkle, 1500);
    setTimeout(startMotivationPulse, 2000);
  }, [fadeAnim, scaleAnim, headerSlideAnim, statsSlideAnim, floatingAnim, sparkleAnim, motivationAnim]);

  const handleCameraPress = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    Alert.alert(
      'Adicionar Refeição',
      'Como você deseja adicionar sua refeição?',
      [
        {
          text: 'Câmera',
          onPress: async () => {
            try {
              const permission = await ImagePicker.requestCameraPermissionsAsync();
              if (!permission.granted) {
                Alert.alert(
                  'Permissão Necessária',
                  'Precisamos de acesso à câmera para tirar fotos dos alimentos.',
                  [{ text: 'OK' }]
                );
                return;
              }

              const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.5, // Reduzido para 0.5 para processamento mais rápido
                base64: true,
                exif: false,
              });

              if (!result.canceled && result.assets[0].base64) {
                console.log('Image captured, navigating immediately...');
                // Navegar imediatamente sem delay
                router.push({
                  pathname: '/analysis',
                  params: { imageBase64: result.assets[0].base64 },
                });
              }
            } catch (error) {
              console.error('Camera error:', error);
              Alert.alert(
                'Erro na Câmera',
                'Não foi possível acessar a câmera. Tente novamente.',
                [{ text: 'OK' }]
              );
            }
          },
        },
        {
          text: 'Galeria',
          onPress: async () => {
            try {
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.5, // Reduzido para 0.5 para processamento mais rápido
                base64: true,
                exif: false,
              });

              if (!result.canceled && result.assets[0].base64) {
                console.log('Image selected, navigating immediately...');
                // Navegar imediatamente sem delay
                router.push({
                  pathname: '/analysis',
                  params: { imageBase64: result.assets[0].base64 },
                });
              }
            } catch (error) {
              console.error('Gallery error:', error);
              Alert.alert(
                'Erro na Galeria',
                'Não foi possível acessar a galeria. Tente novamente.',
                [{ text: 'OK' }]
              );
            }
          },
        },
        {
          text: 'Cancelar',
          style: 'cancel',
        },
      ]
    );
  };

  // Get today's meals using the same logic as the provider
  const todayMeals = useMemo(() => {
    const today = new Date();
    const todayDateString = today.toDateString();
    
    return meals.filter(meal => {
      if (!meal.timestamp) return false;
      const mealDate = new Date(meal.timestamp);
      return mealDate.toDateString() === todayDateString;
    });
  }, [meals]);

  // Get today's foods for macro analysis
  const todayFoods = useMemo(() => {
    return todayMeals.flatMap(meal => meal.foods || []);
  }, [todayMeals]);

  // Group meals by date for history view
  const dailyMealsHistory = useMemo(() => {
    const grouped: { [key: string]: { date: string; dateString: string; meals: Meal[]; totalCalories: number; } } = {};
    const today = new Date().toDateString();

    meals.forEach(meal => {
      if (!meal?.timestamp || !meal.id) return;
      
      try {
        const mealDate = new Date(meal.timestamp);
        const dateString = mealDate.toDateString();
        
        // Skip today's meals as they're shown in the today tab
        if (dateString === today) return;
        
        if (!grouped[dateString]) {
          grouped[dateString] = {
            date: mealDate.toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }),
            dateString,
            meals: [],
            totalCalories: 0
          };
        }
        
        grouped[dateString].meals.push(meal);
        grouped[dateString].totalCalories += meal.totalCalories || 0;
      } catch (error) {
        console.error('Error processing meal date:', error);
      }
    });

    // Convert to array and sort by date (most recent first)
    return Object.values(grouped).sort((a, b) => 
      new Date(b.dateString).getTime() - new Date(a.dateString).getTime()
    );
  }, [meals]);

  const selectedDayData = useMemo(() => {
    if (!selectedHistoryDate) return null;
    return dailyMealsHistory.find(day => day.dateString === selectedHistoryDate);
  }, [selectedHistoryDate, dailyMealsHistory]);

  const handleManualSubmit = async () => {
    try {
      const calories = parseInt(manualCalories);
      if (isNaN(calories) || calories <= 0) {
        Alert.alert('Erro', 'Por favor, insira um número válido de calorias.');
        return;
      }
      
      const description = manualDescription.trim() || 'Entrada Manual';
      await addManualCalories(calories, description);
      
      setManualCalories('');
      setManualDescription('');
      setShowManualModal(false);
      
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      Alert.alert('Sucesso', `${calories} calorias adicionadas com sucesso!`);
    } catch (error) {
      console.error('Error adding manual calories:', error);
      Alert.alert('Erro', 'Não foi possível adicionar as calorias. Tente novamente.');
    }
  };

  const handleGoalSubmit = async () => {
    try {
      const goal = parseInt(goalInput);
      if (isNaN(goal) || goal <= 0) {
        Alert.alert('Erro', 'Por favor, insira uma meta válida de calorias.');
        return;
      }
      
      await setDailyGoal(goal);
      setGoalInput('');
      setShowGoalModal(false);
      setShowQuickGoals(false);
      
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      Alert.alert('Sucesso', `Meta diária definida para ${goal} calorias!`);
    } catch (error) {
      console.error('Error setting daily goal:', error);
      Alert.alert('Erro', 'Não foi possível definir a meta. Tente novamente.');
    }
  };

  const handleQuickGoal = async (goal: number) => {
    try {
      await setDailyGoal(goal);
      setShowQuickGoals(false);
      
      if (Platform.OS !== 'web') {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      
      Alert.alert('Sucesso', `Meta diária definida para ${goal} calorias!`);
    } catch (error) {
      console.error('Error setting quick goal:', error);
      Alert.alert('Erro', 'Não foi possível definir a meta. Tente novamente.');
    }
  };

  const handleGoalPress = () => {
    setShowQuickGoals(true);
  };

  const handleResetPress = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    Alert.alert(
      'Resetar Dados',
      'Tem certeza que deseja resetar todos os dados? Esta ação não pode ser desfeita.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Resetar',
          style: 'destructive',
          onPress: async () => {
            try {
              await resetData();
              if (Platform.OS !== 'web') {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              Alert.alert('Sucesso', 'Todos os dados foram resetados!');
            } catch (error) {
              console.error('Error resetting data:', error);
              Alert.alert('Erro', 'Não foi possível resetar os dados. Tente novamente.');
            }
          },
        },
      ]
    );
  };

  const renderHistoryDayItem = ({ item }: { item: typeof dailyMealsHistory[0] }) => {
    const progressPercentage = Math.min((item.totalCalories / dailyGoal) * 100, 100);
    const isOverGoal = item.totalCalories > dailyGoal;
    
    return (
      <TouchableOpacity
        onPress={() => setSelectedHistoryDate(item.dateString)}
        activeOpacity={0.8}
      >
        <BlurCard variant="default" style={styles.historyDayCard}>
          <View style={styles.historyDayHeader}>
            <View style={styles.historyDayInfo}>
              <Text style={styles.historyDayDate}>{item.date}</Text>
              <Text style={styles.historyDayStats}>
                {item.meals.length} refeições • {item.totalCalories} kcal
              </Text>
            </View>
            <View style={styles.historyDayCalories}>
              <Text style={[styles.historyCalorieValue, isOverGoal && styles.overGoal]}>
                {item.totalCalories}
              </Text>
              <Text style={styles.historyCalorieUnit}>kcal</Text>
            </View>
          </View>
          
          <View style={styles.historyProgressContainer}>
            <View style={styles.historyProgressBar}>
              <View 
                style={[
                  styles.historyProgressFill,
                  {
                    width: `${progressPercentage}%`,
                    backgroundColor: isOverGoal ? '#FF6B6B' : '#4ECDC4'
                  }
                ]} 
              />
            </View>
            <Text style={styles.historyProgressText}>
              {Math.round(progressPercentage)}% da meta
            </Text>
          </View>
        </BlurCard>
      </TouchableOpacity>
    );
  };

  const renderTabContent = () => {
    if (selectedHistoryDate && selectedDayData) {
      return (
        <View style={styles.selectedDayView}>
          <View style={styles.selectedDayHeader}>
            <TouchableOpacity
              onPress={() => setSelectedHistoryDate(null)}
              style={styles.backToHistoryButton}
            >
              <Text style={styles.backToHistoryText}>← Voltar ao Histórico</Text>
            </TouchableOpacity>
            <Text style={styles.selectedDayTitle}>{selectedDayData.date}</Text>
            <Text style={styles.selectedDaySubtitle}>
              {selectedDayData.meals.length} refeições • {selectedDayData.totalCalories} kcal
            </Text>
          </View>
          
          <ScrollView showsVerticalScrollIndicator={false}>
            {selectedDayData.meals.map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))}
          </ScrollView>
        </View>
      );
    }

    if (activeTab === 'today') {
      return (
        <>
          {isLoading ? (
            <BlurCard style={styles.loadingCard}>
              <Text style={styles.loadingText}>Carregando refeições...</Text>
            </BlurCard>
          ) : todayMeals.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.surfaceElevated }]}>
              <LinearGradient
                colors={[colors.primary + '10', colors.primary + '05']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.emptyStateGradient}
              >
                <Animated.View style={[
                  styles.emptyIcon, 
                  { 
                    backgroundColor: colors.surfaceSecondary,
                    transform: [{
                      scale: motivationAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [1, 1.1, 1],
                      })
                    }]
                  }
                ]}>
                  <Target color={colors.primary} size={48} strokeWidth={1.5} />
                </Animated.View>
                <Text style={[styles.emptyTitle, { color: colors.text }]}>
                  Pronto para começar?
                </Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  Toque no botão ✨ para adicionar sua primeira refeição e começar a acompanhar seus objetivos
                </Text>
                <View style={styles.emptyActions}>
                  <TouchableOpacity
                    style={[styles.emptyActionButton, { backgroundColor: colors.primary + '15' }]}
                    onPress={handleCameraPress}
                    activeOpacity={0.8}
                  >
                    <Camera color={colors.primary} size={16} strokeWidth={2} />
                    <Text style={[styles.emptyActionText, { color: colors.primary }]}>Adicionar Refeição</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          ) : (
            todayMeals.map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))
          )}
        </>
      );
    }

    // History tab
    return (
      <>
        {dailyMealsHistory.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.surfaceElevated }]}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceSecondary }]}>
              <Clock color={colors.textTertiary} size={48} strokeWidth={1.5} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Nenhum histórico encontrado
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Suas refeições dos dias anteriores aparecerão aqui
            </Text>
          </View>
        ) : (
          <FlatList
            data={dailyMealsHistory}
            renderItem={renderHistoryDayItem}
            keyExtractor={(item) => item.dateString}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
          />
        )}
      </>
    );
  };

  const styles = useThemedStyles((colors, isDark) => createStyles(colors, isDark));

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isDark ? [
          '#0B0B0C',
          '#0F1A2B',
          '#0B0B0C'
        ] : [
          '#FAFBFF',
          '#F8F9FE',
          '#F2F4F8'
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
          <Animated.View style={[
            styles.header, 
            { 
              opacity: fadeAnim,
              transform: [{ translateY: headerSlideAnim }]
            }
          ]}>
            <View style={styles.headerTop}>
              <View style={styles.headerLeft}>
                <View style={styles.greetingContainer}>
                  <Text style={[styles.greeting, { color: colors.text }]}>
                    Resumo
                  </Text>
                  <Animated.View style={[
                    styles.sparkleIcon,
                    {
                      opacity: sparkleAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.4, 1, 0.4],
                      }),
                      transform: [{
                        rotate: sparkleAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '180deg'],
                        })
                      }]
                    }
                  ]}>
                    <Sparkles color={colors.primary} size={20} strokeWidth={2} />
                  </Animated.View>
                </View>
                <Text style={[styles.date, { color: colors.textSecondary }]}>
                  {new Date().toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </Text>

              </View>
              <View style={styles.headerButtons}>
                <FloatingAIChat isHeaderButton={true} />
                <TouchableOpacity
                  onPress={() => router.push('/(tabs)/settings')}
                  style={[styles.headerIconButton, { backgroundColor: colors.surfaceElevated }]}
                  activeOpacity={0.6}
                >
                  <Settings color={colors.textSecondary} size={16} strokeWidth={2} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push('/profile')}
                  style={[styles.headerIconButton, { backgroundColor: colors.surfaceElevated }]}
                  activeOpacity={0.6}
                >
                  <User color={colors.textSecondary} size={16} strokeWidth={2} />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>

          <Animated.View style={[
            styles.statsContainer,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: statsSlideAnim }
              ]
            }
          ]}>
            <View style={styles.mainContentContainer}>
              <CalorieProgressBar 
                currentCalories={todayCalories}
                dailyGoal={dailyGoal}
                onGoalPress={handleGoalPress}
                onCameraPress={handleCameraPress}
              />
              
              {/* Enhanced Achievement Badge */}
              {todayCalories >= dailyGoal && (
                <Animated.View style={[
                  styles.achievementBadge,
                  {
                    opacity: motivationAnim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.8, 1, 0.8],
                    }),
                    transform: [{
                      scale: motivationAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.95, 1.05, 0.95],
                      })
                    }]
                  }
                ]}>
                  <LinearGradient
                    colors={['#FFD700', '#FFA500', '#FF6B35']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.achievementGradient}
                  >
                    <Trophy color="white" size={16} strokeWidth={2.5} />
                    <Text style={styles.achievementText}>Meta Diária Alcançada!</Text>
                    <Star color="white" size={12} strokeWidth={2} />
                  </LinearGradient>
                </Animated.View>
              )}
              

              

              
              {/* Food Widgets Section */}
              <View style={styles.foodWidgetsSection}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.segmentedControl, { backgroundColor: colors.surfaceSecondary }]}>
                    <TouchableOpacity 
                      onPress={() => {
                        setActiveTab('today');
                        setSelectedHistoryDate(null);
                      }}
                      style={[
                        styles.segmentButton,
                        activeTab === 'today' && [styles.activeSegmentButton, { backgroundColor: colors.surface }]
                      ]}
                    >
                      <Calendar 
                        color={activeTab === 'today' ? colors.primary : colors.textSecondary} 
                        size={16} 
                        strokeWidth={2}
                      />
                      <Text style={[
                        styles.segmentText,
                        { color: activeTab === 'today' ? colors.primary : colors.textSecondary }
                      ]}>Hoje</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      onPress={() => {
                        setActiveTab('history');
                        setSelectedHistoryDate(null);
                      }}
                      style={[
                        styles.segmentButton,
                        activeTab === 'history' && [styles.activeSegmentButton, { backgroundColor: colors.surface }]
                      ]}
                    >
                      <Clock 
                        color={activeTab === 'history' ? colors.primary : colors.textSecondary} 
                        size={16} 
                        strokeWidth={2}
                      />
                      <Text style={[
                        styles.segmentText,
                        { color: activeTab === 'history' ? colors.primary : colors.textSecondary }
                      ]}>Histórico</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.tabContent}>
                  {renderTabContent()}
                </View>
              </View>
              
              {/* Macro Distribution Chart */}
              {todayFoods.length > 0 && (
                <View style={styles.macroChartsSection}>
                  <MacroChart 
                    foods={todayFoods} 
                    title="Distribuição de Macronutrientes" 
                    chartType="bar" 
                  />
                </View>
              )}
              
              <TouchableOpacity
                style={[styles.sourcesButton, { backgroundColor: 'rgba(20,20,20,0.85)', borderTopWidth: 1, borderTopColor: '#2196F3' }]}
                onPress={() => router.push('/sources')}
                activeOpacity={0.7}
              >
                <View style={styles.sourcesButtonContent}>
                  <View style={[styles.sourcesButtonIcon, { backgroundColor: 'rgba(33,150,243,0.15)' }]}>
                    <Info color="#2196F3" size={18} strokeWidth={2} />
                  </View>
                  <View style={styles.sourcesButtonText}>
                    <Text style={[styles.sourcesButtonTitle, { color: colors.text }]}>Fontes & Referências</Text>
                    <Text style={[styles.sourcesButtonSubtitle, { color: '#9E9E9E', fontStyle: 'italic' as const }]}>Bases científicas dos cálculos</Text>
                  </View>
                </View>
              </TouchableOpacity>
              
              {/* User Metrics Widgets - Moved to end */}
              {userProfile && healthMetrics && (
                <View style={styles.userMetricsSection}>
                  <View style={styles.userMetricsGrid}>
                    <View style={[styles.userMetricCard, { backgroundColor: colors.surfaceElevated }]}>
                      <View style={[styles.userMetricIcon, { backgroundColor: colors.primary + '15' }]}>
                        <User color={colors.primary} size={16} strokeWidth={2} />
                      </View>
                      <Text style={[styles.userMetricValue, { color: colors.text }]}>{userProfile.age}</Text>
                      <Text style={[styles.userMetricLabel, { color: colors.textSecondary }]}>Idade</Text>
                    </View>
                    
                    <View style={[styles.userMetricCard, { backgroundColor: colors.surfaceElevated }]}>
                      <View style={[styles.userMetricIcon, { backgroundColor: colors.primary + '15' }]}>
                        <Activity color={colors.primary} size={16} strokeWidth={2} />
                      </View>
                      <Text style={[styles.userMetricValue, { color: colors.text }]}>{userProfile.height}cm</Text>
                      <Text style={[styles.userMetricLabel, { color: colors.textSecondary }]}>Altura</Text>
                    </View>
                  </View>
                  
                  <View style={styles.userMetricsGrid}>
                    <View style={[styles.userMetricCard, { backgroundColor: colors.surfaceElevated }]}>
                      <View style={[styles.userMetricIcon, { backgroundColor: colors.primary + '15' }]}>
                        <Target color={colors.primary} size={16} strokeWidth={2} />
                      </View>
                      <Text style={[styles.userMetricValue, { color: colors.text }]}>{healthMetrics.bmi}</Text>
                      <Text style={[styles.userMetricLabel, { color: colors.textSecondary }]}>IMC</Text>
                    </View>
                    
                    <View style={[styles.userMetricCard, { backgroundColor: colors.surfaceElevated }]}>
                      <View style={[styles.userMetricIcon, { backgroundColor: colors.primary + '15' }]}>
                        <Heart color={colors.primary} size={16} strokeWidth={2} />
                      </View>
                      <Text style={[styles.userMetricValue, { color: colors.text }]}>{userProfile.weight}kg</Text>
                      <Text style={[styles.userMetricLabel, { color: colors.textSecondary }]}>Peso</Text>
                    </View>
                  </View>
                  
                  <Text style={[styles.bmiCategory, { color: colors.textSecondary }]}>
                    {healthMetrics.bmiCategory}
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>
        </ScrollView>

        <Modal
          visible={showManualModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowManualModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <LinearGradient
                colors={['rgba(0, 0, 0, 0.8)', 'rgba(26, 26, 46, 0.9)', 'rgba(22, 33, 62, 0.8)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modalGradient}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Adicionar Calorias</Text>
                  <TouchableOpacity
                    onPress={() => setShowManualModal(false)}
                    style={styles.closeButton}
                  >
                    <X color={colors.text} size={24} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.modalContent}>
                  <View style={styles.inputContainer}>
                    <Hash color="rgba(255, 255, 255, 0.8)" size={20} />
                    <TextInput
                      style={styles.calorieInput}
                      placeholder="Calorias (ex: 250)"
                      placeholderTextColor="rgba(255, 255, 255, 0.6)"
                      value={manualCalories}
                      onChangeText={setManualCalories}
                      keyboardType="numeric"
                      maxLength={5}
                    />
                  </View>
                  
                  <TextInput
                    style={styles.descriptionInput}
                    placeholder="Descrição (opcional)"
                    placeholderTextColor="rgba(255, 255, 255, 0.6)"
                    value={manualDescription}
                    onChangeText={setManualDescription}
                    maxLength={50}
                    multiline
                  />
                  
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => setShowManualModal(false)}
                    >
                      <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.submitButton}
                      onPress={handleManualSubmit}
                    >
                      <LinearGradient
                        colors={['rgba(0, 122, 255, 0.9)', 'rgba(88, 86, 214, 0.9)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.submitButtonGradient}
                      >
                        <Text style={styles.submitButtonText}>Adicionar</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>
        </Modal>

        <Modal
          visible={showGoalModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowGoalModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <LinearGradient
                colors={['rgba(0, 0, 0, 0.8)', 'rgba(26, 26, 46, 0.9)', 'rgba(22, 33, 62, 0.8)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.modalGradient}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Definir Meta Diária</Text>
                  <TouchableOpacity
                    onPress={() => setShowGoalModal(false)}
                    style={styles.closeButton}
                  >
                    <X color={colors.text} size={24} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.modalContent}>
                  <View style={styles.inputContainer}>
                    <Hash color="rgba(255, 255, 255, 0.8)" size={20} />
                    <TextInput
                      style={styles.calorieInput}
                      placeholder="Meta em calorias (ex: 2000)"
                      placeholderTextColor="rgba(255, 255, 255, 0.6)"
                      value={goalInput}
                      onChangeText={setGoalInput}
                      keyboardType="numeric"
                      maxLength={5}
                    />
                  </View>
                  
                  <Text style={styles.goalHelpText}>
                    Defina sua meta diária de calorias. A barra de progresso ficará verde quando você estiver dentro da meta e vermelha quando ultrapassar.
                  </Text>
                  
                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => setShowGoalModal(false)}
                    >
                      <Text style={styles.cancelButtonText}>Cancelar</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.submitButton}
                      onPress={handleGoalSubmit}
                    >
                      <LinearGradient
                        colors={['rgba(0, 122, 255, 0.9)', 'rgba(88, 86, 214, 0.9)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.submitButtonGradient}
                      >
                        <Text style={styles.submitButtonText}>Definir Meta</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                </View>
              </LinearGradient>
            </View>
          </View>
        </Modal>

        {/* Quick Goal Selection Modal */}
        <Modal
          visible={showQuickGoals}
          transparent
          animationType="slide"
          onRequestClose={() => setShowQuickGoals(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.quickGoalContainer}>
              <LinearGradient
                colors={['rgba(0, 0, 0, 0.8)', 'rgba(26, 26, 46, 0.9)', 'rgba(22, 33, 62, 0.8)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.quickGoalGradient}
              >
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Definir Meta Diária</Text>
                  <TouchableOpacity
                    onPress={() => setShowQuickGoals(false)}
                    style={styles.closeButton}
                  >
                    <X color={colors.text} size={24} />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.quickGoalContent}>
                  <Text style={styles.quickGoalSubtitle}>
                    Escolha uma meta rápida ou defina uma personalizada
                  </Text>
                  
                  <View style={styles.quickGoalGrid}>
                    {[1200, 1500, 1800, 2000, 2200, 2500].map((goal) => (
                      <TouchableOpacity
                        key={goal}
                        style={[
                          styles.quickGoalButton,
                          dailyGoal === goal && styles.quickGoalButtonActive
                        ]}
                        onPress={() => handleQuickGoal(goal)}
                        activeOpacity={0.8}
                      >
                        <LinearGradient
                          colors={dailyGoal === goal 
                            ? [colors.primary, colors.primaryDark] 
                            : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']
                          }
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.quickGoalButtonGradient}
                        >
                          <Text style={[
                            styles.quickGoalButtonText,
                            { color: dailyGoal === goal ? 'white' : 'rgba(255, 255, 255, 0.9)' }
                          ]}>
                            {goal}
                          </Text>
                          <Text style={[
                            styles.quickGoalButtonUnit,
                            { color: dailyGoal === goal ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.6)' }
                          ]}>
                            kcal
                          </Text>
                          {dailyGoal === goal && (
                            <View style={styles.quickGoalCheckmark}>
                              <CheckCircle color="white" size={16} strokeWidth={2} />
                            </View>
                          )}
                        </LinearGradient>
                      </TouchableOpacity>
                    ))}
                  </View>
                  
                  <TouchableOpacity
                    style={styles.customGoalButton}
                    onPress={() => {
                      setShowQuickGoals(false);
                      setGoalInput(dailyGoal.toString());
                      setShowGoalModal(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.08)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.customGoalButtonGradient}
                    >
                      <Settings color="rgba(255, 255, 255, 0.9)" size={20} strokeWidth={2} />
                      <Text style={styles.customGoalButtonText}>Meta Personalizada</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#0B0B0C' : '#FAFBFF',
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  userMetricsSection: {
    marginTop: 20,
    marginBottom: 16,
    gap: 12,
  },
  userMetricsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  userMetricCard: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: isDark ? 0 : 0.5,
    borderColor: isDark ? 'transparent' : 'rgba(0, 0, 0, 0.04)',
    shadowColor: isDark ? 'rgba(255, 255, 255, 0.1)' : '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.1 : 0.04,
    shadowRadius: isDark ? 4 : 8,
    elevation: isDark ? 2 : 3,
  },
  userMetricIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  userMetricValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    letterSpacing: -0.4,
    marginBottom: 4,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  userMetricLabel: {
    fontSize: 11,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
    opacity: 0.7,
  },
  bmiCategory: {
    fontSize: 13,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
    opacity: 0.7,
    letterSpacing: 0.2,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    borderRadius: 12,
    alignSelf: 'center',
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700' as const,
    marginBottom: 2,
    letterSpacing: -0.3,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  date: {
    fontSize: 14,
    fontWeight: '500' as const,
    textTransform: 'capitalize' as const,
    lineHeight: 17,
    opacity: 0.6,
    letterSpacing: 0.1,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.15 : 0.04,
    shadowRadius: isDark ? 3 : 6,
    elevation: isDark ? 1 : 1,
    borderWidth: isDark ? 0 : 0.5,
    borderColor: isDark ? 'transparent' : 'rgba(0, 0, 0, 0.04)',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  profileButton: {
    borderRadius: 20,
  },
  profileButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: 'rgba(0, 122, 255, 0.6)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  headerButton: {
    // Keep existing styles
  },
  headerButtonInner: {
    // Animation container
  },
  headerTouchable: {
    borderRadius: 25,
  },
  headerButtonGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
    shadowColor: 'rgba(0, 122, 255, 0.8)',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 20,
    position: 'relative',
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  mainContentContainer: {
    gap: 20,
    paddingHorizontal: 0,
    marginHorizontal: 0,
  },
  summaryCards: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    padding: 18,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.08,
    shadowRadius: isDark ? 3 : 8,
    elevation: isDark ? 2 : 3,
    borderWidth: isDark ? 0 : 0.5,
    borderColor: isDark ? 'transparent' : 'rgba(0, 0, 0, 0.05)',
  },
  summaryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  summaryCardIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryCardTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  summaryCardValue: {
    fontSize: 32,
    fontWeight: '300' as const,
    marginBottom: 2,
    letterSpacing: -1,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  summaryCardUnit: {
    fontSize: 13,
    fontWeight: '500' as const,
    marginBottom: 12,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.3,
  },
  summaryCardProgress: {
    gap: 6,
  },
  summaryProgressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  summaryProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  summaryCardGoal: {
    fontSize: 11,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  statsScroll: {
    marginTop: 20,
  },
  statsScrollContainer: {
    paddingHorizontal: 20,
    gap: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 20,
  },
  statCard: {
    width: screenWidth * 0.4,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '600' as const,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  mainCard: {
    padding: 24,
    marginBottom: 16,
  },
  mainCardContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  mainCardLabel: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  mainCardValue: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: 'white',
  },
  mainCardUnit: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'white',
    borderRadius: 4,
  },
  goalText: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  miniCardsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  miniCard: {
    flex: 1,
    padding: 18,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  miniCardIcon: {
    marginBottom: 8,
    padding: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    shadowColor: 'rgba(255, 255, 255, 0.3)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  miniCardValue: {
    fontSize: 24,
    fontWeight: '600' as const,
    color: 'white',
    marginTop: 8,
  },
  miniCardLabel: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  mealsSection: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: 'white',
    marginBottom: 16,
  },
  emptyState: {
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.2 : 0.05,
    shadowRadius: isDark ? 4 : 8,
    elevation: isDark ? 2 : 3,
    borderWidth: isDark ? 0 : 0.5,
    borderColor: isDark ? 'transparent' : 'rgba(0, 0, 0, 0.05)',
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.2 : 0.08,
    shadowRadius: isDark ? 4 : 6,
    elevation: isDark ? 2 : 3,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    textAlign: 'center' as const,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    fontWeight: '400' as const,
    textAlign: 'center' as const,
    maxWidth: 280,
    lineHeight: 20,
  },

  progressCard: {
    padding: 16,
    marginTop: 16,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  progressDetails: {
    alignItems: 'center',
  },
  progressText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: 'white',
    marginBottom: 4,
  },
  progressSubtext: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  loadingCard: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '400' as const,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.2 : 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  activeSegmentButton: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.08,
    shadowRadius: isDark ? 3 : 4,
    elevation: isDark ? 2 : 3,
    borderWidth: isDark ? 0 : 0.5,
    borderColor: isDark ? 'transparent' : 'rgba(0, 0, 0, 0.05)',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  headerResetButton: {
    borderRadius: 20,
  },
  headerResetButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: 'rgba(0, 122, 255, 0.6)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  headerResetButtonText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 18,
  },
  iconContainer: {
    position: 'relative',
    zIndex: 2,
  },
  modernIconContainer: {
    position: 'relative',
    zIndex: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modernIconBackground: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  glowEffect: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    transform: [{ translateX: -16 }, { translateY: -16 }],
    zIndex: 1,
  },
  modernGlowEffect: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    transform: [{ translateX: -20 }, { translateY: -20 }],
    zIndex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: 'rgba(0, 122, 255, 0.5)',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 20,
  },
  modalGradient: {
    padding: 0,
    borderRadius: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: 'white',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 20,
    paddingTop: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  calorieInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '600' as const,
    color: 'white',
  },
  descriptionInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '400' as const,
    color: 'white',
    marginBottom: 24,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  submitButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  submitButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  goalHelpText: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 24,
  },
  
  tabContent: {
    marginTop: 16,
  },
  
  // History day card styles
  historyDayCard: {
    padding: 18,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.2 : 0.05,
    shadowRadius: isDark ? 4 : 8,
    elevation: isDark ? 2 : 3,
    borderWidth: isDark ? 0 : 0.5,
    borderColor: isDark ? 'transparent' : 'rgba(0, 0, 0, 0.05)',
  },
  historyDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  historyDayInfo: {
    flex: 1,
    marginRight: 12,
  },
  historyDayDate: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 2,
    textTransform: 'capitalize' as const,
  },
  historyDayStats: {
    fontSize: 12,
    fontWeight: '400' as const,
    color: colors.textSecondary,
  },
  historyDayCalories: {
    alignItems: 'flex-end',
  },
  historyCalorieValue: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
  },
  overGoal: {
    color: '#FF6B6B',
  },
  historyCalorieUnit: {
    fontSize: 11,
    fontWeight: '400' as const,
    color: colors.textSecondary,
    marginTop: 1,
  },
  historyProgressContainer: {
    marginTop: 6,
  },
  historyProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  historyProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  historyProgressText: {
    fontSize: 11,
    fontWeight: '400' as const,
    color: colors.textSecondary,
    textAlign: 'center' as const,
  },
  
  // Selected day view styles
  selectedDayView: {
    flex: 1,
  },
  selectedDayHeader: {
    marginBottom: 16,
  },
  backToHistoryButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  backToHistoryText: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: colors.textSecondary,
  },
  selectedDayTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 4,
    textTransform: 'capitalize' as const,
  },
  selectedDaySubtitle: {
    fontSize: 13,
    fontWeight: '400' as const,
    color: colors.textSecondary,
  },
  
  // New enhanced styles
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sparkleIcon: {
    opacity: 0.9,
  },
  motivationBadge: {
    marginTop: 8,
    alignSelf: 'flex-start',
    borderRadius: 16,
    overflow: 'hidden',
  },
  motivationBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  motivationText: {
    fontSize: 11,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
  },
  addButtonContainer: {
    // Container for floating animation
  },
  addButtonGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  addButtonGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  statCardGradient: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    position: 'relative',
  },
  statBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statBadgeText: {
    fontSize: 10,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  emptyStateGradient: {
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
  },
  emptyActions: {
    marginTop: 24,
    width: '100%',
    alignItems: 'center',
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 22,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.2 : 0.08,
    shadowRadius: isDark ? 4 : 6,
    elevation: isDark ? 2 : 3,
  },
  emptyActionText: {
    fontSize: 14,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
  },
  
  // Achievement badge styles
  achievementBadge: {
    marginTop: 14,
    marginBottom: 10,
    alignSelf: 'center',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  achievementGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    gap: 6,
  },
  achievementText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700' as const,
    letterSpacing: 0.1,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  
  // Quick goal modal styles
  quickGoalContainer: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: 'rgba(0, 122, 255, 0.5)',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 20,
  },
  quickGoalGradient: {
    padding: 0,
    borderRadius: 24,
  },
  quickGoalContent: {
    padding: 20,
    paddingTop: 10,
  },
  quickGoalSubtitle: {
    fontSize: 14,
    fontWeight: '400' as const,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center' as const,
    marginBottom: 24,
    lineHeight: 20,
  },
  quickGoalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  quickGoalButton: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  quickGoalButtonActive: {
    shadowColor: 'rgba(0, 122, 255, 0.5)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  quickGoalButtonGradient: {
    padding: 20,
    alignItems: 'center',
    position: 'relative',
  },
  quickGoalButtonText: {
    fontSize: 24,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  quickGoalButtonUnit: {
    fontSize: 12,
    fontWeight: '500' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  quickGoalCheckmark: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  customGoalButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  customGoalButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  customGoalButtonText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 16,
    fontWeight: '600' as const,
    letterSpacing: 0.2,
  },
  
  // Enhanced Daily Progress Menu Styles
  dailyProgressMenu: {
    marginTop: 20,
    gap: 16,
  },
  progressOverviewCard: {
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.08,
    shadowRadius: isDark ? 3 : 8,
    elevation: isDark ? 2 : 3,
    borderWidth: isDark ? 0 : 0.5,
    borderColor: isDark ? 'transparent' : 'rgba(0, 0, 0, 0.05)',
  },
  progressOverviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressOverviewTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
  },
  progressBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  progressBadgeText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700' as const,
    letterSpacing: 0.2,
  },
  progressOverviewContent: {
    gap: 16,
  },
  calorieDisplay: {
    alignItems: 'center',
  },
  calorieValue: {
    fontSize: 36,
    fontWeight: '300' as const,
    letterSpacing: -1.5,
    marginBottom: 4,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  calorieUnit: {
    fontSize: 15,
    fontWeight: '400' as const,
    opacity: 0.7,
  },
  progressBarContainer: {
    gap: 8,
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  remainingText: {
    fontSize: 13,
    fontWeight: '500' as const,
    textAlign: 'center' as const,
    opacity: 0.8,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.2 : 0.05,
    shadowRadius: isDark ? 2 : 4,
    elevation: isDark ? 1 : 2,
    borderWidth: isDark ? 0 : 0.5,
    borderColor: isDark ? 'transparent' : 'rgba(0, 0, 0, 0.05)',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  metricIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    opacity: 0.8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '600' as const,
    marginBottom: 4,
    letterSpacing: -0.5,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  metricSubtitle: {
    fontSize: 11,
    fontWeight: '400' as const,
    opacity: 0.6,
    marginBottom: 12,
  },
  metricProgress: {
    marginTop: 'auto',
  },
  metricProgressBar: {
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  metricProgressFill: {
    height: '100%',
    borderRadius: 1.5,
  },
  metricAction: {
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  metricActionText: {
    fontSize: 12,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  quickStatsCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: isDark ? 0.2 : 0.05,
    shadowRadius: isDark ? 2 : 4,
    elevation: isDark ? 1 : 2,
    borderWidth: isDark ? 0 : 0.5,
    borderColor: isDark ? 'transparent' : 'rgba(0, 0, 0, 0.05)',
  },
  quickStatsTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginBottom: 12,
    textAlign: 'center' as const,
    opacity: 0.8,
  },
  quickStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  quickStat: {
    alignItems: 'center',
    flex: 1,
  },
  quickStatValue: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  quickStatLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.3,
    opacity: 0.6,
  },
  quickStatDivider: {
    width: 1,
    height: 20,
    borderRadius: 0.5,
    opacity: 0.2,
    marginHorizontal: 8,
  },
  
  sourcesButton: {
    padding: 18,
    borderRadius: 16,
    marginTop: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.08,
    shadowRadius: isDark ? 3 : 8,
    elevation: isDark ? 2 : 3,
    borderWidth: isDark ? 0 : 0.5,
    borderColor: isDark ? 'transparent' : 'rgba(0, 0, 0, 0.05)',
  },
  sourcesButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  sourcesButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sourcesButtonText: {
    flex: 1,
  },
  sourcesButtonTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  sourcesButtonSubtitle: {
    fontSize: 13,
    fontWeight: '400' as const,
  },
  
  // Macro Widgets Styles
  macroWidgetsSection: {
    marginTop: 20,
    marginBottom: 16,
  },
  macroSectionTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
    marginBottom: 14,
    letterSpacing: -0.2,
    opacity: 0.9,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  macroWidgetsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 0,
    paddingHorizontal: 0,
  },
  
  // Food Widgets Section Styles
  foodWidgetsSection: {
    marginTop: 20,
  },
  
  // Macro Chart Styles
  macroChartsSection: {
    marginTop: 14,
  },
});