"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  ArrowLeft,
  History,
  Trash2,
  Plus,
  Check,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  Award,
  Dumbbell,
} from "lucide-react";

interface SetData {
  id: number;
  weight: number | string;
  reps: number | string;
  completed: boolean;
}

export default function BarbellBenchPressPage() {
  const router = useRouter();
  const { user, showNotification, recordCompletedWorkoutLog, workoutHistory } = useApp();

  const [sets, setSets] = useState<SetData[]>([
    { id: 1, weight: 80, reps: 12, completed: true },
    { id: 2, weight: 85, reps: 10, completed: true },
    { id: 3, weight: 90, reps: 8, completed: true },
    { id: 4, weight: 95, reps: 6, completed: false },
  ]);

  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const completedCount = sets.filter((s) => s.completed).length;
  const totalCount = sets.length;
  const isAllCompleted = totalCount > 0 && completedCount === totalCount;

  const toggleSetCompleted = (index: number) => {
    const nextSets = [...sets];
    nextSets[index].completed = !nextSets[index].completed;
    setSets(nextSets);
    if (nextSets[index].completed) {
      showNotification(`Set ${index + 1} logged (${nextSets[index].weight} kg × ${nextSets[index].reps} reps)`);
    }
  };

  const handleWeightChange = (index: number, val: string) => {
    const nextSets = [...sets];
    nextSets[index].weight = val;
    setSets(nextSets);
  };

  const handleRepsChange = (index: number, val: string) => {
    const nextSets = [...sets];
    nextSets[index].reps = val;
    setSets(nextSets);
  };

  const addSet = () => {
    const lastSet = sets[sets.length - 1];
    const nextWeight = lastSet ? Number(lastSet.weight) || 90 : 90;
    const nextReps = lastSet ? Math.max(4, (Number(lastSet.reps) || 8) - 2) : 8;

    setSets([
      ...sets,
      {
        id: sets.length + 1,
        weight: nextWeight,
        reps: nextReps,
        completed: false,
      },
    ]);
    showNotification(`Added Set ${sets.length + 1}`);
  };

  const deleteLastSet = () => {
    if (sets.length <= 1) return;
    setSets(sets.slice(0, -1));
    showNotification(`Deleted Set ${sets.length}`);
  };

  const handleCompleteWorkout = () => {
    const completedSets = sets.filter((s) => s.completed);
    let totalVolumeKg = 0;
    completedSets.forEach((s) => {
      totalVolumeKg += (Number(s.weight) || 0) * (Number(s.reps) || 0);
    });

    const completedLog = {
      id: `bench_${Date.now()}`,
      title: "Barbell Bench Press Focus",
      subtitle: "Chest Day Hypertrophy & Power Protocol",
      category: "Hypertrophy",
      completedAt: "Today, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      durationMinutes: 35,
      caloriesBurned: 290,
      totalVolumeKg: totalVolumeKg || 3500,
      strainScore: 14.5,
      exercises: [
        {
          name: "Barbell Bench Press",
          completedSets: completedSets.length,
          totalSets: sets.length,
          sets: sets.map((s, idx) => ({
            setNumber: idx + 1,
            weightKg: Number(s.weight) || 80,
            reps: Number(s.reps) || 10,
            completed: s.completed,
          })),
        },
      ],
    };

    recordCompletedWorkoutLog(completedLog);
    showNotification("🏆 Barbell Bench Press Complete! Recorded in Performance Log.");
    router.push("/workout-tracker");
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24 flex flex-col gap-6">
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

      {/* Movement Title & Hero */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-wider text-primary-fixed font-bold">
            BIOMETRIC TRACKER
          </span>
          <span className="text-xs font-semibold text-primary-fixed bg-primary-container px-2.5 py-1 rounded-md">
            Chest Day Focus
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-on-surface">
          Barbell Bench Press
        </h1>
        <p className="text-sm text-on-surface-variant">
          Compound horizontal pressing power. Log exact load, working reps, and auto-calculate 1RM.
        </p>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-3 gap-3 p-4 bg-surface rounded-xl border border-outline text-center shadow-sm">
        <div>
          <span className="text-xs text-on-surface-variant block">Last Max</span>
          <span className="text-lg font-bold text-on-surface mt-0.5 block">100 kg</span>
        </div>
        <div className="border-x border-outline">
          <span className="text-xs text-on-surface-variant block">Target Reps</span>
          <span className="text-lg font-bold text-primary-fixed mt-0.5 block">8 - 12</span>
        </div>
        <div>
          <span className="text-xs text-on-surface-variant block">Estimated 1RM</span>
          <span className="text-lg font-bold text-emerald-600 mt-0.5 block">114 kg</span>
        </div>
      </div>

      {/* Working Sets Table Card */}
      <div className="bg-surface rounded-xl border border-outline overflow-hidden shadow-sm">
        <div className="p-4 border-b border-outline flex justify-between items-center bg-surface-container/50">
          <h3 className="font-bold text-base text-on-surface">Working Sets</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={deleteLastSet}
              className="p-1.5 rounded-md hover:bg-red-50 text-on-surface-variant hover:text-red-600 transition-colors"
              title="Delete Last Set"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container/30 text-xs font-semibold text-on-surface-variant uppercase border-b border-outline">
                <th className="py-3 px-4 text-center w-16">Set</th>
                <th className="py-3 px-4">Weight (kg)</th>
                <th className="py-3 px-4">Reps</th>
                <th className="py-3 px-4 text-center w-24">Done</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {sets.map((item, index) => (
                <tr
                  key={item.id}
                  className={`border-b border-outline transition-colors ${
                    item.completed ? "bg-emerald-50/40" : "hover:bg-surface-container/30"
                  }`}
                >
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold ${
                        item.completed
                          ? "bg-emerald-600 text-white"
                          : "bg-surface-container text-on-surface-variant border border-outline"
                      }`}
                    >
                      {index + 1}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <input
                      type="number"
                      value={item.weight}
                      onChange={(e) => handleWeightChange(index, e.target.value)}
                      className="w-20 px-2 py-1 bg-surface border border-outline rounded text-sm font-bold text-on-surface focus:border-primary-fixed outline-none"
                    />
                  </td>

                  <td className="py-3 px-4">
                    <input
                      type="number"
                      value={item.reps}
                      onChange={(e) => handleRepsChange(index, e.target.value)}
                      className="w-16 px-2 py-1 bg-surface border border-outline rounded text-sm font-bold text-on-surface focus:border-primary-fixed outline-none"
                    />
                  </td>

                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => toggleSetCompleted(index)}
                      className={`w-7 h-7 rounded-lg border inline-flex items-center justify-center transition-all ${
                        item.completed
                          ? "bg-emerald-600 border-emerald-600 text-white shadow-sm"
                          : "border-outline text-on-surface-variant hover:border-primary-fixed bg-surface"
                      }`}
                    >
                      {item.completed && <Check className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button
          onClick={addSet}
          className="w-full py-3 bg-surface hover:bg-surface-container text-primary-fixed font-semibold text-xs flex items-center justify-center gap-1.5 border-t border-outline transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Set</span>
        </button>
      </div>

      {/* Progress & Complete */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-surface rounded-xl border border-outline shadow-sm">
        <div>
          <span className="text-xs text-on-surface-variant block">Session Progress</span>
          <span className="text-sm font-bold text-on-surface">
            {completedCount} / {totalCount} Sets Completed
          </span>
        </div>

        <button
          onClick={handleCompleteWorkout}
          className="px-6 py-2.5 rounded-lg bg-primary-fixed text-white font-bold text-xs shadow-sm hover:bg-primary-fixed/90 transition-all flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Save & Complete Exercise</span>
        </button>
      </div>
    </div>
  );
}
