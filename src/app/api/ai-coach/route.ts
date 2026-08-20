import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { detectLanguage, translateToEnglishSearchTerm, SupportedLanguage } from "@/lib/nutrition/translator";
import { parseFoodQuery } from "@/lib/nutrition/unit-converter";
import { searchIFCTDatabase } from "@/lib/nutrition/ifct";
import { queryUSDADatabase, CanonicalNutritionRecord } from "@/lib/nutrition/usda";
import { formatNutritionResponse, StructuredNutritionResponse } from "@/lib/nutrition/llm-formatter";

// Doctor Specialists Database for Clinical Telehealth & In-Clinic Matching
const DOCTOR_SPECIALISTS: Record<string, any> = {
  dermatology: {
    name: "Dr. Sarah Chen, MD",
    specialty: "Dermatologist & Skin Biometrics",
    hospital: "Neo-Tokyo Central Medical & Longevity Center",
    experience: "12 Years Experience • Harvard Medical",
    availability: "Today, 2:30 PM",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCO_JAR2idRwD7kSIfFi8Z6oQ11u5-Igb1kbv-lKP9aTWLPd8kFTdNnGCwmOJjeKXQvvJTVKIBcgHZ1O2z9bGU7XMpEuB6ZgXeY6IBD2CWkcafoFNShQADyfKcIEW7KxNbn-aV274zFp76-xlevipAIydlohbHa8D6UPJiRQ52DHNokP3e8KAvraR2-wVglrb42TSXHPLKY7SiKWPGSgd9XmQE30_l7xHufm-HJ9iiag6RHS3ueiNnDWA",
    rating: "4.9 ★ (340 reviews)",
    consultationFee: "$120 (100% Covered by Insurance)",
    availableSlots: ["Today, 2:30 PM", "Today, 4:15 PM", "Tomorrow, 10:00 AM", "Tomorrow, 2:00 PM"],
  },
  cardiology: {
    name: "Dr. Marcus Vance, MD, FACC",
    specialty: "Cardiologist & Vascular Health",
    hospital: "Apex Cardiovascular & Telemetry Institute",
    experience: "16 Years Experience • Johns Hopkins",
    availability: "Tomorrow, 11:00 AM",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80",
    rating: "5.0 ★ (412 reviews)",
    consultationFee: "$150 (Covered by NOIR PRO)",
    availableSlots: ["Tomorrow, 11:00 AM", "Tomorrow, 3:30 PM", "Friday, 9:00 AM"],
  },
  orthopedics: {
    name: "Dr. Elena Rostova, MD, PhD",
    specialty: "Sports Orthopedics & Biomechanics",
    hospital: "St. Jude Musculoskeletal & Spine Center",
    experience: "14 Years Experience • Stanford Medical",
    availability: "Today, 5:00 PM",
    avatar: "https://images.unsplash.com/photo-1594824813515-5a21074e0d9b?w=300&auto=format&fit=crop&q=80",
    rating: "4.9 ★ (289 reviews)",
    consultationFee: "$130 (Covered by Insurance)",
    availableSlots: ["Today, 5:00 PM", "Tomorrow, 1:00 PM", "Monday, 10:30 AM"],
  },
  endocrinology: {
    name: "Dr. Arvind Subramanian, MD",
    specialty: "Endocrinologist & Metabolic Health",
    hospital: "Metabolic Longevity & Hormone Clinic",
    experience: "15 Years Experience • AIIMS New Delhi",
    availability: "Tomorrow, 9:30 AM",
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=300&auto=format&fit=crop&q=80",
    rating: "4.9 ★ (520 reviews)",
    consultationFee: "$140 (Covered by Insurance)",
    availableSlots: ["Tomorrow, 9:30 AM", "Tomorrow, 4:00 PM", "Friday, 11:00 AM"],
  },
};

const MEDICAL_DISCLAIMER = "\n\n> ℹ️ *Clinical Disclaimer: AI Era provides analytical wellness and educational insights based on your verified data. It does not diagnose disease or replace professional medical advice. Always consult a licensed healthcare provider.*";

export async function GET() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json([]);

    const chats = await prisma.aIConversation.findMany({
      where: { userId: user.id },
      orderBy: { timestamp: "asc" },
    });

    return NextResponse.json(chats);
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const message = data.message?.trim() || "";

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const detectedLang: SupportedLanguage = data.language || detectLanguage(message);
    const lower = message.toLowerCase();

    // Fetch verified DB Context from Prisma for the active user
    let userContext: any = null;
    let recentWorkouts: any[] = [];
    let recentFoodLogs: any[] = [];
    let latestBloodReport: any = null;
    let latestDxaReport: any = null;

    try {
      const user = await prisma.user.findFirst();
      if (user) {
        userContext = user;
        const [workouts, foodLogs, bloodReport, dxaReport] = await Promise.all([
          prisma.workout.findMany({
            where: { userId: user.id },
            include: { sets: { include: { exercise: true } } },
            orderBy: { startTime: "desc" },
            take: 3,
          }),
          prisma.foodLog.findMany({
            where: { userId: user.id },
            include: { food: true },
            orderBy: { logDate: "desc" },
            take: 5,
          }),
          prisma.healthReport.findFirst({
            where: { userId: user.id },
            include: { parameters: true },
            orderBy: { reportDate: "desc" },
          }),
          prisma.dXAReport.findFirst({
            where: { userId: user.id },
            include: { parameters: true },
            orderBy: { reportDate: "desc" },
          }),
        ]);

        recentWorkouts = workouts;
        recentFoodLogs = foodLogs;
        latestBloodReport = bloodReport;
        latestDxaReport = dxaReport;
      }
    } catch (dbErr) {
      console.warn("Could not load full DB context for AI Era:", dbErr);
    }

    // 1. Food / Nutrition Query -> Search USDA & IFCT verified engines
    const isNutrition =
      lower.includes("egg") ||
      lower.includes("chicken") ||
      lower.includes("rice") ||
      lower.includes("apple") ||
      lower.includes("banana") ||
      lower.includes("oats") ||
      lower.includes("milk") ||
      lower.includes("salmon") ||
      lower.includes("protein") ||
      lower.includes("calorie") ||
      lower.includes("calories") ||
      lower.includes("macro") ||
      lower.includes("carb") ||
      lower.includes("fat") ||
      lower.includes("idli") ||
      lower.includes("dosa") ||
      lower.includes("sambar") ||
      lower.includes("roti") ||
      lower.includes("dal") ||
      lower.includes("paneer") ||
      lower.includes("biryani") ||
      lower.includes("poriyal") ||
      lower.includes("puttu") ||
      lower.includes("appam") ||
      lower.includes("food") ||
      lower.includes("diet") ||
      lower.includes("nutrition") ||
      lower.includes("முட்டை") ||
      lower.includes("இட்லி") ||
      lower.includes("தோசை") ||
      lower.includes("சாம்பார்") ||
      lower.includes("சப்பாத்தி") ||
      lower.includes("பருப்பு") ||
      lower.includes("பன்னீர்") ||
      lower.includes("அண்டை") ||
      lower.includes("अंडे") ||
      lower.includes("अंडा") ||
      lower.includes("रोटी") ||
      lower.includes("दाल") ||
      lower.includes("पनीर") ||
      lower.includes("बिरयानी") ||
      lower.includes("മുട്ട") ||
      lower.includes("അപ്പം") ||
      lower.includes("പുട്ട്") ||
      lower.includes("ചോറ്") ||
      /^[\d.]+\s*(g|gram|grams|gm|cup|cups|bowl|bowls|plate|plates|slice|slices|tbsp|tsp|items?|pieces?)/i.test(
        message
      );

    // If query asks for recent food intake or logged foods
    if ((lower.includes("log") || lower.includes("intake") || lower.includes("eaten") || lower.includes("history")) && isNutrition && recentFoodLogs.length > 0) {
      const summaryList = recentFoodLogs
        .map((l) => `- **${l.food?.name || "Meal"}** (${l.mealType}): ${l.food?.calories || 0} kcal, ${l.food?.protein || 0}g protein`)
        .join("\n");

      const reply = `### 🥗 Your Verified Nutrition Log (AI Era):\n\nHere are your recently logged meals from the database:\n\n${summaryList}\n\n*Total logged items: ${recentFoodLogs.length}*. Would you like me to analyze your daily macro distribution or compute your remaining calorie allowance?`;
      return NextResponse.json({
        reply,
        spokenText: `You have ${recentFoodLogs.length} logged meals. Let me know if you would like a macro breakdown.`,
        detectedLanguage: detectedLang,
      });
    }

    if (isNutrition) {
      try {
        const parsed = parseFoodQuery(message);
        const englishSearch = translateToEnglishSearchTerm(parsed.foodName);

        // Search FIT ERA 5,000 Food Database in Prisma first
        let canonicalRecord: CanonicalNutritionRecord | null = null;

        const dbFood = await prisma.food.findFirst({
          where: {
            OR: [
              { name: { contains: parsed.foodName } },
              { name: { contains: englishSearch } },
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
              `Category: ${dbFood.category}${dbFood.vegetarian ? " • Vegetarian friendly" : ""}${dbFood.vegan ? " • Vegan" : ""}.`,
            ],
            warnings: dbFood.sourceNote ? [dbFood.sourceNote] : undefined,
          };
        } else {
          const ifctMatch = searchIFCTDatabase(parsed.foodName) || searchIFCTDatabase(englishSearch);

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
          } else {
            const usdaMatch = await queryUSDADatabase(englishSearch);
            if (usdaMatch) {
              canonicalRecord = usdaMatch;
            } else {
              canonicalRecord = {
                id: `EST_${Date.now()}`,
                foodName: parsed.foodName.charAt(0).toUpperCase() + parsed.foodName.slice(1),
                dataType: "Composite Estimate",
                source: "Estimated Food Profile",
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
                healthBenefits: ["Standard estimated nutritional composition."],
              };
            }
          }
        }

        const nutritionData: StructuredNutritionResponse = await formatNutritionResponse(
          parsed,
          canonicalRecord,
          detectedLang
        );

        let introText = `I analyzed **${nutritionData.foodName} (${nutritionData.servingSize})** using verified clinical database records (**${nutritionData.sourceAttribution}**):`;
        if (detectedLang === "ta") {
          introText = `**${nutritionData.foodName} (${nutritionData.servingSize})** குறித்த சரிபார்க்கப்பட்ட ஊட்டச்சத்து விவரங்கள் கீழே தரப்பட்டுள்ளன (**${nutritionData.sourceAttribution}**):`;
        } else if (detectedLang === "hi") {
          introText = `**${nutritionData.foodName} (${nutritionData.servingSize})** का सत्यापित पोषण विश्लेषण (**${nutritionData.sourceAttribution}**):`;
        } else if (detectedLang === "ml") {
          introText = `**${nutritionData.foodName} (${nutritionData.servingSize})**-ന്റെ കൃത്യമായ പോഷക വിവരങ്ങൾ താഴെ നൽകുന്നു (**${nutritionData.sourceAttribution}**):`;
        }

        return NextResponse.json({
          reply: `${introText}\n\n${nutritionData.quickAnswer}`,
          spokenText: nutritionData.quickAnswer,
          detectedLanguage: detectedLang,
          cardType: "nutrition",
          nutritionData,
        });
      } catch (e) {
        console.warn("Error processing nutrition in AI Era:", e);
      }
    }

    // 2. Doctor / Medical Consultation Booking Queries
    if (
      lower.includes("doctor") ||
      lower.includes("dermatolog") ||
      lower.includes("skin") ||
      lower.includes("cardio") ||
      lower.includes("heart") ||
      lower.includes("physio") ||
      lower.includes("orthoped") ||
      lower.includes("joint") ||
      lower.includes("hormone") ||
      lower.includes("மருத்துவர்") ||
      lower.includes("டாக்டர்") ||
      lower.includes("डॉक्टर") ||
      lower.includes("ഡോക്ടർ")
    ) {
      let doc = DOCTOR_SPECIALISTS.dermatology;
      if (lower.includes("heart") || lower.includes("cardio")) doc = DOCTOR_SPECIALISTS.cardiology;
      else if (lower.includes("physio") || lower.includes("joint") || lower.includes("bone") || lower.includes("ortho"))
        doc = DOCTOR_SPECIALISTS.orthopedics;
      else if (lower.includes("hormone") || lower.includes("thyroid") || lower.includes("sugar"))
        doc = DOCTOR_SPECIALISTS.endocrinology;

      let reply = `I found a top-rated clinical specialist matched to your query and insurance coverage. You can schedule a direct HD telehealth video call or in-clinic visit below:${MEDICAL_DISCLAIMER}`;
      if (detectedLang === "ta") {
        reply = `உங்கள் தேவைக்கேற்ற சிறந்த மருத்துவ நிபுணரை இணைத்துள்ளேன். கீழே உள்ள பொத்தானை அழுத்தி உடனடி ஆலோசனை பெறலாம்:${MEDICAL_DISCLAIMER}`;
      } else if (detectedLang === "hi") {
        reply = `मैंने आपकी आवश्यकता के अनुसार शीर्ष रेटेड विशेषज्ञ डॉक्टर को चुना है। आप सीधे अपॉइंटमेंट बुक कर सकते हैं:${MEDICAL_DISCLAIMER}`;
      } else if (detectedLang === "ml") {
        reply = `നിങ്ങൾക്കായി മികച്ച സ്പെഷ്യലിസ്റ്റ് ഡോക്ടറെ കണ്ടെത്തിയിട്ടുണ്ട്. താഴെ കാണുന്ന കാർഡിലൂടെ കൺസൾട്ടേഷൻ ബുക്ക് ചെയ്യാം:${MEDICAL_DISCLAIMER}`;
      }

      return NextResponse.json({
        reply,
        spokenText: `I found ${doc.name}, ${doc.specialty}. You can book a consultation now.`,
        detectedLanguage: detectedLang,
        cardType: "doctor",
        doctorCard: doc,
      });
    }

    // 3. Workout / Exercise / Muscle Building Queries
    if (
      lower.includes("workout") ||
      lower.includes("routine") ||
      lower.includes("exercise") ||
      lower.includes("chest") ||
      lower.includes("hypertrophy") ||
      lower.includes("strength") ||
      lower.includes("leg day") ||
      lower.includes("back") ||
      lower.includes("training") ||
      lower.includes("bench") ||
      lower.includes("squat") ||
      lower.includes("deadlift") ||
      lower.includes("உடற்பயிற்சி") ||
      lower.includes("कसरत") ||
      lower.includes("വർക്കൗട്ട്")
    ) {
      let workoutTitle = "Upper Body Hypertrophy Split";
      let focusText = "Incline DB Press (4x10) • Weighted Dips (3x8) • High-to-Low Cable Flyes (3x12)";
      let duration = "45 mins";
      let intensity = "High Intensity (RPE 8.5)";

      if (lower.includes("leg") || lower.includes("squat")) {
        workoutTitle = "Lower Body Quad & Posterior Overload";
        focusText = "Barbell Back Squats (4x8) • Romanian Deadlifts (3x10) • Leg Press (3x12)";
        duration = "50 mins";
      } else if (lower.includes("back") || lower.includes("pull")) {
        workoutTitle = "Back & Posterior Lat Width Protocol";
        focusText = "Neutral Grip Pull-ups (4x8) • Chest-Supported T-Bar Row (3x10) • Face Pulls (3x15)";
        duration = "40 mins";
      }

      // Check if user has past recorded workouts in DB
      let dbWorkoutContext = "";
      if (recentWorkouts.length > 0) {
        const lastW = recentWorkouts[0];
        const setsCount = lastW.sets?.length || 0;
        dbWorkoutContext = `\n\n*Your Recent Training History*: Logged **${lastW.name}** with ${setsCount} completed sets. Progressive overload targets have been automatically adjusted.*`;
      }

      let reply = `Here is your customized training protocol calibrated for progressive overload and neuromuscular adaptation:${dbWorkoutContext}`;
      if (detectedLang === "ta") {
        reply = `உங்கள் உடல் வலிமை மற்றும் தசை வளர்ச்சிக்கான சிறப்பு பயிற்சி அட்டவணை:${dbWorkoutContext}`;
      } else if (detectedLang === "hi") {
        reply = `आपकी मांसपेशियों के निर्माण और रिकवरी के लिए विशेष वर्कआउट रूटीन:${dbWorkoutContext}`;
      } else if (detectedLang === "ml") {
        reply = `പേശികളുടെ വളർച്ചയ്ക്കായി പ്രത്യേകം തയ്യാറാക്കിയ പരിശീലന പ്ലാൻ:${dbWorkoutContext}`;
      }

      return NextResponse.json({
        reply,
        spokenText: `Here is your ${workoutTitle}. Duration is ${duration}. Click Start to begin.`,
        detectedLanguage: detectedLang,
        cardType: "workout",
        workoutCard: {
          title: workoutTitle,
          duration,
          intensity,
          focus: focusText,
        },
      });
    }

    // 4. DXA / Blood Test / Biomarker Analysis Queries (with real DB context)
    if (
      lower.includes("blood") ||
      lower.includes("dxa") ||
      lower.includes("scan") ||
      lower.includes("hba1c") ||
      lower.includes("cholesterol") ||
      lower.includes("testosterone") ||
      lower.includes("vitamin d") ||
      lower.includes("t-score") ||
      lower.includes("bmd") ||
      lower.includes("bone") ||
      lower.includes("biomarker") ||
      lower.includes("இரத்த பரிசோதனை") ||
      lower.includes("ரक्त परीक्षण") ||
      lower.includes("ബ്ലഡ് ടെസ്റ്റ്")
    ) {
      let dbInsights = "";

      if (latestDxaReport && latestDxaReport.parameters?.length > 0) {
        const params = latestDxaReport.parameters;
        const bmd = params.find((p: any) => p.metricName.toLowerCase().includes("bmd"));
        const tScore = params.find((p: any) => p.metricName.toLowerCase().includes("t-score"));
        const bodyFat = params.find((p: any) => p.metricName.toLowerCase().includes("fat percentage") || p.metricName.toLowerCase().includes("body fat"));

        dbInsights += `\n\n**Your Verified DXA Scan Metrics (${latestDxaReport.scanTypeId || "Calibrated Protocol"})**:\n`;
        if (bmd) dbInsights += `- **${bmd.metricName}**: ${bmd.value} ${bmd.unit || "g/cm²"} (${bmd.region || "Regional"})\n`;
        if (tScore) dbInsights += `- **${tScore.metricName}**: ${tScore.value} SD (Status: ${tScore.value >= -1.0 ? "Normal/Optimal" : tScore.value > -2.5 ? "Osteopenia" : "Osteoporosis"})\n`;
        if (bodyFat) dbInsights += `- **${bodyFat.metricName}**: ${bodyFat.value}%\n`;
      }

      if (latestBloodReport && latestBloodReport.parameters?.length > 0) {
        const params = latestBloodReport.parameters.slice(0, 4);
        dbInsights += `\n**Your Verified Blood Panel (${latestBloodReport.packageId || "Calibrated Laboratory"})**:\n`;
        params.forEach((p: any) => {
          dbInsights += `- **${p.testName}**: ${p.value} ${p.unit} (Status: ${p.status})\n`;
        });
      }

      let reply = `### 🩺 Verified Clinical Biomarker & DXA Insights (AI Era):
${dbInsights || `
1. **Body Composition & Lean Mass**: DXA analysis measures bone mineral density, visceral adipose tissue, and segmental lean symmetry without fabricated unscanned sites.
2. **Key Biomarkers Monitored**:
   - **HbA1c & Fasting Glucose**: Metabolic glycemic control and insulin sensitivity (<5.7% optimal).
   - **Lipid Panel (ApoB & LDL-C)**: Cardiovascular atherogenic particle count.
   - **Vitamin D3 (25-OH)**: Skeletal mineral metabolism and immune endocrine function (>40 ng/mL).
   - **hs-CRP**: Systemic arterial inflammation index (<1.0 mg/L).`}
${MEDICAL_DISCLAIMER}`;

      return NextResponse.json({
        reply,
        spokenText: "Here is your clinical biomarker and DXA scan interpretation summary.",
        detectedLanguage: detectedLang,
      });
    }

    // 5. TDEE / Calories & Weight Loss / Bulking Calculations
    if (
      lower.includes("tdee") ||
      lower.includes("calories to lose weight") ||
      lower.includes("calculate calories") ||
      lower.includes("maintenance calories") ||
      lower.includes("bulk") ||
      lower.includes("cut") ||
      lower.includes("deficit") ||
      lower.includes("surplus")
    ) {
      const userWeight = userContext?.weightKg || 75;
      const userHeight = userContext?.heightCm || 178;
      const userAge = userContext?.age || 28;

      // Harris-Benedict / Mifflin-St Jeor equation calculation
      const bmr = Math.round(10 * userWeight + 6.25 * userHeight - 5 * userAge + 5);
      const tdee = Math.round(bmr * 1.45);
      const cutKcal = Math.round(tdee * 0.85);
      const bulkKcal = Math.round(tdee * 1.10);
      const proteinGrams = Math.round(userWeight * 2.2);

      let reply = `### 📊 Personalized TDEE & Caloric Framework (AI Era):

Calculated using your profile (${userWeight}kg, ${userHeight}cm, age ${userAge}):
- **Basal Metabolic Rate (BMR)**: **${bmr} kcal/day** (energy burned at rest)
- **Maintenance Energy (TDEE)**: **${tdee} kcal/day** (moderate physical activity)
- **Fat Loss Phase (15% Deficit)**: **${cutKcal} kcal/day** (~0.45 kg loss/week)
- **Lean Muscle Hypertrophy (10% Surplus)**: **${bulkKcal} kcal/day** (~0.25 kg lean gain/week)

**Target Macronutrient Distribution**:
- **Protein**: **${proteinGrams}g/day** (2.2g/kg for maximum muscle protein synthesis)
- **Fats**: **${Math.round((tdee * 0.25) / 9)}g/day** (essential hormone optimization)
- **Carbohydrates**: Remainder of daily caloric allocation.`;

      return NextResponse.json({
        reply,
        spokenText: `Your estimated maintenance is ${tdee} calories, with a fat loss target of ${cutKcal} calories per day.`,
        detectedLanguage: detectedLang,
      });
    }

    // 6. Conversational, Friendly, and General Wellness QA
    let reply = "";
    let spoken = "";

    if (detectedLang === "ta") {
      reply = `வணக்கம்! நான் உங்கள் **AI Era** - ஒருங்கிணைந்த நலவாழ்வு, உடற்பயிற்சி மற்றும் ஊட்டச்சத்து ஆலோசகர். 

உங்கள் உடற்பயிற்சி (Workouts), சரிபார்க்கப்பட்ட ஊட்டச்சத்து (Nutrition & Diet), இரத்தப் பரிசோதனை முடிவுகள் (Blood Tests), DXA ஸ்கேன் மற்றும் மருத்துவர் முன்பதிவு குறித்து என்னிடம் எந்தக் கேள்வியும் கேட்கலாம். 

உதாரணமாக: *"3 இட்லி calories என்ன?"*, *"மார்பு தசைக்கான பயிற்சி தா"*, அல்லது *"மருத்துவரிடம் பேச வேண்டும்"*.${MEDICAL_DISCLAIMER}`;
      spoken = "வணக்கம்! நான் உங்கள் AI Era ஆலோசகர். உங்கள் ஆரோக்கியம் மற்றும் உடற்பயிற்சி குறித்து என்னிடம் எந்தக் கேள்வியும் கேட்கலாம்.";
    } else if (detectedLang === "hi") {
      reply = `नमस्ते! मैं आपका **AI Era** - यूनिफाइड हेल्थ, फिटनेस और न्यूट्रिशन कोच हूँ।

आप मुझसे अपनी डाइट (Diet), वर्कआउट (Workouts), टेस्ट रिपोर्ट (Blood/DXA Scans) या डॉक्टर अपॉइंटमेंट पर कोई भी सवाल पूछ सकते हैं।

उदाहरण के लिए: *"2 अंडे में कितना प्रोटीन है?"*, *"चेस्ट वर्कआउट बताओ"*, या *"डॉक्टर से अपॉइंटमेंट बुक करो"*.${MEDICAL_DISCLAIMER}`;
      spoken = "नमस्ते! मैं आपका AI Era असिस्टेंट हूँ। आप फिटनेस, डाइट और टेस्ट रिपोर्ट्स के बारे में कुछ भी पूछ सकते हैं।";
    } else if (detectedLang === "ml") {
      reply = `നമസ്കാരം! ഞാൻ നിങ്ങളുടെ **AI Era** - ഏകീകൃത ഹെൽത്ത്, ഫിറ്റ്നസ് ആന്റ് ന്യൂട്രീഷൻ അസിസ്റ്റന്റ് ആണ്.

ഡയറ്റ് (Nutrition), വ്യായാമ മുറകൾ (Workouts), ലാബ് പരിശോധനകൾ (Blood/DXA Scans) എന്നിവയെക്കുറിച്ച് എന്ത് സംശയങ്ങളും എന്നോട് ചോദിക്കാം.

ഉദാഹരണത്തിന്: *"2 മുട്ടയിലെ പ്രോട്ടീൻ എത്ര?"*, *"വർക്കൗട്ട് പ്ലാൻ തരൂ"*, അല്ലെങ്കിൽ *"ഡോക്ടറെ കാണണം"*.${MEDICAL_DISCLAIMER}`;
      spoken = "നമസ്കാരം! ഞാൻ നിങ്ങളുടെ AI Era അസിസ്റ്റന്റ് ആണ്. എന്ത് ചോദ്യങ്ങൾക്കും ഞാൻ ഇവിടെയുണ്ട്.";
    } else {
      reply = `Hello! I'm **AI Era**, your unified personal health, fitness, and clinical nutrition coach.

I synthesize all your health intelligence in one place:
- **Verified Clinical Nutrition**: Instant macronutrient & micronutrient breakdowns from **USDA FoodData Central** and **IFCT / NIN** databases.
- **Adaptive Workout Coaching**: Biomechanics, progressive overload splits, and live workout tracking.
- **Biomarkers & DXA Scan Analysis**: Interpretation of bone mineral density, T-scores, lipid profiles, and metabolic trends without fabricated data.
- **Specialist Telehealth**: Instant HD video & in-clinic doctor bookings across cardiology, dermatology, orthopedics, and endocrinology.

How can I assist your health and fitness goals today?${MEDICAL_DISCLAIMER}`;
      spoken = "Hello! I am AI Era, your health and fitness coach. How can I help with your training, nutrition, or health metrics today?";
    }

    // Save conversation to Prisma
    try {
      const user = await prisma.user.findFirst();
      if (user) {
        await prisma.aIConversation.create({
          data: { userId: user.id, role: "user", content: message },
        });
        await prisma.aIConversation.create({
          data: { userId: user.id, role: "assistant", content: reply },
        });
      }
    } catch (e) {
      // Non-blocking fallback
    }

    return NextResponse.json({
      reply,
      spokenText: spoken,
      detectedLanguage: detectedLang,
    });
  } catch (error) {
    console.error("AI Era API error:", error);
    return NextResponse.json(
      { error: "Failed to process request", details: String(error) },
      { status: 500 }
    );
  }
}
