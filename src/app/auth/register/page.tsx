"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import logo from "@/assets/logo-transparent.png";
import {
  User,
  Mail,
  Lock,
  Phone,
  ArrowRight,
  Sparkles,
  Camera,
  Activity,
  Heart,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";

export default function UserRegisterPage() {
  const router = useRouter();
  const { registerUser } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    avatar: "",
    age: "28",
    gender: "Male",
    heightCm: "180",
    weightKg: "78",
    goal: "Hypertrophy & Longevity",
    bloodType: "O+ Positive",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const res = await registerUser(formData);
    if (!res.success) {
      setErrorMsg(res.error || "Registration failed");
      setLoading(false);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col justify-center items-center px-4 sm:px-6 py-12 relative overflow-hidden">
      {/* Background Subtle Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-fixed/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl w-full flex flex-col gap-6 z-10">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/auth/login"
            className="p-2 rounded-xl bg-surface border border-outline hover:bg-surface-container text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Login</span>
          </Link>
          <span className="text-xs font-mono uppercase font-bold text-primary-fixed">
            ATHLETE ONBOARDING
          </span>
        </div>

        <div className="bg-surface rounded-3xl border border-outline p-6 sm:p-8 shadow-xl flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-black text-on-surface">
              Create Athlete Profile
            </h1>
            <p className="text-xs text-on-surface-variant">
              Enter your clinical metrics, goals, and credentials to establish your personalized health and training profile.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Personal Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="sm:col-span-2">
                <label className="text-xs font-mono font-bold text-on-surface-variant uppercase block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Alex Mercer"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container/50 border border-outline text-sm text-on-surface focus:border-primary-fixed outline-none shadow-sm"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-on-surface-variant uppercase block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="alex.mercer@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container/50 border border-outline text-sm text-on-surface focus:border-primary-fixed outline-none shadow-sm"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-on-surface-variant uppercase block mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 019-2834"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container/50 border border-outline text-sm text-on-surface focus:border-primary-fixed outline-none shadow-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-xs font-mono font-bold text-on-surface-variant uppercase block mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Create a strong password"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container/50 border border-outline text-sm text-on-surface focus:border-primary-fixed outline-none shadow-sm"
                />
              </div>
            </div>

            {/* Physiological & Athletic Metrics */}
            <div className="pt-3 border-t border-outline">
              <span className="text-xs font-mono uppercase font-bold text-primary-fixed block mb-3">
                Biometric & Training Baseline:
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-[11px] font-mono font-bold text-on-surface-variant uppercase block mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    required
                    min={12}
                    max={100}
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container/50 border border-outline text-xs text-on-surface focus:border-primary-fixed outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono font-bold text-on-surface-variant uppercase block mb-1">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container/50 border border-outline text-xs text-on-surface focus:border-primary-fixed outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-mono font-bold text-on-surface-variant uppercase block mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    required
                    min={100}
                    max={250}
                    value={formData.heightCm}
                    onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container/50 border border-outline text-xs text-on-surface focus:border-primary-fixed outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono font-bold text-on-surface-variant uppercase block mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    min={30}
                    max={250}
                    value={formData.weightKg}
                    onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-surface-container/50 border border-outline text-xs text-on-surface focus:border-primary-fixed outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="text-[11px] font-mono font-bold text-on-surface-variant uppercase block mb-1">
                    Blood Group
                  </label>
                  <input
                    type="text"
                    value={formData.bloodType}
                    onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                    placeholder="e.g. O+ Positive, A+"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container/50 border border-outline text-xs text-on-surface focus:border-primary-fixed outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-mono font-bold text-on-surface-variant uppercase block mb-1">
                    Primary Athletic Goal
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.goal}
                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                    placeholder="e.g. Hypertrophy & Longevity, Fat Loss"
                    className="w-full px-3 py-2 rounded-xl bg-surface-container/50 border border-outline text-xs text-on-surface focus:border-primary-fixed outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-primary-fixed text-white font-bold text-sm shadow-md hover:bg-primary-fixed/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer mt-4"
            >
              {loading ? (
                <span>Creating Profile...</span>
              ) : (
                <>
                  <span>Complete Athlete Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-outline text-center text-xs text-on-surface-variant">
            <span>Already registered? </span>
            <Link href="/auth/login" className="text-primary-fixed font-bold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
