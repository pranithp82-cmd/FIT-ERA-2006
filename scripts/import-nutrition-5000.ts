import fs from "fs";
import path from "path";
import XLSX from "xlsx";
import prisma from "../src/lib/prisma";

async function main() {
  console.log("=== FIT ERA 5,000 Food Nutrition Database Importer ===");
  const startTime = Date.now();

  const csvPath = path.resolve(process.cwd(), "FIT_ERA_5000_Nutrition_Dataset.csv");
  const xlsxPath = path.resolve(process.cwd(), "FIT_ERA_5000_Nutrition_Dataset.xlsx");

  let records: any[] = [];

  if (fs.existsSync(csvPath)) {
    console.log(`Reading dataset from CSV: ${csvPath}`);
    const fileContent = fs.readFileSync(csvPath, "utf-8");
    const workbook = XLSX.read(fileContent, { type: "string" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    records = XLSX.utils.sheet_to_json(sheet);
  } else if (fs.existsSync(xlsxPath)) {
    console.log(`Reading dataset from XLSX: ${xlsxPath}`);
    const workbook = XLSX.readFile(xlsxPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    records = XLSX.utils.sheet_to_json(sheet);
  } else {
    throw new Error("Neither FIT_ERA_5000_Nutrition_Dataset.csv nor .xlsx found in workspace root!");
  }

  console.log(`Loaded ${records.length} raw rows from dataset.`);

  const validFoods: any[] = [];
  const duplicateIds = new Set<string>();
  const seenIds = new Set<string>();
  let invalidRowCount = 0;

  for (let i = 0; i < records.length; i++) {
    const r = records[i];
    const foodId = (r.food_id || r.foodId || `FERA${String(i + 1).padStart(5, "0")}`).trim();
    const foodName = (r.food_name || r.name || r.FoodName || "").trim();

    if (!foodName) {
      console.warn(`Row ${i + 1}: Missing food_name, skipping.`);
      invalidRowCount++;
      continue;
    }

    if (seenIds.has(foodId)) {
      duplicateIds.add(foodId);
    } else {
      seenIds.add(foodId);
    }

    const parseNum = (val: any, fallback = 0): number => {
      if (val === undefined || val === null || val === "") return fallback;
      const num = typeof val === "number" ? val : parseFloat(String(val).replace(/[^0-9.-]+/g, ""));
      return isNaN(num) ? fallback : Math.round(num * 100) / 100;
    };

    const isYes = (val: any): boolean => {
      if (val === true || val === 1) return true;
      if (typeof val === "string") {
        const s = val.trim().toLowerCase();
        return s === "yes" || s === "true" || s === "1" || s === "y";
      }
      return false;
    };

    validFoods.push({
      foodId,
      name: foodName,
      category: (r.category || r.Category || "General").trim(),
      servingSize: (r.serving_size || r.servingSize || "100 g/ml").trim(),
      calories: parseNum(r.calories_kcal_est ?? r.calories ?? r.Calories, 0),
      protein: parseNum(r.protein_g_est ?? r.protein ?? r.Protein, 0),
      carbs: parseNum(r.carbohydrates_g_est ?? r.carbs ?? r.Carbohydrates, 0),
      fat: parseNum(r.fat_g_est ?? r.fat ?? r.Fat, 0),
      fiber: parseNum(r.fiber_g_est ?? r.fiber ?? r.Fiber, 0),
      sugar: parseNum(r.sugar_g_est ?? r.sugar ?? r.Sugar, 0),
      sodium: parseNum(r.sodium_mg_est ?? r.sodium ?? r.Sodium, 0),
      calcium: parseNum(r.calcium_mg_est ?? r.calcium ?? r.Calcium, 0),
      iron: parseNum(r.iron_mg_est ?? r.iron ?? r.Iron, 0),
      vitaminC: parseNum(r.vitamin_c_mg_est ?? r.vitaminC ?? r.VitaminC, 0),
      vitaminA: parseNum(r.vitamin_a_ug_est ?? r.vitaminA ?? r.VitaminA, 0),
      vegetarian: isYes(r.vegetarian),
      vegan: isYes(r.vegan),
      dataType: (r.data_type || r.dataType || "PROTOTYPE_ESTIMATE").trim(),
      sourceNote: (r.source_note || r.sourceNote || "Generated estimate for FIT ERA development").trim(),
    });
  }

  console.log(`Validated ${validFoods.length} valid food objects (${invalidRowCount} invalid rows, ${duplicateIds.size} duplicate IDs).`);

  // Clear existing food dataset safely or upsert in batches
  console.log("Upserting / inserting 5,000 food records into SQLite database...");

  const BATCH_SIZE = 250;
  let insertedCount = 0;

  for (let i = 0; i < validFoods.length; i += BATCH_SIZE) {
    const batch = validFoods.slice(i, i + BATCH_SIZE);

    // Using transaction or createMany
    await prisma.$transaction(
      batch.map((f) =>
        prisma.food.upsert({
          where: { foodId: f.foodId },
          update: {
            name: f.name,
            category: f.category,
            servingSize: f.servingSize,
            calories: f.calories,
            protein: f.protein,
            carbs: f.carbs,
            fat: f.fat,
            fiber: f.fiber,
            sugar: f.sugar,
            sodium: f.sodium,
            calcium: f.calcium,
            iron: f.iron,
            vitaminC: f.vitaminC,
            vitaminA: f.vitaminA,
            vegetarian: f.vegetarian,
            vegan: f.vegan,
            dataType: f.dataType,
            sourceNote: f.sourceNote,
          },
          create: f,
        })
      )
    );

    insertedCount += batch.length;
    process.stdout.write(`\rProgress: ${insertedCount}/${validFoods.length} foods processed (${Math.round((insertedCount / validFoods.length) * 100)}%)...`);
  }

  console.log(`\n\n🎉 Import Complete! Total Foods in Database: ${await prisma.food.count()}`);
  console.log(`Execution time: ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
}

main()
  .catch((e) => {
    console.error("Import failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
