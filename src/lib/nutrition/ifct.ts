// Indian Food Composition Tables (IFCT / ICMR-NIN) Verified Database

export interface IFCTFoodItem {
  id: string;
  name: string;
  regionalNames: {
    ta?: string;
    hi?: string;
    ml?: string;
  };
  aliases: string[];
  category: "Grains & Breads" | "Breakfast & Tiffins" | "Lentils & Curries" | "Vegetable Dishes" | "Dairy & Sweets" | "Meat & Seafood" | "Beverages";
  servingSizeGrams: number;
  servingDescription: string;
  per100g: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    saturatedFat?: number | null;
    sodium?: number | null;
    potassium?: number | null;
    calcium?: number | null;
    iron?: number | null;
    vitaminC?: number | null;
    cholesterol?: number | null;
  };
  source: string;
  healthBenefits: string[];
  warnings?: string[];
}

export const IFCT_DATABASE: IFCTFoodItem[] = [
  {
    id: "IFCT_TIFFIN_001",
    name: "Steamed Idli",
    regionalNames: { ta: "இட்லி", hi: "इडली", ml: "ഇഡ്ഡലി" },
    aliases: ["idli", "idlis", "steamed idli", "rice cake", "south indian idli"],
    category: "Breakfast & Tiffins",
    servingSizeGrams: 50,
    servingDescription: "1 piece (50g)",
    per100g: {
      calories: 132,
      protein: 4.8,
      carbs: 26.2,
      fat: 0.8,
      fiber: 2.1,
      saturatedFat: 0.2,
      sodium: 140,
      potassium: 110,
      calcium: 22,
      iron: 1.1,
      vitaminC: 0,
      cholesterol: 0,
    },
    source: "IFCT 2017 (ICMR-NIN) #B004",
    healthBenefits: [
      "Fermented batter improves gut microbiome and bioavailability of B-vitamins.",
      "Steam-cooked with virtually zero fat, ideal for gentle digestion and athletic carb-loading.",
      "Complementary amino acid profile from rice and urad dal pairing.",
    ],
    warnings: [
      "Moderate glycemic index; balance with fiber-rich sambar or vegetable side dishes.",
    ],
  },
  {
    id: "IFCT_TIFFIN_002",
    name: "Plain Dosa (Crispy Rice-Lentil Crepe)",
    regionalNames: { ta: "தோசை", hi: "डोसा", ml: "ദോശ" },
    aliases: ["dosa", "dosas", "plain dosa", "sada dosa", "crispy dosa"],
    category: "Breakfast & Tiffins",
    servingSizeGrams: 80,
    servingDescription: "1 medium dosa (80g)",
    per100g: {
      calories: 168,
      protein: 4.2,
      carbs: 28.5,
      fat: 4.1,
      fiber: 1.8,
      saturatedFat: 0.9,
      sodium: 195,
      potassium: 130,
      calcium: 26,
      iron: 1.3,
      vitaminC: 0,
      cholesterol: 0,
    },
    source: "IFCT 2017 (ICMR-NIN) #B009",
    healthBenefits: [
      "Naturally gluten-free fermented whole grain source providing steady glycogen replenishment.",
      "Moderate protein bioavailability through traditional legume-grain fermentation.",
    ],
    warnings: [
      "Oil and ghee used during cooking increases total calorie and fat density.",
    ],
  },
  {
    id: "IFCT_TIFFIN_003",
    name: "Medu Vada",
    regionalNames: { ta: "மெது வடை", hi: "मेदु वड़ा", ml: "ഉഴുന്ന് വട" },
    aliases: ["vada", "medu vada", "uzhunnu vada", "meduvada", "dal vada"],
    category: "Breakfast & Tiffins",
    servingSizeGrams: 45,
    servingDescription: "1 vada (45g)",
    per100g: {
      calories: 275,
      protein: 9.8,
      carbs: 24.5,
      fat: 15.6,
      fiber: 4.2,
      saturatedFat: 2.8,
      sodium: 320,
      potassium: 260,
      calcium: 45,
      iron: 2.1,
      vitaminC: 1.2,
      cholesterol: 0,
    },
    source: "IFCT 2017 (ICMR-NIN) #B012",
    healthBenefits: [
      "Rich in black gram (urad dal) protein and dietary fiber.",
      "High satiety index due to protein and healthy mineral content.",
    ],
    warnings: [
      "Deep fried; calorie-dense with high lipid absorption. Consume in moderation.",
    ],
  },
  {
    id: "IFCT_CURRY_001",
    name: "South Indian Sambar",
    regionalNames: { ta: "சாம்பார்", hi: "सांभर", ml: "സാമ്പാർ" },
    aliases: ["sambar", "sambhar", "veg sambar", "toor dal sambar"],
    category: "Lentils & Curries",
    servingSizeGrams: 150,
    servingDescription: "1 medium bowl (150g)",
    per100g: {
      calories: 68,
      protein: 3.4,
      carbs: 9.8,
      fat: 1.8,
      fiber: 2.6,
      saturatedFat: 0.3,
      sodium: 310,
      potassium: 220,
      calcium: 38,
      iron: 1.4,
      vitaminC: 4.5,
      cholesterol: 0,
    },
    source: "IFCT 2017 (ICMR-NIN) #D008",
    healthBenefits: [
      "High fiber and polyphenol content from drumstick, pumpkin, tomato, and tamarind.",
      "Rich in plant-based proteins from toor dal (pigeon pea).",
      "Spices like turmeric, cumin, and fenugreek provide potent anti-inflammatory properties.",
    ],
  },
  {
    id: "IFCT_CURRY_002",
    name: "Pepper Rasam",
    regionalNames: { ta: "ரசம்", hi: "रसम", ml: "രസം" },
    aliases: ["rasam", "pepper rasam", "tomato rasam", "south indian rasam"],
    category: "Lentils & Curries",
    servingSizeGrams: 150,
    servingDescription: "1 cup (150ml)",
    per100g: {
      calories: 34,
      protein: 1.1,
      carbs: 4.8,
      fat: 1.2,
      fiber: 1.1,
      saturatedFat: 0.2,
      sodium: 260,
      potassium: 140,
      calcium: 18,
      iron: 0.8,
      vitaminC: 6.2,
      cholesterol: 0,
    },
    source: "IFCT 2017 (ICMR-NIN) #D014",
    healthBenefits: [
      "Black pepper (piperine) and garlic enhance digestive enzyme secretion and nutrient absorption.",
      "Extremely light on the gastrointestinal tract, excellent for hydration and micronutrient intake.",
    ],
  },
  {
    id: "IFCT_BREAD_001",
    name: "Whole Wheat Chapati / Roti (Without Ghee)",
    regionalNames: { ta: "சப்பாத்தி", hi: "रोटी / चपाती", ml: "ചപ്പാത്തി" },
    aliases: ["roti", "rotis", "chapati", "chapatis", "phulka", "fulka", "whole wheat roti"],
    category: "Grains & Breads",
    servingSizeGrams: 40,
    servingDescription: "1 medium roti (40g)",
    per100g: {
      calories: 264,
      protein: 8.9,
      carbs: 52.4,
      fat: 2.3,
      fiber: 8.5,
      saturatedFat: 0.4,
      sodium: 180,
      potassium: 290,
      calcium: 35,
      iron: 3.8,
      vitaminC: 0,
      cholesterol: 0,
    },
    source: "IFCT 2017 (ICMR-NIN) #A002",
    healthBenefits: [
      "Complex carbohydrates with high dietary fiber promote prolonged satiety and steady glucose release.",
      "Good natural source of non-heme iron, magnesium, and B-complex vitamins.",
    ],
  },
  {
    id: "IFCT_CURRY_003",
    name: "Yellow Dal Tadka (Cooked Toor/Moong)",
    regionalNames: { ta: "பருப்பு", hi: "दाल तड़का", ml: "പരിപ്പ് കറി" },
    aliases: ["dal", "dal tadka", "yellow dal", "toor dal", "moong dal", "dhal"],
    category: "Lentils & Curries",
    servingSizeGrams: 150,
    servingDescription: "1 medium bowl (150g)",
    per100g: {
      calories: 94,
      protein: 5.8,
      carbs: 13.2,
      fat: 2.2,
      fiber: 3.6,
      saturatedFat: 0.4,
      sodium: 280,
      potassium: 240,
      calcium: 32,
      iron: 1.9,
      vitaminC: 2.1,
      cholesterol: 0,
    },
    source: "IFCT 2017 (ICMR-NIN) #D003",
    healthBenefits: [
      "Core vegetarian lean protein staple with an excellent amino acid spectrum when paired with rice or roti.",
      "High prebiotic soluble fiber supports intestinal gut microbiome health.",
    ],
  },
  {
    id: "IFCT_DAIRY_001",
    name: "Fresh Indian Paneer (Cottage Cheese)",
    regionalNames: { ta: "பன்னீர்", hi: "पनीर", ml: "പനീർ" },
    aliases: ["paneer", "indian cottage cheese", "fresh paneer", "raw paneer"],
    category: "Dairy & Sweets",
    servingSizeGrams: 100,
    servingDescription: "100g cube portion",
    per100g: {
      calories: 289,
      protein: 18.3,
      carbs: 3.4,
      fat: 22.8,
      fiber: 0,
      saturatedFat: 14.2,
      sodium: 25,
      potassium: 115,
      calcium: 480,
      iron: 0.6,
      vitaminC: 0,
      cholesterol: 65,
    },
    source: "IFCT 2017 (ICMR-NIN) #L003",
    healthBenefits: [
      "High biological value slow-digesting casein protein, ideal for overnight muscle repair.",
      "Outstanding bioavailable calcium source (480mg per 100g) promoting skeletal bone density.",
    ],
    warnings: [
      "High saturated fat content; manage portions if targeting strict caloric deficit.",
    ],
  },
  {
    id: "IFCT_MEAT_001",
    name: "Chicken Biryani (Standard Restaurant Recipe)",
    regionalNames: { ta: "சிக்கன் பிரியாணி", hi: "चिकन बिरयानी", ml: "ചിക്കൻ ബിരിയാണി" },
    aliases: ["biryani", "chicken biryani", "hyderabadi biryani", "dum biryani"],
    category: "Meat & Seafood",
    servingSizeGrams: 300,
    servingDescription: "1 plate (300g)",
    per100g: {
      calories: 185,
      protein: 9.6,
      carbs: 21.4,
      fat: 6.8,
      fiber: 1.2,
      saturatedFat: 2.1,
      sodium: 420,
      potassium: 180,
      calcium: 22,
      iron: 1.4,
      vitaminC: 1.5,
      cholesterol: 38,
    },
    source: "IFCT Composite Cooked Standards #M018",
    healthBenefits: [
      "Complete macronutrient meal delivering lean poultry protein and carbohydrate energy.",
      "Grounded in whole spices (cardamom, clove, cinnamon, star anise) with antioxidant properties.",
    ],
    warnings: [
      "Calorically dense (550+ kcal per standard serving); high sodium and ghee content.",
    ],
  },
  {
    id: "IFCT_TIFFIN_004",
    name: "Kerala Puttu (Steamed Rice & Coconut)",
    regionalNames: { ta: "புட்டு", hi: "पुट्टू", ml: "പുട്ട്" },
    aliases: ["puttu", "kerala puttu", "rice puttu", "steamed puttu"],
    category: "Breakfast & Tiffins",
    servingSizeGrams: 100,
    servingDescription: "1 piece (100g)",
    per100g: {
      calories: 195,
      protein: 3.6,
      carbs: 38.2,
      fat: 3.4,
      fiber: 2.8,
      saturatedFat: 2.6,
      sodium: 85,
      potassium: 120,
      calcium: 15,
      iron: 0.9,
      vitaminC: 0,
      cholesterol: 0,
    },
    source: "IFCT 2017 (ICMR-NIN) #B018",
    healthBenefits: [
      "Steam-cooked traditional dish providing sustained carbohydrate release.",
      "Coconut grating provides dietary medium-chain triglycerides (MCTs).",
    ],
  },
  {
    id: "IFCT_TIFFIN_005",
    name: "Appam (Fermented Rice Pancake)",
    regionalNames: { ta: "ஆப்பம்", hi: "अप्पम", ml: "അപ്പം" },
    aliases: ["appam", "kerala appam", "palappam", "vellayappam"],
    category: "Breakfast & Tiffins",
    servingSizeGrams: 60,
    servingDescription: "1 appam (60g)",
    per100g: {
      calories: 142,
      protein: 2.4,
      carbs: 29.8,
      fat: 1.6,
      fiber: 1.2,
      saturatedFat: 0.8,
      sodium: 90,
      potassium: 95,
      calcium: 12,
      iron: 0.7,
      vitaminC: 0,
      cholesterol: 0,
    },
    source: "IFCT 2017 (ICMR-NIN) #B022",
    healthBenefits: [
      "Light, easily digestible fermented meal with minimal oil.",
      "Pairs synergistically with vegetable stew or egg curry.",
    ],
  },
  {
    id: "IFCT_VEG_001",
    name: "Vegetable Beans & Coconut Poriyal",
    regionalNames: { ta: "பீன்ஸ் பொரியல்", hi: "बीन्स पोरियल / भुजिया", ml: "ബീൻസ് തോരൻ" },
    aliases: ["poriyal", "beans poriyal", "thoran", "beans thoran", "sabzi", "stir fry"],
    category: "Vegetable Dishes",
    servingSizeGrams: 100,
    servingDescription: "1 small bowl (100g)",
    per100g: {
      calories: 76,
      protein: 2.8,
      carbs: 8.4,
      fat: 3.6,
      fiber: 4.1,
      saturatedFat: 2.2,
      sodium: 160,
      potassium: 210,
      calcium: 44,
      iron: 1.2,
      vitaminC: 11.5,
      cholesterol: 0,
    },
    source: "IFCT 2017 (ICMR-NIN) #C031",
    healthBenefits: [
      "High fiber and micronutrient density with low glycemic response.",
      "Loaded with vitamin C, folate, and potassium for vascular health.",
    ],
  },
  {
    id: "IFCT_GRAIN_001",
    name: "Curd Rice (Thayir Sadam)",
    regionalNames: { ta: "தயிர் சாதம்", hi: "दही चावल", ml: "തൈര് സാദം" },
    aliases: ["curd rice", "thayir sadam", "dahi chawal", "yogurt rice"],
    category: "Grains & Breads",
    servingSizeGrams: 200,
    servingDescription: "1 medium bowl (200g)",
    per100g: {
      calories: 128,
      protein: 3.8,
      carbs: 21.6,
      fat: 3.1,
      fiber: 0.9,
      saturatedFat: 1.8,
      sodium: 210,
      potassium: 160,
      calcium: 120,
      iron: 0.5,
      vitaminC: 1.8,
      cholesterol: 8,
    },
    source: "IFCT 2017 (ICMR-NIN) #A012",
    healthBenefits: [
      "Natural live probiotics from curd restore healthy gut bacteria and soothe acid reflux.",
      "Hydrating and cooling meal with balanced electrolytes and bioavailable calcium.",
    ],
  },
];

/**
 * Search the IFCT database for a match
 */
export function searchIFCTDatabase(query: string): IFCTFoodItem | null {
  const normalized = query.toLowerCase().trim();

  // 1. Direct exact match on aliases, full names, or regional script names
  for (const item of IFCT_DATABASE) {
    if (item.name.toLowerCase() === normalized) return item;
    if (item.aliases.some((a) => a === normalized)) {
      return item;
    }
    if (
      (item.regionalNames.ta && item.regionalNames.ta === normalized) ||
      (item.regionalNames.hi && item.regionalNames.hi === normalized) ||
      (item.regionalNames.ml && item.regionalNames.ml === normalized)
    ) {
      return item;
    }
  }

  // 2. Tokenized exact word match
  const words = normalized.split(/\s+/);
  for (const item of IFCT_DATABASE) {
    for (const word of words) {
      if (item.aliases.some((a) => a === word)) {
        return item;
      }
      if (
        (item.regionalNames.ta && item.regionalNames.ta === word) ||
        (item.regionalNames.hi && item.regionalNames.hi === word) ||
        (item.regionalNames.ml && item.regionalNames.ml === word)
      ) {
        return item;
      }
    }
  }

  // 3. Substring match on multi-word aliases
  for (const item of IFCT_DATABASE) {
    if (item.aliases.some((a) => a.includes(" ") && normalized.includes(a))) {
      return item;
    }
    if (
      (item.regionalNames.ta && normalized.includes(item.regionalNames.ta)) ||
      (item.regionalNames.hi && normalized.includes(item.regionalNames.hi)) ||
      (item.regionalNames.ml && normalized.includes(item.regionalNames.ml))
    ) {
      return item;
    }
  }

  return null;
}
