import { NextResponse } from "next/server";
import { parseFoodQuery } from "@/lib/nutrition/unit-converter";
import { detectLanguage, translateToEnglishSearchTerm, SupportedLanguage } from "@/lib/nutrition/translator";
import { searchIFCTDatabase } from "@/lib/nutrition/ifct";
import { queryUSDADatabase, CanonicalNutritionRecord } from "@/lib/nutrition/usda";
import { formatNutritionResponse } from "@/lib/nutrition/llm-formatter";

interface TestCase {
  id: number;
  query: string;
  expectedLanguage: SupportedLanguage;
  expectedSourceType: "USDA" | "IFCT" | "ESTIMATED";
  expectedMinCalories: number;
  expectedMaxCalories: number;
  expectedMinProtein: number;
}

const TEST_CASES: TestCase[] = [
  // 1-6: English Queries with Portion Math
  {
    id: 1,
    query: "2 boiled eggs",
    expectedLanguage: "en",
    expectedSourceType: "USDA",
    expectedMinCalories: 130,
    expectedMaxCalories: 160,
    expectedMinProtein: 11,
  },
  {
    id: 2,
    query: "200g chicken breast",
    expectedLanguage: "en",
    expectedSourceType: "USDA",
    expectedMinCalories: 300,
    expectedMaxCalories: 350,
    expectedMinProtein: 58,
  },
  {
    id: 3,
    query: "1 medium apple",
    expectedLanguage: "en",
    expectedSourceType: "USDA",
    expectedMinCalories: 80,
    expectedMaxCalories: 110,
    expectedMinProtein: 0.2,
  },
  {
    id: 4,
    query: "1 cup oats",
    expectedLanguage: "en",
    expectedSourceType: "USDA",
    expectedMinCalories: 500,
    expectedMaxCalories: 620,
    expectedMinProtein: 20,
  },
  {
    id: 5,
    query: "150g salmon",
    expectedLanguage: "en",
    expectedSourceType: "USDA",
    expectedMinCalories: 280,
    expectedMaxCalories: 340,
    expectedMinProtein: 28,
  },
  {
    id: 6,
    query: "2 tbsp peanut butter",
    expectedLanguage: "en",
    expectedSourceType: "USDA",
    expectedMinCalories: 160,
    expectedMaxCalories: 200,
    expectedMinProtein: 6,
  },

  // 7-11: Tamil Regional Queries
  {
    id: 7,
    query: "2 முட்டை", // 2 eggs
    expectedLanguage: "ta",
    expectedSourceType: "USDA",
    expectedMinCalories: 130,
    expectedMaxCalories: 160,
    expectedMinProtein: 11,
  },
  {
    id: 8,
    query: "3 இட்லி", // 3 idlis (~150g)
    expectedLanguage: "ta",
    expectedSourceType: "IFCT",
    expectedMinCalories: 180,
    expectedMaxCalories: 220,
    expectedMinProtein: 6.5,
  },
  {
    id: 9,
    query: "1 தோசை", // 1 dosa (~80g)
    expectedLanguage: "ta",
    expectedSourceType: "IFCT",
    expectedMinCalories: 120,
    expectedMaxCalories: 150,
    expectedMinProtein: 3,
  },
  {
    id: 10,
    query: "1 கப் சாம்பார்", // 1 cup sambar (~150g)
    expectedLanguage: "ta",
    expectedSourceType: "IFCT",
    expectedMinCalories: 90,
    expectedMaxCalories: 120,
    expectedMinProtein: 4.5,
  },
  {
    id: 11,
    query: "100g பீன்ஸ் பொரியல்", // 100g beans poriyal
    expectedLanguage: "ta",
    expectedSourceType: "IFCT",
    expectedMinCalories: 65,
    expectedMaxCalories: 90,
    expectedMinProtein: 2,
  },

  // 12-16: Hindi Regional Queries
  {
    id: 12,
    query: "2 अंडे", // 2 eggs
    expectedLanguage: "hi",
    expectedSourceType: "USDA",
    expectedMinCalories: 130,
    expectedMaxCalories: 160,
    expectedMinProtein: 11,
  },
  {
    id: 13,
    query: "3 रोटी", // 3 rotis (~120g)
    expectedLanguage: "hi",
    expectedSourceType: "IFCT",
    expectedMinCalories: 300,
    expectedMaxCalories: 340,
    expectedMinProtein: 9.5,
  },
  {
    id: 14,
    query: "1 कटोरी दाल तड़का", // 1 bowl dal (~150g)
    expectedLanguage: "hi",
    expectedSourceType: "IFCT",
    expectedMinCalories: 130,
    expectedMaxCalories: 160,
    expectedMinProtein: 7.5,
  },
  {
    id: 15,
    query: "100g पनीर", // 100g paneer
    expectedLanguage: "hi",
    expectedSourceType: "IFCT",
    expectedMinCalories: 270,
    expectedMaxCalories: 310,
    expectedMinProtein: 16,
  },
  {
    id: 16,
    query: "1 प्लेट चिकन बिरयानी", // 1 plate biryani (~300g)
    expectedLanguage: "hi",
    expectedSourceType: "IFCT",
    expectedMinCalories: 500,
    expectedMaxCalories: 600,
    expectedMinProtein: 25,
  },

  // 17-20: Malayalam Regional Queries
  {
    id: 17,
    query: "2 മുട്ട", // 2 eggs
    expectedLanguage: "ml",
    expectedSourceType: "USDA",
    expectedMinCalories: 130,
    expectedMaxCalories: 160,
    expectedMinProtein: 11,
  },
  {
    id: 18,
    query: "2 അപ്പം", // 2 appams (~120g)
    expectedLanguage: "ml",
    expectedSourceType: "IFCT",
    expectedMinCalories: 160,
    expectedMaxCalories: 190,
    expectedMinProtein: 2.5,
  },
  {
    id: 19,
    query: "1 പുട്ട്", // 1 puttu (~100g)
    expectedLanguage: "ml",
    expectedSourceType: "IFCT",
    expectedMinCalories: 180,
    expectedMaxCalories: 210,
    expectedMinProtein: 3,
  },
  {
    id: 20,
    query: "1 കപ്പ് ചോറ്", // 1 cup cooked rice (~150g)
    expectedLanguage: "ml",
    expectedSourceType: "USDA",
    expectedMinCalories: 180,
    expectedMaxCalories: 220,
    expectedMinProtein: 3.5,
  },
];

export async function GET() {
  const results = [];
  let passedCount = 0;

  for (const test of TEST_CASES) {
    const detectedLang = detectLanguage(test.query);
    const parsed = parseFoodQuery(test.query);
    const englishSearch = translateToEnglishSearchTerm(parsed.foodName);

    let record: CanonicalNutritionRecord | null = null;
    let sourceType: "USDA" | "IFCT" | "ESTIMATED" = "ESTIMATED";

    const ifctMatch = searchIFCTDatabase(parsed.foodName) || searchIFCTDatabase(englishSearch);
    if (ifctMatch) {
      sourceType = "IFCT";
      record = {
        id: ifctMatch.id,
        foodName: ifctMatch.name,
        dataType: "IFCT / ICMR-NIN",
        source: ifctMatch.source,
        isVerified: true,
        per100g: ifctMatch.per100g as any,
        healthBenefits: ifctMatch.healthBenefits,
      };
    } else {
      const usdaMatch = await queryUSDADatabase(englishSearch);
      if (usdaMatch) {
        sourceType = "USDA";
        record = usdaMatch;
      } else {
        sourceType = "ESTIMATED";
        record = {
          id: "EST_FALLBACK",
          foodName: parsed.foodName,
          dataType: "Estimated",
          source: "Estimated Fallback",
          isVerified: false,
          per100g: {
            calories: 100,
            protein: 3,
            carbs: 15,
            fat: 2,
            fiber: 1,
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
        };
      }
    }

    const formatted = await formatNutritionResponse(parsed, record, detectedLang);

    const isLangCorrect = detectedLang === test.expectedLanguage;
    const isSourceCorrect = sourceType === test.expectedSourceType;
    const isCalInRange =
      formatted.macros.calories >= test.expectedMinCalories &&
      formatted.macros.calories <= test.expectedMaxCalories;
    const isProteinInRange = formatted.macros.protein >= test.expectedMinProtein;

    const passed = isLangCorrect && isSourceCorrect && isCalInRange && isProteinInRange;
    if (passed) passedCount++;

    results.push({
      testId: test.id,
      query: test.query,
      passed,
      detectedLanguage: detectedLang,
      expectedLanguage: test.expectedLanguage,
      sourceType,
      expectedSourceType: test.expectedSourceType,
      resolvedServing: formatted.servingSize,
      calories: formatted.macros.calories,
      expectedCalRange: `${test.expectedMinCalories} - ${test.expectedMaxCalories}`,
      protein: formatted.macros.protein,
      expectedMinProtein: test.expectedMinProtein,
      quickAnswer: formatted.quickAnswer,
      sourceAttribution: formatted.sourceAttribution,
    });
  }

  return NextResponse.json({
    totalTests: TEST_CASES.length,
    passedCount,
    failedCount: TEST_CASES.length - passedCount,
    successRate: `${Math.round((passedCount / TEST_CASES.length) * 100)}%`,
    allPassed: passedCount === TEST_CASES.length,
    timestamp: new Date().toISOString(),
    results,
  });
}
