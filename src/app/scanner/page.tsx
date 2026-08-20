"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  Camera,
  Barcode,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  X,
  Plus,
  ArrowLeft,
  Sliders,
  Check,
  Database,
  Search,
} from "lucide-react";
import FoodSearchModal from "@/components/nutrition/FoodSearchModal";
import LiveCameraModal from "@/components/nutrition/LiveCameraModal";

export default function FoodScanResultPage() {
  const router = useRouter();
  const { logMeal, showNotification } = useApp();

  // 5,000 Food Database Search Modal
  const [showDbSearch, setShowDbSearch] = useState(false);

  // Serving and Portion Selection
  const [servingSize, setServingSize] = useState<string>("1");
  const [customGrams, setCustomGrams] = useState<number>(350);
  const [mealType, setMealType] = useState<"Lunch" | "Dinner" | "Breakfast" | "Snack">("Lunch");
  const [isLogged, setIsLogged] = useState(false);

  // Camera Viewfinder Modal
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [scanMode, setScanMode] = useState<"food" | "body">("food");
  const [isScanning, setIsScanning] = useState(false);

  // Portion multiplier calculation
  const multiplier =
    servingSize === "1"
      ? 1
      : servingSize === "0.5"
      ? 0.5
      : servingSize === "1.5"
      ? 1.5
      : servingSize === "2"
      ? 2
      : customGrams / 350;

  // Base nutritional values for standard 350g Chicken Rice bowl
  const baseNutrition = {
    name: "Chicken Rice",
    recipe: "Cooked, Standard Recipe",
    calories: 520,
    protein: 32,
    carbs: 58,
    fat: 18,
    saturatedFat: 5,
    transFat: 0,
    cholesterol: 95,
    fiber: 3,
    sugar: 4,
    sodium: 680,
    potassium: 420,
    calcium: 80,
    iron: 3.2,
    magnesium: 45,
    zinc: 2.8,
    vitA: 120,
    vitB6: 0.5,
    vitB12: 1.8,
    vitC: 8,
    vitD: 0.7,
    vitE: 1.5,
    omega3: 0.3,
    omega6: 2.1,
  };

  // Scaled nutritional values
  const currentCalories = Math.round(baseNutrition.calories * multiplier);
  const currentProtein = Math.round(baseNutrition.protein * multiplier);
  const currentCarbs = Math.round(baseNutrition.carbs * multiplier);
  const currentFat = Math.round(baseNutrition.fat * multiplier);

  const handleAddToDailyDiet = () => {
    logMeal({
      name: `${baseNutrition.name} (${servingSize === "custom" ? `${customGrams}g` : servingSize === "1" ? "1 Bowl" : `${servingSize} Bowl`})`,
      mealType: mealType,
      calories: currentCalories,
      protein: currentProtein,
      carbs: currentCarbs,
      fats: currentFat,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      image: "https://lh3.googleusercontent.com/aida/AP1WRLt-UoP3aUmPWN9ZYOMSdFMb1N0uIFtIlfSK_HTCtr_BhlrxTvOaSpQihNg3ZcnIRNOvuA8We1p-bkP_uTUP4iQpWOo7IOO2smqmp1P6dbFUPDxF4IAtDAOxJa31Oef_YQb1bRq0dIxGXMfc2m62PQB0ZAViSDPI1Mh6JbgitY-ca5zL2CoYDhOIP9m8x418AfNGy-jfBeDjKk4PNcnWcKtqX4qwYHxy8OGGDi_3Db_rPj_XdrPOiEEEyqvc",
      ingredients: [
        `Protein: ${currentProtein}g`,
        `Carbs: ${currentCarbs}g`,
        `Fat: ${currentFat}g`,
        `Sodium: ${Math.round(baseNutrition.sodium * multiplier)}mg`,
      ],
    });

    setIsLogged(true);
    showNotification(`⚡ Logged ${baseNutrition.name} (${currentCalories} kcal) to ${mealType}!`);
  };

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setShowCameraModal(false);
      showNotification("⚡ Food item recognized & biometrics analyzed!");
    }, 1800);
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen pb-[120px] selection:bg-[#00f0ff] selection:text-[#00363a]">
      {/* Top Navigation (Task-focused, custom back header) */}
      <header className="fixed top-0 w-full z-50 bg-background/90 backdrop-blur-xl border-b border-white/10 px-margin-mobile h-16 flex items-center justify-between shadow-sm">
        <button
          onClick={() => router.back()}
          className="text-primary-fixed dark:text-primary-fixed-dim hover:opacity-80 transition-opacity active:scale-95 flex items-center justify-center w-10 h-10 -ml-2 rounded-full cursor-pointer"
          title="Go Back"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>

        <h1 className="flex-1 text-center font-headline-md text-headline-md text-primary-fixed dark:text-primary-fixed-dim">
          Food Identified
        </h1>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDbSearch(true)}
            className="text-primary-fixed dark:text-primary-fixed-dim hover:opacity-80 transition-opacity active:scale-95 flex items-center justify-center p-2 rounded-lg bg-surface-container border border-white/5 cursor-pointer text-xs font-mono gap-1"
            title="Search 5,000 food database"
          >
            <Database className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">5,000 Foods</span>
          </button>

          <button
            onClick={() => setShowCameraModal(true)}
            className="text-primary-fixed dark:text-primary-fixed-dim hover:opacity-80 transition-opacity active:scale-95 flex items-center justify-center p-2 rounded-lg bg-surface-container border border-white/5 cursor-pointer text-xs font-mono gap-1"
            title="Scan another food or barcode"
          >
            <span className="material-symbols-outlined text-sm">photo_camera</span>
            <span className="hidden sm:inline">Rescan</span>
          </button>
        </div>
      </header>

      <main className="pt-16 pb-24 md:pb-8 max-w-4xl mx-auto px-margin-mobile">
        {/* Hero Section */}
        <section className="mt-6 mb-8 relative rounded-xl overflow-hidden border border-white/10 bg-surface-container shadow-sm">
          <div className="h-64 w-full relative">
            <img
              className="object-cover w-full h-full absolute inset-0"
              alt="A high-quality, professional food photography shot of a bowl of Chicken Rice"
              src="https://lh3.googleusercontent.com/aida/AP1WRLt-UoP3aUmPWN9ZYOMSdFMb1N0uIFtIlfSK_HTCtr_BhlrxTvOaSpQihNg3ZcnIRNOvuA8We1p-bkP_uTUP4iQpWOo7IOO2smqmp1P6dbFUPDxF4IAtDAOxJa31Oef_YQb1bRq0dIxGXMfc2m62PQB0ZAViSDPI1Mh6JbgitY-ca5zL2CoYDhOIP9m8x418AfNGy-jfBeDjKk4PNcnWcKtqX4qwYHxy8OGGDi_3Db_rPj_XdrPOiEEEyqvc"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />

            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <div>
                <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface mb-1 font-bold">
                  {baseNutrition.name}
                </h2>
                <p className="font-body-md text-on-surface-variant">
                  {baseNutrition.recipe}
                </p>
              </div>

              {/* Serving Selector */}
              <div className="bg-surface/80 backdrop-blur-md border border-white/10 rounded-lg px-3 py-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-fixed-dim text-sm">
                  restaurant
                </span>
                <select
                  value={servingSize}
                  onChange={(e) => setServingSize(e.target.value)}
                  className="bg-transparent border-none text-on-surface font-label-md text-label-md p-0 focus:ring-0 cursor-pointer appearance-none outline-none pr-4"
                >
                  <option value="1" className="bg-[#111416] text-white">1 Bowl (350g)</option>
                  <option value="0.5" className="bg-[#111416] text-white">0.5 Bowl (175g)</option>
                  <option value="1.5" className="bg-[#111416] text-white">1.5 Bowl (525g)</option>
                  <option value="2" className="bg-[#111416] text-white">2 Bowls (700g)</option>
                  <option value="custom" className="bg-[#111416] text-white">Custom (g)</option>
                </select>
                <span className="material-symbols-outlined text-on-surface-variant text-sm pointer-events-none -ml-4">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          {/* Custom Weight Input Slider (when custom is selected) */}
          {servingSize === "custom" && (
            <div className="p-4 bg-surface-container-high border-t border-white/10 flex items-center justify-between gap-4 animate-fadeIn">
              <span className="text-xs font-mono text-gray-300">Custom Portion:</span>
              <div className="flex items-center gap-3 flex-1 max-w-xs">
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="25"
                  value={customGrams}
                  onChange={(e) => setCustomGrams(parseInt(e.target.value))}
                  className="w-full accent-primary-fixed cursor-pointer"
                />
                <span className="font-mono text-sm font-bold text-primary-fixed min-w-[60px]">
                  {customGrams}g
                </span>
              </div>
            </div>
          )}
        </section>

        {/* Analysis Status */}
        <div className="mb-6">
          <h2 className="font-label-sm text-label-sm text-primary-fixed-dim uppercase tracking-wider mb-1 font-mono">
            Analysis Complete
          </h2>
          <h3 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface font-bold">
            Food Scan Result
          </h3>
        </div>

        {/* Main Macros */}
        <section className="grid grid-cols-4 gap-md mb-6">
          {/* Calories Tile */}
          <div className="col-span-4 md:col-span-1 bg-surface-container border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-primary/5" />
            <span className="font-label-sm text-label-sm text-on-surface-variant mb-1 uppercase tracking-wider relative z-10 font-mono">
              Calories
            </span>
            <div className="flex items-baseline gap-1 relative z-10">
              <span className="font-display-lg text-display-lg text-primary-fixed-dim font-bold">
                {currentCalories}
              </span>
              <span className="font-label-sm text-label-sm text-primary-fixed/70 font-mono">
                kcal
              </span>
            </div>
          </div>

          {/* Protein, Carbs, Fat 3-col grid */}
          <div className="col-span-4 md:col-span-3 grid grid-cols-3 gap-md">
            {/* Protein */}
            <div className="bg-surface-container border border-white/10 rounded-xl p-4 flex flex-col justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant mb-2 uppercase flex items-center gap-1 font-mono">
                <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim inline-block" />
                Protein
              </span>
              <div className="font-label-md text-label-md text-on-surface text-lg font-bold">
                {currentProtein}
                <span className="text-on-surface-variant text-sm font-normal">g</span>
              </div>
              <div className="w-full bg-background h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-tertiary-fixed-dim h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.round((currentProtein / 50) * 100))}%` }}
                />
              </div>
            </div>

            {/* Carbs */}
            <div className="bg-surface-container border border-white/10 rounded-xl p-4 flex flex-col justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant mb-2 uppercase flex items-center gap-1 font-mono">
                <span className="w-2 h-2 rounded-full bg-primary-fixed-dim inline-block" />
                Carbs
              </span>
              <div className="font-label-md text-label-md text-on-surface text-lg font-bold">
                {currentCarbs}
                <span className="text-on-surface-variant text-sm font-normal">g</span>
              </div>
              <div className="w-full bg-background h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-primary-fixed-dim h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.round((currentCarbs / 70) * 100))}%` }}
                />
              </div>
            </div>

            {/* Fat */}
            <div className="bg-surface-container border border-white/10 rounded-xl p-4 flex flex-col justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant mb-2 uppercase flex items-center gap-1 font-mono">
                <span className="w-2 h-2 rounded-full bg-error inline-block" />
                Fat
              </span>
              <div className="font-label-md text-label-md text-on-surface text-lg font-bold">
                {currentFat}
                <span className="text-on-surface-variant text-sm font-normal">g</span>
              </div>
              <div className="w-full bg-background h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-error h-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.round((currentFat / 30) * 100))}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Breakdown Bento Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">
              Nutritional Breakdown
            </h3>

            {/* Meal Type Tag Selector */}
            <div className="flex items-center gap-1.5">
              {(["Breakfast", "Lunch", "Dinner", "Snack"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMealType(m)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                    mealType === m
                      ? "bg-primary-fixed text-on-primary-fixed font-bold shadow-[0_0_10px_rgba(125,244,255,0.4)]"
                      : "bg-surface-container text-on-surface-variant hover:text-white"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            {/* Lipids & Fibers */}
            <div className="bg-surface-container rounded-xl border border-white/10 p-5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-primary-fixed-dim icon-filled">
                  water_drop
                </span>
                <h4 className="font-label-md text-label-md text-on-surface uppercase tracking-wider font-semibold">
                  Fats &amp; Dietary
                </h4>
              </div>

              <div className="space-y-2 font-label-md text-label-md">
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-on-surface-variant">Saturated Fat</span>
                  <span className="text-on-surface font-mono">{(baseNutrition.saturatedFat * multiplier).toFixed(1)}g</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-on-surface-variant">Trans Fat</span>
                  <span className="text-on-surface font-mono">{baseNutrition.transFat}g</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-on-surface-variant">Cholesterol</span>
                  <span className="text-on-surface font-mono">{Math.round(baseNutrition.cholesterol * multiplier)}mg</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-on-surface-variant">Fiber</span>
                  <span className="text-on-surface font-mono">{(baseNutrition.fiber * multiplier).toFixed(1)}g</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-on-surface-variant">Total Sugar</span>
                  <span className="text-on-surface font-mono">{(baseNutrition.sugar * multiplier).toFixed(1)}g</span>
                </div>
              </div>
            </div>

            {/* Minerals */}
            <div className="bg-surface-container rounded-xl border border-white/10 p-5 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-tertiary-fixed-dim icon-filled">
                  grain
                </span>
                <h4 className="font-label-md text-label-md text-on-surface uppercase tracking-wider font-semibold">
                  Minerals
                </h4>
              </div>

              <div className="space-y-2 font-label-md text-label-md">
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-on-surface-variant">Sodium</span>
                  <span className="text-on-surface font-mono">{Math.round(baseNutrition.sodium * multiplier)}mg</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-on-surface-variant">Potassium</span>
                  <span className="text-on-surface font-mono">{Math.round(baseNutrition.potassium * multiplier)}mg</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-on-surface-variant">Calcium</span>
                  <span className="text-on-surface font-mono">{Math.round(baseNutrition.calcium * multiplier)}mg</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-on-surface-variant">Iron</span>
                  <span className="text-on-surface font-mono">{(baseNutrition.iron * multiplier).toFixed(1)}mg</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-white/5">
                  <span className="text-on-surface-variant">Magnesium</span>
                  <span className="text-on-surface font-mono">{Math.round(baseNutrition.magnesium * multiplier)}mg</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-on-surface-variant">Zinc</span>
                  <span className="text-on-surface font-mono">{(baseNutrition.zinc * multiplier).toFixed(1)}mg</span>
                </div>
              </div>
            </div>

            {/* Vitamins Full Width */}
            <div className="bg-surface-container rounded-xl border border-white/10 p-5 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-inverse-primary icon-filled">
                  vital_signs
                </span>
                <h4 className="font-label-md text-label-md text-on-surface uppercase tracking-wider font-semibold">
                  Vitamins &amp; Omegas
                </h4>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-label-md text-label-md">
                <div className="flex flex-col p-2 bg-background rounded-lg border border-white/5">
                  <span className="text-on-surface-variant text-xs mb-1">Vit A</span>
                  <span className="text-on-surface font-mono">{Math.round(baseNutrition.vitA * multiplier)}µg</span>
                </div>
                <div className="flex flex-col p-2 bg-background rounded-lg border border-white/5">
                  <span className="text-on-surface-variant text-xs mb-1">Vit B6</span>
                  <span className="text-on-surface font-mono">{(baseNutrition.vitB6 * multiplier).toFixed(1)}mg</span>
                </div>
                <div className="flex flex-col p-2 bg-background rounded-lg border border-white/5">
                  <span className="text-on-surface-variant text-xs mb-1">Vit B12</span>
                  <span className="text-on-surface font-mono">{(baseNutrition.vitB12 * multiplier).toFixed(1)}µg</span>
                </div>
                <div className="flex flex-col p-2 bg-background rounded-lg border border-white/5">
                  <span className="text-on-surface-variant text-xs mb-1">Vit C</span>
                  <span className="text-on-surface font-mono">{Math.round(baseNutrition.vitC * multiplier)}mg</span>
                </div>
                <div className="flex flex-col p-2 bg-background rounded-lg border border-white/5">
                  <span className="text-on-surface-variant text-xs mb-1">Vit D</span>
                  <span className="text-on-surface font-mono">{(baseNutrition.vitD * multiplier).toFixed(1)}µg</span>
                </div>
                <div className="flex flex-col p-2 bg-background rounded-lg border border-white/5">
                  <span className="text-on-surface-variant text-xs mb-1">Vit E</span>
                  <span className="text-on-surface font-mono">{(baseNutrition.vitE * multiplier).toFixed(1)}mg</span>
                </div>
                <div className="flex flex-col p-2 bg-background rounded-lg border border-white/5">
                  <span className="text-on-surface-variant text-xs mb-1">Omega-3</span>
                  <span className="text-primary-fixed-dim font-mono font-bold">{(baseNutrition.omega3 * multiplier).toFixed(1)}g</span>
                </div>
                <div className="flex flex-col p-2 bg-background rounded-lg border border-white/5">
                  <span className="text-on-surface-variant text-xs mb-1">Omega-6</span>
                  <span className="text-primary-fixed-dim font-mono font-bold">{(baseNutrition.omega6 * multiplier).toFixed(1)}g</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Action Area */}
      <div className="fixed bottom-0 left-0 w-full bg-background/90 backdrop-blur-xl border-t border-white/10 p-margin-mobile z-40 pb-safe pb-8">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          {isLogged ? (
            <div className="w-full flex items-center justify-between p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5" />
                <span className="font-mono text-sm font-bold">Added to Daily Diet ({currentCalories} kcal)</span>
              </div>
              <Link
                href="/nutrition"
                className="px-4 py-2 rounded-lg bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-all font-mono"
              >
                View Nutrition Plan →
              </Link>
            </div>
          ) : (
            <button
              onClick={handleAddToDailyDiet}
              className="w-full bg-primary-container text-on-primary-container font-headline-md text-headline-md py-4 rounded-xl shadow-sm glow-effect active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer font-bold"
            >
              <span className="material-symbols-outlined">add</span>
              Add to Daily Diet
            </button>
          )}
        </div>
      </div>

      {/* REAL DEVICE CAMERA SCANNER MODAL */}
      <LiveCameraModal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
      />

      {/* 5,000 Food Nutrition Database Search & Portion Scaler */}
      <FoodSearchModal
        isOpen={showDbSearch}
        onClose={() => setShowDbSearch(false)}
      />
    </div>
  );
}
