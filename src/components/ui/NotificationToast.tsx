"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { Zap } from "lucide-react";

export default function NotificationToast() {
  const { notificationMessage } = useApp();

  if (!notificationMessage) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 animate-bounce duration-300">
      <div className="glass-panel-glow bg-[#10121A]/95 text-white px-4 py-3 rounded-2xl border border-[#00F0FF]/40 shadow-[0_0_25px_rgba(0,240,255,0.3)] flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#00F0FF]/20 flex items-center justify-center text-[#00F0FF] flex-shrink-0">
          <Zap className="w-4 h-4" />
        </div>
        <span className="text-xs font-semibold text-gray-100">{notificationMessage}</span>
      </div>
    </div>
  );
}
