import { generateObject, generateText } from '@rork/toolkit-sdk';
import { z } from 'zod';
import { FoodItem, AnalysisResult } from '@/types/food';
import { FREE_FOOD_APIS, SMART_STRATEGY } from '@/constants/free-food-apis';


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

// Nutrition database for common Brazilian foods (per 100g)
const BRAZILIAN_FOOD_DATABASE: Record<string, { calories: number; protein: number; carbs: number; fat: number; fiber: number; sodium: number }> = {
  // Grains and cereals
  'arroz branco': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, sodium: 1 },
  'arroz branco cozido': { calories: 130, protein: 2.7, carbs: 28, fat: 0.3, fiber: 0.4, sodium: 1 },
  'arroz integral': { calories: 111, protein: 2.6, carbs: 22, fat: 0.9, fiber: 1.8, sodium: 5 },
  'arroz integral cozido': { calories: 111, protein: 2.6, carbs: 22, fat: 0.9, fiber: 1.8, sodium: 5 },
  'feijão preto': { calories: 77, protein: 4.5, carbs: 14, fat: 0.5, fiber: 4.8, sodium: 2 },
  'feijão carioca': { calories: 76, protein: 4.8, carbs: 13.6, fat: 0.5, fiber: 8.4, sodium: 2 },
  'feijão carioca cozido': { calories: 76, protein: 4.8, carbs: 13.6, fat: 0.5, fiber: 8.4, sodium: 2 },
  'macarrão': { calories: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.8, sodium: 6 },
  'macarrão cozido': { calories: 131, protein: 5, carbs: 25, fat: 1.1, fiber: 1.8, sodium: 6 },
  'pão francês': { calories: 300, protein: 9, carbs: 58, fat: 3.1, fiber: 2.3, sodium: 584 },
  'pão integral': { calories: 247, protein: 13, carbs: 41, fat: 4.2, fiber: 7, sodium: 489 },
  'tapioca': { calories: 358, protein: 1.2, carbs: 88, fat: 0.3, fiber: 1.4, sodium: 1 },
  'cuscuz': { calories: 112, protein: 3.7, carbs: 23, fat: 0.2, fiber: 2.2, sodium: 5 },
  'polenta': { calories: 85, protein: 1.9, carbs: 18, fat: 0.6, fiber: 1.2, sodium: 1 },
  
  // Proteins
  'frango grelhado': { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sodium: 74 },
  'frango grelhado sem pele': { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sodium: 74 },
  'frango frito': { calories: 246, protein: 19, carbs: 8, fat: 15, fiber: 0.4, sodium: 435 },
  'frango assado': { calories: 190, protein: 29, carbs: 0, fat: 7.4, fiber: 0, sodium: 82 },
  'peito de frango': { calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sodium: 74 },
  'carne bovina': { calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0, sodium: 72 },
  'carne bovina grelhada': { calories: 250, protein: 26, carbs: 0, fat: 15, fiber: 0, sodium: 72 },
  'picanha': { calories: 292, protein: 20, carbs: 0, fat: 23, fiber: 0, sodium: 55 },
  'alcatra': { calories: 163, protein: 23, carbs: 0, fat: 7.2, fiber: 0, sodium: 55 },
  'peixe grelhado': { calories: 206, protein: 22, carbs: 0, fat: 12, fiber: 0, sodium: 59 },
  'salmão': { calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, sodium: 59 },
  'tilápia': { calories: 96, protein: 20, carbs: 0, fat: 1.7, fiber: 0, sodium: 52 },
  'ovo frito': { calories: 196, protein: 13.6, carbs: 0.8, fat: 15, fiber: 0, sodium: 207 },
  'ovo cozido': { calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0, sodium: 124 },
  'ovo mexido': { calories: 154, protein: 11, carbs: 1.6, fat: 11, fiber: 0, sodium: 124 },
  'linguiça': { calories: 296, protein: 17, carbs: 2.8, fat: 24, fiber: 0, sodium: 1165 },
  'bacon': { calories: 541, protein: 37, carbs: 1.4, fat: 42, fiber: 0, sodium: 1717 },
  'presunto': { calories: 145, protein: 21, carbs: 1.2, fat: 5.5, fiber: 0, sodium: 1203 },
  
  // Vegetables
  'alface': { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, fiber: 1.3, sodium: 28 },
  'alface americana': { calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, fiber: 1.3, sodium: 28 },
  'rúcula': { calories: 25, protein: 2.6, carbs: 3.7, fat: 0.7, fiber: 1.6, sodium: 27 },
  'tomate': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sodium: 5 },
  'tomate cereja': { calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sodium: 5 },
  'cenoura': { calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2, fiber: 2.8, sodium: 69 },
  'cenoura cozida': { calories: 35, protein: 0.8, carbs: 8.2, fat: 0.2, fiber: 2.8, sodium: 58 },
  'brócolis': { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, sodium: 33 },
  'brócolis cozido': { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6, sodium: 33 },
  'couve-flor': { calories: 25, protein: 1.9, carbs: 5, fat: 0.3, fiber: 2, sodium: 30 },
  'batata': { calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.2, sodium: 6 },
  'batata cozida': { calories: 77, protein: 2, carbs: 17, fat: 0.1, fiber: 2.2, sodium: 6 },
  'batata frita': { calories: 365, protein: 4, carbs: 63, fat: 17, fiber: 3.8, sodium: 246 },
  'batata doce': { calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3, sodium: 54 },
  'batata doce cozida': { calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3, sodium: 54 },
  'mandioca': { calories: 160, protein: 1.4, carbs: 38, fat: 0.3, fiber: 1.8, sodium: 14 },
  'mandioca cozida': { calories: 125, protein: 1.1, carbs: 30, fat: 0.2, fiber: 1.4, sodium: 11 },
  'abobrinha': { calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, fiber: 1, sodium: 8 },
  'berinjela': { calories: 25, protein: 1, carbs: 6, fat: 0.2, fiber: 3, sodium: 2 },
  'pimentão': { calories: 31, protein: 1, carbs: 7.3, fat: 0.3, fiber: 2.5, sodium: 4 },
  'cebola': { calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7, sodium: 4 },
  'alho': { calories: 149, protein: 6.4, carbs: 33, fat: 0.5, fiber: 2.1, sodium: 17 },
  
  // Fruits
  'banana': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, sodium: 1 },
  'banana nanica': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6, sodium: 1 },
  'banana prata': { calories: 98, protein: 1.3, carbs: 26, fat: 0.1, fiber: 2, sodium: 1 },
  'maçã': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4, sodium: 1 },
  'laranja': { calories: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4, sodium: 0 },
  'mamão': { calories: 43, protein: 0.5, carbs: 11, fat: 0.3, fiber: 1.7, sodium: 8 },
  'abacaxi': { calories: 50, protein: 0.5, carbs: 13, fat: 0.1, fiber: 1.4, sodium: 1 },
  'manga': { calories: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6, sodium: 1 },
  'uva': { calories: 69, protein: 0.7, carbs: 18, fat: 0.2, fiber: 0.9, sodium: 2 },
  'morango': { calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2, sodium: 1 },
  'melancia': { calories: 30, protein: 0.6, carbs: 8, fat: 0.2, fiber: 0.4, sodium: 1 },
  'melão': { calories: 34, protein: 0.8, carbs: 8.6, fat: 0.2, fiber: 0.9, sodium: 12 },
  'abacate': { calories: 160, protein: 2, carbs: 8.5, fat: 15, fiber: 6.7, sodium: 7 },
  
  // Dairy
  'leite integral': { calories: 61, protein: 3.2, carbs: 4.6, fat: 3.2, fiber: 0, sodium: 44 },
  'leite desnatado': { calories: 35, protein: 3.4, carbs: 4.9, fat: 0.2, fiber: 0, sodium: 44 },
  'queijo mussarela': { calories: 280, protein: 25, carbs: 2.2, fat: 19, fiber: 0, sodium: 627 },
  'queijo prato': { calories: 360, protein: 26, carbs: 0, fat: 28, fiber: 0, sodium: 560 },
  'queijo minas': { calories: 264, protein: 17.4, carbs: 3, fat: 20, fiber: 0, sodium: 346 },
  'requeijão': { calories: 264, protein: 11, carbs: 3, fat: 24, fiber: 0, sodium: 380 },
  'iogurte natural': { calories: 61, protein: 3.5, carbs: 4.7, fat: 3.3, fiber: 0, sodium: 46 },
  'iogurte grego': { calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0, sodium: 36 },
  'manteiga': { calories: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0, sodium: 11 },
  'margarina': { calories: 596, protein: 0.2, carbs: 1.3, fat: 66, fiber: 0, sodium: 943 },
  
  // Snacks and others
  'biscoito': { calories: 435, protein: 6.5, carbs: 75, fat: 12, fiber: 2.5, sodium: 328 },
  'bolacha maria': { calories: 443, protein: 7.5, carbs: 78, fat: 11, fiber: 2.6, sodium: 539 },
  'chocolate': { calories: 546, protein: 4.9, carbs: 61, fat: 31, fiber: 7, sodium: 24 },
  'chocolate ao leite': { calories: 534, protein: 7.6, carbs: 57, fat: 30, fiber: 3.4, sodium: 79 },
  'açúcar': { calories: 387, protein: 0, carbs: 100, fat: 0, fiber: 0, sodium: 1 },
  'mel': { calories: 304, protein: 0.3, carbs: 82, fat: 0, fiber: 0.2, sodium: 4 },
  'azeite': { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, sodium: 2 },
  'óleo de soja': { calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0, sodium: 0 },
  'castanha do pará': { calories: 656, protein: 14, carbs: 12, fat: 67, fiber: 7.5, sodium: 3 },
  'amendoim': { calories: 567, protein: 26, carbs: 16, fat: 49, fiber: 8.5, sodium: 18 },
  'granola': { calories: 471, protein: 13, carbs: 64, fat: 20, fiber: 9.1, sodium: 21 },
  'aveia': { calories: 394, protein: 17, carbs: 66, fat: 6.9, fiber: 10, sodium: 2 },
  
  // Brazilian specialties
  'feijoada': { calories: 149, protein: 8.9, carbs: 14, fat: 6.4, fiber: 5.4, sodium: 463 },
  'farofa': { calories: 365, protein: 3.8, carbs: 57, fat: 13, fiber: 6.4, sodium: 397 },
  'açaí': { calories: 58, protein: 0.8, carbs: 6.2, fat: 3.9, fiber: 2.6, sodium: 7 },
  'guaraná': { calories: 42, protein: 0, carbs: 11, fat: 0, fiber: 0, sodium: 7 },
  'coxinha': { calories: 186, protein: 8.2, carbs: 18, fat: 9.1, fiber: 1.1, sodium: 267 },
  'pastel': { calories: 235, protein: 6.8, carbs: 23, fat: 13, fiber: 1.4, sodium: 312 },
  'brigadeiro': { calories: 395, protein: 4.2, carbs: 70, fat: 12, fiber: 2.8, sodium: 52 },
  'beijinho': { calories: 389, protein: 3.8, carbs: 72, fat: 11, fiber: 1.2, sodium: 48 }
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

  // 🚀 MÉTODO PRINCIPAL - Estratégia de Cascata Inteligente
  async recognizeFood(imageBase64: string): Promise<AnalysisResult> {
    console.log('🔍 FoodRecognitionService.recognizeFood called with Smart Cascade Strategy');
    console.log('📸 Image base64 length:', imageBase64?.length || 0);
    
    if (!imageBase64?.trim()) {
      console.error('❌ Invalid image - empty or null');
      throw new Error('Imagem inválida');
    }
    
    // Clean base64 string (remove data URL prefix if present)
    let cleanBase64 = imageBase64.trim();
    if (cleanBase64.startsWith('data:image/')) {
      cleanBase64 = cleanBase64.split(',')[1] || cleanBase64;
    }
    
    // Validate base64 format
    if (!cleanBase64.match(/^[A-Za-z0-9+/]*={0,2}$/)) {
      console.error('❌ Invalid base64 format');
      throw new Error('Formato de imagem inválido');
    }
    
    console.log('🚀 Starting Smart Cascade Food Recognition...');
    
    // Try multiple APIs in order of priority
    const apiOrder = SMART_STRATEGY.order.filter(api => api !== 'aiLocal');
    
    for (let i = 0; i < apiOrder.length; i++) {
      const apiName = apiOrder[i];
      console.log(`🔄 Attempting recognition with ${apiName} (${i + 1}/${apiOrder.length})...`);
      
      try {
        const result = await this.tryAPIRecognition(apiName, cleanBase64);
        if (result) {
          console.log(`✅ Success with ${apiName}!`);
          return result;
        }
      } catch (error) {
        console.warn(`⚠️ ${apiName} failed:`, error);
        // Continue to next API
      }
    }
    
    // If all APIs fail, use AI as fallback
    console.log('🤖 All APIs failed, using AI fallback...');
    return await this.recognizeFoodWithAI(cleanBase64);
  }

  // 🔄 Try API recognition with specific service
  private async tryAPIRecognition(apiName: string, imageBase64: string): Promise<AnalysisResult | null> {
    const api = FREE_FOOD_APIS[apiName as keyof typeof FREE_FOOD_APIS];
    
    if (!api || !api.active || api.apiKey === 'demo-key') {
      console.log(`⏭️ Skipping ${apiName} - not configured or inactive`);
      return null;
    }
    
    try {
      switch (apiName) {
        case 'clarifai':
          return await this.recognizeWithClarifai(imageBase64);
        case 'googleVision':
          return await this.recognizeWithGoogleVision(imageBase64);
        case 'spoonacular':
          return await this.recognizeWithSpoonacular(imageBase64);
        case 'logmeal':
          return await this.recognizeWithLogMeal(imageBase64);
        case 'roboflow':
          return await this.recognizeWithRoboflow(imageBase64);
        default:
          console.warn(`❓ Unknown API: ${apiName}`);
          return null;
      }
    } catch (error) {
      console.error(`❌ ${apiName} recognition failed:`, error);
      return null;
    }
  }

  // 🤖 AI-only recognition (fallback)
  async recognizeFoodWithAI(imageBase64: string): Promise<AnalysisResult> {
    try {
      console.log('🤖 Starting AI-only food recognition...');
      
      // Step 1: AI-powered food identification with enhanced prompts
      const aiResult = await this.identifyFoodsWithAI(imageBase64);
      
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
        notes: `${aiResult.notes || ''} (Análise por IA local)`.trim()
      };
      
      console.log('✅ AI food recognition completed:', {
        mealName: result.mealName,
        foodCount: result.foods.length,
        totalCalories: result.totalCalories,
        confidence: result.confidence
      });
      
      return result;
      
    } catch (error) {
      console.error('❌ AI food recognition failed:', error);
      
      // Return a fallback result instead of throwing error
      console.log('🔄 Returning fallback food analysis result');
      return {
        mealName: 'Refeição Identificada',
        foods: [
          {
            name: 'Alimento não identificado',
            weightInGrams: 100,
            calories: 150,
            protein: 8,
            carbs: 20,
            fat: 5,
            portion: '1 porção'
          }
        ],
        totalCalories: 150,
        totalWeight: 100,
        mealType: 'Lanche' as const,
        confidence: 'low' as const,
        notes: 'Não foi possível identificar os alimentos com precisão. Valores estimados.'
      };
    }
  }

  // AI-powered food identification with enhanced prompts
  private async identifyFoodsWithAI(imageBase64: string): Promise<any> {
    const prompt = `
Você é um especialista em nutrição e análise de alimentos. Analise esta imagem de comida e identifique TODOS os alimentos visíveis com máxima precisão.

🎯 INSTRUÇÕES ESPECÍFICAS:
1. IDENTIFIQUE CADA ALIMENTO SEPARADAMENTE - não agrupe itens diferentes
2. ESTIME O PESO de cada alimento em gramas baseado no tamanho visual e referências do prato
3. CALCULE as informações nutricionais precisas para cada porção identificada
4. DÊ UM NOME ESPECÍFICO e descritivo ao prato principal
5. INCLUA todos os macronutrientes (proteína, carboidratos, gordura) e micronutrientes quando relevante
6. SEJA PRECISO com as porções - use referências visuais como pratos, talheres, mãos

📏 REFERÊNCIAS DE PESO/PORÇÃO:
- 1 xícara de arroz cozido = ~150g
- 1 filé de frango médio = ~120g  
- 1 concha de feijão = ~80g
- 1 fatia de pão = ~50g
- 1 ovo médio = ~50g
- 1 banana média = ~120g
- 1 colher de sopa de óleo = ~15g
- 1 fatia de queijo = ~30g

🔍 SEJA ESPECÍFICO SOBRE:
- Método de preparo (grelhado, frito, cozido, assado, refogado)
- Tipo específico (integral, branco, carioca, etc.)
- Estado (cru, cozido, maduro, etc.)
- Temperos e molhos visíveis

📊 DADOS NUTRICIONAIS:
Use tabelas nutricionais brasileiras (TACO/IBGE) como referência para calorias e macronutrientes.

🍽️ EXEMPLOS DE BOAS IDENTIFICAÇÕES:
- "Arroz branco cozido" (não apenas "arroz")
- "Frango grelhado sem pele" (não apenas "frango")
- "Feijão carioca cozido" (não apenas "feijão")
- "Alface americana fresca" (não apenas "salada")
- "Batata frita em óleo" (não apenas "batata")

Analise a imagem com cuidado e forneça uma análise completa e precisa.`;

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
          const portionMultiplier = (food.weightInGrams || 100) / 100; // Database values are per 100g
          
          enhancedFood = {
            name: food.name,
            weightInGrams: food.weightInGrams || 100,
            calories: Math.round(dbMatch.calories * portionMultiplier),
            protein: Math.round(dbMatch.protein * portionMultiplier * 10) / 10,
            carbs: Math.round(dbMatch.carbs * portionMultiplier * 10) / 10,
            fat: Math.round(dbMatch.fat * portionMultiplier * 10) / 10,
            fiber: dbMatch.fiber ? Math.round(dbMatch.fiber * portionMultiplier * 10) / 10 : undefined,
            sugar: food.sugar || undefined,
            sodium: dbMatch.sodium ? Math.round(dbMatch.sodium * portionMultiplier) : undefined,
            portion: food.portion || '1 porção'
          };
          
          console.log(`📊 Enhanced ${food.name} with database data`);
        } else {
          // Use AI data as-is but validate ranges
          enhancedFood = {
            name: food.name || 'Alimento não identificado',
            weightInGrams: Math.max(1, food.weightInGrams || 100),
            calories: Math.max(0, food.calories || 100),
            protein: Math.max(0, food.protein || 5),
            carbs: Math.max(0, food.carbs || 15),
            fat: Math.max(0, food.fat || 3),
            fiber: food.fiber && food.fiber > 0 ? food.fiber : undefined,
            sugar: food.sugar && food.sugar > 0 ? food.sugar : undefined,
            sodium: food.sodium && food.sodium > 0 ? food.sodium : undefined,
            portion: food.portion || '1 porção'
          };
          
          console.log(`🤖 Using AI data for ${food.name}`);
        }
        
        enhancedFoods.push(enhancedFood);
        
      } catch (error) {
        console.error(`❌ Error enhancing ${food.name}:`, error);
        // Fallback to basic food item
        enhancedFoods.push({
          name: food.name || 'Alimento não identificado',
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
    if (!foodName?.trim() || foodName.length > 200) {
      return null;
    }
    
    const sanitizedName = foodName.trim();
    const normalizedName = sanitizedName.toLowerCase()
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
        console.log(`🎯 Found partial match: ${sanitizedName} -> ${key}`);
        return value;
      }
    }
    
    // Keyword-based matching
    const keywords = {
      'arroz': 'arroz branco',
      'feijao': 'feijão carioca',
      'feijão': 'feijão carioca',
      'frango': 'frango grelhado',
      'carne': 'carne bovina',
      'peixe': 'peixe grelhado',
      'salmao': 'salmão',
      'tilapia': 'tilápia',
      'ovo': 'ovo cozido',
      'batata': 'batata',
      'pao': 'pão francês',
      'pão': 'pão francês',
      'leite': 'leite integral',
      'queijo': 'queijo mussarela',
      'tomate': 'tomate',
      'alface': 'alface',
      'banana': 'banana',
      'maça': 'maçã',
      'laranja': 'laranja',
      'mamao': 'mamão',
      'mamão': 'mamão',
      'cenoura': 'cenoura',
      'brocolis': 'brócolis',
      'brócolis': 'brócolis',
      'azeite': 'azeite',
      'oleo': 'óleo de soja',
      'óleo': 'óleo de soja',
      'manteiga': 'manteiga',
      'margarina': 'margarina',
      'chocolate': 'chocolate',
      'acucar': 'açúcar',
      'açúcar': 'açúcar',
      'mel': 'mel',
      'aveia': 'aveia',
      'granola': 'granola',
      'iogurte': 'iogurte natural',
      'macarrao': 'macarrão',
      'macarrão': 'macarrão'
    };
    
    for (const [keyword, dbKey] of Object.entries(keywords)) {
      if (normalizedName.includes(keyword)) {
        console.log(`🔍 Found keyword match: ${sanitizedName} -> ${dbKey}`);
        return BRAZILIAN_FOOD_DATABASE[dbKey];
      }
    }
    
    return null;
  }

  // Validate and adjust portion sizes
  private validatePortions(foods: FoodItem[]): FoodItem[] {
    return foods.map(food => {
      // Validate weight ranges
      let adjustedWeight = food.weightInGrams || 100;
      
      // Common portion size validations
      const lowerName = food.name.toLowerCase();
      if (lowerName.includes('arroz')) {
        adjustedWeight = Math.max(50, Math.min(300, adjustedWeight)); // 50g-300g
      } else if (lowerName.includes('frango') || lowerName.includes('peito')) {
        adjustedWeight = Math.max(80, Math.min(250, adjustedWeight)); // 80g-250g
      } else if (lowerName.includes('feijão') || lowerName.includes('feijao')) {
        adjustedWeight = Math.max(30, Math.min(150, adjustedWeight)); // 30g-150g
      } else if (lowerName.includes('salada') || lowerName.includes('alface') || lowerName.includes('rúcula')) {
        adjustedWeight = Math.max(20, Math.min(100, adjustedWeight)); // 20g-100g
      } else if (lowerName.includes('batata') && !lowerName.includes('frita')) {
        adjustedWeight = Math.max(100, Math.min(300, adjustedWeight)); // 100g-300g
      } else if (lowerName.includes('batata frita')) {
        adjustedWeight = Math.max(50, Math.min(150, adjustedWeight)); // 50g-150g
      } else if (lowerName.includes('ovo')) {
        adjustedWeight = Math.max(50, Math.min(100, adjustedWeight)); // 50g-100g (1-2 ovos)
      } else if (lowerName.includes('pão')) {
        adjustedWeight = Math.max(25, Math.min(100, adjustedWeight)); // 25g-100g
      } else if (lowerName.includes('queijo')) {
        adjustedWeight = Math.max(20, Math.min(80, adjustedWeight)); // 20g-80g
      } else if (lowerName.includes('banana')) {
        adjustedWeight = Math.max(80, Math.min(150, adjustedWeight)); // 80g-150g
      } else if (lowerName.includes('maçã') || lowerName.includes('laranja')) {
        adjustedWeight = Math.max(100, Math.min(200, adjustedWeight)); // 100g-200g
      }
      
      // Recalculate nutrition if weight was adjusted
      if (adjustedWeight !== (food.weightInGrams || 100)) {
        const ratio = adjustedWeight / (food.weightInGrams || 100);
        
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

  // 🧪 Test method for debugging
  async testRecognition(): Promise<void> {
    console.log('🧪 Testing Enhanced Food Recognition Service...');
    console.log('📊 Database contains', Object.keys(BRAZILIAN_FOOD_DATABASE).length, 'food items');
    console.log('🚀 Smart Strategy:', SMART_STRATEGY.approach);
    console.log('🔄 API Order:', SMART_STRATEGY.order);
    
    // Test database lookup
    const testFoods = ['arroz', 'frango grelhado', 'feijão carioca', 'batata frita'];
    testFoods.forEach(food => {
      if (!food?.trim() || food.length > 100) {
        console.log(`🔍 ${food} -> ❌ Invalid food name`);
        return;
      }
      const sanitizedFood = food.trim();
      const match = this.findNutritionMatch(sanitizedFood);
      console.log(`🔍 ${sanitizedFood} ->`, match ? '✅ Found' : '❌ Not found');
    });
    
    // Test API configurations
    console.log('\n🔧 API Configuration Status:');
    Object.entries(FREE_FOOD_APIS).forEach(([name, api]) => {
      const configured = api.apiKey !== 'demo-key';
      const active = api.active !== false;
      const status = configured && active ? '✅ Ready' : 
                    configured ? '⚠️ Configured but inactive' : 
                    '❌ Not configured';
      console.log(`${name}: ${status} (${api.freeLimit})`);
    });
    
    // Test Clarifai API with a simple request
    if (FREE_FOOD_APIS.clarifai.apiKey !== 'demo-key') {
      console.log('\n🧪 Testing Clarifai API connection...');
      try {
        const testResponse = await fetch('https://api.clarifai.com/v2/users/me', {
          method: 'GET',
          headers: {
            'Authorization': `Key ${FREE_FOOD_APIS.clarifai.apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (testResponse.ok) {
          const userData = await testResponse.json();
          console.log('✅ Clarifai API connection successful!');
          console.log('👤 User ID:', userData.user?.id || 'Unknown');
        } else {
          console.error('❌ Clarifai API connection failed:', testResponse.status);
          const errorText = await testResponse.text();
          console.error('Error details:', errorText);
        }
      } catch (error) {
        console.error('❌ Clarifai API test failed:', error);
      }
    }
  }

  // 📊 Get API status for debugging
  getAPIStatus(): Record<string, { configured: boolean; active: boolean; limit: string }> {
    const status: Record<string, { configured: boolean; active: boolean; limit: string }> = {};
    
    Object.entries(FREE_FOOD_APIS).forEach(([name, api]) => {
      status[name] = {
        configured: api.apiKey !== 'demo-key',
        active: api.active !== false,
        limit: api.freeLimit
      };
    });
    
    return status;
  }

  // 🥇 Clarifai Food Recognition
  private async recognizeWithClarifai(imageBase64: string): Promise<AnalysisResult> {
    console.log('🔍 Trying Clarifai Food Recognition...');
    
    const api = FREE_FOOD_APIS.clarifai;
    
    // Ensure we have a valid API key
    if (!api.apiKey || api.apiKey === 'demo-key') {
      throw new Error('Clarifai API key not configured');
    }
    
    console.log('📡 Making request to Clarifai with API key:', api.apiKey.substring(0, 8) + '...');
    
    const response = await fetch(api.url, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${api.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: [{
          data: {
            image: {
              base64: imageBase64
            }
          }
        }]
      })
    });
    
    console.log('📡 Clarifai response status:', response.status);
    console.log('📡 Clarifai response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Clarifai API error response:', errorText);
      throw new Error(`Clarifai API error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('📊 Clarifai response data:', JSON.stringify(data, null, 2));
    return this.parseClarifaiResponse(data);
  }

  // 🥈 Google Vision Recognition
  private async recognizeWithGoogleVision(imageBase64: string): Promise<AnalysisResult> {
    console.log('🔍 Trying Google Vision API...');
    
    const api = FREE_FOOD_APIS.googleVision;
    const response = await fetch(api.url.replace('YOUR_API_KEY', api.apiKey), {
      method: 'POST',
      headers: api.headers,
      body: JSON.stringify({
        requests: [{
          image: {
            content: imageBase64
          },
          features: [{
            type: 'LABEL_DETECTION',
            maxResults: 10
          }]
        }]
      })
    });
    
    if (!response.ok) {
      throw new Error(`Google Vision API error: ${response.status}`);
    }
    
    const data = await response.json();
    return this.parseGoogleVisionResponse(data);
  }

  // 🥉 Spoonacular Recognition
  private async recognizeWithSpoonacular(imageBase64: string): Promise<AnalysisResult> {
    console.log('🔍 Trying Spoonacular API...');
    
    const api = FREE_FOOD_APIS.spoonacular;
    const response = await fetch(api.url, {
      method: 'POST',
      headers: {
        ...api.headers,
        'X-API-KEY': api.apiKey
      },
      body: JSON.stringify({
        imageUrl: `data:image/jpeg;base64,${imageBase64}`
      })
    });
    
    if (!response.ok) {
      throw new Error(`Spoonacular API error: ${response.status}`);
    }
    
    const data = await response.json();
    return this.parseSpoonacularResponse(data);
  }

  // 🆕 LogMeal Recognition
  private async recognizeWithLogMeal(imageBase64: string): Promise<AnalysisResult> {
    console.log('🔍 Trying LogMeal API...');
    
    const api = FREE_FOOD_APIS.logmeal;
    const response = await fetch(api.url, {
      method: 'POST',
      headers: {
        ...api.headers,
        'Authorization': api.headers.Authorization.replace('YOUR_API_KEY', api.apiKey)
      },
      body: JSON.stringify({
        image: imageBase64
      })
    });
    
    if (!response.ok) {
      throw new Error(`LogMeal API error: ${response.status}`);
    }
    
    const data = await response.json();
    return this.parseLogMealResponse(data);
  }

  // 🔬 Roboflow Recognition
  private async recognizeWithRoboflow(imageBase64: string): Promise<AnalysisResult> {
    console.log('🔍 Trying Roboflow API...');
    
    const api = FREE_FOOD_APIS.roboflow;
    const response = await fetch(api.url, {
      method: 'POST',
      headers: api.headers,
      body: `image=${encodeURIComponent(imageBase64)}&api_key=${api.apiKey}`
    });
    
    if (!response.ok) {
      throw new Error(`Roboflow API error: ${response.status}`);
    }
    
    const data = await response.json();
    return this.parseRoboflowResponse(data);
  }

  // 📊 Response Parsers
  private async parseClarifaiResponse(data: any): Promise<AnalysisResult> {
    const concepts = data.outputs?.[0]?.data?.concepts || [];
    const foods = concepts
      .filter((concept: any) => concept.value > 0.5)
      .map((concept: any) => ({
        name: concept.name,
        weightInGrams: 100,
        calories: 100,
        protein: 5,
        carbs: 15,
        fat: 3,
        portion: '1 porção'
      }));
    
    if (foods.length === 0) {
      throw new Error('Nenhum alimento detectado com confiança suficiente');
    }
    
    const enhancedFoods = await this.enhanceNutritionData(foods);
    const validatedFoods = this.validatePortions(enhancedFoods);
    
    return {
      mealName: `Refeição com ${validatedFoods.map(f => f.name).join(', ')}`,
      foods: validatedFoods,
      totalCalories: validatedFoods.reduce((sum, f) => sum + f.calories, 0),
      totalWeight: validatedFoods.reduce((sum, f) => sum + f.weightInGrams, 0),
      mealType: 'Lanche' as const,
      confidence: 'medium' as const,
      notes: 'Análise realizada com Clarifai Food Model'
    };
  }

  private async parseGoogleVisionResponse(data: any): Promise<AnalysisResult> {
    const labels = data.responses?.[0]?.labelAnnotations || [];
    const foodLabels = labels
      .filter((label: any) => 
        label.score > 0.7 && 
        (label.description.toLowerCase().includes('food') ||
         label.description.toLowerCase().includes('dish') ||
         label.description.toLowerCase().includes('meal') ||
         this.isFoodRelated(label.description))
      );
    
    if (foodLabels.length === 0) {
      throw new Error('Nenhum alimento detectado');
    }
    
    const foods = foodLabels.map((label: any) => ({
      name: label.description,
      weightInGrams: 100,
      calories: 100,
      protein: 5,
      carbs: 15,
      fat: 3,
      portion: '1 porção'
    }));
    
    const enhancedFoods = await this.enhanceNutritionData(foods);
    const validatedFoods = this.validatePortions(enhancedFoods);
    
    return {
      mealName: `Refeição com ${validatedFoods.map(f => f.name).join(', ')}`,
      foods: validatedFoods,
      totalCalories: validatedFoods.reduce((sum, f) => sum + f.calories, 0),
      totalWeight: validatedFoods.reduce((sum, f) => sum + f.weightInGrams, 0),
      mealType: 'Lanche' as const,
      confidence: 'high' as const,
      notes: 'Análise realizada com Google Vision API'
    };
  }

  private async parseSpoonacularResponse(data: any): Promise<AnalysisResult> {
    // Spoonacular response parsing logic
    const category = data.category || {};
    const nutrition = data.nutrition || {};
    
    const foods = [{
      name: category.name || 'Alimento identificado',
      weightInGrams: 100,
      calories: nutrition.calories || 100,
      protein: nutrition.protein || 5,
      carbs: nutrition.carbs || 15,
      fat: nutrition.fat || 3,
      portion: '1 porção'
    }];
    
    const enhancedFoods = await this.enhanceNutritionData(foods);
    const validatedFoods = this.validatePortions(enhancedFoods);
    
    return {
      mealName: validatedFoods[0]?.name || 'Refeição identificada',
      foods: validatedFoods,
      totalCalories: validatedFoods.reduce((sum, f) => sum + f.calories, 0),
      totalWeight: validatedFoods.reduce((sum, f) => sum + f.weightInGrams, 0),
      mealType: 'Lanche' as const,
      confidence: 'medium' as const,
      notes: 'Análise realizada com Spoonacular API'
    };
  }

  private async parseLogMealResponse(data: any): Promise<AnalysisResult> {
    // LogMeal response parsing logic
    const segmentation = data.segmentation_results || [];
    
    if (segmentation.length === 0) {
      throw new Error('Nenhum alimento detectado');
    }
    
    const foods = segmentation.map((item: any) => ({
      name: item.food_name || 'Alimento identificado',
      weightInGrams: item.weight || 100,
      calories: item.calories || 100,
      protein: item.protein || 5,
      carbs: item.carbs || 15,
      fat: item.fat || 3,
      portion: '1 porção'
    }));
    
    const enhancedFoods = await this.enhanceNutritionData(foods);
    const validatedFoods = this.validatePortions(enhancedFoods);
    
    return {
      mealName: `Refeição com ${validatedFoods.map(f => f.name).join(', ')}`,
      foods: validatedFoods,
      totalCalories: validatedFoods.reduce((sum, f) => sum + f.calories, 0),
      totalWeight: validatedFoods.reduce((sum, f) => sum + f.weightInGrams, 0),
      mealType: 'Lanche' as const,
      confidence: 'high' as const,
      notes: 'Análise realizada com LogMeal Food AI'
    };
  }

  private async parseRoboflowResponse(data: any): Promise<AnalysisResult> {
    // Roboflow response parsing logic
    const predictions = data.predictions || [];
    
    if (predictions.length === 0) {
      throw new Error('Nenhum alimento detectado');
    }
    
    const foods = predictions
      .filter((pred: any) => pred.confidence > 0.5)
      .map((pred: any) => ({
        name: pred.class || 'Alimento identificado',
        weightInGrams: 100,
        calories: 100,
        protein: 5,
        carbs: 15,
        fat: 3,
        portion: '1 porção'
      }));
    
    const enhancedFoods = await this.enhanceNutritionData(foods);
    const validatedFoods = this.validatePortions(enhancedFoods);
    
    return {
      mealName: `Refeição com ${validatedFoods.map(f => f.name).join(', ')}`,
      foods: validatedFoods,
      totalCalories: validatedFoods.reduce((sum, f) => sum + f.calories, 0),
      totalWeight: validatedFoods.reduce((sum, f) => sum + f.weightInGrams, 0),
      mealType: 'Lanche' as const,
      confidence: 'medium' as const,
      notes: 'Análise realizada com Roboflow Food Detection'
    };
  }

  // Helper method to check if a label is food-related
  private isFoodRelated(description: string): boolean {
    const foodKeywords = [
      'rice', 'arroz', 'beans', 'feijão', 'chicken', 'frango', 'beef', 'carne',
      'fish', 'peixe', 'bread', 'pão', 'pasta', 'macarrão', 'salad', 'salada',
      'vegetable', 'vegetal', 'fruit', 'fruta', 'meat', 'cheese', 'queijo',
      'egg', 'ovo', 'potato', 'batata', 'tomato', 'tomate', 'onion', 'cebola'
    ];
    
    return foodKeywords.some(keyword => 
      description.toLowerCase().includes(keyword)
    );
  }

  // Clear nutrition cache
  clearCache(): void {
    this.nutritionCache.clear();
    console.log('🧹 Nutrition cache cleared');
  }
}

// Export singleton instance
export const foodRecognitionService = FoodRecognitionService.getInstance();

// Test the service on startup (development only)
if (__DEV__) {
  foodRecognitionService.testRecognition();
  
  // Log API status
  console.log('\n📊 API Status Summary:');
  const status = foodRecognitionService.getAPIStatus();
  const readyAPIs = Object.entries(status).filter(([_, s]) => s.configured && s.active).length;
  const totalAPIs = Object.keys(status).length;
  console.log(`Ready APIs: ${readyAPIs}/${totalAPIs}`);
  
  if (readyAPIs === 0) {
    console.log('⚠️ No APIs configured - will use AI-only fallback');
    console.log('💡 Configure APIs for better accuracy and faster recognition');
  }
}