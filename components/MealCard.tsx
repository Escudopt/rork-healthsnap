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
import { Trash2, Clock, Utensils } from 'lucide-react-native';
import { BlurCard } from './BlurCard';
import { Meal } from '@/types/food';
import { useCalorieTracker } from '@/providers/CalorieTrackerProvider';
import { useTheme } from '@/providers/ThemeProvider';
import * as Haptics from 'expo-haptics';

interface MealCardProps {
  meal: Meal;
}

export function MealCard({ meal }: MealCardProps) {
  const { deleteMeal } = useCalorieTracker();
  const { colors, isDark } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

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
            <View style={styles.header}>
              <View style={styles.mealTypeContainer}>
                <Text style={styles.mealType}>{meal.mealType}</Text>
              </View>
              <View style={styles.timeContainer}>
                <Clock color={colors.textSecondary} size={12} strokeWidth={2} />
                <Text style={[styles.time, { color: colors.textSecondary }]}>{formatTime(meal.timestamp)}</Text>
              </View>
            </View>
            
            <View style={styles.foodsContainer}>
              <Text style={[styles.foods, { color: colors.text }]} numberOfLines={2}>
                {meal.foods.map(f => f.name).join(', ')}
              </Text>
              {meal.foods.length > 2 && (
                <Text style={[styles.foodCount, { color: colors.textTertiary }]}>
                  +{meal.foods.length - 2} mais
                </Text>
              )}
            </View>
            
            <View style={styles.footer}>
              <View style={styles.caloriesContainer}>
                <Text style={[styles.calories, { color: colors.text }]}>{meal.totalCalories}</Text>
                <Text style={[styles.caloriesUnit, { color: colors.textSecondary }]}>kcal</Text>
              </View>
              <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                <View style={styles.deleteButtonInner}>
                  <Trash2 color={colors.error} size={18} strokeWidth={2} />
                </View>
              </TouchableOpacity>
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
    padding: 20,
    backgroundColor: colors.surfaceElevated,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  content: {
    flexDirection: 'row',
    gap: 16,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  placeholderThumbnail: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: colors.surfaceSecondary,
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
    marginBottom: 12,
  },
  mealTypeContainer: {
    backgroundColor: '#007AFF' + '15',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  mealType: {
    fontSize: 11,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    color: '#007AFF',
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  time: {
    fontSize: 13,
    fontWeight: '400' as const,
    letterSpacing: 0.1,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  foodsContainer: {
    marginBottom: 12,
    gap: 4,
  },
  foods: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
    letterSpacing: -0.24,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  foodCount: {
    fontSize: 13,
    fontWeight: '400' as const,
    letterSpacing: 0.1,
    opacity: 0.6,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  caloriesContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  calories: {
    fontSize: 28,
    fontWeight: '300' as const,
    letterSpacing: -0.8,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  caloriesUnit: {
    fontSize: 13,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
    opacity: 0.6,
    ...Platform.select({
      ios: {
        fontFamily: 'System',
      },
    }),
  },
  deleteButton: {
    borderRadius: 12,
  },
  deleteButtonInner: {
    padding: 10,
    borderRadius: 12,
    backgroundColor: colors.error + '15',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
});