import { generateObject, generateText } from '@rork/toolkit-sdk';
import { z } from 'zod';
import { FoodItem, AnalysisResult } from '@/types/food';


// Enhanced food recognition schema with more detailed nutrition data
const FoodRecognitionSchema = z.object({
  mealName: z.string().describe('Nome do prato principal identificado (ex: "Arroz com Feijão e Frango Grelhado")'),
  foods: z.array(z.object({
    name: z.string().describe('Nome específico do alimento (ex: "Arroz branco cozido")'),
    weightInGrams: z.number().min(1).describe('Peso estimado em gramas'),
    calories: z.number().min(0).describe('Calorias por porção'),
    protein: z.number().min(0).describe('Proteína em gramas'),
    carbs: z.number().min(0).describe('Carboidratos em gramas'),
    fat: z.number().min(0).describe('Gordura em gramas'),
    fiber: z.number().min(0).optional().describe('Fibra em gramas'),
    sugar: z.number().min(0).optional().describe('Açúcar em gramas'),
    sodium: z.number().min(0).optional().describe('Sódio em miligramas'),
    portion: z.string().describe('Descrição da porção (ex: "1 xícara", "100g", "1 unidade média")')
  })).min(1).describe('Lista de todos os alimentos identificados na imagem'),
  mealType: z.enum(['Café da Manhã', 'Almoço', 'Jantar', 'Lanche']).describe('Tipo de refeição baseado nos alimentos'),
  confidence: z.enum(['high', 'medium', 'low']).describe('Nível de confiança na identificação'),
  notes: z.string().optional().describe('Observações adicionais sobre a análise')
});

// Nutrition database for common Brazilian foods
const BRAZILIAN_FOOD_DATABASE: Record<string, { calories: number; protein: number; carbs: number; fat: number; fiber: number; sodium: number }> = {
  // Grains and cereals
  'arroz branco': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, sodium: 1 },
  'arroz integral': { calories: 111, protein: 2.6, carbs: 22, fat: 0.9, fiber: 1.8, sodium: 5 },
  'feijão preto': { calories: 77, protein: 4.5, carbs: 14, fat: 0.5, fiber: 4.8, sodium: 2 },
  'feijão carioca': { calories: 76, protein: 4.8, carbs: 13.6, fat: 0.5, fiber: 8.4, sodium: 2 },
  'macarrão': { calories: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.8, sodium: 6 },
  'pão francês': { calories: 300, protein: 9, carbs: 58, fat: 3.1, fiber: 2.3, sodium: 584 },
  'pão integral': { calories: 247, protein: 13, carbs: 41, fat: 4.2, fiber: 7, sodium: 489 },
  
  // Proteins
  'frango grelhado': { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sodium: 74 },
  'frango frito': { calories: 246, protein: 19, carbs: 8, fat: 15, fiber: 0.4, sodium: 435 },
  'carne bovina': { calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0, sodium: 72 },
  'peixe grelhado': { calories: 206, protein: 22, carbs: 0, fat: 12, fiber: 0, sodium: 59 },
  'ovo frito': { calories: 196, protein: 13.6, carbs: 0.8, fat: 15, fiber: 0, sodium: 207 },
  'ovo cozido': { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, sodium: 124 },
  
  // Vegetables
  'alface': { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, fiber: 1.3, sodium: 28 },
  'tomate': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sodium: 5 },
  'cenoura': { calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2, fiber: 2.8, sodium: 69 },
  'brócolis': { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, sodium: 33 },
  'batata': { calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.2, sodium: 6 },
  'batata doce': { calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3, sodium: 54 },
  
  // Fruits
  'banana': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, sodium: 1 },
  'maçã': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, sodium: 1 },
  'laranja': { calories: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4, sodium: 0 },
  'mamão': { calories: 43, protein: 0.5, carbs: 11, fat: 0.3, fiber: 1.7, sodium: 8 },
  
  // Dairy
  'leite integral': { calories: 61, protein: 3.2, carbs: 4.6, fat: 3.2, fiber: 0, sodium: 44 },
  'queijo mussarela': { calories: 280, protein: 25, carbs: 2.2, fat: 19, fiber: 0, sodium: 627 },
  'iogurte natural': { calories: 61, protein: 3.5, carbs: 4.7, fat: 3.3, fiber: 0, sodium: 46 },
  
  // Snacks and others
  'biscoito': { calories: 435, protein: 6.5, carbs: 75, fat: 12, fiber: 2.5, sodium: 328 },
  'chocolate': { calories: 546, protein: 4.9, carbs: 61, fat: 31, fiber: 7, sodium: 24 },
  'açúcar': { calories: 387, protein: 0, carbs: 100, fat: 0, fiber: 0, sodium: 1 }
};

// Enhanced food recognition service
export class FoodRecognitionService {
  private static instance: FoodRecognitionService;
  private nutritionCache = new Map<string, any>();
  
  static getInstance(): FoodRecognitionService {
    if (!FoodRecognitionService.instance) {
      FoodRecognitionService.instance = new FoodRecognitionService();
    }
    return FoodRecognitionService.instance;
  }

  // Main food recognition method
  async recognizeFood(imageBase64: string): Promise<AnalysisResult> {
    console.log('🔍 FoodRecognitionService.recognizeFood called');
    console.log('📸 Image base64 length:', imageBase64?.length || 0);
    
    if (!imageBase64?.trim()) {
      console.error('❌ Invalid image - empty or null');
      throw new Error('Imagem inválida');
    }
    
    try {
      console.log('🔍 Starting enhanced food recognition...');
      
      // Step 1: AI-powered food identification with enhanced prompts
      console.log('🤖 Step 1: Starting AI identification...');
      const aiResult = await this.identifyFoodsWithAI(imageBase64);
      console.log('✅ Step 1 completed:', aiResult);
      
      // Step 2: Enhance nutrition data with database lookup
      const enhancedFoods = await this.enhanceNutritionData(aiResult.foods);
      
      // Step 3: Validate and adjust portions
      const validatedFoods = this.validatePortions(enhancedFoods);
      
      // Step 4: Calculate totals
      const totalCalories = validatedFoods.reduce((sum, food) => sum + food.calories, 0);
      const totalWeight = validatedFoods.reduce((sum, food) => sum + food.weightInGrams, 0);
      
      const result: AnalysisResult = {
        mealName: aiResult.mealName,
        foods: validatedFoods,
        totalCalories: Math.round(totalCalories),
        totalWeight: Math.round(totalWeight),
        mealType: aiResult.mealType,
        confidence: aiResult.confidence,
        notes: aiResult.notes
      };
      
      console.log('✅ Food recognition completed:', {
        mealName: result.mealName,
        foodCount: result.foods.length,
        totalCalories: result.totalCalories,
        confidence: result.confidence
      });
      
      return result;
      
    } catch (error) {
      console.error('❌ Food recognition failed:', error);
      throw new Error('Falha na identificação dos alimentos. Tente novamente.');
    }
  }

  // AI-powered food identification with enhanced prompts
  private async identifyFoodsWithAI(imageBase64: string): Promise<any> {
    const prompt = `
Analise esta imagem de comida e identifique TODOS os alimentos visíveis com máxima precisão.

Instruções específicas:
1. IDENTIFIQUE CADA ALIMENTO SEPARADAMENTE - não agrupe itens diferentes
2. ESTIME O PESO de cada alimento em gramas baseado no tamanho visual
3. CALCULE as informações nutricionais precisas para cada porção
4. DÊ UM NOME ESPECÍFICO ao prato principal se houver múltiplos alimentos
5. INCLUA fibras, açúcar e sódio quando relevante
6. SEJA PRECISO com as porções - use referências visuais como pratos, talheres, mãos

Exemplos de boas identificações:
- "Arroz branco cozido" (não apenas "arroz")
- "Frango grelhado sem pele" (não apenas "frango")
- "Feijão carioca cozido" (não apenas "feijão")
- "Alface americana" (não apenas "salada")

Para PESO/PORÇÃO, use estas referências:
- 1 xícara de arroz = ~150g
- 1 filé de frango médio = ~120g
- 1 concha de feijão = ~80g
- 1 fatia de pão = ~50g
- 1 ovo médio = ~50g
- 1 banana média = ~120g

Seja específico sobre:
- Método de preparo (grelhado, frito, cozido, assado)
- Tipo específico (integral, branco, carioca, etc.)
- Estado (cru, cozido, maduro, etc.)

RETORNE dados nutricionais precisos baseados em tabelas nutricionais brasileiras (TACO/IBGE).`;

    try {
      const result = await generateObject({
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image', image: imageBase64 }
            ]
          }
        ],
        schema: FoodRecognitionSchema
      });
      
      console.log('🤖 AI identification result:', {
        mealName: result.mealName,
        foodCount: result.foods.length,
        confidence: result.confidence
      });
      
      return result;
      
    } catch (error) {
      console.error('❌ AI identification failed:', error);
      throw new Error('Falha na análise da imagem com IA');
    }
  }

  // Enhance nutrition data using local database
  private async enhanceNutritionData(foods: any[]): Promise<FoodItem[]> {
    const enhancedFoods: FoodItem[] = [];
    
    for (const food of foods) {
      try {
        // Look for exact or partial matches in Brazilian food database
        const dbMatch = this.findNutritionMatch(food.name);
        
        let enhancedFood: FoodItem;
        
        if (dbMatch) {
          // Use database data as base and adjust for portion size
          const portionMultiplier = food.weightInGrams / 100; // Database values are per 100g
          
          enhancedFood = {
            name: food.name,
            weightInGrams: food.weightInGrams,
            calories: Math.round(dbMatch.calories * portionMultiplier),
            protein: Math.round(dbMatch.protein * portionMultiplier * 10) / 10,
            carbs: Math.round(dbMatch.carbs * portionMultiplier * 10) / 10,
            fat: Math.round(dbMatch.fat * portionMultiplier * 10) / 10,
            fiber: dbMatch.fiber ? Math.round(dbMatch.fiber * portionMultiplier * 10) / 10 : undefined,
            sugar: food.sugar || undefined,
            sodium: dbMatch.sodium ? Math.round(dbMatch.sodium * portionMultiplier) : undefined,
            portion: food.portion
          };
          
          console.log(`📊 Enhanced ${food.name} with database data`);
        } else {
          // Use AI data as-is but validate ranges
          enhancedFood = {
            name: food.name,
            weightInGrams: Math.max(1, food.weightInGrams),
            calories: Math.max(0, food.calories),
            protein: Math.max(0, food.protein),
            carbs: Math.max(0, food.carbs),
            fat: Math.max(0, food.fat),
            fiber: food.fiber && food.fiber > 0 ? food.fiber : undefined,
            sugar: food.sugar && food.sugar > 0 ? food.sugar : undefined,
            sodium: food.sodium && food.sodium > 0 ? food.sodium : undefined,
            portion: food.portion
          };
          
          console.log(`🤖 Using AI data for ${food.name}`);
        }
        
        enhancedFoods.push(enhancedFood);
        
      } catch (error) {
        console.error(`❌ Error enhancing ${food.name}:`, error);
        // Fallback to basic food item
        enhancedFoods.push({
          name: food.name,
          weightInGrams: Math.max(1, food.weightInGrams || 100),
          calories: Math.max(0, food.calories || 100),
          protein: Math.max(0, food.protein || 5),
          carbs: Math.max(0, food.carbs || 15),
          fat: Math.max(0, food.fat || 3),
          portion: food.portion || '1 porção'
        });
      }
    }
    
    return enhancedFoods;
  }

  // Find nutrition match in Brazilian food database
  private findNutritionMatch(foodName: string): any | null {
    const normalizedName = foodName.toLowerCase()
      .replace(/[áàâã]/g, 'a')
      .replace(/[éêë]/g, 'e')
      .replace(/[íîï]/g, 'i')
      .replace(/[óôõ]/g, 'o')
      .replace(/[úûü]/g, 'u')
      .replace(/ç/g, 'c');
    
    // Direct match
    if (BRAZILIAN_FOOD_DATABASE[normalizedName]) {
      return BRAZILIAN_FOOD_DATABASE[normalizedName];
    }
    
    // Partial matches
    for (const [key, value] of Object.entries(BRAZILIAN_FOOD_DATABASE)) {
      if (normalizedName.includes(key) || key.includes(normalizedName)) {
        console.log(`🎯 Found partial match: ${foodName} -> ${key}`);
        return value;
      }
    }
    
    // Keyword-based matching
    const keywords = {
      'arroz': 'arroz branco',
      'feijao': 'feijão carioca',
      'frango': 'frango grelhado',
      'carne': 'carne bovina',
      'peixe': 'peixe grelhado',
      'ovo': 'ovo cozido',
      'batata': 'batata',
      'pao': 'pão francês',
      'leite': 'leite integral',
      'queijo': 'queijo mussarela'
    };
    
    for (const [keyword, dbKey] of Object.entries(keywords)) {
      if (normalizedName.includes(keyword)) {
        console.log(`🔍 Found keyword match: ${foodName} -> ${dbKey}`);
        return BRAZILIAN_FOOD_DATABASE[dbKey];
      }
    }
    
    return null;
  }

  // Validate and adjust portion sizes
  private validatePortions(foods: FoodItem[]): FoodItem[] {
    return foods.map(food => {
      // Validate weight ranges
      let adjustedWeight = food.weightInGrams;
      
      // Common portion size validations
      if (food.name.toLowerCase().includes('arroz')) {
        adjustedWeight = Math.max(50, Math.min(300, adjustedWeight)); // 50g-300g
      } else if (food.name.toLowerCase().includes('frango')) {
        adjustedWeight = Math.max(80, Math.min(250, adjustedWeight)); // 80g-250g
      } else if (food.name.toLowerCase().includes('feijão')) {
        adjustedWeight = Math.max(30, Math.min(150, adjustedWeight)); // 30g-150g
      } else if (food.name.toLowerCase().includes('salada') || food.name.toLowerCase().includes('alface')) {
        adjustedWeight = Math.max(20, Math.min(100, adjustedWeight)); // 20g-100g
      }
      
      // Recalculate nutrition if weight was adjusted
      if (adjustedWeight !== food.weightInGrams) {
        const ratio = adjustedWeight / food.weightInGrams;
        
        return {
          ...food,
          weightInGrams: adjustedWeight,
          calories: Math.round(food.calories * ratio),
          protein: Math.round(food.protein * ratio * 10) / 10,
          carbs: Math.round(food.carbs * ratio * 10) / 10,
          fat: Math.round(food.fat * ratio * 10) / 10,
          fiber: food.fiber ? Math.round(food.fiber * ratio * 10) / 10 : undefined,
          sugar: food.sugar ? Math.round(food.sugar * ratio * 10) / 10 : undefined,
          sodium: food.sodium ? Math.round(food.sodium * ratio) : undefined
        };
      }
      
      return food;
    });
  }

  // Get nutrition suggestions based on identified foods
  async getNutritionSuggestions(foods: FoodItem[]): Promise<string[]> {
    try {
      const foodList = foods.map(f => `${f.name} (${f.calories} kcal)`).join(', ');
      const totalCalories = foods.reduce((sum, f) => sum + f.calories, 0);
      const totalProtein = foods.reduce((sum, f) => sum + f.protein, 0);
      const totalCarbs = foods.reduce((sum, f) => sum + f.carbs, 0);
      const totalFat = foods.reduce((sum, f) => sum + f.fat, 0);
      
      const prompt = `
Analise esta refeição e forneça 3-4 sugestões nutricionais práticas em português:

Refeição: ${foodList}

Totais:
- Calorias: ${totalCalories} kcal
- Proteína: ${totalProtein.toFixed(1)}g
- Carboidratos: ${totalCarbs.toFixed(1)}g
- Gordura: ${totalFat.toFixed(1)}g

Forneça sugestões sobre:
1. Equilíbrio nutricional
2. Melhorias possíveis
3. Complementos recomendados
4. Timing da refeição

Seja prático e específico. Máximo 4 sugestões de 1-2 frases cada.`;
      
      const response = await generateText({ messages: [{ role: 'user', content: prompt }] });
      
      // Parse suggestions from AI response
      const suggestions = response
        .split(/\d+\.\s*/)
        .filter(suggestion => suggestion.trim().length > 0)
        .map(suggestion => suggestion.trim())
        .slice(0, 4);
      
      return suggestions.length > 0 ? suggestions : [
        'Refeição equilibrada com boa distribuição de macronutrientes.',
        'Considere adicionar mais vegetais para aumentar fibras e vitaminas.',
        'Beba água suficiente para auxiliar na digestão.',
        'Mastigue bem os alimentos para melhor absorção dos nutrientes.'
      ];
      
    } catch (error) {
      console.error('❌ Error getting nutrition suggestions:', error);
      return [
        'Mantenha uma alimentação variada e equilibrada.',
        'Inclua frutas e vegetais em suas refeições.',
        'Beba pelo menos 2 litros de água por dia.',
        'Pratique exercícios regularmente.'
      ];
    }
  }

  // Alternative recognition using multiple AI models
  async recognizeFoodWithFallback(imageBase64: string): Promise<AnalysisResult> {
    const fallbackPrompts = [
      // Primary prompt (detailed)
      `Analise esta imagem e identifique todos os alimentos com precisão máxima. Para cada alimento, forneça peso em gramas, calorias e macronutrientes detalhados.`,
      
      // Secondary prompt (simplified)
      `Identifique os alimentos nesta imagem e estime suas calorias e informações nutricionais básicas.`,
      
      // Tertiary prompt (basic)
      `Liste os alimentos visíveis nesta imagem com estimativas de calorias.`
    ];
    
    for (let i = 0; i < fallbackPrompts.length; i++) {
      try {
        console.log(`🔄 Trying recognition attempt ${i + 1}...`);
        
        const result = await generateObject({
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: fallbackPrompts[i] },
                { type: 'image', image: imageBase64 }
              ]
            }
          ],
          schema: FoodRecognitionSchema
        });
        
        // Enhance with database data
        const enhancedFoods = await this.enhanceNutritionData(result.foods);
        const validatedFoods = this.validatePortions(enhancedFoods);
        
        return {
          mealName: result.mealName,
          foods: validatedFoods,
          totalCalories: validatedFoods.reduce((sum, f) => sum + f.calories, 0),
          totalWeight: validatedFoods.reduce((sum, f) => sum + f.weightInGrams, 0),
          mealType: result.mealType,
          confidence: i === 0 ? result.confidence : 'low',
          notes: result.notes
        };
        
      } catch (error) {
        console.error(`❌ Recognition attempt ${i + 1} failed:`, error);
        if (i === fallbackPrompts.length - 1) {
          throw error;
        }
      }
    }
    
    throw new Error('Todas as tentativas de reconhecimento falharam');
  }

  // Clear nutrition cache
  clearCache(): void {
    this.nutritionCache.clear();
    console.log('🧹 Nutrition cache cleared');
  }
}

// Export singleton instance
export const foodRecognitionService = FoodRecognitionService.getInstance();