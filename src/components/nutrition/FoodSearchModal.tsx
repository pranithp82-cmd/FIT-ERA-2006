"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  X,
  Plus,
  Check,
  Filter,
  Flame,
  ShieldCheck,
  Sliders,
  ChevronRight,
  Info,
  Layers,
  Leaf,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { calculateScaledNutrition, extractBaseGrams, FoodNutritionData, ScaledNutritionResult } from "@/lib/nutrition/calculator";
import { useApp } from "@/context/AppContext";

interface FoodSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  defaultMealType?: "Breakfast" | "Lunch" | "Dinner" | "Snack";
  onFoodLogged?: (food: any) => void;
}

export default function FoodSearchModal({
  isOpen,
  onClose,
  initialQuery = "",
  defaultMealType = "Lunch",
  onFoodLogged,
}: FoodSearchModalProps) {
  const { logMeal, showNotification } = useApp();

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isVegetarian, setIsVegetarian] = useState<boolean>(false);
  const [isVegan, setIsVegan] = useState<boolean>(false);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);

  // Results State
  const [foods, setFoods] = useState<FoodNutritionData[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Selected Food Details State
  const [selectedFood, setSelectedFood] = useState<FoodNutritionData | null>(null);
  const [selectedPortionGrams, setSelectedPortionGrams] = useState<number>(100);
  const [mealType, setMealType] = useState<"Breakfast" | "Lunch" | "Dinner" | "Snack">(defaultMealType);
  const [showMicros, setShowMicros] = useState<boolean>(false);

  // Fetch Categories on Mount
  useEffect(() => {
    if (isOpen) {
      fetch("/api/foods/categories")
        .then((res) => res.json())
        .then((data) => {
          if (data.categories) {
            setCategories(data.categories);
          }
        })
        .catch(console.error);
    }
  }, [isOpen]);

  // Debounced Search Effect
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      fetchFoods(1);
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedCategory, isVegetarian, isVegan, isOpen]);

  const fetchFoods = async (targetPage = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.set("search", searchTerm.trim());
      if (selectedCategory && selectedCategory !== "All") params.set("category", selectedCategory);
      if (isVegetarian) params.set("vegetarian", "true");
      if (isVegan) params.set("vegan", "true");
      params.set("page", String(targetPage));
      params.set("limit", "25");

      const res = await fetch(`/api/foods?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setFoods(data.foods || []);
        setTotalCount(data.pagination?.total || 0);
        setPage(data.pagination?.page || 1);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching foods:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // When a food item is clicked, initialize portion
  const handleSelectFood = (food: FoodNutritionData) => {
    setSelectedFood(food);
    const base = extractBaseGrams(food.servingSize);
    setSelectedPortionGrams(base || 100);
  };

  // Compute live scaled nutrition for selected food
  const scaledNutrition: ScaledNutritionResult | null = useMemo(() => {
    if (!selectedFood) return null;
    return calculateScaledNutrition(selectedFood, selectedPortionGrams);
  }, [selectedFood, selectedPortionGrams]);

  // Add to today's food log
  const handleAddFoodToLog = () => {
    if (!selectedFood || !scaledNutrition) return;

    logMeal({
      name: `${selectedFood.name} (${scaledNutrition.portionLabel})`,
      mealType: mealType,
      calories: scaledNutrition.calories,
      protein: scaledNutrition.protein,
      carbs: scaledNutrition.carbs,
      fats: scaledNutrition.fat,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      ingredients: [
        `Category: ${selectedFood.category}`,
        `Fiber: ${scaledNutrition.fiber}g`,
        `Sodium: ${scaledNutrition.sodium}mg`,
        `Calcium: ${scaledNutrition.calcium}mg`,
      ],
    });

    showNotification(`🥗 Added "${selectedFood.name}" (${scaledNutrition.portionLabel}) to ${mealType}!`);
    if (onFoodLogged) onFoodLogged(selectedFood);
    setSelectedFood(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-surface rounded-2xl border border-outline shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-outline flex items-center justify-between bg-surface-container/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary-container text-primary-fixed flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-on-surface leading-tight">
                FIT ERA Nutrition Database
              </h2>
              <p className="text-[11px] font-mono text-on-surface-variant">
                5,000 Verified Food Records &amp; Custom Portions
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        {!selectedFood ? (
          /* ========================================================================= */
          /* VIEW 1: SEARCH & BROWSE FOODS                                             */
          /* ========================================================================= */
          <div className="flex-1 flex flex-col overflow-hidden p-4 space-y-3">
            {/* Search Input Box */}
            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-on-surface-variant" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search 5,000 foods (e.g. Chicken breast, Brown rice, Paneer, Idli)..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-surface-container border border-outline text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary-fixed focus:ring-2 focus:ring-primary-fixed/20 shadow-xs"
                autoFocus
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-3 text-on-surface-variant hover:text-on-surface"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Bar: Veg / Vegan & Categories */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
                {/* Veg / Vegan Toggles */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsVegetarian(!isVegetarian)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                      isVegetarian
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                        : "bg-surface border-outline text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    <Leaf className="w-3 h-3" />
                    <span>Vegetarian</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsVegan(!isVegan)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                      isVegan
                        ? "bg-emerald-700 text-white border-emerald-700 shadow-xs"
                        : "bg-surface border-outline text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Vegan</span>
                  </button>
                </div>

                <span className="text-[11px] font-mono text-on-surface-variant shrink-0">
                  {totalCount} foods found
                </span>
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("All")}
                  className={`px-3 py-1 rounded-full shrink-0 font-medium transition-all cursor-pointer border ${
                    selectedCategory === "All"
                      ? "bg-primary-fixed text-white border-primary-fixed font-bold shadow-xs"
                      : "bg-surface border-outline text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  All ({totalCount})
                </button>
                {categories.map((c) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setSelectedCategory(c.name)}
                    className={`px-3 py-1 rounded-full shrink-0 font-medium transition-all cursor-pointer border ${
                      selectedCategory === c.name
                        ? "bg-primary-fixed text-white border-primary-fixed font-bold shadow-xs"
                        : "bg-surface border-outline text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Food Results List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {isLoading ? (
                <div className="py-16 flex flex-col items-center justify-center gap-2">
                  <span className="w-6 h-6 rounded-full border-2 border-primary-fixed border-t-transparent animate-spin" />
                  <span className="text-xs font-mono text-on-surface-variant">
                    Searching 5,000 nutrition records...
                  </span>
                </div>
              ) : foods.length === 0 ? (
                <div className="py-16 text-center text-on-surface-variant space-y-2">
                  <p className="text-sm font-semibold text-on-surface">No foods found matching query.</p>
                  <p className="text-xs font-mono">
                    Try searching for: &quot;rice&quot;, &quot;chicken&quot;, &quot;banana&quot;, &quot;paneer&quot;, &quot;idli&quot;
                  </p>
                </div>
              ) : (
                foods.map((food) => (
                  <div
                    key={food.foodId || food.id}
                    onClick={() => handleSelectFood(food)}
                    className="p-3.5 rounded-xl bg-surface border border-outline hover:border-primary-fixed/50 hover:bg-surface-container/50 transition-all cursor-pointer flex items-center justify-between gap-3 group shadow-2xs"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-on-surface truncate group-hover:text-primary-fixed transition-colors">
                          {food.name}
                        </h4>
                        {food.vegetarian && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            VEG
                          </span>
                        )}
                        {food.vegan && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-green-500/10 text-green-700 border border-green-500/20">
                            VEGAN
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-mono text-on-surface-variant mt-0.5">
                        <span>{food.category}</span>
                        <span>•</span>
                        <span>{food.servingSize}</span>
                      </div>
                    </div>

                    {/* Quick Nutrition Badges */}
                    <div className="flex items-center gap-3 shrink-0 text-right">
                      <div>
                        <span className="text-sm font-bold text-on-surface block">
                          {food.calories} <span className="text-[10px] text-on-surface-variant font-normal">kcal</span>
                        </span>
                        <span className="text-[11px] font-mono font-bold text-primary-fixed">
                          {food.protein}g <span className="text-[9px] text-on-surface-variant font-normal">protein</span>
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-on-surface-variant group-hover:text-primary-fixed transition-colors" />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-2 border-t border-outline flex items-center justify-between text-xs text-on-surface-variant">
                <span>
                  Page {page} of {totalPages}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={page <= 1 || isLoading}
                    onClick={() => fetchFoods(page - 1)}
                    className="px-2.5 py-1 rounded-lg border border-outline hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages || isLoading}
                    onClick={() => fetchFoods(page + 1)}
                    className="px-2.5 py-1 rounded-lg border border-outline hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ========================================================================= */
          /* VIEW 2: SELECTED FOOD NUTRITION CALCULATOR & PORTION SCALER               */
          /* ========================================================================= */
          <div className="flex-1 flex flex-col overflow-y-auto p-5 space-y-4">
            {/* Back to Results */}
            <button
              type="button"
              onClick={() => setSelectedFood(null)}
              className="text-xs font-mono text-primary-fixed hover:underline flex items-center gap-1 cursor-pointer w-fit"
            >
              ← Back to search results
            </button>

            {/* Title & Metadata */}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-on-surface">{selectedFood.name}</h3>
                {selectedFood.vegetarian && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    Vegetarian
                  </span>
                )}
                {selectedFood.vegan && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-green-500/10 text-green-700 border border-green-500/20">
                    Vegan
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-on-surface-variant mt-0.5">
                Category: <strong>{selectedFood.category}</strong> • Base Serving: <strong>{selectedFood.servingSize}</strong>
              </p>
            </div>

            {/* Portion Selector */}
            <div className="p-4 rounded-xl bg-surface-container border border-outline space-y-3">
              <label className="text-xs font-mono font-bold text-on-surface-variant uppercase block">
                Select Portion / Serving Size:
              </label>

              {/* Portion Presets */}
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {[25, 50, 100, 150, 200, 300].map((grams) => (
                  <button
                    key={grams}
                    type="button"
                    onClick={() => setSelectedPortionGrams(grams)}
                    className={`py-2 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${
                      selectedPortionGrams === grams
                        ? "bg-primary-fixed text-white border-primary-fixed shadow-xs"
                        : "bg-surface border-outline text-on-surface hover:bg-surface-container"
                    }`}
                  >
                    {grams}g
                  </button>
                ))}
              </div>

              {/* Custom Grams Slider & Input */}
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="5"
                  value={selectedPortionGrams}
                  onChange={(e) => setSelectedPortionGrams(parseInt(e.target.value, 10))}
                  className="flex-1 accent-primary-fixed"
                />
                <div className="flex items-center gap-1 shrink-0">
                  <input
                    type="number"
                    min="1"
                    max="2000"
                    value={selectedPortionGrams}
                    onChange={(e) => setSelectedPortionGrams(Math.max(1, parseInt(e.target.value || "1", 10)))}
                    className="w-16 px-2 py-1 rounded bg-surface border border-outline text-xs text-center font-bold text-on-surface"
                  />
                  <span className="text-xs font-mono text-on-surface-variant">g</span>
                </div>
              </div>
            </div>

            {/* Scaled Nutritional Breakdown Card */}
            {scaledNutrition && (
              <div className="space-y-3">
                {/* Macro Percentage Split Bar */}
                <div>
                  <div className="flex justify-between text-[10px] font-mono font-bold mb-1">
                    <span className="text-primary-fixed">
                      Protein {scaledNutrition.macroPercentages.proteinPct}%
                    </span>
                    <span className="text-amber-600">
                      Carbs {scaledNutrition.macroPercentages.carbsPct}%
                    </span>
                    <span className="text-rose-500">
                      Fat {scaledNutrition.macroPercentages.fatPct}%
                    </span>
                  </div>
                  <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden flex">
                    <div
                      className="bg-primary-fixed transition-all"
                      style={{ width: `${scaledNutrition.macroPercentages.proteinPct}%` }}
                    />
                    <div
                      className="bg-amber-500 transition-all"
                      style={{ width: `${scaledNutrition.macroPercentages.carbsPct}%` }}
                    />
                    <div
                      className="bg-rose-500 transition-all"
                      style={{ width: `${scaledNutrition.macroPercentages.fatPct}%` }}
                    />
                  </div>
                </div>

                {/* Primary Macro Cards */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-3 rounded-xl bg-surface-container border border-outline">
                    <span className="text-[9px] font-mono text-on-surface-variant block uppercase">
                      Calories
                    </span>
                    <span className="font-bold text-on-surface text-lg">
                      {scaledNutrition.calories}
                      <span className="text-[10px] font-normal text-on-surface-variant ml-0.5">kcal</span>
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container border border-outline">
                    <span className="text-[9px] font-mono text-on-surface-variant block uppercase">
                      Protein
                    </span>
                    <span className="font-bold text-primary-fixed text-lg">
                      {scaledNutrition.protein}g
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container border border-outline">
                    <span className="text-[9px] font-mono text-on-surface-variant block uppercase">
                      Carbs
                    </span>
                    <span className="font-bold text-amber-600 text-lg">
                      {scaledNutrition.carbs}g
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container border border-outline">
                    <span className="text-[9px] font-mono text-on-surface-variant block uppercase">
                      Fats
                    </span>
                    <span className="font-bold text-rose-500 text-lg">
                      {scaledNutrition.fat}g
                    </span>
                  </div>
                </div>

                {/* Micronutrients Accordion Toggle */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowMicros(!showMicros)}
                    className="w-full py-2 px-3 rounded-lg bg-surface border border-outline text-xs font-semibold text-on-surface-variant hover:text-on-surface flex items-center justify-between cursor-pointer"
                  >
                    <span>Detailed Micronutrients (Vitamins &amp; Minerals)</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${showMicros ? "rotate-180" : ""}`}
                    />
                  </button>

                  {showMicros && (
                    <div className="mt-2 p-3 rounded-xl bg-surface-container border border-outline grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                      <div className="flex justify-between border-b border-outline/40 pb-1">
                        <span className="text-on-surface-variant">Dietary Fiber:</span>
                        <span className="font-bold text-on-surface">{scaledNutrition.fiber}g</span>
                      </div>
                      <div className="flex justify-between border-b border-outline/40 pb-1">
                        <span className="text-on-surface-variant">Sugar:</span>
                        <span className="font-bold text-on-surface">{scaledNutrition.sugar}g</span>
                      </div>
                      <div className="flex justify-between border-b border-outline/40 pb-1">
                        <span className="text-on-surface-variant">Sodium:</span>
                        <span className="font-bold text-on-surface">{scaledNutrition.sodium}mg</span>
                      </div>
                      <div className="flex justify-between border-b border-outline/40 pb-1">
                        <span className="text-on-surface-variant">Calcium:</span>
                        <span className="font-bold text-on-surface">{scaledNutrition.calcium}mg</span>
                      </div>
                      <div className="flex justify-between border-b border-outline/40 pb-1">
                        <span className="text-on-surface-variant">Iron:</span>
                        <span className="font-bold text-on-surface">{scaledNutrition.iron}mg</span>
                      </div>
                      <div className="flex justify-between border-b border-outline/40 pb-1">
                        <span className="text-on-surface-variant">Vitamin C:</span>
                        <span className="font-bold text-on-surface">{scaledNutrition.vitaminC}mg</span>
                      </div>
                      <div className="flex justify-between border-b border-outline/40 pb-1">
                        <span className="text-on-surface-variant">Vitamin A:</span>
                        <span className="font-bold text-on-surface">{scaledNutrition.vitaminA}µg</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Meal Type Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-on-surface-variant uppercase">
                    Log To Meal:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(["Breakfast", "Lunch", "Dinner", "Snack"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setMealType(type)}
                        className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          mealType === type
                            ? "bg-primary-fixed text-white border-primary-fixed shadow-xs"
                            : "bg-surface border-outline text-on-surface hover:bg-surface-container"
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Source Notice */}
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-800 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    Source: {selectedFood.sourceNote || "Generated estimate for FIT ERA development; replace with verified clinical reference values for medical nutrition."}
                  </p>
                </div>

                {/* Log Button */}
                <button
                  type="button"
                  onClick={handleAddFoodToLog}
                  className="w-full py-3 rounded-xl bg-primary-fixed text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-primary-fixed/90 shadow-sm cursor-pointer transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Log {selectedFood.name} ({scaledNutrition.portionLabel})</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
