// USDA FoodData Central (FDC) API Client with Multi-Tier Caching & Offline Foundation Fallback

export interface NormalizedNutrients {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number | null;
  saturatedFat: number | null;
  cholesterol: number | null;
  sodium: number | null;
  potassium: number | null;
  calcium: number | null;
  iron: number | null;
  vitaminC: number | null;
  vitaminD: number | null;
}

export interface CanonicalNutritionRecord {
  id: string | number;
  foodName: string;
  dataType: string;
  source: string; // e.g. "USDA FoodData Central #171287"
  isVerified: boolean;
  per100g: NormalizedNutrients;
  healthBenefits?: string[];
  warnings?: string[];
}

// In-Memory Fast Cache with 24-Hour TTL
interface CacheEntry {
  record: CanonicalNutritionRecord;
  timestamp: number;
}

const NUTRITION_CACHE = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// Curated USDA Foundation Snapshot for Instant Zero-Latency & Offline Stability
export const USDA_OFFLINE_FOUNDATION: Record<string, CanonicalNutritionRecord> = {
  egg: {
    id: 171287,
    foodName: "Whole Chicken Egg (Raw / Boiled)",
    dataType: "Foundation",
    source: "USDA FoodData Central #171287",
    isVerified: true,
    per100g: {
      calories: 143,
      protein: 12.6,
      carbs: 0.7,
      fat: 9.5,
      fiber: 0,
      sugar: 0.4,
      saturatedFat: 3.1,
      cholesterol: 372,
      sodium: 142,
      potassium: 138,
      calcium: 56,
      iron: 1.8,
      vitaminC: 0,
      vitaminD: 2.0,
    },
    healthBenefits: [
      "Complete protein with all 9 essential amino acids (DIAAS score ~1.18).",
      "Rich in choline (294mg/100g) essential for brain neurotransmitter synthesis and liver lipid metabolism.",
      "High lutein and zeaxanthin content supporting retinal health.",
    ],
  },
  "chicken breast": {
    id: 171077,
    foodName: "Chicken Breast (Meat Only, Cooked / Grilled)",
    dataType: "Foundation",
    source: "USDA FoodData Central #171077",
    isVerified: true,
    per100g: {
      calories: 165,
      protein: 31.0,
      carbs: 0,
      fat: 3.6,
      fiber: 0,
      sugar: 0,
      saturatedFat: 1.0,
      cholesterol: 85,
      sodium: 74,
      potassium: 256,
      calcium: 15,
      iron: 1.0,
      vitaminC: 0,
      vitaminD: 0.1,
    },
    healthBenefits: [
      "Extremely high protein-to-calorie ratio (>75% calories from protein).",
      "Rich in niacin (vitamin B3) and vitamin B6 supporting cellular energy production.",
      "Low saturated fat profile optimal for lean muscle mass accretion and cardiovascular health.",
    ],
  },
  apple: {
    id: 175034,
    foodName: "Apple (Raw, with skin)",
    dataType: "Foundation",
    source: "USDA FoodData Central #175034",
    isVerified: true,
    per100g: {
      calories: 52,
      protein: 0.3,
      carbs: 13.8,
      fat: 0.2,
      fiber: 2.4,
      sugar: 10.4,
      saturatedFat: 0.03,
      cholesterol: 0,
      sodium: 1,
      potassium: 107,
      calcium: 6,
      iron: 0.1,
      vitaminC: 4.6,
      vitaminD: 0,
    },
    healthBenefits: [
      "Pectin soluble fiber slows gastric emptying and moderates postprandial blood glucose.",
      "Rich in quercetin and polyphenol antioxidants that protect vascular endothelium.",
    ],
  },
  banana: {
    id: 173944,
    foodName: "Banana (Raw, peeled)",
    dataType: "Foundation",
    source: "USDA FoodData Central #173944",
    isVerified: true,
    per100g: {
      calories: 89,
      protein: 1.1,
      carbs: 22.8,
      fat: 0.3,
      fiber: 2.6,
      sugar: 12.2,
      saturatedFat: 0.1,
      cholesterol: 0,
      sodium: 1,
      potassium: 358,
      calcium: 5,
      iron: 0.3,
      vitaminC: 8.7,
      vitaminD: 0,
    },
    healthBenefits: [
      "Outstanding natural source of potassium (358mg/100g) assisting muscle contraction and electrolyte balance.",
      "Provides fast-absorbing natural fructose and resistant starch for athletic energy.",
    ],
  },
  "cooked rice": {
    id: 169756,
    foodName: "White Rice (Long-Grain, Cooked)",
    dataType: "Survey (FNDDS)",
    source: "USDA FoodData Central #169756",
    isVerified: true,
    per100g: {
      calories: 130,
      protein: 2.7,
      carbs: 28.2,
      fat: 0.3,
      fiber: 0.4,
      sugar: 0.1,
      saturatedFat: 0.1,
      cholesterol: 0,
      sodium: 1,
      potassium: 35,
      calcium: 10,
      iron: 1.2,
      vitaminC: 0,
      vitaminD: 0,
    },
    healthBenefits: [
      "Easily digestible carbohydrate source with near-zero FODMAPs and allergens.",
      "Rapid glycogen replenishment post-workout.",
    ],
  },
  oats: {
    id: 173904,
    foodName: "Rolled Oats (Whole Grain, Dry)",
    dataType: "Foundation",
    source: "USDA FoodData Central #173904",
    isVerified: true,
    per100g: {
      calories: 389,
      protein: 16.9,
      carbs: 66.3,
      fat: 6.9,
      fiber: 10.6,
      sugar: 0,
      saturatedFat: 1.2,
      cholesterol: 0,
      sodium: 2,
      potassium: 429,
      calcium: 54,
      iron: 4.7,
      vitaminC: 0,
      vitaminD: 0,
    },
    healthBenefits: [
      "Beta-glucan soluble fiber clinically proven to reduce LDL cholesterol and improve insulin sensitivity.",
      "High manganese, phosphorus, and non-heme iron content.",
    ],
  },
  milk: {
    id: 746782,
    foodName: "Whole Milk (3.25% Milkfat)",
    dataType: "SR Legacy",
    source: "USDA FoodData Central #746782",
    isVerified: true,
    per100g: {
      calories: 61,
      protein: 3.2,
      carbs: 4.8,
      fat: 3.3,
      fiber: 0,
      sugar: 5.1,
      saturatedFat: 1.9,
      cholesterol: 10,
      sodium: 43,
      potassium: 132,
      calcium: 113,
      iron: 0.03,
      vitaminC: 0,
      vitaminD: 1.3,
    },
    healthBenefits: [
      "Optimal 80:20 casein-to-whey ratio with natural electrolyte hydration.",
      "High bioavailable calcium and vitamin D for skeletal integrity.",
    ],
  },
  salmon: {
    id: 173686,
    foodName: "Atlantic Salmon (Raw / Baked)",
    dataType: "Foundation",
    source: "USDA FoodData Central #173686",
    isVerified: true,
    per100g: {
      calories: 208,
      protein: 20.4,
      carbs: 0,
      fat: 13.4,
      fiber: 0,
      sugar: 0,
      saturatedFat: 3.1,
      cholesterol: 55,
      sodium: 59,
      potassium: 363,
      calcium: 9,
      iron: 0.3,
      vitaminC: 0,
      vitaminD: 11.0,
    },
    healthBenefits: [
      "Rich source of long-chain Omega-3 fatty acids (EPA & DHA) lowering systemic inflammation.",
      "High natural vitamin D3 content supporting immune endocrine regulation.",
    ],
  },
  broccoli: {
    id: 170379,
    foodName: "Broccoli (Raw / Steamed)",
    dataType: "Foundation",
    source: "USDA FoodData Central #170379",
    isVerified: true,
    per100g: {
      calories: 34,
      protein: 2.8,
      carbs: 6.6,
      fat: 0.4,
      fiber: 2.6,
      sugar: 1.7,
      saturatedFat: 0.04,
      cholesterol: 0,
      sodium: 33,
      potassium: 316,
      calcium: 47,
      iron: 0.7,
      vitaminC: 89.2,
      vitaminD: 0,
    },
    healthBenefits: [
      "Exceptionally high vitamin C (89mg per 100g - ~100% RDA).",
      "Rich in sulforaphane, an isothiocyanate with potent cellular detoxifying properties.",
    ],
  },
  "peanut butter": {
    id: 174266,
    foodName: "Peanut Butter (Smooth / Natural)",
    dataType: "Foundation",
    source: "USDA FoodData Central #174266",
    isVerified: true,
    per100g: {
      calories: 588,
      protein: 25.1,
      carbs: 20.0,
      fat: 50.4,
      fiber: 6.0,
      sugar: 9.2,
      saturatedFat: 10.3,
      cholesterol: 0,
      sodium: 17,
      potassium: 649,
      calcium: 43,
      iron: 1.9,
      vitaminC: 0,
      vitaminD: 0,
    },
    healthBenefits: [
      "High mono- and polyunsaturated fatty acids supporting cardiovascular lipid profiles.",
      "Rich in magnesium and vitamin E antioxidants.",
    ],
  },
};

/**
 * Parses USDA FoodData Central raw JSON into standardized NormalizedNutrients
 */
function extractUSDANutrients(foodNutrients: any[]): NormalizedNutrients {
  const result: NormalizedNutrients = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: null,
    saturatedFat: null,
    cholesterol: null,
    sodium: null,
    potassium: null,
    calcium: null,
    iron: null,
    vitaminC: null,
    vitaminD: null,
  };

  if (!Array.isArray(foodNutrients)) return result;

  for (const n of foodNutrients) {
    const id = n.nutrientId || n.nutrientNumber || n.nutrient?.id;
    const name = (n.nutrientName || n.nutrient?.name || "").toLowerCase();
    const value = n.value ?? n.amount ?? 0;

    // Energy / Calories (Nutrient ID 1008 or 208)
    if (id === 1008 || id === 208 || name.includes("energy")) {
      if (n.unitName?.toLowerCase() === "kj") {
        result.calories = Math.round(value / 4.184);
      } else {
        result.calories = Math.round(value);
      }
    }
    // Protein (ID 1003)
    else if (id === 1003 || name.includes("protein")) {
      result.protein = parseFloat(value.toFixed(1));
    }
    // Total Carbs (ID 1005)
    else if (id === 1005 || name.includes("carbohydrate")) {
      result.carbs = parseFloat(value.toFixed(1));
    }
    // Total Fat (ID 1004)
    else if (id === 1004 || name === "total lipid (fat)") {
      result.fat = parseFloat(value.toFixed(1));
    }
    // Fiber (ID 1079)
    else if (id === 1079 || name.includes("fiber")) {
      result.fiber = parseFloat(value.toFixed(1));
    }
    // Sugars (ID 2000 or 1063)
    else if (id === 2000 || id === 1063 || name.includes("sugars, total")) {
      result.sugar = parseFloat(value.toFixed(1));
    }
    // Saturated Fat (ID 1258)
    else if (id === 1258 || name.includes("fatty acids, total saturated")) {
      result.saturatedFat = parseFloat(value.toFixed(1));
    }
    // Cholesterol (ID 1253)
    else if (id === 1253 || name.includes("cholesterol")) {
      result.cholesterol = Math.round(value);
    }
    // Sodium (ID 1093)
    else if (id === 1093 || name.includes("sodium")) {
      result.sodium = Math.round(value);
    }
    // Potassium (ID 1092)
    else if (id === 1092 || name.includes("potassium")) {
      result.potassium = Math.round(value);
    }
    // Calcium (ID 1087)
    else if (id === 1087 || name.includes("calcium")) {
      result.calcium = Math.round(value);
    }
    // Iron (ID 1089)
    else if (id === 1089 || name.includes("iron")) {
      result.iron = parseFloat(value.toFixed(1));
    }
    // Vitamin C (ID 1162)
    else if (id === 1162 || name.includes("vitamin c")) {
      result.vitaminC = parseFloat(value.toFixed(1));
    }
    // Vitamin D (ID 1114)
    else if (id === 1114 || name.includes("vitamin d")) {
      result.vitaminD = parseFloat(value.toFixed(1));
    }
  }

  return result;
}

/**
 * Fetch nutrition data from USDA FoodData Central with caching and offline fallback
 */
export async function queryUSDADatabase(query: string): Promise<CanonicalNutritionRecord | null> {
  const normalizedKey = query.toLowerCase().trim();

  // 1. Check in-memory cache first
  const cached = NUTRITION_CACHE.get(normalizedKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.record;
  }

  // 2. Check offline foundation snapshot
  for (const [key, record] of Object.entries(USDA_OFFLINE_FOUNDATION)) {
    if (normalizedKey === key || normalizedKey.includes(key) || key.includes(normalizedKey)) {
      NUTRITION_CACHE.set(normalizedKey, { record, timestamp: Date.now() });
      return record;
    }
  }

  // 3. Query live USDA FoodData Central API
  const apiKey = process.env.USDA_FDC_API_KEY || "DEMO_KEY";
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(
    query
  )}&pageSize=5&dataType=Foundation,SR%20Legacy,Survey%20(FNDDS)`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "EraFit-AI-Nutrition-Voice-Agent" },
      signal: AbortSignal.timeout(4500),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.foods && data.foods.length > 0) {
        const topMatch = data.foods[0];
        const per100g = extractUSDANutrients(topMatch.foodNutrients);

        const record: CanonicalNutritionRecord = {
          id: topMatch.fdcId,
          foodName: topMatch.description,
          dataType: topMatch.dataType || "USDA FDC",
          source: `USDA FoodData Central #${topMatch.fdcId}`,
          isVerified: true,
          per100g,
          healthBenefits: [
            `Verified data from USDA FoodData Central (#${topMatch.fdcId}).`,
            `Standardized clinical reference for ${topMatch.description}.`,
          ],
        };

        // Cache result
        NUTRITION_CACHE.set(normalizedKey, { record, timestamp: Date.now() });
        return record;
      }
    }
  } catch (error) {
    console.warn("USDA FDC API query timeout or network error, falling back to local database:", error);
  }

  return null;
}
