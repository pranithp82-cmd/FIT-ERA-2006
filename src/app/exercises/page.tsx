"use client";

import React, { useState } from "react";
import { EXERCISE_DATABASE, ExerciseItem } from "@/lib/data";
import { useApp } from "@/context/AppContext";
import {
  Search,
  Filter,
  Zap,
  Dumbbell,
  Play,
  CheckCircle2,
  X,
  Sparkles,
  Flame,
} from "lucide-react";

export default function ExercisesPage() {
  const { showNotification } = useApp();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [activeExerciseModal, setActiveExerciseModal] = useState<ExerciseItem | null>(null);

  const categories = ["All", "Chest", "Shoulders", "Back", "Legs", "Arms", "Core"];

  const filteredExercises = EXERCISE_DATABASE.filter((ex) => {
    const matchesCategory = selectedCategory === "All" || ex.category === selectedCategory;
    const matchesSearch =
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.primaryMuscle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.equipment.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-white/[0.08] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#00F0FF]">
            BIOMECHANICS MOVEMENT DATABASE
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Exercise Library</h1>
          <p className="text-xs text-gray-400">
            Scientifically validated hypertrophy and strength movement patterns.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search exercises, muscles..."
            className="w-full glass-input rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white"
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-2xl text-xs font-medium transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? "bg-[#00F0FF] text-black font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                : "bg-white/[0.05] text-gray-300 hover:bg-white/10"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Exercises Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExercises.map((exercise) => (
          <div
            key={exercise.id}
            onClick={() => setActiveExerciseModal(exercise)}
            className="glass-panel p-5 rounded-3xl border border-white/[0.08] hover:border-[#00F0FF]/40 cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-md bg-[#00F0FF]/15 text-[#00F0FF] text-[10px] font-mono font-bold uppercase border border-[#00F0FF]/30">
                  {exercise.category}
                </span>
                <span className="text-[11px] font-mono text-gray-400">
                  {exercise.difficulty}
                </span>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-[#00F0FF] transition-colors">
                {exercise.name}
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Primary: <span className="text-gray-200 font-medium">{exercise.primaryMuscle}</span>
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono text-gray-400">
              <span>{exercise.equipment}</span>
              <span className="text-[#00F0FF] font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                View Protocol →
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Exercise Detail Modal */}
      {activeExerciseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="glass-panel-glow bg-[#10121A] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[#00F0FF]/40 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-xs font-mono uppercase text-[#00F0FF]">
                  {activeExerciseModal.category} • {activeExerciseModal.difficulty}
                </span>
                <h2 className="text-xl font-bold text-white mt-0.5">{activeExerciseModal.name}</h2>
              </div>
              <button
                onClick={() => setActiveExerciseModal(null)}
                className="w-8 h-8 rounded-xl bg-white/10 text-gray-400 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] text-gray-400 block">DEFAULT SETS</span>
                <span className="font-bold text-white">{activeExerciseModal.defaultSets} Sets</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] text-gray-400 block">REP RANGE</span>
                <span className="font-bold text-[#00F0FF]">{activeExerciseModal.defaultReps}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                <span className="text-[10px] text-gray-400 block">REST PERIOD</span>
                <span className="font-bold text-amber-400">{activeExerciseModal.restSeconds}s</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-mono uppercase text-gray-400 block mb-2">
                STEP-BY-STEP EXECUTION CUES
              </span>
              <div className="space-y-2">
                {activeExerciseModal.instructions.map((inst, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-gray-300">
                    <span className="w-5 h-5 rounded-md bg-[#00F0FF]/15 text-[#00F0FF] font-mono font-bold flex items-center justify-center flex-shrink-0 mt-0.5 text-[10px]">
                      {idx + 1}
                    </span>
                    <p className="leading-relaxed">{inst}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between text-xs font-mono">
              <span className="text-gray-400">Tempo Prescription</span>
              <span className="font-bold text-emerald-400">{activeExerciseModal.tempo} (Eccentric Focus)</span>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  showNotification(`Added ${activeExerciseModal.name} to Today's Routine`);
                  setActiveExerciseModal(null);
                }}
                className="w-full py-3 rounded-xl bg-[#00F0FF] text-black font-bold text-xs hover:bg-[#00F0FF]/90 shadow-[0_0_15px_rgba(0,240,255,0.4)] flex items-center justify-center gap-1.5"
              >
                <Zap className="w-4 h-4" /> Add to Today's Routine
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
