import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Animated,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { Trash2, ChevronRight, Utensils, Share2 } from 'lucide-react-native';
import { Meal } from '@/types/food';
import { useCalorieTracker } from '@/providers/CalorieTrackerProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useShareMeal } from '@/hooks/useShareMeal';
import { MealShareCard } from './MealShareCard';

interface MealCardProps {
  meal: Meal;
  showDetailButton?: boolean;
}

export function MealCard({ meal, showDetailButton = true }: MealCardProps) {
  const { deleteMeal } = useCalorieTracker();
  const { colors, isDark } = useTheme();
  const { shareMeal, isGenerating } = useShareMeal();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shareCardRef = useRef<View>(null);
  const [showShareCard, setShowShareCard] = useState(false);

  const handleViewDetails = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/meal-detail?id=${meal.id}`);
  };

  const handleShare = async () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    try {
      if (Platform.OS === 'web') {
        await shareMeal(meal);
      } else {
        setShowShareCard(true);
        
        setTimeout(async () => {
          await shareMeal(meal, shareCardRef);
          setShowShareCard(false);
        }, 500);
      }
    } catch (error) {
      console.error('Error sharing meal:', error);
      setShowShareCard(false);
    }
  };

  const handleDelete = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    Alert.alert(
      'Excluir Refeição',
      'Tem certeza que deseja excluir esta refeição?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              Animated.timing(scaleAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
              }).start(async () => {
                await deleteMeal(meal.id);
              });
            } catch (error) {
              console.error('Error deleting meal:', error);
              Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
              }).start();
              
              Alert.alert(
                'Erro ao Excluir',
                'Não foi possível excluir a refeição. Tente novamente.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };

  const styles = createStyles(colors, isDark);

  return (
    <>
      <Animated.View style={[
        styles.container,
        { transform: [{ scale: scaleAnim }] }
      ]}>
        <View style={styles.card}>
        <View style={styles.cardContent}>
          {meal.imageBase64 ? (
            <Image
              source={{ 
                uri: meal.imageBase64.startsWith('data:') 
                  ? meal.imageBase64 
                  : `data:image/jpeg;base64,${meal.imageBase64}` 
              }}
              style={styles.iconImage}
              resizeMode="cover"
              onError={(error) => {
                console.log('Image load error:', error.nativeEvent.error);
              }}
            />
          ) : (
            <View style={[styles.placeholderIcon, { backgroundColor: colors.surfaceSecondary }]}>
              <Utensils color={colors.textTertiary} size={20} strokeWidth={1.5} />
            </View>
          )}
          
          <View style={styles.content}>
            <View style={styles.info}>
              <View style={styles.mealTypeContainer}>
                <Text style={styles.mealType}>{meal.mealType}</Text>
              </View>
              <Text style={[styles.foods, { color: colors.text }]} numberOfLines={2}>
                {meal.foods.map(f => f.name).join(', ')}
              </Text>
            </View>
            
            <View style={styles.footer}>
              <View style={styles.caloriesContainer}>
                <Text style={[styles.calories, { color: colors.text }]}>{meal.totalCalories} kcal</Text>
              </View>
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  onPress={handleShare} 
                  style={styles.shareButton}
                  disabled={isGenerating}
                >
                  <View style={[styles.shareButtonInner, isGenerating && styles.shareButtonGenerating]}>
                    {isGenerating ? (
                      <Text style={styles.generatingText}>...</Text>
                    ) : (
                      <Share2 color={colors.success || '#10B981'} size={18} strokeWidth={2} />
                    )}
                  </View>
                </TouchableOpacity>
                {showDetailButton && (
                  <TouchableOpacity onPress={handleViewDetails} style={styles.detailButton}>
                    <View style={styles.detailButtonInner}>
                      <ChevronRight color={colors.primary} size={18} strokeWidth={2} />
                    </View>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                  <View style={styles.deleteButtonInner}>
                    <Trash2 color={colors.error} size={18} strokeWidth={2} />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </View>
      </Animated.View>

      <Modal
        visible={showShareCard}
        transparent
        animationType="none"
        statusBarTranslucent
      >
        <View style={styles.offscreenContainer}>
          <MealShareCard ref={shareCardRef} meal={meal} />
        </View>
      </Modal>
    </>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  card: {
    backgroundColor: isDark ? '#0F0F0F' : '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.3 : 0.03,
    shadowRadius: isDark ? 8 : 12,
    elevation: isDark ? 2 : 1,
    borderWidth: 0.5,
    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
    overflow: 'hidden' as const,
  },
  cardContent: {
    flexDirection: 'row' as const,
    padding: 16,
    gap: 12,
    alignItems: 'center' as const,
  },
  iconImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  placeholderIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  content: {
    flex: 1,
    gap: 8,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  mealTypeContainer: {
    backgroundColor: colors.primary + (isDark ? '18' : '12'),
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start' as const,
    marginBottom: 4,
  },
  mealType: {
    fontSize: 12,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    color: colors.primary,
  },
  foods: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginTop: 6,
  },
  caloriesContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  calories: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  actionButtons: {
    flexDirection: 'row' as const,
    gap: 8,
  },
  detailButton: {
    borderRadius: 20,
  },
  deleteButton: {
    borderRadius: 20,
  },
  detailButtonInner: {
    padding: 8,
    borderRadius: 22,
    backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(0, 122, 255, 0.1)',
  },
  deleteButtonInner: {
    padding: 8,
    borderRadius: 22,
    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 59, 48, 0.1)',
  },
  shareButton: {
    borderRadius: 20,
  },
  shareButtonInner: {
    padding: 8,
    borderRadius: 22,
    backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
  },
  shareButtonGenerating: {
    backgroundColor: isDark ? 'rgba(100, 100, 100, 0.15)' : 'rgba(100, 100, 100, 0.1)',
  },
  generatingText: {
    color: colors.textTertiary,
    fontSize: 18,
    fontWeight: '600' as const,
  },
  offscreenContainer: {
    position: 'absolute' as const,
    left: -10000,
    top: -10000,
    width: 1080,
    height: 1920,
  },
});