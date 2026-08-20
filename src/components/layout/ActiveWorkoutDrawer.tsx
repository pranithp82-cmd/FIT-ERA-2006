"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import {
  Play,
  Pause,
  Check,
  ChevronUp,
  ChevronDown,
  Timer,
  X,
  Trophy,
  Flame,
  Zap,
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function ActiveWorkoutDrawer() {
  const {
    activeWorkout,
    pauseWorkout,
    resumeWorkout,
    finishWorkout,
    cancelWorkout,
    toggleSetComplete,
    updateSetDetails,
    startRestTimer,
    skipRestTimer,
  } = useApp();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);

  if (!activeWorkout || !activeWorkout.isActive) return null;

  const currentExercise = activeWorkout.routine.exercises[activeWorkout.activeExerciseIndex] || activeWorkout.routine.exercises[0];

  const totalSets = activeWorkout.routine.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const completedSets = activeWorkout.routine.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
    0
  );
  const progressPct = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  const formatSeconds = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <>
      {/* Floating Mini Player / Bottom Banner */}
      <div className="fixed bottom-16 lg:bottom-4 left-4 right-4 max-w-4xl mx-auto z-40">
        <div className="glass-panel-glow bg-[#10121A]/95 rounded-2xl p-3 border border-[#00F0FF]/30 shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
          {/* Rest Timer Active Banner */}
          {activeWorkout.isResting && activeWorkout.restTimerSeconds > 0 && (
            <div className="mb-2 px-3 py-1.5 rounded-xl bg-[#00F0FF]/15 border border-[#00F0FF]/40 flex items-center justify-between animate-pulse">
              <div className="flex items-center gap-2">
                <Timer className="w-4 h-4 text-[#00F0FF]" />
                <span className="text-xs font-semibold text-white">REST PERIOD</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-base font-bold text-[#00F0FF]">
                  {formatSeconds(activeWorkout.restTimerSeconds)}
                </span>
                <button
                  onClick={skipRestTimer}
                  className="text-[11px] font-bold uppercase tracking-wider text-gray-300 hover:text-white px-2 py-0.5 rounded bg-white/10"
                >
                  Skip
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            {/* Left: Info */}
            <div
              className="flex items-center gap-3 flex-1 cursor-pointer overflow-hidden"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00F0FF] to-blue-600 p-0.5 flex-shrink-0">
                <div className="w-full h-full bg-[#0E1017] rounded-[10px] flex items-center justify-center">
                  <Flame className="w-5 h-5 text-[#00F0FF] animate-pulse" />
                </div>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white truncate">
                    {activeWorkout.routine.title}
                  </span>
                  <span className="text-[10px] font-mono text-[#00F0FF] px-1.5 py-0.2 rounded bg-[#00F0FF]/10 border border-[#00F0FF]/20">
                    {progressPct}%
                  </span>
                </div>
                <span className="text-[11px] text-gray-400 truncate">
                  {currentExercise ? currentExercise.name : "Active Session"} • {completedSets}/{totalSets} sets done
                </span>
              </div>
            </div>

            {/* Center / Right: Controls */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="font-mono text-sm font-bold text-white bg-black/40 px-2.5 py-1 rounded-lg border border-white/10">
                {formatSeconds(activeWorkout.elapsedSeconds)}
              </div>

              <button
                onClick={activeWorkout.isPaused ? resumeWorkout : pauseWorkout}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
                title={activeWorkout.isPaused ? "Resume" : "Pause"}
              >
                {activeWorkout.isPaused ? <Play className="w-4 h-4 text-[#00F0FF]" /> : <Pause className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setShowFinishModal(true)}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-black text-xs font-bold flex items-center gap-1 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:opacity-90 transition-all"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span className="hidden sm:inline">Finish</span>
              </button>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-gray-400 hover:text-white p-1"
                title="Expand View"
              >
                {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Progress bar line */}
          <div className="w-full bg-white/5 h-1 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#00F0FF] to-blue-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Full Screen Live Training Modal Drawer */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 bg-[#090A0F]/95 backdrop-blur-2xl overflow-y-auto p-4 sm:p-6 lg:p-8 flex flex-col">
          <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-[#00F0FF]">LIVE WORKOUT SESSION</span>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-0.5">{activeWorkout.routine.title}</h2>
                <p className="text-xs text-gray-400">{activeWorkout.routine.subtitle}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="font-mono text-xl font-bold text-[#00F0FF] bg-[#00F0FF]/10 px-3 py-1 rounded-xl border border-[#00F0FF]/25">
                  {formatSeconds(activeWorkout.elapsedSeconds)}
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Rest Timer Widget if active */}
            {activeWorkout.isResting && (
              <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-[#00F0FF]/20 to-blue-900/30 border border-[#00F0FF]/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#00F0FF]/20 flex items-center justify-center">
                    <Timer className="w-6 h-6 text-[#00F0FF] animate-spin" />
                  </div>
                  <div>
                    <div className="text-xs font-mono text-[#00F0FF] uppercase">Rest & Hydrate</div>
                    <div className="text-lg font-bold text-white font-mono">
                      {formatSeconds(activeWorkout.restTimerSeconds)} REMAINING
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startRestTimer(activeWorkout.restTimerSeconds + 30)}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white"
                  >
                    +30s
                  </button>
                  <button
                    onClick={skipRestTimer}
                    className="px-3 py-1.5 rounded-lg bg-[#00F0FF] text-black text-xs font-bold hover:bg-[#00F0FF]/80"
                  >
                    Skip Rest
                  </button>
                </div>
              </div>
            )}

            {/* Exercises & Sets Checklist */}
            <div className="flex-1 space-y-4 my-6">
              {activeWorkout.routine.exercises.map((exercise, exIdx) => {
                const exCompleted = exercise.sets.every((s) => s.completed);
                return (
                  <div
                    key={exercise.exerciseId}
                    className={`rounded-2xl p-4 sm:p-5 transition-all ${
                      exCompleted
                        ? "bg-emerald-950/20 border border-emerald-500/30"
                        : "glass-panel border border-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-white/10 text-white text-xs font-mono font-bold flex items-center justify-center">
                          {exIdx + 1}
                        </span>
                        <div>
                          <h3 className="font-bold text-white text-base">{exercise.name}</h3>
                          <span className="text-xs text-gray-400 font-mono">
                            Target: {exercise.targetSets} Sets • {exercise.targetReps} Reps • {exercise.restSeconds}s Rest
                          </span>
                        </div>
                      </div>
                      {exCompleted && (
                        <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Done
                        </span>
                      )}
                    </div>

                    {/* Sets Grid */}
                    <div className="space-y-2">
                      <div className="grid grid-cols-12 text-[11px] font-mono text-gray-400 px-3 py-1">
                        <span className="col-span-2">SET</span>
                        <span className="col-span-4">WEIGHT (KG)</span>
                        <span className="col-span-4">REPS</span>
                        <span className="col-span-2 text-right">DONE</span>
                      </div>

                      {exercise.sets.map((set, setIdx) => (
                        <div
                          key={set.setNumber}
                          className={`grid grid-cols-12 items-center px-3 py-2 rounded-xl transition-all ${
                            set.completed
                              ? "bg-emerald-500/10 border border-emerald-500/30"
                              : "bg-black/30 border border-white/5 hover:border-white/15"
                          }`}
                        >
                          <span className="col-span-2 font-mono text-xs font-bold text-gray-300">
                            #{set.setNumber}
                          </span>

                          <div className="col-span-4 flex items-center gap-1.5">
                            <button
                              onClick={() =>
                                updateSetDetails(exIdx, setIdx, Math.max(0, set.weightKg - 2.5), set.reps)
                              }
                              className="w-6 h-6 rounded bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white flex items-center justify-center text-xs"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input
                              type="number"
                              value={set.weightKg}
                              onChange={(e) =>
                                updateSetDetails(exIdx, setIdx, parseFloat(e.target.value) || 0, set.reps)
                              }
                              className="w-14 bg-black/50 text-center font-mono text-sm font-bold text-white rounded px-1 py-0.5 border border-white/10"
                            />
                            <button
                              onClick={() => updateSetDetails(exIdx, setIdx, set.weightKg + 2.5, set.reps)}
                              className="w-6 h-6 rounded bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white flex items-center justify-center text-xs"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="col-span-4 flex items-center gap-1.5">
                            <button
                              onClick={() =>
                                updateSetDetails(exIdx, setIdx, set.weightKg, Math.max(0, set.reps - 1))
                              }
                              className="w-6 h-6 rounded bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white flex items-center justify-center text-xs"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input
                              type="number"
                              value={set.reps}
                              onChange={(e) =>
                                updateSetDetails(exIdx, setIdx, set.weightKg, parseInt(e.target.value) || 0)
                              }
                              className="w-12 bg-black/50 text-center font-mono text-sm font-bold text-white rounded px-1 py-0.5 border border-white/10"
                            />
                            <button
                              onClick={() => updateSetDetails(exIdx, setIdx, set.weightKg, set.reps + 1)}
                              className="w-6 h-6 rounded bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white flex items-center justify-center text-xs"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="col-span-2 flex justify-end">
                            <button
                              onClick={() => toggleSetComplete(exIdx, setIdx)}
                              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                                set.completed
                                  ? "bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                                  : "bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white"
                              }`}
                            >
                              <Check className={`w-4 h-4 ${set.completed ? "stroke-[3]" : ""}`} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <button
                onClick={cancelWorkout}
                className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-semibold border border-red-500/20"
              >
                Cancel Session
              </button>
              <button
                onClick={() => setShowFinishModal(true)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00F0FF] to-blue-500 text-black font-bold text-sm shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.7)] flex items-center gap-2"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                Finish Workout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workout Completion Modal */}
      {showFinishModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="glass-panel-glow bg-[#10121A] rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#00F0FF]/40 text-center shadow-[0_0_50px_rgba(0,240,255,0.2)]">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00F0FF] to-emerald-400 p-0.5 mx-auto mb-4">
              <div className="w-full h-full bg-[#0E1017] rounded-[14px] flex items-center justify-center">
                <Trophy className="w-8 h-8 text-[#00F0FF] animate-bounce" />
              </div>
            </div>

            <span className="text-xs font-mono text-[#00F0FF] uppercase tracking-widest">VICTORY • SESSION LOGGED</span>
            <h2 className="text-2xl font-black text-white mt-1">Outstanding Performance!</h2>
            <p className="text-xs text-gray-400 mt-1">
              You crushed {activeWorkout.routine.title} with high mechanical tension and disciplined tempo.
            </p>

            <div className="grid grid-cols-3 gap-2 my-6 p-4 rounded-2xl bg-black/40 border border-white/10">
              <div>
                <span className="text-[10px] text-gray-400 font-mono">DURATION</span>
                <div className="text-lg font-bold font-mono text-white">
                  {Math.round(activeWorkout.elapsedSeconds / 60)}m
                </div>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-mono">EST. BURN</span>
                <div className="text-lg font-bold font-mono text-[#00F0FF]">
                  ~{activeWorkout.routine.estimatedBurnKcal} kcal
                </div>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-mono">SETS DONE</span>
                <div className="text-lg font-bold font-mono text-emerald-400">
                  {completedSets}/{totalSets}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFinishModal(false)}
                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-gray-300"
              >
                Keep Training
              </button>
              <button
                onClick={() => {
                  setShowFinishModal(false);
                  setIsExpanded(false);
                  finishWorkout();
                }}
                className="flex-1 py-3 rounded-xl bg-[#00F0FF] text-black text-xs font-bold hover:bg-[#00F0FF]/90 shadow-[0_0_20px_rgba(0,240,255,0.4)]"
              >
                Save & Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
