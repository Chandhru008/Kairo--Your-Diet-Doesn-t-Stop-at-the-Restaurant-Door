// Local ranking service — no API needed
// Ranks dishes based on how well they fit the user's remaining macro budget
import { DishWithMacros, RankedDish, RemainingBudget, Verdict } from '../types';

export function rankDishesLocally(
  dishes: DishWithMacros[],
  budget: RemainingBudget,
  goal: string,
  cheatDay: boolean
): RankedDish[] {
  const scored = dishes.map(dish => {
    let score = 50; // base score

    if (cheatDay) {
      // Cheat day: rank by least damage — lower cal/fat = better
      const calPenalty = dish.macros.calories / 10;
      const fatPenalty = dish.macros.fat * 1.5;
      score = Math.max(0, 100 - calPenalty - fatPenalty);
    } else {
      // Normal mode: fit within budget
      const calFit = dish.macros.calories <= budget.calories;
      const proteinFit = dish.macros.protein <= budget.protein;
      const carbFit = dish.macros.carbs <= budget.carbs;

      if (calFit) score += 20;
      if (proteinFit) score += 5;
      if (carbFit) score += 10;

      // Bonus for high protein ratio
      const proteinRatio = dish.macros.protein / Math.max(1, dish.macros.calories) * 100;
      if (proteinRatio > 15) score += 10;
      if (proteinRatio > 20) score += 5;

      // Goal-specific scoring
      if (goal === 'weight_loss') {
        if (dish.macros.calories < 400) score += 10;
        if (dish.macros.calories < 250) score += 5;
        if (dish.macros.fat > 25) score -= 10;
      } else if (goal === 'muscle_gain') {
        if (dish.macros.protein > 25) score += 15;
        if (dish.macros.protein > 35) score += 5;
      } else if (goal === 'low_carb') {
        if (dish.macros.carbs < 20) score += 15;
        if (dish.macros.carbs > 50) score -= 15;
      }

      // Penalty if over budget
      if (!calFit) score -= 20;
      if (dish.macros.calories > budget.calories * 1.5) score -= 15;
    }

    score = Math.max(0, Math.min(100, Math.round(score)));

    let verdict: Verdict = 'good';
    if (score >= 70) verdict = 'top_pick';
    else if (score < 40) verdict = 'skip';

    const reason = generateReason(dish, budget, goal, cheatDay, score);
    const tip = generateTip(dish, goal);

    return { ...dish, score, verdict, reason, customizationTip: tip };
  });

  return scored.sort((a, b) => b.score - a.score);
}

function generateReason(
  dish: DishWithMacros,
  budget: RemainingBudget,
  goal: string,
  cheatDay: boolean,
  score: number
): string {
  if (cheatDay) {
    if (score >= 70) return `Lower calorie option at ${dish.macros.calories} kcal — least damage on the menu`;
    if (score >= 40) return `Moderate at ${dish.macros.calories} kcal with ${dish.macros.fat}g fat`;
    return `High calorie (${dish.macros.calories} kcal) and fat (${dish.macros.fat}g) — most indulgent`;
  }

  const calRemaining = budget.calories;
  const fitsCalories = dish.macros.calories <= calRemaining;
  const proteinRatio = Math.round(dish.macros.protein / Math.max(1, dish.macros.calories) * 100);

  if (score >= 70) {
    if (goal === 'muscle_gain') return `${dish.macros.protein}g protein fits perfectly within your ${calRemaining} kcal budget`;
    if (goal === 'weight_loss') return `Only ${dish.macros.calories} kcal — keeps you well within budget`;
    if (goal === 'low_carb') return `Just ${dish.macros.carbs}g carbs with good protein at ${dish.macros.protein}g`;
    return `Balanced macros fitting within your ${calRemaining} kcal remaining`;
  }
  if (score >= 40) {
    if (!fitsCalories) return `At ${dish.macros.calories} kcal, this uses most of your ${calRemaining} kcal budget`;
    return `Decent option with ${dish.macros.protein}g protein but watch the ${dish.macros.fat}g fat`;
  }
  if (!fitsCalories) return `${dish.macros.calories} kcal exceeds your remaining ${calRemaining} kcal budget`;
  return `High in ${dish.macros.fat > 25 ? 'fat' : 'carbs'} — not ideal for ${goal.replace('_', ' ')}`;
}

function generateTip(dish: DishWithMacros, goal: string): string {
  const tips: string[] = [];

  if (dish.macros.fat > 25) tips.push('Ask for less oil or grilled instead of fried');
  if (dish.macros.carbs > 50) tips.push('Ask for half portion of rice or skip the bread');
  if (dish.macros.calories > 500) tips.push('Share this dish or eat half portion');
  if (dish.macros.protein < 10 && goal === 'muscle_gain') tips.push('Add a side of grilled chicken or paneer for protein');

  if (dish.name.toLowerCase().includes('biryani')) tips.push('Ask for raita on the side, skip the gravy');
  if (dish.name.toLowerCase().includes('naan') || dish.name.toLowerCase().includes('paratha'))
    tips.push('Switch to plain roti to save 100+ calories');
  if (dish.name.toLowerCase().includes('curry'))
    tips.push('Ask for sauce on the side to control portions');
  if (dish.name.toLowerCase().includes('fried'))
    tips.push('Request grilled or tandoori instead of fried');

  return tips[0] || 'Ask about preparation method for healthier options';
}
