"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  ArrowLeft,
  Plus,
  Sparkles,
  Dumbbell,
  CheckCircle2,
} from "lucide-react";

interface RecommendedExerciseItem {
  id: string;
  name: string;
  setsReps: string;
  focus: string;
  image: string;
  defaultKg: number;
  repsNum: number;
  setsNum: number;
}

interface MuscleZoneData {
  id: string;
  title: string;
  muscleName: string;
  currentMassKg: number;
  symmetryVariancePct: number;
  targetMassKg: number;
  optimalPct: number;
  lagPercentText: string;
  analysisPara1: string;
  analysisPara2: string;
  exercises: RecommendedExerciseItem[];
}

const MUSCLE_ZONES: Record<string, MuscleZoneData> = {
  chest: {
    id: "chest",
    title: "Chest Training Recommendation",
    muscleName: "Chest",
    currentMassKg: 2.4,
    symmetryVariancePct: -4.2,
    targetMassKg: 2.8,
    optimalPct: 45,
    lagPercentText: "4.2% developmental lag",
    analysisPara1:
      "Your latest DXA scan reveals a 4.2% developmental lag in the pectoralis major relative to your anterior deltoids and triceps. This imbalance may be limiting your pressing power and overall upper body symmetry.",
    analysisPara2:
      "The recommendation engine has prioritized movements that isolate the chest cavity while minimizing deltoid overcompensation. We suggest incorporating higher volume isolation work alongside your primary compound presses to stimulate hypertrophy in the sternal and clavicular heads.",
    exercises: [
      {
        id: "ex_bench",
        name: "Barbell Bench Press",
        setsReps: "3-4 Sets × 8-12 Reps",
        focus: "Overall Mass",
        image:
          "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80",
        defaultKg: 80,
        repsNum: 10,
        setsNum: 4,
      },
      {
        id: "ex_incline_db",
        name: "Incline Dumbbell Press",
        setsReps: "3 Sets × 8-12 Reps",
        focus: "Upper Chest",
        image:
          "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&auto=format&fit=crop&q=80",
        defaultKg: 34,
        repsNum: 10,
        setsNum: 3,
      },
      {
        id: "ex_cable_cross",
        name: "Cable Crossover",
        setsReps: "3 Sets × 10-15 Reps",
        focus: "Isolation / Stretch",
        image:
          "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&auto=format&fit=crop&q=80",
        defaultKg: 25,
        repsNum: 12,
        setsNum: 3,
      },
      {
        id: "ex_pushups",
        name: "Push-Ups",
        setsReps: "3 Sets to Failure",
        focus: "Burnout",
        image:
          "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400&auto=format&fit=crop&q=80",
        defaultKg: 0,
        repsNum: 15,
        setsNum: 3,
      },
    ],
  },
  shoulders: {
    id: "shoulders",
    title: "Shoulders Training Recommendation",
    muscleName: "Shoulders",
    currentMassKg: 1.8,
    symmetryVariancePct: -3.6,
    targetMassKg: 2.1,
    optimalPct: 58,
    lagPercentText: "3.6% anterior dominance",
    analysisPara1:
      "DXA multi-spectrum tomography detects elevated anterior deltoid dominance with lateral & posterior deltoid force deficits. This creates rotator cuff impingement risks during heavy horizontal presses.",
    analysisPara2:
      "Prioritize rear deltoid horizontal abduction and strict lateral raises in the scapular plane with isometric pauses to restore the optimal 1 : 1 push-to-pull shoulder ratio.",
    exercises: [
      {
        id: "ex_face_pull",
        name: "Cable Face Pulls",
        setsReps: "4 Sets × 12-15 Reps",
        focus: "Rotator Health & Rear Delts",
        image:
          "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&auto=format&fit=crop&q=80",
        defaultKg: 30,
        repsNum: 15,
        setsNum: 4,
      },
      {
        id: "ex_db_lateral",
        name: "Dumbbell Lateral Raise",
        setsReps: "4 Sets × 12-15 Reps",
        focus: "Lateral Deltoid Width",
        image:
          "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80",
        defaultKg: 14,
        repsNum: 12,
        setsNum: 4,
      },
    ],
  },
  quads: {
    id: "quads",
    title: "Quadriceps Training Recommendation",
    muscleName: "Quadriceps",
    currentMassKg: 7.2,
    symmetryVariancePct: -5.1,
    targetMassKg: 8.0,
    optimalPct: 52,
    lagPercentText: "5.1% Vastus Medialis deficit",
    analysisPara1:
      "Your scan indicates Vastus Medialis asymmetry between left and right legs. Knee extension stability is compromised under submaximal loading above 85% 1RM.",
    analysisPara2:
      "Incorporate deep knee flexion movements and unilateral split squats to restore structural balance across both quadriceps tendons.",
    exercises: [
      {
        id: "ex_leg_press",
        name: "Unilateral Leg Press",
        setsReps: "4 Sets × 10-12 Reps",
        focus: "Vastus Medialis",
        image:
          "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&auto=format&fit=crop&q=80",
        defaultKg: 90,
        repsNum: 12,
        setsNum: 4,
      },
      {
        id: "ex_bulgarian",
        name: "Bulgarian Split Squats",
        setsReps: "3 Sets × 10 Reps",
        focus: "Knee Stability",
        image:
          "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80",
        defaultKg: 20,
        repsNum: 10,
        setsNum: 3,
      },
    ],
  },
  glutes: {
    id: "glutes",
    title: "Glutes Training Recommendation",
    muscleName: "Glutes",
    currentMassKg: 5.6,
    symmetryVariancePct: -4.8,
    targetMassKg: 6.2,
    optimalPct: 48,
    lagPercentText: "4.8% hip drive lag",
    analysisPara1:
      "Peak hip extension torque shows delayed activation in the gluteus maximus, leading to lumbar spinal erector overcompensation during pulling movements.",
    analysisPara2:
      "Integrate heavy horizontal hip hinge protocols and band-resisted abductions prior to heavy deadlifts.",
    exercises: [
      {
        id: "ex_hip_thrust",
        name: "Barbell Hip Thrust",
        setsReps: "4 Sets × 10-12 Reps",
        focus: "Gluteus Maximus Peak Force",
        image:
          "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400&auto=format&fit=crop&q=80",
        defaultKg: 100,
        repsNum: 10,
        setsNum: 4,
      },
    ],
  },
  hamstrings: {
    id: "hamstrings",
    title: "Hamstrings Training Recommendation",
    muscleName: "Hamstrings",
    currentMassKg: 4.5,
    symmetryVariancePct: 0.8,
    targetMassKg: 4.6,
    optimalPct: 92,
    lagPercentText: "Optimal symmetry maintained",
    analysisPara1:
      "Posterior knee flexion torque and hip hinge balance are optimal. Continue current maintenance loading.",
    analysisPara2:
      "Maintain Romanian Deadlifts and lying leg curls at current training volume.",
    exercises: [
      {
        id: "ex_rdl",
        name: "Romanian Deadlift",
        setsReps: "3 Sets × 8-10 Reps",
        focus: "Posterior Chain Cadence",
        image:
          "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400&auto=format&fit=crop&q=80",
        defaultKg: 85,
        repsNum: 8,
        setsNum: 3,
      },
    ],
  },
  lats: {
    id: "lats",
    title: "Lats & Back Training Recommendation",
    muscleName: "Lats & Back",
    currentMassKg: 4.2,
    symmetryVariancePct: -3.2,
    targetMassKg: 4.6,
    optimalPct: 62,
    lagPercentText: "3.2% latissimus torque delta",
    analysisPara1:
      "Left-to-right pull asymmetry detected. Bilateral movements show slight trunk rotation under load.",
    analysisPara2:
      "Incorporate unilateral neutral-grip rows with strict 2-second peak contractions.",
    exercises: [
      {
        id: "ex_lat_row",
        name: "Single-Arm Cable Row",
        setsReps: "4 Sets × 10-12 Reps",
        focus: "Unilateral Lat Symmetry",
        image:
          "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&auto=format&fit=crop&q=80",
        defaultKg: 35,
        repsNum: 10,
        setsNum: 4,
      },
    ],
  },
};

export default function MuscleRecommendationPage() {
  const router = useRouter();
  const { addExerciseToActiveWorkout, showNotification } = useApp();
  const [activeZoneKey, setActiveZoneKey] = useState<string>("chest");

  const currentZone = MUSCLE_ZONES[activeZoneKey] || MUSCLE_ZONES.chest;

  const handleAddExercise = (ex: RecommendedExerciseItem) => {
    addExerciseToActiveWorkout({
      exerciseId: ex.id,
      name: ex.name,
      targetSets: ex.setsNum,
      targetReps: ex.setsReps.split("×")[1]?.trim() || "8-12",
      restSeconds: 90,
      sets: Array.from({ length: ex.setsNum }).map((_, idx) => ({
        setNumber: idx + 1,
        weightKg: ex.defaultKg,
        reps: ex.repsNum,
        completed: false,
      })),
    });
    showNotification(`✅ Added ${ex.name} to Today's Workout!`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-outline">
        <Link
          href="/body-analysis"
          className="inline-flex items-center gap-2 text-xs font-semibold text-on-surface-variant hover:text-primary-fixed transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Overview</span>
        </Link>
      </div>

      {/* Title Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-primary-fixed">
          <Sparkles className="w-4 h-4" />
          <span className="font-mono text-xs uppercase tracking-wider font-bold">
            AI BIOMECHANICAL INTELLIGENCE
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-on-surface">
          {currentZone.title}
        </h1>

        <p className="text-sm text-on-surface-variant max-w-2xl leading-relaxed">
          Diagnostic breakdown and targeted corrective exercises based on verified DXA body composition scans.
        </p>

        {/* Zone Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1">
          {Object.keys(MUSCLE_ZONES).map((key) => {
            const zone = MUSCLE_ZONES[key];
            const isActive = activeZoneKey === key;
            return (
              <button
                key={key}
                onClick={() => setActiveZoneKey(key)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-primary-fixed text-white shadow-sm"
                    : "bg-surface border border-outline text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
                }`}
              >
                {zone.muscleName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Zone Metrics Card */}
      <section className="p-5 rounded-2xl bg-surface border border-outline flex flex-col gap-3 shadow-sm">
        <span className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider font-bold">
          TARGET BIOMETRIC PROFILE
        </span>
        <h3 className="text-lg font-bold text-on-surface">
          Target Muscle: <span className="text-primary-fixed">{currentZone.muscleName}</span>
        </h3>

        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-outline text-center text-xs">
          <div className="p-3 bg-surface-container rounded-lg border border-outline">
            <span className="text-on-surface-variant text-[11px] block">Current Mass</span>
            <span className="font-bold text-on-surface text-sm mt-0.5 block">{currentZone.currentMassKg} kg</span>
          </div>
          <div className="p-3 bg-surface-container rounded-lg border border-outline">
            <span className="text-on-surface-variant text-[11px] block">Symmetry Variance</span>
            <span className="font-bold text-amber-600 text-sm mt-0.5 block">{currentZone.symmetryVariancePct}%</span>
          </div>
          <div className="p-3 bg-surface-container rounded-lg border border-outline">
            <span className="text-on-surface-variant text-[11px] block">Target Mass</span>
            <span className="font-bold text-primary-fixed text-sm mt-0.5 block">{currentZone.targetMassKg} kg</span>
          </div>
        </div>
      </section>

      {/* AI Analysis Insight */}
      <section className="p-5 rounded-2xl bg-surface border-l-4 border-l-primary-fixed border border-outline flex flex-col gap-3 shadow-sm">
        <div className="flex items-center gap-2 text-primary-fixed">
          <Sparkles className="w-4 h-4" />
          <h3 className="text-base font-bold text-on-surface">
            Clinical Telemetry Analysis
          </h3>
        </div>

        <div className="space-y-2 text-xs sm:text-sm text-on-surface-variant leading-relaxed">
          <p>
            Your latest scan indicates a{" "}
            <strong className="text-on-surface font-semibold">{currentZone.lagPercentText}</strong> in the {currentZone.muscleName.toLowerCase()} region relative to opposing muscular chains.
          </p>
          <p>{currentZone.analysisPara2}</p>
        </div>

        {/* Readiness Bar */}
        <div className="pt-2 flex items-center justify-between gap-3">
          <div className="flex-1 h-2 bg-surface-container-high rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-fixed rounded-full transition-all duration-700"
              style={{ width: `${currentZone.optimalPct}%` }}
            />
          </div>
          <span className="text-[11px] font-mono font-bold text-on-surface-variant whitespace-nowrap">
            {currentZone.optimalPct}% OPTIMAL
          </span>
        </div>
      </section>

      {/* Recommended Exercises Section */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2 text-on-surface">
          <Dumbbell className="w-4 h-4 text-primary-fixed" />
          <h3 className="text-lg font-bold text-on-surface">Recommended Corrective Movements</h3>
        </div>

        <div className="space-y-3">
          {currentZone.exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="p-4 rounded-xl bg-surface border border-outline hover:border-primary-fixed/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface-container border border-outline shrink-0">
                  <img
                    src={exercise.image}
                    alt={exercise.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <h4 className="text-sm sm:text-base font-bold text-on-surface">
                    {exercise.name}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-on-surface-variant mt-0.5">
                    <span className="font-semibold text-primary-fixed">{exercise.setsReps}</span>
                    <span>•</span>
                    <span>Focus: {exercise.focus}</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleAddExercise(exercise)}
                className="px-4 py-2 rounded-lg bg-primary-fixed text-white text-xs font-bold hover:bg-primary-fixed/90 shadow-sm flex items-center justify-center gap-1.5 transition-all shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add to Today's Workout</span>
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
