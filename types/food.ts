export interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  sugar?: number; // açúcar em gramas
  sodium?: number; // sal/sódio em mg
  fiber?: number; // fibra em gramas
  calcium?: number; // cálcio em mg
  iron?: number; // ferro em mg
  vitaminC?: number; // vitamina C em mg
  vitaminD?: number; // vitamina D em UI
  portion: string;
}

export interface AnalysisResult {
  foods: FoodItem[];
  totalCalories: number;
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
  profilePhoto?: string; // base64 or URI
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

export interface SupplementIntake {
  id: string;
  name: string;
  amount: number;
  unit: 'g' | 'mg' | 'mcg' | 'UI' | 'cápsulas';
  category: 'supplement' | 'vitamin';
  timestamp: string;
  date: string;
}

export interface DailySupplementTarget {
  name: string;
  target: number;
  unit: string;
  category: 'supplement' | 'vitamin';
}