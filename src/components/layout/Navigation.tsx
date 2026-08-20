"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Dumbbell, Heart, MessageCircle } from "lucide-react";

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Workout", href: "/workout-tracker", icon: Dumbbell },
    { label: "Health", href: "/health", icon: Heart },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-64 bg-surface border-r border-outline pt-6 px-4 z-40 gap-1.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-semibold ${
                isActive
                  ? "text-primary-fixed bg-primary-container/50"
                  : "text-on-surface-variant hover:bg-surface-container"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-label-md text-sm">{item.label}</span>
            </Link>
          );
        })}

        <div className="mt-auto pb-6">
          <Link
            href="/ai-coach"
            className="w-full bg-primary-fixed text-white font-label-md text-sm px-4 py-3 rounded-lg flex items-center justify-center gap-2 shadow-sm hover:opacity-90 transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            Ask AI Agent
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Bar */}
      <nav className="fixed bottom-0 w-full z-50 bg-surface border-t border-outline shadow-sm flex justify-around items-center h-20 px-2 pb-safe md:hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-16 py-1 transition-colors ${
                isActive ? "text-primary-fixed" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <div className={`flex items-center justify-center w-12 h-8 rounded-full mb-1 transition-colors ${isActive ? "bg-primary-container" : ""}`}>
                 <Icon className="w-5 h-5" />
              </div>
              <span className={`font-label-sm text-[10px] ${isActive ? "font-bold" : ""}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
