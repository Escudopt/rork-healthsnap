import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Save, Activity, Target, Scale, Ruler, TrendingUp, CheckCircle } from 'lucide-react-native';
import { useCalorieTracker } from '@/providers/CalorieTrackerProvider';
import { useTheme, useThemedStyles } from '@/providers/ThemeProvider';
import { UserProfile } from '@/types/food';
import { BlurCard } from '@/components/BlurCard';
import { ThemeSelector } from '@/components/ThemeSelector';

const activityLevels = [
  { key: 'sedentary', label: 'Sedentário', description: 'Pouco ou nenhum exercício' },
  { key: 'light', label: 'Leve', description: 'Exercício leve 1-3 dias/semana' },
  { key: 'moderate', label: 'Moderado', description: 'Exercício moderado 3-5 dias/semana' },
  { key: 'active', label: 'Ativo', description: 'Exercício intenso 6-7 dias/semana' },
  { key: 'very_active', label: 'Muito Ativo', description: 'Exercício muito intenso, trabalho físico' },
];

const goals = [
  { key: 'lose', label: 'Perder Peso', description: 'Déficit calórico de 500 kcal/dia' },
  { key: 'maintain', label: 'Manter Peso', description: 'Manter peso atual' },
  { key: 'gain', label: 'Ganhar Peso', description: 'Superávit calórico de 300 kcal/dia' },
];

export default function ProfileScreen() {
  const { 
    userProfile, 
    healthMetrics, 
    updateUserProfile,
    meals,
    calculateHealthScore 
  } = useCalorieTracker();
  const { colors, isDark } = useTheme();
  const [isEditing, setIsEditing] = useState(!userProfile);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<UserProfile>({
    name: userProfile?.name || '',
    age: userProfile?.age || 25,
    weight: userProfile?.weight || 70,
    height: userProfile?.height || 170,
    gender: userProfile?.gender || 'male',
    activityLevel: userProfile?.activityLevel || 'moderate',
    goal: userProfile?.goal || 'maintain',
  });

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
    headerButtons: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    editButton: {
      backgroundColor: colors.surfaceSecondary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    editButtonText: {
      color: colors.text,
      fontWeight: '600',
      fontSize: 14,
    },
    formCard: {
      padding: 24,
      marginBottom: 20,
    },
    formTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 20,
      textAlign: 'center',
    },
    inputGroup: {
      marginBottom: 20,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    textInput: {
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: colors.text,
      borderWidth: 1,
      borderColor: colors.border,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    halfWidth: {
      width: '48%',
    },
    genderContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    genderButton: {
      flex: 1,
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginHorizontal: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    genderButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    genderButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    genderButtonTextActive: {
      color: 'white',
    },
    optionButton: {
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    optionButtonActive: {
      backgroundColor: colors.primary + '20',
      borderColor: colors.primary,
    },
    optionContent: {
      flex: 1,
    },
    optionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 4,
    },
    optionTitleActive: {
      color: colors.text,
    },
    optionDescription: {
      fontSize: 14,
      color: colors.textTertiary,
    },
    optionDescriptionActive: {
      color: colors.textSecondary,
    },
    saveButton: {
      backgroundColor: colors.success,
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 10,
    },
    saveButtonDisabled: {
      backgroundColor: colors.success + '80',
    },
    saveButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 8,
    },
    profileCard: {
      padding: 24,
      alignItems: 'center',
      marginBottom: 20,
    },
    profileName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    profileDetails: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 8,
    },
    profileGoal: {
      fontSize: 14,
      color: colors.textTertiary,
      fontStyle: 'italic',
    },
    summaryCards: {
      flexDirection: 'row',
      paddingHorizontal: 20,
      gap: 12,
      marginBottom: 16,
    },
    summaryCardsColumn: {
      paddingHorizontal: 20,
      gap: 16,
      marginBottom: 16,
    },
    widgetGrid: {
      paddingHorizontal: 20,
      gap: 16,
      marginBottom: 16,
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
    fullWidthCard: {
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
    recommendationsList: {
      gap: 12,
    },
    recommendationItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    recommendationDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      marginTop: 6,
    },
    recommendationText: {
      fontSize: 14,
      lineHeight: 20,
      flex: 1,
    },


    
    // Health Evolution Chart Styles
    chartContainer: {
      backgroundColor: colors.surfaceElevated,
      marginHorizontal: 20,
      marginBottom: 20,
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
    chartHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
    },
    chartTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginLeft: 12,
    },
    chartSubtitle: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 20,
      lineHeight: 20,
    },
    chartGrid: {
      height: 200,
      marginBottom: 20,
      position: 'relative',
    },
    chartLine: {
      position: 'absolute',
      height: 2,
      backgroundColor: colors.primary,
      borderRadius: 1,
    },
    chartPoint: {
      position: 'absolute',
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
      borderWidth: 2,
      borderColor: colors.surfaceElevated,
    },
    chartAxisY: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 1,
      backgroundColor: colors.border,
    },
    chartAxisX: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: 1,
      backgroundColor: colors.border,
    },
    chartLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    chartLabel: {
      fontSize: 12,
      color: colors.textTertiary,
      textAlign: 'center',
    },
    healthScore: {
      alignItems: 'center',
      marginTop: 16,
    },
    healthScoreValue: {
      fontSize: 48,
      fontWeight: '200',
      color: colors.primary,
      marginBottom: 4,
    },
    healthScoreLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    healthScoreDescription: {
      fontSize: 12,
      color: colors.textTertiary,
      textAlign: 'center',
      marginTop: 8,
      lineHeight: 16,
    },
    progressIndicators: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 20,
      paddingTop: 20,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    progressIndicator: {
      alignItems: 'center',
      flex: 1,
    },
    progressValue: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    progressLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: 0.3,
    },
    
    // Nutrition breakdown styles
    nutritionGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginTop: 16,
    },
    nutritionItem: {
      width: '48%',
      alignItems: 'center',
      marginBottom: 16,
      padding: 12,
      backgroundColor: colors.surfaceSecondary,
      borderRadius: 12,
    },
    nutritionValue: {
      fontSize: 20,
      fontWeight: '600',
      marginBottom: 4,
    },
    nutritionLabel: {
      fontSize: 12,
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 2,
    },
    nutritionTarget: {
      fontSize: 10,
      fontStyle: 'italic',
    },
  }));

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Erro', 'Por favor, insira seu nome.');
      return;
    }
    
    if (formData.age < 10 || formData.age > 120) {
      Alert.alert('Erro', 'Idade deve estar entre 10 e 120 anos.');
      return;
    }
    
    if (formData.weight < 30 || formData.weight > 300) {
      Alert.alert('Erro', 'Peso deve estar entre 30 e 300 kg.');
      return;
    }
    
    if (formData.height < 100 || formData.height > 250) {
      Alert.alert('Erro', 'Altura deve estar entre 100 e 250 cm.');
      return;
    }

    try {
      setLoading(true);
      await updateUserProfile(formData);
      setIsEditing(false);
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Erro', 'Erro ao salvar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Get current health score
  const currentHealthScore = calculateHealthScore();
  
  // Calculate nutrition breakdown for today
  const getTodayNutritionBreakdown = () => {
    if (!userProfile || !healthMetrics || meals.length === 0) return null;
    
    const today = new Date().toDateString();
    const todayMeals = meals.filter(meal => {
      if (!meal.timestamp) return false;
      try {
        return new Date(meal.timestamp).toDateString() === today;
      } catch {
        return false;
      }
    });
    
    if (todayMeals.length === 0) return null;
    
    // Calculate totals for today
    const totals = todayMeals.reduce((acc, meal) => {
      meal.foods.forEach(food => {
        acc.calories += food.calories || 0;
        acc.protein += food.protein || 0;
        acc.sugar += food.sugar || 0;
        acc.sodium += food.sodium || 0;
      });
      return acc;
    }, { calories: 0, protein: 0, sugar: 0, sodium: 0 });
    
    // Define healthy targets
    const targets = {
      calories: healthMetrics.recommendedCalories,
      protein: userProfile.weight * 1.2, // 1.2g per kg body weight
      sugar: 25, // WHO recommendation: max 25g per day
      sodium: 2300 // WHO recommendation: max 2300mg per day
    };
    
    return { totals, targets };
  };
  
  const nutritionBreakdown = getTodayNutritionBreakdown();

  const renderHealthScoreCard = () => {
    if (!userProfile || !healthMetrics) return null;
    
    const trend = currentHealthScore >= 80 ? 'excellent' : currentHealthScore >= 60 ? 'good' : 'needs_improvement';
    
    return (
      <View style={[styles.fullWidthCard, { backgroundColor: colors.surfaceElevated }]}>
        <View style={styles.summaryCardHeader}>
          <View style={[styles.summaryCardIcon, { backgroundColor: '#34C759' }]}>
            <TrendingUp color="white" size={16} strokeWidth={2.5} />
          </View>
          <Text style={[styles.summaryCardTitle, { color: colors.text }]}>Pontuação de Saúde</Text>
        </View>
        
        <Text style={[styles.summaryCardValue, { color: colors.text }]}>
          {currentHealthScore}
        </Text>
        <Text style={[styles.summaryCardUnit, { color: colors.textSecondary }]}>de 100</Text>
        
        <View style={styles.summaryCardProgress}>
          <View style={[styles.summaryProgressBar, { backgroundColor: colors.surfaceSecondary }]}>
            <View 
              style={[
                styles.summaryProgressFill,
                {
                  width: `${currentHealthScore}%`,
                  backgroundColor: trend === 'excellent' ? '#34C759' : 
                                 trend === 'good' ? '#FF9800' : '#F44336'
                }
              ]} 
            />
          </View>
          <Text style={[styles.summaryCardGoal, { color: colors.textSecondary }]}>
            {trend === 'excellent' && 'EXCELENTE PROGRESSO'}
            {trend === 'good' && 'BOM PROGRESSO'}
            {trend === 'needs_improvement' && 'PRECISA MELHORAR'}
          </Text>
        </View>
        
        <Text style={[styles.healthScoreDescription, { marginTop: 12, color: colors.textTertiary }]}>
          Baseado em calorias, proteínas, açúcar e sal consumidos hoje
        </Text>
      </View>
    );
  };
  
  const renderNutritionBreakdown = () => {
    if (!nutritionBreakdown) return null;
    
    const { totals, targets } = nutritionBreakdown;
    
    return (
      <View style={[styles.fullWidthCard, { backgroundColor: colors.surfaceElevated }]}>
        <View style={styles.summaryCardHeader}>
          <View style={[styles.summaryCardIcon, { backgroundColor: '#007AFF' }]}>
            <Activity color="white" size={16} strokeWidth={2.5} />
          </View>
          <Text style={[styles.summaryCardTitle, { color: colors.text }]}>Nutrição de Hoje</Text>
        </View>
        
        <View style={styles.nutritionGrid}>
          <View style={styles.nutritionItem}>
            <Text style={[styles.nutritionValue, { color: colors.text }]}>
              {Math.round(totals.calories)}
            </Text>
            <Text style={[styles.nutritionLabel, { color: colors.textSecondary }]}>Calorias</Text>
            <Text style={[styles.nutritionTarget, { color: colors.textTertiary }]}>Meta: {targets.calories}</Text>
          </View>
          
          <View style={styles.nutritionItem}>
            <Text style={[styles.nutritionValue, { color: colors.text }]}>
              {Math.round(totals.protein)}g
            </Text>
            <Text style={[styles.nutritionLabel, { color: colors.textSecondary }]}>Proteína</Text>
            <Text style={[styles.nutritionTarget, { color: colors.textTertiary }]}>Meta: {Math.round(targets.protein)}g</Text>
          </View>
          
          <View style={styles.nutritionItem}>
            <Text style={[styles.nutritionValue, { color: colors.text }]}>
              {Math.round(totals.sugar)}g
            </Text>
            <Text style={[styles.nutritionLabel, { color: colors.textSecondary }]}>Açúcar</Text>
            <Text style={[styles.nutritionTarget, { color: colors.textTertiary }]}>Máx: {targets.sugar}g</Text>
          </View>
          
          <View style={styles.nutritionItem}>
            <Text style={[styles.nutritionValue, { color: colors.text }]}>
              {Math.round(totals.sodium)}mg
            </Text>
            <Text style={[styles.nutritionLabel, { color: colors.textSecondary }]}>Sódio</Text>
            <Text style={[styles.nutritionTarget, { color: colors.textTertiary }]}>Máx: {targets.sodium}mg</Text>
          </View>
        </View>
      </View>
    );
  };

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
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View style={styles.headerLeft}>
                <Text style={[styles.greeting, { color: colors.text }]}>
                  Meu Perfil
                </Text>
                <Text style={[styles.date, { color: colors.textSecondary }]}>
                  Gerencie suas informações pessoais
                </Text>
              </View>
              <View style={styles.headerButtons}>
                {userProfile && !isEditing && (
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => setIsEditing(true)}
                  >
                    <Text style={styles.editButtonText}>Editar</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>

          {isEditing ? (
            <BlurCard variant="premium" style={styles.formCard}>
              <Text style={styles.formTitle}>Informações Pessoais</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nome</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.name}
                  onChangeText={(text) => setFormData({ ...formData, name: text })}
                  placeholder="Seu nome"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Idade</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formData.age.toString()}
                    onChangeText={(text) => setFormData({ ...formData, age: parseInt(text) || 0 })}
                    placeholder="25"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Sexo</Text>
                  <View style={styles.genderContainer}>
                    <TouchableOpacity
                      style={[
                        styles.genderButton,
                        formData.gender === 'male' && styles.genderButtonActive
                      ]}
                      onPress={() => setFormData({ ...formData, gender: 'male' })}
                    >
                      <Text style={[
                        styles.genderButtonText,
                        formData.gender === 'male' && styles.genderButtonTextActive
                      ]}>M</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.genderButton,
                        formData.gender === 'female' && styles.genderButtonActive
                      ]}
                      onPress={() => setFormData({ ...formData, gender: 'female' })}
                    >
                      <Text style={[
                        styles.genderButtonText,
                        formData.gender === 'female' && styles.genderButtonTextActive
                      ]}>F</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Peso (kg)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formData.weight.toString()}
                    onChangeText={(text) => setFormData({ ...formData, weight: parseFloat(text) || 0 })}
                    placeholder="70"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="numeric"
                  />
                </View>
                
                <View style={[styles.inputGroup, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Altura (cm)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={formData.height.toString()}
                    onChangeText={(text) => setFormData({ ...formData, height: parseInt(text) || 0 })}
                    placeholder="170"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Nível de Atividade</Text>
                {activityLevels.map((level) => (
                  <TouchableOpacity
                    key={level.key}
                    style={[
                      styles.optionButton,
                      formData.activityLevel === level.key && styles.optionButtonActive
                    ]}
                    onPress={() => setFormData({ ...formData, activityLevel: level.key as any })}
                  >
                    <View style={styles.optionContent}>
                      <Text style={[
                        styles.optionTitle,
                        formData.activityLevel === level.key && styles.optionTitleActive
                      ]}>{level.label}</Text>
                      <Text style={[
                        styles.optionDescription,
                        formData.activityLevel === level.key && styles.optionDescriptionActive
                      ]}>{level.description}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Objetivo</Text>
                {goals.map((goal) => (
                  <TouchableOpacity
                    key={goal.key}
                    style={[
                      styles.optionButton,
                      formData.goal === goal.key && styles.optionButtonActive
                    ]}
                    onPress={() => setFormData({ ...formData, goal: goal.key as any })}
                  >
                    <View style={styles.optionContent}>
                      <Text style={[
                        styles.optionTitle,
                        formData.goal === goal.key && styles.optionTitleActive
                      ]}>{goal.label}</Text>
                      <Text style={[
                        styles.optionDescription,
                        formData.goal === goal.key && styles.optionDescriptionActive
                      ]}>{goal.description}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={loading}
              >
                <Save color="white" size={20} />
                <Text style={styles.saveButtonText}>
                  {loading ? 'Salvando...' : 'Salvar Perfil'}
                </Text>
              </TouchableOpacity>
            </BlurCard>
          ) : (
            userProfile && (
              <>
                <BlurCard variant="premium" style={styles.profileCard}>
                  <Text style={styles.profileName}>{userProfile.name}</Text>
                  <Text style={styles.profileDetails}>
                    {userProfile.age} anos • {userProfile.weight} kg • {userProfile.height} cm
                  </Text>
                  <Text style={styles.profileGoal}>
                    {goals.find(g => g.key === userProfile.goal)?.label}
                  </Text>
                </BlurCard>

                {healthMetrics && (
                  <View style={styles.widgetGrid}>
                    {/* First row - BMI and TMB */}
                    <View style={styles.summaryCards}>
                      <View style={[styles.summaryCard, { backgroundColor: colors.surfaceElevated }]}>
                        <View style={styles.summaryCardHeader}>
                          <View style={[styles.summaryCardIcon, { backgroundColor: '#4CAF50' }]}>
                            <Scale color="white" size={16} strokeWidth={2.5} />
                          </View>
                          <Text style={[styles.summaryCardTitle, { color: colors.text }]}>IMC</Text>
                        </View>
                        <Text style={[styles.summaryCardValue, { color: colors.text }]}>
                          {healthMetrics.bmi}
                        </Text>
                        <Text style={[styles.summaryCardUnit, { color: colors.textSecondary }]}>{healthMetrics.bmiCategory}</Text>
                        <View style={styles.summaryCardProgress}>
                          <View style={[styles.summaryProgressBar, { backgroundColor: colors.surfaceSecondary }]}>
                            <View 
                              style={[
                                styles.summaryProgressFill,
                                {
                                  width: `${Math.min((parseFloat(healthMetrics.bmi.toString()) / 25) * 100, 100)}%`,
                                  backgroundColor: '#4CAF50'
                                }
                              ]} 
                            />
                          </View>
                          <Text style={[styles.summaryCardGoal, { color: colors.textSecondary }]}>NORMAL 18.5-24.9</Text>
                        </View>
                      </View>

                      <View style={[styles.summaryCard, { backgroundColor: colors.surfaceElevated }]}>
                        <View style={styles.summaryCardHeader}>
                          <View style={[styles.summaryCardIcon, { backgroundColor: '#FF9800' }]}>
                            <Activity color="white" size={16} strokeWidth={2.5} />
                          </View>
                          <Text style={[styles.summaryCardTitle, { color: colors.text }]}>TMB</Text>
                        </View>
                        <Text style={[styles.summaryCardValue, { color: colors.text }]}>
                          {healthMetrics.bmr.toLocaleString()}
                        </Text>
                        <Text style={[styles.summaryCardUnit, { color: colors.textSecondary }]}>kcal</Text>
                        <View style={styles.summaryCardProgress}>
                          <View style={[styles.summaryProgressBar, { backgroundColor: colors.surfaceSecondary }]}>
                            <View 
                              style={[
                                styles.summaryProgressFill,
                                {
                                  width: `${Math.min((healthMetrics.bmr / 2500) * 100, 100)}%`,
                                  backgroundColor: '#FF9800'
                                }
                              ]} 
                            />
                          </View>
                          <Text style={[styles.summaryCardGoal, { color: colors.textSecondary }]}>METABOLISMO BASAL</Text>
                        </View>
                      </View>
                    </View>

                    {/* Second row - TDEE and Meta */}
                    <View style={styles.summaryCards}>
                      <View style={[styles.summaryCard, { backgroundColor: colors.surfaceElevated }]}>
                        <View style={styles.summaryCardHeader}>
                          <View style={[styles.summaryCardIcon, { backgroundColor: '#2196F3' }]}>
                            <Target color="white" size={16} strokeWidth={2.5} />
                          </View>
                          <Text style={[styles.summaryCardTitle, { color: colors.text }]}>TDEE</Text>
                        </View>
                        <Text style={[styles.summaryCardValue, { color: colors.text }]}>
                          {healthMetrics.tdee.toLocaleString()}
                        </Text>
                        <Text style={[styles.summaryCardUnit, { color: colors.textSecondary }]}>kcal</Text>
                        <View style={styles.summaryCardProgress}>
                          <View style={[styles.summaryProgressBar, { backgroundColor: colors.surfaceSecondary }]}>
                            <View 
                              style={[
                                styles.summaryProgressFill,
                                {
                                  width: `${Math.min((healthMetrics.tdee / 3000) * 100, 100)}%`,
                                  backgroundColor: '#2196F3'
                                }
                              ]} 
                            />
                          </View>
                          <Text style={[styles.summaryCardGoal, { color: colors.textSecondary }]}>GASTO TOTAL</Text>
                        </View>
                      </View>

                      <View style={[styles.summaryCard, { backgroundColor: colors.surfaceElevated }]}>
                        <View style={styles.summaryCardHeader}>
                          <View style={[styles.summaryCardIcon, { backgroundColor: '#9C27B0' }]}>
                            <Ruler color="white" size={16} strokeWidth={2.5} />
                          </View>
                          <Text style={[styles.summaryCardTitle, { color: colors.text }]}>Meta</Text>
                        </View>
                        <Text style={[styles.summaryCardValue, { color: colors.text }]}>
                          {healthMetrics.recommendedCalories.toLocaleString()}
                        </Text>
                        <Text style={[styles.summaryCardUnit, { color: colors.textSecondary }]}>kcal</Text>
                        <View style={styles.summaryCardProgress}>
                          <View style={[styles.summaryProgressBar, { backgroundColor: colors.surfaceSecondary }]}>
                            <View 
                              style={[
                                styles.summaryProgressFill,
                                {
                                  width: `${Math.min((healthMetrics.recommendedCalories / 3000) * 100, 100)}%`,
                                  backgroundColor: '#9C27B0'
                                }
                              ]} 
                            />
                          </View>
                          <Text style={[styles.summaryCardGoal, { color: colors.textSecondary }]}>META DIÁRIA</Text>
                        </View>
                      </View>
                    </View>

                    {/* Health Score Card - Full width */}
                    {renderHealthScoreCard()}
                    
                    {/* Nutrition Breakdown - Full width */}
                    {renderNutritionBreakdown()}

                    {/* Third row - Peso Ideal (Full width) */}
                    <View style={[styles.fullWidthCard, { backgroundColor: colors.surfaceElevated }]}>
                      <View style={styles.summaryCardHeader}>
                        <View style={[styles.summaryCardIcon, { backgroundColor: '#34C759' }]}>
                          <Scale color="white" size={16} strokeWidth={2.5} />
                        </View>
                        <Text style={[styles.summaryCardTitle, { color: colors.text }]}>Peso Ideal</Text>
                      </View>
                      <Text style={[styles.summaryCardValue, { color: colors.text }]}>
                        {healthMetrics.idealWeight.min}-{healthMetrics.idealWeight.max}
                      </Text>
                      <Text style={[styles.summaryCardUnit, { color: colors.textSecondary }]}>kg</Text>
                      <View style={styles.summaryCardProgress}>
                        <View style={[styles.summaryProgressBar, { backgroundColor: colors.surfaceSecondary }]}>
                          <View 
                            style={[
                              styles.summaryProgressFill,
                              {
                                width: `${Math.min(((userProfile?.weight || 70) / healthMetrics.idealWeight.max) * 100, 100)}%`,
                                backgroundColor: '#34C759'
                              }
                            ]} 
                          />
                        </View>
                        <Text style={[styles.summaryCardGoal, { color: colors.textSecondary }]}>PESO ATUAL {(userProfile?.weight || 70).toString()} KG</Text>
                      </View>
                    </View>

                    {/* Recommendations - Full width */}
                    <View style={[styles.fullWidthCard, { backgroundColor: colors.surfaceElevated }]}>
                      <View style={styles.summaryCardHeader}>
                        <View style={[styles.summaryCardIcon, { backgroundColor: '#007AFF' }]}>
                          <CheckCircle color="white" size={16} strokeWidth={2.5} />
                        </View>
                        <Text style={[styles.summaryCardTitle, { color: colors.text }]}>Recomendações</Text>
                      </View>
                      <View style={styles.recommendationsList}>
                        {healthMetrics.recommendations.map((rec, index) => (
                          <View key={`rec-${index}`} style={styles.recommendationItem}>
                            <View style={[styles.recommendationDot, { backgroundColor: colors.primary }]} />
                            <Text style={[styles.recommendationText, { color: colors.textSecondary }]}>{rec}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                    
                    <ThemeSelector />
                  </View>
                )}
              </>
            )
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}