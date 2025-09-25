import React, { useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Animated,
  Alert,
  Platform,
} from 'react-native';
import { Trash2, Clock, Utensils, ChevronRight } from 'lucide-react-native';
import { BlurCard } from './BlurCard';
import { Meal } from '@/types/food';
import { useCalorieTracker } from '@/providers/CalorieTrackerProvider';
import { useTheme } from '@/providers/ThemeProvider';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';

interface MealCardProps {
  meal: Meal;
  showDetailButton?: boolean;
}

export function MealCard({ meal, showDetailButton = true }: MealCardProps) {
  const { deleteMeal } = useCalorieTracker();
  const { colors, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleViewDetails = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    router.push(`/meal-detail?id=${meal.id}`);
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
              // Reset animation on error
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

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const styles = createStyles(colors, isDark);

  return (
    <Animated.View style={[
      styles.container,
      { transform: [{ scale: scaleAnim }] }
    ]}>
      <BlurCard variant="default" style={styles.card}>
        <View style={styles.content}>
          {meal.imageBase64 ? (
            <View style={styles.thumbnailContainer}>
              <Image
                source={{ uri: `data:image/jpeg;base64,${meal.imageBase64}` }}
                style={styles.thumbnail}
              />
              <View style={styles.thumbnailOverlay} />
            </View>
          ) : (
            <View style={styles.placeholderThumbnail}>
              <View style={[styles.placeholderIcon, { backgroundColor: colors.primary + '15' }]}>
                <Utensils color={colors.primary} size={20} strokeWidth={2} />
              </View>
            </View>
          )}
          
          <View style={styles.info}>
            <View style={styles.header}>
              <View style={[styles.mealTypeContainer, { backgroundColor: colors.primary + '12' }]}>
                <Text style={[styles.mealType, { color: colors.primary }]}>{meal.mealType}</Text>
              </View>
              <View style={styles.timeContainer}>
                <Clock color={colors.textTertiary} size={11} strokeWidth={2} />
                <Text style={[styles.time, { color: colors.textTertiary }]}>{formatTime(meal.timestamp)}</Text>
              </View>
            </View>
            
            <View style={styles.foodsContainer}>
              <Text style={[styles.foods, { color: colors.text }]} numberOfLines={2}>
                {meal.foods.map(f => f.name).join(', ')}
              </Text>
              {meal.foods.length > 2 && (
                <Text style={[styles.foodCount, { color: colors.textTertiary }]}>
                  +{meal.foods.length - 2} itens adicionais
                </Text>
              )}
            </View>
            
            <View style={styles.footer}>
              <View style={styles.caloriesContainer}>
                <Text style={[styles.calories, { color: colors.text }]}>{meal.totalCalories}</Text>
                <Text style={[styles.caloriesUnit, { color: colors.textSecondary }]}>kcal</Text>
                <View style={styles.macroSummary}>
                  <Text style={[styles.macroText, { color: colors.textTertiary }]}>
                    P: {meal.foods.reduce((sum, f) => sum + (f.protein || 0), 0).toFixed(0)}g
                  </Text>
                  <Text style={[styles.macroSeparator, { color: colors.textTertiary }]}>•</Text>
                  <Text style={[styles.macroText, { color: colors.textTertiary }]}>
                    C: {meal.foods.reduce((sum, f) => sum + (f.carbs || 0), 0).toFixed(0)}g
                  </Text>
                  <Text style={[styles.macroSeparator, { color: colors.textTertiary }]}>•</Text>
                  <Text style={[styles.macroText, { color: colors.textTertiary }]}>
                    G: {meal.foods.reduce((sum, f) => sum + (f.fat || 0), 0).toFixed(0)}g
                  </Text>
                </View>
              </View>
              <View style={styles.actionButtons}>
                {showDetailButton && (
                  <TouchableOpacity onPress={handleViewDetails} style={styles.detailButton}>
                    <View style={[styles.detailButtonInner, { backgroundColor: colors.primary + '12' }]}>
                      <ChevronRight color={colors.primary} size={16} strokeWidth={2.5} />
                    </View>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                  <View style={[styles.deleteButtonInner, { backgroundColor: colors.error + '12' }]}>
                    <Trash2 color={colors.error} size={16} strokeWidth={2.5} />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </BlurCard>
    </Animated.View>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    padding: 18,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: isDark ? 0.15 : 0.06,
    shadowRadius: isDark ? 6 : 12,
    elevation: isDark ? 3 : 4,
    borderWidth: isDark ? 0 : 0.5,
    borderColor: isDark ? 'transparent' : 'rgba(0, 0, 0, 0.04)',
  },
  content: {
    flexDirection: 'row',
    gap: 14,
  },
  thumbnailContainer: {
    position: 'relative',
  },
  thumbnail: {
    width: 68,
    height: 68,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnailOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  placeholderThumbnail: {
    width: 68,
    height: 68,
    borderRadius: 14,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  mealTypeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  mealType: {
    fontSize: 10,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.6,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  time: {
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    opacity: 0.7,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  foodsContainer: {
    marginBottom: 10,
    gap: 3,
  },
  foods: {
    fontSize: 15,
    fontWeight: '500' as const,
    lineHeight: 20,
    letterSpacing: -0.2,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  foodCount: {
    fontSize: 11,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    opacity: 0.5,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  caloriesContainer: {
    flex: 1,
    gap: 4,
  },
  calories: {
    fontSize: 24,
    fontWeight: '300' as const,
    letterSpacing: -0.6,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  caloriesUnit: {
    fontSize: 11,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.4,
    opacity: 0.6,
    marginLeft: 4,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  macroSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  macroText: {
    fontSize: 10,
    fontWeight: '500' as const,
    letterSpacing: 0.2,
    opacity: 0.6,
  },
  macroSeparator: {
    fontSize: 10,
    opacity: 0.4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 6,
  },
  detailButton: {
    borderRadius: 10,
  },
  deleteButton: {
    borderRadius: 10,
  },
  detailButtonInner: {
    padding: 8,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  deleteButtonInner: {
    padding: 8,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
});