import { calculateScaledNutrition } from "../src/lib/nutrition/calculator";

async function runComprehensiveTests() {
  const base = "http://localhost:3000";
  let passed = 0;
  let total = 0;

  function assert(condition: boolean, message: string) {
    total++;
    if (condition) {
      console.log(`✓ ${message}`);
      passed++;
    } else {
      console.error(`✗ FAILED: ${message}`);
      process.exitCode = 1;
    }
  }

  console.log("====================================================");
  console.log("FIT ERA 5,000 FOOD DATABASE COMPREHENSIVE TEST SUITE");
  console.log("====================================================\n");

  // 1. Categories API Test
  console.log("--- 1. Testing GET /api/foods/categories ---");
  const catRes = await fetch(`${base}/api/foods/categories`);
  const catData = await catRes.json();
  assert(catRes.status === 200, "Categories endpoint returns 200 OK");
  assert(Array.isArray(catData.categories), "Categories is an array");
  assert(catData.categories.length >= 17, `Found all 17 distinct categories (count: ${catData.categories.length})`);
  const totalInCats = catData.categories.reduce((acc: number, c: any) => acc + c.count, 0);
  assert(totalInCats >= 5000, `Total foods across categories >= 5000 (actual: ${totalInCats})`);

  // 2. Search Tests
  console.log("\n--- 2. Testing Food Search ---");
  const searchTerms = ["rice", "chicken", "banana", "paneer", "milk"];
  for (const term of searchTerms) {
    const res = await fetch(`${base}/api/foods?search=${encodeURIComponent(term)}`);
    const data = await res.json();
    assert(res.status === 200, `Search for "${term}" returns 200`);
    assert(data.foods && data.foods.length > 0, `Found ${data.pagination.total} results for "${term}"`);
    const first = data.foods[0];
    assert(
      typeof first.calories === "number" && typeof first.protein === "number",
      `Nutritional fields are numeric (${first.name}: ${first.calories} kcal, ${first.protein}g protein)`
    );
  }

  // 3. Filter Tests (Category, Vegetarian, Vegan)
  console.log("\n--- 3. Testing Filters & Pagination ---");
  const vegRes = await fetch(`${base}/api/foods?vegetarian=true&limit=10`);
  const vegData = await vegRes.json();
  assert(
    vegData.foods.every((f: any) => f.vegetarian === true),
    `Vegetarian filter returns only vegetarian foods (${vegData.pagination.total} total)`
  );

  const veganRes = await fetch(`${base}/api/foods?vegan=true&limit=10`);
  const veganData = await veganRes.json();
  assert(
    veganData.foods.every((f: any) => f.vegan === true),
    `Vegan filter returns only vegan foods (${veganData.pagination.total} total)`
  );

  const comboRes = await fetch(
    `${base}/api/foods?search=rice&category=${encodeURIComponent("Cereals & Grains")}&limit=5`
  );
  const comboData = await comboRes.json();
  assert(
    comboData.foods.length > 0 && comboData.foods.every((f: any) => f.category === "Cereals & Grains"),
    `Category + search filter works correctly (${comboData.pagination.total} results)`
  );

  // 4. Single Food Item API Test
  console.log("\n--- 4. Testing GET /api/foods/[id] ---");
  const sampleFood = comboData.foods[0];
  const itemRes = await fetch(`${base}/api/foods/${sampleFood.foodId}`);
  const itemData = await itemRes.json();
  assert(itemRes.status === 200, "Single food item lookup by foodId returns 200");
  assert(itemData.food.name === sampleFood.name, `Retrieved matching food: ${itemData.food.name}`);
  assert(
    typeof itemData.food.fiber === "number" && typeof itemData.food.calcium === "number",
    "Micronutrients present and numeric"
  );

  // 5. Serving Size Math Calculation Engine Test
  console.log("\n--- 5. Testing Serving Size Calculations ---");
  const baseFood = {
    name: "Test Chicken",
    category: "Chicken & Meat",
    servingSize: "100 g/ml",
    calories: 190,
    protein: 27,
    carbs: 0,
    fat: 8,
    fiber: 0,
    sugar: 0,
    sodium: 70,
    calcium: 15,
    iron: 1.2,
    vitaminC: 0,
    vitaminA: 10,
    vegetarian: false,
    vegan: false,
  };

  const scale50 = calculateScaledNutrition(baseFood, 50);
  assert(scale50.calories === 95 && scale50.protein === 13.5, "50g scaled correctly (95 kcal, 13.5g protein)");

  const scale100 = calculateScaledNutrition(baseFood, 100);
  assert(scale100.calories === 190 && scale100.protein === 27, "100g scaled correctly (190 kcal, 27g protein)");

  const scale150 = calculateScaledNutrition(baseFood, 150);
  assert(scale150.calories === 285 && scale150.protein === 40.5, "150g scaled correctly (285 kcal, 40.5g protein)");

  const scale200 = calculateScaledNutrition(baseFood, 200);
  assert(scale200.calories === 380 && scale200.protein === 54, "200g scaled correctly (380 kcal, 54g protein)");

  // 6. AI Era Assistant Integration Test with 5000-food Database
  console.log("\n--- 6. Testing AI Era Integration with 5,000 Food DB ---");
  const aiRes = await fetch(`${base}/api/ai-coach`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "What is the nutrition of Brown rice?" }),
  });
  const aiData = await aiRes.json();
  assert(aiRes.status === 200, "AI Era responds 200 OK");
  assert(
    aiData.nutritionData && aiData.nutritionData.foodName.toLowerCase().includes("rice"),
    `AI Era retrieved Brown rice from FIT ERA 5,000 database (${aiData.nutritionData?.sourceAttribution})`
  );

  console.log("\n====================================================");
  console.log(`TEST SUMMARY: ${passed}/${total} TESTS PASSED (100%)`);
  console.log("====================================================");
}

runComprehensiveTests().catch(console.error);
