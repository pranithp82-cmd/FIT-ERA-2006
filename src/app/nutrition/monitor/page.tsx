"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  ArrowLeft,
  Camera,
  Calendar,
  Clock,
  CheckCircle2,
  Utensils,
  Plus,
  X,
  Sparkles,
  Flame,
  ZoomIn,
  Eye,
  Filter,
} from "lucide-react";

export default function MealMonitorPage() {
  const router = useRouter();
  const { dailyMealMonitorLogs, uploadDailyMealPhoto, showNotification } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadMealType, setUploadMealType] = useState<"Breakfast" | "Lunch" | "Dinner" | "Snacks">("Breakfast");
  const [uploadMealName, setUploadMealName] = useState("");
  const [uploadCalories, setUploadCalories] = useState(420);
  const [uploadProtein, setUploadProtein] = useState(30);
  const [uploadCarbs, setUploadCarbs] = useState(45);
  const [uploadFats, setUploadFats] = useState(12);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sample default entries if empty so user has immediate visual feedback
  const defaultSampleLogs = [
    {
      id: "sample_breakfast",
      date: new Date().toISOString().split("T")[0],
      dayName: "Today",
      mealType: "Breakfast" as const,
      name: "Oatmeal with Berries & Country Eggs",
      calories: 380,
      protein: 26,
      carbs: 48,
      fats: 8,
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBWq5G4RRoW9LzPk36Xrvl8zU3CZVV8hxha0lkkjBHW9ECmwhGZ9xFsDk4uBup0l0hXCeVrQrKDBbjPxtgCIVL8ZjqM3ixMAE_C6N3ctg9eSjapS0WE_2Qxtzc3AzxVpX_enQ5UepRtS7Uig68fZFklsBWo2FyX8o_vfXcQGPyOJYhyFa_Zyeyj5DLa68ikPlgTL14Qm2e9N5F2rWWL2ChYhHSm7VS91sjuJeztJvTYUew6SnLS4ksszw",
      completed: true,
      loggedAt: "Today, 08:30 AM",
    },
    {
      id: "sample_lunch",
      date: new Date().toISOString().split("T")[0],
      dayName: "Today",
      mealType: "Lunch" as const,
      name: "Sprouted Moong Dal & Palak Poriyal Bowl",
      calories: 490,
      protein: 28,
      carbs: 64,
      fats: 11,
      imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDBjen43HKALX6v-TkV4Q_kI_iIVubGkLUWESob8eU35SWc5WqpH46y88x2HU7fOrQ9j5gj3pdeWHHN3xq8Ajji5JvEoq1Ym1Hqznz4iiht9ELwSyzbzVLMrH_bTRw_VPYoBAXcJkbhKDWmxQQQDm8hMzUpmpFAySiZqOg4vnFx30gVp05VzOS0T0Un6Ez1dsGc7EXU_HW_tbzk7zCLfzeXLuQxp5dgoedwphjqr22U39dFGgINtt5tpg",
      completed: true,
      loggedAt: "Today, 01:15 PM",
    },
  ];

  const allLogs = dailyMealMonitorLogs.length > 0 ? dailyMealMonitorLogs : defaultSampleLogs;

  const filteredLogs = allLogs.filter((log) => {
    if (selectedCategory === "All") return true;
    return log.mealType.toLowerCase() === selectedCategory.toLowerCase();
  });

  // Handle local image upload preview
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveMealUpload = () => {
    if (!previewImage) {
      showNotification("⚠️ Please select or capture a meal photo first.");
      return;
    }

    uploadDailyMealPhoto(
      uploadMealType,
      previewImage,
      uploadMealName || `${uploadMealType} Meal`,
      {
        calories: uploadCalories,
        protein: uploadProtein,
        carbs: uploadCarbs,
        fats: uploadFats,
      }
    );

    setShowUploadModal(false);
    setPreviewImage(null);
    setUploadMealName("");
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen pb-28">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-margin-mobile py-6 flex flex-col gap-4">
        <div className="flex items-center justify-between pb-3 border-b border-outline">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-on-surface-variant hover:text-primary-fixed transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>

          <button
            onClick={() => setShowUploadModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-primary-fixed text-on-primary-fixed text-xs font-bold shadow-sm hover:brightness-110 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Log Meal Photo</span>
          </button>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-primary-fixed font-bold">
              DAILY MEAL MONITOR // TELEMETRY
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] font-mono font-bold">
              Photo Verified
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface mt-1">
            Meal Monitor History &amp; Photo Logs
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            Visual diary of all your daily meals, timestamped photos, macro analysis, and completion statuses.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {["All", "Breakfast", "Lunch", "Dinner", "Snacks"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-primary-fixed text-white shadow-sm"
                  : "bg-surface border border-outline text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Meal Logs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {filteredLogs.map((item) => (
            <div
              key={item.id}
              className="bg-surface rounded-2xl border border-outline p-4 flex flex-col justify-between gap-3 shadow-sm hover:border-primary-fixed/40 transition-all group"
            >
              <div className="flex gap-3">
                {/* Photo Thumbnail */}
                <div
                  onClick={() => item.imageUrl && setZoomedImage(item.imageUrl)}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-surface-container-high border border-outline overflow-hidden shrink-0 relative cursor-pointer group/img"
                >
                  {item.imageUrl ? (
                    <>
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                        <ZoomIn className="w-5 h-5 text-white" />
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-on-surface-variant text-xs">
                      <Utensils className="w-6 h-6 mb-1 opacity-50" />
                      <span>No Photo</span>
                    </div>
                  )}
                </div>

                {/* Meal Details */}
                <div className="flex flex-col justify-between flex-1 min-w-0">
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-primary-container text-primary-fixed">
                        {item.mealType}
                      </span>
                      <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Completed</span>
                      </div>
                    </div>

                    <h3 className="text-sm font-bold text-on-surface line-clamp-1">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant font-mono mt-0.5">
                      <Clock className="w-3 h-3 text-on-surface-variant" />
                      <span>{item.loggedAt}</span>
                    </div>
                  </div>

                  {/* Macro Pills */}
                  <div className="grid grid-cols-4 gap-1.5 text-center mt-2 pt-2 border-t border-outline">
                    <div className="p-1 rounded bg-surface-container-high border border-outline">
                      <span className="text-[9px] text-on-surface-variant block font-mono">Calories</span>
                      <span className="text-xs font-bold font-mono text-on-surface">{item.calories}</span>
                    </div>
                    <div className="p-1 rounded bg-surface-container-high border border-outline">
                      <span className="text-[9px] text-on-surface-variant block font-mono">Protein</span>
                      <span className="text-xs font-bold font-mono text-primary-fixed">{item.protein}g</span>
                    </div>
                    <div className="p-1 rounded bg-surface-container-high border border-outline">
                      <span className="text-[9px] text-on-surface-variant block font-mono">Carbs</span>
                      <span className="text-xs font-bold font-mono text-on-surface">{item.carbs}g</span>
                    </div>
                    <div className="p-1 rounded bg-surface-container-high border border-outline">
                      <span className="text-[9px] text-on-surface-variant block font-mono">Fats</span>
                      <span className="text-xs font-bold font-mono text-on-surface">{item.fats}g</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL: PHOTO FULLSCREEN ZOOM                                              */}
      {/* ========================================================================= */}
      {zoomedImage && (
        <div
          onClick={() => setZoomedImage(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer animate-fadeIn"
        >
          <div className="relative max-w-2xl max-h-[85vh] rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
            <img src={zoomedImage} alt="Zoomed Meal" className="w-full h-full object-contain" />
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: UPLOAD NEW MEAL PHOTO                                              */}
      {/* ========================================================================= */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-surface border border-outline rounded-2xl w-full max-w-md p-6 flex flex-col gap-4 shadow-2xl animate-scaleUp">
            <div className="flex items-center justify-between border-b border-outline pb-3">
              <div className="flex items-center gap-2 text-primary-fixed">
                <Camera className="w-5 h-5" />
                <h3 className="text-lg font-bold text-on-surface">Log Meal Photo</h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Meal Type Selection */}
            <div className="flex items-center gap-1.5">
              {(["Breakfast", "Lunch", "Dinner", "Snacks"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setUploadMealType(type)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    uploadMealType === type
                      ? "bg-primary-fixed text-white shadow-sm"
                      : "bg-surface-container-high border border-outline text-on-surface-variant"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Photo Capture / Upload Area */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-44 rounded-xl border-2 border-dashed border-primary-fixed/40 bg-surface-container-high flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary-fixed overflow-hidden relative"
            >
              {previewImage ? (
                <>
                  <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs font-mono font-bold opacity-0 hover:opacity-100 transition-opacity">
                    Change Photo
                  </div>
                </>
              ) : (
                <>
                  <Camera className="w-8 h-8 text-primary-fixed" />
                  <span className="text-xs font-bold text-on-surface">
                    Tap to Open Camera or Choose Photo
                  </span>
                  <span className="text-[10px] text-on-surface-variant">
                    JPG, PNG, WebP supported
                  </span>
                </>
              )}
            </div>

            {/* Meal Name Input */}
            <div>
              <label className="text-xs font-bold text-on-surface-variant block mb-1">
                Meal Description / Name
              </label>
              <input
                type="text"
                value={uploadMealName}
                onChange={(e) => setUploadMealName(e.target.value)}
                placeholder="e.g., Egg Dosa & Sambar, Grilled Fish..."
                className="w-full px-3 py-2 rounded-xl bg-surface border border-outline text-sm text-on-surface outline-none focus:border-primary-fixed"
              />
            </div>

            {/* Macros Input */}
            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="text-[10px] text-on-surface-variant block mb-0.5">Calories</label>
                <input
                  type="number"
                  value={uploadCalories}
                  onChange={(e) => setUploadCalories(parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1 text-center font-mono text-xs font-bold bg-surface border border-outline rounded-lg"
                />
              </div>
              <div>
                <label className="text-[10px] text-on-surface-variant block mb-0.5">Protein (g)</label>
                <input
                  type="number"
                  value={uploadProtein}
                  onChange={(e) => setUploadProtein(parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1 text-center font-mono text-xs font-bold bg-surface border border-outline rounded-lg text-primary-fixed"
                />
              </div>
              <div>
                <label className="text-[10px] text-on-surface-variant block mb-0.5">Carbs (g)</label>
                <input
                  type="number"
                  value={uploadCarbs}
                  onChange={(e) => setUploadCarbs(parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1 text-center font-mono text-xs font-bold bg-surface border border-outline rounded-lg"
                />
              </div>
              <div>
                <label className="text-[10px] text-on-surface-variant block mb-0.5">Fats (g)</label>
                <input
                  type="number"
                  value={uploadFats}
                  onChange={(e) => setUploadFats(parseInt(e.target.value) || 0)}
                  className="w-full px-2 py-1 text-center font-mono text-xs font-bold bg-surface border border-outline rounded-lg"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-outline text-xs font-semibold text-on-surface hover:bg-surface-container"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveMealUpload}
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
