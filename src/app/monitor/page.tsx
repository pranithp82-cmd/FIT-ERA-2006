"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/logo-transparent.png";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/context/AuthContext";
import {
  Utensils,
  Dumbbell,
  Shield,
  User,
  CheckCircle2,
  Sparkles,
  Save,
  Plus,
  Trash2,
  Clock,
  Flame,
  ArrowLeft,
  ChevronRight,
  LogOut,
  Sliders,
  Award,
  Activity,
  HeartPulse,
  Info,
} from "lucide-react";
import { EXERCISE_DATABASE } from "@/lib/data";

export default function MonitorPortalPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const {
    assignedDietPlanFromMonitor,
    assignedWorkoutPlanFromMonitor,
    saveMonitorDietPlan,
    saveMonitorWorkoutPlan,
    showNotification,
    user,
  } = useApp();

  // Active Tab: ONLY 2 Buttons ("food" | "workout")
  const [activeTab, setActiveTab] = useState<"food" | "workout">("food");

  // Diet Plan Local Edit State
  const [dietTitle, setDietTitle] = useState(assignedDietPlanFromMonitor.title);
  const [targetCalories, setTargetCalories] = useState(assignedDietPlanFromMonitor.targetCalories);
  const [targetProtein, setTargetProtein] = useState(assignedDietPlanFromMonitor.targetProtein);
  const [targetCarbs, setTargetCarbs] = useState(assignedDietPlanFromMonitor.targetCarbs);
  const [targetFat, setTargetFat] = useState(assignedDietPlanFromMonitor.targetFat);
  const [dietNotes, setDietNotes] = useState(assignedDietPlanFromMonitor.notes || "");
  const [breakfast, setBreakfast] = useState(assignedDietPlanFromMonitor.meals.breakfast);
  const [lunch, setLunch] = useState(assignedDietPlanFromMonitor.meals.lunch);
  const [dinner, setDinner] = useState(assignedDietPlanFromMonitor.meals.dinner);
  const [snacks, setSnacks] = useState(assignedDietPlanFromMonitor.meals.snacks);

  // Workout Plan Local Edit State
  const [workoutTitle, setWorkoutTitle] = useState(assignedWorkoutPlanFromMonitor.title);
  const [workoutDuration, setWorkoutDuration] = useState(assignedWorkoutPlanFromMonitor.durationMinutes);
  const [workoutIntensity, setWorkoutIntensity] = useState(assignedWorkoutPlanFromMonitor.intensity);
  const [workoutNotes, setWorkoutNotes] = useState(assignedWorkoutPlanFromMonitor.notes || "");
  const [exercises, setExercises] = useState(assignedWorkoutPlanFromMonitor.exercises);

  // Add Exercise Form State
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [newExName, setNewExName] = useState("");
  const [newExSets, setNewExSets] = useState(3);
  const [newExReps, setNewExReps] = useState("10-12");
  const [newExWeight, setNewExWeight] = useState(60);
  const [newExRest, setNewExRest] = useState(75);
  const [newExNote, setNewExNote] = useState("");

  // Save Diet Plan Handler
  const handleSaveDiet = async () => {
    const updatedPlan = {
      title: dietTitle,
      targetCalories: Number(targetCalories),
      targetProtein: Number(targetProtein),
      targetCarbs: Number(targetCarbs),
      targetFat: Number(targetFat),
      notes: dietNotes,
      assignedByName: "Coach Akash",
      meals: {
        breakfast,
        lunch,
        dinner,
        snacks,
      },
    };

    saveMonitorDietPlan(updatedPlan);

    // Call API in background
    try {
      await fetch(`/api/monitor/users/current/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "UPDATE_DIET_PLAN",
          payload: updatedPlan,
          auditNote: "Monitor updated target diet and daily macro alignment.",
        }),
      });
    } catch (e) {
      console.warn("API sync skipped", e);
    }
  };

  // Save Workout Plan Handler
  const handleSaveWorkout = async () => {
    const updatedPlan = {
      title: workoutTitle,
      durationMinutes: Number(workoutDuration),
      intensity: workoutIntensity,
      notes: workoutNotes,
      assignedByName: "Coach Akash",
      exercises,
    };

    saveMonitorWorkoutPlan(updatedPlan);

    // Call API in background
    try {
      await fetch(`/api/monitor/users/current/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "UPDATE_WORKOUT_PLAN",
          payload: updatedPlan,
          auditNote: "Monitor updated prescribed training split and volume.",
        }),
      });
    } catch (e) {
      console.warn("API sync skipped", e);
    }
  };

  // Preset Diet Templates
  const handleApplyDietPreset = (presetType: "hypertrophy" | "blood" | "cutting") => {
    if (presetType === "hypertrophy") {
      setDietTitle("High-Protein Hypertrophy & Muscle Synthesis Diet");
      setTargetCalories(2950);
      setTargetProtein(180);
      setTargetCarbs(330);
      setTargetFat(75);
      setDietNotes("Focus on 2g/kg protein and nutrient timing around resistance training.");
      setBreakfast({
        name: "Country Eggs Bhurji & Multigrain Toast with Avocado",
        calories: 550,
        protein: 44,
        carbs: 45,
        fats: 18,
        notes: "4 eggs + 2 whites with spinach",
        items: ["4 Eggs + 2 Whites", "2 Slices Spelt Toast", "1/2 Avocado", "Black Coffee"],
      });
      setLunch({
        name: "Grilled Chicken Breast, Brown Rice & Spinach Dal",
        calories: 820,
        protein: 60,
        carbs: 90,
        fats: 18,
        notes: "Post-workout glycogen recovery",
        items: ["220g Chicken Breast", "1.5 cup Brown Basmati", "1 Bowl Dal", "Cucumber Salad"],
      });
      setDinner({
        name: "Grilled Wild Mackerel/Salmon with Quinoa & Broccoli",
        calories: 720,
        protein: 50,
        carbs: 45,
        fats: 24,
        notes: "High Omega-3 for joint health",
        items: ["200g Wild Fish", "1 cup Quinoa", "Steamed Broccoli", "1 tbsp Olive Oil"],
      });
      setSnacks({
        name: "Whey Isolate Protein Shake & Raw Almonds",
        calories: 340,
        protein: 32,
        carbs: 14,
        fats: 14,
        notes: "Mid-afternoon anti-catabolic boost",
        items: ["1 Scoop Whey Isolate", "30g Almonds", "1 Banana"],
      });
      showNotification("⚡ Applied 'High-Protein Hypertrophy' Diet Template!");
    } else if (presetType === "blood") {
      setDietTitle("Blood Biomarker Deficiency Reversal Diet (Iron & Vitamin D)");
      setTargetCalories(2650);
      setTargetProtein(155);
      setTargetCarbs(290);
      setTargetFat(65);
      setDietNotes("Formulated to reverse low serum ferritin and boost Vitamin D3 bio-absorption.");
      setBreakfast({
        name: "Moringa (முருங்கை) Egg Omelette & Ragi Dosa",
        calories: 480,
        protein: 36,
        carbs: 38,
        fats: 14,
        notes: "High Vitamin D3 & Bioavailable Iron",
        items: ["3 Country Eggs", "Moringa Leaves", "2 Ragi Dosas", "Mint Chutney"],
      });
      setLunch({
        name: "Sprouted Moong Khichdi & Palak Paneer Poriyal",
        calories: 740,
        protein: 48,
        carbs: 80,
        fats: 16,
        notes: "Folate & Iron dense gut microbiome meal",
        items: ["Sprouted Moong Khichdi", "Palak Paneer", "1 cup Curd (தயிர்)", "Salad"],
      });
      setDinner({
        name: "Grilled Ayala Fish Curry with Steamed Greens",
        calories: 640,
        protein: 46,
        carbs: 32,
        fats: 19,
        notes: "Rich in wild EPA/DHA Omega-3s",
        items: ["Ayala Fish Curry", "Cauliflower Rice", "Steamed Greens", "Lemon Juice"],
      });
      setSnacks({
        name: "Roasted Pumpkin & Flaxseeds with Masala Buttermilk (மோர்)",
        calories: 240,
        protein: 18,
        carbs: 12,
        fats: 10,
        notes: "Electrolyte and Zinc recovery",
        items: ["Pumpkin & Flaxseeds", "Masala Buttermilk", "1 Orange"],
      });
      showNotification("🧬 Applied 'Biomarker Reversal' Diet Template!");
    }
  };

  // Preset Workout Templates
  const handleApplyWorkoutPreset = (presetType: "upper" | "dxa_corrective" | "fullbody") => {
    if (presetType === "upper") {
      setWorkoutTitle("Coach Akash: Upper Body Hypertrophy & Power Split");
      setWorkoutDuration(50);
      setWorkoutIntensity("Peak Performance");
      setWorkoutNotes("Emphasize deep eccentric stretch on presses and controlled lat contraction on rows.");
      setExercises([
        {
          name: "Incline Barbell Bench Press",
          targetSets: 4,
          targetReps: "8-10",
          startingKg: 75,
          restSeconds: 90,
          focusNote: "30° incline, touch clavicle, 3s negative",
        },
        {
          name: "Chest-Supported T-Bar Row",
          targetSets: 4,
          targetReps: "10-12",
          startingKg: 65,
          restSeconds: 75,
          focusNote: "Full scapular retraction at top, 1s isometric hold",
        },
        {
          name: "Standing Dumbbell Overhead Press",
          targetSets: 3,
          targetReps: "8-10",
          startingKg: 24,
          restSeconds: 75,
          focusNote: "Brace core tight, press straight overhead",
        },
        {
          name: "Face Pull with External Rotation",
          targetSets: 4,
          targetReps: "15",
          startingKg: 25,
          restSeconds: 60,
          focusNote: "Pull to forehead, externally rotate wrists",
        },
      ]);
      showNotification("🏋️‍♂️ Applied 'Upper Body Hypertrophy' Workout Template!");
    } else if (presetType === "dxa_corrective") {
      setWorkoutTitle("Coach Akash: DXA Asymmetry & Lower Posterior Corrector");
      setWorkoutDuration(45);
      setWorkoutIntensity("Corrective Strength");
      setWorkoutNotes("Targeting Left Leg vs Right Leg deficit detected via DXA body composition scan.");
      setExercises([
        {
          name: "Single-Leg Romanian Deadlift (Left Leg Focus)",
          targetSets: 4,
          targetReps: "10",
          startingKg: 26,
          restSeconds: 75,
          focusNote: "Left leg symmetry focus, deep hamstring eccentric tension",
        },
        {
          name: "Unilateral Bulgarian Split Squat (Left Leg)",
          targetSets: 3,
          targetReps: "12",
          startingKg: 20,
          restSeconds: 60,
          focusNote: "Elevate rear foot, keep torso upright",
        },
        {
          name: "Single-Arm Lat Pulldown",
          targetSets: 3,
          targetReps: "12-15",
          startingKg: 30,
          restSeconds: 60,
          focusNote: "Drive elbow to hip, eliminate spinal rotation",
        },
        {
          name: "Standing Calf Raise (Unilateral)",
          targetSets: 4,
          targetReps: "15",
          startingKg: 18,
          restSeconds: 45,
          focusNote: "2s pause at bottom stretch, explode onto big toe",
        },
      ]);
      showNotification("⚡ Applied 'DXA Asymmetry Corrector' Workout Template!");
    }
  };

  // Add Exercise to List
  const handleAddNewExercise = () => {
    if (!newExName.trim()) {
      showNotification("⚠️ Please enter or select an exercise name.");
      return;
    }
    setExercises((prev) => [
      ...prev,
      {
        name: newExName.trim(),
        targetSets: Number(newExSets) || 3,
        targetReps: newExReps || "10-12",
        startingKg: Number(newExWeight) || 50,
        restSeconds: Number(newExRest) || 60,
        focusNote: newExNote || "Controlled tempo and full range of motion",
      },
    ]);
    setNewExName("");
    setNewExNote("");
    setShowAddExercise(false);
    showNotification(`✅ Added ${newExName} to workout regimen!`);
  };

  const handleRemoveExercise = (idx: number) => {
    setExercises((prev) => prev.filter((_, i) => i !== idx));
    showNotification("🗑️ Movement removed from regimen.");
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col pb-28">
      {/* ========================================================================= */}
      {/* TOP HEADER: MONITOR IDENTITY & ATHLETE OVERVIEW                           */}
      {/* ========================================================================= */}
      <header className="bg-surface border-b border-outline sticky top-0 z-30 shadow-sm backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-1.5 rounded-xl bg-surface-container border border-outline shadow-sm hover:scale-105 transition-transform shrink-0" title="Go to Home Dashboard">
              <Image
                src={logo}
                alt="FIT ERA Logo"
                width={36}
                height={36}
                style={{ objectFit: "contain" }}
              />
            </Link>
            <div>
              <h1 className="font-black text-xl sm:text-2xl text-on-surface tracking-tight">
                Coach Akash
              </h1>
            </div>
          </div>

          {/* Active User Badge & Exit */}
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-surface-container border border-outline flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary-container text-primary-fixed flex items-center justify-center font-bold text-xs overflow-hidden border border-primary-fixed/30">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <span>PA</span>
                )}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-on-surface">{user.name}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <span className="text-[10px] text-on-surface-variant font-mono">
                  {user.age || 19}y • {user.weightKg || 78.4}kg • {user.gender || "Male"} • O+
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                logout();
                router.push("/auth/login");
              }}
              className="p-2 rounded-xl border border-outline hover:bg-red-50 text-red-600 hover:border-red-200 text-xs font-bold transition-all flex items-center gap-1"
              title="Logout from Monitor Portal"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* MAIN LAYOUT: 2 LEFT BUTTONS + RIGHT WORKSPACE CONTENT                     */}
      {/* ========================================================================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ===================================================================== */}
          {/* LEFT SIDEBAR: ONLY 2 MAIN BUTTONS (FOOD & WORKOUT)                   */}
          {/* ===================================================================== */}
          <aside className="lg:col-span-3 bg-surface rounded-2xl border border-outline p-4 shadow-sm flex flex-col gap-3 sticky top-24">
            <div className="pb-2 border-b border-outline">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-on-surface-variant">
                ALIGNMENT CONTROLS
              </span>
              <h2 className="text-sm font-bold text-on-surface mt-0.5">
                Monitor Prescriptions
              </h2>
            </div>

            {/* BUTTON 1: FOOD */}
            <button
              type="button"
              onClick={() => setActiveTab("food")}
              className={`w-full p-4 rounded-xl font-bold text-sm transition-all flex items-center justify-between cursor-pointer border ${
                activeTab === "food"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-md scale-[1.02]"
                  : "bg-surface-container/70 border-outline text-on-surface hover:bg-surface-container"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold ${
                    activeTab === "food" ? "bg-white/20 text-white" : "bg-emerald-500/15 text-emerald-600"
                  }`}
                >
                  <Utensils className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="block font-bold">Food (டயட்)</span>
                  <span className={`text-[11px] font-normal ${activeTab === "food" ? "text-emerald-100" : "text-on-surface-variant"}`}>
                    Diet &amp; Nutrition Align
                  </span>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 ${activeTab === "food" ? "text-white" : "text-on-surface-variant"}`} />
            </button>

            {/* BUTTON 2: WORKOUT */}
            <button
              type="button"
              onClick={() => setActiveTab("workout")}
              className={`w-full p-4 rounded-xl font-bold text-sm transition-all flex items-center justify-between cursor-pointer border ${
                activeTab === "workout"
                  ? "bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02]"
                  : "bg-surface-container/70 border-outline text-on-surface hover:bg-surface-container"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold ${
                    activeTab === "workout" ? "bg-white/20 text-white" : "bg-blue-500/15 text-blue-600"
                  }`}
                >
                  <Dumbbell className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <span className="block font-bold">Workout (பயிற்சி)</span>
                  <span className={`text-[11px] font-normal ${activeTab === "workout" ? "text-blue-100" : "text-on-surface-variant"}`}>
                    Exercise &amp; Sets Align
                  </span>
                </div>
              </div>
              <ChevronRight className={`w-4 h-4 ${activeTab === "workout" ? "text-white" : "text-on-surface-variant"}`} />
            </button>
          </aside>

          {/* ===================================================================== */}
          {/* RIGHT WORKSPACE AREA: ACTIVE TAB CONTENT                              */}
          {/* ===================================================================== */}
          <main className="lg:col-span-9 space-y-6">
            
            {/* =================================================================== */}
            {/* TAB 1: FOOD (DIET ALIGNMENT)                                       */}
            {/* =================================================================== */}
            {activeTab === "food" && (
              <div className="bg-surface rounded-2xl border border-outline p-6 shadow-sm flex flex-col gap-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-outline gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-mono font-bold border border-emerald-500/20">
                        NUTRITION ALIGNMENT
                      </span>
                      <span className="text-xs text-on-surface-variant">
                        Last Assigned: {assignedDietPlanFromMonitor.assignedAt || "Today"}
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-on-surface mt-1">
                      Align Diet Plan
                    </h2>
                    <p className="text-xs text-on-surface-variant">
                      Set custom daily caloric targets, macronutrient goals, and meal prescriptions for {user.name || "Pranith A"}.
                    </p>
                  </div>

                  {/* Save Button */}
                  <button
                    type="button"
                    onClick={handleSaveDiet}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save &amp; Dispatch Diet Plan</span>
                  </button>
                </div>

                {/* Preset Diet Chips */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono uppercase text-on-surface-variant font-bold">
                    ⚡ Quick Presets:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleApplyDietPreset("hypertrophy")}
                    className="px-3 py-1.5 rounded-lg bg-surface border border-outline hover:border-emerald-500 text-xs font-semibold text-on-surface flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    🍗 High-Protein Hypertrophy (180g Protein)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyDietPreset("blood")}
                    className="px-3 py-1.5 rounded-lg bg-surface border border-outline hover:border-emerald-500 text-xs font-semibold text-on-surface flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    🩸 Biomarker Deficiency Reversal (Iron + D3)
                  </button>
                </div>

                {/* Diet Title & Caloric Target Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 p-4 rounded-xl bg-surface-container/60 border border-outline">
                  <div className="sm:col-span-2 lg:col-span-5">
                    <label className="text-xs font-mono font-bold text-on-surface-variant uppercase block mb-1">
                      Prescription Plan Title
                    </label>
                    <input
                      type="text"
                      value={dietTitle}
                      onChange={(e) => setDietTitle(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg bg-surface border border-outline text-sm font-bold text-on-surface outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono font-bold text-on-surface-variant uppercase block mb-1">
                      Target Calories
                    </label>
                    <input
                      type="number"
                      value={targetCalories}
                      onChange={(e) => setTargetCalories(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-surface border border-outline text-sm font-mono font-bold text-on-surface outline-none focus:border-emerald-500 text-center"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono font-bold text-on-surface-variant uppercase block mb-1">
                      Protein (g)
                    </label>
                    <input
                      type="number"
                      value={targetProtein}
                      onChange={(e) => setTargetProtein(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-surface border border-outline text-sm font-mono font-bold text-emerald-600 outline-none focus:border-emerald-500 text-center"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono font-bold text-on-surface-variant uppercase block mb-1">
                      Carbs (g)
                    </label>
                    <input
                      type="number"
                      value={targetCarbs}
                      onChange={(e) => setTargetCarbs(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-surface border border-outline text-sm font-mono font-bold text-on-surface outline-none focus:border-emerald-500 text-center"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono font-bold text-on-surface-variant uppercase block mb-1">
                      Fat (g)
                    </label>
                    <input
                      type="number"
                      value={targetFat}
                      onChange={(e) => setTargetFat(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-surface border border-outline text-sm font-mono font-bold text-on-surface outline-none focus:border-emerald-500 text-center"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono font-bold text-on-surface-variant uppercase block mb-1">
                      Macro Split
                    </label>
                    <div className="px-2 py-1.5 rounded-lg bg-surface-container text-xs font-mono font-bold text-center text-primary-fixed border border-outline">
                      {Math.round((targetProtein * 4 / targetCalories) * 100)}% P / {Math.round((targetCarbs * 4 / targetCalories) * 100)}% C
                    </div>
                  </div>
                </div>

                {/* MEAL BREAKDOWN (4 SLOTS) */}
                <div className="space-y-4">
                  <span className="text-xs font-mono uppercase font-bold text-on-surface-variant block">
                    Daily Meal Alignment Breakdown:
                  </span>

                  {/* Breakfast */}
                  <div className="p-4 rounded-xl bg-surface-container/40 border border-outline space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded bg-emerald-500/15 text-emerald-700 text-xs font-bold font-mono uppercase">
                        🌅 Breakfast (காலை உணவு)
                      </span>
                      <span className="text-xs font-mono text-on-surface-variant font-bold">
                        {breakfast.calories} kcal • {breakfast.protein}g Protein
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          value={breakfast.name}
                          onChange={(e) => setBreakfast({ ...breakfast, name: e.target.value })}
                          placeholder="Meal description..."
                          className="w-full px-3 py-1.5 rounded-lg bg-surface border border-outline text-xs font-semibold text-on-surface outline-none"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={breakfast.notes || ""}
                          onChange={(e) => setBreakfast({ ...breakfast, notes: e.target.value })}
                          placeholder="Coach note (e.g. 4 eggs + toast)"
                          className="w-full px-3 py-1.5 rounded-lg bg-surface border border-outline text-xs text-on-surface-variant outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Lunch */}
                  <div className="p-4 rounded-xl bg-surface-container/40 border border-outline space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded bg-blue-500/15 text-blue-700 text-xs font-bold font-mono uppercase">
                        ☀️ Lunch (மதிய உணவு)
                      </span>
                      <span className="text-xs font-mono text-on-surface-variant font-bold">
                        {lunch.calories} kcal • {lunch.protein}g Protein
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          value={lunch.name}
                          onChange={(e) => setLunch({ ...lunch, name: e.target.value })}
                          placeholder="Meal description..."
                          className="w-full px-3 py-1.5 rounded-lg bg-surface border border-outline text-xs font-semibold text-on-surface outline-none"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={lunch.notes || ""}
                          onChange={(e) => setLunch({ ...lunch, notes: e.target.value })}
                          placeholder="Coach note (e.g. Brown rice + chicken)"
                          className="w-full px-3 py-1.5 rounded-lg bg-surface border border-outline text-xs text-on-surface-variant outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dinner */}
                  <div className="p-4 rounded-xl bg-surface-container/40 border border-outline space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded bg-purple-500/15 text-purple-700 text-xs font-bold font-mono uppercase">
                        🌙 Dinner (இரவு உணவு)
                      </span>
                      <span className="text-xs font-mono text-on-surface-variant font-bold">
                        {dinner.calories} kcal • {dinner.protein}g Protein
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          value={dinner.name}
                          onChange={(e) => setDinner({ ...dinner, name: e.target.value })}
                          placeholder="Meal description..."
                          className="w-full px-3 py-1.5 rounded-lg bg-surface border border-outline text-xs font-semibold text-on-surface outline-none"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={dinner.notes || ""}
                          onChange={(e) => setDinner({ ...dinner, notes: e.target.value })}
                          placeholder="Coach note (e.g. Wild fish + quinoa)"
                          className="w-full px-3 py-1.5 rounded-lg bg-surface border border-outline text-xs text-on-surface-variant outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Snacks */}
                  <div className="p-4 rounded-xl bg-surface-container/40 border border-outline space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded bg-amber-500/15 text-amber-700 text-xs font-bold font-mono uppercase">
                        🥪 Snacks &amp; Pre/Post Workout (சிற்றுண்டி)
                      </span>
                      <span className="text-xs font-mono text-on-surface-variant font-bold">
                        {snacks.calories} kcal • {snacks.protein}g Protein
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          value={snacks.name}
                          onChange={(e) => setSnacks({ ...snacks, name: e.target.value })}
                          placeholder="Meal description..."
                          className="w-full px-3 py-1.5 rounded-lg bg-surface border border-outline text-xs font-semibold text-on-surface outline-none"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          value={snacks.notes || ""}
                          onChange={(e) => setSnacks({ ...snacks, notes: e.target.value })}
                          placeholder="Coach note (e.g. Whey shake + almonds)"
                          className="w-full px-3 py-1.5 rounded-lg bg-surface border border-outline text-xs text-on-surface-variant outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coach Clinical Notes */}
                <div>
                  <label className="text-xs font-mono font-bold text-on-surface-variant uppercase block mb-1">
                    Coach Nutrition Advisory &amp; Timing Instructions
                  </label>
                  <textarea
                    rows={2}
                    value={dietNotes}
                    onChange={(e) => setDietNotes(e.target.value)}
                    placeholder="Provide specific hydration, sodium, or electrolyte advisories for this week..."
                    className="w-full p-3 rounded-xl bg-surface border border-outline text-xs text-on-surface outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Bottom Dispatch Button */}
                <div className="pt-3 border-t border-outline flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveDiet}
                    className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Save &amp; Dispatch Diet to {user.name || "Pranith A"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* =================================================================== */}
            {/* TAB 2: WORKOUT (TRAINING ALIGNMENT)                                 */}
            {/* =================================================================== */}
            {activeTab === "workout" && (
              <div className="bg-surface rounded-2xl border border-outline p-6 shadow-sm flex flex-col gap-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-outline gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 text-xs font-mono font-bold border border-blue-500/20">
                        TRAINING PROTOCOL ALIGNMENT
                      </span>
                      <span className="text-xs text-on-surface-variant">
                        Last Assigned: {assignedWorkoutPlanFromMonitor.assignedAt || "Today"}
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-on-surface mt-1">
                      Align Workout Regimen
                    </h2>
                    <p className="text-xs text-on-surface-variant">
                      Design exercise splits, set loads, repetition targets, and rest timers for {user.name || "Pranith A"}.
                    </p>
                  </div>

                  {/* Save Button */}
                  <button
                    type="button"
                    onClick={handleSaveWorkout}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 shrink-0 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save &amp; Dispatch Workout Plan</span>
                  </button>
                </div>

                {/* Preset Workout Chips */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono uppercase text-on-surface-variant font-bold">
                    ⚡ Quick Presets:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleApplyWorkoutPreset("upper")}
                    className="px-3 py-1.5 rounded-lg bg-surface border border-outline hover:border-blue-500 text-xs font-semibold text-on-surface flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    🏋️ Upper Body Hypertrophy (Chest &amp; Lats)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyWorkoutPreset("dxa_corrective")}
                    className="px-3 py-1.5 rounded-lg bg-surface border border-outline hover:border-blue-500 text-xs font-semibold text-on-surface flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    📐 DXA Unilateral Corrector (Left Leg Focus)
                  </button>
                </div>

                {/* Workout Title & Config */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-surface-container/60 border border-outline">
                  <div className="sm:col-span-3">
                    <label className="text-xs font-mono font-bold text-on-surface-variant uppercase block mb-1">
                      Assigned Workout Title
                    </label>
                    <input
                      type="text"
                      value={workoutTitle}
                      onChange={(e) => setWorkoutTitle(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg bg-surface border border-outline text-sm font-bold text-on-surface outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono font-bold text-on-surface-variant uppercase block mb-1">
                      Estimated Duration (Mins)
                    </label>
                    <input
                      type="number"
                      value={workoutDuration}
                      onChange={(e) => setWorkoutDuration(Number(e.target.value))}
                      className="w-full px-3 py-1.5 rounded-lg bg-surface border border-outline text-sm font-mono font-bold text-on-surface outline-none focus:border-blue-500 text-center"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-mono font-bold text-on-surface-variant uppercase block mb-1">
                      Intensity Level
                    </label>
                    <select
                      value={workoutIntensity}
                      onChange={(e) => setWorkoutIntensity(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-surface border border-outline text-xs font-bold text-on-surface outline-none focus:border-blue-500"
                    >
                      <option value="Peak Performance">Peak Performance (High)</option>
                      <option value="Hypertrophy Volume">Hypertrophy Volume (Moderate-High)</option>
                      <option value="Corrective Strength">Corrective Strength (Focused)</option>
                      <option value="Active Recovery">Active Recovery (Low-Impact)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-mono font-bold text-on-surface-variant uppercase block mb-1">
                      Total Movements
                    </label>
                    <div className="px-3 py-1.5 rounded-lg bg-surface-container text-xs font-mono font-bold text-center text-blue-600 border border-outline">
                      {exercises.length} Exercises Prescribed
                    </div>
                  </div>
                </div>

                {/* EXERCISE LIST */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase font-bold text-on-surface-variant">
                      Prescribed Exercise Sequence:
                    </span>

                    <button
                      type="button"
                      onClick={() => setShowAddExercise(!showAddExercise)}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Movement</span>
                    </button>
                  </div>

                  {/* Add Exercise Inline Form */}
                  {showAddExercise && (
                    <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 space-y-3 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-700">Add Exercise to Protocol</span>
                        <button
                          type="button"
                          onClick={() => setShowAddExercise(false)}
                          className="text-xs text-on-surface-variant hover:text-on-surface"
                        >
                          ✕ Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-mono font-bold uppercase text-on-surface-variant block mb-1">
                            Exercise Name
                          </label>
                          <input
                            type="text"
                            value={newExName}
                            onChange={(e) => setNewExName(e.target.value)}
                            placeholder="e.g., Incline Dumbbell Press"
                            className="w-full px-3 py-1.5 rounded-lg bg-surface border border-outline text-xs font-bold text-on-surface"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-mono font-bold uppercase text-on-surface-variant block mb-1">
                            Sets × Reps
                          </label>
                          <div className="flex gap-1">
                            <input
                              type="number"
                              value={newExSets}
                              onChange={(e) => setNewExSets(Number(e.target.value))}
                              className="w-1/2 px-2 py-1.5 rounded bg-surface border border-outline text-xs text-center font-bold"
                              placeholder="Sets"
                            />
                            <input
                              type="text"
                              value={newExReps}
                              onChange={(e) => setNewExReps(e.target.value)}
                              className="w-1/2 px-2 py-1.5 rounded bg-surface border border-outline text-xs text-center font-bold"
                              placeholder="Reps"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-mono font-bold uppercase text-on-surface-variant block mb-1">
                            Load (kg) • Rest (s)
                          </label>
                          <div className="flex gap-1">
                            <input
                              type="number"
                              value={newExWeight}
                              onChange={(e) => setNewExWeight(Number(e.target.value))}
                              className="w-1/2 px-2 py-1.5 rounded bg-surface border border-outline text-xs text-center font-bold"
                              placeholder="kg"
                            />
                            <input
                              type="number"
                              value={newExRest}
                              onChange={(e) => setNewExRest(Number(e.target.value))}
                              className="w-1/2 px-2 py-1.5 rounded bg-surface border border-outline text-xs text-center font-bold"
                              placeholder="Rest"
                            />
                          </div>
                        </div>

                        <div className="sm:col-span-4">
                          <label className="text-[10px] font-mono font-bold uppercase text-on-surface-variant block mb-1">
                            Coach Focus &amp; Technique Note
                          </label>
                          <input
                            type="text"
                            value={newExNote}
                            onChange={(e) => setNewExNote(e.target.value)}
                            placeholder="e.g. 3-second eccentric stretch, pause at peak"
                            className="w-full px-3 py-1.5 rounded-lg bg-surface border border-outline text-xs text-on-surface"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={handleAddNewExercise}
                          className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs shadow-sm hover:bg-blue-500"
                        >
                          Confirm &amp; Add Movement
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Movements List Cards */}
                  <div className="space-y-2.5">
                    {exercises.map((ex, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-surface-container/40 border border-outline flex items-center justify-between gap-4 hover:border-blue-500/40 transition-all shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-600 font-mono font-bold text-xs flex items-center justify-center border border-blue-500/30">
                            #{idx + 1}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-on-surface">{ex.name}</h4>
                            <div className="flex items-center gap-3 text-xs text-on-surface-variant font-mono mt-0.5">
                              <span>{ex.targetSets} Sets × {ex.targetReps} Reps</span>
                              <span>•</span>
                              <span className="text-blue-600 font-bold">{ex.startingKg} kg</span>
                              <span>•</span>
                              <span>{ex.restSeconds}s Rest</span>
                            </div>
                            {ex.focusNote && (
                              <p className="text-[11px] text-on-surface-variant mt-1">
                                💡 <em>{ex.focusNote}</em>
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveExercise(idx)}
                          className="p-2 rounded-lg text-on-surface-variant hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Remove Exercise"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coach Workout Technique Advice */}
                <div>
                  <label className="text-xs font-mono font-bold text-on-surface-variant uppercase block mb-1">
                    Coach General Technique &amp; Volume Strategy Note
                  </label>
                  <textarea
                    rows={2}
                    value={workoutNotes}
                    onChange={(e) => setWorkoutNotes(e.target.value)}
                    placeholder="Specify RPE target, progressive overload cues, and warm-up requirements..."
                    className="w-full p-3 rounded-xl bg-surface border border-outline text-xs text-on-surface outline-none focus:border-blue-500"
                  />
                </div>

                {/* Bottom Dispatch Button */}
                <div className="pt-3 border-t border-outline flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveWorkout}
                    className="px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Save &amp; Dispatch Workout to {user.name || "Pranith A"}</span>
                  </button>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}
