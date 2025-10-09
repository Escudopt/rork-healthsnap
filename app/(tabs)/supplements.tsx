import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus, X, Edit2, Check, ChevronDown, Pill } from 'lucide-react-native';
import { useTheme, useThemedStyles } from '@/providers/ThemeProvider';
import { useCalorieTracker } from '@/providers/CalorieTrackerProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MyVitamin {
  id: string;
  name: string;
  dosage: string;
  time: string;
  notes?: string;
}

const MY_VITAMINS_STORAGE_KEY = 'my_vitamins_v1';

const COMMON_VITAMINS = [
  { name: 'Vitamina D3', defaultDosage: '2000 UI/dia' },
  { name: 'Vitamina C', defaultDosage: '500-1000 mg/dia' },
  { name: 'Ómega-3', defaultDosage: '1000-2000 mg/dia' },
  { name: 'Magnésio', defaultDosage: '300-400 mg/dia' },
  { name: 'Zinco', defaultDosage: '11 mg/dia' },
  { name: 'Vitamina B12', defaultDosage: '2.4 mcg/dia' },
  { name: 'Cálcio', defaultDosage: '1000 mg/dia' },
  { name: 'Ferro', defaultDosage: '18 mg/dia' },
  { name: 'Whey Protein', defaultDosage: '25-30 g/dia' },
  { name: 'Creatina', defaultDosage: '3-5 g/dia' },
  { name: 'Multivitamínico', defaultDosage: '1 comprimido/dia' },
  { name: 'Probióticos', defaultDosage: '1-2 cápsulas/dia' },
  { name: 'Colágeno', defaultDosage: '10 g/dia' },
  { name: 'Melatonina', defaultDosage: '1-3 mg/dia' },
].sort((a, b) => a.name.localeCompare(b.name));

const COMMON_DOSAGES = [
  '1 comprimido/dia',
  '2 comprimidos/dia',
  '1 cápsula/dia',
  '2 cápsulas/dia',
  '500 mg/dia',
  '1000 mg/dia',
  '2000 mg/dia',
  '2000 UI/dia',
  '4000 UI/dia',
  '25g/dia',
  '30g/dia',
  '3-5g/dia',
  '10g/dia',
];

const COMMON_TIMES = [
  'Após o pequeno-almoço',
  'Antes do pequeno-almoço',
  'Após o almoço',
  'Antes de dormir',
  'Ao acordar',
  'Com as refeições',
  'Manhã',
  'Noite',
];

export default function SupplementsScreen() {
  const { colors, isDark } = useTheme();
  const { meals } = useCalorieTracker();
  const insets = useSafeAreaInsets();
  
  const [myVitamins, setMyVitamins] = useState<MyVitamin[]>([]);
  const [isAddingVitamin, setIsAddingVitamin] = useState<boolean>(false);
  const [editingVitaminId, setEditingVitaminId] = useState<string | null>(null);
  const [newVitaminName, setNewVitaminName] = useState<string>('');
  const [showVitaminPicker, setShowVitaminPicker] = useState<boolean>(false);
  const [vitaminSearchQuery, setVitaminSearchQuery] = useState<string>('');
  const [newVitaminDosage, setNewVitaminDosage] = useState<string>('');
  const [newVitaminTime, setNewVitaminTime] = useState<string>('');
  const [newVitaminNotes, setNewVitaminNotes] = useState<string>('');
  const [showDosagePicker, setShowDosagePicker] = useState<boolean>(false);
  const [showTimePicker, setShowTimePicker] = useState<boolean>(false);

  const [analysis, setAnalysis] = useState<{
    coverage: string[];
    missing: string[];
  }>({ coverage: [], missing: [] });

  useEffect(() => {
    loadMyVitamins();
  }, []);
  
  const analyzeNutrition = useCallback(() => {
    const today = new Date().toDateString();
    const todayMeals = meals.filter(meal => {
      if (!meal?.timestamp) return false;
      try {
        return new Date(meal.timestamp).toDateString() === today;
      } catch {
        return false;
      }
    });
    
    const nutritionalAnalysis = todayMeals.reduce((acc, meal) => {
      meal.foods?.forEach((food: any) => {
        acc.protein += food.protein || 0;
        acc.fiber += food.fiber || 0;
        acc.calcium += food.calcium || 0;
        acc.vitaminC += food.vitaminC || 0;
        acc.vitaminD += food.vitaminD || 0;
        acc.omega3 += food.omega3 || 0;
        acc.magnesium += food.magnesium || 0;
        acc.zinc += food.zinc || 0;
        acc.vitaminB12 += food.vitaminB12 || 0;
        acc.iron += food.iron || 0;
      });
      return acc;
    }, {
      protein: 0, fiber: 0, calcium: 0, vitaminC: 0, vitaminD: 0, 
      omega3: 0, magnesium: 0, zinc: 0, vitaminB12: 0, iron: 0
    });
    
    myVitamins.forEach(vitamin => {
      const vitaminNameLower = vitamin.name.toLowerCase();
      const dosageLower = vitamin.dosage.toLowerCase();
      
      if (vitaminNameLower.includes('whey') || vitaminNameLower.includes('proteína')) {
        const gramsMatch = dosageLower.match(/(\d+)\s*g/);
        if (gramsMatch) {
          nutritionalAnalysis.protein += parseInt(gramsMatch[1]);
        }
      }
      
      if (vitaminNameLower.includes('vitamina d')) {
        const uiMatch = dosageLower.match(/(\d+)\s*ui/);
        if (uiMatch) {
          nutritionalAnalysis.vitaminD += parseInt(uiMatch[1]);
        }
      }
      
      if (vitaminNameLower.includes('vitamina c')) {
        const mgMatch = dosageLower.match(/(\d+)\s*mg/);
        if (mgMatch) {
          nutritionalAnalysis.vitaminC += parseInt(mgMatch[1]);
        }
      }
      
      if (vitaminNameLower.includes('ómega') || vitaminNameLower.includes('omega')) {
        const mgMatch = dosageLower.match(/(\d+)\s*mg/);
        if (mgMatch) {
          nutritionalAnalysis.omega3 += parseInt(mgMatch[1]);
        }
      }
      
      if (vitaminNameLower.includes('magnésio') || vitaminNameLower.includes('magnesio')) {
        const mgMatch = dosageLower.match(/(\d+)\s*mg/);
        if (mgMatch) {
          nutritionalAnalysis.magnesium += parseInt(mgMatch[1]);
        }
      }
      
      if (vitaminNameLower.includes('zinco')) {
        const mgMatch = dosageLower.match(/(\d+)\s*mg/);
        if (mgMatch) {
          nutritionalAnalysis.zinc += parseInt(mgMatch[1]);
        }
      }
      
      if (vitaminNameLower.includes('b12')) {
        const mcgMatch = dosageLower.match(/(\d+\.?\d*)\s*mcg/);
        if (mcgMatch) {
          nutritionalAnalysis.vitaminB12 += parseFloat(mcgMatch[1]);
        }
      }
      
      if (vitaminNameLower.includes('cálcio') || vitaminNameLower.includes('calcio')) {
        const mgMatch = dosageLower.match(/(\d+)\s*mg/);
        if (mgMatch) {
          nutritionalAnalysis.calcium += parseInt(mgMatch[1]);
        }
      }
      
      if (vitaminNameLower.includes('ferro')) {
        const mgMatch = dosageLower.match(/(\d+)\s*mg/);
        if (mgMatch) {
          nutritionalAnalysis.iron += parseInt(mgMatch[1]);
        }
      }
    });
    
    const coverage: string[] = [];
    const missing: string[] = [];
    
    if (nutritionalAnalysis.protein >= 60) {
      coverage.push(`Proteína: ${Math.round(nutritionalAnalysis.protein)}g ✓`);
    } else {
      missing.push(`Proteína: ${Math.round(nutritionalAnalysis.protein)}g / 60g`);
    }
    
    if (nutritionalAnalysis.fiber >= 25) {
      coverage.push(`Fibras: ${Math.round(nutritionalAnalysis.fiber)}g ✓`);
    } else {
      missing.push(`Fibras: ${Math.round(nutritionalAnalysis.fiber)}g / 25g`);
    }
    
    if (nutritionalAnalysis.calcium >= 1000) {
      coverage.push(`Cálcio: ${Math.round(nutritionalAnalysis.calcium)}mg ✓`);
    } else {
      missing.push(`Cálcio: ${Math.round(nutritionalAnalysis.calcium)}mg / 1000mg`);
    }
    
    if (nutritionalAnalysis.vitaminC >= 90) {
      coverage.push(`Vitamina C: ${Math.round(nutritionalAnalysis.vitaminC)}mg ✓`);
    } else {
      missing.push(`Vitamina C: ${Math.round(nutritionalAnalysis.vitaminC)}mg / 90mg`);
    }
    
    if (nutritionalAnalysis.vitaminD >= 2000) {
      coverage.push(`Vitamina D: ${Math.round(nutritionalAnalysis.vitaminD)}UI ✓`);
    } else {
      missing.push(`Vitamina D: ${Math.round(nutritionalAnalysis.vitaminD)}UI / 2000UI`);
    }
    
    if (nutritionalAnalysis.omega3 >= 1000) {
      coverage.push(`Ómega-3: ${Math.round(nutritionalAnalysis.omega3)}mg ✓`);
    } else {
      missing.push(`Ómega-3: ${Math.round(nutritionalAnalysis.omega3)}mg / 1000mg`);
    }
    
    if (nutritionalAnalysis.magnesium >= 300) {
      coverage.push(`Magnésio: ${Math.round(nutritionalAnalysis.magnesium)}mg ✓`);
    } else {
      missing.push(`Magnésio: ${Math.round(nutritionalAnalysis.magnesium)}mg / 300mg`);
    }
    
    if (nutritionalAnalysis.zinc >= 11) {
      coverage.push(`Zinco: ${Math.round(nutritionalAnalysis.zinc)}mg ✓`);
    } else {
      missing.push(`Zinco: ${Math.round(nutritionalAnalysis.zinc)}mg / 11mg`);
    }
    
    if (nutritionalAnalysis.vitaminB12 >= 2.4) {
      coverage.push(`Vitamina B12: ${nutritionalAnalysis.vitaminB12.toFixed(1)}mcg ✓`);
    } else {
      missing.push(`Vitamina B12: ${nutritionalAnalysis.vitaminB12.toFixed(1)}mcg / 2.4mcg`);
    }
    
    if (nutritionalAnalysis.iron >= 18) {
      coverage.push(`Ferro: ${Math.round(nutritionalAnalysis.iron)}mg ✓`);
    } else {
      missing.push(`Ferro: ${Math.round(nutritionalAnalysis.iron)}mg / 18mg`);
    }
    
    setAnalysis({ coverage, missing });
  }, [meals, myVitamins]);
  
  useEffect(() => {
    if (myVitamins.length > 0 || meals.length > 0) {
      analyzeNutrition();
    }
  }, [myVitamins, meals, analyzeNutrition]);
  
  const loadMyVitamins = async () => {
    try {
      const stored = await AsyncStorage.getItem(MY_VITAMINS_STORAGE_KEY);
      if (stored) {
        const vitamins = JSON.parse(stored) as MyVitamin[];
        if (Array.isArray(vitamins)) {
          setMyVitamins(vitamins);
        }
      }
    } catch (error) {
      console.error('Error loading vitamins:', error);
    }
  };
  
  const saveMyVitamins = async (vitamins: MyVitamin[]) => {
    try {
      await AsyncStorage.setItem(MY_VITAMINS_STORAGE_KEY, JSON.stringify(vitamins));
    } catch (error) {
      console.error('Error saving vitamins:', error);
    }
  };
  

  
  const selectVitamin = (vitamin: { name: string; defaultDosage: string }) => {
    setNewVitaminName(vitamin.name);
    if (!newVitaminDosage.trim()) {
      setNewVitaminDosage(vitamin.defaultDosage);
    }
    setShowVitaminPicker(false);
    setVitaminSearchQuery('');
  };
  
  const addVitamin = async () => {
    if (!newVitaminName.trim() || !newVitaminDosage.trim()) {
      Alert.alert('Erro', 'Preencha nome e dosagem');
      return;
    }
    
    const newVitamin: MyVitamin = {
      id: `vitamin_${Date.now()}`,
      name: newVitaminName.trim(),
      dosage: newVitaminDosage.trim(),
      time: newVitaminTime.trim() || 'Não especificado',
      notes: newVitaminNotes.trim(),
    };
    
    const updatedVitamins = [...myVitamins, newVitamin];
    setMyVitamins(updatedVitamins);
    await saveMyVitamins(updatedVitamins);
    
    Keyboard.dismiss();
    
    setNewVitaminName('');
    setNewVitaminDosage('');
    setNewVitaminTime('');
    setNewVitaminNotes('');
    setIsAddingVitamin(false);
    
    setTimeout(() => {
      checkGoalAchievement(newVitamin);
    }, 500);
  };
  
  const updateVitamin = async (id: string) => {
    if (!newVitaminName.trim() || !newVitaminDosage.trim()) {
      Alert.alert('Erro', 'Preencha nome e dosagem');
      return;
    }
    
    const updatedVitamin = {
      id,
      name: newVitaminName.trim(),
      dosage: newVitaminDosage.trim(),
      time: newVitaminTime.trim() || 'Não especificado',
      notes: newVitaminNotes.trim(),
    };
    
    const updatedVitamins = myVitamins.map(v => 
      v.id === id ? updatedVitamin : v
    );
    
    setMyVitamins(updatedVitamins);
    await saveMyVitamins(updatedVitamins);
    
    Keyboard.dismiss();
    
    setEditingVitaminId(null);
    setNewVitaminName('');
    setNewVitaminDosage('');
    setNewVitaminTime('');
    setNewVitaminNotes('');
    
    setTimeout(() => {
      checkGoalAchievement(updatedVitamin);
    }, 500);
  };
  
  const deleteVitamin = async (id: string) => {
    Alert.alert(
      'Eliminar',
      'Tem a certeza?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const updatedVitamins = myVitamins.filter(v => v.id !== id);
            setMyVitamins(updatedVitamins);
            await saveMyVitamins(updatedVitamins);
          },
        },
      ]
    );
  };
  
  const startEditVitamin = (vitamin: MyVitamin) => {
    setEditingVitaminId(vitamin.id);
    setNewVitaminName(vitamin.name);
    setNewVitaminDosage(vitamin.dosage);
    setNewVitaminTime(vitamin.time === 'Não especificado' ? '' : vitamin.time);
    setNewVitaminNotes(vitamin.notes || '');
  };
  
  const cancelEdit = () => {
    setEditingVitaminId(null);
    setIsAddingVitamin(false);
    setNewVitaminName('');
    setNewVitaminDosage('');
    setNewVitaminTime('');
    setNewVitaminNotes('');
    setShowVitaminPicker(false);
    setVitaminSearchQuery('');
  };
  
  const checkGoalAchievement = (vitamin: MyVitamin) => {
    const vitaminNameLower = vitamin.name.toLowerCase();
    const dosageLower = vitamin.dosage.toLowerCase();
    
    let achievedGoals: string[] = [];
    
    if (vitaminNameLower.includes('whey') || vitaminNameLower.includes('proteína')) {
      const gramsMatch = dosageLower.match(/(\d+)\s*g/);
      if (gramsMatch) {
        const proteinAmount = parseInt(gramsMatch[1]);
        if (proteinAmount >= 20) {
          achievedGoals.push(`Proteína: +${proteinAmount}g`);
        }
      }
    }
    
    if (vitaminNameLower.includes('vitamina d')) {
      const uiMatch = dosageLower.match(/(\d+)\s*ui/);
      if (uiMatch && parseInt(uiMatch[1]) >= 2000) {
        achievedGoals.push('Vitamina D: Meta diária atingida ✓');
      }
    }
    
    if (vitaminNameLower.includes('vitamina c')) {
      const mgMatch = dosageLower.match(/(\d+)\s*mg/);
      if (mgMatch && parseInt(mgMatch[1]) >= 90) {
        achievedGoals.push('Vitamina C: Meta diária atingida ✓');
      }
    }
    
    if (vitaminNameLower.includes('ómega') || vitaminNameLower.includes('omega')) {
      const mgMatch = dosageLower.match(/(\d+)\s*mg/);
      if (mgMatch && parseInt(mgMatch[1]) >= 1000) {
        achievedGoals.push('Ómega-3: Meta diária atingida ✓');
      }
    }
    
    if (vitaminNameLower.includes('magnésio') || vitaminNameLower.includes('magnesio')) {
      const mgMatch = dosageLower.match(/(\d+)\s*mg/);
      if (mgMatch && parseInt(mgMatch[1]) >= 300) {
        achievedGoals.push('Magnésio: Meta diária atingida ✓');
      }
    }
    
    if (vitaminNameLower.includes('zinco')) {
      const mgMatch = dosageLower.match(/(\d+)\s*mg/);
      if (mgMatch && parseInt(mgMatch[1]) >= 11) {
        achievedGoals.push('Zinco: Meta diária atingida ✓');
      }
    }
    
    if (vitaminNameLower.includes('b12')) {
      const mcgMatch = dosageLower.match(/(\d+\.?\d*)\s*mcg/);
      if (mcgMatch && parseFloat(mcgMatch[1]) >= 2.4) {
        achievedGoals.push('Vitamina B12: Meta diária atingida ✓');
      }
    }
    
    if (vitaminNameLower.includes('cálcio') || vitaminNameLower.includes('calcio')) {
      const mgMatch = dosageLower.match(/(\d+)\s*mg/);
      if (mgMatch && parseInt(mgMatch[1]) >= 1000) {
        achievedGoals.push('Cálcio: Meta diária atingida ✓');
      }
    }
    
    if (vitaminNameLower.includes('ferro')) {
      const mgMatch = dosageLower.match(/(\d+)\s*mg/);
      if (mgMatch && parseInt(mgMatch[1]) >= 18) {
        achievedGoals.push('Ferro: Meta diária atingida ✓');
      }
    }
    
    if (achievedGoals.length > 0) {
      Alert.alert(
        '🎉 Parabéns!',
        achievedGoals.join('\n'),
        [{ text: 'OK' }]
      );
    }
  };
  
  const filteredVitamins = COMMON_VITAMINS.filter(vitamin => 
    vitamin.name.toLowerCase().includes(vitaminSearchQuery.toLowerCase())
  );

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
      marginBottom: 32,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: '700' as const,
      color: colors.text,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#007AFF',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      gap: 4,
    },
    addButtonText: {
      fontSize: 15,
      fontWeight: '600' as const,
      color: 'white',
    },
    card: {
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
    },
    vitaminRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    vitaminInfo: {
      flex: 1,
    },
    vitaminName: {
      fontSize: 17,
      fontWeight: '600' as const,
      color: colors.text,
      marginBottom: 4,
    },
    vitaminDosage: {
      fontSize: 15,
      color: colors.textSecondary,
    },
    vitaminActions: {
      flexDirection: 'row',
      gap: 8,
    },
    iconButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyCard: {
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      borderRadius: 12,
      padding: 24,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 15,
      color: colors.textSecondary,
      textAlign: 'center',
      marginTop: 8,
    },
    formCard: {
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
    },
    inputLabel: {
      fontSize: 13,
      fontWeight: '600' as const,
      color: colors.textSecondary,
      marginBottom: 6,
      marginTop: 12,
    },
    input: {
      backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 17,
      color: colors.text,
    },
    pickerButton: {
      backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    pickerButtonText: {
      fontSize: 17,
      color: colors.text,
    },
    pickerPlaceholder: {
      color: colors.textSecondary,
    },
    formActions: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 16,
    },
    formButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 8,
      gap: 6,
    },
    saveButton: {
      backgroundColor: '#007AFF',
    },
    cancelButton: {
      backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
    },
    formButtonText: {
      fontSize: 17,
      fontWeight: '600' as const,
    },
    saveButtonText: {
      color: 'white',
    },
    cancelButtonText: {
      color: colors.text,
    },
    analysisCard: {
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
    },
    analysisTitle: {
      fontSize: 17,
      fontWeight: '600' as const,
      color: colors.text,
      marginBottom: 12,
    },
    analysisItem: {
      fontSize: 15,
      color: colors.text,
      marginBottom: 6,
      lineHeight: 22,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '80%',
    },
    modalHeader: {
      padding: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700' as const,
      color: colors.text,
      marginBottom: 12,
    },
    searchInput: {
      backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 17,
      color: colors.text,
    },
    modalList: {
      maxHeight: 400,
    },
    modalItem: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalItemName: {
      fontSize: 17,
      fontWeight: '600' as const,
      color: colors.text,
      marginBottom: 4,
    },
    modalItemDosage: {
      fontSize: 15,
      color: colors.textSecondary,
    },
    modalCloseButton: {
      padding: 16,
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    modalCloseButtonText: {
      fontSize: 17,
      fontWeight: '600' as const,
      color: '#007AFF',
    },
  }));

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <LinearGradient
        colors={isDark ? ['#000000', '#1C1C1E'] : ['#F2F2F7', '#FFFFFF']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent" 
        translucent 
      />
      
      <View style={{ flex: 1 }}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
            <Text style={styles.title}>Suplementos</Text>
            <Text style={styles.subtitle}>Gerencie suas vitaminas</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Minhas Vitaminas</Text>
              {!isAddingVitamin && (
                <TouchableOpacity 
                  style={styles.addButton}
                  onPress={() => setIsAddingVitamin(true)}
                >
                  <Plus color="white" size={18} strokeWidth={2.5} />
                  <Text style={styles.addButtonText}>Adicionar</Text>
                </TouchableOpacity>
              )}
            </View>

            {isAddingVitamin && (
              <View style={styles.formCard}>
                <Text style={styles.inputLabel}>Vitamina</Text>
                <TouchableOpacity 
                  style={styles.pickerButton}
                  onPress={() => setShowVitaminPicker(true)}
                >
                  <Text style={[
                    styles.pickerButtonText,
                    !newVitaminName && styles.pickerPlaceholder
                  ]}>
                    {newVitaminName || 'Selecionar'}
                  </Text>
                  <ChevronDown color={colors.textSecondary} size={20} />
                </TouchableOpacity>
                
                <Text style={styles.inputLabel}>Dosagem</Text>
                <TouchableOpacity 
                  style={styles.pickerButton}
                  onPress={() => setShowDosagePicker(true)}
                >
                  <Text style={[
                    styles.pickerButtonText,
                    !newVitaminDosage && styles.pickerPlaceholder
                  ]}>
                    {newVitaminDosage || 'Selecionar'}
                  </Text>
                  <ChevronDown color={colors.textSecondary} size={20} />
                </TouchableOpacity>
                
                <Text style={styles.inputLabel}>Horário (opcional)</Text>
                <TouchableOpacity 
                  style={styles.pickerButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text style={[
                    styles.pickerButtonText,
                    !newVitaminTime && styles.pickerPlaceholder
                  ]}>
                    {newVitaminTime || 'Selecionar'}
                  </Text>
                  <ChevronDown color={colors.textSecondary} size={20} />
                </TouchableOpacity>
                
                <View style={styles.formActions}>
                  <TouchableOpacity 
                    style={[styles.formButton, styles.cancelButton]}
                    onPress={cancelEdit}
                  >
                    <X color={colors.text} size={18} strokeWidth={2.5} />
                    <Text style={[styles.formButtonText, styles.cancelButtonText]}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.formButton, styles.saveButton]}
                    onPress={addVitamin}
                  >
                    <Check color="white" size={18} strokeWidth={2.5} />
                    <Text style={[styles.formButtonText, styles.saveButtonText]}>Guardar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {myVitamins.length === 0 && !isAddingVitamin && (
              <View style={styles.emptyCard}>
                <Pill color={colors.textSecondary} size={32} />
                <Text style={styles.emptyText}>
                  Nenhuma vitamina adicionada
                </Text>
              </View>
            )}

            {myVitamins.map((vitamin) => (
              editingVitaminId === vitamin.id ? (
                <View key={vitamin.id} style={styles.formCard}>
                  <Text style={styles.inputLabel}>Vitamina</Text>
                  <TouchableOpacity 
                    style={styles.pickerButton}
                    onPress={() => setShowVitaminPicker(true)}
                  >
                    <Text style={styles.pickerButtonText}>{newVitaminName}</Text>
                    <ChevronDown color={colors.textSecondary} size={20} />
                  </TouchableOpacity>
                  
                  <Text style={styles.inputLabel}>Dosagem</Text>
                  <TouchableOpacity 
                    style={styles.pickerButton}
                    onPress={() => setShowDosagePicker(true)}
                  >
                    <Text style={styles.pickerButtonText}>{newVitaminDosage}</Text>
                    <ChevronDown color={colors.textSecondary} size={20} />
                  </TouchableOpacity>
                  
                  <Text style={styles.inputLabel}>Horário</Text>
                  <TouchableOpacity 
                    style={styles.pickerButton}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <Text style={[
                      styles.pickerButtonText,
                      !newVitaminTime && styles.pickerPlaceholder
                    ]}>
                      {newVitaminTime || 'Selecionar'}
                    </Text>
                    <ChevronDown color={colors.textSecondary} size={20} />
                  </TouchableOpacity>
                  
                  <View style={styles.formActions}>
                    <TouchableOpacity 
                      style={[styles.formButton, styles.cancelButton]}
                      onPress={cancelEdit}
                    >
                      <X color={colors.text} size={18} strokeWidth={2.5} />
                      <Text style={[styles.formButtonText, styles.cancelButtonText]}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.formButton, styles.saveButton]}
                      onPress={() => updateVitamin(vitamin.id)}
                    >
                      <Check color="white" size={18} strokeWidth={2.5} />
                      <Text style={[styles.formButtonText, styles.saveButtonText]}>Guardar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View key={vitamin.id} style={styles.card}>
                  <View style={styles.vitaminRow}>
                    <View style={styles.vitaminInfo}>
                      <Text style={styles.vitaminName}>{vitamin.name}</Text>
                      <Text style={styles.vitaminDosage}>
                        {vitamin.dosage} • {vitamin.time}
                      </Text>
                    </View>
                    <View style={styles.vitaminActions}>
                      <TouchableOpacity 
                        style={styles.iconButton}
                        onPress={() => startEditVitamin(vitamin)}
                      >
                        <Edit2 color={colors.textSecondary} size={16} strokeWidth={2} />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.iconButton}
                        onPress={() => deleteVitamin(vitamin.id)}
                      >
                        <X color={colors.textSecondary} size={16} strokeWidth={2} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              )
            ))}
          </View>

          {(myVitamins.length > 0 || meals.length > 0) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Análise de Hoje</Text>
              
              {analysis.coverage.length > 0 && (
                <View style={styles.analysisCard}>
                  <Text style={styles.analysisTitle}>✅ Bem Coberto</Text>
                  {analysis.coverage.map((item, index) => (
                    <Text key={index} style={styles.analysisItem}>• {item}</Text>
                  ))}
                </View>
              )}
              
              {analysis.missing.length > 0 && (
                <View style={styles.analysisCard}>
                  <Text style={styles.analysisTitle}>⚠️ Atenção</Text>
                  {analysis.missing.map((item, index) => (
                    <Text key={index} style={styles.analysisItem}>• {item}</Text>
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
      
      <Modal
        visible={showVitaminPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowVitaminPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Vitamina</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Pesquisar..."
                placeholderTextColor={colors.textSecondary}
                value={vitaminSearchQuery}
                onChangeText={setVitaminSearchQuery}
              />
            </View>
            
            <ScrollView style={styles.modalList}>
              {filteredVitamins.map((vitamin, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.modalItem}
                  onPress={() => selectVitamin(vitamin)}
                >
                  <Text style={styles.modalItemName}>{vitamin.name}</Text>
                  <Text style={styles.modalItemDosage}>{vitamin.defaultDosage}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setShowVitaminPicker(false);
                setVitaminSearchQuery('');
              }}
            >
              <Text style={styles.modalCloseButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      <Modal
        visible={showDosagePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDosagePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Dosagem</Text>
            </View>
            
            <ScrollView style={styles.modalList}>
              {COMMON_DOSAGES.map((dosage, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.modalItem}
                  onPress={() => {
                    setNewVitaminDosage(dosage);
                    setShowDosagePicker(false);
                  }}
                >
                  <Text style={styles.modalItemName}>{dosage}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowDosagePicker(false)}
            >
              <Text style={styles.modalCloseButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      <Modal
        visible={showTimePicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecionar Horário</Text>
            </View>
            
            <ScrollView style={styles.modalList}>
              {COMMON_TIMES.map((time, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.modalItem}
                  onPress={() => {
                    setNewVitaminTime(time);
                    setShowTimePicker(false);
                  }}
                >
                  <Text style={styles.modalItemName}>{time}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowTimePicker(false)}
            >
              <Text style={styles.modalCloseButtonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
