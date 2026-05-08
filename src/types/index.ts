// ==========================================
// MenuMind — Type Definitions
// ==========================================

export interface UserProfile {
  goal: 'weight_loss' | 'muscle_gain' | 'maintenance' | 'keto' | 'diabetic_friendly' | 'heart_healthy';
  dietType: 'vegetarian' | 'vegan' | 'pescatarian' | 'anything';
  dailyCalories: number;
  proteinTarget: number;
  carbLimit: number;
  fiberLimit: number;
  restrictions: string[]; // Allergies/avoidances (e.g., 'dairy', 'gluten', 'nuts')
  cheatDayEnabled: boolean;
  onboardingComplete: boolean;
}

export interface MacroInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface MealEntry {
  id: string;
  name: string;
  macros: MacroInfo;
  timestamp: number;
  date: string; // YYYY-MM-DD
  restaurantName?: string;
}

export interface ParsedDish {
  name: string;
  description: string;
}

export interface DishWithMacros extends ParsedDish {
  macros: MacroInfo;
  matchType: 'exact' | 'partial' | 'keyword' | 'ai_estimated';
}

export type Verdict = 'top_pick' | 'good' | 'skip';

export interface RankedDish extends DishWithMacros {
  score: number;
  verdict: Verdict;
  reason: string; // Explainable AI reason
  warnings: string[]; // Things to avoid/watch out for
  customizationTip: string;
}

export interface RemainingBudget {
  calories: number;
  protein: number;
  carbs: number;
  fiber: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface CachedRestaurant {
  id: number;
  latitude: number;
  longitude: number;
  restaurantName: string;
  dishes: string; // JSON string of ParsedDish[]
  macros: string; // JSON string of DishWithMacros[]
  lastScanned: number;
}

export interface UserPreference {
  totalInteractions: number;
  loggedDishes: string[];   // dish names user accepted
  skippedDishes: string[];  // dish names user ignored
  preferenceNote: string;   // generated behavioral note
}
