"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import logo from "@/assets/logo-transparent.png";
import {
  LayoutDashboard,
  Dumbbell,
  Heart,
  MessageCircle,
  Users,
  Shield,
  UserCheck,
  Sparkles,
  Bot,
} from "lucide-react";

export function Navigation() {
  const pathname = usePathname();
  const { role, user } = useAuth();

  // Hide standard navigation on dedicated auth pages
  if (pathname.startsWith("/auth/")) {
    return null;
  }

  // Dynamic Navigation Items by Role
  let navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Workout", href: "/workout-tracker", icon: Dumbbell },
    { label: "AI Agent", href: "/ai-coach", icon: Sparkles, isAI: true },
    { label: "Health", href: "/health", icon: Heart },
    { label: "Monitor", href: "/monitor", icon: Shield },
  ];

  if (role === "MONITOR") {
    navItems = [
      { label: "Monitor", href: "/monitor", icon: Shield },
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
      { label: "AI Agent", href: "/ai-coach", icon: Sparkles, isAI: true },
      { label: "Workouts", href: "/workout-tracker", icon: Dumbbell },
      { label: "Health", href: "/health", icon: Heart },
    ];
  }

  // On AI Coach page, hide mobile bottom bar so chat input is completely unobstructed
  const isAiCoachPage = pathname === "/ai-coach";

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-surface border-r border-outline pt-5 px-4 z-40 gap-2">
        {/* Brand Logo Header */}
        <Link href="/" className="flex items-center gap-3 px-2 py-1 mb-1 group">
          <div className="p-1.5 rounded-xl bg-surface-container border border-outline shadow-sm group-hover:scale-105 transition-transform">
            <Image
              src={logo}
              alt="FIT ERA Logo"
              width={34}
              height={34}
              style={{ objectFit: "contain" }}
            />
          </div>
          <div>
            <span className="font-mono font-black text-base tracking-wider text-on-surface block">
              FIT ERA
            </span>
          </div>
        </Link>

        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-semibold ${
                isActive
                  ? item.isAI
                    ? "text-primary-fixed bg-primary-container/70 font-bold shadow-xs border border-primary-fixed/20"
                    : "text-primary-fixed bg-primary-container/50 font-bold"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              <Icon className={`w-5 h-5 ${item.isAI ? "text-primary-fixed animate-pulse" : ""}`} />
              <span className="font-label-md text-sm flex items-center gap-1.5">
                {item.label}
                {item.isAI && (
                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono bg-primary-fixed text-white font-bold uppercase">
                    AI
                  </span>
                )}
              </span>
            </Link>
          );
        })}

        <div className="mt-auto pb-6 space-y-2">
          <Link
            href="/ai-coach"
            className="w-full bg-primary-fixed text-white font-label-md text-sm px-4 py-3 rounded-lg flex items-center justify-center gap-2 shadow-sm hover:opacity-90 transition-all font-bold"
          >
            <Sparkles className="w-5 h-5" />
            Ask AI Agent
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Bar (Hidden on /ai-coach to prevent input occlusion) */}
      {!isAiCoachPage && (
        <nav className="fixed bottom-0 w-full z-50 bg-surface/95 backdrop-blur-lg border-t border-outline shadow-lg flex justify-around items-center h-18 px-1 pb-safe md:hidden">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center w-14 sm:w-16 py-1 transition-all ${
                  isActive
                    ? "text-primary-fixed font-bold scale-105"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <div
                  className={`flex items-center justify-center w-11 h-7.5 rounded-full mb-0.5 transition-all ${
                    isActive
                      ? item.isAI
                        ? "bg-primary-fixed text-white shadow-md shadow-primary-fixed/30"
                        : "bg-primary-container text-primary-fixed"
                      : item.isAI
                      ? "bg-surface-container border border-primary-fixed/40 text-primary-fixed shadow-xs"
                      : ""
                  }`}
                >
                  <Icon className={`w-4.5 h-4.5 ${item.isAI && !isActive ? "text-primary-fixed animate-pulse" : ""}`} />
                </div>
                <span className={`font-label-sm text-[10px] leading-tight ${isActive ? "font-bold" : ""}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}
