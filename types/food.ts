export interface FoodItem {
  name: string;
  weightInGrams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number; // fibra em gramas
  sugar?: number; // açúcar em gramas
  sodium?: number; // sal/sódio em mg
  portion: string;
}

export interface AnalysisResult {
  foods: FoodItem[];
  totalCalories: number;
  totalWeight?: number;
  mealType: 'Café da Manhã' | 'Almoço' | 'Jantar' | 'Lanche';
  confidence: 'high' | 'medium' | 'low';
  notes?: string;
}

export interface Meal {
  id: string;
  name?: string;
  foods: FoodItem[];
  totalCalories: number;
  mealType?: string;
  timestamp: string;
  imageBase64?: string;
}

export interface UserProfile {
  name: string;
  age: number;
  weight: number; // kg
  height: number; // cm
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  goal: 'lose' | 'maintain' | 'gain';
}

export interface HealthMetrics {
  bmi: number;
  bmr: number; // Basal Metabolic Rate
  tdee: number; // Total Daily Energy Expenditure
  recommendedCalories: number;
  idealWeight: { min: number; max: number };
  bmiCategory: string;
  recommendations: string[];
}

export interface HealthyFood {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portion: string;
  benefits: string[];
  category: string;
  image: string;
  rating: number;
  description: string;
  advantages: string[];
  disadvantages: string[];
  nutritionalHighlights: {
    vitamins: string[];
    minerals: string[];
    compounds: string[];
  };
  bestTimeToEat: string;
  preparationTips: string[];
  contraindications?: string[];
}