// Unit conversion & deterministic serving size math engine

export interface ParsedFoodQuery {
  rawQuery: string;
  foodName: string;
  quantity: number;
  unit: string;
  estimatedGrams: number;
  multiplierPer100g: number;
  standardServingDescription: string;
}

// Common item weights in grams for single-item or natural portion parsing (multi-language keys)
const STANDARD_ITEM_WEIGHTS: Record<string, number> = {
  egg: 50,
  eggs: 50,
  "boiled egg": 50,
  "boiled eggs": 50,
  "egg white": 33,
  "egg yolk": 17,
  // Tamil items
  முட்டை: 50,
  முட்டைகள்: 50,
  இட்லி: 50,
  தோசை: 80,
  வடை: 45,
  சப்பாத்தி: 40,
  ரோட்டி: 40,
  வாழைப்பழம்: 118,
  ஆப்பிள்: 182,
  அப்பம்: 60,
  புட்டு: 100,

  // Hindi items
  अंडा: 50,
  अंडे: 50,
  इडली: 50,
  डोसा: 80,
  रोटी: 40,
  चपाती: 40,
  पराठा: 80,
  केला: 118,
  सेब: 182,
  पुट्टू: 100,
  अप्पम: 60,

  // Malayalam items
  മുട്ട: 50,
  മുട്ടകൾ: 50,
  ഇഡ്ഡലി: 50,
  ദോശ: 80,
  വട: 45,
  അപ്പം: 60,
  പുട്ട്: 100,
  ചപ്പാത്തി: 40,
  പഴം: 118,

  // General English
  apple: 182,
  banana: 118,
  orange: 131,
  idli: 50,
  idlis: 50,
  dosa: 80,
  dosas: 80,
  vada: 45,
  roti: 40,
  rotis: 40,
  chapati: 40,
  chapatis: 40,
  paratha: 80,
  parathas: 80,
  poori: 35,
  appam: 60,
  appams: 60,
  puttu: 100,
  bread: 30,
  "slice of bread": 30,
  "bread slice": 30,
  slice: 30,
  slices: 30,
  avocado: 150,
  lemon: 58,
  potato: 150,
  onion: 110,
  tomato: 120,
  cookie: 25,
  samosa: 75,
  gulabjamun: 50,
  laddu: 45,
};

// Unit to grams conversions (multi-language)
const UNIT_TO_GRAMS: Record<string, number> = {
  g: 1,
  gram: 1,
  grams: 1,
  gm: 1,
  gms: 1,
  kg: 1000,
  kilogram: 1000,
  kilograms: 1000,
  oz: 28.35,
  ounce: 28.35,
  ounces: 28.35,
  lb: 453.59,
  pound: 453.59,
  pounds: 453.59,

  // Cups
  cup: 150,
  cups: 150,
  கப்: 150,
  कप: 150,
  കപ്പ്: 150,

  // Bowls / Katori
  bowl: 150,
  bowls: 150,
  katori: 150,
  कटोरी: 150,
  கிண்ணம்: 150,
  കിണ്ണം: 150,
  പാത്രം: 150,

  // Plates
  plate: 300,
  plates: 300,
  प्लेट: 300,
  பிளேட்: 300,
  പ്ലേറ്റ്: 300,

  // Spoons / Tbsp
  tbsp: 15,
  tablespoon: 15,
  tablespoons: 15,
  tsp: 5,
  teaspoon: 5,
  teaspoons: 5,
  चम्मच: 15,
  ஸ்பூன்: 15,
  സ്പൂൺ: 15,

  // Volume
  ml: 1,
  liter: 1000,
  litre: 1000,
  liters: 1000,
  litres: 1000,
  glass: 250,
  glasses: 250,
  டம்ளர்: 250,
  ग्लास: 250,
  ഗ്ലാസ്: 250,

  scoop: 30,
  scoops: 30,
  piece: 100,
  pieces: 100,
  serving: 150,
  servings: 150,
};

// Multi-language number words
const NUMBER_WORDS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  half: 0.5,
  quarter: 0.25,
  // Tamil numbers
  ஒன்று: 1,
  இரண்டு: 2,
  மூன்று: 3,
  நான்கு: 4,
  ஐந்து: 5,
  அரை: 0.5,
  // Hindi numbers
  एक: 1,
  दो: 2,
  तीन: 3,
  चार: 4,
  पांच: 5,
  आधा: 0.5,
  // Malayalam numbers
  ഒന്ന്: 1,
  രണ്ട്: 2,
  മൂന്ന്: 3,
  നാല്: 4,
  അഞ്ച്: 5,
  പകുതി: 0.5,
};

/**
 * Parses user input to extract quantity, unit, and food name
 */
export function parseFoodQuery(query: string): ParsedFoodQuery {
  const trimmed = query.trim().toLowerCase();
  
  let quantity = 1;
  let unit = "piece";
  let foodName = trimmed;
  let estimatedGrams = 100;

  // 1. Check if query starts with numeric fractions like "1/2 cup"
  const fractionMatch = trimmed.match(/^(\d+)\/(\d+)\s*(.*)$/);
  if (fractionMatch) {
    quantity = parseInt(fractionMatch[1], 10) / parseInt(fractionMatch[2], 10);
    foodName = fractionMatch[3];
  } else {
    // 2. Match standard "2.5 cups rice", "200g chicken", "2 eggs", "1 कटोरी दाल"
    const standardMatch = trimmed.match(/^([\d.]+)\s*([^\s]*)\s*(.*)$/);
    if (standardMatch) {
      const numVal = parseFloat(standardMatch[1]);
      if (!isNaN(numVal) && numVal > 0) {
        quantity = numVal;
        const potentialUnit = standardMatch[2].toLowerCase();
        const remaining = standardMatch[3].trim();

        if (potentialUnit && UNIT_TO_GRAMS[potentialUnit]) {
          unit = potentialUnit;
          foodName = remaining || potentialUnit;
        } else if (potentialUnit && !remaining) {
          foodName = potentialUnit;
          unit = "piece";
        } else if (potentialUnit) {
          foodName = `${potentialUnit} ${remaining}`.trim();
          unit = "piece";
        } else {
          foodName = remaining || trimmed;
          unit = "piece";
        }
      }
    } else {
      // 3. Check for word numbers like "two eggs", "இரண்டு முட்டை", "दो अंडे"
      const words = trimmed.split(/\s+/);
      const firstWord = words[0];
      if (NUMBER_WORDS[firstWord] !== undefined) {
        quantity = NUMBER_WORDS[firstWord];
        const remainingWords = words.slice(1).join(" ");
        const secondWord = words[1];
        if (secondWord && UNIT_TO_GRAMS[secondWord]) {
          unit = secondWord;
          foodName = words.slice(2).join(" ");
        } else {
          foodName = remainingWords;
          unit = "piece";
        }
      }
    }
  }

  // Clean food name
  foodName = foodName
    .replace(/^(of|cups? of|bowls? of|plates? of|grams? of|glasses? of)\s+/i, "")
    .replace(/^(boiled|raw|cooked|fresh|large|medium|small|standard|steamed|grilled|fried)\s+/i, "")
    .replace(/[?,.!\n\r]+/g, "")
    .trim();

  if (!foodName) {
    foodName = trimmed;
  }

  // Check base item weight in grams
  const cleanItemKey = foodName.toLowerCase().replace(/s$/, "");
  const baseItemWeight =
    STANDARD_ITEM_WEIGHTS[foodName] ||
    STANDARD_ITEM_WEIGHTS[cleanItemKey];

  if (UNIT_TO_GRAMS[unit] && unit !== "piece" && unit !== "serving") {
    estimatedGrams = Math.round(quantity * UNIT_TO_GRAMS[unit]);
  } else if (baseItemWeight) {
    estimatedGrams = Math.round(quantity * baseItemWeight);
    unit = quantity === 1 ? "item" : "items";
  } else {
    estimatedGrams = Math.round(quantity * 100);
  }

  const multiplierPer100g = estimatedGrams / 100;
  const standardServingDescription = `${quantity} ${unit} (~${estimatedGrams}g)`;

  return {
    rawQuery: query,
    foodName,
    quantity,
    unit,
    estimatedGrams,
    multiplierPer100g,
    standardServingDescription,
  };
}

/**
 * Accurately scale standard nutrient values by portion multiplier
 */
export function scaleNutrients(
  basePer100g: Record<string, number | null | undefined>,
  multiplierPer100g: number
): Record<string, number | null> {
  const result: Record<string, number | null> = {};

  for (const [key, val] of Object.entries(basePer100g)) {
    if (val === null || val === undefined || isNaN(val)) {
      result[key] = null;
    } else if (key === "calories" || key === "energyKcal") {
      result[key] = Math.round(val * multiplierPer100g);
    } else if (key === "sodium" || key === "potassium" || key === "calcium" || key === "cholesterol") {
      result[key] = Math.round(val * multiplierPer100g);
    } else {
      result[key] = parseFloat((val * multiplierPer100g).toFixed(1));
    }
  }

  return result;
}
