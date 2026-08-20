/**
 * Reusable Nutrition Calculation & Portion Scaling Engine for FIT ERA
 */

export interface FoodNutritionData {
  id?: string;
  foodId?: string | null;
  name: string;
  category: string;
  servingSize: string; // e.g. "100 g/ml", "25 g/ml"
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  calcium: number;
  iron: number;
  vitaminC: number;
  vitaminA: number;
  vegetarian: boolean;
  vegan: boolean;
  dataType?: string;
  sourceNote?: string | null;
}

export interface ScaledNutritionResult {
  multiplier: number;
  portionGrams: number;
  portionLabel: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  calcium: number;
  iron: number;
  vitaminC: number;
  vitaminA: number;
  macroPercentages: {
    proteinPct: number;
    carbsPct: number;
    fatPct: number;
  };
}

/**
 * Extracts base gram weight from servingSize string (e.g. "100 g/ml" -> 100, "25 g/ml" -> 25)
 */
export function extractBaseGrams(servingSizeStr: string): number {
  if (!servingSizeStr) return 100;
  const match = servingSizeStr.match(/(\d+(\.\d+)?)/);
  if (match && match[1]) {
    const num = parseFloat(match[1]);
    return num > 0 ? num : 100;
  }
  return 100;
}

/**
 * Dynamically scales base nutrition values by selected target weight or serving multiplier
 */
export function calculateScaledNutrition(
  food: FoodNutritionData,
  selectedPortion: number | { grams?: number; multiplier?: number; label?: string }
): ScaledNutritionResult {
  const baseGrams = extractBaseGrams(food.servingSize);
  let multiplier = 1;
  let targetGrams = baseGrams;
  let portionLabel = `${baseGrams}g`;

  if (typeof selectedPortion === "number") {
    targetGrams = selectedPortion;
    multiplier = targetGrams / baseGrams;
    portionLabel = `${targetGrams}g`;
  } else if (selectedPortion.multiplier !== undefined) {
    multiplier = selectedPortion.multiplier;
    targetGrams = Math.round(baseGrams * multiplier);
    portionLabel = selectedPortion.label || `${targetGrams}g (${multiplier}x)`;
  } else if (selectedPortion.grams !== undefined) {
    targetGrams = selectedPortion.grams;
    multiplier = targetGrams / baseGrams;
    portionLabel = selectedPortion.label || `${targetGrams}g`;
  }

  const round = (val: number, decimals = 1): number => {
    const factor = Math.pow(10, decimals);
    return Math.round(val * factor) / factor;
  };

  const calories = round(food.calories * multiplier, 0);
  const protein = round(food.protein * multiplier, 1);
  const carbs = round(food.carbs * multiplier, 1);
  const fat = round(food.fat * multiplier, 1);
  const fiber = round(food.fiber * multiplier, 1);
  const sugar = round(food.sugar * multiplier, 1);
  const sodium = round(food.sodium * multiplier, 0);
  const calcium = round(food.calcium * multiplier, 0);
  const iron = round(food.iron * multiplier, 2);
  const vitaminC = round(food.vitaminC * multiplier, 1);
  const vitaminA = round(food.vitaminA * multiplier, 1);

  // Compute macro percentages
  const totalMacroGrams = protein + carbs + fat;
  let proteinPct = 0;
  let carbsPct = 0;
  let fatPct = 0;

  if (totalMacroGrams > 0) {
    proteinPct = Math.round(((protein * 4) / Math.max(calories, 1)) * 100);
    carbsPct = Math.round(((carbs * 4) / Math.max(calories, 1)) * 100);
    fatPct = Math.max(0, 100 - proteinPct - carbsPct);
  }

  return {
    multiplier: round(multiplier, 2),
    portionGrams: targetGrams,
    portionLabel,
    calories,
    protein,
    carbs,
    fat,
    fiber,
    sugar,
    sodium,
    calcium,
    iron,
    vitaminC,
    vitaminA,
    macroPercentages: {
      proteinPct,
      carbsPct,
      fatPct,
    },
  };
}
