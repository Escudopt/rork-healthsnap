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
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Save, User, Scale, Ruler, Activity } from 'lucide-react-native';
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
        <User color="#007AFF" size={48} strokeWidth={1.5} />
      </View>
      <Text style={styles.stepTitle}>Bem-vindo ao HealthSnap!</Text>
      <Text style={styles.stepSubtitle}>Vamos começar com suas informações básicas</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Nome</Text>
        <TextInput
          style={styles.textInput}
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          placeholder="Seu nome"
          placeholderTextColor="#999"
          autoFocus
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Idade</Text>
        <TextInput
          style={styles.textInput}
          value={formData.age.toString()}
          onChangeText={(text) => setFormData({ ...formData, age: parseInt(text) || 0 })}
          placeholder="25"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />
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
          >
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
          >
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
        <Scale color="#007AFF" size={48} strokeWidth={1.5} />
      </View>
      <Text style={styles.stepTitle}>Medidas Corporais</Text>
      <Text style={styles.stepSubtitle}>Precisamos dessas informações para calcular suas metas</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Peso (kg)</Text>
        <TextInput
          style={styles.textInput}
          value={formData.weight.toString()}
          onChangeText={(text) => setFormData({ ...formData, weight: parseFloat(text) || 0 })}
          placeholder="70"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Altura (cm)</Text>
        <TextInput
          style={styles.textInput}
          value={formData.height.toString()}
          onChangeText={(text) => setFormData({ ...formData, height: parseInt(text) || 0 })}
          placeholder="170"
          placeholderTextColor="#999"
          keyboardType="numeric"
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Activity color="#007AFF" size={48} strokeWidth={1.5} />
      </View>
      <Text style={styles.stepTitle}>Nível de Atividade</Text>
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
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Ruler color="#007AFF" size={48} strokeWidth={1.5} />
      </View>
      <Text style={styles.stepTitle}>Seu Objetivo</Text>
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
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#007AFF', '#0051D5', '#003DA5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
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
                />
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
            <View style={styles.card}>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.buttonContainer}>
              {currentStep > 1 && (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleBack}
                >
                  <Text style={styles.backButtonText}>Voltar</Text>
                </TouchableOpacity>
              )}
              
              {currentStep < 4 ? (
                <TouchableOpacity
                  style={[styles.nextButton, currentStep === 1 && styles.nextButtonFull]}
                  onPress={handleNext}
                >
                  <Text style={styles.nextButtonText}>Próximo</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.completeButton, loading && styles.completeButtonDisabled]}
                  onPress={handleComplete}
                  disabled={loading}
                >
                  <Save color="white" size={20} />
                  <Text style={styles.completeButtonText}>
                    {loading ? 'Salvando...' : 'Salvar e Continuar'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
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
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressDotActive: {
    backgroundColor: 'white',
  },
  stepIndicator: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: 'white',
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  stepContainer: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F0F8FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#1C1C1E',
    marginBottom: 8,
    textAlign: 'center' as const,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 32,
    textAlign: 'center' as const,
    lineHeight: 22,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1C1C1E',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E5EA',
  },
  genderButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  genderButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#8E8E93',
  },
  genderButtonTextActive: {
    color: 'white',
  },
  optionsContainer: {
    width: '100%',
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E5EA',
  },
  optionButtonActive: {
    backgroundColor: '#E3F2FF',
    borderColor: '#007AFF',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1C1C1E',
    marginBottom: 4,
  },
  optionTitleActive: {
    color: '#007AFF',
  },
  optionDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  optionDescriptionActive: {
    color: '#007AFF',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  nextButton: {
    flex: 2,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonFull: {
    flex: 1,
  },
  nextButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '700' as const,
  },
  completeButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  completeButtonDisabled: {
    opacity: 0.6,
  },
  completeButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '700' as const,
  },
});
