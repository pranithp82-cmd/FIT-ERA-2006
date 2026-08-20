export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatar: string;
  membership: string;
  level: string;
  age?: number;
  gender?: string;
  bloodType?: string;
  primaryGoal?: string;
  weightKg: number;
  heightCm: number;
  bodyFatPct: number;
  targetCalories: number;
  targetWaterLiters: number;
  targetSteps: number;
  targetActiveMinutes: number;
  streakDays: number;
  readinessScore: number;
}

export interface DailySummary {
  caloriesBurned: number;
  caloriesTarget: number;
  caloriesConsumed: number;
  proteinGrams: number;
  proteinTarget: number;
  carbsGrams: number;
  carbsTarget: number;
  fatGrams: number;
  fatTarget: number;
  waterIntakeLiters: number;
  stepsCount: number;
  activeMinutes: number;
  hrvMs: number;
  restingHeartRateBpm: number;
  currentHeartRateBpm: number;
  sleepHours: number;
  sleepQualityPct: number;
}

export interface ExerciseItem {
  id: string;
  name: string;
  category: "Chest" | "Back" | "Legs" | "Shoulders" | "Arms" | "Core" | "Cardio";
  equipment: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Elite";
  defaultSets: number;
  defaultReps: string;
  primaryMuscle: string;
  secondaryMuscles: string[];
  instructions: string[];
  tempo: string;
  restSeconds: number;
  burnRateKcalMin: number;
}

export interface RoutineExercise {
  exerciseId: string;
  name: string;
  sets: { setNumber: number; weightKg: number; reps: number; completed: boolean; rpe?: number }[];
  targetSets: number;
  targetReps: string;
  restSeconds: number;
}

export interface CompletedWorkoutLog {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  completedAt: string;
  durationMinutes: number;
  caloriesBurned: number;
  totalVolumeKg: number;
  strainScore: number;
  exercises: {
    name: string;
    completedSets: number;
    totalSets: number;
    sets: { setNumber: number; weightKg: number; reps: number; completed: boolean }[];
  }[];
}

export interface WorkoutRoutine {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  durationMinutes: number;
  estimatedBurnKcal: number;
  intensity: "Moderate" | "High" | "Peak Performance";
  targetMuscles: string[];
  exercises: RoutineExercise[];
  completed?: boolean;
}

export interface MealItem {
  id: string;
  name: string;
  mealType: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  time: string;
  image?: string;
  ingredients?: string[];
}

export interface DeviceTelemetry {
  id: string;
  name: string;
  type: "watch" | "strap" | "ring" | "scale";
  brand: string;
  batteryLevel: number;
  connected: boolean;
  lastSync: string;
  liveSignal: boolean;
}

export interface AIChatMessage {
  id: string;
  sender: "user" | "ai";
  timestamp: string;
  text: string;
  widgetType?: "workout_plan" | "nutrition_alert" | "muscle_recovery" | "form_analysis";
  widgetData?: any;
}

export const INITIAL_USER: UserProfile = {
  id: "usr_001",
  name: "Alex Morgan",
  email: "alex.morgan@erafit.ai",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
  membership: "NOIR PRO ELITE",
  level: "Advanced Athlete",
  age: 28,
  gender: "Male",
  bloodType: "O+ Positive",
  primaryGoal: "Hypertrophy & Longevity",
  weightKg: 78.4,
  heightCm: 182,
  bodyFatPct: 12.8,
  targetCalories: 2850,
  targetWaterLiters: 3.5,
  targetSteps: 10000,
  targetActiveMinutes: 60,
  streakDays: 42,
  readinessScore: 91,
};

export const INITIAL_DAILY_STATS: DailySummary = {
  caloriesBurned: 740,
  caloriesTarget: 900,
  caloriesConsumed: 1980,
  proteinGrams: 154,
  proteinTarget: 185,
  carbsGrams: 190,
  carbsTarget: 260,
  fatGrams: 52,
  fatTarget: 70,
  waterIntakeLiters: 2.6,
  stepsCount: 8420,
  activeMinutes: 52,
  hrvMs: 72,
  restingHeartRateBpm: 51,
  currentHeartRateBpm: 68,
  sleepHours: 7.8,
  sleepQualityPct: 88,
};

export const EXERCISE_DATABASE: ExerciseItem[] = [
  // CHEST
  {
    id: "ex_1",
    name: "Incline Dumbbell Bench Press",
    category: "Chest",
    equipment: "Adjustable Bench, Dumbbells",
    difficulty: "Intermediate",
    defaultSets: 4,
    defaultReps: "8 - 10",
    primaryMuscle: "Upper Pectoralis Major",
    secondaryMuscles: ["Anterior Deltoid", "Triceps Brachii"],
    instructions: [
      "Set bench to 30-degree incline.",
      "Retract scapula and drive feet firmly into the floor.",
      "Lower dumbbells with controlled 3-second eccentric tempo.",
      "Explode upward without locking elbows at the peak.",
    ],
    tempo: "3-1-1-0",
    restSeconds: 90,
    burnRateKcalMin: 9.5,
  },
  {
    id: "ex_1_1",
    name: "Barbell Flat Bench Press",
    category: "Chest",
    equipment: "Barbell, Flat Bench, Rack",
    difficulty: "Intermediate",
    defaultSets: 4,
    defaultReps: "6 - 8",
    primaryMuscle: "Mid Pectoralis Major",
    secondaryMuscles: ["Triceps", "Anterior Deltoids"],
    instructions: [
      "Grip bar with hands slightly wider than shoulder width.",
      "Arch lower back slightly and pin shoulder blades back.",
      "Lower bar smoothly to lower chest nipple-line.",
      "Drive bar upwards explosively.",
    ],
    tempo: "2-1-1-0",
    restSeconds: 120,
    burnRateKcalMin: 10.0,
  },
  {
    id: "ex_1_2",
    name: "Cable Crossover Flyes",
    category: "Chest",
    equipment: "Dual Cable Machine",
    difficulty: "Beginner",
    defaultSets: 3,
    defaultReps: "12 - 15",
    primaryMuscle: "Sternal Pectoralis",
    secondaryMuscles: ["Anterior Deltoid"],
    instructions: [
      "Set pulleys at chest height.",
      "Step forward with a slight torso lean.",
      "Bring hands together in a hugging motion.",
      "Squeeze chest hard for 1 second at peak contraction.",
    ],
    tempo: "2-0-1-1",
    restSeconds: 60,
    burnRateKcalMin: 7.5,
  },
  {
    id: "ex_1_3",
    name: "Weighted Chest Dips",
    category: "Chest",
    equipment: "Dip Station, Weight Belt",
    difficulty: "Advanced",
    defaultSets: 3,
    defaultReps: "8 - 10",
    primaryMuscle: "Lower Pectoralis Major",
    secondaryMuscles: ["Triceps", "Anterior Deltoid"],
    instructions: [
      "Lean forward 30 degrees to bias chest fibers.",
      "Lower body until elbows reach 90 degrees.",
      "Press upwards focusing on chest contraction.",
    ],
    tempo: "3-0-1-0",
    restSeconds: 90,
    burnRateKcalMin: 10.5,
  },
  {
    id: "ex_1_4",
    name: "Pec Deck Machine Flye",
    category: "Chest",
    equipment: "Pec Deck Machine",
    difficulty: "Beginner",
    defaultSets: 3,
    defaultReps: "12 - 15",
    primaryMuscle: "Pectoralis Major",
    secondaryMuscles: ["Anterior Deltoid"],
    instructions: [
      "Adjust seat so handles align with mid-chest.",
      "Keep elbows slightly bent and arc forward.",
      "Contract pectorals hard at the center.",
    ],
    tempo: "2-1-1-1",
    restSeconds: 60,
    burnRateKcalMin: 7.0,
  },
  {
    id: "ex_1_5",
    name: "Decline Barbell Press",
    category: "Chest",
    equipment: "Decline Bench, Barbell",
    difficulty: "Intermediate",
    defaultSets: 3,
    defaultReps: "8 - 10",
    primaryMuscle: "Lower Pectoralis Major",
    secondaryMuscles: ["Triceps"],
    instructions: [
      "Secure legs in decline bench rollers.",
      "Unrack bar and lower carefully to lower chest.",
      "Press upwards until arms are extended.",
    ],
    tempo: "2-1-1-0",
    restSeconds: 90,
    burnRateKcalMin: 9.0,
  },

  // SHOULDERS
  {
    id: "ex_2",
    name: "Barbell Overhead Press (OHP)",
    category: "Shoulders",
    equipment: "Barbell, Rack",
    difficulty: "Advanced",
    defaultSets: 3,
    defaultReps: "6 - 8",
    primaryMuscle: "Anterior & Lateral Deltoids",
    secondaryMuscles: ["Triceps", "Upper Traps", "Core"],
    instructions: [
      "Grip slightly wider than shoulder width.",
      "Brace glutes and core tightly.",
      "Press vertically, moving head back slightly as bar passes face.",
      "Lock out directly over mid-foot balance point.",
    ],
    tempo: "2-0-1-1",
    restSeconds: 120,
    burnRateKcalMin: 10.2,
  },
  {
    id: "ex_3",
    name: "Dual Cable Lateral Raise",
    category: "Shoulders",
    equipment: "Dual Cable Machine",
    difficulty: "Intermediate",
    defaultSets: 4,
    defaultReps: "12 - 15",
    primaryMuscle: "Lateral Deltoids",
    secondaryMuscles: ["Trapezius"],
    instructions: [
      "Set cables to lowest setting with handles crossed.",
      "Slight forward torso lean.",
      "Raise arms out in the scapular plane with thumbs slightly down.",
      "Pause for 1 second at shoulder level.",
    ],
    tempo: "2-1-1-1",
    restSeconds: 60,
    burnRateKcalMin: 7.8,
  },
  {
    id: "ex_2_1",
    name: "Dumbbell Arnold Press",
    category: "Shoulders",
    equipment: "Adjustable Bench, Dumbbells",
    difficulty: "Intermediate",
    defaultSets: 3,
    defaultReps: "10 - 12",
    primaryMuscle: "Full Deltoid Complex",
    secondaryMuscles: ["Triceps", "Rotator Cuff"],
    instructions: [
      "Start with dumbbells at chest level, palms facing inward.",
      "Rotate wrists outward as you press overhead.",
      "Finish with palms facing forward at top lockout.",
    ],
    tempo: "2-1-1-0",
    restSeconds: 90,
    burnRateKcalMin: 8.8,
  },
  {
    id: "ex_2_2",
    name: "Cable Face Pulls",
    category: "Shoulders",
    equipment: "Cable Stack, Rope Attachment",
    difficulty: "Beginner",
    defaultSets: 4,
    defaultReps: "15 - 20",
    primaryMuscle: "Rear Deltoids & External Rotators",
    secondaryMuscles: ["Rhomboids", "Middle Trapezius"],
    instructions: [
      "Set rope attachment at eye height.",
      "Pull towards forehead while pulling rope ends apart.",
      "Externally rotate hands so thumbs point backward.",
    ],
    tempo: "2-1-1-1",
    restSeconds: 60,
    burnRateKcalMin: 6.8,
  },
  {
    id: "ex_2_3",
    name: "Heavy Barbell Shrugs",
    category: "Shoulders",
    equipment: "Barbell, Lifting Straps",
    difficulty: "Intermediate",
    defaultSets: 4,
    defaultReps: "10 - 12",
    primaryMuscle: "Upper Trapezius",
    secondaryMuscles: ["Forearms", "Levator Scapulae"],
    instructions: [
      "Hold barbell at hip width with an overhand grip.",
      "Elevate shoulders straight towards ears without rolling.",
      "Hold squeeze at the top for 2 full seconds.",
    ],
    tempo: "1-2-1-0",
    restSeconds: 75,
    burnRateKcalMin: 8.0,
  },

  // BACK
  {
    id: "ex_6",
    name: "Neutral Grip Lat Pulldown",
    category: "Back",
    equipment: "Cable Pulldown Station, V-Bar / Mag Grip",
    difficulty: "Beginner",
    defaultSets: 4,
    defaultReps: "10 - 12",
    primaryMuscle: "Latissimus Dorsi",
    secondaryMuscles: ["Biceps Brachii", "Teres Major", "Rhomboids"],
    instructions: [
      "Slight backward arch in thoracic spine.",
      "Initiate pull by depressing the scapulae downward.",
      "Drive elbows towards your back pockets.",
    ],
    tempo: "3-0-1-1",
    restSeconds: 75,
    burnRateKcalMin: 8.5,
  },
  {
    id: "ex_6_1",
    name: "Barbell Bent-Over Row",
    category: "Back",
    equipment: "Barbell, Weight Plates",
    difficulty: "Advanced",
    defaultSets: 4,
    defaultReps: "8 - 10",
    primaryMuscle: "Mid-Back & Rhomboids",
    secondaryMuscles: ["Lats", "Erector Spinae", "Biceps"],
    instructions: [
      "Hinge at 45 degrees with flat spine and braced core.",
      "Pull barbell into upper abdomen driving elbows behind torso.",
      "Lower under control without rounding back.",
    ],
    tempo: "2-1-1-0",
    restSeconds: 90,
    burnRateKcalMin: 11.0,
  },
  {
    id: "ex_6_2",
    name: "Seated Cable Row (Close Grip)",
    category: "Back",
    equipment: "Low Cable Row Machine, V-Handle",
    difficulty: "Beginner",
    defaultSets: 3,
    defaultReps: "10 - 12",
    primaryMuscle: "Mid Trapezius & Lats",
    secondaryMuscles: ["Rhomboids", "Biceps"],
    instructions: [
      "Sit upright with slight knee bend and upright chest.",
      "Pull handle to navel pinching shoulder blades tightly.",
      "Resist forward stretch under eccentric tension.",
    ],
    tempo: "2-1-1-1",
    restSeconds: 75,
    burnRateKcalMin: 8.0,
  },
  {
    id: "ex_6_3",
    name: "Weighted Pull-Ups",
    category: "Back",
    equipment: "Pull-Up Bar, Dip Belt",
    difficulty: "Advanced",
    defaultSets: 3,
    defaultReps: "6 - 8",
    primaryMuscle: "Latissimus Dorsi",
    secondaryMuscles: ["Biceps", "Forearms", "Core"],
    instructions: [
      "Overhand grip just outside shoulder width.",
      "Pull chin completely over the bar.",
      "Lower to a full dead hang stretch.",
    ],
    tempo: "3-0-1-0",
    restSeconds: 120,
    burnRateKcalMin: 11.5,
  },
  {
    id: "ex_6_4",
    name: "Single-Arm Dumbbell Row",
    category: "Back",
    equipment: "Flat Bench, Dumbbell",
    difficulty: "Intermediate",
    defaultSets: 3,
    defaultReps: "10 - 12 per side",
    primaryMuscle: "Latissimus Dorsi",
    secondaryMuscles: ["Rhomboids", "Posterior Deltoid"],
    instructions: [
      "Place one knee and hand on flat bench.",
      "Pull dumbbell towards hip keeping elbow close to torso.",
      "Lower to full scapular protraction stretch.",
    ],
    tempo: "2-1-1-0",
    restSeconds: 60,
    burnRateKcalMin: 8.5,
  },
  {
    id: "ex_6_5",
    name: "Standing Straight-Arm Lat Pushdown",
    category: "Back",
    equipment: "High Cable Station, Straight Bar",
    difficulty: "Beginner",
    defaultSets: 3,
    defaultReps: "12 - 15",
    primaryMuscle: "Latissimus Dorsi Isolation",
    secondaryMuscles: ["Teres Major", "Triceps Long Head"],
    instructions: [
      "Keep arms almost straight with soft elbow bend.",
      "Hinge slightly at hips and sweep bar down to thighs.",
      "Squeeze lats hard at bottom contraction.",
    ],
    tempo: "2-1-1-1",
    restSeconds: 60,
    burnRateKcalMin: 7.2,
  },

  // LEGS
  {
    id: "ex_5",
    name: "Barbell Romanian Deadlift (RDL)",
    category: "Legs",
    equipment: "Barbell, Lifting Straps",
    difficulty: "Advanced",
    defaultSets: 4,
    defaultReps: "8 - 10",
    primaryMuscle: "Hamstrings & Gluteus Maximus",
    secondaryMuscles: ["Erector Spinae", "Lats"],
    instructions: [
      "Hinge at the hips keeping shins vertical.",
      "Push hips back until a deep hamstring stretch is reached below knee.",
      "Drive hips forward through heels to lock out.",
    ],
    tempo: "3-1-1-0",
    restSeconds: 120,
    burnRateKcalMin: 12.0,
  },
  {
    id: "ex_5_1",
    name: "Barbell Back Squat",
    category: "Legs",
    equipment: "Squat Rack, Olympic Barbell",
    difficulty: "Advanced",
    defaultSets: 4,
    defaultReps: "6 - 8",
    primaryMuscle: "Quadriceps & Gluteus Maximus",
    secondaryMuscles: ["Hamstrings", "Adductors", "Core"],
    instructions: [
      "Rest bar across upper traps and brace abdominal wall.",
      "Break at hips and knees simultaneously to sit between heels.",
      "Hit parallel or deeper with stable upright chest.",
      "Drive aggressively out of the hole through midfoot.",
    ],
    tempo: "3-1-1-0",
    restSeconds: 150,
    burnRateKcalMin: 13.0,
  },
  {
    id: "ex_7",
    name: "Bulgarian Split Squat",
    category: "Legs",
    equipment: "Dumbbells, Bench",
    difficulty: "Advanced",
    defaultSets: 3,
    defaultReps: "10 per leg",
    primaryMuscle: "Quadriceps & Gluteus Medius",
    secondaryMuscles: ["Hamstrings", "Adductors"],
    instructions: [
      "Elevate rear foot on bench with laces down.",
      "Descend until rear knee touches ground gently.",
      "Drive through front heel while maintaining upright posture.",
    ],
    tempo: "3-1-1-0",
    restSeconds: 90,
    burnRateKcalMin: 11.5,
  },
  {
    id: "ex_5_2",
    name: "Leg Press (45 Degree)",
    category: "Legs",
    equipment: "Incline Leg Press Machine",
    difficulty: "Beginner",
    defaultSets: 4,
    defaultReps: "10 - 12",
    primaryMuscle: "Quadriceps & Glutes",
    secondaryMuscles: ["Hamstrings", "Calves"],
    instructions: [
      "Feet shoulder width on platform center.",
      "Lower sled until knees reach 90 degree flexion.",
      "Press through full foot avoiding knee hyperextension.",
    ],
    tempo: "3-0-1-0",
    restSeconds: 90,
    burnRateKcalMin: 10.0,
  },
  {
    id: "ex_5_3",
    name: "Barbell Hip Thrust",
    category: "Legs",
    equipment: "Barbell, Hip Thrust Pad, Bench",
    difficulty: "Intermediate",
    defaultSets: 4,
    defaultReps: "10 - 12",
    primaryMuscle: "Gluteus Maximus",
    secondaryMuscles: ["Hamstrings", "Adductors"],
    instructions: [
      "Upper back supported on bench, bar positioned across hip crease.",
      "Drive hips up until torso and thighs form a straight horizontal line.",
      "Squeeze glutes forcefully for 2 seconds at the peak.",
    ],
    tempo: "2-2-1-0",
    restSeconds: 90,
    burnRateKcalMin: 10.5,
  },
  {
    id: "ex_5_4",
    name: "Lying Hamstring Leg Curl",
    category: "Legs",
    equipment: "Prone Leg Curl Machine",
    difficulty: "Beginner",
    defaultSets: 3,
    defaultReps: "12 - 15",
    primaryMuscle: "Hamstring Biceps Femoris",
    secondaryMuscles: ["Calves (Gastrocnemius)"],
    instructions: [
      "Lie prone with pad positioned against lower Achilles.",
      "Curl heels up towards glutes while keeping hips pinned down.",
      "Resist back down with a 3-second negative.",
    ],
    tempo: "3-0-1-1",
    restSeconds: 60,
    burnRateKcalMin: 7.5,
  },
  {
    id: "ex_5_5",
    name: "Standing Dumbbell Calf Raise",
    category: "Legs",
    equipment: "Dumbbells, Calf Block",
    difficulty: "Beginner",
    defaultSets: 4,
    defaultReps: "15 - 20",
    primaryMuscle: "Gastrocnemius & Soleus",
    secondaryMuscles: ["Tibialis Posterior"],
    instructions: [
      "Balls of feet on elevated block, deep stretch at bottom.",
      "Explode up onto big toes and pause for 2 seconds.",
    ],
    tempo: "2-2-1-0",
    restSeconds: 45,
    burnRateKcalMin: 6.0,
  },

  // ARMS
  {
    id: "ex_4",
    name: "Triceps Dual Rope Pushdown",
    category: "Arms",
    equipment: "Cable Machine, Double Rope",
    difficulty: "Beginner",
    defaultSets: 3,
    defaultReps: "12 - 15",
    primaryMuscle: "Triceps Lateral & Medial Heads",
    secondaryMuscles: ["Forearms"],
    instructions: [
      "Pin elbows against your ribcage.",
      "Flake ropes apart at maximum extension to maximize peak contraction.",
      "Control the return without letting elbows flare forward.",
    ],
    tempo: "2-0-1-1",
    restSeconds: 60,
    burnRateKcalMin: 6.5,
  },
  {
    id: "ex_4_1",
    name: "Standing Barbell Bicep Curl",
    category: "Arms",
    equipment: "Straight Olympic Barbell",
    difficulty: "Intermediate",
    defaultSets: 3,
    defaultReps: "8 - 10",
    primaryMuscle: "Biceps Brachii (Short & Long Heads)",
    secondaryMuscles: ["Brachialis", "Forearms"],
    instructions: [
      "Shoulder width supinated grip.",
      "Curl bar keeping elbows pinned at hips without swaying torso.",
      "Squeeze biceps hard at top contraction.",
    ],
    tempo: "2-1-1-0",
    restSeconds: 75,
    burnRateKcalMin: 7.5,
  },
  {
    id: "ex_4_2",
    name: "Incline Dumbbell Bicep Curl",
    category: "Arms",
    equipment: "Incline Bench, Dumbbells",
    difficulty: "Intermediate",
    defaultSets: 3,
    defaultReps: "10 - 12",
    primaryMuscle: "Biceps Long Head (Stretch Bias)",
    secondaryMuscles: ["Brachioradialis"],
    instructions: [
      "Set bench to 45 degrees, let arms hang directly down.",
      "Curl dumbbells supinating wrists as you ascend.",
      "Full stretch at the bottom without shifting shoulders.",
    ],
    tempo: "3-0-1-1",
    restSeconds: 60,
    burnRateKcalMin: 7.0,
  },
  {
    id: "ex_4_3",
    name: "EZ-Bar Skull Crushers (Lying Triceps Ext)",
    category: "Arms",
    equipment: "Flat Bench, EZ-Bar",
    difficulty: "Intermediate",
    defaultSets: 3,
    defaultReps: "10 - 12",
    primaryMuscle: "Triceps Long & Medial Heads",
    secondaryMuscles: ["Anconeus"],
    instructions: [
      "Lie on bench holding EZ-Bar with elbows pointed slightly backward.",
      "Hinge at elbows lowering bar towards crown of head.",
      "Extend arms back to starting angle without flaring elbows.",
    ],
    tempo: "3-1-1-0",
    restSeconds: 75,
    burnRateKcalMin: 7.8,
  },
  {
    id: "ex_4_4",
    name: "Cross-Body Hammer Curls",
    category: "Arms",
    equipment: "Dumbbells",
    difficulty: "Beginner",
    defaultSets: 3,
    defaultReps: "12 - 15",
    primaryMuscle: "Brachialis & Brachioradialis",
    secondaryMuscles: ["Biceps Brachii"],
    instructions: [
      "Neutral grip with thumbs pointing up.",
      "Curl dumbbell diagonally across torso towards opposite clavicle.",
      "Control descent completely.",
    ],
    tempo: "2-0-1-0",
    restSeconds: 60,
    burnRateKcalMin: 6.8,
  },

  // CORE
  {
    id: "ex_8",
    name: "Hanging Leg Raise to Parallel",
    category: "Core",
    equipment: "Pull-Up Bar",
    difficulty: "Intermediate",
    defaultSets: 3,
    defaultReps: "12 - 15",
    primaryMuscle: "Rectus Abdominis",
    secondaryMuscles: ["Hip Flexors", "Obliques"],
    instructions: [
      "Engage lats to avoid swinging.",
      "Posteriorly tilt pelvis before lifting legs.",
      "Raise legs smoothly to parallel, pause and lower under control.",
    ],
    tempo: "2-1-1-0",
    restSeconds: 60,
    burnRateKcalMin: 7.0,
  },
  {
    id: "ex_8_1",
    name: "Ab Wheel Rollout",
    category: "Core",
    equipment: "Ab Wheel, Knee Mat",
    difficulty: "Advanced",
    defaultSets: 3,
    defaultReps: "10 - 12",
    primaryMuscle: "Deep Core & Anterior Rectus",
    secondaryMuscles: ["Lats", "Serratus Anterior"],
    instructions: [
      "Kneel on mat with wheel directly beneath shoulders.",
      "Roll forward maintaining posterior pelvic tilt and rounded upper back.",
      "Pull back using abdominal flexion.",
    ],
    tempo: "3-1-1-0",
    restSeconds: 75,
    burnRateKcalMin: 8.5,
  },
  {
    id: "ex_8_2",
    name: "Cable Woodchoppers (High-to-Low)",
    category: "Core",
    equipment: "Cable Machine, Single Handle",
    difficulty: "Intermediate",
    defaultSets: 3,
    defaultReps: "12 - 15 per side",
    primaryMuscle: "Internal & External Obliques",
    secondaryMuscles: ["Transverse Abdominis"],
    instructions: [
      "Set cable to high position, grasp handle with both hands.",
      "Rotate torso downward diagonally across opposite knee.",
      "Control rotational return.",
    ],
    tempo: "2-1-1-0",
    restSeconds: 60,
    burnRateKcalMin: 7.5,
  },
  {
    id: "ex_8_3",
    name: "Weighted Front Plank",
    category: "Core",
    equipment: "Floor Mat, Weight Plate",
    difficulty: "Intermediate",
    defaultSets: 3,
    defaultReps: "45 - 60s",
    primaryMuscle: "Transverse Abdominis & Rectus",
    secondaryMuscles: ["Glutes", "Shoulders"],
    instructions: [
      "Elbows directly under shoulders, body in a rigid straight plank line.",
      "Squeeze glutes, quads, and abdominal wall maximally.",
    ],
    tempo: "Isometric",
    restSeconds: 60,
    burnRateKcalMin: 6.5,
  },

  // CARDIO
  {
    id: "ex_9_1",
    name: "Zone 2 Assault AirBike",
    category: "Cardio",
    equipment: "Assault AirBike",
    difficulty: "Intermediate",
    defaultSets: 1,
    defaultReps: "20 - 30 min",
    primaryMuscle: "Cardiorespiratory System",
    secondaryMuscles: ["Quads", "Shoulders"],
    instructions: [
      "Maintain consistent RPM targeting 65-75% max heart rate.",
      "Equal effort between push-pull arms and leg pedal cadence.",
    ],
    tempo: "Steady State",
    restSeconds: 0,
    burnRateKcalMin: 14.0,
  },
  {
    id: "ex_9_2",
    name: "Concept2 Rower Intervals",
    category: "Cardio",
    equipment: "Concept2 Rower",
    difficulty: "Advanced",
    defaultSets: 5,
    defaultReps: "500m Sprint",
    primaryMuscle: "Full Body Posterior & Cardiovascular",
    secondaryMuscles: ["Lats", "Hamstrings", "Quads"],
    instructions: [
      "Drive through legs first, swing hips back, pull handle to lower sternum.",
      "Recover arms first, hips hinge, knees bend.",
    ],
    tempo: "Sprint Interval",
    restSeconds: 90,
    burnRateKcalMin: 16.5,
  },
];

export const WORKOUT_ROUTINES: WorkoutRoutine[] = [
  {
    id: "routine_1",
    title: "Hypertrophy Push Block A",
    subtitle: "Upper Body High Intensity • Chest & Shoulders Focus",
    category: "Hypertrophy",
    durationMinutes: 48,
    estimatedBurnKcal: 440,
    intensity: "Peak Performance",
    targetMuscles: ["Upper Chest", "Anterior Delts", "Lateral Delts", "Triceps"],
    exercises: [
      {
        exerciseId: "ex_1",
        name: "Incline Dumbbell Bench Press",
        targetSets: 4,
        targetReps: "8 - 10",
        restSeconds: 90,
        sets: [
          { setNumber: 1, weightKg: 32, reps: 10, completed: true, rpe: 8 },
          { setNumber: 2, weightKg: 34, reps: 9, completed: true, rpe: 8.5 },
          { setNumber: 3, weightKg: 36, reps: 8, completed: false, rpe: 9 },
          { setNumber: 4, weightKg: 36, reps: 8, completed: false, rpe: 9.5 },
        ],
      },
      {
        exerciseId: "ex_2",
        name: "Barbell Overhead Press (OHP)",
        targetSets: 3,
        targetReps: "6 - 8",
        restSeconds: 120,
        sets: [
          { setNumber: 1, weightKg: 60, reps: 8, completed: false },
          { setNumber: 2, weightKg: 62.5, reps: 7, completed: false },
          { setNumber: 3, weightKg: 65, reps: 6, completed: false },
        ],
      },
      {
        exerciseId: "ex_3",
        name: "Dual Cable Lateral Raise",
        targetSets: 4,
        targetReps: "12 - 15",
        restSeconds: 60,
        sets: [
          { setNumber: 1, weightKg: 9, reps: 15, completed: false },
          { setNumber: 2, weightKg: 11, reps: 13, completed: false },
          { setNumber: 3, weightKg: 11, reps: 12, completed: false },
          { setNumber: 4, weightKg: 11, reps: 12, completed: false },
        ],
      },
      {
        exerciseId: "ex_4",
        name: "Triceps Dual Rope Pushdown",
        targetSets: 3,
        targetReps: "12 - 15",
        restSeconds: 60,
        sets: [
          { setNumber: 1, weightKg: 25, reps: 15, completed: false },
          { setNumber: 2, weightKg: 27.5, reps: 14, completed: false },
          { setNumber: 3, weightKg: 30, reps: 12, completed: false },
        ],
      },
    ],
  },
  {
    id: "routine_2",
    title: "Posterior Chain & Lats Overload",
    subtitle: "Pull Day • Vertical Pulls & Hamstring Bias",
    category: "Strength",
    durationMinutes: 52,
    estimatedBurnKcal: 480,
    intensity: "High",
    targetMuscles: ["Lats", "Rhomboids", "Hamstrings", "Biceps"],
    exercises: [
      {
        exerciseId: "ex_6",
        name: "Neutral Grip Lat Pulldown",
        targetSets: 4,
        targetReps: "10 - 12",
        restSeconds: 75,
        sets: [
          { setNumber: 1, weightKg: 70, reps: 12, completed: false },
          { setNumber: 2, weightKg: 75, reps: 10, completed: false },
          { setNumber: 3, weightKg: 80, reps: 10, completed: false },
          { setNumber: 4, weightKg: 80, reps: 8, completed: false },
        ],
      },
      {
        exerciseId: "ex_5",
        name: "Barbell Romanian Deadlift (RDL)",
        targetSets: 4,
        targetReps: "8 - 10",
        restSeconds: 120,
        sets: [
          { setNumber: 1, weightKg: 110, reps: 10, completed: false },
          { setNumber: 2, weightKg: 120, reps: 8, completed: false },
          { setNumber: 3, weightKg: 130, reps: 8, completed: false },
          { setNumber: 4, weightKg: 130, reps: 7, completed: false },
        ],
      },
    ],
  },
  {
    id: "routine_3",
    title: "Metabolic VO2 Max Conditioning",
    subtitle: "Aerobic Threshold & Core Stability",
    category: "Cardio & Core",
    durationMinutes: 35,
    estimatedBurnKcal: 380,
    intensity: "Peak Performance",
    targetMuscles: ["Cardiovascular System", "Rectus Abdominis", "Obliques"],
    exercises: [
      {
        exerciseId: "ex_8",
        name: "Hanging Leg Raise to Parallel",
        targetSets: 3,
        targetReps: "15",
        restSeconds: 45,
        sets: [
          { setNumber: 1, weightKg: 0, reps: 15, completed: false },
          { setNumber: 2, weightKg: 0, reps: 15, completed: false },
          { setNumber: 3, weightKg: 0, reps: 12, completed: false },
        ],
      },
    ],
  },
];

export const INITIAL_MEALS: MealItem[] = [
  {
    id: "meal_1",
    name: "Organic Pastured Eggs & Sourdough Avocado Toast",
    mealType: "Breakfast",
    calories: 580,
    protein: 38,
    carbs: 46,
    fats: 24,
    time: "08:15 AM",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500&auto=format&fit=crop&q=80",
    ingredients: ["3 Pasture-Raised Eggs", "2 Slices Artisan Sourdough", "60g Hass Avocado", "Microgreens", "EVOO"],
  },
  {
    id: "meal_2",
    name: "Wild Salmon Bowl with Quinoa & Steamed Broccoli",
    mealType: "Lunch",
    calories: 740,
    protein: 56,
    carbs: 68,
    fats: 22,
    time: "01:30 PM",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80",
    ingredients: ["200g Atlantic Salmon", "150g Cooked Quinoa", "120g Broccoli Florets", "Tahini-Lemon Dressing"],
  },
  {
    id: "meal_3",
    name: "Hydrolyzed Whey Protein & Blueberry Super-Smoothie",
    mealType: "Snack",
    calories: 320,
    protein: 34,
    carbs: 36,
    fats: 4,
    time: "04:45 PM",
    image: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=500&auto=format&fit=crop&q=80",
    ingredients: ["1 Scoop Iso-Whey", "100g Wild Blueberries", "250ml Unsweetened Almond Milk", "5g Creatine Monohydrate"],
  },
  {
    id: "meal_4",
    name: "Grass-Fed Flank Steak with Roasted Sweet Potato",
    mealType: "Dinner",
    calories: 640,
    protein: 52,
    carbs: 58,
    fats: 18,
    time: "08:00 PM",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=80",
    ingredients: ["220g Grass-Fed Flank Steak", "200g Roasted Sweet Potato Wedges", "Grilled Asparagus Spears"],
  },
];

export const CONNECTED_DEVICES: DeviceTelemetry[] = [
  {
    id: "dev_1",
    name: "Apple Watch Ultra 2",
    type: "watch",
    brand: "Apple",
    batteryLevel: 86,
    connected: true,
    lastSync: "Just now",
    liveSignal: true,
  },
  {
    id: "dev_2",
    name: "Whoop 4.0 Strap",
    type: "strap",
    brand: "Whoop",
    batteryLevel: 94,
    connected: true,
    lastSync: "2 mins ago",
    liveSignal: true,
  },
  {
    id: "dev_3",
    name: "Oura Ring Horizon Gen 3",
    type: "ring",
    brand: "Oura",
    batteryLevel: 62,
    connected: true,
    lastSync: "Today, 06:30 AM",
    liveSignal: false,
  },
  {
    id: "dev_4",
    name: "Withings Body Scan Smart Scale",
    type: "scale",
    brand: "Withings",
    batteryLevel: 78,
    connected: false,
    lastSync: "Today, 07:15 AM",
    liveSignal: false,
  },
];

export const INITIAL_AI_CHAT: AIChatMessage[] = [
  {
    id: "msg_1",
    sender: "ai",
    timestamp: "07:30 AM",
    text: "Good morning Alex. Your overnight biometrics show high recovery readiness (91%). HRV rebounded +14ms and resting heart rate dropped to 51 bpm.",
    widgetType: "muscle_recovery",
    widgetData: {
      readiness: 91,
      chestReady: 92,
      shouldersReady: 60,
      legsReady: 85,
      recommendation: "Optimal window for Upper Body Push Volume today.",
    },
  },
  {
    id: "msg_2",
    sender: "user",
    timestamp: "07:32 AM",
    text: "Should I push for a new PR on the Incline Dumbbell Bench today or stay in the hypertrophy rep range?",
  },
  {
    id: "msg_3",
    sender: "ai",
    timestamp: "07:33 AM",
    text: "I recommend staying in the 8-10 rep hypertrophy range with 34-36kg per dumbbell. Your anterior deltoids still show residual fatigue (40% recovery load from Tuesday's OHP), so submaximal high-tension sets will optimize growth with zero rotator cuff strain.",
    widgetType: "workout_plan",
    widgetData: {
      exercise: "Incline DB Press",
      suggestedLoad: "34kg × 4 sets",
      targetRPE: "8.5",
      tempoCue: "3s eccentric drop for maximal micro-damage",
    },
  },
];

export const MUSCLE_HEATMAP = [
  { muscle: "Upper Chest", readiness: 92, status: "Peak Recovery", color: "#00F0FF" },
  { muscle: "Lower Chest", readiness: 90, status: "Peak Recovery", color: "#00F0FF" },
  { muscle: "Lateral Deltoids", readiness: 62, status: "Recovering", color: "#FFB300" },
  { muscle: "Anterior Deltoids", readiness: 58, status: "Fatigued", color: "#FF385C" },
  { muscle: "Triceps Brachii", readiness: 74, status: "Good", color: "#00E676" },
  { muscle: "Lats & Mid-Back", readiness: 42, status: "High Fatigue", color: "#FF385C" },
  { muscle: "Quadriceps", readiness: 88, status: "Peak Recovery", color: "#00F0FF" },
  { muscle: "Hamstrings", readiness: 85, status: "Peak Recovery", color: "#00F0FF" },
  { muscle: "Core & Obliques", readiness: 94, status: "Ready", color: "#00F0FF" },
];

export const INITIAL_WORKOUT_HISTORY: CompletedWorkoutLog[] = [
  {
    id: "hist_001",
    title: "Chest & Triceps Hyper-Tension Split",
    subtitle: "Heavy Barbell & Mechanical Fly Protocol",
    category: "Hypertrophy",
    completedAt: "Yesterday, 10:45 AM",
    durationMinutes: 48,
    caloriesBurned: 420,
    totalVolumeKg: 6840,
    strainScore: 15.2,
    exercises: [
      {
        name: "Barbell Bench Press",
        completedSets: 4,
        totalSets: 4,
        sets: [
          { setNumber: 1, weightKg: 80, reps: 10, completed: true },
          { setNumber: 2, weightKg: 85, reps: 8, completed: true },
          { setNumber: 3, weightKg: 90, reps: 6, completed: true },
          { setNumber: 4, weightKg: 95, reps: 4, completed: true },
        ],
      },
      {
        name: "Incline Dumbbell Press",
        completedSets: 3,
        totalSets: 3,
        sets: [
          { setNumber: 1, weightKg: 32, reps: 10, completed: true },
          { setNumber: 2, weightKg: 34, reps: 8, completed: true },
          { setNumber: 3, weightKg: 36, reps: 8, completed: true },
        ],
      },
      {
        name: "Weighted Chest Dips",
        completedSets: 3,
        totalSets: 3,
        sets: [
          { setNumber: 1, weightKg: 15, reps: 12, completed: true },
          { setNumber: 2, weightKg: 20, reps: 10, completed: true },
          { setNumber: 3, weightKg: 20, reps: 8, completed: true },
        ],
      },
    ],
  },
  {
    id: "hist_002",
    title: "Posterior Chain & Lumbar Density",
    subtitle: "Deadlifts, RDLs & Hamstring Isolation",
    category: "Strength",
    completedAt: "3 Days ago, 06:15 PM",
    durationMinutes: 55,
    caloriesBurned: 490,
    totalVolumeKg: 9250,
    strainScore: 17.1,
    exercises: [
      {
        name: "Conventional Deadlift",
        completedSets: 4,
        totalSets: 4,
        sets: [
          { setNumber: 1, weightKg: 140, reps: 6, completed: true },
          { setNumber: 2, weightKg: 150, reps: 5, completed: true },
          { setNumber: 3, weightKg: 160, reps: 3, completed: true },
          { setNumber: 4, weightKg: 170, reps: 2, completed: true },
        ],
      },
      {
        name: "Romanian Deadlift",
        completedSets: 3,
        totalSets: 3,
        sets: [
          { setNumber: 1, weightKg: 100, reps: 8, completed: true },
          { setNumber: 2, weightKg: 100, reps: 8, completed: true },
          { setNumber: 3, weightKg: 105, reps: 6, completed: true },
        ],
      },
    ],
  },
  {
    id: "hist_003",
    title: "Upper Pull & Rotator Stability Split",
    subtitle: "Lat Pulldowns, Heavy Rows & Face Pulls",
    category: "Hypertrophy",
    completedAt: "5 Days ago, 07:30 AM",
    durationMinutes: 42,
    caloriesBurned: 360,
    totalVolumeKg: 5400,
    strainScore: 13.8,
    exercises: [
      {
        name: "Barbell Row",
        completedSets: 4,
        totalSets: 4,
        sets: [
          { setNumber: 1, weightKg: 70, reps: 10, completed: true },
          { setNumber: 2, weightKg: 75, reps: 8, completed: true },
          { setNumber: 3, weightKg: 80, reps: 8, completed: true },
          { setNumber: 4, weightKg: 80, reps: 6, completed: true },
        ],
      },
      {
        name: "Lat Pulldown",
        completedSets: 3,
        totalSets: 3,
        sets: [
          { setNumber: 1, weightKg: 65, reps: 12, completed: true },
          { setNumber: 2, weightKg: 70, reps: 10, completed: true },
          { setNumber: 3, weightKg: 75, reps: 8, completed: true },
        ],
      },
    ],
  },
];
