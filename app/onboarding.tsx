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
  KeyboardAvoidingView,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Save, User, Scale, Activity, Sparkles } from 'lucide-react-native';
import { router } from 'expo-router';
import { useCalorieTracker } from '@/providers/CalorieTrackerProvider';
import { UserProfile } from '@/types/food';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_COMPLETE_KEY = 'onboarding_complete';

const activityLevels = [
  { key: 'sedentary', label: 'Sedentário', description: 'Pouco ou nenhum exercício' },
  { key: 'light', label: 'Leve', description: '1-2 treinos/semana' },
  { key: 'moderate', label: 'Moderado', description: '3-4 treinos/semana' },
  { key: 'active', label: 'Ativo', description: '5-6 treinos/semana' },
  { key: 'very_active', label: 'Muito Ativo', description: 'Treino diário' },
];

const goals = [
  { key: 'lose', label: 'Perder Peso', description: 'Déficit calórico' },
  { key: 'maintain', label: 'Manter Peso', description: 'Manter peso atual' },
  { key: 'gain', label: 'Ganhar Peso', description: 'Superávit calórico' },
];

export default function OnboardingScreen() {
  const { updateUserProfile } = useCalorieTracker();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const [formData, setFormData] = useState<UserProfile>({
    name: '',
    age: 25,
    weight: 70,
    height: 170,
    gender: 'male',
    activityLevel: 'moderate',
    goal: 'maintain',
  });

  const handleNext = () => {
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        Alert.alert('Atenção', 'Por favor, insira seu nome.');
        return;
      }
      if (formData.age < 10 || formData.age > 120) {
        Alert.alert('Atenção', 'Idade deve estar entre 10 e 120 anos.');
        return;
      }
    }
    
    if (currentStep === 2) {
      if (formData.weight < 30 || formData.weight > 300) {
        Alert.alert('Atenção', 'Peso deve estar entre 30 e 300 kg.');
        return;
      }
      if (formData.height < 100 || formData.height > 250) {
        Alert.alert('Atenção', 'Altura deve estar entre 100 e 250 cm.');
        return;
      }
    }
    
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      setLoading(true);
      await updateUserProfile(formData);
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert('Erro', 'Erro ao salvar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={['#007AFF', '#5AC8FA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconGradient}
        >
          <User color="white" size={40} strokeWidth={2} />
        </LinearGradient>
      </View>
      <Text style={styles.stepTitle}>Bem-vindo ao HealthSnap! ✨</Text>
      <Text style={styles.stepSubtitle}>Vamos começar com suas informações básicas</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Nome</Text>
        <View style={styles.glassInputContainer}>
          <TextInput
            style={styles.textInput}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="Seu nome"
            placeholderTextColor="rgba(60, 60, 67, 0.3)"
            autoFocus
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Idade</Text>
        <View style={styles.glassInputContainer}>
          <TextInput
            style={styles.textInput}
            value={formData.age.toString()}
            onChangeText={(text) => setFormData({ ...formData, age: parseInt(text) || 0 })}
            placeholder="25"
            placeholderTextColor="rgba(60, 60, 67, 0.3)"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Sexo</Text>
        <View style={styles.genderContainer}>
          <TouchableOpacity
            style={[
              styles.genderButton,
              formData.gender === 'male' && styles.genderButtonActive
            ]}
            onPress={() => setFormData({ ...formData, gender: 'male' })}
            activeOpacity={0.7}
          >
            {formData.gender === 'male' && (
              <LinearGradient
                colors={['#007AFF', '#5AC8FA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
            )}
            <Text style={[
              styles.genderButtonText,
              formData.gender === 'male' && styles.genderButtonTextActive
            ]}>Masculino</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.genderButton,
              formData.gender === 'female' && styles.genderButtonActive
            ]}
            onPress={() => setFormData({ ...formData, gender: 'female' })}
            activeOpacity={0.7}
          >
            {formData.gender === 'female' && (
              <LinearGradient
                colors={['#007AFF', '#5AC8FA']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
            )}
            <Text style={[
              styles.genderButtonText,
              formData.gender === 'female' && styles.genderButtonTextActive
            ]}>Feminino</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={['#34C759', '#30D158']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconGradient}
        >
          <Scale color="white" size={40} strokeWidth={2} />
        </LinearGradient>
      </View>
      <Text style={styles.stepTitle}>Medidas Corporais 📏</Text>
      <Text style={styles.stepSubtitle}>Precisamos dessas informações para calcular suas metas</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Peso (kg)</Text>
        <View style={styles.glassInputContainer}>
          <TextInput
            style={styles.textInput}
            value={formData.weight.toString()}
            onChangeText={(text) => setFormData({ ...formData, weight: parseFloat(text) || 0 })}
            placeholder="70"
            placeholderTextColor="rgba(60, 60, 67, 0.3)"
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Altura (cm)</Text>
        <View style={styles.glassInputContainer}>
          <TextInput
            style={styles.textInput}
            value={formData.height.toString()}
            onChangeText={(text) => setFormData({ ...formData, height: parseInt(text) || 0 })}
            placeholder="170"
            placeholderTextColor="rgba(60, 60, 67, 0.3)"
            keyboardType="numeric"
          />
        </View>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={['#FF9500', '#FF6B00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconGradient}
        >
          <Activity color="white" size={40} strokeWidth={2} />
        </LinearGradient>
      </View>
      <Text style={styles.stepTitle}>Nível de Atividade 💪</Text>
      <Text style={styles.stepSubtitle}>Com que frequência você se exercita?</Text>
      
      <View style={styles.optionsContainer}>
        {activityLevels.map((level) => (
          <TouchableOpacity
            key={level.key}
            style={[
              styles.optionButton,
              formData.activityLevel === level.key && styles.optionButtonActive
            ]}
            onPress={() => setFormData({ ...formData, activityLevel: level.key as any })}
            activeOpacity={0.7}
          >
            {formData.activityLevel === level.key && (
              <LinearGradient
                colors={['rgba(0, 122, 255, 0.1)', 'rgba(90, 200, 250, 0.1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
            )}
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
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <LinearGradient
          colors={['#AF52DE', '#BF5AF2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconGradient}
        >
          <Sparkles color="white" size={40} strokeWidth={2} />
        </LinearGradient>
      </View>
      <Text style={styles.stepTitle}>Seu Objetivo 🎯</Text>
      <Text style={styles.stepSubtitle}>O que você deseja alcançar?</Text>
      
      <View style={styles.optionsContainer}>
        {goals.map((goal) => (
          <TouchableOpacity
            key={goal.key}
            style={[
              styles.optionButton,
              formData.goal === goal.key && styles.optionButtonActive
            ]}
            onPress={() => setFormData({ ...formData, goal: goal.key as any })}
            activeOpacity={0.7}
          >
            {formData.goal === goal.key && (
              <LinearGradient
                colors={['rgba(0, 122, 255, 0.1)', 'rgba(90, 200, 250, 0.1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFillObject}
              />
            )}
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
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#EAF4FF', '#D4E9FF', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.header}>
            <View style={styles.progressContainer}>
              {[1, 2, 3, 4].map((step) => (
                <View
                  key={step}
                  style={[
                    styles.progressDot,
                    currentStep >= step && styles.progressDotActive
                  ]}
                >
                  {currentStep >= step && (
                    <LinearGradient
                      colors={['#007AFF', '#5AC8FA']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={StyleSheet.absoluteFillObject}
                    />
                  )}
                </View>
              ))}
            </View>
            <Text style={styles.stepIndicator}>Passo {currentStep} de 4</Text>
          </View>

          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {Platform.OS === 'ios' ? (
              <BlurView intensity={20} tint="light" style={styles.card}>
                <View style={styles.cardInner}>
                  {currentStep === 1 && renderStep1()}
                  {currentStep === 2 && renderStep2()}
                  {currentStep === 3 && renderStep3()}
                  {currentStep === 4 && renderStep4()}
                </View>
              </BlurView>
            ) : (
              <View style={[styles.card, styles.cardAndroid]}>
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
                {currentStep === 4 && renderStep4()}
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            {Platform.OS === 'ios' ? (
              <BlurView intensity={30} tint="light" style={styles.footerBlur}>
                <View style={styles.buttonContainer}>
                  {currentStep > 1 && (
                    <TouchableOpacity
                      style={styles.backButton}
                      onPress={handleBack}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.backButtonText}>Voltar</Text>
                    </TouchableOpacity>
                  )}
                  
                  {currentStep < 4 ? (
                    <TouchableOpacity
                      style={[styles.nextButton, currentStep === 1 && styles.nextButtonFull]}
                      onPress={handleNext}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={['#007AFF', '#5AC8FA']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.buttonGradient}
                      >
                        <Text style={styles.nextButtonText}>Próximo</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.completeButton, loading && styles.completeButtonDisabled]}
                      onPress={handleComplete}
                      disabled={loading}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={['#34C759', '#30D158']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.buttonGradient}
                      >
                        <Save color="white" size={20} />
                        <Text style={styles.completeButtonText}>
                          {loading ? 'Salvando...' : 'Salvar e Continuar'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>
              </BlurView>
            ) : (
              <View style={styles.footerAndroid}>
                <View style={styles.buttonContainer}>
                  {currentStep > 1 && (
                    <TouchableOpacity
                      style={styles.backButton}
                      onPress={handleBack}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.backButtonText}>Voltar</Text>
                    </TouchableOpacity>
                  )}
                  
                  {currentStep < 4 ? (
                    <TouchableOpacity
                      style={[styles.nextButton, currentStep === 1 && styles.nextButtonFull]}
                      onPress={handleNext}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={['#007AFF', '#5AC8FA']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.buttonGradient}
                      >
                        <Text style={styles.nextButtonText}>Próximo</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.completeButton, loading && styles.completeButtonDisabled]}
                      onPress={handleComplete}
                      disabled={loading}
                      activeOpacity={0.8}
                    >
                      <LinearGradient
                        colors={['#34C759', '#30D158']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.buttonGradient}
                      >
                        <Save color="white" size={20} />
                        <Text style={styles.completeButtonText}>
                          {loading ? 'Salvando...' : 'Salvar e Continuar'}
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    alignItems: 'center',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  progressDot: {
    width: 50,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
    overflow: 'hidden',
  },
  progressDotActive: {
    backgroundColor: '#007AFF',
  },
  stepIndicator: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: '#007AFF',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  card: {
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.1)',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
  },
  cardAndroid: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 28,
  },
  cardInner: {
    padding: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  stepContainer: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 30,
    fontWeight: '800' as const,
    color: '#1A1A1C',
    marginBottom: 10,
    textAlign: 'center' as const,
    letterSpacing: -0.5,
  },
  stepSubtitle: {
    fontSize: 16,
    color: 'rgba(60, 60, 67, 0.6)',
    marginBottom: 36,
    textAlign: 'center' as const,
    lineHeight: 24,
    fontWeight: '500' as const,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1A1A1C',
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  glassInputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.15)',
    overflow: 'hidden',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  textInput: {
    padding: 18,
    fontSize: 17,
    color: '#1A1A1C',
    fontWeight: '500' as const,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.15)',
    overflow: 'hidden',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  genderButtonActive: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  genderButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: 'rgba(60, 60, 67, 0.6)',
  },
  genderButtonTextActive: {
    color: 'white',
    fontWeight: '700' as const,
  },
  optionsContainer: {
    width: '100%',
    gap: 12,
  },
  optionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.15)',
    overflow: 'hidden',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  optionButtonActive: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    color: '#1A1A1C',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  optionTitleActive: {
    color: '#007AFF',
    fontWeight: '700' as const,
  },
  optionDescription: {
    fontSize: 14,
    color: 'rgba(60, 60, 67, 0.6)',
    fontWeight: '500' as const,
  },
  optionDescriptionActive: {
    color: '#007AFF',
  },
  footer: {
    overflow: 'hidden',
  },
  footerBlur: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 122, 255, 0.1)',
  },
  footerAndroid: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 122, 255, 0.1)',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: 'rgba(0, 122, 255, 0.08)',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.2)',
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 17,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
  },
  nextButton: {
    flex: 2,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  nextButtonFull: {
    flex: 1,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
  },
  completeButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  completeButtonDisabled: {
    opacity: 0.6,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700' as const,
    letterSpacing: -0.2,
  },
});
