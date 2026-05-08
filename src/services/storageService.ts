import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, MealEntry, UserPreference } from '../types';

const KEYS = {
  PROFILE: '@menumind_profile',
  MEALS: '@menumind_meals',
  PREFERENCES: '@menumind_preferences',
};

const DEFAULT_PROFILE: UserProfile = {
  goal: 'maintenance',
  dietType: 'anything',
  dailyCalories: 2000,
  proteinTarget: 120,
  carbLimit: 250,
  fiberLimit: 30,
  restrictions: [],
  cheatDayEnabled: false,
  onboardingComplete: false,
};

const DEFAULT_PREFERENCES: UserPreference = {
  totalInteractions: 0,
  loggedDishes: [],
  skippedDishes: [],
  preferenceNote: '',
};

export async function getProfile(): Promise<UserProfile> {
  try {
    const data = await AsyncStorage.getItem(KEYS.PROFILE);
    if (data) return JSON.parse(data);
    return DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
}

export async function getTodayMeals(): Promise<MealEntry[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.MEALS);
    if (!data) return [];
    const all: MealEntry[] = JSON.parse(data);
    const today = new Date().toISOString().split('T')[0];
    return all.filter((m) => m.date === today);
  } catch {
    return [];
  }
}

export async function getAllMeals(): Promise<MealEntry[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.MEALS);
    if (!data) return [];
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function logMeal(meal: MealEntry): Promise<void> {
  const all = await getAllMeals();
  all.push(meal);
  await AsyncStorage.setItem(KEYS.MEALS, JSON.stringify(all));
}

export async function removeMeal(mealId: string): Promise<void> {
  const all = await getAllMeals();
  const filtered = all.filter((m) => m.id !== mealId);
  await AsyncStorage.setItem(KEYS.MEALS, JSON.stringify(filtered));
}

export async function getPreferences(): Promise<UserPreference> {
  try {
    const data = await AsyncStorage.getItem(KEYS.PREFERENCES);
    if (data) return JSON.parse(data);
    return DEFAULT_PREFERENCES;
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export async function savePreferences(prefs: UserPreference): Promise<void> {
  await AsyncStorage.setItem(KEYS.PREFERENCES, JSON.stringify(prefs));
}

export async function trackInteraction(dishName: string, accepted: boolean): Promise<void> {
  const prefs = await getPreferences();
  prefs.totalInteractions += 1;
  if (accepted) {
    prefs.loggedDishes.push(dishName);
  } else {
    prefs.skippedDishes.push(dishName);
  }
  if (prefs.totalInteractions >= 20) {
    const notes: string[] = [];
    const logCount = prefs.loggedDishes.length;
    const skipCount = prefs.skippedDishes.length;
    if (skipCount > logCount * 0.6) {
      notes.push('This user is very selective and skips most dishes.');
    }
    notes.push('Weight your ranking to favor protein-dense, lower-fat options based on their history.');
    prefs.preferenceNote = notes.join(' ');
  }
  await savePreferences(prefs);
}

export async function seedMockHistory(): Promise<void> {
  const existing = await getAllMeals();
  if (existing.length > 5) return; // Already seeded

  const mockMeals: MealEntry[] = [];
  const dishNames = ['Butter Chicken', 'Palak Paneer', 'Masala Dosa', 'Chicken Biryani', 'Chole Bhature', 'Dal Makhani', 'Tandoori Chicken', 'Aloo Gobi'];
  
  const today = new Date();
  
  // Generate 30 days of history
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // 1 to 3 meals a day
    const mealsToday = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < mealsToday; j++) {
      const dish = dishNames[Math.floor(Math.random() * dishNames.length)];
      const isHealthy = Math.random() > 0.5;
      
      mockMeals.push({
        id: `mock_${i}_${j}`,
        name: dish,
        macros: {
          calories: isHealthy ? Math.floor(Math.random() * 300) + 200 : Math.floor(Math.random() * 600) + 400,
          protein: Math.floor(Math.random() * 30) + 10,
          carbs: Math.floor(Math.random() * 60) + 20,
          fat: Math.floor(Math.random() * 40) + 10,
          fiber: Math.floor(Math.random() * 10) + 2,
        },
        date: dateStr,
        timestamp: date.getTime(),
        restaurantName: 'Mock Restaurant',
      });
    }
  }
  
  await AsyncStorage.setItem(KEYS.MEALS, JSON.stringify([...existing, ...mockMeals]));
}
