import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { UserProfile, MealEntry, RemainingBudget, RankedDish, DishWithMacros } from '../types';
import { getProfile, saveProfile, getTodayMeals, logMeal as storageLogMeal, removeMeal, trackInteraction } from '../services/storageService';

interface AppContextType {
  profile: UserProfile;
  updateProfile: (p: UserProfile) => Promise<void>;
  todayMeals: MealEntry[];
  refreshMeals: () => Promise<void>;
  addMeal: (meal: MealEntry) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
  budget: RemainingBudget;
  // Scan results
  scannedDishes: RankedDish[];
  setScannedDishes: (d: RankedDish[]) => void;
  dishesWithMacros: DishWithMacros[];
  setDishesWithMacros: (d: DishWithMacros[]) => void;
  restaurantName: string;
  setRestaurantName: (n: string) => void;
  // Track
  trackDish: (name: string, accepted: boolean) => Promise<void>;
}

const AppContext = createContext<AppContextType>({} as AppContextType);

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>({
    goal: 'maintenance',
    dailyCalories: 2000,
    proteinTarget: 120,
    carbLimit: 250,
    restrictions: [],
    cheatDayEnabled: false,
    onboardingComplete: false,
  });
  const [todayMeals, setTodayMeals] = useState<MealEntry[]>([]);
  const [scannedDishes, setScannedDishes] = useState<RankedDish[]>([]);
  const [dishesWithMacros, setDishesWithMacros] = useState<DishWithMacros[]>([]);
  const [restaurantName, setRestaurantName] = useState('');

  const budget: RemainingBudget = {
    calories: Math.max(0, profile.dailyCalories - todayMeals.reduce((s, m) => s + m.macros.calories, 0)),
    protein: Math.max(0, profile.proteinTarget - todayMeals.reduce((s, m) => s + m.macros.protein, 0)),
    carbs: Math.max(0, profile.carbLimit - todayMeals.reduce((s, m) => s + m.macros.carbs, 0)),
  };

  useEffect(() => {
    (async () => {
      const p = await getProfile();
      setProfile(p);
      const m = await getTodayMeals();
      setTodayMeals(m);
    })();
  }, []);

  const updateProfile = useCallback(async (p: UserProfile) => {
    setProfile(p);
    await saveProfile(p);
  }, []);

  const refreshMeals = useCallback(async () => {
    const m = await getTodayMeals();
    setTodayMeals(m);
  }, []);

  const addMeal = useCallback(async (meal: MealEntry) => {
    await storageLogMeal(meal);
    await refreshMeals();
  }, [refreshMeals]);

  const deleteMeal = useCallback(async (id: string) => {
    await removeMeal(id);
    await refreshMeals();
  }, [refreshMeals]);

  const trackDish = useCallback(async (name: string, accepted: boolean) => {
    await trackInteraction(name, accepted);
  }, []);

  return (
    <AppContext.Provider value={{
      profile, updateProfile,
      todayMeals, refreshMeals, addMeal, deleteMeal,
      budget,
      scannedDishes, setScannedDishes,
      dishesWithMacros, setDishesWithMacros,
      restaurantName, setRestaurantName,
      trackDish,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
