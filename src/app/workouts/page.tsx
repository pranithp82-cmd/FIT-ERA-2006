"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  Dumbbell,
  Flame,
  Clock,
  Play,
  Check,
  Plus,
  Zap,
  Target,
  Trophy,
  ChevronRight,
  Filter,
} from "lucide-react";
import { WORKOUT_ROUTINES } from "@/lib/data";

export default function WorkoutsPage() {
  const router = useRouter();
  const { routines, startWorkout, activeWorkout } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedRoutine, setSelectedRoutine] = useState(routines[0]);

  const categories = ["All", "Hypertrophy", "Strength", "Cardio & Core"];

  const filteredRoutines =
    selectedCategory === "All"
      ? routines
      : routines.filter((r) => r.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/[0.08]">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#00F0FF]">
            TRAINING PROTOCOL // NOIR
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Workout Routines</h1>
          <p className="text-xs text-gray-400">
            Engineered hyper-tension volume splits with automated tempo cues and rest timers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-[#00F0FF] text-black font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                  : "bg-white/[0.05] text-gray-300 hover:bg-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Routine Cards Grid & Routine Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Routines List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <span className="text-xs font-mono text-gray-400 uppercase">AVAILABLE SPLITS ({filteredRoutines.length})</span>
          {filteredRoutines.map((routine) => {
            const isSelected = selectedRoutine.id === routine.id;
            const isCurrentlyActive = activeWorkout?.routine.id === routine.id;

            return (
              <div
                key={routine.id}
                onClick={() => setSelectedRoutine(routine)}
                className={`p-5 rounded-2xl cursor-pointer transition-all ${
                  isSelected
                    ? "glass-panel-glow border-[#00F0FF]/40 bg-[#10131E]"
                    : "glass-panel border-white/[0.08] hover:border-white/20"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md ${
                      routine.intensity === "Peak Performance"
                        ? "bg-[#FF385C]/15 text-[#FF385C] border border-[#FF385C]/30"
                        : "bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30"
                    }`}
                  >
                    {routine.intensity}
                  </span>
                  <div className="flex items-center gap-3 text-xs font-mono text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {routine.durationMinutes}m
                    </span>
                    <span className="flex items-center gap-1 text-gray-300">
                      <Flame className="w-3.5 h-3.5 text-[#00F0FF]" /> ~{routine.estimatedBurnKcal} kcal
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white">{routine.title}</h3>
                <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{routine.subtitle}</p>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                  <span className="text-[11px] font-mono text-gray-400">
                    {routine.exercises.length} Exercises Included
                  </span>
                  {isCurrentlyActive ? (
                    <span className="text-xs font-bold text-[#00F0FF] flex items-center gap-1 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-[#00F0FF]" /> In Progress
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startWorkout(routine);
                        router.push("/workout-tracker");
                      }}
                      className="px-3 py-1 rounded-lg bg-[#00F0FF]/15 text-[#00F0FF] hover:bg-[#00F0FF] hover:text-black text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <Play className="w-3 h-3 fill-current" /> Start
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Routine Detail (7 cols) */}
        <div className="lg:col-span-7 glass-panel p-6 sm:p-7 rounded-3xl border border-white/[0.08] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-[#00F0FF] uppercase tracking-widest">
                ROUTINE BLUEPRINT
              </span>
              <span className="text-xs font-mono text-gray-400">
                {selectedRoutine.exercises.length} Movements • {selectedRoutine.durationMinutes} Minutes
              </span>
            </div>

            <h2 className="text-2xl font-bold text-white">{selectedRoutine.title}</h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">{selectedRoutine.subtitle}</p>

            {/* Target muscle pills */}
            <div className="flex flex-wrap gap-1.5 my-4">
              {selectedRoutine.targetMuscles.map((muscle, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-xs font-mono text-gray-300"
                >
                  {muscle}
                </span>
              ))}
            </div>

            {/* Exercises detailed sequence */}
            <div className="space-y-3 my-6">
              <span className="text-xs font-mono uppercase text-gray-400">EXERCISE SEQUENCE</span>
              {selectedRoutine.exercises.map((ex, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-black/30 border border-white/5 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#00F0FF]/15 text-[#00F0FF] font-mono font-bold text-xs flex items-center justify-center border border-[#00F0FF]/30">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{ex.name}</h4>
                      <span className="text-xs font-mono text-gray-400">
                        {ex.targetSets} Sets × {ex.targetReps} Reps • {ex.restSeconds}s Rest Period
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-mono text-gray-400 hidden sm:block">
                    Tempo: 3-1-1-0
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span className="text-xs text-gray-300 font-mono">
                Log completed sets to sync with AI recovery model.
              </span>
            </div>

            <button
              onClick={() => {
                startWorkout(selectedRoutine);
                router.push("/workout-tracker");
              }}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#00F0FF] to-blue-500 text-black font-bold text-sm shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.7)] flex items-center gap-2 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Launch Live Workout</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
