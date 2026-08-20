"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp, SimpleWeakMuscleProtocol } from "@/context/AppContext";
import {
  Flame,
  Zap,
  Activity,
  Heart,
  Dumbbell,
  Clock,
  ArrowRight,
  ChevronRight,
  Plus,
  Play,
  Pause,
  CheckCircle2,
  Layers,
  X,
  Check,
  Timer,
  Trash2,
  History,
  Sparkles,
  Award,
  Sliders,
  ListChecks,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { EXERCISE_DATABASE, ExerciseItem } from "@/lib/data";

interface WeakMuscleProtocol {
  id: string;
  muscleName: string;
  lagRegion: string;
  deficitText: string;
  severity: "high" | "moderate";
  causeAnalysis: string;
  targetCategory: string;
  exercises: {
    name: string;
    targetSets: number;
    targetReps: string;
    startingKg: number;
    restSeconds: number;
    focusNote: string;
  }[];
}

const WEAK_MUSCLE_PROTOCOLS: WeakMuscleProtocol[] = [
  {
    id: "left_hamstring",
    muscleName: "Left Hamstring (Posterior Chain)",
    lagRegion: "Lower Limbs / Posterior Thigh",
    deficitText: "3.8% Bilateral Symmetry Delta vs Right Leg",
    severity: "high",
    causeAnalysis: "DEXA Leg Partitioning indicates left hamstring (10.6 kg) deficit vs right hamstring (11.0 kg). Quad-dominant squats limit unilateral posterior recruitment.",
    targetCategory: "Hamstrings / Posterior Symmetry",
    exercises: [
      {
        name: "Single-Leg Romanian Deadlift (Left Leg Focus)",
        targetSets: 3,
        targetReps: "8-10",
        startingKg: 24,
        restSeconds: 75,
        focusNote: "Hinge at hip, load left hamstring under deep eccentric tension",
      },
      {
        name: "Unilateral Seated Leg Curl (Left Leg)",
        targetSets: 4,
        targetReps: "12-15",
        startingKg: 35,
        restSeconds: 60,
        focusNote: "Pause 1s at peak knee flexion, controlled 3s negative",
      },
    ],
  },
  {
    id: "rear_delts",
    muscleName: "Rear Deltoids & Rotators",
    lagRegion: "Shoulder Girdle / Posterior Capsule",
    deficitText: "5.1% Push-to-Pull Structural Imbalance",
    severity: "moderate",
    causeAnalysis: "Anterior deltoids overcompensate during chest presses, creating anterior humeral glide and postural lag.",
    targetCategory: "Shoulders / Postural Balance",
    exercises: [
      {
        name: "Unilateral Rear Delt Cable Flye",
        targetSets: 4,
        targetReps: "15",
        startingKg: 10,
        restSeconds: 60,
        focusNote: "Elbow slightly bent, pull at 45° angle without trap shrugging",
      },
      {
        name: "Face Pull with External Rotation",
        targetSets: 4,
        targetReps: "15",
        startingKg: 25,
        restSeconds: 60,
        focusNote: "Rope to forehead, externally rotate wrists at top of contraction",
      },
    ],
  },
  {
    id: "upper_chest",
    muscleName: "Clavicular (Upper) Chest",
    lagRegion: "Pectoralis Major / Clavicular Head",
    deficitText: "3.5% Lag vs Sternal Chest Head",
    severity: "moderate",
    causeAnalysis: "Flat bench press dominance has concentrated mass in the mid/lower pectorals, leaving upper clavicular fibers under-stimulated.",
    targetCategory: "Chest / Clavicular Mass",
    exercises: [
      {
        name: "30° Incline Dumbbell Press (Deep Stretch)",
        targetSets: 4,
        targetReps: "8-10",
        startingKg: 32,
        restSeconds: 90,
        focusNote: "Lower dumbbells until chest stretch is felt, drive elbows inward",
      },
      {
        name: "Low-to-High Incline Cable Flye",
        targetSets: 3,
        targetReps: "12-15",
        startingKg: 15,
        restSeconds: 60,
        focusNote: "Scoop cables upward to eye-level to hit upper clavicular fibers",
      },
    ],
  },
];

export default function WorkoutTrackerPage() {
  const {
    user,
    workoutHistory,
    deleteWorkoutHistory,
    recordCompletedWorkoutLog,
    startWorkout,
    pauseWorkout,
    resumeWorkout,
    finishWorkout,
    cancelWorkout,
    toggleSetComplete,
    updateSetDetails,
    completeAllSetsForExercise,
    addSetToExercise,
    removeSetFromExercise,
    addExerciseToActiveWorkout,
    skipRestTimer,
    showNotification,
    activeWorkout,
    hasDxaReport,
    activeWeakMuscles,
  } = useApp();

  // Modals & State
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showDxaModal, setShowDxaModal] = useState(false);
  const [historyFilter, setHistoryFilter] = useState<string>("All");
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(workoutHistory[0]?.id || null);
  const [showRecentCardDetails, setShowRecentCardDetails] = useState(false);
  const [showMonitorWorkouts, setShowMonitorWorkouts] = useState(false);
  const [completedMonitorWorkoutIds, setCompletedMonitorWorkoutIds] = useState<string[]>([]);
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState<number | null>(null);
  const [weightUnit, setWeightUnit] = useState<"lbs" | "kg">("lbs");
  const [selectedWeakMuscleId, setSelectedWeakMuscleId] = useState<string>("left_hamstring");
  const [showDxaDetails, setShowDxaDetails] = useState(false);
  // Custom workout form
  const [customTitle, setCustomTitle] = useState("Custom Training Session");
  const [customTarget, setCustomTarget] = useState("Full Body");
  const [customExercises, setCustomExercises] = useState<
    { name: string; sets: number; reps: string; weight: number; category?: string }[]
  >([]);
  const [newExName, setNewExName] = useState("");
  const [modalSearchQuery, setModalSearchQuery] = useState("");
  const [modalMuscleFilter, setModalMuscleFilter] = useState("All");

  const formatSeconds = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleAddFromLibrary = (exercise: ExerciseItem) => {
    let defWeight = 50;
    if (exercise.category === "Legs") defWeight = 135;
    else if (exercise.category === "Chest") defWeight = 95;
    else if (exercise.category === "Back") defWeight = 90;
    else if (exercise.category === "Shoulders") defWeight = 45;
    else if (exercise.category === "Arms") defWeight = 35;
    else if (exercise.category === "Core" || exercise.category === "Cardio") defWeight = 0;

    setCustomExercises((prev) => [
      ...prev,
      {
        name: exercise.name,
        sets: exercise.defaultSets || 3,
        reps: exercise.defaultReps || "10-12",
        weight: defWeight,
        category: exercise.category,
      },
    ]);
    showNotification(`+ Added ${exercise.name} to routine`);
  };

  const handleRemoveCustomExercise = (index: number) => {
    setCustomExercises((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateCustomExercise = (
    index: number,
    field: "sets" | "reps" | "weight" | "name",
    value: any
  ) => {
    setCustomExercises((prev) =>
      prev.map((ex, idx) => (idx === index ? { ...ex, [field]: value } : ex))
    );
  };

  const handleStartCustomWorkout = () => {
    if (customExercises.length === 0) {
      showNotification("⚠️ Please add at least 1 exercise from the library before starting.");
      return;
    }
    showNotification(`⚡ Started: ${customTitle}`);
    setShowCustomModal(false);
    startWorkout({
      id: `custom_${Date.now()}`,
      title: customTitle,
      subtitle: `${customTarget} • ${customExercises.length} Movement${customExercises.length === 1 ? "" : "s"}`,
      category: "Hypertrophy",
      durationMinutes: Math.max(20, customExercises.length * 12),
      estimatedBurnKcal: Math.max(150, customExercises.length * 85),
      intensity: "High",
      targetMuscles: Array.from(new Set(customExercises.map((e) => e.category || "Full Body"))),
      exercises: customExercises.map((ex, idx) => ({
        exerciseId: `ex_${idx}`,
        name: ex.name,
        targetSets: ex.sets,
        targetReps: ex.reps,
        restSeconds: 90,
        sets: Array.from({ length: ex.sets }).map((_, sIdx) => ({
          setNumber: sIdx + 1,
          weightKg: Math.round(ex.weight * 0.453592),
          reps: parseInt(ex.reps.split("-")[0]) || 10,
          completed: sIdx === 0,
        })),
      })),
    });
  };

  const handleAddExerciseToCustom = () => {
    if (!newExName.trim()) return;
    setCustomExercises([
      ...customExercises,
      { name: newExName.trim(), sets: 3, reps: "10-12", weight: 50, category: "Custom" },
    ]);
    setNewExName("");
  };

  const handleCompleteAssignedWorkout = (
    id: string,
    title: string,
    duration: number,
    kcal: number,
    category: string
  ) => {
    if (completedMonitorWorkoutIds.includes(id)) {
      showNotification(`✓ ${title} is already recorded as completed today!`);
      return;
    }
    setCompletedMonitorWorkoutIds((prev) => [...prev, id]);
    recordCompletedWorkoutLog({
      id: `mon_done_${Date.now()}`,
      title: title,
      subtitle: "Monitor Assigned • Completed",
      category: category,
      completedAt: "Today, Just now",
      durationMinutes: duration,
      caloriesBurned: kcal,
      totalVolumeKg: title.includes("Upper") ? 3200 : title.includes("Posterior") ? 1800 : 0,
      strainScore: title.includes("Upper") ? 15.4 : title.includes("Zone") ? 10.2 : 8.5,
      exercises: [
        {
          name: title.includes("Upper")
            ? "Incline Smith Press"
            : title.includes("Posterior")
            ? "Romanian Deadlift"
            : "Zone 2 Dynamic Row",
          completedSets: 4,
          totalSets: 4,
          sets: [
            { setNumber: 1, weightKg: 70, reps: 12, completed: true },
            { setNumber: 2, weightKg: 75, reps: 10, completed: true },
            { setNumber: 3, weightKg: 75, reps: 10, completed: true },
            { setNumber: 4, weightKg: 80, reps: 8, completed: true },
          ],
        },
      ],
    });
  };

  const handleStartWeakMuscleWorkout = (muscle: WeakMuscleProtocol) => {
    showNotification(`⚡ Loaded DXA Corrective Routine for ${muscle.muscleName}`);
    startWorkout({
      id: `corrective_${muscle.id}_${Date.now()}`,
      title: `AI Corrective: ${muscle.muscleName}`,
      subtitle: `${muscle.deficitText} • Unilateral Overload`,
      category: "Hypertrophy",
      durationMinutes: 35,
      estimatedBurnKcal: 290,
      intensity: "High",
      targetMuscles: [muscle.muscleName, "Unilateral Symmetry"],
      exercises: muscle.exercises.map((ex, idx) => ({
        exerciseId: `corr_${muscle.id}_${idx}`,
        name: ex.name,
        targetSets: ex.targetSets,
        targetReps: ex.targetReps,
        restSeconds: ex.restSeconds,
        sets: Array.from({ length: ex.targetSets }).map((_, sIdx) => ({
          setNumber: sIdx + 1,
          weightKg: ex.startingKg,
          reps: parseInt(ex.targetReps.split("-")[0]) || 10,
          completed: false,
        })),
      })),
    });
  };

  const activeWeakMuscle =
    WEAK_MUSCLE_PROTOCOLS.find((m) => m.id === selectedWeakMuscleId) ||
    WEAK_MUSCLE_PROTOCOLS[0];

  // Active workout stats
  const totalSets = activeWorkout?.routine.exercises.reduce((acc, ex) => acc + ex.sets.length, 0) || 0;
  const completedSets =
    activeWorkout?.routine.exercises.reduce(
      (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
      0
    ) || 0;
  const overallProgressPct = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-outline">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-primary-fixed font-bold">
            TRAINING & PERFORMANCE
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface mt-1">
            Workout Tracker
          </h1>
          <p className="text-sm text-on-surface-variant">
            Track daily compound lifts, log sets with real load progression, and sync bio-feedback.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistoryModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface border border-outline hover:bg-surface-container text-on-surface text-xs font-medium transition-all shadow-sm"
          >
            <History className="w-4 h-4 text-primary-fixed" />
            <span>History ({workoutHistory.length})</span>
          </button>
        </div>
      </div>

      {/* ACTIVE WORKOUT VS DEFAULT HUB */}
      {activeWorkout && activeWorkout.isActive ? (
        /* ========================================================================= */
        /* LIVE ACTIVE WORKOUT VIEW                                                  */
        /* ========================================================================= */
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* Active Workout Header Card */}
          <div className="bg-surface rounded-2xl border border-primary-fixed/30 p-6 flex flex-col gap-4 shadow-sm relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary-fixed animate-pulse" />
                  <span className="font-mono text-xs text-primary-fixed font-bold uppercase tracking-wider">
                    LIVE SESSION • {formatSeconds(activeWorkout.elapsedSeconds)}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-on-surface">
                  {activeWorkout.routine.title}
                </h2>
                <p className="text-sm text-on-surface-variant">
                  {activeWorkout.routine.subtitle}
                </p>
              </div>

              {/* Workout Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={activeWorkout.isPaused ? resumeWorkout : pauseWorkout}
                  className="px-3.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline text-xs font-semibold text-on-surface flex items-center gap-1.5 transition-all"
                >
                  {activeWorkout.isPaused ? (
                    <>
                      <Play className="w-3.5 h-3.5 text-primary-fixed fill-current" /> Resume
                    </>
                  ) : (
                    <>
                      <Pause className="w-3.5 h-3.5 text-amber-600" /> Pause
                    </>
                  )}
                </button>

                <button
                  onClick={finishWorkout}
                  className="px-4 py-2 rounded-lg bg-primary-fixed text-white text-xs font-bold hover:bg-primary-fixed/90 shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Finish Session</span>
                </button>
              </div>
            </div>

            {/* Progress Summary Bar */}
            <div className="space-y-1.5 pt-3 border-t border-outline">
              <div className="flex justify-between items-center text-xs font-mono text-on-surface-variant">
                <span>
                  Total Session Progress ({completedSets}/{totalSets} Sets Completed)
                </span>
                <span className="text-primary-fixed font-bold">{overallProgressPct}%</span>
              </div>
              <div className="w-full bg-surface-container-high rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-primary-fixed h-full rounded-full transition-all duration-300"
                  style={{ width: `${overallProgressPct}%` }}
                />
              </div>
            </div>
          </div>

          {/* Rest Timer Banner */}
          {activeWorkout.isResting && activeWorkout.restTimerSeconds > 0 && (
            <div className="p-4 rounded-xl bg-primary-container/40 border border-primary-fixed/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Timer className="w-5 h-5 text-primary-fixed animate-spin" />
                <div>
                  <span className="text-xs font-bold text-on-surface font-mono uppercase block">
                    Active Rest Interval
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    Prepare for subsequent working set
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-xl font-bold text-primary-fixed">
                  {formatSeconds(activeWorkout.restTimerSeconds)}
                </span>
                <button
                  onClick={skipRestTimer}
                  className="px-3 py-1 rounded-lg bg-surface border border-outline hover:bg-surface-container text-xs font-medium text-on-surface"
                >
                  Skip
                </button>
              </div>
            </div>
          )}

          {/* Active Exercises List */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-on-surface">
                Exercises ({activeWorkout.routine.exercises.length})
              </h2>
              <span className="font-mono text-xs text-primary-fixed bg-primary-container px-2.5 py-1 rounded-md font-semibold">
                {activeWorkout.routine.category}
              </span>
            </div>

            {activeWorkout.routine.exercises.map((exercise, exIdx) => {
              const exCompletedSets = exercise.sets.filter((s) => s.completed).length;
              const exTotalSets = exercise.sets.length;
              const exProgressPct = Math.round((exCompletedSets / exTotalSets) * 100);
              const currentWeightLbs = Math.round((exercise.sets[0]?.weightKg || 70) * 2.20462);

              return (
                <div
                  key={exercise.exerciseId || exIdx}
                  onClick={() => setSelectedExerciseIndex(exIdx)}
                  className="bg-surface border border-outline hover:border-primary-fixed/50 rounded-xl p-5 flex flex-col gap-3 cursor-pointer transition-all shadow-sm group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-lg bg-primary-container text-primary-fixed font-bold text-xs flex items-center justify-center">
                        {exIdx + 1}
                      </span>
                      <div>
                        <h3 className="text-lg font-bold text-on-surface group-hover:text-primary-fixed transition-colors">
                          {exercise.name}
                        </h3>
                        <p className="text-xs text-on-surface-variant">
                          Target: {exercise.targetReps} reps • Rest: {exercise.restSeconds || 90}s
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${
                        exCompletedSets === exTotalSets
                          ? "bg-emerald-100 text-emerald-800 font-bold"
                          : exCompletedSets > 0
                          ? "bg-primary-container text-primary-fixed"
                          : "bg-surface-container text-on-surface-variant"
                      }`}
                    >
                      {exCompletedSets === exTotalSets ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Completed
                        </>
                      ) : exCompletedSets > 0 ? (
                        "In Progress"
                      ) : (
                        "Not Started"
                      )}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 p-3 bg-surface-container/50 rounded-lg border border-outline text-center">
                    <div>
                      <span className="text-xs text-on-surface-variant block">Sets</span>
                      <span className="text-base font-bold text-on-surface">{exTotalSets}</span>
                    </div>
                    <div>
                      <span className="text-xs text-on-surface-variant block">Working Weight</span>
                      <span className="text-base font-bold text-on-surface">{currentWeightLbs} lbs</span>
                    </div>
                    <div>
                      <span className="text-xs text-on-surface-variant block">Target Reps</span>
                      <span className="text-base font-bold text-primary-fixed">{exercise.targetReps}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center text-xs text-on-surface-variant">
                      <span>Progress</span>
                      <div className="flex items-center gap-2">
                        <span>
                          {exCompletedSets} / {exTotalSets} Sets Done
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const nextSetIdx = exercise.sets.findIndex((s) => !s.completed);
                            if (nextSetIdx !== -1) {
                              toggleSetComplete(exIdx, nextSetIdx);
                            } else {
                              toggleSetComplete(exIdx, 0);
                            }
                          }}
                          className="px-2.5 py-1 rounded bg-primary-fixed text-white text-xs font-semibold hover:bg-primary-fixed/90 transition-all"
                        >
                          + Log Set
                        </button>
                      </div>
                    </div>
                    <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-primary-fixed h-full rounded-full transition-all duration-300"
                        style={{ width: `${exProgressPct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          {/* Quick Workout Actions Footer */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-surface border border-outline shadow-sm">
            <button
              onClick={cancelWorkout}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 transition-all"
            >
              Discard Session
            </button>

            <button
              onClick={finishWorkout}
              className="px-6 py-2.5 rounded-lg bg-primary-fixed text-white text-xs font-bold hover:bg-primary-fixed/90 shadow-sm transition-all"
            >
              Finish Workout 🏆
            </button>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* DEFAULT HUB: CLEAN LIGHT DESIGN                                          */
        /* ========================================================================= */
        <div className="flex flex-col gap-6">
          {/* Start Empty Workout Button */}
          <button
            onClick={() => setShowCustomModal(true)}
            className="w-full bg-surface border border-outline hover:border-primary-fixed/50 rounded-xl p-5 flex items-center justify-between cursor-pointer transition-all shadow-sm group text-left"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center text-primary-fixed group-hover:scale-105 transition-transform">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-on-surface">
                  Start Empty Workout
                </h3>
                <p className="text-xs text-on-surface-variant">
                  Log a custom training session with your own movements
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-on-surface-variant group-hover:translate-x-1 transition-transform" />
          </button>





          {/* ========================================================================= */}
          {/* AI DXA WEAK MUSCLE & ASYMMETRY CORRECTOR (GATED & DYNAMIC)                */}
          {/* ========================================================================= */}
          <section className="bg-surface border border-outline rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-purple-600 font-bold">
                  AI Asymmetry Engine
                </span>
                <h3 className="text-xl font-bold text-on-surface mt-0.5">
                  Targeted Weak Muscle Corrector
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Identifies regional bilateral muscle lag and prescribes corrective unilateral strength protocols.
                </p>
              </div>
              {hasDxaReport && activeWeakMuscles.length > 0 ? (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 self-start sm:self-auto font-mono">
                  {activeWeakMuscles.length} Asymmetries Detected
                </span>
              ) : (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-surface-container text-on-surface-variant border border-outline self-start sm:self-auto font-mono">
                  Awaiting DXA Scan
                </span>
              )}
            </div>

            {!hasDxaReport || activeWeakMuscles.length === 0 ? (
              <div className="p-6 rounded-2xl bg-surface-container/40 border border-dashed border-outline text-center flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Activity className="w-6 h-6" />
                </div>
                <div className="max-w-md">
                  <h4 className="text-sm font-bold text-on-surface">No DXA Scan Data Analyzed Yet</h4>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    Upload your clinical DXA Body Scan in Health to detect regional asymmetries (e.g. Left Leg vs Right Leg) and unlock tailored unilateral corrective routines.
                  </p>
                </div>
                <Link
                  href="/health/upload-dxa"
                  className="mt-1 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2"
                >
                  <span>Upload DXA Scan in Health</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <>
                {/* Simple Human-Friendly Muscle Badges */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {activeWeakMuscles.map((proto: SimpleWeakMuscleProtocol) => (
                    <button
                      key={proto.id}
                      type="button"
                      onClick={() => {
                        setSelectedWeakMuscleId(proto.id);
                        setShowDxaDetails(true);
                      }}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        selectedWeakMuscleId === proto.id && showDxaDetails
                          ? "bg-primary-container border-primary-fixed text-primary-fixed shadow-sm"
                          : "bg-surface border-outline text-on-surface hover:bg-surface-container"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${proto.severity === "high" ? "bg-red-500" : "bg-amber-500"}`} />
                      <span>{proto.simpleName}</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowDxaDetails(!showDxaDetails)}
                  className="text-xs font-semibold text-primary-fixed hover:underline flex items-center gap-1 self-start pt-1 cursor-pointer"
                >
                  {showDxaDetails ? "Hide Corrective Routine ↑" : "View Corrective Routine & Exercises ↓"}
                  {showDxaDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {/* Expanded Corrective Routine Details */}
                {showDxaDetails && (
                  <div className="mt-2 pt-4 border-t border-outline animate-fadeIn flex flex-col gap-4">
                    {(() => {
                      const currentProto =
                        activeWeakMuscles.find((p: SimpleWeakMuscleProtocol) => p.id === selectedWeakMuscleId) || activeWeakMuscles[0];
                      if (!currentProto) return null;

                      return (
                        <div className="bg-surface-container/60 rounded-2xl p-4 sm:p-5 border border-outline flex flex-col gap-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold uppercase px-2 py-0.5 rounded bg-primary-container text-primary-fixed">
                                  {currentProto.simpleName}
                                </span>
                                <span className="text-xs font-mono text-on-surface-variant">
                                  • {currentProto.deficitText}
                                </span>
                              </div>
                              <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                                {currentProto.description}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                showNotification(`⚡ Started Corrective Session for ${currentProto.simpleName}`);
                                startWorkout({
                                  id: `corrective_${currentProto.id}_${Date.now()}`,
                                  title: `AI Corrective: ${currentProto.simpleName}`,
                                  subtitle: `${currentProto.deficitText} • Unilateral Focus`,
                                  category: "Hypertrophy",
                                  durationMinutes: 35,
                                  estimatedBurnKcal: 280,
                                  intensity: "High",
                                  targetMuscles: [currentProto.simpleName, "Unilateral Symmetry"],
                                  exercises: currentProto.exercises.map((ex: any, idx: number) => ({
                                    exerciseId: `corr_${currentProto.id}_${idx}`,
                                    name: ex.name,
                                    targetSets: ex.sets,
                                    targetReps: ex.reps,
                                    restSeconds: ex.restSeconds,
                                    sets: Array.from({ length: ex.sets }).map((_, sIdx) => ({
                                      setNumber: sIdx + 1,
                                      weightKg: ex.weightKg,
                                      reps: parseInt(ex.reps.split("-")[0]) || 10,
                                      completed: false,
                                    })),
                                  })),
                                });
                              }}
                              className="px-5 py-2.5 rounded-xl bg-primary-fixed text-white font-bold text-xs shadow-sm hover:bg-primary-fixed/90 shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                              <span>Start Corrective Routine</span>
                            </button>
                          </div>

                          {/* Corrective Exercise Cards */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                            {currentProto.exercises.map((ex: any, idx: number) => (
                              <div key={idx} className="p-3.5 rounded-xl bg-surface border border-outline flex flex-col gap-1.5 shadow-sm">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-bold text-primary-fixed font-mono">Movement #{idx + 1}</span>
                                  <span className="font-mono text-on-surface-variant text-[11px]">{ex.sets} Sets × {ex.reps}</span>
                                </div>
                                <span className="text-xs font-bold text-on-surface">{ex.name}</span>
                                {ex.focusNote && (
                                  <span className="text-[11px] text-on-surface-variant font-mono mt-0.5">
                                    💡 {ex.focusNote}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </>
            )}
          </section>

          {/* ========================================================================= */}
          {/* ACTIVE SYNC: WORKOUT ASSIGNED BY YOUR MONITOR                             */}
          {/* ========================================================================= */}
          <section className="bg-surface border border-outline hover:border-primary-fixed/40 rounded-2xl p-6 flex flex-col gap-5 shadow-sm transition-all relative overflow-hidden">
            {/* Background subtle glow effect */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-primary-fixed/5 rounded-full blur-3xl -z-10 pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-extrabold text-on-surface">
                  Workout Assigned By Your Monitor
                </h3>
                <p className="text-xs text-on-surface-variant mt-1 max-w-xl">
                  AI-calibrated training programs generated directly from your recovery readiness, heart rate variability, and movement telemetry.
                </p>
              </div>

              {/* Prominent Action Button */}
              <button
                type="button"
                onClick={() => setShowMonitorWorkouts(!showMonitorWorkouts)}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-sm shrink-0 cursor-pointer ${
                  showMonitorWorkouts
                    ? "bg-surface-container border border-outline text-on-surface hover:bg-surface-container-high"
                    : "bg-primary-fixed text-white hover:bg-primary-fixed/90 hover:shadow-md"
                }`}
              >
                <span>{showMonitorWorkouts ? "Hide Programs" : "View Assigned Workouts"}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    showMonitorWorkouts ? "bg-surface text-on-surface" : "bg-white/20 text-white"
                  }`}
                >
                  3
                </span>
                {showMonitorWorkouts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>

            {/* Expanded Assigned Workouts Grid */}
            {showMonitorWorkouts && (
              <div className="pt-4 border-t border-outline grid grid-cols-1 md:grid-cols-3 gap-3.5 animate-fadeIn">
                <div className="p-4 rounded-xl bg-surface-container/70 border border-outline hover:border-primary-fixed/40 transition-all flex flex-col justify-between gap-3 shadow-sm group">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-primary-container text-primary-fixed">
                        Hypertrophy
                      </span>
                      <span className="text-[10px] font-mono text-on-surface-variant font-semibold">
                        45 min • 420 kcal
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-on-surface group-hover:text-primary-fixed transition-colors">
                      1. Upper Body Hypertrophy Focus
                    </h4>
                    <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                      Assigned by Coach Nova • Calibrated for high chest &amp; shoulder readiness (92%).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCompleteAssignedWorkout("prog_1", "Upper Body Hypertrophy Focus", 45, 420, "Hypertrophy")}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      completedMonitorWorkoutIds.includes("prog_1")
                        ? "bg-emerald-600 text-white cursor-default"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-md"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{completedMonitorWorkoutIds.includes("prog_1") ? "Completed ✓" : "Completed"}</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-surface-container/70 border border-outline hover:border-primary-fixed/40 transition-all flex flex-col justify-between gap-3 shadow-sm group">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        Recovery &amp; Cardio
                      </span>
                      <span className="text-[10px] font-mono text-on-surface-variant font-semibold">
                        30 min • 210 kcal
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-on-surface group-hover:text-primary-fixed transition-colors">
                      2. Zone 2 Aerobic Base Recovery
                    </h4>
                    <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                      HRV Optimized (72ms) • Active parasympathetic recovery &amp; fat oxidation.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCompleteAssignedWorkout("prog_2", "Zone 2 Aerobic Base Recovery", 30, 210, "Cardio & Recovery")}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      completedMonitorWorkoutIds.includes("prog_2")
                        ? "bg-emerald-600 text-white cursor-default"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-md"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{completedMonitorWorkoutIds.includes("prog_2") ? "Completed ✓" : "Completed"}</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-surface-container/70 border border-outline hover:border-primary-fixed/40 transition-all flex flex-col justify-between gap-3 shadow-sm group">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                        DXA Corrective
                      </span>
                      <span className="text-[10px] font-mono text-on-surface-variant font-semibold">
                        20 min • 140 kcal
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-on-surface group-hover:text-primary-fixed transition-colors">
                      3. Posterior Chain &amp; Spine Decompression
                    </h4>
                    <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
                      Symmetry Protocol • Unilateral leg balance &amp; lower lumbar relief.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCompleteAssignedWorkout("prog_3", "Posterior Chain & Spine Decompression", 20, 140, "DXA Corrective")}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      completedMonitorWorkoutIds.includes("prog_3")
                        ? "bg-emerald-600 text-white cursor-default"
                        : "bg-emerald-600 hover:bg-emerald-500 text-white hover:shadow-md"
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{completedMonitorWorkoutIds.includes("prog_3") ? "Completed ✓" : "Completed"}</span>
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CUSTOM EMPTY WORKOUT SESSION BUILDER                               */}
      {/* ========================================================================= */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-surface border border-outline rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl animate-scaleUp overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-outline p-4 sm:p-5 bg-surface-container/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-container text-primary-fixed flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-on-surface">Start Custom Workout</h3>
                  <p className="text-xs text-on-surface-variant">
                    Pick exercises from the library or customize your training routine
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {customExercises.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setCustomExercises([])}
                    className="text-xs text-on-surface-variant hover:text-red-500 font-medium px-2.5 py-1 rounded transition-colors"
                  >
                    Clear All
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="text-on-surface-variant hover:text-on-surface p-1.5 rounded-lg hover:bg-surface-container transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 flex-1 overflow-y-auto flex flex-col gap-5">
              {/* Session Meta Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 p-3.5 rounded-xl bg-surface-container/40 border border-outline">
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    Session Name
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g. Hypertrophy Upper Body"
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-surface border border-outline text-on-surface text-sm focus:border-primary-fixed outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    Target Focus
                  </label>
                  <input
                    type="text"
                    value={customTarget}
                    onChange={(e) => setCustomTarget(e.target.value)}
                    placeholder="e.g. Chest, Back, Arms"
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-surface border border-outline text-on-surface text-sm focus:border-primary-fixed outline-none transition-colors"
                  />
                </div>
              </div>

                {/* Routine Builder with Collapsible Library Dropdown */}
                <div className="lg:col-span-12 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono uppercase tracking-wider font-bold text-on-surface flex items-center gap-1.5">
                      <ListChecks className="w-4 h-4 text-primary-fixed" />
                      Configured Routine ({customExercises.length} Movements)
                    </span>
                    <span className="text-[11px] text-on-surface-variant font-medium">
                      {customExercises.reduce((acc, curr) => acc + (curr.sets || 3), 0)} Sets Total
                    </span>
                  </div>

                  {/* Selected Movements List */}
                  <div className="flex flex-col gap-2.5 max-h-[280px] overflow-y-auto pr-1">
                    {customExercises.length === 0 ? (
                      <div className="p-6 rounded-2xl border border-dashed border-outline text-center flex flex-col items-center justify-center gap-2 text-on-surface-variant bg-surface-container/20">
                        <Dumbbell className="w-8 h-8 opacity-40 text-primary-fixed" />
                        <p className="text-xs font-semibold text-on-surface">No movements added yet</p>
                        <p className="text-[11px] text-on-surface-variant max-w-sm">
                          Add a custom movement below or pick from the collapsible Exercise Library dropdown.
                        </p>
                      </div>
                    ) : (
                      customExercises.map((ex, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-surface-container/70 border border-outline flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-lg bg-primary-container text-primary-fixed font-bold text-xs flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div>
                              <span className="text-xs sm:text-sm font-bold text-on-surface block">{ex.name}</span>
                              {ex.category && (
                                <span className="text-[10px] text-primary-fixed font-mono">{ex.category}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-outline/60">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-on-surface-variant font-medium">Sets:</span>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCustomExercise(idx, "sets", Math.max(1, ex.sets - 1))}
                                  className="w-5 h-5 rounded bg-surface border border-outline text-xs flex items-center justify-center hover:bg-surface-container text-on-surface"
                                >
                                  -
                                </button>
                                <span className="text-xs font-bold text-on-surface w-4 text-center">{ex.sets}</span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateCustomExercise(idx, "sets", ex.sets + 1)}
                                  className="w-5 h-5 rounded bg-surface border border-outline text-xs flex items-center justify-center hover:bg-surface-container text-on-surface"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-on-surface-variant font-medium">Reps:</span>
                              <input
                                type="text"
                                value={ex.reps}
                                onChange={(e) => handleUpdateCustomExercise(idx, "reps", e.target.value)}
                                className="w-16 px-1.5 py-0.5 text-center text-xs font-bold bg-surface border border-outline rounded text-primary-fixed outline-none"
                              />
                            </div>

                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-on-surface-variant font-medium">Lbs:</span>
                              <input
                                type="number"
                                value={ex.weight}
                                onChange={(e) => handleUpdateCustomExercise(idx, "weight", parseInt(e.target.value) || 0)}
                                className="w-16 px-1.5 py-0.5 text-center text-xs font-bold bg-surface border border-outline rounded text-on-surface outline-none"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveCustomExercise(idx)}
                              className="text-on-surface-variant hover:text-red-500 p-1.5 transition-colors"
                              title="Remove exercise"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Manual Custom Movement Input */}
                  <div className="pt-2 border-t border-outline flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Type custom movement name (e.g. Incline DB Press, Hack Squat)..."
                      value={newExName}
                      onChange={(e) => setNewExName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleAddExerciseToCustom();
                        }
                      }}
                      className="flex-1 px-3 py-2 rounded-xl bg-surface-container border border-outline text-xs text-on-surface outline-none focus:border-primary-fixed"
                    />
                    <button
                      type="button"
                      onClick={handleAddExerciseToCustom}
                      className="px-4 py-2 rounded-xl bg-surface border border-outline hover:bg-primary-container text-xs font-semibold text-primary-fixed transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Custom</span>
                    </button>
                  </div>

                  {/* Collapsible Exercise Library Dropdown (Positioned directly under Add Custom Movement) */}
                  <div className="rounded-2xl border border-outline bg-surface-container/30 overflow-hidden mt-1">
                    <button
                      type="button"
                      onClick={() => setShowDxaModal(!showDxaModal)}
                      className="w-full p-3.5 sm:p-4 flex items-center justify-between bg-surface-container/50 hover:bg-surface-container transition-all cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary-fixed" />
                        <span className="text-xs sm:text-sm font-bold text-on-surface">
                          Exercise Library Dropdown (50+ Movements)
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary-container text-primary-fixed">
                          {modalMuscleFilter}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-primary-fixed font-semibold">
                        <span>{showDxaModal ? "Hide Library" : "Select from Dropdown"}</span>
                        {showDxaModal ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {showDxaModal && (
                      <div className="p-3.5 sm:p-4 flex flex-col gap-3 border-t border-outline animate-fadeIn">
                        {/* Search Bar */}
                        <div className="relative w-full">
                          <Search className="w-3.5 h-3.5 text-on-surface-variant absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Search by exercise name or focus (e.g. Squat, Bench, Row)..."
                            value={modalSearchQuery}
                            onChange={(e) => setModalSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface border border-outline text-xs text-on-surface focus:border-primary-fixed outline-none transition-colors"
                          />
                        </div>

                        {/* Category Filter Pills */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
                          {["All", "Chest", "Back", "Legs", "Shoulders", "Arms", "Core", "Cardio"].map((cat) => (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setModalMuscleFilter(cat)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
                                modalMuscleFilter === cat
                                  ? "bg-primary-fixed border-primary-fixed text-white shadow-sm"
                                  : "bg-surface border-outline text-on-surface-variant hover:bg-surface-container"
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                        </div>

                        {/* Exercise Selection Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[280px] overflow-y-auto pr-1">
                          {EXERCISE_DATABASE.filter(
                            (ex) =>
                              (modalMuscleFilter === "All" || ex.category === modalMuscleFilter) &&
                              (ex.name.toLowerCase().includes(modalSearchQuery.toLowerCase()) ||
                                ex.primaryMuscle.toLowerCase().includes(modalSearchQuery.toLowerCase()))
                          ).map((exercise) => {
                            const alreadyAddedCount = customExercises.filter((e) => e.name === exercise.name).length;
                            return (
                              <div
                                key={exercise.id}
                                className="p-3 rounded-xl bg-surface border border-outline flex flex-col justify-between gap-2 hover:border-primary-fixed/40 transition-all shadow-sm"
                              >
                                <div>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-primary-container text-primary-fixed">
                                      {exercise.category}
                                    </span>
                                    <span className="text-[9px] text-on-surface-variant font-mono">
                                      {exercise.difficulty}
                                    </span>
                                  </div>
                                  <h5 className="text-xs font-bold text-on-surface line-clamp-1">
                                    {exercise.name}
                                  </h5>
                                  <p className="text-[10px] text-on-surface-variant line-clamp-1 mt-0.5">
                                    {exercise.primaryMuscle}
                                  </p>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-outline text-[11px]">
                                  <span className="text-[10px] text-on-surface-variant">
                                    {exercise.defaultSets}×{exercise.defaultReps}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleAddFromLibrary(exercise)}
                                    className="px-2.5 py-1 rounded-lg bg-primary-container hover:bg-primary-fixed text-primary-fixed hover:text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>{alreadyAddedCount > 0 ? `Added (${alreadyAddedCount})` : "Select"}</span>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-outline p-4 bg-surface-container/20">
              <span className="text-xs text-on-surface-variant hidden sm:inline">
                {customExercises.length} movement{customExercises.length === 1 ? "" : "s"} configured
              </span>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-lg border border-outline text-on-surface text-xs font-semibold hover:bg-surface-container transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStartCustomWorkout}
                  disabled={customExercises.length === 0}
                  className={`flex-1 sm:flex-initial px-5 py-2 rounded-lg text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 ${
                    customExercises.length === 0
                      ? "bg-primary-fixed/40 cursor-not-allowed"
                      : "bg-primary-fixed hover:bg-primary-fixed/90 cursor-pointer"
                  }`}
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Launch Workout ({customExercises.length}) ⚡</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EXERCISE SET DETAIL & LOGGING MODAL                                */}
      {/* ========================================================================= */}
      {selectedExerciseIndex !== null && activeWorkout && activeWorkout.routine.exercises[selectedExerciseIndex] && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-surface border border-outline rounded-2xl w-full max-w-[520px] p-6 flex flex-col gap-4 shadow-xl animate-scaleUp max-h-[90vh] overflow-hidden">
            {(() => {
              const currentEx = activeWorkout.routine.exercises[selectedExerciseIndex];
              const completedCount = currentEx.sets.filter((s) => s.completed).length;

              return (
                <>
                  <div className="flex items-center justify-between border-b border-outline pb-3">
                    <div>
                      <span className="text-xs font-mono text-primary-fixed font-bold tracking-wider uppercase">
                        Set Logger
                      </span>
                      <h3 className="text-lg font-bold text-on-surface">{currentEx.name}</h3>
                    </div>
                    <button
                      onClick={() => setSelectedExerciseIndex(null)}
                      className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Unit Selector */}
                  <div className="flex items-center justify-between bg-surface-container p-2.5 rounded-xl border border-outline">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-on-surface-variant">Unit:</span>
                      <div className="flex items-center gap-1 bg-surface p-1 rounded-lg border border-outline text-xs">
                        <button
                          type="button"
                          onClick={() => setWeightUnit("lbs")}
                          className={`px-2.5 py-0.5 rounded-md font-semibold ${
                            weightUnit === "lbs"
                              ? "bg-primary-fixed text-white shadow-sm"
                              : "text-on-surface-variant"
                          }`}
                        >
                          LBS
                        </button>
                        <button
                          type="button"
                          onClick={() => setWeightUnit("kg")}
                          className={`px-2.5 py-0.5 rounded-md font-semibold ${
                            weightUnit === "kg"
                              ? "bg-primary-fixed text-white shadow-sm"
                              : "text-on-surface-variant"
                          }`}
                        >
                          KG
                        </button>
                      </div>
                    </div>

                    <span className="text-xs text-on-surface-variant">
                      Completed: <strong className="text-primary-fixed">{completedCount}</strong>/{currentEx.sets.length} Sets
                    </span>
                  </div>

                  {/* Sets List */}
                  <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                    {currentEx.sets.map((set, sIdx) => {
                      const currentLbs = Math.round(set.weightKg * 2.20462);
                      const displayWeight = weightUnit === "lbs" ? currentLbs : set.weightKg;

                      return (
                        <div
                          key={sIdx}
                          className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                            set.completed
                              ? "bg-emerald-50 border-emerald-300"
                              : "bg-surface-container border-outline"
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => toggleSetComplete(selectedExerciseIndex, sIdx)}
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                              set.completed
                                ? "bg-emerald-600 text-white shadow-sm"
                                : "bg-surface text-on-surface border border-outline"
                            }`}
                          >
                            {set.completed ? <Check className="w-3.5 h-3.5" /> : set.setNumber}
                          </button>

                          {/* Weight Controller */}
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] text-on-surface-variant font-medium uppercase">
                              Weight ({weightUnit})
                            </span>
                            <div className="flex items-center gap-1 mt-0.5">
                              <button
                                type="button"
                                onClick={() => {
                                  if (weightUnit === "lbs") {
                                    const newLbs = Math.max(5, currentLbs - 5);
                                    updateSetDetails(
                                      selectedExerciseIndex,
                                      sIdx,
                                      Math.round((newLbs / 2.20462) * 10) / 10,
                                      set.reps
                                    );
                                  } else {
                                    const newKg = Math.max(2.5, Math.round((set.weightKg - 2.5) * 10) / 10);
                                    updateSetDetails(selectedExerciseIndex, sIdx, newKg, set.reps);
                                  }
                                }}
                                className="w-6 h-6 rounded bg-surface border border-outline text-on-surface text-xs flex items-center justify-center hover:bg-surface-container"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                value={displayWeight}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value) || 0;
                                  const newKg =
                                    weightUnit === "lbs"
                                      ? Math.round((val / 2.20462) * 10) / 10
                                      : val;
                                  updateSetDetails(selectedExerciseIndex, sIdx, newKg, set.reps);
                                }}
                                className="w-14 px-1 py-0.5 text-center text-sm font-bold text-on-surface bg-surface border border-outline rounded outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (weightUnit === "lbs") {
                                    const newLbs = currentLbs + 5;
                                    updateSetDetails(
                                      selectedExerciseIndex,
                                      sIdx,
                                      Math.round((newLbs / 2.20462) * 10) / 10,
                                      set.reps
                                    );
                                  } else {
                                    const newKg = Math.round((set.weightKg + 2.5) * 10) / 10;
                                    updateSetDetails(selectedExerciseIndex, sIdx, newKg, set.reps);
                                  }
                                }}
                                className="w-6 h-6 rounded bg-surface border border-outline text-on-surface text-xs flex items-center justify-center hover:bg-surface-container"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Reps Controller */}
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] text-on-surface-variant font-medium uppercase">
                              Reps
                            </span>
                            <div className="flex items-center gap-1 mt-0.5">
                              <button
                                type="button"
                                onClick={() => {
                                  const newReps = Math.max(1, set.reps - 1);
                                  updateSetDetails(selectedExerciseIndex, sIdx, set.weightKg, newReps);
                                }}
                                className="w-6 h-6 rounded bg-surface border border-outline text-on-surface text-xs flex items-center justify-center hover:bg-surface-container"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                value={set.reps}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value) || 1;
                                  updateSetDetails(selectedExerciseIndex, sIdx, set.weightKg, Math.max(1, val));
                                }}
                                className="w-11 px-1 py-0.5 text-center text-sm font-bold text-primary-fixed bg-surface border border-outline rounded outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newReps = set.reps + 1;
                                  updateSetDetails(selectedExerciseIndex, sIdx, set.weightKg, newReps);
                                }}
                                className="w-6 h-6 rounded bg-surface border border-outline text-on-surface text-xs flex items-center justify-center hover:bg-surface-container"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Completion Toggle */}
                          <button
                            type="button"
                            onClick={() => toggleSetComplete(selectedExerciseIndex, sIdx)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 ${
                              set.completed
                                ? "bg-emerald-600 text-white shadow-sm"
                                : "bg-surface border border-outline text-on-surface hover:bg-surface-container"
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{set.completed ? "Done" : "Log"}</span>
                          </button>

                          {currentEx.sets.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSetFromExercise(selectedExerciseIndex, sIdx)}
                              className="text-on-surface-variant hover:text-red-600 p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => addSetToExercise(selectedExerciseIndex)}
                    className="w-full py-2.5 rounded-lg border border-dashed border-outline hover:border-primary-fixed text-primary-fixed text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Set {currentEx.sets.length + 1}</span>
                  </button>

                  <div className="flex flex-col gap-2 pt-2 border-t border-outline">
                    <button
                      type="button"
                      onClick={() => {
                        completeAllSetsForExercise(selectedExerciseIndex);
                        showNotification(`🏆 All sets completed for ${currentEx.name}!`);
                      }}
                      className="w-full py-2.5 rounded-lg bg-primary-fixed text-white text-xs font-bold hover:bg-primary-fixed/90 shadow-sm transition-all"
                    >
                      Complete All Sets 🏆
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: FULL AI DXA SCAN & MUSCLE ANALYSIS                                 */}
      {/* ========================================================================= */}
      {showDxaModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-surface border border-outline rounded-2xl w-full max-w-[580px] p-6 flex flex-col gap-4 shadow-xl max-h-[90vh] overflow-y-auto animate-scaleUp">
            <div className="flex items-center justify-between border-b border-outline pb-3">
              <div className="flex items-center gap-2 text-primary-fixed">
                <Sparkles className="w-5 h-5" />
                <span className="font-mono text-xs uppercase font-bold tracking-wider">
                  AI RECOMMENDATION ENGINE
                </span>
              </div>
              <button
                onClick={() => setShowDxaModal(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-xl font-bold text-on-surface">
                Chest Hypertrophy Recommendations
              </h3>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                Biomechanical symmetry insights derived from verified physical testing parameters.
              </p>
            </div>

            {/* Target Card */}
            <div className="p-4 rounded-xl bg-surface-container border border-outline flex flex-col gap-2">
              <span className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">
                TARGET ZONE
              </span>
              <h4 className="text-base font-bold text-on-surface">
                Primary Muscle Focus: <span className="text-primary-fixed">Pectoralis Major</span>
              </h4>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-outline text-xs text-center">
                <div className="p-2 bg-surface rounded-lg border border-outline">
                  <span className="text-[10px] text-on-surface-variant block">CURRENT</span>
                  <span className="font-bold text-on-surface">2.4 kg</span>
                </div>
                <div className="p-2 bg-surface rounded-lg border border-outline">
                  <span className="text-[10px] text-on-surface-variant block">VARIANCE</span>
                  <span className="font-bold text-amber-600">-4.2%</span>
                </div>
                <div className="p-2 bg-surface rounded-lg border border-outline">
                  <span className="text-[10px] text-on-surface-variant block">TARGET</span>
                  <span className="font-bold text-primary-fixed">2.8 kg</span>
                </div>
              </div>
            </div>

            {/* Exercise List */}
            <div className="space-y-2.5">
              <h4 className="text-sm font-bold text-on-surface">Recommended Movements</h4>
              {[
                {
                  id: "bench_dxa",
                  name: "Barbell Bench Press",
                  setsReps: "4 Sets × 8-10 Reps",
                  focus: "Overall Mass",
                  defaultKg: 80,
                },
                {
                  id: "incline_dxa",
                  name: "Incline Dumbbell Press",
                  setsReps: "3 Sets × 10-12 Reps",
                  focus: "Upper Clavicular",
                  defaultKg: 34,
                },
                {
                  id: "cable_cross_dxa",
                  name: "Cable Crossover",
                  setsReps: "3 Sets × 12-15 Reps",
                  focus: "Isolation & Stretch",
                  defaultKg: 25,
                },
              ].map((exercise) => (
                <div
                  key={exercise.id}
                  className="p-3.5 rounded-xl bg-surface-container border border-outline flex items-center justify-between gap-3"
                >
                  <div>
                    <h5 className="text-sm font-bold text-on-surface">{exercise.name}</h5>
                    <p className="text-xs text-on-surface-variant">{exercise.setsReps} • {exercise.focus}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      addExerciseToActiveWorkout({
                        exerciseId: exercise.id,
                        name: exercise.name,
                        targetSets: 3,
                        targetReps: "8-12",
                        restSeconds: 90,
                        sets: Array.from({ length: 3 }).map((_, idx) => ({
                          setNumber: idx + 1,
                          weightKg: exercise.defaultKg,
                          reps: 10,
                          completed: false,
                        })),
                      });
                      setShowDxaModal(false);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-primary-fixed text-white text-xs font-bold hover:bg-primary-fixed/90 shadow-sm flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-outline flex justify-end">
              <button
                type="button"
                onClick={() => setShowDxaModal(false)}
                className="px-4 py-2 rounded-lg bg-surface border border-outline text-xs font-semibold text-on-surface hover:bg-surface-container"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: COMPLETED WORKOUT HISTORY MODAL                                    */}
      {/* ========================================================================= */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-surface border border-outline rounded-2xl w-full max-w-[700px] p-6 flex flex-col gap-4 shadow-xl max-h-[90vh] overflow-hidden animate-scaleUp">
            <div className="flex items-center justify-between border-b border-outline pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-container text-primary-fixed flex items-center justify-center">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-on-surface">Workout History Logs</h3>
                  <p className="text-xs text-on-surface-variant">Completed training volume & records</p>
                </div>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-on-surface-variant hover:text-on-surface p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {["All", "Hypertrophy", "Strength", "Cardio"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setHistoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    historyFilter === cat
                      ? "bg-primary-fixed text-white shadow-sm"
                      : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* History Items List */}
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {workoutHistory
                .filter(
                  (w) =>
                    historyFilter === "All" ||
                    w.category.toLowerCase().includes(historyFilter.toLowerCase())
                )
                .map((item) => {
                  const isExpanded = expandedHistoryId === item.id;
                  const volumeLbs = Math.round(item.totalVolumeKg * 2.20462);

                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl bg-surface-container border border-outline flex flex-col gap-3"
                    >
                      <div
                        onClick={() => setExpandedHistoryId(isExpanded ? null : item.id)}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 cursor-pointer"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-primary-container text-primary-fixed">
                              {item.category}
                            </span>
                            <span className="text-xs text-on-surface-variant flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {item.completedAt}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-on-surface mt-1">{item.title}</h4>
                          <p className="text-xs text-on-surface-variant">{item.subtitle}</p>
                        </div>

                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setExpandedHistoryId(isExpanded ? null : item.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-surface border border-outline hover:bg-surface-container text-on-surface"
                          >
                            {isExpanded ? "Hide Details ↑" : "Details ↓"}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteWorkoutHistory(item.id)}
                            className="text-on-surface-variant hover:text-red-600 p-1.5 rounded-lg"
                            title="Delete log"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Metrics Pill Grid */}
                      <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                        <div className="p-2 bg-surface rounded-lg border border-outline">
                          <span className="text-[10px] text-on-surface-variant block">TIME</span>
                          <span className="font-bold text-on-surface">{item.durationMinutes}m</span>
                        </div>
                        <div className="p-2 bg-surface rounded-lg border border-outline">
                          <span className="text-[10px] text-on-surface-variant block">KCAL</span>
                          <span className="font-bold text-primary-fixed">{item.caloriesBurned}</span>
                        </div>
                        <div className="p-2 bg-surface rounded-lg border border-outline">
                          <span className="text-[10px] text-on-surface-variant block">VOLUME</span>
                          <span className="font-bold text-emerald-600">{volumeLbs.toLocaleString()} lbs</span>
                        </div>
                        <div className="p-2 bg-surface rounded-lg border border-outline">
                          <span className="text-[10px] text-on-surface-variant block">STRAIN</span>
                          <span className="font-bold text-purple-600">{item.strainScore}</span>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="pt-3 border-t border-outline space-y-2 animate-fadeIn">
                          {item.exercises.map((ex, exI) => (
                            <div key={exI} className="p-3 rounded-lg bg-surface border border-outline space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-on-surface">{ex.name}</span>
                                <span className="text-on-surface-variant">
                                  {ex.completedSets}/{ex.totalSets} Sets Logged
                                </span>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
                                {ex.sets.map((set, sI) => (
                                  <div
                                    key={sI}
                                    className="p-1.5 rounded bg-surface-container text-xs text-on-surface flex justify-between"
                                  >
                                    <span>Set {set.setNumber}</span>
                                    <strong>{Math.round(set.weightKg * 2.20462)} lbs × {set.reps}</strong>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>

            <div className="pt-2 border-t border-outline flex justify-end">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="px-4 py-2 rounded-lg bg-surface border border-outline text-xs font-semibold text-on-surface hover:bg-surface-container"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
