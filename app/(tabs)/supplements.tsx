import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle, AlertCircle, Plus, X, Trash2 } from 'lucide-react-native';
import { useTheme, useThemedStyles } from '@/providers/ThemeProvider';
import { useCalorieTracker } from '@/providers/CalorieTrackerProvider';

interface SupplementInfo {
  name: string;
  function: string;
  dailyDose: string;
  dailyTarget: number;
  unit: 'g' | 'mg' | 'mcg' | 'UI';
  category: 'supplement' | 'vitamin';
}

const SUPPLEMENTS: SupplementInfo[] = [
  { name: 'Whey Protein', function: 'Crescimento muscular, recuperação pós-treino e saciedade', dailyDose: '25-30g', dailyTarget: 30, unit: 'g', category: 'supplement' },
  { name: 'Creatina', function: 'Aumento de força, performance atlética e função cognitiva', dailyDose: '3-5g', dailyTarget: 5, unit: 'g', category: 'supplement' },
  { name: 'Ómega-3', function: 'Saúde cardiovascular, função cerebral e redução de inflamação', dailyDose: '1000-2000mg', dailyTarget: 2000, unit: 'mg', category: 'supplement' },
  { name: 'Colágeno', function: 'Saúde da pele, articulações, cabelo e unhas', dailyDose: '10g', dailyTarget: 10, unit: 'g', category: 'supplement' },
  { name: 'Coenzima Q10', function: 'Energia celular, saúde cardiovascular e ação antioxidante', dailyDose: '100-200mg', dailyTarget: 200, unit: 'mg', category: 'supplement' },
  { name: 'Curcumina', function: 'Propriedades anti-inflamatórias, antioxidantes e saúde articular', dailyDose: '500-1000mg', dailyTarget: 1000, unit: 'mg', category: 'supplement' },
  { name: 'Ashwagandha', function: 'Redução de stress, aumento de energia e equilíbrio hormonal', dailyDose: '300-500mg', dailyTarget: 500, unit: 'mg', category: 'supplement' },
  { name: 'Melatonina', function: 'Melhoria da qualidade do sono e regulação do ritmo circadiano', dailyDose: '1-3mg', dailyTarget: 3, unit: 'mg', category: 'supplement' },
  { name: 'L-Teanina', function: 'Relaxamento mental, foco e redução de ansiedade', dailyDose: '200mg', dailyTarget: 200, unit: 'mg', category: 'supplement' },
  { name: 'Glucosamina', function: 'Saúde articular e manutenção da cartilagem', dailyDose: '1500mg', dailyTarget: 1500, unit: 'mg', category: 'supplement' },
  { name: 'Condroitina', function: 'Saúde articular e melhoria da flexibilidade', dailyDose: '1200mg', dailyTarget: 1200, unit: 'mg', category: 'supplement' },
  { name: 'MSM', function: 'Saúde das articulações, pele e propriedades anti-inflamatórias', dailyDose: '1000-3000mg', dailyTarget: 3000, unit: 'mg', category: 'supplement' },
  { name: 'Spirulina', function: 'Fonte de proteína, antioxidantes e desintoxicação', dailyDose: '3-5g', dailyTarget: 5, unit: 'g', category: 'supplement' },
  { name: 'Chlorella', function: 'Desintoxicação, fortalecimento imunológico e nutrientes essenciais', dailyDose: '3-5g', dailyTarget: 5, unit: 'g', category: 'supplement' },
];

const VITAMINS: SupplementInfo[] = [
  { name: 'Vitamina A', function: 'Saúde da visão, sistema imunológico e pele saudável', dailyDose: '900mcg', dailyTarget: 900, unit: 'mcg', category: 'vitamin' },
  { name: 'Vitamina B1 (Tiamina)', function: 'Metabolismo energético e função nervosa', dailyDose: '1.2mg', dailyTarget: 1.2, unit: 'mg', category: 'vitamin' },
  { name: 'Vitamina B2 (Riboflavina)', function: 'Produção de energia e saúde ocular', dailyDose: '1.3mg', dailyTarget: 1.3, unit: 'mg', category: 'vitamin' },
  { name: 'Vitamina B3 (Niacina)', function: 'Metabolismo e saúde cardiovascular', dailyDose: '16mg', dailyTarget: 16, unit: 'mg', category: 'vitamin' },
  { name: 'Vitamina B6 (Piridoxina)', function: 'Função cerebral e produção de hemoglobina', dailyDose: '1.7mg', dailyTarget: 1.7, unit: 'mg', category: 'vitamin' },
  { name: 'Vitamina B9 (Ácido Fólico)', function: 'Formação de DNA e gravidez saudável', dailyDose: '400mcg', dailyTarget: 400, unit: 'mcg', category: 'vitamin' },
  { name: 'Vitamina B12', function: 'Energia, função nervosa e formação de glóbulos vermelhos', dailyDose: '2.4mcg', dailyTarget: 2.4, unit: 'mcg', category: 'vitamin' },
  { name: 'Vitamina C', function: 'Antioxidante, imunidade e produção de colagénio', dailyDose: '90mg', dailyTarget: 90, unit: 'mg', category: 'vitamin' },
  { name: 'Vitamina D3', function: 'Saúde óssea, imunidade e regulação do humor', dailyDose: '2000UI', dailyTarget: 2000, unit: 'UI', category: 'vitamin' },
  { name: 'Vitamina E', function: 'Antioxidante, saúde da pele e proteção celular', dailyDose: '15mg', dailyTarget: 15, unit: 'mg', category: 'vitamin' },
  { name: 'Vitamina K2', function: 'Coagulação sanguínea e saúde óssea', dailyDose: '120mcg', dailyTarget: 120, unit: 'mcg', category: 'vitamin' },
  { name: 'Cálcio', function: 'Ossos e dentes fortes, função muscular', dailyDose: '1000mg', dailyTarget: 1000, unit: 'mg', category: 'vitamin' },
  { name: 'Magnésio', function: 'Relaxamento muscular, sono e produção de energia', dailyDose: '300-400mg', dailyTarget: 400, unit: 'mg', category: 'vitamin' },
  { name: 'Zinco', function: 'Imunidade, cicatrização e saúde reprodutiva', dailyDose: '11mg', dailyTarget: 11, unit: 'mg', category: 'vitamin' },
  { name: 'Ferro', function: 'Transporte de oxigénio, energia e prevenção de anemia', dailyDose: '18mg', dailyTarget: 18, unit: 'mg', category: 'vitamin' },
  { name: 'Selénio', function: 'Antioxidante, função tiroideia e imunidade', dailyDose: '55mcg', dailyTarget: 55, unit: 'mcg', category: 'vitamin' },
  { name: 'Iodo', function: 'Função tiroideia e metabolismo', dailyDose: '150mcg', dailyTarget: 150, unit: 'mcg', category: 'vitamin' },
  { name: 'Potássio', function: 'Pressão arterial, função muscular e nervosa', dailyDose: '3500mg', dailyTarget: 3500, unit: 'mg', category: 'vitamin' },
];

export default function SupplementsScreen() {
  const { isDark } = useTheme();
  const { meals, userProfile, supplementIntakes, addSupplementIntake, deleteSupplementIntake, getTodaySupplements } = useCalorieTracker();
  const insets = useSafeAreaInsets();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SupplementInfo | null>(null);
  const [amount, setAmount] = useState('');

  const todayNutrition = useMemo(() => {
    const today = new Date().toDateString();
    const todayMeals = meals.filter(meal => {
      if (!meal?.timestamp) return false;
      try {
        return new Date(meal.timestamp).toDateString() === today;
      } catch {
        return false;
      }
    });

    return todayMeals.reduce((acc, meal) => {
      meal.foods?.forEach((food: any) => {
        acc.protein += food.protein || 0;
        acc.vitaminC += food.vitaminC || 0;
        acc.vitaminD += food.vitaminD || 0;
        acc.calcium += food.calcium || 0;
        acc.iron += food.iron || 0;
        acc.omega3 += food.omega3 || 0;
      });
      return acc;
    }, {
      protein: 0,
      vitaminC: 0,
      vitaminD: 0,
      calcium: 0,
      iron: 0,
      omega3: 0,
    });
  }, [meals]);

  const todayIntakes = useMemo(() => getTodaySupplements(), [getTodaySupplements]);

  const supplementStatus = useMemo(() => {
    const allItems = [...SUPPLEMENTS, ...VITAMINS];
    return allItems.map(item => {
      const intakes = todayIntakes.filter(intake => intake.name === item.name);
      const totalAmount = intakes.reduce((sum, intake) => {
        if (intake.unit === item.unit) {
          return sum + intake.amount;
        }
        return sum;
      }, 0);
      
      return {
        ...item,
        current: totalAmount,
        met: totalAmount >= item.dailyTarget,
        intakes,
      };
    });
  }, [todayIntakes]);

  const nutritionStatus = useMemo(() => {
    const proteinTarget = userProfile ? userProfile.weight * 1.2 : 60;
    
    return {
      protein: { current: todayNutrition.protein, target: proteinTarget, met: todayNutrition.protein >= proteinTarget },
      vitaminC: { current: todayNutrition.vitaminC, target: 90, met: todayNutrition.vitaminC >= 90 },
      vitaminD: { current: todayNutrition.vitaminD, target: 2000, met: todayNutrition.vitaminD >= 2000 },
      calcium: { current: todayNutrition.calcium, target: 1000, met: todayNutrition.calcium >= 1000 },
      iron: { current: todayNutrition.iron, target: 18, met: todayNutrition.iron >= 18 },
      omega3: { current: todayNutrition.omega3, target: 1000, met: todayNutrition.omega3 >= 1000 },
    };
  }, [todayNutrition, userProfile]);

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
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 22,
      fontWeight: '700' as const,
      color: colors.text,
      marginBottom: 12,
    },
    card: {
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.08,
      shadowRadius: isDark ? 3 : 8,
      elevation: isDark ? 2 : 3,
    },
    statusCard: {
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      borderRadius: 16,
      padding: 16,
      marginBottom: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.2 : 0.05,
      shadowRadius: isDark ? 2 : 4,
      elevation: isDark ? 1 : 2,
    },
    statusLeft: {
      flex: 1,
    },
    statusName: {
      fontSize: 16,
      fontWeight: '600' as const,
      color: colors.text,
      marginBottom: 4,
    },
    statusValues: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    statusIcon: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    itemName: {
      fontSize: 17,
      fontWeight: '600' as const,
      color: colors.text,
      marginBottom: 6,
    },
    itemFunction: {
      fontSize: 15,
      color: colors.textSecondary,
      lineHeight: 22,
      marginBottom: 8,
    },
    itemDose: {
      fontSize: 13,
      fontWeight: '600' as const,
      color: colors.primary,
      textTransform: 'uppercase' as const,
      letterSpacing: 0.5,
    },
    addButton: {
      position: 'absolute',
      right: 16,
      top: 16,
      backgroundColor: colors.primary,
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      borderRadius: 20,
      padding: 24,
      width: '85%',
      maxWidth: 400,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700' as const,
      color: colors.text,
      flex: 1,
    },
    closeButton: {
      padding: 4,
    },
    input: {
      backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
      borderRadius: 12,
      padding: 16,
      fontSize: 17,
      color: colors.text,
      marginBottom: 16,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
    },
    modalButton: {
      flex: 1,
      padding: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    cancelButton: {
      backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
    },
    confirmButton: {
      backgroundColor: colors.primary,
    },
    modalButtonText: {
      fontSize: 17,
      fontWeight: '600' as const,
    },
    cancelButtonText: {
      color: colors.text,
    },
    confirmButtonText: {
      color: '#FFFFFF',
    },
    intakeItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
      borderRadius: 8,
      marginTop: 8,
    },
    intakeText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    deleteButton: {
      padding: 4,
    },
  }));

  const renderNutritionStatus = () => {
    const items = [
      { key: 'protein', label: 'Proteína', unit: 'g' },
      { key: 'vitaminC', label: 'Vitamina C', unit: 'mg' },
      { key: 'vitaminD', label: 'Vitamina D', unit: 'UI' },
      { key: 'calcium', label: 'Cálcio', unit: 'mg' },
      { key: 'iron', label: 'Ferro', unit: 'mg' },
      { key: 'omega3', label: 'Ómega-3', unit: 'mg' },
    ];

    return items.map((item) => {
      const status = nutritionStatus[item.key as keyof typeof nutritionStatus];
      const percentage = Math.min((status.current / status.target) * 100, 100);

      return (
        <View key={item.key} style={styles.statusCard}>
          <View style={styles.statusLeft}>
            <Text style={styles.statusName}>{item.label}</Text>
            <Text style={styles.statusValues}>
              {Math.round(status.current)}{item.unit} / {Math.round(status.target)}{item.unit} ({Math.round(percentage)}%)
            </Text>
          </View>
          <View style={[
            styles.statusIcon,
            { backgroundColor: status.met ? '#34C759' : '#FF9500' }
          ]}>
            {status.met ? (
              <CheckCircle color="white" size={18} strokeWidth={2.5} />
            ) : (
              <AlertCircle color="white" size={18} strokeWidth={2.5} />
            )}
          </View>
        </View>
      );
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isDark ? ['#000000', '#1C1C1E'] : ['#F2F2F7', '#FFFFFF']}
        style={StyleSheet.absoluteFillObject}
      />
      
      <StatusBar 
        barStyle={isDark ? 'light-content' : 'dark-content'} 
        backgroundColor="transparent" 
        translucent 
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
          <Text style={styles.title}>Suplementos & Vitaminas</Text>
          <Text style={styles.subtitle}>Integrado com seu perfil e refeições</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estado Nutricional de Hoje</Text>
          {renderNutritionStatus()}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suplementos</Text>
          {supplementStatus
            .filter(item => item.category === 'supplement')
            .map((supplement, index) => (
              <View key={`supplement-${index}`} style={styles.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{supplement.name}</Text>
                    <Text style={styles.itemFunction}>{supplement.function}</Text>
                    <Text style={styles.itemDose}>Dose Diária: {supplement.dailyDose}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 }}>
                      <Text style={[styles.statusValues, { fontSize: 15 }]}>
                        {supplement.current}{supplement.unit} / {supplement.dailyTarget}{supplement.unit}
                      </Text>
                      {supplement.met ? (
                        <CheckCircle color="#34C759" size={16} strokeWidth={2.5} />
                      ) : (
                        <AlertCircle color="#FF9500" size={16} strokeWidth={2.5} />
                      )}
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                      setSelectedItem(supplement);
                      setAmount('');
                      setModalVisible(true);
                    }}
                  >
                    <Plus color="white" size={18} strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>
                {supplement.intakes.length > 0 && (
                  <View style={{ marginTop: 12 }}>
                    {supplement.intakes.map((intake) => (
                      <View key={intake.id} style={styles.intakeItem}>
                        <Text style={styles.intakeText}>
                          {intake.amount}{intake.unit} - {new Date(intake.timestamp).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={async () => {
                            try {
                              await deleteSupplementIntake(intake.id);
                            } catch (error) {
                              Alert.alert('Erro', 'Não foi possível remover o registo');
                            }
                          }}
                        >
                          <Trash2 color="#FF3B30" size={16} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vitaminas & Minerais</Text>
          {supplementStatus
            .filter(item => item.category === 'vitamin')
            .map((vitamin, index) => (
              <View key={`vitamin-${index}`} style={styles.card}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{vitamin.name}</Text>
                    <Text style={styles.itemFunction}>{vitamin.function}</Text>
                    <Text style={styles.itemDose}>Dose Diária: {vitamin.dailyDose}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 }}>
                      <Text style={[styles.statusValues, { fontSize: 15 }]}>
                        {vitamin.current}{vitamin.unit} / {vitamin.dailyTarget}{vitamin.unit}
                      </Text>
                      {vitamin.met ? (
                        <CheckCircle color="#34C759" size={16} strokeWidth={2.5} />
                      ) : (
                        <AlertCircle color="#FF9500" size={16} strokeWidth={2.5} />
                      )}
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                      setSelectedItem(vitamin);
                      setAmount('');
                      setModalVisible(true);
                    }}
                  >
                    <Plus color="white" size={18} strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>
                {vitamin.intakes.length > 0 && (
                  <View style={{ marginTop: 12 }}>
                    {vitamin.intakes.map((intake) => (
                      <View key={intake.id} style={styles.intakeItem}>
                        <Text style={styles.intakeText}>
                          {intake.amount}{intake.unit} - {new Date(intake.timestamp).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={async () => {
                            try {
                              await deleteSupplementIntake(intake.id);
                            } catch (error) {
                              Alert.alert('Erro', 'Não foi possível remover o registo');
                            }
                          }}
                        >
                          <Trash2 color="#FF3B30" size={16} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedItem?.name}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <X color={isDark ? '#FFFFFF' : '#000000'} size={24} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.itemFunction, { marginBottom: 16 }]}>
              {selectedItem?.function}
            </Text>
            
            <TextInput
              style={styles.input}
              placeholder={`Quantidade (${selectedItem?.unit})`}
              placeholderTextColor={isDark ? '#8E8E93' : '#8E8E93'}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={setAmount}
              autoFocus
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={async () => {
                  if (!selectedItem || !amount) return;
                  
                  const numAmount = parseFloat(amount);
                  if (isNaN(numAmount) || numAmount <= 0) {
                    Alert.alert('Erro', 'Por favor, insira uma quantidade válida');
                    return;
                  }
                  
                  try {
                    await addSupplementIntake({
                      name: selectedItem.name,
                      amount: numAmount,
                      unit: selectedItem.unit,
                      category: selectedItem.category,
                    });
                    
                    setModalVisible(false);
                    setAmount('');
                    
                    const newTotal = supplementStatus.find(s => s.name === selectedItem.name)?.current || 0;
                    const total = newTotal + numAmount;
                    
                    if (total >= selectedItem.dailyTarget) {
                      Alert.alert(
                        '✅ Meta Atingida!',
                        `Você atingiu a meta diária de ${selectedItem.name} (${selectedItem.dailyTarget}${selectedItem.unit})`
                      );
                    }
                  } catch (error) {
                    Alert.alert('Erro', 'Não foi possível adicionar o registo');
                  }
                }}
              >
                <Text style={[styles.modalButtonText, styles.confirmButtonText]}>
                  Adicionar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
