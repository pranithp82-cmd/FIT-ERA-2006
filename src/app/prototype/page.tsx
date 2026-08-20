"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Layers,
  Smartphone,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ExternalLink,
  ChevronRight,
  Flame,
  Bot,
  Apple,
  Dumbbell,
  ScanLine,
  Activity,
  Radio,
  User,
  Heart,
  Trophy,
  Sparkles,
} from "lucide-react";
import DashboardPage from "@/app/page";
import WorkoutTrackerPage from "@/app/workout-tracker/page";
import AICoachPage from "@/app/ai-coach/page";
import NutritionPage from "@/app/nutrition/page";
import WorkoutsPage from "@/app/workouts/page";
import ExercisesPage from "@/app/exercises/page";
import ScannerPage from "@/app/scanner/page";
import BodyAnalysisPage from "@/app/body-analysis/page";
import DevicesPage from "@/app/devices/page";
import ProfilePage from "@/app/profile/page";
import SelectWorkoutPage from "@/app/select-workout/page";
import BarbellBenchPressPage from "@/app/workout-tracker/bench-press/page";

export default function PrototypePage() {
  const [zoomLevel, setZoomLevel] = useState<number>(0.85);
  const [activeScreenIndex, setActiveScreenIndex] = useState<number | null>(null);

  const screens = [
    {
      id: "workout_tracker",
      title: "Wc...",
      sub: "Workout Tracker",
      component: <WorkoutTrackerPage />,
      route: "/workout-tracker",
      icon: Dumbbell,
    },
    {
      id: "fit",
      title: "Fit...",
      sub: "Fitness Hub",
      component: <DashboardPage />,
      route: "/",
      icon: Flame,
    },
    {
      id: "ai_chat",
      title: "AI...",
      sub: "AI Coach Chat",
      component: <AICoachPage />,
      route: "/ai-coach",
      icon: Bot,
    },
    {
      id: "food",
      title: "Fo...",
      sub: "Food & Macros",
      component: <NutritionPage />,
      route: "/nutrition",
      icon: Apple,
    },
    {
      id: "workout",
      title: "Wc...",
      sub: "Workout Plan",
      component: <WorkoutsPage />,
      route: "/workouts",
      icon: Dumbbell,
    },
    {
      id: "exercise_sel",
      title: "Sel...",
      sub: "Exercise Library",
      component: <ExercisesPage />,
      route: "/exercises",
      icon: Dumbbell,
    },
    {
      id: "barcode",
      title: "Ba...",
      sub: "Vision Scanner",
      component: <ScannerPage />,
      route: "/scanner",
      icon: ScanLine,
    },
    {
      id: "body_ai",
      title: "AI...",
      sub: "Body Analysis",
      component: <BodyAnalysisPage />,
      route: "/body-analysis",
      icon: Activity,
    },
    {
      id: "devices_co",
      title: "Co...",
      sub: "Connect Devices",
      component: <DevicesPage />,
      route: "/devices",
      icon: Radio,
    },
    {
      id: "profile_prc",
      title: "Prc...",
      sub: "Athlete Profile",
      component: <ProfilePage />,
      route: "/profile",
      icon: User,
    },
    {
      id: "select_workout",
      title: "Sel...",
      sub: "Select Workout (50 Items)",
      component: <SelectWorkoutPage />,
      route: "/select-workout",
      icon: Dumbbell,
    },
    {
      id: "bench_press",
      title: "Bar...",
      sub: "Barbell Bench Press Tracker",
      component: <BarbellBenchPressPage />,
      route: "/workout-tracker/bench-press",
      icon: Dumbbell,
    },
  ];

  return (
    <div className="min-h-screen bg-[#07080B] relative overflow-hidden flex flex-col">
      {/* Stitch Canvas Dot Matrix Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff18_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Top Toolbar */}
      <div className="sticky top-0 z-40 bg-[#090A0F]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase font-bold text-white">
                STITCH CANVAS // PROJECT 10716897052711114884
              </span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
                LIVE INTERACTIVE
              </span>
            </div>
            <span className="text-[11px] text-gray-400">
              Noir Performance Design System • 13 Artboards Synthesized
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.4, z - 0.1))}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-gray-300 px-2">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.2, z + 0.1))}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          <Link
            href="/"
            className="px-3.5 py-1.5 rounded-xl bg-[#00F0FF] text-black font-bold text-xs shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:bg-[#00F0FF]/90 flex items-center gap-1"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Web View</span>
          </Link>
        </div>
      </div>

      {/* Canvas Area with Screens rendered in horizontal flow */}
      <div className="flex-1 overflow-x-auto overflow-y-auto p-8 relative flex items-start gap-8 min-h-[85vh]">
        {/* Style Guide / Design System Card first */}
        <div className="w-[340px] flex-shrink-0 glass-panel-glow p-6 rounded-3xl border border-white/15 space-y-4">
          <div className="flex items-center gap-2 text-purple-400 text-xs font-mono font-bold uppercase">
            <Sparkles className="w-4 h-4" />
            <span>Noir Performance Design System</span>
          </div>

          <div>
            <span className="text-[10px] font-mono text-gray-400 block mb-2">TYPOGRAPHY HIERARCHY</span>
            <div className="space-y-1">
              <div className="text-2xl font-black text-white">Aa Display Bold</div>
              <div className="text-base font-bold text-gray-200">Aa Section Header</div>
              <div className="text-xs font-mono text-[#00F0FF]">Aa Biometric Telemetry</div>
              <div className="text-xs text-gray-400">Aa Body Regular</div>
            </div>
          </div>

          <div>
            <span className="text-[10px] font-mono text-gray-400 block mb-2">CHROMATIC PALETTE</span>
            <div className="grid grid-cols-5 gap-2">
              <div className="h-10 rounded-xl bg-[#08090D] border border-white/20" title="Pitch Black #08090D" />
              <div className="h-10 rounded-xl bg-[#10121A] border border-white/20" title="Charcoal #10121A" />
              <div className="h-10 rounded-xl bg-[#00F0FF] shadow-[0_0_10px_#00F0FF]" title="Electric Cyan #00F0FF" />
              <div className="h-10 rounded-xl bg-[#FF385C] shadow-[0_0_10px_#FF385C]" title="Neon Coral #FF385C" />
              <div className="h-10 rounded-xl bg-[#10B981] shadow-[0_0_10px_#10B981]" title="Emerald Green #10B981" />
            </div>
          </div>

          <div>
            <span className="text-[10px] font-mono text-gray-400 block mb-2">COMPONENTS & STATES</span>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5">
                <span className="text-xs text-white">Active Toggle</span>
                <span className="w-8 h-4 rounded-full bg-[#00F0FF] p-0.5 flex justify-end">
                  <span className="w-3 h-3 rounded-full bg-black" />
                </span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-white/5">
                <span className="text-xs text-white">Pill Badge</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-[#00F0FF]/15 text-[#00F0FF] font-mono font-bold">
                  OPTIMAL
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Render Each Screen inside a Mobile Phone Bezel Frame */}
        {screens.map((screen, idx) => (
          <div
            key={screen.id}
            className="flex-shrink-0 flex flex-col items-center space-y-2 group"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: "top center",
            }}
          >
            {/* Screen Title Tag above device */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-gray-300">
              <screen.icon className="w-3.5 h-3.5 text-[#00F0FF]" />
              <span className="font-bold text-white">{screen.title}</span>
              <span className="text-gray-400 text-[10px]">({screen.sub})</span>
            </div>

            {/* Mobile Phone Mockup Frame */}
            <div className="w-[375px] h-[780px] bg-[#090A0F] rounded-[48px] p-3 border-4 border-[#252836] shadow-[0_20px_60px_rgba(0,0,0,0.9)] relative overflow-hidden flex flex-col">
              {/* Dynamic Island / Camera Notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-50 flex items-center justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-900/50" />
              </div>

              {/* Status Bar */}
              <div className="h-6 flex items-center justify-between px-6 text-[10px] font-mono text-gray-400 pt-1 z-30">
                <span>09:41</span>
                <div className="flex items-center gap-1">
                  <span>5G</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Screen Body Content (Interactive) */}
              <div className="flex-1 overflow-y-auto no-scrollbar rounded-[36px] bg-[#08090D] pt-2">
                {screen.component}
              </div>

              {/* Home Indicator bar */}
              <div className="h-4 flex items-center justify-center">
                <div className="w-28 h-1 bg-white/30 rounded-full" />
              </div>
            </div>

            <Link
              href={screen.route}
              className="mt-2 px-3 py-1 rounded-lg bg-white/5 hover:bg-[#00F0FF]/20 text-gray-300 hover:text-[#00F0FF] text-xs font-mono flex items-center gap-1 transition-all"
            >
              <span>Launch {screen.sub}</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
