import React, { useCallback, useState, useRef } from 'react';
import { Platform, Alert, Share, View } from 'react-native';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { captureRef } from 'react-native-view-shot';
import { Meal } from '@/types/food';

export function useShareMeal() {
  const [isGenerating, setIsGenerating] = useState(false);
  const shareCardRef = useRef<View>(null);

  const captureShareCard = async (cardRef: React.RefObject<View | null>): Promise<string | null> => {
    try {
      console.log('📸 captureShareCard - Starting...');
      console.log('📸 cardRef:', cardRef);
      console.log('📸 cardRef.current:', cardRef.current);
      
      if (!cardRef.current) {
        console.error('❌ Share card ref not available');
        return null;
      }

      console.log('📸 About to call captureRef...');
      console.log('📸 Capture options:', { format: 'png', quality: 1, result: 'tmpfile' });
      
      const uri = await captureRef(cardRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      console.log('✅ Share card captured successfully!');
      console.log('💾 URI:', uri);
      console.log('💾 URI length:', uri?.length || 0);
      
      return uri;
    } catch (error) {
      console.error('❌ Error capturing share card:', error);
      console.error('❌ Error details:', JSON.stringify(error, null, 2));
      return null;
    }
  };

  const shareMeal = useCallback(async (meal: Meal, cardRef?: React.RefObject<View | null>) => {
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

      // Capture share card as image
      let shareImageUri: string | null = null;
      
      if (Platform.OS !== 'web' && cardRef) {
        try {
          shareImageUri = await captureShareCard(cardRef);
        } catch (error) {
          console.error('Failed to capture share image:', error);
        }
      }

      // If we have a captured image, share it
      if (shareImageUri && Platform.OS !== 'web') {
        try {
          // Check if sharing is available
          const isAvailable = await Sharing.isAvailableAsync();
          if (!isAvailable) {
            // Fallback to text-only sharing
            await Share.share({ message });
            return;
          }

          // Share image with message
          await Sharing.shareAsync(shareImageUri, {
            mimeType: 'image/png',
            dialogTitle: 'Compartilhar Refeição',
            UTI: 'public.png',
          });

          // Clean up temporary file after sharing
          setTimeout(async () => {
            try {
              await FileSystem.deleteAsync(shareImageUri, { idempotent: true });
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

  return { shareMeal, isGenerating, shareCardRef };
}
