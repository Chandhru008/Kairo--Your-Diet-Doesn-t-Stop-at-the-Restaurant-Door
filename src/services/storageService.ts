import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, MealEntry, UserPreference } from '../types';

const KEYS = {
  PROFILE: '@menumind_profile',
  MEALS: '@menumind_meals',
  PREFERENCES: '@menumind_preferences',
};

const DEFAULT_PROFILE: UserProfile = {
  goal: 'maintenance',
  dailyCalories: 2000,
  proteinTarget: 120,
  carbLimit: 250,
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
