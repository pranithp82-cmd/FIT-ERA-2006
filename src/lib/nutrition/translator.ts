// Multi-language translation dictionary & automatic language intelligence for AI Era

export type SupportedLanguage = "en" | "ta" | "hi" | "ml";

export interface LanguageMeta {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  voiceLangCode: string; // BCP 47 code for Web Speech API
}

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, LanguageMeta> = {
  en: { code: "en", name: "English", nativeName: "English", voiceLangCode: "en-US" },
  ta: { code: "ta", name: "Tamil", nativeName: "தமிழ்", voiceLangCode: "ta-IN" },
  hi: { code: "hi", name: "Hindi", nativeName: "हिंदी", voiceLangCode: "hi-IN" },
  ml: { code: "ml", name: "Malayalam", nativeName: "മലയാളം", voiceLangCode: "ml-IN" },
};

// Standardized translation terms per language
export const NUTRITION_TERMS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    calories: "Calories",
    protein: "Protein",
    carbohydrates: "Carbohydrates",
    netCarbs: "Net Carbs",
    fat: "Total Fat",
    saturatedFat: "Saturated Fat",
    fiber: "Dietary Fiber",
    sugar: "Sugar",
    sodium: "Sodium",
    potassium: "Potassium",
    calcium: "Calcium",
    iron: "Iron",
    vitaminC: "Vitamin C",
    vitaminD: "Vitamin D",
    cholesterol: "Cholesterol",
    servingSize: "Serving Size",
    macroRatio: "Macronutrient Ratio",
    healthBenefits: "Key Health Benefits",
    dietaryWarnings: "Dietary Advisories & Notes",
    verifiedSource: "Verified Database Source",
    estimatedSource: "Estimated Nutritional Value",
    dataNotAvailable: "Data not available",
    disclaimer: "Note: Nutrition values are derived from clinical databases and are for informational purposes.",
    perServing: "per serving",
    contains: "contains",
    and: "and",
    approx: "approximately",
  },
  ta: {
    calories: "கலோரிகள் (Calories)",
    protein: "புரதம் (Protein)",
    carbohydrates: "கார்போஹைட்ரேட் (Carbs)",
    netCarbs: "நிகர கார்போஹைட்ரேட்",
    fat: "கொழுப்பு (Fat)",
    saturatedFat: "நிறைவுற்ற கொழுப்பு",
    fiber: "நார்ச்சத்து (Fiber)",
    sugar: "சர்க்கரை (Sugar)",
    sodium: "சோடியம் (Sodium)",
    potassium: "பொட்டாசியம் (Potassium)",
    calcium: "கால்சியம் (Calcium)",
    iron: "இரும்புச்சத்து (Iron)",
    vitaminC: "வைட்டமின் சி (Vitamin C)",
    vitaminD: "வைட்டமின் டி (Vitamin D)",
    cholesterol: "கொலஸ்ட்ரால்",
    servingSize: "பரிமாறும் அளவு (Serving)",
    macroRatio: "மேக்ரோ விகிதம்",
    healthBenefits: "முக்கிய ஆரோக்கிய நன்மைகள்",
    dietaryWarnings: "உணவு எச்சரிக்கைகள் & குறிப்புகள்",
    verifiedSource: "சரிபார்க்கப்பட்ட தரவுத்தளம் (Verified)",
    estimatedSource: "மதிப்பிடப்பட்ட ஊட்டச்சத்து மதிப்பு",
    dataNotAvailable: "தகவல் கிடைக்கவில்லை",
    disclaimer: "குறிப்பு: ஊட்டச்சத்து அளவுகள் மருத்துவத் தரவுத்தளங்களிலிருந்து பெறப்பட்டவை.",
    perServing: "ஒரு பரிமாறலில்",
    contains: "கொண்டுள்ளது",
    and: "மற்றும்",
    approx: "சுமார்",
  },
  hi: {
    calories: "कैलोरी (Calories)",
    protein: "प्रोटीन (Protein)",
    carbohydrates: "कार्बोहाइड्रेट (Carbs)",
    netCarbs: "नेट कार्ब्स",
    fat: "कुल फैट / वसा (Fat)",
    saturatedFat: "संतृप्त वसा (Saturated Fat)",
    fiber: "फाइबर (Fiber)",
    sugar: "शर्करा / चीनी (Sugar)",
    sodium: "सोडियम (Sodium)",
    potassium: "पोटेशियम (Potassium)",
    calcium: "कैल्शियम (Calcium)",
    iron: "आयरन (Iron)",
    vitaminC: "विटामिन सी (Vitamin C)",
    vitaminD: "विटामिन डी (Vitamin D)",
    cholesterol: "कोलेस्ट्रॉल (Cholesterol)",
    servingSize: "परोसने का आकार (Serving)",
    macroRatio: "मैक्रोन्यूट्रिएंट अनुपात",
    healthBenefits: "मुख्य स्वास्थ्य लाभ",
    dietaryWarnings: "आहार संबंधी सलाह और चेतावनियां",
    verifiedSource: "सत्यापित डेटाबेस स्रोत (Verified)",
    estimatedSource: "अनुमानित पोषण मूल्य (Estimated)",
    dataNotAvailable: "डेटा उपलब्ध नहीं है",
    disclaimer: "नोट: पोषण संबंधी मान नैदानिक डेटाबेस से लिए गए हैं।",
    perServing: "प्रति सर्विंग",
    contains: "शामिल है",
    and: "और",
    approx: "लगभग",
  },
  ml: {
    calories: "കലോറി (Calories)",
    protein: "പ്രോട്ടീൻ (Protein)",
    carbohydrates: "കാർബോഹൈഡ്രേറ്റ് (Carbs)",
    netCarbs: "നെറ്റ് കാർബ്സ്",
    fat: "കൊഴുപ്പ് (Fat)",
    saturatedFat: "പൂരിത കൊഴുപ്പ് (Saturated Fat)",
    fiber: "ഫൈബർ / നാരുചത്ത് (Fiber)",
    sugar: "പഞ്ചസാര (Sugar)",
    sodium: "സോഡിയം (Sodium)",
    potassium: "പൊട്ടാസ്യം (Potassium)",
    calcium: "കാൽസ്യം (Calcium)",
    iron: "ഇരുമ്പ് / അയൺ (Iron)",
    vitaminC: "വിറ്റാമിൻ സി (Vitamin C)",
    vitaminD: "വിറ്റാമിൻ ഡി (Vitamin D)",
    cholesterol: "കൊളസ്ട്രോൾ (Cholesterol)",
    servingSize: "സെർവിംഗ് അളവ് (Serving)",
    macroRatio: "മാക്രോ അനുപാതം",
    healthBenefits: "പ്രധാന ആരോഗ്യ ഗുണങ്ങൾ",
    dietaryWarnings: "ഭക്ഷണ നിർദ്ദേശങ്ങളും മുൻകരുതലുകളും",
    verifiedSource: "സ്ഥിരീകരിച്ച ഡാറ്റാബേസ് (Verified)",
    estimatedSource: "കണക്കാക്കിയ പോഷക മൂല്യം (Estimated)",
    dataNotAvailable: "വിവരങ്ങൾ ലഭ്യമല്ല",
    disclaimer: "ശ്രദ്ധിക്കുക: പോഷക വിവരങ്ങൾ ശാസ്ത്രീയ ഡാറ്റാബേസുകളിൽ നിന്നുള്ളതാണ്.",
    perServing: "ഒരു സെർവിംഗിൽ",
    contains: "അടങ്ങിയിരിക്കുന്നു",
    and: "ഒപ്പം",
    approx: "ഏകദേശം",
  },
};

// Regional common food words mapped to English canonical search keys
const FOOD_TRANSLATION_MAP: Record<string, string> = {
  // Tamil
  முட்டை: "egg",
  முட்டைகள்: "eggs",
  சாதம்: "cooked rice",
  அரிசி: "rice",
  இட்லி: "idli",
  தோசை: "dosa",
  வடை: "vada",
  சாம்பார்: "sambar",
  ரசம்: "rasam",
  சப்பாத்தி: "chapati",
  ரோட்டி: "roti",
  பருப்பு: "dal",
  தயிர்: "curd yogurt",
  பால்: "milk",
  வாழைப்பழம்: "banana",
  ஆப்பிள்: "apple",
  மீன்: "fish",
  கோழி: "chicken",
  கோழிக்கறி: "chicken breast",
  பொரியல்: "vegetable poriyal",
  பன்னீர்: "paneer",

  // Hindi
  अंडा: "egg",
  अंडे: "eggs",
  चावल: "cooked rice",
  रोटी: "roti",
  चपाती: "chapati",
  दाल: "dal",
  इडली: "idli",
  डोसा: "dosa",
  सांभर: "sambar",
  दही: "curd yogurt",
  दूध: "milk",
  केला: "banana",
  सेब: "apple",
  पनीर: "paneer",
  चिकन: "chicken breast",
  मछली: "fish",
  पराठा: "paratha",
  आलू: "potato",

  // Malayalam
  മുട്ട: "egg",
  മുട്ടകൾ: "eggs",
  ചോറ്: "cooked rice",
  അരി: "rice",
  ഇഡ്ഡലി: "idli",
  ദോശ: "dosa",
  സാമ്പാർ: "sambar",
  അപ്പം: "appam",
  പുട്ട്: "puttu",
  പാല്: "milk",
  തൈര്: "curd yogurt",
  മീൻ: "fish",
  കോഴി: "chicken",
  പഴം: "banana",
  ചപ്പാത്തി: "chapati",
  പരിപ്പ്: "dal",
  കടലക്കറി: "chana masala",
};

/**
 * Automatically detects the language of the query based on Unicode script ranges
 * and romanized linguistic patterns.
 */
export function detectLanguage(text: string): SupportedLanguage {
  if (!text) return "en";

  // 1. Native Unicode script detection
  if (/[\u0B80-\u0BFF]/.test(text)) {
    return "ta"; // Tamil script
  }
  if (/[\u0900-\u097F]/.test(text)) {
    return "hi"; // Hindi / Devanagari script
  }
  if (/[\u0D00-\u0D7F]/.test(text)) {
    return "ml"; // Malayalam script
  }

  // 2. Romanized / Transliterated phonetic keywords detection
  const lower = text.toLowerCase();

  // Tamil phonetic cues
  const tamilCues = /\b(vanakkam|sollu|sollunga|kudunga|irukku|irukka|saapadu|saapdalaam|epdi|nandri|muttai|sappathi|saadham|kolikari|paruppu|thayir|dosai|idly|idli|enna|eppadi|eppadi|solu)\b/i;
  if (tamilCues.test(lower)) {
    return "ta";
  }

  // Hindi phonetic cues
  const hindiCues = /\b(namaste|kitna|kitni|batao|bataiye|chahiye|hai|hote|kya|anda|ande|chawal|daal|dal|doodh|kaise|khana|khao|btao|paneer|roti|chhoti|bada)\b/i;
  if (hindiCues.test(lower)) {
    return "hi";
  }

  // Malayalam phonetic cues
  const malayalamCues = /\b(namaskaram|ethra|und|aanu|parayu|parayoo|kazhikkanam|mutta|choru|kadala|appam|puttu|paal|thair|enthoke|entha)\b/i;
  if (malayalamCues.test(lower)) {
    return "ml";
  }

  return "en"; // Default English
}

/**
 * Translates regional food names into English search terms for database lookup
 */
export function translateToEnglishSearchTerm(query: string): string {
  const words = query.trim().split(/\s+/);
  const translatedWords = words.map((w) => FOOD_TRANSLATION_MAP[w.toLowerCase()] || w);
  return translatedWords.join(" ");
}

/**
 * Formats a concise, natural spoken-style quick answer in the target language
 */
export function generateSpokenQuickAnswer(
  foodName: string,
  servingDesc: string,
  calories: number,
  protein: number,
  carbs: number,
  fat: number,
  lang: SupportedLanguage
): string {
  if (lang === "ta") {
    return `${servingDesc} ${foodName}-ல் சுமார் ${calories} கலோரிகள், ${protein} கிராம் புரதம், ${carbs} கிராம் கார்போஹைட்ரேட் மற்றும் ${fat} கிராம் கொழுப்பு உள்ளது.`;
  }
  if (lang === "hi") {
    return `${servingDesc} ${foodName} में लगभग ${calories} कैलोरी, ${protein} ग्राम प्रोटीन, ${carbs} ग्राम कार्ब्स और ${fat} ग्राम फैट होता है।`;
  }
  if (lang === "ml") {
    return `${servingDesc} ${foodName}-ൽ ഏകദേശം ${calories} കലോറി, ${protein} ഗ്രാം പ്രോട്ടീൻ, ${carbs} ഗ്രാം കാർബോഹൈഡ്രേറ്റ്, ${fat} ഗ്രാം കൊഴുപ്പ് അടങ്ങിയിരിക്കുന്നു.`;
  }
  return `${servingDesc} of ${foodName} contains approximately ${calories} calories, ${protein}g protein, ${carbs}g carbs, and ${fat}g fat.`;
}
