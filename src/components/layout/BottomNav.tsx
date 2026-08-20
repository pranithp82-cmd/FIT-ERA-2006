"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Flame,
  Dumbbell,
  Bot,
  Apple,
  Activity,
  ScanLine,
  User,
  Layers,
} from "lucide-react";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home", icon: Flame },
    { href: "/workouts", label: "Workouts", icon: Dumbbell },
    { href: "/ai-coach", label: "AI Coach", icon: Bot },
    { href: "/nutrition", label: "Nutrition", icon: Apple },
    { href: "/body-analysis", label: "Body", icon: Activity },
    { href: "/scanner", label: "Scan", icon: ScanLine },
    { href: "/profile", label: "Profile", icon: User },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090A0F]/90 backdrop-blur-xl border-t border-white/[0.08] px-2 py-2 safe-area-pb">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                isActive
                  ? "text-[#00F0FF]"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : ""}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#00F0FF] shadow-[0_0_8px_#00F0FF]" />
                )}
              </div>
              <span className={`text-[10px] mt-1 font-medium ${isActive ? "text-[#00F0FF] font-semibold" : "text-gray-400"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
