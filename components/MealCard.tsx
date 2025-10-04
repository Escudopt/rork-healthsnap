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
import { Trash2, Utensils, ChevronRight } from 'lucide-react-native';
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
    <Animated.View style={[
      styles.container,
      { transform: [{ scale: scaleAnim }] }
    ]}>
      <View style={styles.card}>
        <View style={styles.content}>
          <View style={styles.imageRow}>
            {meal.imageBase64 ? (
              <Image
                source={{ uri: `data:image/jpeg;base64,${meal.imageBase64}` }}
                style={styles.thumbnail}
              />
            ) : (
              <View style={styles.placeholderThumbnail}>
                <Utensils color={colors.textTertiary} size={24} strokeWidth={1.5} />
              </View>
            )}
            
            <View style={styles.info}>
              <View style={styles.mealTypeContainer}>
                <Text style={styles.mealType}>{meal.mealType}</Text>
              </View>
              <Text style={[styles.foods, { color: colors.text }]} numberOfLines={2}>
                {meal.foods.map(f => f.name).join(', ')}
              </Text>
            </View>
          </View>
          
          <View style={styles.footer}>
            <View style={styles.caloriesContainer}>
              <Text style={[styles.calories, { color: colors.text }]}>{meal.totalCalories} kcal</Text>
            </View>
            <View style={styles.actionButtons}>
              {showDetailButton && (
                <TouchableOpacity onPress={handleViewDetails} style={styles.detailButton}>
                  <View style={[styles.detailButtonInner, { backgroundColor: colors.surfaceSecondary }]}>
                    <ChevronRight color={colors.primary} size={18} strokeWidth={2} />
                  </View>
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                <View style={[styles.deleteButtonInner, { backgroundColor: colors.surfaceSecondary }]}>
                  <Trash2 color={colors.error} size={18} strokeWidth={2} />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const createStyles = (colors: any, isDark: boolean) => StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 14,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: isDark ? 0.2 : 0.05,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: isDark ? 0 : 0.5,
    borderColor: isDark ? 'transparent' : 'rgba(0, 0, 0, 0.05)',
  },
  content: {
    gap: 8,
  },
  imageRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 10,
    marginBottom: 8,
  },
  thumbnail: {
    width: 55,
    height: 55,
    borderRadius: 10,
  },
  placeholderThumbnail: {
    width: 55,
    height: 55,
    borderRadius: 10,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  mealTypeContainer: {
    backgroundColor: colors.primary + (isDark ? '20' : '15'),
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
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
    padding: 6,
    borderRadius: 20,
  },
  deleteButtonInner: {
    padding: 6,
    borderRadius: 20,
  },
});