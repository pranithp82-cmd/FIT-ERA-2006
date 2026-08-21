"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import logo from "@/assets/logo-transparent.png";
import {
  User,
  Shield,
  Dumbbell,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Zap,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const result = await login(identifier, password);

    if (!result.success) {
      setErrorMsg(result.error || "Authentication failed. Please check your credentials.");
      setLoading(false);
    } else {
      router.push(result.redirectUrl || "/");
    }
  };

  const handleQuickLogin = async (demoId: string, demoPass: string) => {
    setIdentifier(demoId);
    setPassword(demoPass);
    setLoading(true);
    setErrorMsg("");

    const result = await login(demoId, demoPass);
    if (!result.success) {
      setErrorMsg(result.error || "Quick login failed");
      setLoading(false);
    } else {
      router.push(result.redirectUrl || "/");
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col justify-center items-center px-4 sm:px-6 py-12 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-fixed/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full flex flex-col gap-6 z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="p-2.5 rounded-2xl bg-surface border border-outline shadow-md mb-1">
            <Image
              src={logo}
              alt="FIT ERA Logo"
              width={52}
              height={52}
              style={{ objectFit: "contain" }}
            />
          </div>
          <span className="text-xs font-mono uppercase font-bold tracking-widest text-primary-fixed">
            FIT ERA HEALTHCARE PLATFORM
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-on-surface">
            Platform Login
          </h1>
          <p className="text-xs text-on-surface-variant max-w-sm">
            Sign in with your Athlete Email or Coach Monitor ID &amp; Access PIN.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-surface rounded-3xl border border-outline p-6 sm:p-8 shadow-xl flex flex-col gap-5">
          {/* Error Alert */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-mono font-bold text-on-surface-variant uppercase block mb-1.5">
                Email or Athlete Monitor ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. pranithp82@gmail.com or ERA-MON-8942"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container/50 border border-outline text-sm text-on-surface focus:border-primary-fixed outline-none shadow-sm transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-mono font-bold text-on-surface-variant uppercase">
                  Password or Access PIN
                </label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-on-surface-variant absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password or Monitor PIN (e.g. ERA#9284)"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-surface-container/50 border border-outline text-sm text-on-surface focus:border-primary-fixed outline-none shadow-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-primary-fixed text-white font-bold text-sm shadow-md hover:bg-primary-fixed/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {loading ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="pt-3 border-t border-outline flex flex-col gap-2">
            <span className="text-[11px] font-mono font-bold uppercase text-on-surface-variant text-center">
              ⚡ 1-Click Fast Login:
            </span>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin("pranithp82@gmail.com", "User@123")}
                className="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline text-xs font-semibold text-on-surface flex items-center justify-between transition-colors cursor-pointer text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-600 flex items-center justify-center font-bold">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold block">Pranith A</span>
                    <span className="text-[10px] text-on-surface-variant">Personal Health Dashboard</span>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-primary-fixed font-bold">User@123 →</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin("ERA-MON-8942", "ERA#9284")}
                className="p-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline text-xs font-semibold text-on-surface flex items-center justify-between transition-colors cursor-pointer text-left group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 flex items-center justify-center font-bold">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold block">Coach Akash</span>
                    <span className="text-[10px] text-on-surface-variant">Monitor Portal (ID: ERA-MON-8942)</span>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-emerald-600 font-bold">ERA#9284 →</span>
              </button>
            </div>
          </div>

          {/* Registration Links */}
          <div className="pt-2 border-t border-outline flex items-center justify-between text-xs text-on-surface-variant">
            <span>New user?</span>
            <Link href="/auth/register" className="font-bold text-primary-fixed hover:underline">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
