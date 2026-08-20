"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { EXERCISE_DATABASE, ExerciseItem } from "@/lib/data";
import {
  ArrowLeft,
  Search,
  X,
  CheckCircle2,
  Circle,
  Plus,
  ArrowRight,
} from "lucide-react";

export default function SelectWorkoutPage() {
  const router = useRouter();
  const { startWorkout, showNotification } = useApp();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedWorkouts, setSelectedWorkouts] = useState<Set<string>>(new Set());

  const categories = ["All", "Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio"];

  const filteredWorkouts = EXERCISE_DATABASE.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.primaryMuscle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      w.equipment.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || w.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleSelection = (id: string) => {
    setSelectedWorkouts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAllVisible = () => {
    setSelectedWorkouts((prev) => {
      const next = new Set(prev);
      filteredWorkouts.forEach((w) => next.add(w.id));
      return next;
    });
  };

  const handleClearSelection = () => {
    setSelectedWorkouts(new Set());
  };

  const handleAddToTodayWorkout = () => {
    const selectedList = EXERCISE_DATABASE.filter((w) => selectedWorkouts.has(w.id));
    if (selectedList.length === 0) return;

    showNotification(`⚡ Started session with ${selectedList.length} exercises!`);

    startWorkout({
      id: `custom_split_${Date.now()}`,
      title: `${selectedList[0]?.name || "Custom"} + Multi-Split`,
      subtitle: `${selectedList.length} Movements • Precision Logged`,
      category: "Hypertrophy",
      durationMinutes: Math.max(30, selectedList.length * 12),
      estimatedBurnKcal: selectedList.length * 90,
      intensity: "High",
      targetMuscles: Array.from(new Set(selectedList.map((s) => s.category))),
      exercises: selectedList.map((w, idx) => ({
        exerciseId: `sel_${w.id}_${idx}`,
        name: w.name,
        targetSets: w.defaultSets || 3,
        targetReps: w.defaultReps || "10-12",
        restSeconds: w.restSeconds || 75,
        sets: Array.from({ length: w.defaultSets || 3 }).map((_, sIdx) => ({
          setNumber: sIdx + 1,
          weightKg: 60,
          reps: 10,
          completed: false,
        })),
      })),
    });

    router.push("/workout-tracker");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-32 flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-outline">
        <Link
          href="/workout-tracker"
          className="inline-flex items-center gap-2 text-xs font-semibold text-on-surface-variant hover:text-primary-fixed transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Workout Tracker</span>
        </Link>
      </div>

      <div>
        <span className="text-xs font-mono uppercase tracking-wider text-primary-fixed font-bold">
          ROUTINE BUILDER
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-on-surface mt-1">
          Select Exercises
        </h1>
        <p className="text-sm text-on-surface-variant">
          Pick exercises from the 50-movement library to build your custom training session.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by exercise name or focus..."
          className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-surface border border-outline text-on-surface text-sm focus:border-primary-fixed outline-none shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category Pills & Bulk Selection */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-primary-fixed text-white shadow-sm"
                  : "bg-surface border border-outline text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 shrink-0 text-xs">
          {selectedWorkouts.size > 0 && (
            <button
              onClick={handleClearSelection}
              className="text-red-600 hover:underline font-semibold"
            >
              Clear Selection
            </button>
          )}
          <button
            onClick={handleSelectAllVisible}
            className="text-primary-fixed hover:underline font-semibold"
          >
            Select All Filtered
          </button>
        </div>
      </div>

      {/* Workouts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filteredWorkouts.length === 0 ? (
          <div className="sm:col-span-2 text-center py-12 text-on-surface-variant bg-surface rounded-xl border border-outline">
            <p className="text-sm">No exercises found matching "{searchQuery}"</p>
          </div>
        ) : (
          filteredWorkouts.map((workout) => {
            const isSelected = selectedWorkouts.has(workout.id);
            return (
              <div
                key={workout.id}
                onClick={() => toggleSelection(workout.id)}
                className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-all shadow-sm ${
                  isSelected
                    ? "bg-primary-container/30 border-primary-fixed"
                    : "bg-surface border-outline hover:border-primary-fixed/40"
                }`}
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-primary-container text-primary-fixed">
                      {workout.category}
                    </span>
                    <span className="text-[10px] text-on-surface-variant font-mono">
                      {workout.difficulty}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-on-surface">{workout.name}</h4>
                  <span className="text-xs text-on-surface-variant">
                    {workout.primaryMuscle} • {workout.equipment}
                  </span>
                </div>

                <div className="shrink-0 ml-3">
                  {isSelected ? (
                    <CheckCircle2 className="w-5 h-5 text-primary-fixed fill-current" />
                  ) : (
                    <Circle className="w-5 h-5 text-on-surface-variant" />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-md border-t border-outline p-4 shadow-lg md:pl-64">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <span className="text-xs text-on-surface-variant block">Selected Movements</span>
            <span className="text-base font-bold text-on-surface">
              {selectedWorkouts.size} {selectedWorkouts.size === 1 ? "Exercise" : "Exercises"}
            </span>
          </div>

          <button
            onClick={handleAddToTodayWorkout}
            disabled={selectedWorkouts.size === 0}
            className="px-6 py-2.5 rounded-lg bg-primary-fixed text-white font-bold text-xs shadow-sm hover:bg-primary-fixed/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            <span>Add to Today's Workout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
