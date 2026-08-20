import { NextResponse } from "next/server";
import { detectLanguage, translateToEnglishSearchTerm, SupportedLanguage } from "@/lib/nutrition/translator";
import { parseFoodQuery } from "@/lib/nutrition/unit-converter";
import { searchIFCTDatabase } from "@/lib/nutrition/ifct";
import { queryUSDADatabase, CanonicalNutritionRecord } from "@/lib/nutrition/usda";
import { formatNutritionResponse } from "@/lib/nutrition/llm-formatter";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawQuery = body.query;

    if (!rawQuery || typeof rawQuery !== "string" || !rawQuery.trim()) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // 1. Language Detection / Override
    const detectedLang: SupportedLanguage = body.language || detectLanguage(rawQuery);

    // 2. Unit & Serving Size Math Parsing
    const parsed = parseFoodQuery(rawQuery);

    // 3. Translate native script terms to English search token
    const englishSearchTerm = translateToEnglishSearchTerm(parsed.foodName);

    let canonicalRecord: CanonicalNutritionRecord | null = null;

    // 4. Check IFCT Regional Database first for Indian / ethnic foods
    const ifctMatch = searchIFCTDatabase(parsed.foodName) || searchIFCTDatabase(englishSearchTerm);

    if (ifctMatch) {
      canonicalRecord = {
        id: ifctMatch.id,
        foodName: ifctMatch.name,
        dataType: "IFCT / ICMR-NIN",
        source: ifctMatch.source,
        isVerified: true,
        per100g: {
          calories: ifctMatch.per100g.calories,
          protein: ifctMatch.per100g.protein,
          carbs: ifctMatch.per100g.carbs,
          fat: ifctMatch.per100g.fat,
          fiber: ifctMatch.per100g.fiber,
          sugar: null,
          saturatedFat: ifctMatch.per100g.saturatedFat || null,
          cholesterol: ifctMatch.per100g.cholesterol || null,
          sodium: ifctMatch.per100g.sodium || null,
          potassium: ifctMatch.per100g.potassium || null,
          calcium: ifctMatch.per100g.calcium || null,
          iron: ifctMatch.per100g.iron || null,
          vitaminC: ifctMatch.per100g.vitaminC || null,
          vitaminD: null,
        },
        healthBenefits: ifctMatch.healthBenefits,
        warnings: ifctMatch.warnings,
      };
    } else {
      // 5. Query USDA FoodData Central Database
      const usdaMatch = await queryUSDADatabase(englishSearchTerm);
      if (usdaMatch) {
        canonicalRecord = usdaMatch;
      } else {
        // 6. Secondary Fallback: Estimated Composite (Marked explicitly as unverified)
        canonicalRecord = {
          id: `EST_${Date.now()}`,
          foodName: parsed.foodName.charAt(0).toUpperCase() + parsed.foodName.slice(1),
          dataType: "Composite Estimate",
          source: "Estimated Composition (Unverified Database Entry)",
          isVerified: false,
          per100g: {
            calories: 120,
            protein: 4.0,
            carbs: 18.0,
            fat: 3.5,
            fiber: 2.0,
            sugar: null,
            saturatedFat: null,
            cholesterol: null,
            sodium: null,
            potassium: null,
            calcium: null,
            iron: null,
            vitaminC: null,
            vitaminD: null,
          },
          healthBenefits: [
            "Nutritional estimation based on standard culinary macronutrient densities.",
          ],
          warnings: [
            "Exact clinical laboratory profile not found in USDA FDC / IFCT. Values are estimated.",
          ],
        };
      }
    }

    // 7. Format structured output with multi-language translation and serving math
    const result = await formatNutritionResponse(parsed, canonicalRecord, detectedLang);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in AI Nutrition Voice Agent API:", error);
    return NextResponse.json(
      { error: "Failed to process nutrition query", details: String(error) },
      { status: 500 }
    );
  }
}
