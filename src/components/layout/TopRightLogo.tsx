"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import logo from "@/assets/logo-transparent.png";
import { useAuth } from "@/context/AuthContext";
import { useApp } from "@/context/AppContext";
import {
  User,
  LogOut,
  ChevronRight,
  Shield,
  Dumbbell,
  LogIn,
  Key,
  Sparkles,
} from "lucide-react";

export default function TopRightLogo() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { user, role, logout } = useAuth();
  const { showNotification } = useApp();

  // Hide on auth pages
  if (pathname.startsWith("/auth/")) {
    return null;
  }

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    setIsOpen(false);
    await logout();
    showNotification("👋 Signed out of EraFit session.");
  };

  const displayName = user?.name || "Pranith A";
  const displayEmail = user?.email || "pranithp82@gmail.com";

  return (
    <div className="fixed top-4 right-4 z-50" ref={dropdownRef}>
      {/* Brand Logo Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label="Toggle EraFit brand menu"
        className="relative p-1.5 rounded-2xl bg-surface/90 hover:bg-surface border border-outline shadow-lg backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-primary-fixed hover:scale-105 active:scale-95 transition-all cursor-pointer group flex items-center justify-center"
      >
        <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center overflow-hidden border border-outline/50">
          <Image
            src={logo}
            alt="FIT ERA Logo"
            width={32}
            height={32}
            priority
            style={{
              width: "28px",
              height: "28px",
              objectFit: "contain",
              display: "block",
            }}
            className="drop-shadow-sm group-hover:scale-110 transition-transform"
          />
        </div>
      </button>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-68 sm:w-76 rounded-2xl bg-surface/95 backdrop-blur-xl border border-outline shadow-2xl overflow-hidden animate-scaleUp origin-top-right transition-all text-on-surface">
          {/* Header with App Brand and User Profile */}
          <div className="p-4 bg-surface-container/60 border-b border-outline">
            <div className="flex items-center gap-2.5 mb-3 pb-2.5 border-b border-outline/50">
              <Image
                src={logo}
                alt="FIT ERA Logo"
                width={26}
                height={26}
                style={{ objectFit: "contain" }}
              />
              <div>
                <span className="font-extrabold text-xs tracking-wider text-on-surface block font-mono">
                  FIT ERA PLATFORM
                </span>
                <span className="text-[10px] text-on-surface-variant font-mono">
                  Performance &amp; Clinical Health OS
                </span>
              </div>
            </div>

            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 group hover:opacity-90 transition-opacity"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-container border border-primary-fixed/30 flex items-center justify-center text-primary-fixed font-bold text-base shadow-sm shrink-0 overflow-hidden">
                {user?.avatar ? (
                  <img src={user.avatar} alt={displayName} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-primary-fixed" />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-headline-md text-sm font-bold text-on-surface truncate group-hover:text-primary-fixed transition-colors">
                  {displayName}
                </span>
                <span className="font-label-sm text-xs text-on-surface-variant truncate font-mono">
                  {displayEmail}
                </span>
              </div>
            </Link>
          </div>

          {/* Quick Actions List */}
          <div className="p-2 space-y-1">
            <Link
              href="/ai-coach"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-primary-container/40 text-primary-fixed hover:bg-primary-container/70 transition-colors group border border-primary-fixed/20"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-primary-fixed animate-pulse" />
                <span className="font-bold">Ask AI Health Coach</span>
              </div>
              <span className="text-[9px] font-mono bg-primary-fixed text-white px-1.5 py-0.5 rounded-full font-bold uppercase">
                Live
              </span>
            </Link>

            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold hover:bg-surface-container transition-colors group"
            >
              <div className="flex items-center gap-2.5 text-on-surface">
                <User className="w-4 h-4 text-on-surface-variant group-hover:text-primary-fixed transition-colors" />
                <span>Profile &amp; PIN</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant group-hover:text-on-surface transition-colors" />
            </Link>

            <Link
              href="/monitor"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold hover:bg-surface-container transition-colors group"
            >
              <div className="flex items-center gap-2.5 text-on-surface">
                <Shield className="w-4 h-4 text-emerald-600 group-hover:text-emerald-500 transition-colors" />
                <span>Coach Monitor Portal</span>
              </div>
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-700 px-1.5 py-0.5 rounded font-bold border border-emerald-500/20">
                2 Controls
              </span>
            </Link>

            <Link
              href="/workout-tracker"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold hover:bg-surface-container transition-colors group"
            >
              <div className="flex items-center gap-2.5 text-on-surface">
                <Dumbbell className="w-4 h-4 text-blue-600 group-hover:text-blue-500 transition-colors" />
                <span>Workout Tracker</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant group-hover:text-on-surface transition-colors" />
            </Link>
          </div>

          {/* Footer with Sign Out */}
          <div className="p-2 bg-surface-container/30 border-t border-outline">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-500/10 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </div>
              <span className="text-[10px] font-mono text-red-500/70 group-hover:text-red-600">
                End Session
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
