import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, Dimensions, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import { Typography, Spacing, BorderRadius } from '../theme/typography';
import { useApp } from '../context/AppContext';

const { width } = Dimensions.get('window');

const GOALS = [
  { key: 'weight_loss', icon: 'flame', label: 'Weight Loss', desc: 'Calorie deficit focus' },
  { key: 'muscle_gain', icon: 'barbell', label: 'Muscle Gain', desc: 'High protein priority' },
  { key: 'maintenance', icon: 'heart', label: 'Maintenance', desc: 'Balanced nutrition' },
  { key: 'low_carb', icon: 'leaf', label: 'Low Carb', desc: 'Carb-restricted diet' },
] as const;

const RESTRICTIONS = [
  { key: 'vegetarian', label: 'Vegetarian', icon: 'leaf' },
  { key: 'vegan', label: 'Vegan', icon: 'nutrition' },
  { key: 'gluten_free', label: 'Gluten-Free', icon: 'close-circle' },
  { key: 'dairy_free', label: 'Dairy-Free', icon: 'water' },
  { key: 'nut_free', label: 'Nut-Free', icon: 'alert-circle' },
  { key: 'halal', label: 'Halal', icon: 'checkmark-circle' },
] as const;

export default function OnboardingScreen({ navigation }: any) {
  const { profile, updateProfile } = useApp();
  const [goal, setGoal] = useState<string>(profile.goal);
  const [calories, setCalories] = useState(String(profile.dailyCalories));
  const [protein, setProtein] = useState(String(profile.proteinTarget));
  const [carbs, setCarbs] = useState(String(profile.carbLimit));
  const [restrictions, setRestrictions] = useState<string[]>(profile.restrictions);
  const [cheatDay, setCheatDay] = useState(profile.cheatDayEnabled);

  const toggleRestriction = (key: string) => {
    setRestrictions(prev =>
      prev.includes(key) ? prev.filter(r => r !== key) : [...prev, key]
    );
  };

  const handleSave = async () => {
    await updateProfile({
      goal: goal as any,
      dailyCalories: parseInt(calories) || 2000,
      proteinTarget: parseInt(protein) || 120,
      carbLimit: parseInt(carbs) || 250,
      restrictions,
      cheatDayEnabled: cheatDay,
      onboardingComplete: true,
    });
    navigation.navigate('Home');
  };

  const accentColor = cheatDay ? Colors.amber : Colors.accent;
  const accentBg = cheatDay ? Colors.amberBg : Colors.accentBg;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🧠 MenuMind</Text>
          <Text style={styles.title}>Set Up Your{'\n'}Diet Profile</Text>
          <Text style={styles.subtitle}>
            Tell us about your goals and we'll guide every restaurant visit.
          </Text>
        </View>

        {/* Goal Selection */}
        <Text style={styles.sectionLabel}>YOUR GOAL</Text>
        <View style={styles.goalGrid}>
          {GOALS.map(g => (
            <TouchableOpacity
              key={g.key}
              style={[
                styles.goalCard,
                goal === g.key && { borderColor: accentColor, backgroundColor: accentBg },
              ]}
              onPress={() => setGoal(g.key)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={g.icon as any}
                size={28}
                color={goal === g.key ? accentColor : Colors.textSecondary}
              />
              <Text style={[styles.goalLabel, goal === g.key && { color: accentColor }]}>
                {g.label}
              </Text>
              <Text style={styles.goalDesc}>{g.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Macro Targets */}
        <Text style={styles.sectionLabel}>DAILY TARGETS</Text>
        <View style={styles.macroInputRow}>
          <View style={styles.macroInputCard}>
            <View style={[styles.macroIcon, { backgroundColor: 'rgba(255,82,82,0.12)' }]}>
              <Ionicons name="flame" size={18} color={Colors.macroCalories} />
            </View>
            <Text style={styles.macroInputLabel}>Calories</Text>
            <TextInput
              style={styles.macroInput}
              value={calories}
              onChangeText={setCalories}
              keyboardType="numeric"
              placeholderTextColor={Colors.textMuted}
              placeholder="2000"
            />
            <Text style={styles.macroUnit}>kcal</Text>
          </View>

          <View style={styles.macroInputCard}>
            <View style={[styles.macroIcon, { backgroundColor: 'rgba(179,136,255,0.12)' }]}>
              <Ionicons name="barbell" size={18} color={Colors.macroProtein} />
            </View>
            <Text style={styles.macroInputLabel}>Protein</Text>
            <TextInput
              style={styles.macroInput}
              value={protein}
              onChangeText={setProtein}
              keyboardType="numeric"
              placeholderTextColor={Colors.textMuted}
              placeholder="120"
            />
            <Text style={styles.macroUnit}>g</Text>
          </View>

          <View style={styles.macroInputCard}>
            <View style={[styles.macroIcon, { backgroundColor: 'rgba(255,179,0,0.12)' }]}>
              <Ionicons name="nutrition" size={18} color={Colors.macroCarbs} />
            </View>
            <Text style={styles.macroInputLabel}>Carbs</Text>
            <TextInput
              style={styles.macroInput}
              value={carbs}
              onChangeText={setCarbs}
              keyboardType="numeric"
              placeholderTextColor={Colors.textMuted}
              placeholder="250"
            />
            <Text style={styles.macroUnit}>g</Text>
          </View>
        </View>

        {/* Dietary Restrictions */}
        <Text style={styles.sectionLabel}>DIETARY RESTRICTIONS</Text>
        <View style={styles.restrictionGrid}>
          {RESTRICTIONS.map(r => (
            <TouchableOpacity
              key={r.key}
              style={[
                styles.restrictionChip,
                restrictions.includes(r.key) && {
                  borderColor: accentColor,
                  backgroundColor: accentBg,
                },
              ]}
              onPress={() => toggleRestriction(r.key)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={r.icon as any}
                size={16}
                color={restrictions.includes(r.key) ? accentColor : Colors.textSecondary}
              />
              <Text
                style={[
                  styles.restrictionLabel,
                  restrictions.includes(r.key) && { color: accentColor },
                ]}
              >
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Cheat Day Toggle */}
        <Text style={styles.sectionLabel}>CHEAT DAY MODE</Text>
        <TouchableOpacity
          style={[
            styles.cheatDayCard,
            cheatDay && { borderColor: Colors.amber, backgroundColor: Colors.amberBg },
          ]}
          onPress={() => setCheatDay(!cheatDay)}
          activeOpacity={0.7}
        >
          <View style={styles.cheatDayLeft}>
            <Text style={{ fontSize: 28 }}>🍕</Text>
            <View style={{ marginLeft: 12 }}>
              <Text style={[styles.cheatDayTitle, cheatDay && { color: Colors.amber }]}>
                Cheat Day
              </Text>
              <Text style={styles.cheatDayDesc}>
                Find the least damaging option instead
              </Text>
            </View>
          </View>
          <View style={[styles.toggle, cheatDay && styles.toggleOn]}>
            <View style={[styles.toggleDot, cheatDay && styles.toggleDotOn]} />
          </View>
        </TouchableOpacity>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: accentColor }]}
          onPress={handleSave}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark-circle" size={22} color={Colors.bg} />
          <Text style={styles.saveBtnText}>Save Profile & Continue</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 28,
  },
  logo: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.accent,
    marginBottom: 12,
    letterSpacing: 1,
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  sectionLabel: {
    ...Typography.label,
    color: Colors.textMuted,
    marginTop: 24,
    marginBottom: 12,
  },
  goalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  goalCard: {
    width: (width - 50) / 2,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 16,
    gap: 6,
  },
  goalLabel: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    marginTop: 4,
  },
  goalDesc: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  macroInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  macroInputCard: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  macroIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  macroInputLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  macroInput: {
    ...Typography.numberSm,
    color: Colors.textPrimary,
    textAlign: 'center',
    width: '100%',
    paddingVertical: 4,
  },
  macroUnit: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  restrictionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  restrictionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  restrictionLabel: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
  },
  cheatDayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgCard,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 16,
  },
  cheatDayLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cheatDayTitle: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
  },
  cheatDayDesc: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.bgInput,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleOn: {
    backgroundColor: Colors.amber,
  },
  toggleDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.textSecondary,
  },
  toggleDotOn: {
    alignSelf: 'flex-end',
    backgroundColor: '#fff',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: BorderRadius.lg,
    marginTop: 32,
  },
  saveBtnText: {
    ...Typography.bodyMedium,
    color: Colors.bg,
    fontWeight: '700',
  },
});
