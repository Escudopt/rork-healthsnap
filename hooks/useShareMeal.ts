import { useCallback, useState } from 'react';
import { Platform, Alert, Share } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Meal } from '@/types/food';

export function useShareMeal() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateMealImage = async (meal: Meal): Promise<string | null> => {
    try {
      const timeInfo = new Date(meal.timestamp).toLocaleString('pt-BR', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
      });

      const foodList = meal.foods.map(food => 
        `${food.name} (${food.calories} kcal)`
      ).join(', ');

      const macros = meal.foods.reduce((acc, food) => ({
        protein: acc.protein + (food.protein || 0),
        carbs: acc.carbs + (food.carbs || 0),
        fat: acc.fat + (food.fat || 0),
      }), { protein: 0, carbs: 0, fat: 0 });

      const prompt = `Create a beautiful, modern social media card for sharing a meal with the following details:

Meal Type: ${meal.mealType || 'Refeição'}
Date & Time: ${timeInfo}
Total Calories: ${meal.totalCalories} kcal

Foods: ${foodList}

Macronutrients:
• Protein: ${macros.protein.toFixed(1)}g
• Carbs: ${macros.carbs.toFixed(1)}g
• Fat: ${macros.fat.toFixed(1)}g

Design requirements:
- Modern, clean, and professional design
- Use a gradient background (green to blue tones)
- Display all nutrition information clearly
- Include icons for calories and macros
- Make it Instagram/social media friendly
- Add subtle food-related decorative elements
- Use readable typography with good contrast
- Make it visually appealing and shareable`;

      console.log('Generating meal share image...');
      
      const response = await fetch('https://toolkit.rork.com/images/generate/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          size: '1024x1024',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Image generation failed:', errorText);
        return null;
      }

      const data = await response.json();
      
      if (data.image && data.image.base64Data) {
        const base64Image = `data:${data.image.mimeType};base64,${data.image.base64Data}`;
        return base64Image;
      }
      
      return null;
    } catch (error) {
      console.error('Error generating meal image:', error);
      return null;
    }
  };

  const shareMeal = useCallback(async (meal: Meal) => {
    if (isGenerating) return;
    
    setIsGenerating(true);
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

      // Generate a beautiful share image
      let shareImageBase64: string | null = null;
      
      if (Platform.OS !== 'web') {
        try {
          shareImageBase64 = await generateMealImage(meal);
        } catch (error) {
          console.error('Failed to generate share image:', error);
        }
      }

      // If we have a generated image, share it
      if (shareImageBase64 && Platform.OS !== 'web') {
        try {
          // Check if sharing is available
          const isAvailable = await Sharing.isAvailableAsync();
          if (!isAvailable) {
            // Fallback to text-only sharing
            await Share.share({ message });
            return;
          }

          // Save generated image to temporary file
          const fileUri = `${FileSystem.cacheDirectory}meal_share_${meal.id}.jpg`;
          const base64Data = shareImageBase64.startsWith('data:')
            ? shareImageBase64.split(',')[1]
            : shareImageBase64;

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
      setIsGenerating(false);
      
      // Don't show error if user cancelled
      if (error?.message !== 'Share cancelled' && error?.code !== 'ERR_CANCELED') {
        Alert.alert(
          'Erro ao Compartilhar',
          'Não foi possível compartilhar a refeição. Tente novamente.'
        );
      }
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating]);

  return { shareMeal, isGenerating };
}
