"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import {
  Radio,
  Watch,
  Battery,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Activity,
  Heart,
  Bluetooth,
  Plus,
} from "lucide-react";

export default function DevicesPage() {
  const { devices, toggleDevice, dailyStats, showNotification } = useApp();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="glass-panel p-6 rounded-3xl border border-white/[0.08] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#00F0FF]">
            HARDWARE TELEMETRY STREAM
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">Connected Devices</h1>
          <p className="text-xs text-gray-400">
            Real-time biometric data sync from wearable sensors and clinical scales.
          </p>
        </div>

        <button
          onClick={() => showNotification("Scanning for nearby BLE 5.3 devices...")}
          className="px-4 py-2.5 rounded-xl bg-[#00F0FF] text-black text-xs font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:bg-[#00F0FF]/90 flex items-center gap-1.5 transition-all"
        >
          <Bluetooth className="w-4 h-4" />
          <span>Pair New Sensor</span>
        </button>
      </div>

      {/* Live ECG Telemetry Stream Banner */}
      <div className="glass-panel-glow p-6 rounded-3xl border border-[#00F0FF]/30 space-y-3 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-xs font-mono font-bold text-white uppercase">LIVE OPTICAL HEART RATE FEED</span>
          </div>
          <span className="text-xs font-mono text-[#00F0FF]">SAMPLING AT 100 HZ</span>
        </div>

        <div className="flex items-baseline gap-3">
          <span className="text-4xl sm:text-5xl font-black font-mono text-white">
            {dailyStats.currentHeartRateBpm}
          </span>
          <span className="text-xs font-mono text-gray-400">BEATS PER MINUTE (NORMAL SINUS)</span>
        </div>

        {/* Pulse ECG wave animation */}
        <div className="h-16 w-full flex items-center justify-between gap-1 overflow-hidden px-2 py-3 bg-black/40 rounded-2xl border border-white/5">
          {Array.from({ length: 32 }).map((_, i) => {
            const isPeak = i % 8 === 4;
            const height = isPeak ? "h-10 bg-[#FF385C]" : "h-2 bg-[#00F0FF]/40";
            return (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-300 ${height}`}
              />
            );
          })}
        </div>
      </div>

      {/* Devices List */}
      <div className="space-y-3">
        <span className="text-xs font-mono uppercase text-gray-400">PAIRED HARDWARE ({devices.length})</span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {devices.map((device) => (
            <div
              key={device.id}
              className={`p-5 rounded-3xl transition-all ${
                device.connected
                  ? "glass-panel-glow border-[#00F0FF]/30 bg-[#101320]"
                  : "glass-panel border-white/[0.08] opacity-75"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-center text-[#00F0FF]">
                    <Watch className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{device.name}</h3>
                    <span className="text-xs text-gray-400 font-mono">{device.brand} • {device.lastSync}</span>
                  </div>
                </div>

                <button
                  onClick={() => toggleDevice(device.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                    device.connected
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : "bg-white/10 text-gray-400 hover:text-white"
                  }`}
                >
                  {device.connected ? "Connected" : "Connect"}
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-1.5 text-gray-300">
                  <Battery className="w-4 h-4 text-emerald-400" />
                  <span>{device.batteryLevel}% Battery</span>
                </div>

                <span className="text-gray-400">
                  Signal: {device.connected ? "Strong (-54 dBm)" : "Offline"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
