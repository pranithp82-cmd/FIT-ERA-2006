import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  detectLanguage,
  translateToEnglishSearchTerm,
  extractCoreFoodName,
  SupportedLanguage,
} from "@/lib/nutrition/translator";
import { parseFoodQuery } from "@/lib/nutrition/unit-converter";
import { searchIFCTDatabase } from "@/lib/nutrition/ifct";
import {
  queryUSDADatabase,
  USDA_OFFLINE_FOUNDATION,
  CanonicalNutritionRecord,
} from "@/lib/nutrition/usda";
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

    // 3. Extract core food name and translate native script terms to English search token
    let coreFoodName = extractCoreFoodName(parsed.foodName) || parsed.foodName;
    if (!coreFoodName || coreFoodName.trim().length === 0) {
      coreFoodName = "boiled egg";
    }

    const englishSearchTerm = translateToEnglishSearchTerm(coreFoodName);

    let canonicalRecord: CanonicalNutritionRecord | null = null;

    // 4. Check USDA Offline Foundation (instant zero-latency & high accuracy)
    canonicalRecord =
      USDA_OFFLINE_FOUNDATION[englishSearchTerm.toLowerCase()] ||
      USDA_OFFLINE_FOUNDATION[coreFoodName.toLowerCase()] ||
      null;

    // 5. Check IFCT Regional Database for Indian / ethnic foods
    if (!canonicalRecord) {
      const ifctMatch = searchIFCTDatabase(coreFoodName) || searchIFCTDatabase(englishSearchTerm);
      if (ifctMatch) {
        canonicalRecord = {
          id: ifctMatch.id,
          foodName: ifctMatch.name,
          dataType: "IFCT / ICMR-NIN",
          source: ifctMatch.source,
          isVerified: true,
          per100g: ifctMatch.per100g as any,
          healthBenefits: ifctMatch.healthBenefits,
          warnings: ifctMatch.warnings,
        };
      }
    }

    // 6. Check Prisma FIT ERA 5,000 Food Database
    if (!canonicalRecord) {
      try {
        const dbFood = await prisma.food.findFirst({
          where: {
            OR: [
              { name: { contains: coreFoodName } },
              { name: { contains: englishSearchTerm } },
              { name: { contains: parsed.foodName } },
            ],
          },
        });

        if (dbFood) {
          canonicalRecord = {
            id: dbFood.foodId || dbFood.id,
            foodName: dbFood.name,
            dataType: dbFood.dataType || "FIT ERA 5,000 Database",
            source: `FIT ERA Database (${dbFood.category})`,
            isVerified: true,
            per100g: {
              calories: dbFood.calories,
              protein: dbFood.protein,
              carbs: dbFood.carbs,
              fat: dbFood.fat,
              fiber: dbFood.fiber,
              sugar: dbFood.sugar,
              saturatedFat: null,
              cholesterol: null,
              sodium: dbFood.sodium,
              potassium: null,
              calcium: dbFood.calcium,
              iron: dbFood.iron,
              vitaminC: dbFood.vitaminC,
              vitaminD: null,
            },
            healthBenefits: [
              `${dbFood.name} provides ${dbFood.protein}g protein and ${dbFood.fiber}g fiber per ${dbFood.servingSize}.`,
            ],
            warnings: dbFood.sourceNote ? [dbFood.sourceNote] : undefined,
          };
        }
      } catch (dbErr) {}
    }

    // 7. Query USDA FoodData Central Database
    if (!canonicalRecord) {
      const usdaMatch = await queryUSDADatabase(englishSearchTerm);
      if (usdaMatch) {
        canonicalRecord = usdaMatch;
      } else {
        // 8. Secondary Fallback: Estimated Composite (Marked explicitly as unverified)
        canonicalRecord = {
          id: `EST_${Date.now()}`,
          foodName: coreFoodName.charAt(0).toUpperCase() + coreFoodName.slice(1),
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

    // 9. Format structured output with multi-language translation and serving math
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
