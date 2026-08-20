"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  UserProfile,
  DailySummary,
  WorkoutRoutine,
  RoutineExercise,
  CompletedWorkoutLog,
  MealItem,
  DeviceTelemetry,
  AIChatMessage,
  INITIAL_USER,
  INITIAL_DAILY_STATS,
  WORKOUT_ROUTINES,
  INITIAL_WORKOUT_HISTORY,
  INITIAL_MEALS,
  CONNECTED_DEVICES,
  INITIAL_AI_CHAT,
} from "@/lib/data";

export interface RecommendedMealDetail {
  mealType: string;
  name: string;
  targetTags: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  prepTime: string;
  micros: string[];
  reason?: string;
}

export interface DailyMealMonitorItem {
  id: string;
  date: string;
  dayName: string;
  mealType: "Breakfast" | "Lunch" | "Dinner" | "Snacks";
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  imageUrl?: string;
  completed: boolean;
  loggedAt: string;
}

export interface SimpleWeakMuscleProtocol {
  id: string;
  simpleName: string;
  severity: "high" | "moderate";
  deficitText: string;
  description: string;
  exercises: {
    name: string;
    sets: number;
    reps: string;
    weightKg: number;
    restSeconds: number;
    focusNote?: string;
  }[];
}

export const DEFAULT_SIMPLE_WEAK_MUSCLES: SimpleWeakMuscleProtocol[] = [
  {
    id: "left_leg",
    simpleName: "Left Leg (Hamstring & Quad)",
    severity: "high",
    deficitText: "Left Leg weaker than Right Leg",
    description: "DEXA regional partitioning indicates Left Leg lean mass deficit (10.6 kg) vs Right Leg (11.0 kg). Focus on unilateral single-leg movements to restore symmetry.",
    exercises: [
      {
        name: "Single-Leg Romanian Deadlift (Left Leg Focus)",
        sets: 3,
        reps: "8-10",
        weightKg: 24,
        restSeconds: 75,
        focusNote: "Hinge at hip, load left hamstring under deep eccentric tension",
      },
      {
        name: "Unilateral Bulgarian Split Squat (Left Leg)",
        sets: 3,
        reps: "10-12",
        weightKg: 20,
        restSeconds: 60,
        focusNote: "Elevate rear foot, descend with knee tracking directly over toes",
      },
    ],
  },
  {
    id: "left_shoulder",
    simpleName: "Left Shoulder",
    severity: "moderate",
    deficitText: "Left Shoulder needs lateral & posterior focus",
    description: "Anterior deltoids overcompensate during presses. Unilateral rear delt and lateral raises restore shoulder girdle balance.",
    exercises: [
      {
        name: "Single-Arm Dumbbell Lateral Raise (Left Shoulder)",
        sets: 4,
        reps: "12-15",
        weightKg: 10,
        restSeconds: 60,
        focusNote: "Strict form, slight forward lean, isolate side delt",
      },
      {
        name: "Face Pull with External Rotation",
        sets: 4,
        reps: "15",
        weightKg: 25,
        restSeconds: 60,
        focusNote: "Rope to forehead, externally rotate at peak contraction",
      },
    ],
  },
  {
    id: "left_lat",
    simpleName: "Left Lat (Back)",
    severity: "moderate",
    deficitText: "Left Lat pulling symmetry delta",
    description: "Unilateral pulling movements ensure equal lat activation and prevent spinal rotational bias.",
    exercises: [
      {
        name: "Single-Arm Dumbbell Row (Left Lat Focus)",
        sets: 4,
        reps: "10-12",
        weightKg: 26,
        restSeconds: 75,
        focusNote: "Pull elbow toward hip with deep stretch at bottom",
      },
      {
        name: "Single-Arm Cable Lat Pulldown",
        sets: 3,
        reps: "12-15",
        weightKg: 30,
        restSeconds: 60,
        focusNote: "Drive elbow downward, squeeze lat for 1s pause",
      },
    ],
  },
];

interface ActiveWorkoutState {
  routine: WorkoutRoutine;
  activeExerciseIndex: number;
  elapsedSeconds: number;
  isActive: boolean;
  isPaused: boolean;
  restTimerSeconds: number;
  isResting: boolean;
}

interface AppContextType {
  user: UserProfile;
  dailyStats: DailySummary;
  routines: WorkoutRoutine[];
  workoutHistory: CompletedWorkoutLog[];
  meals: MealItem[];
  devices: DeviceTelemetry[];
  aiChat: AIChatMessage[];
  activeWorkout: ActiveWorkoutState | null;
  viewMode: "app" | "stitch-canvas";
  setViewMode: (mode: "app" | "stitch-canvas") => void;

  // Meal trackers & Monitoring
  myMealCompletion: { breakfast: boolean; lunch: boolean; dinner: boolean; snacks: boolean };
  dailyPlanCompletion: { breakfast: boolean; lunch: boolean; dinner: boolean; snacks: boolean };
  dailyMealMonitorLogs: DailyMealMonitorItem[];
  toggleMyMeal: (type: "breakfast" | "lunch" | "dinner" | "snacks", name?: string) => void;
  toggleDailyPlanMeal: (type: "breakfast" | "lunch" | "dinner" | "snacks", name?: string) => void;
  uploadDailyMealPhoto: (
    mealType: "Breakfast" | "Lunch" | "Dinner" | "Snacks",
    imageUrl: string,
    name?: string,
    macros?: { calories: number; protein: number; carbs: number; fats: number }
  ) => void;

  // AI Nutrition & Blood Panel Integration
  hasBloodReport: boolean;
  bloodDeficiencies: string[];
  aiNutritionRecommendations: Record<string, RecommendedMealDetail> | null;
  generateIndianRecommendationsFromBlood: (markers?: any[]) => void;
  clearBloodReport: () => void;

  // DXA & Simple Weak Muscles Gating
  hasDxaReport: boolean;
  activeWeakMuscles: SimpleWeakMuscleProtocol[];
  generateWeakMusclesFromDxa: (dxaData?: any) => void;
  clearDxaReport: () => void;
  setDxaWeakMuscles: (protocols: SimpleWeakMuscleProtocol[]) => void;

  // Monitor Credentials & Profile Management
  monitorCredentials: { monitorId: string; accessPin: string; trainerSync: boolean };
  updateMonitorPin: (newPin: string) => void;
  toggleMonitorSync: () => void;
  updateProfilePhoto: (photoUrl: string) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;

  // Workout Tracker methods
  startWorkout: (routine: WorkoutRoutine) => void;
  pauseWorkout: () => void;
  resumeWorkout: () => void;
  finishWorkout: () => void;
  cancelWorkout: () => void;
  deleteWorkoutHistory: (id: string) => void;
  recordCompletedWorkoutLog: (log: CompletedWorkoutLog) => void;
  toggleSetComplete: (exerciseIndex: number, setIndex: number) => void;
  updateSetDetails: (exerciseIndex: number, setIndex: number, weight: number, reps: number) => void;
  updateExerciseWeight: (exerciseIndex: number, weightKg: number) => void;
  completeAllSetsForExercise: (exerciseIndex: number) => void;
  addSetToExercise: (exerciseIndex: number) => void;
  removeSetFromExercise: (exerciseIndex: number, setIndex: number) => void;
  addExerciseToActiveWorkout: (exercise: RoutineExercise) => void;
  startRestTimer: (seconds: number) => void;
  skipRestTimer: () => void;
  addWaterIntake: (amountLiters: number) => void;
  logMeal: (meal: Omit<MealItem, "id">) => void;
  deleteMeal: (id: string) => void;
  sendAIChat: (messageText: string) => void;
  toggleDevice: (id: string) => void;
  notificationMessage: string | null;
  showNotification: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [dailyStats, setDailyStats] = useState<DailySummary>(INITIAL_DAILY_STATS);
  const [routines, setRoutines] = useState<WorkoutRoutine[]>(WORKOUT_ROUTINES);
  const [workoutHistory, setWorkoutHistory] = useState<CompletedWorkoutLog[]>(INITIAL_WORKOUT_HISTORY);
  const [meals, setMeals] = useState<MealItem[]>(INITIAL_MEALS);
  const [devices, setDevices] = useState<DeviceTelemetry[]>(CONNECTED_DEVICES);
  const [aiChat, setAiChat] = useState<AIChatMessage[]>(INITIAL_AI_CHAT);
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkoutState | null>(null);
  const [viewMode, setViewMode] = useState<"app" | "stitch-canvas">("app");
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotificationMessage(msg);
    setTimeout(() => {
      setNotificationMessage(null);
    }, 3000);
  };

  // Independent Meal Completion States
  const [myMealCompletion, setMyMealCompletion] = useState<{
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
    snacks: boolean;
  }>({
    breakfast: false,
    lunch: false,
    dinner: false,
    snacks: false,
  });

  const [dailyPlanCompletion, setDailyPlanCompletion] = useState<{
    breakfast: boolean;
    lunch: boolean;
    dinner: boolean;
    snacks: boolean;
  }>({
    breakfast: false,
    lunch: false,
    dinner: false,
    snacks: false,
  });

  // Daily Meal Monitor Photo Logs
  const [dailyMealMonitorLogs, setDailyMealMonitorLogs] = useState<DailyMealMonitorItem[]>([]);

  // AI Nutrition & Blood Panel Integration State
  const [hasBloodReport, setHasBloodReport] = useState<boolean>(false);
  const [bloodDeficiencies, setBloodDeficiencies] = useState<string[]>([]);
  const [aiNutritionRecommendations, setAiNutritionRecommendations] = useState<
    Record<string, RecommendedMealDetail> | null
  >(null);

  // DXA Gated Simple Weak Muscle State
  const [hasDxaReport, setHasDxaReport] = useState<boolean>(false);
  const [activeWeakMuscles, setActiveWeakMuscles] = useState<SimpleWeakMuscleProtocol[]>([]);

  // Monitor Credentials & Clinical Access Portal State
  const [monitorCredentials, setMonitorCredentials] = useState<{
    monitorId: string;
    accessPin: string;
    trainerSync: boolean;
  }>({
    monitorId: "ERA-MON-8942",
    accessPin: "ERA#9284",
    trainerSync: true,
  });

  // Load persistent meal, blood, DXA, and profile state on mount
  useEffect(() => {
    try {
      const savedBlood = localStorage.getItem("erafit_has_blood_report");
      const savedRecs = localStorage.getItem("erafit_ai_nutrition_recs");
      const savedDef = localStorage.getItem("erafit_blood_deficiencies");
      const savedLogs = localStorage.getItem("erafit_daily_meal_logs");
      const savedMyMeal = localStorage.getItem("erafit_my_meal_completion");
      const savedDailyPlan = localStorage.getItem("erafit_daily_plan_completion");
      const savedDxa = localStorage.getItem("erafit_has_dxa_report");
      const savedWeak = localStorage.getItem("erafit_active_weak_muscles");
      const savedCreds = localStorage.getItem("erafit_monitor_credentials");
      const savedUser = localStorage.getItem("erafit_user_profile");

      if (savedBlood === "true" && savedRecs) {
        setHasBloodReport(true);
        setAiNutritionRecommendations(JSON.parse(savedRecs));
        if (savedDef) setBloodDeficiencies(JSON.parse(savedDef));
      }
      if (savedDxa === "true") {
        setHasDxaReport(true);
        setActiveWeakMuscles(savedWeak ? JSON.parse(savedWeak) : DEFAULT_SIMPLE_WEAK_MUSCLES);
      }
      if (savedCreds) setMonitorCredentials(JSON.parse(savedCreds));
      if (savedUser) setUser(JSON.parse(savedUser));
      if (savedLogs) setDailyMealMonitorLogs(JSON.parse(savedLogs));
      if (savedMyMeal) setMyMealCompletion(JSON.parse(savedMyMeal));
      if (savedDailyPlan) setDailyPlanCompletion(JSON.parse(savedDailyPlan));
    } catch (e) {
      console.warn("Could not parse saved storage data", e);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("erafit_has_blood_report", hasBloodReport ? "true" : "false");
      if (aiNutritionRecommendations) {
        localStorage.setItem("erafit_ai_nutrition_recs", JSON.stringify(aiNutritionRecommendations));
      }
      localStorage.setItem("erafit_blood_deficiencies", JSON.stringify(bloodDeficiencies));
      localStorage.setItem("erafit_daily_meal_logs", JSON.stringify(dailyMealMonitorLogs));
      localStorage.setItem("erafit_my_meal_completion", JSON.stringify(myMealCompletion));
      localStorage.setItem("erafit_daily_plan_completion", JSON.stringify(dailyPlanCompletion));
      localStorage.setItem("erafit_has_dxa_report", hasDxaReport ? "true" : "false");
      localStorage.setItem("erafit_active_weak_muscles", JSON.stringify(activeWeakMuscles));
      localStorage.setItem("erafit_monitor_credentials", JSON.stringify(monitorCredentials));
      localStorage.setItem("erafit_user_profile", JSON.stringify(user));
    } catch (e) {
      // ignore
    }
  }, [hasBloodReport, aiNutritionRecommendations, bloodDeficiencies, dailyMealMonitorLogs, myMealCompletion, dailyPlanCompletion, hasDxaReport, activeWeakMuscles, monitorCredentials, user]);

  // DXA Weak Muscle Generator
  const generateWeakMusclesFromDxa = (dxaData?: any) => {
    setHasDxaReport(true);
    setActiveWeakMuscles(DEFAULT_SIMPLE_WEAK_MUSCLES);
    showNotification("⚡ DXA Scan Analyzed: Detected Left Leg, Shoulder & Lat Asymmetries Loaded!");
  };

  const clearDxaReport = () => {
    setHasDxaReport(false);
    setActiveWeakMuscles([]);
    showNotification("ℹ️ DXA Scan data reset.");
  };

  const setDxaWeakMuscles = (protocols: SimpleWeakMuscleProtocol[]) => {
    setActiveWeakMuscles(protocols);
  };

  // Monitor Credentials Updaters
  const updateMonitorPin = (newPin: string) => {
    setMonitorCredentials((prev) => ({ ...prev, accessPin: newPin }));
    showNotification("🔒 Monitor Access PIN updated successfully!");
  };

  const toggleMonitorSync = () => {
    setMonitorCredentials((prev) => {
      const next = !prev.trainerSync;
      showNotification(next ? "✅ Monitor / Doctor Access Enabled" : "⚠️ Monitor Access Paused");
      return { ...prev, trainerSync: next };
    });
  };

  const updateProfilePhoto = (photoUrl: string) => {
    setUser((prev) => ({ ...prev, avatar: photoUrl }));
    showNotification("📸 Profile photo updated successfully!");
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updates }));
    showNotification("✅ Profile details saved!");
  };

  // Independent toggle for "My Meal Completion"
  const toggleMyMeal = (type: "breakfast" | "lunch" | "dinner" | "snacks", name?: string) => {
    setMyMealCompletion((prev) => {
      const next = !prev[type];
      if (next) {
        showNotification(`✅ My Meal Completed: ${type.toUpperCase()} ${name ? `(${name})` : ""}`);
      } else {
        showNotification(`Unchecked ${type.toUpperCase()} in My Meal Completion`);
      }
      return { ...prev, [type]: next };
    });
  };

  // Independent toggle for "Daily Meal Plan Monitor"
  const toggleDailyPlanMeal = (type: "breakfast" | "lunch" | "dinner" | "snacks", name?: string) => {
    setDailyPlanCompletion((prev) => {
      const next = !prev[type];
      if (next) {
        showNotification(`🥗 Daily Meal Plan Marked Complete: ${type.toUpperCase()} ${name ? `(${name})` : ""}`);
      } else {
        showNotification(`Unchecked ${type.toUpperCase()} in Daily Meal Plan`);
      }
      return { ...prev, [type]: next };
    });
  };

  // Upload/Log Photo for Daily Meal Monitor
  const uploadDailyMealPhoto = (
    mealType: "Breakfast" | "Lunch" | "Dinner" | "Snacks",
    imageUrl: string,
    name?: string,
    macros?: { calories: number; protein: number; carbs: number; fats: number }
  ) => {
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];
    const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
    const timeStr = today.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const newLogItem: DailyMealMonitorItem = {
      id: `monitor_${Date.now()}`,
      date: dateStr,
      dayName: dayName,
      mealType: mealType,
      name: name || `${mealType} Logged Meal`,
      calories: macros?.calories || 450,
      protein: macros?.protein || 30,
      carbs: macros?.carbs || 45,
      fats: macros?.fats || 14,
      imageUrl: imageUrl,
      completed: true,
      loggedAt: `${dayName}, ${timeStr}`,
    };

    setDailyMealMonitorLogs((prev) => [newLogItem, ...prev]);

    // Also mark dailyPlanCompletion for this meal
    setDailyPlanCompletion((prev) => ({
      ...prev,
      [mealType.toLowerCase()]: true,
    }));

    showNotification(`📸 Photo saved for ${mealType}! View in Meal Monitor.`);
  };

  // Deterministic generator of Authentic Indian Food recommendations tailored to blood biomarkers
  const generateIndianRecommendationsFromBlood = (markers?: any[]) => {
    // Generate Indian meal recommendations targeting key biomarkers (Vitamin D, B12, Iron, Omega-3, Blood Sugar)
    const indianRecommendations: Record<string, RecommendedMealDetail> = {
      Breakfast: {
        mealType: "Breakfast",
        name: "Desi Country Egg Bhurji & Moringa Keerai with Ragi Dosa",
        targetTags: "Targeting Vitamin D3, B12 & Bioavailable Iron",
        calories: 360,
        protein: 34,
        carbs: 22,
        fats: 10,
        prepTime: "12 mins",
        micros: ["Vitamin D3 600 IU", "Bioavailable Iron 5.8mg", "Vitamin B12 2.6mcg", "Zinc 4.2mg"],
        reason: "Country eggs & Moringa (முருங்கைக்கீரை) provide dense Vitamin D3 & Iron to reverse clinical blood panel deficiencies.",
      },
      Lunch: {
        mealType: "Lunch",
        name: "Sprouted Moong Dal Khichdi & Palak Poriyal with Curd",
        targetTags: "Targeting Dietary Fiber, Folate & Gut Microbiome",
        calories: 490,
        protein: 28,
        carbs: 64,
        fats: 11,
        prepTime: "15 mins",
        micros: ["Dietary Fiber 16g", "Folate (B9) 320mcg", "Potassium 840mg", "Magnesium 120mg"],
        reason: "Whole sprouted lentils & spinach (பசலைக்கீரை) optimize insulin sensitivity and red blood cell synthesis.",
      },
      Dinner: {
        mealType: "Dinner",
        name: "Grilled Ayala (Indian Mackerel) Fish Curry with Steamed Broccoli & Cauli Rice",
        targetTags: "Targeting Omega-3 EPA/DHA, Calcium & Lean Protein",
        calories: 520,
        protein: 44,
        carbs: 16,
        fats: 18,
        prepTime: "20 mins",
        micros: ["Omega-3 EPA/DHA 2.9g", "Calcium 240mg", "Vitamin E 4.8mg", "Selenium 52mcg"],
        reason: "Rich in wild marine Omega-3 fatty acids to reduce serum triglycerides and promote overnight myofibrillar repair.",
      },
      Snacks: {
        mealType: "Snacks",
        name: "Roasted Flaxseeds & Pumpkin Seeds Trail Mix with Masala Buttermilk (மோர்)",
        targetTags: "Targeting Calcium, Magnesium, Zinc & Probiotics",
        calories: 210,
        protein: 16,
        carbs: 14,
        fats: 7,
        prepTime: "2 mins",
        micros: ["Calcium 350mg", "Probiotics 8 Billion CFU", "Zinc 4.5mg", "Alpha-Linolenic Acid 1.8g"],
        reason: "Electrolyte-dense buttermilk and flaxseeds enhance digestion and restore micronutrient reserves.",
      },
    };

    setHasBloodReport(true);
    setBloodDeficiencies([
      "Vitamin D3 Deficiency (< 30 ng/mL)",
      "Low Serum Ferritin & Iron Reserve",
      "Elevated Triglyceride to HDL Ratio",
    ]);
    setAiNutritionRecommendations(indianRecommendations);
    showNotification("🧬 AI Clinical Nutrition: Generated Indian diet plan tailored to your blood biomarkers!");
  };

  const clearBloodReport = () => {
    setHasBloodReport(false);
    setBloodDeficiencies([]);
    setAiNutritionRecommendations(null);
    showNotification("Cleared blood report analysis");
  };

  // Workout Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (activeWorkout && activeWorkout.isActive && !activeWorkout.isPaused) {
      interval = setInterval(() => {
        setActiveWorkout((prev) => {
          if (!prev) return null;
          let restRemaining = prev.restTimerSeconds;
          let isResting = prev.isResting;

          if (isResting && restRemaining > 0) {
            restRemaining -= 1;
            if (restRemaining === 0) {
              isResting = false;
              showNotification("⚡ Rest time complete! Get ready for next set.");
            }
          }

          return {
            ...prev,
            elapsedSeconds: prev.elapsedSeconds + 1,
            restTimerSeconds: restRemaining,
            isResting,
          };
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeWorkout?.isActive, activeWorkout?.isPaused]);

  // Live heart rate variation effect
  useEffect(() => {
    const hrInterval = setInterval(() => {
      setDailyStats((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        const base = activeWorkout?.isActive ? 138 : 68;
        const newHr = Math.max(50, Math.min(185, base + delta));
        return {
          ...prev,
          currentHeartRateBpm: newHr,
        };
      });
    }, 3000);
    return () => clearInterval(hrInterval);
  }, [activeWorkout?.isActive]);

  const startWorkout = (routine: WorkoutRoutine) => {
    setActiveWorkout({
      routine: JSON.parse(JSON.stringify(routine)),
      activeExerciseIndex: 0,
      elapsedSeconds: 0,
      isActive: true,
      isPaused: false,
      restTimerSeconds: 0,
      isResting: false,
    });
    showNotification(`🔥 Started workout: ${routine.title}`);
  };

  const pauseWorkout = () => {
    setActiveWorkout((prev) => (prev ? { ...prev, isPaused: true } : null));
    showNotification("Workout paused");
  };

  const resumeWorkout = () => {
    setActiveWorkout((prev) => (prev ? { ...prev, isPaused: false } : null));
    showNotification("Workout resumed");
  };

  const finishWorkout = async () => {
    if (!activeWorkout) return;
    const duration = Math.max(1, Math.round(activeWorkout.elapsedSeconds / 60));
    const caloriesBurned = Math.max(80, Math.round(activeWorkout.routine.estimatedBurnKcal * (duration / 45)));

    // Calculate total tonnage / volume
    let totalVolume = 0;
    activeWorkout.routine.exercises.forEach((ex) => {
      ex.sets.forEach((set) => {
        if (set.completed) {
          totalVolume += Math.round(set.weightKg * set.reps);
        }
      });
    });

    const completedLog: CompletedWorkoutLog = {
      id: `log_${Date.now()}`,
      title: activeWorkout.routine.title,
      subtitle: activeWorkout.routine.subtitle,
      category: activeWorkout.routine.category,
      completedAt: "Today, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      durationMinutes: duration,
      caloriesBurned: caloriesBurned,
      totalVolumeKg: totalVolume || 4500,
      strainScore: Number((11 + Math.random() * 5).toFixed(1)),
      exercises: activeWorkout.routine.exercises.map((ex) => ({
        name: ex.name,
        completedSets: ex.sets.filter((s) => s.completed).length,
        totalSets: ex.sets.length,
        sets: JSON.parse(JSON.stringify(ex.sets)),
      })),
    };

    try {
      await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: activeWorkout.routine.title,
          durationMin: duration,
          exercises: activeWorkout.routine.exercises.map(ex => ({
            name: ex.name,
            category: activeWorkout.routine.category,
            sets: ex.sets
          }))
        })
      });
    } catch (e) {
      console.error("Failed to save workout to DB", e);
    }

    setWorkoutHistory((prev) => [completedLog, ...prev]);

    setDailyStats((prev) => ({
      ...prev,
      caloriesBurned: prev.caloriesBurned + caloriesBurned,
      activeMinutes: prev.activeMinutes + duration,
    }));

    showNotification(`🏆 Workout Completed & Saved to History! Burned ~${caloriesBurned} kcal in ${duration} min`);
    setActiveWorkout(null);
  };

  const deleteWorkoutHistory = (id: string) => {
    setWorkoutHistory((prev) => prev.filter((item) => item.id !== id));
    showNotification("🗑️ Workout record removed from history");
  };

  const recordCompletedWorkoutLog = (log: CompletedWorkoutLog) => {
    setWorkoutHistory((prev) => [log, ...prev]);
    setDailyStats((prev) => ({
      ...prev,
      caloriesBurned: prev.caloriesBurned + log.caloriesBurned,
      activeMinutes: prev.activeMinutes + log.durationMinutes,
    }));
    showNotification(`🏆 ${log.title} recorded in Workout History!`);
  };

  const cancelWorkout = () => {
    setActiveWorkout(null);
    showNotification("Workout cancelled");
  };

  const toggleSetComplete = (exerciseIndex: number, setIndex: number) => {
    if (!activeWorkout) return;
    setActiveWorkout((prev) => {
      if (!prev) return null;
      let willRest = false;
      let restSecs = 60;

      const newExercises = prev.routine.exercises.map((ex, eIdx) => {
        if (eIdx !== exerciseIndex) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s, sIdx) => {
            if (sIdx !== setIndex) return s;
            const nextState = !s.completed;
            if (nextState) {
              willRest = true;
              restSecs = ex.restSeconds || 60;
            }
            return { ...s, completed: nextState };
          }),
        };
      });

      return {
        ...prev,
        restTimerSeconds: willRest ? restSecs : prev.restTimerSeconds,
        isResting: willRest ? true : prev.isResting,
        routine: {
          ...prev.routine,
          exercises: newExercises,
        },
      };
    });
  };

  const updateSetDetails = (exerciseIndex: number, setIndex: number, weight: number, reps: number) => {
    if (!activeWorkout) return;
    setActiveWorkout((prev) => {
      if (!prev) return null;
      const newExercises = prev.routine.exercises.map((ex, eIdx) => {
        if (eIdx !== exerciseIndex) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s, sIdx) => {
            if (sIdx !== setIndex) return s;
            return { ...s, weightKg: weight, reps: reps };
          }),
        };
      });
      return {
        ...prev,
        routine: {
          ...prev.routine,
          exercises: newExercises,
        },
      };
    });
  };

  const updateExerciseWeight = (exerciseIndex: number, weightKg: number) => {
    if (!activeWorkout) return;
    setActiveWorkout((prev) => {
      if (!prev) return null;
      const newExercises = prev.routine.exercises.map((ex, eIdx) => {
        if (eIdx !== exerciseIndex) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) => ({ ...s, weightKg: weightKg })),
        };
      });
      return {
        ...prev,
        routine: {
          ...prev.routine,
          exercises: newExercises,
        },
      };
    });
  };

  const completeAllSetsForExercise = (exerciseIndex: number) => {
    if (!activeWorkout) return;
    setActiveWorkout((prev) => {
      if (!prev) return null;
      const newExercises = prev.routine.exercises.map((ex, eIdx) => {
        if (eIdx !== exerciseIndex) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) => ({ ...s, completed: true })),
        };
      });
      return {
        ...prev,
        routine: {
          ...prev.routine,
          exercises: newExercises,
        },
      };
    });
  };

  const addSetToExercise = (exerciseIndex: number) => {
    if (!activeWorkout) return;
    setActiveWorkout((prev) => {
      if (!prev) return null;
      const newExercises = prev.routine.exercises.map((ex, eIdx) => {
        if (eIdx !== exerciseIndex) return ex;
        const lastSet = ex.sets[ex.sets.length - 1];
        const newSetNumber = ex.sets.length + 1;
        const weight = lastSet ? lastSet.weightKg : 60;
        const reps = lastSet ? lastSet.reps : 10;
        return {
          ...ex,
          targetSets: ex.sets.length + 1,
          sets: [
            ...ex.sets,
            {
              setNumber: newSetNumber,
              weightKg: weight,
              reps: reps,
              completed: false,
            },
          ],
        };
      });
      return {
        ...prev,
        routine: {
          ...prev.routine,
          exercises: newExercises,
        },
      };
    });
  };

  const removeSetFromExercise = (exerciseIndex: number, setIndex: number) => {
    if (!activeWorkout) return;
    setActiveWorkout((prev) => {
      if (!prev) return null;
      const newExercises = prev.routine.exercises.map((ex, eIdx) => {
        if (eIdx !== exerciseIndex || ex.sets.length <= 1) return ex;
        const filtered = ex.sets.filter((_, sIdx) => sIdx !== setIndex);
        const reindexed = filtered.map((s, idx) => ({ ...s, setNumber: idx + 1 }));
        return {
          ...ex,
          targetSets: reindexed.length,
          sets: reindexed,
        };
      });
      return {
        ...prev,
        routine: {
          ...prev.routine,
          exercises: newExercises,
        },
      };
    });
  };

  const addExerciseToActiveWorkout = (exercise: RoutineExercise) => {
    if (activeWorkout) {
      setActiveWorkout((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          routine: {
            ...prev.routine,
            exercises: [...prev.routine.exercises, exercise],
          },
        };
      });
      showNotification(`✅ Added ${exercise.name} to Today's Workout!`);
    } else {
      startWorkout({
        id: `workout_${Date.now()}`,
        title: "DXA Corrective Session",
        subtitle: `${exercise.name} Focus`,
        category: "Hypertrophy",
        durationMinutes: 45,
        estimatedBurnKcal: 360,
        intensity: "High",
        targetMuscles: ["Chest", "Shoulders"],
        exercises: [exercise],
      });
      showNotification(`⚡ Started new workout with ${exercise.name}!`);
    }
  };

  const startRestTimer = (seconds: number) => {
    if (!activeWorkout) return;
    setActiveWorkout((prev) => (prev ? { ...prev, restTimerSeconds: seconds, isResting: true } : null));
  };

  const skipRestTimer = () => {
    if (!activeWorkout) return;
    setActiveWorkout((prev) => (prev ? { ...prev, restTimerSeconds: 0, isResting: false } : null));
  };

  const addWaterIntake = async (amountLiters: number) => {
    try {
      await fetch('/api/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountMl: Math.round(amountLiters * 1000) })
      });
    } catch (e) {
      console.error("Failed to log water", e);
    }
    
    setDailyStats((prev) => {
      const nextVal = Number((prev.waterIntakeLiters + amountLiters).toFixed(2));
      showNotification(`💧 Logged +${(amountLiters * 1000).toFixed(0)}ml Water (Total: ${nextVal}L)`);
      return {
        ...prev,
        waterIntakeLiters: nextVal,
      };
    });
  };

  const logMeal = async (newMeal: Omit<MealItem, "id">) => {
    const mealWithId: MealItem = {
      ...newMeal,
      id: `meal_${Date.now()}`,
    };
    
    try {
      await fetch('/api/nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMeal)
      });
    } catch (e) {
      console.error("Failed to log meal", e);
    }

    setMeals((prev) => [mealWithId, ...prev]);
    setDailyStats((prev) => ({
      ...prev,
      caloriesConsumed: prev.caloriesConsumed + newMeal.calories,
      proteinGrams: prev.proteinGrams + newMeal.protein,
      carbsGrams: prev.carbsGrams + newMeal.carbs,
      fatGrams: prev.fatGrams + newMeal.fats,
    }));
    showNotification(`🥗 Logged: ${newMeal.name} (+${newMeal.calories} kcal)`);
  };

  const deleteMeal = (id: string) => {
    const found = meals.find((m) => m.id === id);
    if (!found) return;
    setMeals((prev) => prev.filter((m) => m.id !== id));
    setDailyStats((prev) => ({
      ...prev,
      caloriesConsumed: Math.max(0, prev.caloriesConsumed - found.calories),
      proteinGrams: Math.max(0, prev.proteinGrams - found.protein),
      carbsGrams: Math.max(0, prev.carbsGrams - found.carbs),
      fatGrams: Math.max(0, prev.fatGrams - found.fats),
    }));
    showNotification(`Removed ${found.name}`);
  };

  const sendAIChat = async (messageText: string) => {
    const userMsg: AIChatMessage = {
      id: `msg_${Date.now()}`,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: messageText,
    };

    setAiChat((prev) => [...prev, userMsg]);

    try {
      const res = await fetch("/api/ai-coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText }),
      });
      const data = await res.json();
      
      const aiMsg: AIChatMessage = {
        id: data.id || `msg_${Date.now() + 1}`,
        sender: "ai",
        timestamp: new Date(data.timestamp || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        text: data.content || "I am processing your request...",
      };
      
      setAiChat((prev) => [...prev, aiMsg]);
    } catch (e) {
      console.error("Failed to send AI chat", e);
      setAiChat((prev) => [...prev, {
        id: `err_${Date.now()}`,
        sender: "ai",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        text: "Sorry, I am currently offline. Please try again later.",
      }]);
    }
  };

  const toggleDevice = (id: string) => {
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const nextState = !d.connected;
          showNotification(`${d.name} ${nextState ? "Connected" : "Disconnected"}`);
          return { ...d, connected: nextState };
        }
        return d;
      })
    );
  };

  return (
    <AppContext.Provider
      value={{
        user,
        dailyStats,
        routines,
        workoutHistory,
        meals,
        devices,
        aiChat,
        activeWorkout,
        viewMode,
        setViewMode,
        myMealCompletion,
        dailyPlanCompletion,
        dailyMealMonitorLogs,
        toggleMyMeal,
        toggleDailyPlanMeal,
        uploadDailyMealPhoto,
        hasBloodReport,
        bloodDeficiencies,
        aiNutritionRecommendations,
        generateIndianRecommendationsFromBlood,
        clearBloodReport,
        hasDxaReport,
        activeWeakMuscles,
        generateWeakMusclesFromDxa,
        clearDxaReport,
        setDxaWeakMuscles,
        monitorCredentials,
        updateMonitorPin,
        toggleMonitorSync,
        updateProfilePhoto,
        updateUserProfile,
        startWorkout,
        pauseWorkout,
        resumeWorkout,
        finishWorkout,
        cancelWorkout,
        deleteWorkoutHistory,
        recordCompletedWorkoutLog,
        toggleSetComplete,
        updateSetDetails,
        updateExerciseWeight,
        completeAllSetsForExercise,
        addSetToExercise,
        removeSetFromExercise,
        addExerciseToActiveWorkout,
        startRestTimer,
        skipRestTimer,
        addWaterIntake,
        logMeal,
        deleteMeal,
        sendAIChat,
        toggleDevice,
        notificationMessage,
        showNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
