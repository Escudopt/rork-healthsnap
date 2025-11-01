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
import { Trash2, ChevronRight, Utensils } from 'lucide-react-native';
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
  const { colors } = useTheme();
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
      'Delete Meal',
      'Are you sure you want to delete this meal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              Animated.timing(scaleAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
              }).start(async () => {
                await deleteMeal(meal.id);
              });
            } catch (error) {
              console.error('Error deleting meal:', error);
              Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
              }).start();
              
              Alert.alert(
                'Delete Error',
                'Could not delete meal. Please try again.',
                [{ text: 'OK' }]
              );
            }
          },
        },
      ]
    );
  };

  return (
    <Animated.View style={[
      styles.container,
      { transform: [{ scale: scaleAnim }] }
    ]}>
      <View style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }
      ]}>
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
            <View style={[styles.placeholderIcon, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
              <Utensils color={colors.textTertiary} size={18} strokeWidth={1.5} />
            </View>
          )}
          
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.mealTypeTag}>
                <Text style={[styles.mealType, { color: colors.textSecondary }]}>{meal.mealType}</Text>
              </View>
              <Text style={[styles.calories, { color: colors.text }]}>{meal.totalCalories} kcal</Text>
            </View>
            
            <Text style={[styles.foods, { color: colors.textSecondary }]} numberOfLines={2}>
              {meal.foods.map(f => f.name).join(', ')}
            </Text>
            
            <View style={styles.actionButtons}>
              {showDetailButton && (
                <TouchableOpacity onPress={handleViewDetails} style={styles.actionButton}>
                  <ChevronRight color={colors.text} size={18} strokeWidth={1.5} />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
                <Trash2 color={colors.text} size={18} strokeWidth={1.5} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  card: {
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
    alignItems: 'flex-start',
  },
  iconImage: {
    width: 56,
    height: 56,
    borderRadius: 8,
  },
  placeholderIcon: {
    width: 56,
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  content: {
    flex: 1,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealTypeTag: {
    paddingHorizontal: 0,
  },
  mealType: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  calories: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.3,
  },
  foods: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 4,
  },
  actionButton: {
    padding: 0,
  },
});
