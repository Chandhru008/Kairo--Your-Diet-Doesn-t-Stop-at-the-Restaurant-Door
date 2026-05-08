import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, MealEntry, RemainingBudget, RankedDish, DishWithMacros } from '../types';
import { getProfile, saveProfile, getTodayMeals, logMeal as storageLogMeal, removeMeal, trackInteraction } from '../services/storageService';

interface AppContextType {
  isAuthenticated: boolean;
  login: (username: string, pass: string, isLogin: boolean) => Promise<void>;
  logout: () => Promise<void>;
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    goal: 'maintenance',
    dietType: 'anything',
    dailyCalories: 2000,
    proteinTarget: 120,
    carbLimit: 250,
    fiberLimit: 30,
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
    fiber: Math.max(0, profile.fiberLimit - todayMeals.reduce((s, m) => s + m.macros.fiber, 0)),
  };

  useEffect(() => {
    (async () => {
      // Mock check auth
      const auth = await AsyncStorage.getItem('@menumind_auth');
      if (auth) setIsAuthenticated(true);

      const p = await getProfile();
      setProfile(p);
      const m = await getTodayMeals();
      setTodayMeals(m);
    })();
  }, []);

  const login = useCallback(async (username: string, pass: string, isLogin: boolean) => {
    // Basic mock auth
    await AsyncStorage.setItem('@menumind_auth', JSON.stringify({ username }));
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem('@menumind_auth');
    await AsyncStorage.removeItem('@menumind_profile');
    setIsAuthenticated(false);
    setProfile({
      goal: 'maintenance',
      dietType: 'anything',
      dailyCalories: 2000,
      proteinTarget: 120,
      carbLimit: 250,
      fiberLimit: 30,
      restrictions: [],
      cheatDayEnabled: false,
      onboardingComplete: false,
    });
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
      isAuthenticated, login, logout,
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
