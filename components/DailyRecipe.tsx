import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { ChefHat, X, Clock, Users, Flame } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/providers/ThemeProvider';
import { useCalorieTracker } from '@/providers/CalorieTrackerProvider';
import { generateText } from '@rork/toolkit-sdk';
import * as Haptics from 'expo-haptics';

interface Recipe {
  name: string;
  description: string;
  prepTime: string;
  servings: string;
  calories: number;
  ingredients: string[];
  instructions: string[];
  macros: {
    protein: number;
    carbs: number;
    fat: number;
  };
}

export function DailyRecipe() {
  const { colors, isDark } = useTheme();
  const { meals, dailyGoal, todayCalories, userProfile } = useCalorieTracker();
  const [showModal, setShowModal] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateRecipe = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    setShowModal(true);
    setIsLoading(true);
    setError(null);

    try {
      // Analyze user's eating patterns
      const recentFoods = meals
        .slice(0, 20)
        .flatMap(meal => meal.foods.map(f => f.name))
        .filter((name, index, self) => self.indexOf(name) === index)
        .slice(0, 10);

      const remainingCalories = Math.max(0, dailyGoal - todayCalories);
      const targetCalories = remainingCalories > 0 ? remainingCalories : Math.round(dailyGoal * 0.3);

      // Calculate recommended macros
      const proteinGrams = userProfile?.weight ? Math.round(userProfile.weight * 0.4) : 30;
      const carbsGrams = Math.round(targetCalories * 0.4 / 4);
      const fatGrams = Math.round(targetCalories * 0.3 / 9);

      const prompt = `Você é um chef profissional especializado em nutrição. Crie uma receita saudável e deliciosa em português do Brasil.

CONTEXTO DO USUÁRIO:
- Calorias restantes hoje: ${remainingCalories} kcal
- Meta calórica da receita: ${targetCalories} kcal
- Alimentos que o usuário costuma comer: ${recentFoods.length > 0 ? recentFoods.join(', ') : 'variados'}
- Macros recomendados: ${proteinGrams}g proteína, ${carbsGrams}g carboidratos, ${fatGrams}g gordura

INSTRUÇÕES:
1. Crie uma receita que se encaixe no perfil alimentar do usuário
2. A receita deve ter aproximadamente ${targetCalories} calorias
3. Use ingredientes frescos e saudáveis
4. Seja criativo mas prático
5. Inclua tempo de preparo realista

FORMATO DE RESPOSTA (JSON):
{
  "name": "Nome da Receita",
  "description": "Breve descrição apetitosa (1 frase)",
  "prepTime": "X minutos",
  "servings": "X porções",
  "calories": ${targetCalories},
  "ingredients": [
    "ingrediente 1 com quantidade",
    "ingrediente 2 com quantidade"
  ],
  "instructions": [
    "Passo 1 detalhado",
    "Passo 2 detalhado"
  ],
  "macros": {
    "protein": ${proteinGrams},
    "carbs": ${carbsGrams},
    "fat": ${fatGrams}
  }
}

Responda APENAS com o JSON válido, sem texto adicional.`;

      const response = await generateText({ messages: [{ role: 'user', content: prompt }] });
      
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Formato de resposta inválido');
      }

      const recipeData = JSON.parse(jsonMatch[0]) as Recipe;
      setRecipe(recipeData);

    } catch (err) {
      console.error('Error generating recipe:', err);
      setError('Não foi possível gerar a receita. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    setRecipe(null);
    setError(null);
  };

  return (
    <>
      <TouchableOpacity
        onPress={generateRecipe}
        activeOpacity={0.8}
        style={styles.container}
      >
        <LinearGradient
          colors={isDark 
            ? ['rgba(255, 107, 107, 0.15)', 'rgba(255, 159, 64, 0.15)']
            : ['rgba(255, 107, 107, 0.1)', 'rgba(255, 159, 64, 0.1)']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, { borderColor: isDark ? 'rgba(255, 107, 107, 0.3)' : 'rgba(255, 107, 107, 0.2)' }]}
        >
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 107, 107, 0.2)' }]}>
            <ChefHat color="#FF6B6B" size={18} strokeWidth={2} />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: colors.text }]}>
              Receita de Hoje! 👨‍🍳
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Toque para ver uma receita personalizada
            </Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <View style={styles.modalHeaderLeft}>
                <View style={[styles.modalIcon, { backgroundColor: 'rgba(255, 107, 107, 0.15)' }]}>
                  <ChefHat color="#FF6B6B" size={20} strokeWidth={2} />
                </View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Receita de Hoje
                </Text>
              </View>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <X color={colors.textSecondary} size={24} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {isLoading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#FF6B6B" />
                  <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                    Criando sua receita personalizada...
                  </Text>
                </View>
              )}

              {error && (
                <View style={[styles.errorContainer, { backgroundColor: 'rgba(255, 107, 107, 0.1)' }]}>
                  <Text style={[styles.errorText, { color: '#FF6B6B' }]}>{error}</Text>
                  <TouchableOpacity
                    onPress={generateRecipe}
                    style={[styles.retryButton, { backgroundColor: '#FF6B6B' }]}
                  >
                    <Text style={styles.retryButtonText}>Tentar Novamente</Text>
                  </TouchableOpacity>
                </View>
              )}

              {recipe && !isLoading && (
                <View style={styles.recipeContainer}>
                  <Text style={[styles.recipeName, { color: colors.text }]}>
                    {recipe.name}
                  </Text>
                  <Text style={[styles.recipeDescription, { color: colors.textSecondary }]}>
                    {recipe.description}
                  </Text>

                  <View style={styles.recipeMetaContainer}>
                    <View style={[styles.metaItem, { backgroundColor: colors.surfaceElevated }]}>
                      <Clock color={colors.primary} size={16} strokeWidth={2} />
                      <Text style={[styles.metaText, { color: colors.text }]}>{recipe.prepTime}</Text>
                    </View>
                    <View style={[styles.metaItem, { backgroundColor: colors.surfaceElevated }]}>
                      <Users color={colors.primary} size={16} strokeWidth={2} />
                      <Text style={[styles.metaText, { color: colors.text }]}>{recipe.servings}</Text>
                    </View>
                    <View style={[styles.metaItem, { backgroundColor: colors.surfaceElevated }]}>
                      <Flame color={colors.primary} size={16} strokeWidth={2} />
                      <Text style={[styles.metaText, { color: colors.text }]}>{recipe.calories} kcal</Text>
                    </View>
                  </View>

                  <View style={[styles.macrosContainer, { backgroundColor: colors.surfaceElevated }]}>
                    <View style={styles.macroItem}>
                      <Text style={[styles.macroValue, { color: colors.text }]}>{recipe.macros.protein}g</Text>
                      <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>Proteína</Text>
                    </View>
                    <View style={[styles.macroDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.macroItem}>
                      <Text style={[styles.macroValue, { color: colors.text }]}>{recipe.macros.carbs}g</Text>
                      <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>Carboidratos</Text>
                    </View>
                    <View style={[styles.macroDivider, { backgroundColor: colors.border }]} />
                    <View style={styles.macroItem}>
                      <Text style={[styles.macroValue, { color: colors.text }]}>{recipe.macros.fat}g</Text>
                      <Text style={[styles.macroLabel, { color: colors.textSecondary }]}>Gordura</Text>
                    </View>
                  </View>

                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      Ingredientes
                    </Text>
                    {recipe.ingredients.map((ingredient, index) => (
                      <View key={index} style={styles.ingredientItem}>
                        <View style={[styles.bullet, { backgroundColor: colors.primary }]} />
                        <Text style={[styles.ingredientText, { color: colors.text }]}>
                          {ingredient}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                      Modo de Preparo
                    </Text>
                    {recipe.instructions.map((instruction, index) => (
                      <View key={index} style={styles.instructionItem}>
                        <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                          <Text style={styles.stepNumberText}>{index + 1}</Text>
                        </View>
                        <Text style={[styles.instructionText, { color: colors.text }]}>
                          {instruction}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    marginBottom: 6,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600' as const,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    height: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600' as const,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '400' as const,
  },
  errorContainer: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 14,
    fontWeight: '400' as const,
    textAlign: 'center' as const,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600' as const,
  },
  recipeContainer: {
    gap: 20,
    paddingBottom: 40,
  },
  recipeName: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
  },
  recipeDescription: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  recipeMetaContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  metaItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 12,
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  macrosContainer: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  macroItem: {
    flex: 1,
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  macroLabel: {
    fontSize: 11,
    fontWeight: '500' as const,
    textTransform: 'uppercase' as const,
  },
  macroDivider: {
    width: 1,
    height: 30,
    marginHorizontal: 8,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  ingredientText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700' as const,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
});
