"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import {
  X,
  Sparkles,
  Check,
  Plus,
  Droplets,
  Utensils,
  Zap,
  Bot,
  ExternalLink,
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  FlaskConical,
  Eye,
  ShieldCheck,
} from "lucide-react";
import LiveCameraModal from "@/components/nutrition/LiveCameraModal";

interface RecommendedMealDetail {
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

export default function DashboardPage() {
  const {
    user,
    dailyStats,
    addWaterIntake,
    showNotification,
    logMeal,
    myMealCompletion,
    toggleMyMeal,
    dailyPlanCompletion,
    toggleDailyPlanMeal,
    uploadDailyMealPhoto,
    hasBloodReport,
    aiNutritionRecommendations,
    generateIndianRecommendationsFromBlood,
  } = useApp();

  const [waterAmount, setWaterAmount] = useState<number>(dailyStats?.waterIntakeLiters || 1.2);
  const targetWater = user?.targetWaterLiters || 2.5;
  const waterProgressPct = Math.min(100, Math.round((waterAmount / targetWater) * 100));

  // Modals state
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [selectedAiMeal, setSelectedAiMeal] = useState<RecommendedMealDetail | null>(null);
  const [showWaterModal, setShowWaterModal] = useState(false);

  // Daily Meal Photo Upload State
  const [showMealPhotoModal, setShowMealPhotoModal] = useState(false);
  const [photoMealType, setPhotoMealType] = useState<"Breakfast" | "Lunch" | "Dinner" | "Snacks">("Breakfast");
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoMealName, setPhotoMealName] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAddWater = (liters: number) => {
    const newAmount = parseFloat((waterAmount + liters).toFixed(2));
    setWaterAmount(newAmount);
    addWaterIntake(liters);
    showNotification(`💧 Added ${Math.round(liters * 1000)}ml water intake! (${newAmount} / ${targetWater} L)`);
  };

  const handleLogAiMeal = (meal: RecommendedMealDetail) => {
    logMeal({
      name: meal.name,
      mealType: (meal.mealType === "Snacks" ? "Snack" : meal.mealType) as "Breakfast" | "Lunch" | "Dinner" | "Snack",
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fats: meal.fats,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      ingredients: meal.micros,
    });
    toggleMyMeal(
      (meal.mealType.toLowerCase() === "snacks" ? "snacks" : meal.mealType.toLowerCase()) as any,
      meal.name
    );
    showNotification(`🥗 AI Recommended Indian Meal Logged: ${meal.name}`);
    setSelectedAiMeal(null);
  };

  const handleOpenPhotoUpload = (mealType: "Breakfast" | "Lunch" | "Dinner" | "Snacks", defaultName: string) => {
    setPhotoMealType(mealType);
    setPhotoMealName(defaultName);
    setPhotoPreview(null);
    setShowMealPhotoModal(true);
  };

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveMealPhoto = () => {
    if (!photoPreview) {
      showNotification("⚠️ Please snap or upload a meal image first.");
      return;
    }

    uploadDailyMealPhoto(photoMealType, photoPreview, photoMealName || `${photoMealType} Meal`);
    setShowMealPhotoModal(false);
    setPhotoPreview(null);
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen pb-12 animate-fade-in selection:bg-[#00f0ff] selection:text-[#00363a]">
      {/* Main Content Canvas */}
      <div className="px-margin-mobile flex flex-col gap-md max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="flex flex-col gap-base mb-sm">
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-surface font-bold">
            Good Morning.
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Here is your daily health summary.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-4 md:grid-cols-12 gap-md">
          {/* Water Tracking Widget */}
          <div
            onClick={() => setShowWaterModal(true)}
            className="col-span-4 md:col-span-4 bg-surface rounded-xl border border-outline p-md flex flex-col gap-sm relative overflow-hidden group animate-slide-up cursor-pointer hover:border-primary-fixed/40 transition-all"
            style={{ animationDelay: "100ms" }}
          >
            <div className="flex justify-between items-center z-10 relative">
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Water Intake
              </span>
              <span
                className="material-symbols-outlined text-primary-fixed group-hover:scale-110 transition-transform"
                data-icon="water_drop"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                water_drop
              </span>
            </div>

            <div className="flex items-end gap-sm z-10 relative">
              <span className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold">
                {waterAmount}
              </span>
              <span className="font-label-md text-label-md text-on-surface-variant mb-1">
                / {targetWater} L
              </span>
            </div>

            {/* Custom Progress Ring / Gradient Visualizer */}
            <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-20 pointer-events-none">
              <div className="w-full h-full bg-gradient-to-t from-primary-fixed to-transparent" />
            </div>

            <div className="w-full h-2 bg-surface-variant rounded-full mt-auto z-10 relative overflow-hidden">
              <div
                className="h-full bg-primary-fixed rounded-full shadow-sm transition-all duration-500"
                style={{ width: `${waterProgressPct}%` }}
              />
            </div>
          </div>

          {/* Diet Tracking / Scan Foods */}
          <div
            className="col-span-4 md:col-span-8 bg-surface rounded-xl border border-outline p-md flex flex-col justify-between relative overflow-hidden animate-slide-up"
            style={{ animationDelay: "200ms" }}
          >
            {/* Abstract BG Element */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary-fixed/5 rounded-full blur-2xl pointer-events-none" />

            <div className="z-10 relative flex flex-col gap-xs">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Diet Tracking
                </span>
                <span className="font-label-sm text-label-sm text-primary-fixed bg-primary-fixed/10 px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                  Live Camera Scanner
                </span>
              </div>
              <h2 className="font-headline-md text-headline-md text-on-surface font-semibold mt-1">
                Scan your food with device camera for instant macro insights.
              </h2>
            </div>

            <div className="flex items-center gap-3 mt-lg z-10 relative">
              <button
                type="button"
                onClick={() => setShowCameraScanner(true)}
                className="w-full md:w-auto self-start bg-primary-fixed text-on-primary-fixed font-label-md text-label-md px-lg py-sm rounded-lg flex items-center justify-center gap-sm shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Scan Foods with Camera</span>
              </button>

              <Link
                href="/scanner"
                className="hidden sm:inline-flex px-4 py-2 rounded-lg border border-outline text-xs font-mono text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-all"
              >
                Advanced Scanner →
              </Link>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 1: MY MEAL COMPLETION (INDEPENDENT STATE)                         */}
          {/* ========================================================================= */}
          <div
            className="col-span-4 md:col-span-12 bg-surface rounded-xl border border-outline p-md flex flex-col gap-md animate-slide-up"
            style={{ animationDelay: "250ms" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-xs">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  My Meal Completion
                </span>
                <span className="text-xs text-on-surface-variant">
                  Personal daily intake checkmarks (Independent tracker)
                </span>
              </div>
              <span className="text-xs font-mono text-primary-fixed font-bold">
                {Object.values(myMealCompletion).filter(Boolean).length} / 4 Completed
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-sm">
              {/* Breakfast Card */}
              <div
                onClick={() => toggleMyMeal("breakfast", "Oatmeal + Banana")}
                className={`bg-surface-container-high rounded-lg p-sm border border-outline flex items-center gap-sm cursor-pointer transition-all hover:bg-surface-variant ${
                  myMealCompletion.breakfast ? "border-primary-fixed/50" : "opacity-70"
                }`}
              >
                <div className="w-12 h-12 rounded bg-surface border border-outline overflow-hidden flex-shrink-0">
                  <img
                    alt="Oatmeal"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBWq5G4RRoW9LzPk36Xrvl8zU3CZVV8hxha0lkkjBHW9ECmwhGZ9xFsDk4uBup0l0hXCeVrQrKDBbjPxtgCIVL8ZjqM3ixMAE_C6N3ctg9eSjapS0WE_2Qxtzc3AzxVpX_enQ5UepRtS7Uig68fZFklsBWo2FyX8o_vfXcQGPyOJYhyFa_Zyeyj5DLa68ikPlgTL14Qm2e9N5F2rWWL2ChYhHSm7VS91sjuJeztJvTYUew6SnLS4ksszw"
                  />
                </div>
                <div className="flex flex-col flex-grow">
                  <div className="flex items-center justify-between">
                    <span className="font-label-md text-label-md text-primary-fixed font-bold">
                      Breakfast
                    </span>
                    <span className="material-symbols-outlined text-primary-fixed text-sm">
                      {myMealCompletion.breakfast ? "check_circle" : "radio_button_unchecked"}
                    </span>
                  </div>
                  <span className={`font-label-sm text-label-sm text-on-surface-variant ${myMealCompletion.breakfast ? "line-through text-primary-fixed" : ""}`}>
                    Oatmeal + Banana
                  </span>
                </div>
              </div>

              {/* Lunch Card */}
              <div
                onClick={() => toggleMyMeal("lunch", "Chicken Salad")}
                className={`bg-surface-container-high rounded-lg p-sm border border-outline flex items-center gap-sm cursor-pointer transition-all hover:bg-surface-variant ${
                  myMealCompletion.lunch ? "border-primary-fixed/50" : "opacity-70"
                }`}
              >
                <div className="w-12 h-12 rounded bg-surface border border-outline overflow-hidden flex-shrink-0">
                  <img
                    alt="Salad"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDBjen43HKALX6v-TkV4Q_kI_iIVubGkLUWESob8eU35SWc5WqpH46y88x2HU7fOrQ9j5gj3pdeWHHN3xq8Ajji5JvEoq1Ym1Hqznz4iiht9ELwSyzbzVLMrH_bTRw_VPYoBAXcJkbhKDWmxQQQDm8hMzUpmpFAySiZqOg4vnFx30gVp05VzOS0T0Un6Ez1dsGc7EXU_HW_tbzk7zCLfzeXLuQxp5dgoedwphjqr22U39dFGgINtt5tpg"
                  />
                </div>
                <div className="flex flex-col flex-grow">
                  <div className="flex items-center justify-between">
                    <span className="font-label-md text-label-md text-primary-fixed font-bold">
                      Lunch
                    </span>
                    <span className="material-symbols-outlined text-primary-fixed text-sm">
                      {myMealCompletion.lunch ? "check_circle" : "radio_button_unchecked"}
                    </span>
                  </div>
                  <span className={`font-label-sm text-label-sm text-on-surface-variant ${myMealCompletion.lunch ? "line-through text-primary-fixed" : ""}`}>
                    Chicken Salad
                  </span>
                </div>
              </div>

              {/* Dinner Card */}
              <div
                onClick={() => toggleMyMeal("dinner", "Steamed Salmon & Quinoa")}
                className={`bg-surface-container-high rounded-lg p-sm border border-outline flex items-center gap-sm cursor-pointer transition-all hover:bg-surface-variant ${
                  myMealCompletion.dinner ? "border-primary-fixed/50" : "opacity-70"
                }`}
              >
                <div className="w-12 h-12 rounded bg-surface border border-outline overflow-hidden flex-shrink-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-surface-variant">restaurant</span>
                </div>
                <div className="flex flex-col flex-grow">
                  <div className="flex items-center justify-between">
                    <span className="font-label-md text-label-md text-primary-fixed font-bold">
                      Dinner
                    </span>
                    <span className={`material-symbols-outlined text-sm ${myMealCompletion.dinner ? "text-primary-fixed" : "text-secondary"}`}>
                      {myMealCompletion.dinner ? "check_circle" : "radio_button_unchecked"}
                    </span>
                  </div>
                  <span className={`font-label-sm text-label-sm text-on-surface-variant ${myMealCompletion.dinner ? "line-through text-primary-fixed" : ""}`}>
                    {myMealCompletion.dinner ? "Steamed Salmon" : "Pending"}
                  </span>
                </div>
              </div>

              {/* Snacks Card */}
              <div
                onClick={() => toggleMyMeal("snacks", "Greek Yogurt")}
                className={`bg-surface-container-high rounded-lg p-sm border border-outline flex items-center gap-sm cursor-pointer transition-all hover:bg-surface-variant ${
                  myMealCompletion.snacks ? "border-primary-fixed/50" : "opacity-70"
                }`}
              >
                <div className="w-12 h-12 rounded bg-surface border border-outline overflow-hidden flex-shrink-0 flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-surface-variant">restaurant</span>
                </div>
                <div className="flex flex-col flex-grow">
                  <div className="flex items-center justify-between">
                    <span className="font-label-md text-label-md text-primary-fixed font-bold">
                      Snacks
                    </span>
                    <span className={`material-symbols-outlined text-sm ${myMealCompletion.snacks ? "text-primary-fixed" : "text-secondary"}`}>
                      {myMealCompletion.snacks ? "check_circle" : "radio_button_unchecked"}
                    </span>
                  </div>
                  <span className={`font-label-sm text-label-sm text-on-surface-variant ${myMealCompletion.snacks ? "line-through text-primary-fixed" : ""}`}>
                    {myMealCompletion.snacks ? "Greek Yogurt" : "Pending"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 2 & 3: DAILY MEAL PLAN MONITOR & AI NUTRITION RECOMMENDATION     */}
          {/* ========================================================================= */}
          <div
            className="col-span-4 md:col-span-12 bg-surface rounded-xl border border-outline p-md flex flex-col gap-md animate-slide-up"
            style={{ animationDelay: "300ms" }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex flex-col gap-xs">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                  Daily Meal Plan &amp; AI Nutrition
                </span>
                <span className="text-xs text-on-surface-variant">
                  Clinical macro tracking with photo logs &amp; Indian biomarker alignment
                </span>
              </div>
              <Link
                href="/nutrition/monitor"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-primary-fixed font-bold hover:underline"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Full Meal Monitor Diary →</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              {/* ===================================================================== */}
              {/* SECTION A: DAILY MEAL PLAN MONITOR (INDEPENDENT WITH PHOTO UPLOAD)   */}
              {/* ===================================================================== */}
              <div className="flex flex-col gap-sm">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">
                    Daily Meal Monitor
                  </h3>
                  <span className="text-[11px] font-mono text-primary-fixed bg-primary-container px-2 py-0.5 rounded font-bold">
                    Independent Plan
                  </span>
                </div>

                <div className="flex flex-col gap-sm">
                  {/* Breakfast Row */}
                  <div className="flex items-center justify-between pb-sm border-b border-outline p-2 rounded-lg hover:bg-surface-container transition-all">
                    <div
                      onClick={() => toggleDailyPlanMeal("breakfast", "Oatmeal & Berries")}
                      className="flex items-center gap-sm cursor-pointer flex-1"
                    >
                      <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center border border-outline">
                        <span className={`material-symbols-outlined ${dailyPlanCompletion.breakfast ? "text-primary-fixed" : "text-secondary"}`}>
                          {dailyPlanCompletion.breakfast ? "check_circle" : "radio_button_unchecked"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className={`font-body-md text-body-md leading-tight text-on-surface ${dailyPlanCompletion.breakfast ? "line-through text-on-surface-variant font-semibold" : ""}`}>
                          Oatmeal &amp; Berries
                        </span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">Recommended food • Breakfast</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenPhotoUpload("Breakfast", "Oatmeal & Berries")}
                      className="px-2.5 py-1.5 rounded-lg bg-surface border border-outline hover:border-primary-fixed text-[11px] font-mono text-primary-fixed flex items-center gap-1 transition-all"
                      title="Upload photo for Breakfast"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Photo</span>
                    </button>
                  </div>

                  {/* Lunch Row */}
                  <div className="flex items-center justify-between pb-sm border-b border-outline p-2 rounded-lg hover:bg-surface-container transition-all">
                    <div
                      onClick={() => toggleDailyPlanMeal("lunch", "Grilled Chicken Salad")}
                      className="flex items-center gap-sm cursor-pointer flex-1"
                    >
                      <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center border border-outline">
                        <span className={`material-symbols-outlined ${dailyPlanCompletion.lunch ? "text-primary-fixed" : "text-secondary"}`}>
                          {dailyPlanCompletion.lunch ? "check_circle" : "radio_button_unchecked"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className={`font-body-md text-body-md leading-tight text-on-surface ${dailyPlanCompletion.lunch ? "line-through text-on-surface-variant font-semibold" : ""}`}>
                          Grilled Chicken Salad
                        </span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">Recommended food • Lunch</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenPhotoUpload("Lunch", "Grilled Chicken Salad")}
                      className="px-2.5 py-1.5 rounded-lg bg-surface border border-outline hover:border-primary-fixed text-[11px] font-mono text-primary-fixed flex items-center gap-1 transition-all"
                      title="Upload photo for Lunch"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Photo</span>
                    </button>
                  </div>

                  {/* Dinner Row */}
                  <div className="flex items-center justify-between pb-sm border-b border-outline p-2 rounded-lg hover:bg-surface-container transition-all">
                    <div
                      onClick={() => toggleDailyPlanMeal("dinner", "Steamed Salmon & Quinoa")}
                      className="flex items-center gap-sm cursor-pointer flex-1"
                    >
                      <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center border border-outline">
                        <span className={`material-symbols-outlined ${dailyPlanCompletion.dinner ? "text-primary-fixed" : "text-secondary"}`}>
                          {dailyPlanCompletion.dinner ? "check_circle" : "radio_button_unchecked"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className={`font-body-md text-body-md leading-tight text-on-surface ${dailyPlanCompletion.dinner ? "line-through text-on-surface-variant font-semibold" : ""}`}>
                          Steamed Salmon &amp; Quinoa
                        </span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">Recommended food • Dinner</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenPhotoUpload("Dinner", "Steamed Salmon & Quinoa")}
                      className="px-2.5 py-1.5 rounded-lg bg-surface border border-outline hover:border-primary-fixed text-[11px] font-mono text-primary-fixed flex items-center gap-1 transition-all"
                      title="Upload photo for Dinner"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Photo</span>
                    </button>
                  </div>

                  {/* Snacks Row */}
                  <div className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container transition-all">
                    <div
                      onClick={() => toggleDailyPlanMeal("snacks", "Greek Yogurt")}
                      className="flex items-center gap-sm cursor-pointer flex-1"
                    >
                      <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center border border-outline">
                        <span className={`material-symbols-outlined ${dailyPlanCompletion.snacks ? "text-primary-fixed" : "text-secondary"}`}>
                          {dailyPlanCompletion.snacks ? "check_circle" : "radio_button_unchecked"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className={`font-body-md text-body-md leading-tight text-on-surface ${dailyPlanCompletion.snacks ? "line-through text-on-surface-variant font-semibold" : ""}`}>
                          Greek Yogurt &amp; Walnuts
                        </span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">Recommended food • Snacks</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenPhotoUpload("Snacks", "Greek Yogurt & Walnuts")}
                      className="px-2.5 py-1.5 rounded-lg bg-surface border border-outline hover:border-primary-fixed text-[11px] font-mono text-primary-fixed flex items-center gap-1 transition-all"
                      title="Upload photo for Snacks"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Photo</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* ===================================================================== */}
              {/* SECTION B: AI NUTRITION RECOMMENDATION (INDIAN FOODS & BLOOD GATED)  */}
              {/* ===================================================================== */}
              <div className="flex flex-col gap-sm">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">
                    AI Nutrition Recommendation
                  </h3>
                  {hasBloodReport && (
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      Blood-Targeted Indian Diet
                    </span>
                  )}
                </div>

                {/* Gated Empty State if No Blood Report is Uploaded/Analyzed */}
                {!hasBloodReport || !aiNutritionRecommendations ? (
                  <div className="flex flex-col items-center justify-center p-6 rounded-xl bg-surface-container-high border border-outline text-center gap-3 h-full min-h-[220px]">
                    <div className="w-12 h-12 rounded-full bg-primary-fixed/10 flex items-center justify-center text-primary-fixed">
                      <FlaskConical className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-on-surface">
                        No Blood Panel Analyzed Yet
                      </h4>
                      <p className="text-xs text-on-surface-variant max-w-sm mt-1">
                        Upload your clinical blood test report in Health &gt; Blood Panel to generate authentic Indian nutrition recommendations tailored to your biomarker deficiencies (Vitamin D, B12, Iron, Omega-3).
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                      <Link
                        href="/health/upload-blood"
                        className="px-4 py-2 rounded-xl bg-primary-fixed text-on-primary-fixed text-xs font-bold shadow-sm hover:brightness-110 transition-all flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Blood Report</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => generateIndianRecommendationsFromBlood()}
                        className="px-3.5 py-2 rounded-xl bg-surface border border-outline text-xs font-mono text-primary-fixed hover:bg-surface-container transition-all"
                      >
                        ⚡ Analyze Sample Blood Panel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-sm bg-primary-fixed/5 rounded-xl p-md border border-primary-fixed/20">
                    {/* Breakfast Indian AI Item */}
                    {aiNutritionRecommendations.Breakfast && (
                      <div
                        onClick={() => setSelectedAiMeal(aiNutritionRecommendations.Breakfast)}
                        className="flex items-center justify-between pb-sm border-b border-outline cursor-pointer hover:bg-primary-fixed/10 p-2 rounded-lg transition-all"
                      >
                        <div className="flex items-center gap-sm">
                          <div className="w-8 h-8 rounded-lg bg-primary-fixed/15 text-primary-fixed flex items-center justify-center font-bold text-xs font-mono">
                            AM
                          </div>
                          <div className="flex flex-col">
                            <span className="font-body-md text-body-md leading-tight text-on-surface font-semibold line-clamp-1">
                              {aiNutritionRecommendations.Breakfast.name}
                            </span>
                            <span className="font-label-sm text-label-sm text-primary-fixed font-mono text-[11px]">
                              ⚡ {aiNutritionRecommendations.Breakfast.targetTags}
                            </span>
                          </div>
                        </div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant font-mono">
                          {aiNutritionRecommendations.Breakfast.calories} kcal
                        </span>
                      </div>
                    )}

                    {/* Lunch Indian AI Item */}
                    {aiNutritionRecommendations.Lunch && (
                      <div
                        onClick={() => setSelectedAiMeal(aiNutritionRecommendations.Lunch)}
                        className="flex items-center justify-between pb-sm border-b border-outline cursor-pointer hover:bg-primary-fixed/10 p-2 rounded-lg transition-all"
                      >
                        <div className="flex items-center gap-sm">
                          <div className="w-8 h-8 rounded-lg bg-primary-fixed/15 text-primary-fixed flex items-center justify-center font-bold text-xs font-mono">
                            NOON
                          </div>
                          <div className="flex flex-col">
                            <span className="font-body-md text-body-md leading-tight text-on-surface font-semibold line-clamp-1">
                              {aiNutritionRecommendations.Lunch.name}
                            </span>
                            <span className="font-label-sm text-label-sm text-primary-fixed font-mono text-[11px]">
                              ⚡ {aiNutritionRecommendations.Lunch.targetTags}
                            </span>
                          </div>
                        </div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant font-mono">
                          {aiNutritionRecommendations.Lunch.calories} kcal
                        </span>
                      </div>
                    )}

                    {/* Dinner Indian AI Item */}
                    {aiNutritionRecommendations.Dinner && (
                      <div
                        onClick={() => setSelectedAiMeal(aiNutritionRecommendations.Dinner)}
                        className="flex items-center justify-between pb-sm border-b border-outline cursor-pointer hover:bg-primary-fixed/10 p-2 rounded-lg transition-all"
                      >
                        <div className="flex items-center gap-sm">
                          <div className="w-8 h-8 rounded-lg bg-primary-fixed/15 text-primary-fixed flex items-center justify-center font-bold text-xs font-mono">
                            PM
                          </div>
                          <div className="flex flex-col">
                            <span className="font-body-md text-body-md leading-tight text-on-surface font-semibold line-clamp-1">
                              {aiNutritionRecommendations.Dinner.name}
                            </span>
                            <span className="font-label-sm text-label-sm text-primary-fixed font-mono text-[11px]">
                              ⚡ {aiNutritionRecommendations.Dinner.targetTags}
                            </span>
                          </div>
                        </div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant font-mono">
                          {aiNutritionRecommendations.Dinner.calories} kcal
                        </span>
                      </div>
                    )}

                    {/* Snacks Indian AI Item */}
                    {aiNutritionRecommendations.Snacks && (
                      <div
                        onClick={() => setSelectedAiMeal(aiNutritionRecommendations.Snacks)}
                        className="flex items-center justify-between cursor-pointer hover:bg-primary-fixed/10 p-2 rounded-lg transition-all"
                      >
                        <div className="flex items-center gap-sm">
                          <div className="w-8 h-8 rounded-lg bg-primary-fixed/15 text-primary-fixed flex items-center justify-center font-bold text-xs font-mono">
                            SNACK
                          </div>
                          <div className="flex flex-col">
                            <span className="font-body-md text-body-md leading-tight text-on-surface font-semibold line-clamp-1">
                              {aiNutritionRecommendations.Snacks.name}
                            </span>
                            <span className="font-label-sm text-label-sm text-primary-fixed font-mono text-[11px]">
                              ⚡ {aiNutritionRecommendations.Snacks.targetTags}
                            </span>
                          </div>
                        </div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant font-mono">
                          {aiNutritionRecommendations.Snacks.calories} kcal
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: LIVE CAMERA FOOD SCANNER                                           */}
      {/* ========================================================================= */}
      <LiveCameraModal
        isOpen={showCameraScanner}
        onClose={() => setShowCameraScanner(false)}
      />

      {/* ========================================================================= */}
      {/* MODAL: WATER INTAKE LOGGING                                               */}
      {/* ========================================================================= */}
      {showWaterModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-surface-container border border-outline rounded-2xl w-full max-w-[440px] p-6 flex flex-col gap-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-outline pb-3">
              <div className="flex items-center gap-2 text-primary-fixed">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  water_drop
                </span>
                <h3 className="font-sora text-lg font-bold text-on-surface">Hydration Tracker</h3>
              </div>
              <button
                onClick={() => setShowWaterModal(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center py-4 bg-surface-container-high rounded-2xl border border-outline">
              <span className="font-label-sm text-on-surface-variant uppercase">Current Status</span>
              <span className="text-3xl font-extrabold text-primary-fixed font-mono mt-1">
                {waterAmount} / {targetWater} L
              </span>
              <div className="w-48 bg-surface-variant rounded-full h-2 mt-3 overflow-hidden">
                <div className="bg-primary-fixed h-full rounded-full" style={{ width: `${waterProgressPct}%` }} />
              </div>
              <span className="text-xs font-mono text-on-surface-variant mt-2">{waterProgressPct}% Daily Target</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleAddWater(0.25)}
                className="p-3 rounded-xl bg-surface border border-outline text-center transition-all hover:border-primary-fixed active:scale-95"
              >
                <span className="block font-mono font-bold text-on-surface text-sm">+250 ml</span>
                <span className="text-[10px] text-on-surface-variant">Glass</span>
              </button>
              <button
                onClick={() => handleAddWater(0.5)}
                className="p-3 rounded-xl bg-surface border border-outline text-center transition-all hover:border-primary-fixed active:scale-95"
              >
                <span className="block font-mono font-bold text-primary-fixed text-sm">+500 ml</span>
                <span className="text-[10px] text-on-surface-variant">Bottle</span>
              </button>
              <button
                onClick={() => handleAddWater(1.0)}
                className="p-3 rounded-xl bg-surface border border-outline text-center transition-all hover:border-primary-fixed active:scale-95"
              >
                <span className="block font-mono font-bold text-on-surface text-sm">+1.0 L</span>
                <span className="text-[10px] text-on-surface-variant">Flask</span>
              </button>
            </div>

            <button
              onClick={() => setShowWaterModal(false)}
              className="w-full py-2.5 rounded-xl bg-primary-fixed text-on-primary-fixed font-label-md text-xs font-bold hover:brightness-110 transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: AI INDIAN NUTRITION RECOMMENDATION DETAIL & QUICK LOG              */}
      {/* ========================================================================= */}
      {selectedAiMeal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-surface border border-outline rounded-3xl w-full max-w-[480px] p-6 flex flex-col gap-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-outline pb-3">
              <div className="flex items-center gap-2 text-primary-fixed">
                <span className="material-symbols-outlined">bolt</span>
                <div>
                  <h3 className="font-sora text-base sm:text-lg font-bold text-on-surface">{selectedAiMeal.name}</h3>
                  <span className="text-xs font-mono text-primary-fixed">
                    {selectedAiMeal.mealType} Indian Recommendation
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedAiMeal(null)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-primary-fixed/10 border border-primary-fixed/20 text-xs text-primary-fixed font-mono">
              ⚡ {selectedAiMeal.targetTags}
            </div>

            {selectedAiMeal.reason && (
              <p className="text-xs text-on-surface-variant leading-relaxed bg-surface-container-high p-3 rounded-xl border border-outline">
                <strong>Clinical Biomarker Rationale:</strong> {selectedAiMeal.reason}
              </p>
            )}

            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-surface-container-high border border-outline">
                <span className="text-[10px] text-on-surface-variant font-mono uppercase block">Calories</span>
                <span className="text-base font-bold font-mono text-on-surface">{selectedAiMeal.calories}</span>
                <span className="text-[9px] text-on-surface-variant block">kcal</span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-container-high border border-outline">
                <span className="text-[10px] text-on-surface-variant font-mono uppercase block">Protein</span>
                <span className="text-base font-bold font-mono text-primary-fixed">{selectedAiMeal.protein}g</span>
                <span className="text-[9px] text-on-surface-variant block">High</span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-container-high border border-outline">
                <span className="text-[10px] text-on-surface-variant font-mono uppercase block">Carbs</span>
                <span className="text-base font-bold font-mono text-on-surface">{selectedAiMeal.carbs}g</span>
                <span className="text-[9px] text-on-surface-variant block">Complex</span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-container-high border border-outline">
                <span className="text-[10px] text-on-surface-variant font-mono uppercase block">Fats</span>
                <span className="text-base font-bold font-mono text-on-surface">{selectedAiMeal.fats}g</span>
                <span className="text-[9px] text-on-surface-variant block">Healthy</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-mono text-on-surface-variant uppercase font-bold">Target Micronutrients</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedAiMeal.micros.map((micro, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-mono px-2.5 py-1 rounded-md bg-surface-container-high border border-outline text-on-surface-variant"
                  >
                    ⚡ {micro}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Link
                href="/ai-coach"
                className="flex-1 py-2.5 rounded-xl border border-outline text-on-surface text-xs font-mono text-center flex items-center justify-center gap-1 hover:bg-surface-container"
              >
                <Bot className="w-4 h-4 text-primary-fixed" />
                <span>Ask AI Era</span>
              </Link>

              <button
                onClick={() => handleLogAiMeal(selectedAiMeal)}
                className="flex-1 py-2.5 rounded-xl bg-primary-fixed text-on-primary-fixed font-label-md text-xs font-bold hover:brightness-110 shadow-sm transition-all cursor-pointer"
              >
                Log This Meal ✅
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: DAILY MEAL MONITOR PHOTO UPLOAD                                    */}
      {/* ========================================================================= */}
      {showMealPhotoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-surface border border-outline rounded-3xl w-full max-w-md p-6 flex flex-col gap-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-outline pb-3">
              <div className="flex items-center gap-2 text-primary-fixed">
                <Camera className="w-5 h-5" />
                <h3 className="font-sora text-base sm:text-lg font-bold text-on-surface">
                  Log {photoMealType} Photo
                </h3>
              </div>
              <button
                onClick={() => setShowMealPhotoModal(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoFileChange}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-48 rounded-2xl border-2 border-dashed border-primary-fixed/40 bg-surface-container-high flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary-fixed overflow-hidden relative"
            >
              {photoPreview ? (
                <>
                  <img src={photoPreview} alt="Meal Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-mono font-bold opacity-0 hover:opacity-100 transition-opacity">
                    Change Photo
                  </div>
                </>
              ) : (
                <>
                  <Camera className="w-8 h-8 text-primary-fixed" />
                  <span className="text-xs font-bold text-on-surface">
                    Tap to Open Camera or Select Photo
                  </span>
                  <span className="text-[10px] text-on-surface-variant">
                    JPG, PNG, WebP supported
                  </span>
                </>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-on-surface-variant block mb-1">
                Meal Name / Description
              </label>
              <input
                type="text"
                value={photoMealName}
                onChange={(e) => setPhotoMealName(e.target.value)}
                placeholder="e.g. Oatmeal & Berries, Egg Dosa..."
                className="w-full px-3 py-2 rounded-xl bg-surface border border-outline text-sm text-on-surface outline-none focus:border-primary-fixed"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowMealPhotoModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-outline text-xs font-semibold text-on-surface hover:bg-surface-container"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveMealPhoto}
                className="flex-1 py-2.5 rounded-xl bg-primary-fixed text-on-primary-fixed text-xs font-bold hover:brightness-110 transition-all shadow-sm cursor-pointer"
              >
                Save &amp; Complete Meal ✅
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
