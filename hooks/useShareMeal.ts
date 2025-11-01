import { useCallback } from 'react';
import { Platform, Alert, Share } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Meal } from '@/types/food';

export function useShareMeal() {
  const shareMeal = useCallback(async (meal: Meal) => {
    try {
      const timeInfo = new Date(meal.timestamp).toLocaleString('pt-BR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      const foodList = meal.foods.map(food => 
        `• ${food.name} (${food.calories} kcal)`
      ).join('\n');

      const macros = meal.foods.reduce((acc, food) => ({
        protein: acc.protein + (food.protein || 0),
        carbs: acc.carbs + (food.carbs || 0),
        fat: acc.fat + (food.fat || 0),
      }), { protein: 0, carbs: 0, fat: 0 });

      const message = `🍽️ ${meal.mealType || 'Refeição'} - ${meal.totalCalories} kcal

📅 ${timeInfo}

🥘 Alimentos:
${foodList}

📊 Informação Nutricional:
• Proteína: ${macros.protein.toFixed(1)}g
• Carboidratos: ${macros.carbs.toFixed(1)}g
• Gorduras: ${macros.fat.toFixed(1)}g

#nutrição #calorietracker #saúde`;

      // If meal has an image, share it with the message
      if (meal.imageBase64 && Platform.OS !== 'web') {
        try {
          // Check if sharing is available
          const isAvailable = await Sharing.isAvailableAsync();
          if (!isAvailable) {
            // Fallback to text-only sharing
            await Share.share({ message });
            return;
          }

          // Save image to temporary file
          const fileUri = `${FileSystem.cacheDirectory}meal_${meal.id}.jpg`;
          const base64Data = meal.imageBase64.startsWith('data:')
            ? meal.imageBase64.split(',')[1]
            : meal.imageBase64;

          await FileSystem.writeAsStringAsync(fileUri, base64Data, {
            encoding: FileSystem.EncodingType.Base64,
          });

          // Share image with message
          await Sharing.shareAsync(fileUri, {
            mimeType: 'image/jpeg',
            dialogTitle: 'Compartilhar Refeição',
            UTI: 'public.jpeg',
          });

          // Clean up temporary file after sharing
          setTimeout(async () => {
            try {
              await FileSystem.deleteAsync(fileUri, { idempotent: true });
            } catch (error) {
              console.log('Could not delete temp file:', error);
            }
          }, 5000);
        } catch (error) {
          console.error('Error sharing image:', error);
          // Fallback to text-only sharing
          await Share.share({ message });
        }
      } else {
        // Text-only sharing for web or meals without images
        if (Platform.OS === 'web') {
          // Web fallback - copy to clipboard or use Web Share API
          if (navigator.share) {
            await navigator.share({
              title: `${meal.mealType || 'Refeição'} - ${meal.totalCalories} kcal`,
              text: message,
            });
          } else {
            // Copy to clipboard as fallback
            await navigator.clipboard.writeText(message);
            Alert.alert(
              'Copiado!',
              'A informação da refeição foi copiada para a área de transferência.'
            );
          }
        } else {
          await Share.share({ message });
        }
      }
    } catch (error: any) {
      console.error('Error sharing meal:', error);
      
      // Don't show error if user cancelled
      if (error?.message !== 'Share cancelled' && error?.code !== 'ERR_CANCELED') {
        Alert.alert(
          'Erro ao Compartilhar',
          'Não foi possível compartilhar a refeição. Tente novamente.'
        );
      }
    }
  }, []);

  return { shareMeal };
}
