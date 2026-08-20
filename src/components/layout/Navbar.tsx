"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  Flame,
  Zap,
  Activity,
  Heart,
  Dumbbell,
  Bot,
  Apple,
  ScanLine,
  User,
  Radio,
  Layers,
  Sparkles,
  Search,
  Bell,
  Play,
  Pause,
  CheckCircle2,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { user, dailyStats, activeWorkout, resumeWorkout, pauseWorkout, finishWorkout } = useApp();
  const [searchOpen, setSearchOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Dashboard", icon: Flame },
    { href: "/workout-tracker", label: "Workout Tracker", icon: Dumbbell, badge: "STITCH" },
    { href: "/workouts", label: "Workouts", icon: Dumbbell },
    { href: "/ai-coach", label: "AI Coach", icon: Bot, badge: "AI" },
    { href: "/nutrition", label: "Nutrition", icon: Apple },
    { href: "/body-analysis", label: "Body & HRV", icon: Activity },
    { href: "/exercises", label: "Library", icon: Zap },
    { href: "/scanner", label: "AI Scanner", icon: ScanLine },
    { href: "/devices", label: "Devices", icon: Radio },
    { href: "/prototype", label: "Stitch Canvas", icon: Layers, highlight: true },
  ];

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/[0.08] backdrop-blur-xl bg-[#090A0F]/85">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00F0FF] to-[#0070F3] p-0.5 shadow-[0_0_15px_rgba(0,240,255,0.4)] group-hover:shadow-[0_0_25px_rgba(0,240,255,0.6)] transition-all">
              <div className="w-full h-full bg-[#090A0F] rounded-[10px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-[#00F0FF]" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-wider text-white text-lg sm:text-xl font-mono">
                  ERA<span className="text-[#00F0FF]">FIT</span>
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30">
                  Noir
                </span>
              </div>
              <span className="text-[10px] text-gray-400 tracking-wider hidden sm:block">
                PERFORMANCE OS
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "text-[#00F0FF] bg-[#00F0FF]/10 border border-[#00F0FF]/30 shadow-[0_0_12px_rgba(0,240,255,0.15)]"
                    : link.highlight
                    ? "text-purple-400 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20"
                    : "text-gray-300 hover:text-white hover:bg-white/[0.05]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[9px] font-semibold px-1 py-0.2 bg-[#00F0FF] text-black rounded font-mono">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right: Telemetry & Profile & Active Workout Pill */}
        <div className="flex items-center gap-3">
          {/* Active Workout Widget in Navbar */}
          {activeWorkout && activeWorkout.isActive && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#00F0FF]/15 border border-[#00F0FF]/40 shadow-[0_0_15px_rgba(0,240,255,0.3)] animate-pulse">
              <span className="w-2 h-2 rounded-full bg-[#00F0FF]" />
              <span className="text-xs font-mono font-bold text-[#00F0FF]">
                {formatTime(activeWorkout.elapsedSeconds)}
              </span>
              <button
                onClick={activeWorkout.isPaused ? resumeWorkout : pauseWorkout}
                className="text-gray-300 hover:text-white ml-1"
                title={activeWorkout.isPaused ? "Resume" : "Pause"}
              >
                {activeWorkout.isPaused ? <Play className="w-3.5 h-3.5 text-[#00F0FF]" /> : <Pause className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={finishWorkout}
                className="text-emerald-400 hover:text-emerald-300 ml-1"
                title="Finish Workout"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Live Heart Rate Telemetry Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono">
            <Heart className="w-3.5 h-3.5 text-[#FF385C] animate-pulse fill-[#FF385C]" />
            <span className="text-white font-semibold">{dailyStats.currentHeartRateBpm}</span>
            <span className="text-gray-400 text-[10px]">BPM</span>
          </div>

          {/* Readiness Score Indicator */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-xs font-mono text-emerald-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{user.readinessScore}% READY</span>
          </div>

          {/* User Profile Avatar Link */}
          <Link
            href="/profile"
            className="flex items-center gap-2 p-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] transition-all"
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover border border-[#00F0FF]/40"
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
