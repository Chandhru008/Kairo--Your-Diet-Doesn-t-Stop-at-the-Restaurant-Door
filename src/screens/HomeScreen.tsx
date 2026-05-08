import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Dimensions, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography, Spacing, BorderRadius } from '../theme/typography';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

function MacroCard({
  label, current, total, color, icon, unit,
}: {
  label: string; current: number; total: number; color: string; icon: string; unit: string;
}) {
  const remaining = Math.max(0, total - current);
  const pct = Math.min(1, current / total);

  return (
    <View style={[styles.macroCard, { borderColor: `${color}20` }]}>
      <View style={[styles.macroIconBg, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon as any} size={18} color={color} />
      </View>
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={[styles.macroNumber, { color }]}>{remaining}</Text>
      <Text style={styles.macroUnit}>{unit} left</Text>
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.macroSubtext}>{current} / {total}</Text>
    </View>
  );
}

export default function HomeScreen({ navigation }: any) {
  const { profile, todayMeals, budget, refreshMeals, deleteMeal } = useApp();
  const isCheatDay = profile.cheatDayEnabled;
  const accentColor = isCheatDay ? Colors.amber : Colors.accent;

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => { refreshMeals(); });
    return unsub;
  }, [navigation, refreshMeals]);

  const handleDeleteMeal = (id: string, name: string) => {
    Alert.alert('Remove Meal', `Remove ${name} from today's log?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteMeal(id) },
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.greeting}>
              {isCheatDay ? '🍕 Cheat Day Active' : '👋 Hey there!'}
            </Text>
            <Text style={styles.title}>
              {isCheatDay ? 'Damage Control Mode' : "Today's Budget"}
            </Text>
          </View>
          
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => navigation.navigate('History')}
            >
              <Ionicons name="time" size={26} color={Colors.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerIconBtn}
              onPress={() => navigation.navigate('Profile')}
            >
              <Ionicons name="settings" size={26} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Cheat Day Banner */}
        {isCheatDay && (
          <View style={styles.cheatBanner}>
            <Text style={{ fontSize: 20 }}>🔥</Text>
            <Text style={styles.cheatBannerText}>
              Limits relaxed — finding least damaging options
            </Text>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: Colors.accent }]}
            onPress={() => navigation.navigate('Scanner', { scanType: 'menu' })}
            activeOpacity={0.8}
          >
            <View style={styles.actionIconWrap}>
              <Ionicons name="document-text" size={24} color={Colors.bg} />
            </View>
            <Text style={styles.actionBtnTitle}>Scan Menu</Text>
            <Text style={styles.actionBtnSub}>Analyze full menu</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: Colors.bgCard, borderWidth: 1, borderColor: Colors.accentBorder }]}
            onPress={() => navigation.navigate('Scanner', { scanType: 'dish' })}
            activeOpacity={0.8}
          >
            <View style={[styles.actionIconWrap, { backgroundColor: Colors.accentBg }]}>
              <Ionicons name="restaurant" size={24} color={Colors.accent} />
            </View>
            <Text style={[styles.actionBtnTitle, { color: Colors.textPrimary }]}>Scan Dish</Text>
            <Text style={styles.actionBtnSub}>Identify food & macros</Text>
          </TouchableOpacity>
        </View>

        {/* Macro Cards */}
        <View style={styles.macroRow}>
          <MacroCard
            label="Calories"
            current={todayMeals.reduce((s, m) => s + m.macros.calories, 0)}
            total={profile.dailyCalories}
            color={Colors.macroCalories}
            icon="flame"
            unit="kcal"
          />
          <MacroCard
            label="Protein"
            current={todayMeals.reduce((s, m) => s + m.macros.protein, 0)}
            total={profile.proteinTarget}
            color={Colors.macroProtein}
            icon="barbell"
            unit="g"
          />
          <MacroCard
            label="Carbs"
            current={todayMeals.reduce((s, m) => s + m.macros.carbs, 0)}
            total={profile.carbLimit}
            color={Colors.macroCarbs}
            icon="nutrition"
            unit="g"
          />
          <MacroCard
            label="Fiber"
            current={todayMeals.reduce((s, m) => s + m.macros.fiber || 0, 0)}
            total={profile.fiberLimit || 30}
            color={Colors.goodFit}
            icon="leaf"
            unit="g"
          />
        </View>

        {/* Meals Logged Today */}
        <View style={styles.mealsSection}>
          <Text style={styles.sectionLabel}>
            MEALS LOGGED TODAY ({todayMeals.length})
          </Text>
          {todayMeals.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="restaurant-outline" size={40} color={Colors.textMuted} />
              <Text style={styles.emptyTitle}>No meals logged yet</Text>
              <Text style={styles.emptySubtext}>
                Scan a menu to get started
              </Text>
            </View>
          ) : (
            todayMeals.map(meal => (
              <View key={meal.id} style={styles.mealCard}>
                <View style={styles.mealLeft}>
                  <Text style={styles.mealName}>{meal.name}</Text>
                  <View style={styles.mealMacroRow}>
                    <Text style={[styles.mealMacro, { color: Colors.macroCalories }]}>
                      {meal.macros.calories} kcal
                    </Text>
                    <Text style={styles.macroDot}>·</Text>
                    <Text style={[styles.mealMacro, { color: Colors.macroProtein }]}>
                      {meal.macros.protein}g P
                    </Text>
                    <Text style={styles.macroDot}>·</Text>
                    <Text style={[styles.mealMacro, { color: Colors.macroCarbs }]}>
                      {meal.macros.carbs}g C
                    </Text>
                    <Text style={styles.macroDot}>·</Text>
                    <Text style={[styles.mealMacro, { color: Colors.macroFat }]}>
                      {meal.macros.fat}g F
                    </Text>
                    <Text style={styles.macroDot}>·</Text>
                    <Text style={[styles.mealMacro, { color: Colors.goodFit }]}>
                      {meal.macros.fiber || 0}g Fib
                    </Text>
                  </View>
                  {meal.restaurantName && (
                    <Text style={styles.mealRestaurant}>📍 {meal.restaurantName}</Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => handleDeleteMeal(meal.id, meal.name)}
                  style={styles.deleteBtn}
                >
                  <Ionicons name="close-circle" size={22} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scrollContent: { paddingHorizontal: 20, paddingTop: 60 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: { ...Typography.bodySm, color: Colors.textSecondary, marginBottom: 4 },
  title: { ...Typography.h2, color: Colors.textPrimary },
  headerIconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.bgCard, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border },
  profileBtn: { padding: 4 },
  cheatBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.amberBg,
    borderWidth: 1,
    borderColor: Colors.amberBorder,
    borderRadius: BorderRadius.lg,
    padding: 14,
    marginBottom: 16,
  },
  cheatBannerText: { ...Typography.bodySm, color: Colors.amber, flex: 1 },
  
  // Quick Actions
  actionsContainer: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  actionBtn: { flex: 1, padding: 16, borderRadius: BorderRadius.xl, alignItems: 'flex-start' },
  actionIconWrap: { padding: 10, borderRadius: BorderRadius.md, backgroundColor: 'rgba(255,255,255,0.2)', marginBottom: 12 },
  actionBtnTitle: { ...Typography.bodyMedium, color: Colors.bg, fontWeight: '700', marginBottom: 2 },
  actionBtnSub: { ...Typography.caption, color: Colors.textMuted },
  macroRow: { flexDirection: 'row', gap: 10, marginBottom: 8, flexWrap: 'wrap' },
  macroCard: {
    width: '48%',
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  macroIconBg: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
  },
  macroLabel: { ...Typography.caption, color: Colors.textSecondary },
  macroNumber: { ...Typography.number, color: Colors.textPrimary },
  macroUnit: { ...Typography.caption, color: Colors.textMuted },
  progressBg: {
    width: '100%', height: 4, borderRadius: 2,
    backgroundColor: Colors.bgInput, marginTop: 4,
  },
  progressFill: { height: 4, borderRadius: 2 },
  macroSubtext: { ...Typography.caption, color: Colors.textMuted, fontSize: 10 },
  mealsSection: { marginTop: 24 },
  sectionLabel: { ...Typography.label, color: Colors.textMuted, marginBottom: 12 },
  emptyCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  emptyTitle: { ...Typography.bodyMedium, color: Colors.textSecondary },
  emptySubtext: { ...Typography.caption, color: Colors.textMuted },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 8,
  },
  mealLeft: { flex: 1 },
  mealName: { ...Typography.bodyMedium, color: Colors.textPrimary, marginBottom: 4 },
  mealMacroRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  mealMacro: { ...Typography.caption, fontSize: 11 },
  macroDot: { color: Colors.textMuted, marginHorizontal: 4, fontSize: 10 },
  mealRestaurant: { ...Typography.caption, color: Colors.textMuted, marginTop: 4 },
  deleteBtn: { padding: 4 },
});
