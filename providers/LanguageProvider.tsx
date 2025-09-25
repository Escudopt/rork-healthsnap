import { useState, useEffect, useCallback, useMemo } from 'react';
import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'pt' | 'en';

interface Translations {
  // Navigation
  home: string;
  healthyFoods: string;
  nutritionTips: string;
  supplements: string;
  workouts: string;
  profile: string;
  
  // Common
  back: string;
  settings: string;
  save: string;
  cancel: string;
  loading: string;
  error: string;
  
  // Home screen
  calorieGoal: string;
  consumed: string;
  remaining: string;
  todaysMeals: string;
  addMeal: string;
  viewAnalysis: string;
  mealHistory: string;
  
  // Settings
  settingsTitle: string;
  personalizeExperience: string;
  preferences: string;
  support: string;
  theme: string;
  darkModeActive: string;
  lightModeActive: string;
  notifications: string;
  mealReminders: string;
  language: string;
  appearance: string;
  customizeColors: string;
  privacy: string;
  privacyPolicy: string;
  help: string;
  faqSupport: string;
  about: string;
  version: string;
  data: string;
  backupSync: string;
  
  // Language names
  portuguese: string;
  english: string;
  
  // Food details
  advantages: string;
  disadvantages: string;
  nutritionalInfo: string;
  
  // Privacy Policy
  privacyPolicyTitle: string;
  privacyPolicyContent: string;
  
  // Help
  helpTitle: string;
  helpContent: string;
  
  // Healthy Foods
  superFoods: string;
  seasonalNutrition: string;
}

const translations: Record<Language, Translations> = {
  pt: {
    // Navigation
    home: 'Início',
    healthyFoods: 'Alimentos Saudáveis',
    nutritionTips: 'Dicas',
    supplements: 'Suplementos',
    workouts: 'Treinos',
    profile: 'Perfil',
    
    // Common
    back: 'Voltar',
    settings: 'Definições',
    save: 'Guardar',
    cancel: 'Cancelar',
    loading: 'A carregar...',
    error: 'Erro',
    
    // Home screen
    calorieGoal: 'Meta de Calorias',
    consumed: 'Consumidas',
    remaining: 'Restantes',
    todaysMeals: 'Refeições de Hoje',
    addMeal: 'Adicionar Refeição',
    viewAnalysis: 'Ver Análise',
    mealHistory: 'Histórico de Refeições',
    
    // Settings
    settingsTitle: 'Definições',
    personalizeExperience: 'Personalize a sua experiência',
    preferences: 'Preferências',
    support: 'Suporte',
    theme: 'Tema',
    darkModeActive: 'Modo escuro ativo',
    lightModeActive: 'Modo claro ativo',
    notifications: 'Notificações',
    mealReminders: 'Lembretes de refeições e metas',
    language: 'Idioma',
    appearance: 'Aparência',
    customizeColors: 'Personalizar cores e layout',
    privacy: 'Privacidade',
    privacyPolicy: 'Política de privacidade',
    help: 'Ajuda',
    faqSupport: 'FAQ e suporte',
    about: 'Sobre',
    version: 'Versão 1.0.0',
    data: 'Dados',
    backupSync: 'Backup e sincronização',
    
    // Language names
    portuguese: 'Português (Portugal)',
    english: 'English',
    
    // Food details
    advantages: 'Vantagens',
    disadvantages: 'Desvantagens',
    nutritionalInfo: 'Informação Nutricional',
    
    // Privacy Policy
    privacyPolicyTitle: 'Política de Privacidade',
    privacyPolicyContent: `Esta Política de Privacidade descreve como recolhemos, utilizamos e protegemos as suas informações pessoais quando utiliza a nossa aplicação de rastreamento de calorias.

1. INFORMAÇÕES QUE RECOLHEMOS

Recolhemos as seguintes informações:
• Dados de perfil (nome, idade, peso, altura, objetivos de saúde)
• Informações sobre refeições e consumo de alimentos
• Dados de atividade física e exercício
• Preferências da aplicação e configurações

2. COMO UTILIZAMOS AS SUAS INFORMAÇÕES

Utilizamos as suas informações para:
• Fornecer funcionalidades de rastreamento de calorias
• Personalizar recomendações nutricionais
• Melhorar a experiência da aplicação
• Enviar notificações relevantes (se ativadas)

3. PARTILHA DE INFORMAÇÕES

Não vendemos, alugamos ou partilhamos as suas informações pessoais com terceiros, exceto:
• Quando exigido por lei
• Para proteger os nossos direitos legais
• Com o seu consentimento explícito

4. SEGURANÇA DOS DADOS

Implementamos medidas de segurança técnicas e organizacionais para proteger as suas informações:
• Encriptação de dados sensíveis
• Acesso restrito às informações
• Monitorização regular de segurança

5. OS SEUS DIREITOS

Tem o direito de:
• Aceder aos seus dados pessoais
• Corrigir informações incorretas
• Eliminar a sua conta e dados
• Exportar os seus dados

6. RETENÇÃO DE DADOS

Mantemos os seus dados apenas pelo tempo necessário para fornecer os nossos serviços ou conforme exigido por lei.

7. ALTERAÇÕES A ESTA POLÍTICA

Podemos atualizar esta política periodicamente. Notificaremos sobre alterações significativas através da aplicação.

8. CONTACTO

Para questões sobre esta política, contacte-nos através das definições da aplicação.

Última atualização: ${new Date().toLocaleDateString('pt-PT')}`,
    
    // Help
    helpTitle: 'Ajuda e Suporte',
    helpContent: `Bem-vindo à secção de ajuda da nossa aplicação de rastreamento de calorias!

PERGUNTAS FREQUENTES

1. Como adiciono uma refeição?
• Vá ao ecrã inicial
• Toque em "Adicionar Refeição"
• Procure pelo alimento ou digitalize o código de barras
• Ajuste a quantidade e confirme

2. Como defino a minha meta de calorias?
• Aceda ao seu perfil
• Toque em "Editar Perfil"
• Ajuste a sua meta diária de calorias
• As alterações são guardadas automaticamente

3. Como vejo o meu progresso?
• O ecrã inicial mostra o resumo diário
• Toque em "Ver Análise" para detalhes
• Aceda ao "Histórico de Refeições" para dados anteriores

4. Como ativo as notificações?
• Vá às Definições
• Ative "Notificações"
• Configure os horários dos lembretes

5. Como altero o tema da aplicação?
• Nas Definições, toque em "Tema"
• Escolha entre claro, escuro ou automático

6. Como exporto os meus dados?
• Vá às Definições
• Toque em "Dados"
• Selecione "Exportar Dados"

7. A aplicação funciona offline?
• Sim, pode adicionar refeições offline
• Os dados sincronizam quando voltar online

SUPORTE TÉCNICO

Se encontrar problemas:
• Reinicie a aplicação
• Verifique a sua ligação à internet
• Atualize para a versão mais recente

Para mais ajuda, contacte-nos através das definições da aplicação.

Versão da aplicação: 1.0.0
Última atualização: ${new Date().toLocaleDateString('pt-PT')}`,
    
    // Healthy Foods
    superFoods: 'Super Alimentos',
    seasonalNutrition: 'Nutrição Sazonal',
  },
  
  en: {
    // Navigation
    home: 'Home',
    healthyFoods: 'Healthy Foods',
    nutritionTips: 'Nutrition Tips',
    supplements: 'Supplements',
    workouts: 'Workouts',
    profile: 'Profile',
    
    // Common
    back: 'Back',
    settings: 'Settings',
    save: 'Save',
    cancel: 'Cancel',
    loading: 'Loading...',
    error: 'Error',
    
    // Home screen
    calorieGoal: 'Calorie Goal',
    consumed: 'Consumed',
    remaining: 'Remaining',
    todaysMeals: 'Today\'s Meals',
    addMeal: 'Add Meal',
    viewAnalysis: 'View Analysis',
    mealHistory: 'Meal History',
    
    // Settings
    settingsTitle: 'Settings',
    personalizeExperience: 'Personalize your experience',
    preferences: 'Preferences',
    support: 'Support',
    theme: 'Theme',
    darkModeActive: 'Dark mode active',
    lightModeActive: 'Light mode active',
    notifications: 'Notifications',
    mealReminders: 'Meal reminders and goals',
    language: 'Language',
    appearance: 'Appearance',
    customizeColors: 'Customize colors and layout',
    privacy: 'Privacy',
    privacyPolicy: 'Privacy policy',
    help: 'Help',
    faqSupport: 'FAQ and support',
    about: 'About',
    version: 'Version 1.0.0',
    data: 'Data',
    backupSync: 'Backup and sync',
    
    // Language names
    portuguese: 'Português (Portugal)',
    english: 'English',
    
    // Food details
    advantages: 'Advantages',
    disadvantages: 'Disadvantages',
    nutritionalInfo: 'Nutritional Information',
    
    // Privacy Policy
    privacyPolicyTitle: 'Privacy Policy',
    privacyPolicyContent: `This Privacy Policy describes how we collect, use, and protect your personal information when you use our calorie tracking application.

1. INFORMATION WE COLLECT

We collect the following information:
• Profile data (name, age, weight, height, health goals)
• Meal and food consumption information
• Physical activity and exercise data
• App preferences and settings

2. HOW WE USE YOUR INFORMATION

We use your information to:
• Provide calorie tracking functionality
• Personalize nutritional recommendations
• Improve the app experience
• Send relevant notifications (if enabled)

3. INFORMATION SHARING

We do not sell, rent, or share your personal information with third parties, except:
• When required by law
• To protect our legal rights
• With your explicit consent

4. DATA SECURITY

We implement technical and organizational security measures to protect your information:
• Encryption of sensitive data
• Restricted access to information
• Regular security monitoring

5. YOUR RIGHTS

You have the right to:
• Access your personal data
• Correct incorrect information
• Delete your account and data
• Export your data

6. DATA RETENTION

We keep your data only as long as necessary to provide our services or as required by law.

7. CHANGES TO THIS POLICY

We may update this policy periodically. We will notify you of significant changes through the app.

8. CONTACT

For questions about this policy, contact us through the app settings.

Last updated: ${new Date().toLocaleDateString('en-GB')}`,
    
    // Help
    helpTitle: 'Help & Support',
    helpContent: `Welcome to the help section of our calorie tracking app!

FREQUENTLY ASKED QUESTIONS

1. How do I add a meal?
• Go to the home screen
• Tap "Add Meal"
• Search for food or scan barcode
• Adjust quantity and confirm

2. How do I set my calorie goal?
• Access your profile
• Tap "Edit Profile"
• Adjust your daily calorie goal
• Changes are saved automatically

3. How do I view my progress?
• The home screen shows daily summary
• Tap "View Analysis" for details
• Access "Meal History" for past data

4. How do I enable notifications?
• Go to Settings
• Enable "Notifications"
• Configure reminder times

5. How do I change the app theme?
• In Settings, tap "Theme"
• Choose between light, dark, or automatic

6. How do I export my data?
• Go to Settings
• Tap "Data"
• Select "Export Data"

7. Does the app work offline?
• Yes, you can add meals offline
• Data syncs when back online

TECHNICAL SUPPORT

If you encounter issues:
• Restart the app
• Check your internet connection
• Update to the latest version

For more help, contact us through the app settings.

App version: 1.0.0
Last updated: ${new Date().toLocaleDateString('en-GB')}`,
    
    // Healthy Foods
    superFoods: 'Super Foods',
    seasonalNutrition: 'Seasonal Nutrition',
  },
};

interface LanguageContextType {
  language: Language;
  translations: Translations;
  setLanguage: (language: Language) => Promise<void>;
  t: (key: keyof Translations) => string;
}

export const [LanguageProvider, useLanguage] = createContextHook<LanguageContextType>(() => {
  const [language, setLanguageState] = useState<Language>('pt');

  // Load language preference from AsyncStorage
  const loadLanguage = useCallback(async () => {
    try {
      const storedLanguage = await AsyncStorage.getItem('app_language');
      if (storedLanguage && ['pt', 'en'].includes(storedLanguage)) {
        setLanguageState(storedLanguage as Language);
        console.log('🌍 Language loaded from storage:', storedLanguage);
      } else {
        console.log('🌍 Language initialized with default (pt)');
      }
    } catch (error) {
      console.error('❌ Error loading language:', error);
    }
  }, []);

  // Save language preference to AsyncStorage
  const setLanguage = useCallback(async (newLanguage: Language) => {
    if (!['pt', 'en'].includes(newLanguage)) {
      console.error('❌ Invalid language:', newLanguage);
      return;
    }
    
    try {
      setLanguageState(newLanguage);
      await AsyncStorage.setItem('app_language', newLanguage);
      console.log('💾 Language saved:', newLanguage);
    } catch (error) {
      console.error('❌ Error saving language:', error);
      setLanguageState('pt'); // Fallback to default
    }
  }, []);

  // Translation function
  const t = useCallback((key: keyof Translations): string => {
    return translations[language][key] || key;
  }, [language]);

  // Load language on mount
  useEffect(() => {
    loadLanguage();
  }, [loadLanguage]);

  return useMemo(() => ({
    language,
    translations: translations[language],
    setLanguage,
    t,
  }), [language, setLanguage, t]);
});