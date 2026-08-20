"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import logo from "@/assets/logo-transparent.png";
import { useApp } from "@/context/AppContext";
import {
  User,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

export default function TopRightLogo() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { showNotification } = useApp();

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

  const handleSignOut = () => {
    setIsOpen(false);
    showNotification("👋 Signed out of EraFit Healthcare session.");
    router.push("/");
  };

  return (
    <div className="fixed top-4 right-4 z-50" ref={dropdownRef}>
      {/* Logo Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label="Toggle user account menu"
        className="relative block rounded-full focus:outline-none focus:ring-2 focus:ring-primary-fixed hover:scale-105 active:scale-95 transition-all cursor-pointer group"
      >
        <Image
          src={logo}
          alt="EraFit Menu"
          width={40}
          height={40}
          priority
          style={{
            width: "40px",
            height: "40px",
            objectFit: "contain",
            borderRadius: "50%",
            background: "transparent",
            display: "block",
          }}
          className="drop-shadow-sm group-hover:drop-shadow-md transition-all"
        />
        {/* Subtle Online Status Dot */}
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-surface" />
      </button>

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-64 sm:w-72 rounded-2xl bg-surface/95 backdrop-blur-xl border border-outline shadow-2xl overflow-hidden animate-scaleUp origin-top-right transition-all text-on-surface">
          {/* User Profile Header */}
          <div className="p-4 bg-surface-container/60 border-b border-outline">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 group hover:opacity-90 transition-opacity"
            >
              <div className="w-10 h-10 rounded-full bg-primary-container border border-primary-fixed/30 flex items-center justify-center text-primary-fixed font-bold text-base shadow-sm shrink-0">
                <User className="w-5 h-5 text-primary-fixed" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-headline-md text-sm font-bold text-on-surface truncate group-hover:text-primary-fixed transition-colors">
                    Alex Mercer
                  </span>
                  <span className="text-[9px] font-mono font-bold bg-primary-fixed/15 text-primary-fixed px-1.5 py-0.2 rounded">
                    PRO
                  </span>
                </div>
                <span className="text-xs text-on-surface-variant truncate">
                  alex.mercer@gmail.com
                </span>
              </div>
            </Link>
          </div>

          {/* Profile Action Link */}
          <div className="p-2 flex flex-col gap-1">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-surface-container transition-colors text-xs font-semibold text-on-surface group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant group-hover:text-primary-fixed">
                  <User className="w-4 h-4" />
                </div>
                <span>View Profile &amp; Settings</span>
              </div>
              <ChevronRight className="w-4 h-4 text-on-surface-variant opacity-60 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Sign Out Action */}
          <div className="p-2 border-t border-outline bg-surface-container/30">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-danger hover:bg-danger/10 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-danger/10 flex items-center justify-center text-danger">
                  <LogOut className="w-4 h-4" />
                </div>
                <span>Sign Out</span>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
