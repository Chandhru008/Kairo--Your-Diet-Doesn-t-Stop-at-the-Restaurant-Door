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
          <View>
            <Text style={styles.greeting}>
              {isCheatDay ? '🍕 Cheat Day Active' : '👋 Hey there!'}
            </Text>
            <Text style={styles.title}>
              {isCheatDay ? 'Damage Control Mode' : "Today's Budget"}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.profileBtn}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person-circle" size={36} color={accentColor} />
          </TouchableOpacity>
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

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: accentColor }]}
        onPress={() => navigation.navigate('Scanner')}
        activeOpacity={0.85}
      >
        <Ionicons name="camera" size={28} color={Colors.bg} />
      </TouchableOpacity>
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
  macroRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  macroCard: {
    flex: 1,
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
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
