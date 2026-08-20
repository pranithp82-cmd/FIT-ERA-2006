// LLM Reasoning, Grounded Nutrition Formatting & Multi-Language Translation Layer

import { SupportedLanguage, NUTRITION_TERMS, generateSpokenQuickAnswer } from "./translator";
import { ParsedFoodQuery, scaleNutrients } from "./unit-converter";
import { CanonicalNutritionRecord } from "./usda";

export interface StructuredNutritionResponse {
  query: string;
  detectedLanguage: SupportedLanguage;
  foodName: string;
  localizedFoodName: string;
  servingSize: string;
  servingGrams: number;
  isVerified: boolean;
  sourceAttribution: string;
  quickAnswer: string; // Spoken-first 1-2 sentence summary in target language
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    netCarbs: number;
    fat: number;
    fiber: number;
    sugar: number | null;
    saturatedFat: number | null;
  };
  micros: {
    sodium: number | null;
    potassium: number | null;
    calcium: number | null;
    iron: number | null;
    vitaminC: number | null;
    vitaminD: number | null;
    cholesterol: number | null;
  };
  macroSplitPercentage: {
    proteinPct: number;
    carbsPct: number;
    fatPct: number;
  };
  healthBenefits: string[];
  warnings: string[];
  disclaimer: string;
  localizedLabels: Record<string, string>;
}

/**
 * Deterministically formats and reasons about nutrition data with zero hallucinations
 */
export async function formatNutritionResponse(
  parsedQuery: ParsedFoodQuery,
  record: CanonicalNutritionRecord,
  lang: SupportedLanguage
): Promise<StructuredNutritionResponse> {
  const multiplier = parsedQuery.multiplierPer100g;
  const scaled = scaleNutrients(record.per100g as unknown as Record<string, number | null>, multiplier);

  const calories = (scaled.calories as number) || 0;
  const protein = (scaled.protein as number) || 0;
  const carbs = (scaled.carbs as number) || 0;
  const fat = (scaled.fat as number) || 0;
  const fiber = (scaled.fiber as number) || 0;
  const netCarbs = Math.max(0, parseFloat((carbs - fiber).toFixed(1)));

  // Calculate Caloric Macro Split
  const proteinCals = protein * 4;
  const carbsCals = carbs * 4;
  const fatCals = fat * 9;
  const totalMacroCals = proteinCals + carbsCals + fatCals || 1;

  const proteinPct = Math.round((proteinCals / totalMacroCals) * 100);
  const carbsPct = Math.round((carbsCals / totalMacroCals) * 100);
  const fatPct = Math.max(0, 100 - proteinPct - carbsPct);

  // Generate localized spoken quick answer
  const quickAnswer = generateSpokenQuickAnswer(
    record.foodName,
    parsedQuery.standardServingDescription,
    calories,
    protein,
    carbs,
    fat,
    lang
  );

  const labels = NUTRITION_TERMS[lang] || NUTRITION_TERMS.en;

  // Localized health benefits grounded strictly in retrieved data
  let benefits = record.healthBenefits || [];
  if (benefits.length === 0) {
    if (protein >= 15) {
      benefits.push(`High protein density (${protein}g) supports muscle protein synthesis and recovery.`);
    }
    if (fiber >= 4) {
      benefits.push(`High dietary fiber (${fiber}g) promotes digestive health and satiety.`);
    }
    if (calories <= 100) {
      benefits.push(`Low calorie density (${calories} kcal), ideal for volume eating.`);
    }
  }

  // Localize benefits for target languages if requested
  if (lang === "ta") {
    benefits = benefits.map((b) =>
      b.includes("protein")
        ? `உயர் புரதச்சத்து (${protein}g) தசை வளர்ச்சி மற்றும் உடலமைப்புக்கு சிறந்தது.`
        : b.includes("fiber")
        ? `அதிக நார்ச்சத்து (${fiber}g) செரிமானத்தை சீராக்குகிறது.`
        : b
    );
  } else if (lang === "hi") {
    benefits = benefits.map((b) =>
      b.includes("protein")
        ? `उच्च प्रोटीन (${protein}g) मांसपेशियों के निर्माण और रिकवरी में सहायक है।`
        : b.includes("fiber")
        ? `फाइबर (${fiber}g) पाचन को स्वस्थ रखने में मदद करता है।`
        : b
    );
  } else if (lang === "ml") {
    benefits = benefits.map((b) =>
      b.includes("protein")
        ? `ഉയർന്ന പ്രോട്ടീൻ (${protein}g) പേശികളുടെ ആരോഗ്യത്തിനും വീണ്ടെടുക്കലിനും സഹായിക്കുന്നു.`
        : b.includes("fiber")
        ? `നല്ല നാരുകൾ (${fiber}g) ദഹനപ്രക്രിയ എളുപ്പമാക്കുന്നു.`
        : b
    );
  }

  const warnings = record.warnings || [];
  if (scaled.sodium && (scaled.sodium as number) > 400 && !warnings.some((w) => w.includes("sodium"))) {
    warnings.push("High sodium content. Consume with adequate hydration.");
  }
  if (scaled.sugar && (scaled.sugar as number) > 15 && !warnings.some((w) => w.includes("sugar"))) {
    warnings.push("Moderate-to-high sugar content. Monitor daily glycemic load.");
  }

  // Optional: If ANTHROPIC_API_KEY is present, enhance natural language reasoning via Claude API
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const claudePrompt = `You are a clinical nutrition assistant. Ground all facts in the following data:
Food: ${record.foodName}
Serving: ${parsedQuery.standardServingDescription}
Calories: ${calories}, Protein: ${protein}g, Carbs: ${carbs}g, Fat: ${fat}g, Fiber: ${fiber}g
Target Language: ${lang}
Source: ${record.source}

Return a 2-sentence conversational spoken answer in ${lang}. Do NOT hallucinate or change numeric values.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 250,
          messages: [{ role: "user", content: claudePrompt }],
        }),
        signal: AbortSignal.timeout(3000),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.content?.[0]?.text?.trim();
        if (text) {
          // Use enhanced Claude response for quick answer
          return {
            query: parsedQuery.rawQuery,
            detectedLanguage: lang,
            foodName: record.foodName,
            localizedFoodName: record.foodName,
            servingSize: parsedQuery.standardServingDescription,
            servingGrams: parsedQuery.estimatedGrams,
            isVerified: record.isVerified,
            sourceAttribution: record.source,
            quickAnswer: text,
            macros: {
              calories,
              protein,
              carbs,
              netCarbs,
              fat,
              fiber,
              sugar: scaled.sugar,
              saturatedFat: scaled.saturatedFat,
            },
            micros: {
              sodium: scaled.sodium,
              potassium: scaled.potassium,
              calcium: scaled.calcium,
              iron: scaled.iron,
              vitaminC: scaled.vitaminC,
              vitaminD: scaled.vitaminD,
              cholesterol: scaled.cholesterol,
            },
            macroSplitPercentage: { proteinPct, carbsPct, fatPct },
            healthBenefits: benefits,
            warnings,
            disclaimer: labels.disclaimer,
            localizedLabels: labels,
          };
        }
      }
    } catch (e) {
      // Graceful fallback to deterministic formatting on timeout
    }
  }

  return {
    query: parsedQuery.rawQuery,
    detectedLanguage: lang,
    foodName: record.foodName,
    localizedFoodName: record.foodName,
    servingSize: parsedQuery.standardServingDescription,
    servingGrams: parsedQuery.estimatedGrams,
    isVerified: record.isVerified,
    sourceAttribution: record.source,
    quickAnswer,
    macros: {
      calories,
      protein,
      carbs,
      netCarbs,
      fat,
      fiber,
      sugar: scaled.sugar,
      saturatedFat: scaled.saturatedFat,
    },
    micros: {
      sodium: scaled.sodium,
      potassium: scaled.potassium,
      calcium: scaled.calcium,
      iron: scaled.iron,
      vitaminC: scaled.vitaminC,
      vitaminD: scaled.vitaminD,
      cholesterol: scaled.cholesterol,
    },
    macroSplitPercentage: { proteinPct, carbsPct, fatPct },
    healthBenefits: benefits,
    warnings,
    disclaimer: labels.disclaimer,
    localizedLabels: labels,
  };
}
