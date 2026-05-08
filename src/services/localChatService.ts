// Local chat service — no API needed
// Answers menu questions using template-based logic
import { DishWithMacros, RemainingBudget } from '../types';

export function localChatResponse(
  question: string,
  dishes: DishWithMacros[],
  budget: RemainingBudget,
  goal: string
): string {
  const q = question.toLowerCase();

  // Most protein
  if (q.includes('most protein') || q.includes('highest protein') || q.includes('protein rich')) {
    const sorted = [...dishes].sort((a, b) => b.macros.protein - a.macros.protein);
    const top3 = sorted.slice(0, 3);
    return `Here are the highest protein dishes:\n${top3.map((d, i) => `${i + 1}. **${d.name}** — ${d.macros.protein}g protein (${d.macros.calories} kcal)`).join('\n')}\n\nI'd recommend **${top3[0].name}** with ${top3[0].macros.protein}g protein.`;
  }

  // Lowest calorie
  if (q.includes('lowest calorie') || q.includes('least calorie') || q.includes('low cal') || q.includes('fewest cal')) {
    const sorted = [...dishes].sort((a, b) => a.macros.calories - b.macros.calories);
    const top3 = sorted.slice(0, 3);
    return `Lowest calorie options:\n${top3.map((d, i) => `${i + 1}. **${d.name}** — ${d.macros.calories} kcal (${d.macros.protein}g protein)`).join('\n')}`;
  }

  // Low carb
  if (q.includes('low carb') || q.includes('least carb') || q.includes('keto')) {
    const sorted = [...dishes].sort((a, b) => a.macros.carbs - b.macros.carbs);
    const top3 = sorted.slice(0, 3);
    return `Lowest carb options:\n${top3.map((d, i) => `${i + 1}. **${d.name}** — ${d.macros.carbs}g carbs (${d.macros.calories} kcal)`).join('\n')}`;
  }

  // Can I eat two dishes
  if (q.includes('two dishes') || q.includes('2 dishes') || q.includes('eat both') || q.includes('combo')) {
    const affordable = dishes.filter(d => d.macros.calories <= budget.calories / 2);
    if (affordable.length >= 2) {
      const best2 = affordable.sort((a, b) => b.macros.protein - a.macros.protein).slice(0, 2);
      const totalCal = best2[0].macros.calories + best2[1].macros.calories;
      const totalPro = best2[0].macros.protein + best2[1].macros.protein;
      return `Yes! You can fit two dishes. Best combo:\n• **${best2[0].name}** (${best2[0].macros.calories} kcal)\n• **${best2[1].name}** (${best2[1].macros.calories} kcal)\n\nTotal: ${totalCal} kcal, ${totalPro}g protein — within your ${budget.calories} kcal budget.`;
    }
    return `With ${budget.calories} kcal remaining, it's tight for two full dishes. Try picking one main dish and one side/appetizer.`;
  }

  // Skip rice
  if (q.includes('skip the rice') || q.includes('without rice') || q.includes('no rice')) {
    return `Skipping rice saves roughly 200-250 kcal and 44g+ carbs. Great move for ${goal === 'low_carb' ? 'your low-carb goal' : 'staying within budget'}! Pair your curry with a roti (120 kcal) instead, or eat the curry by itself.`;
  }

  // Skip naan/bread
  if (q.includes('skip the naan') || q.includes('without naan') || q.includes('no bread')) {
    return `Skipping naan saves 260-320 kcal and ~42g carbs. Switch to plain roti (120 kcal) or go bread-free — your curry still tastes great without it!`;
  }

  // Best combo under X kcal
  const comboMatch = q.match(/under\s*(\d+)\s*kcal/);
  if (comboMatch || q.includes('best combo')) {
    const limit = comboMatch ? parseInt(comboMatch[1]) : budget.calories;
    const affordable = dishes.filter(d => d.macros.calories <= limit * 0.6);
    if (affordable.length >= 2) {
      const combo = affordable.sort((a, b) => b.macros.protein - a.macros.protein).slice(0, 2);
      return `Best combo under ${limit} kcal:\n• **${combo[0].name}** (${combo[0].macros.calories} kcal, ${combo[0].macros.protein}g protein)\n• **${combo[1].name}** (${combo[1].macros.calories} kcal, ${combo[1].macros.protein}g protein)\n\nTotal: ${combo[0].macros.calories + combo[1].macros.calories} kcal`;
    }
    return `Hard to fit a combo under ${limit} kcal from these options. Pick a single dish that's under ${limit} kcal.`;
  }

  // What should I order / recommend
  if (q.includes('recommend') || q.includes('what should') || q.includes('suggest') || q.includes('best')) {
    const fits = dishes.filter(d => d.macros.calories <= budget.calories).sort((a, b) => b.macros.protein - a.macros.protein);
    if (fits.length > 0) {
      return `Based on your ${budget.calories} kcal budget and ${goal.replace('_', ' ')} goal, I'd recommend **${fits[0].name}** — ${fits[0].macros.calories} kcal with ${fits[0].macros.protein}g protein. It fits your budget perfectly.`;
    }
    return `You have ${budget.calories} kcal left. Look for the lightest options — soups, salads, or grilled items.`;
  }

  // Specific dish question
  for (const dish of dishes) {
    if (q.includes(dish.name.toLowerCase())) {
      const fitsInBudget = dish.macros.calories <= budget.calories;
      return `**${dish.name}** has:\n• ${dish.macros.calories} kcal\n• ${dish.macros.protein}g protein\n• ${dish.macros.carbs}g carbs\n• ${dish.macros.fat}g fat\n\n${fitsInBudget ? `✅ This fits within your ${budget.calories} kcal budget.` : `⚠️ At ${dish.macros.calories} kcal, this exceeds your ${budget.calories} kcal remaining.`}`;
    }
  }

  // Default
  return `You have ${budget.calories} kcal and ${budget.protein}g protein remaining. There are ${dishes.length} dishes loaded. Try asking about specific dishes, "most protein", "lowest calorie", or "can I eat two dishes?"`;
}
