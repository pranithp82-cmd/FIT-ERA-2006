"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  User,
  Camera,
  Shield,
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  Edit3,
  X,
  Lock,
  CheckCircle2,
  RefreshCw,
  HeartPulse,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const {
    user,
    updateUserProfile,
    updateProfilePhoto,
    monitorCredentials,
    updateMonitorPin,
    toggleMonitorSync,
    showNotification,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Password & PIN visibility
  const [showPin, setShowPin] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPin, setCopiedPin] = useState(false);

  // Edit Personal Info Modal
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: user.name || "Alex Morgan",
    age: user.age || 28,
    heightCm: user.heightCm || 182,
    weightKg: user.weightKg || 78.4,
    gender: user.gender || "Male",
    bloodType: user.bloodType || "O+ Positive",
    primaryGoal: user.primaryGoal || "Hypertrophy & Longevity",
  });

  // Change Monitor PIN Modal
  const [isChangePinModalOpen, setIsChangePinModalOpen] = useState(false);
  const [newPinValue, setNewPinValue] = useState("");
  const [confirmPinValue, setConfirmPinValue] = useState("");
  const [pinError, setPinError] = useState("");

  // Sync state when user in context updates
  useEffect(() => {
    setEditFormData({
      name: user.name || "Alex Morgan",
      age: user.age || 28,
      heightCm: user.heightCm || 182,
      weightKg: user.weightKg || 78.4,
      gender: user.gender || "Male",
      bloodType: user.bloodType || "O+ Positive",
      primaryGoal: user.primaryGoal || "Hypertrophy & Longevity",
    });
  }, [user]);

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showNotification("❌ Please select a valid image file (JPG, PNG, WEBP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        updateProfilePhoto(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Copy helpers
  const handleCopyId = () => {
    navigator.clipboard.writeText(monitorCredentials.monitorId);
    setCopiedId(true);
    showNotification("📋 Monitor ID copied to clipboard!");
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyPin = () => {
    navigator.clipboard.writeText(monitorCredentials.accessPin);
    setCopiedPin(true);
    showNotification("🔑 Access PIN copied to clipboard!");
    setTimeout(() => setCopiedPin(false), 2000);
  };

  // Save Personal Info
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: editFormData.name,
      age: Number(editFormData.age) || 28,
      heightCm: Number(editFormData.heightCm) || 182,
      weightKg: Number(editFormData.weightKg) || 78.4,
      gender: editFormData.gender,
      bloodType: editFormData.bloodType,
      primaryGoal: editFormData.primaryGoal,
    });
    setIsEditProfileModalOpen(false);
  };

  // Save New Monitor PIN
  const handleSaveNewPin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError("");

    if (!newPinValue || newPinValue.length < 4) {
      setPinError("PIN / Password must be at least 4 characters.");
      return;
    }

    if (newPinValue !== confirmPinValue) {
      setPinError("PINs do not match. Please re-enter.");
      return;
    }

    updateMonitorPin(newPinValue);
    setIsChangePinModalOpen(false);
    setNewPinValue("");
    setConfirmPinValue("");
  };

  return (
    <div className="bg-background text-on-surface font-body-md antialiased min-h-screen pb-28 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto space-y-6 pt-6">
      {/* Hidden Photo Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handlePhotoUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Top Breadcrumb & Page Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="p-2 rounded-xl bg-surface border border-outline hover:bg-surface-container transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-on-surface" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-on-surface">
              Profile & Access Portal
            </h1>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PROFILE BANNER / AVATAR CARD                                              */}
      {/* ========================================================================= */}
      <section className="bg-surface rounded-2xl border border-outline p-6 flex flex-col md:flex-row items-center gap-6 shadow-sm">
        {/* Avatar with Camera Overlay Trigger */}
        <div className="relative group shrink-0">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-primary-container p-1 shadow-md bg-surface">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-primary-container flex items-center justify-center">
                <User className="w-12 h-12 text-primary-fixed" />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-1 right-1 p-2.5 rounded-full bg-primary-fixed text-white shadow-lg hover:bg-primary-fixed/90 transition-all cursor-pointer ring-4 ring-surface"
            title="Upload / Change Profile Photo"
          >
            <Camera className="w-4 h-4" />
          </button>
        </div>

        {/* User Info & Quick Actions */}
        <div className="text-center md:text-left flex-1">
          <h2 className="text-2xl sm:text-3xl font-bold text-on-surface mb-1">
            {user.name}
          </h2>

          <div className="mt-4 flex flex-wrap gap-2.5 justify-center md:justify-start">
            <button
              type="button"
              onClick={() => setIsEditProfileModalOpen(true)}
              className="bg-primary-fixed text-white px-5 py-2 rounded-xl text-xs font-bold hover:opacity-90 transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Personal Details</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-surface border border-outline text-on-surface hover:bg-surface-container px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-primary-fixed" />
              <span>Change Photo</span>
            </button>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* BENTO GRID: PERSONAL METRICS & MONITOR ACCESS PORTAL                      */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* PERSONAL DETAILS (8 COLS) */}
        <section className="md:col-span-6 lg:col-span-7 bg-surface rounded-2xl border border-outline p-6 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-outline pb-3">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary-fixed" />
              <h3 className="text-lg font-bold text-on-surface">Personal Information</h3>
            </div>
            <button
              type="button"
              onClick={() => setIsEditProfileModalOpen(true)}
              className="text-xs font-bold text-primary-fixed hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-3.5 rounded-xl bg-surface-container/60 border border-outline flex flex-col gap-1">
              <span className="text-xs text-on-surface-variant font-mono uppercase">Full Name</span>
              <span className="text-sm font-bold text-on-surface">{user.name}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container/60 border border-outline flex flex-col gap-1">
              <span className="text-xs text-on-surface-variant font-mono uppercase">Age</span>
              <span className="text-sm font-bold text-on-surface">{user.age || 28} years</span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container/60 border border-outline flex flex-col gap-1">
              <span className="text-xs text-on-surface-variant font-mono uppercase">Height</span>
              <span className="text-sm font-bold text-on-surface">{user.heightCm} cm</span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container/60 border border-outline flex flex-col gap-1">
              <span className="text-xs text-on-surface-variant font-mono uppercase">Body Weight</span>
              <span className="text-sm font-bold text-on-surface">{user.weightKg} kg</span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container/60 border border-outline flex flex-col gap-1">
              <span className="text-xs text-on-surface-variant font-mono uppercase">Biological Sex</span>
              <span className="text-sm font-bold text-on-surface">{user.gender || "Male"}</span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container/60 border border-outline flex flex-col gap-1">
              <span className="text-xs text-on-surface-variant font-mono uppercase">Blood Group</span>
              <span className="text-sm font-bold text-primary-fixed">{user.bloodType || "O+ Positive"}</span>
            </div>
          </div>
        </section>

        {/* MONITOR / DOCTOR / PARENT ACCESS CREDENTIALS (5 COLS) */}
        <section className="md:col-span-6 lg:col-span-5 bg-surface rounded-2xl border border-outline p-6 flex flex-col gap-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-outline pb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary-fixed" />
              <div>
                <h3 className="text-lg font-bold text-on-surface">Monitor Access Portal</h3>
                <span className="text-[11px] text-on-surface-variant">Coach • Doctor • Parent Sync</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={monitorCredentials.trainerSync}
                onChange={toggleMonitorSync}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-outline peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-fixed" />
            </label>
          </div>

          <p className="text-xs text-on-surface-variant leading-relaxed">
            Share these credentials with your <strong>Coach Akash</strong> or doctor. They can enter this <strong>Monitor Access ID</strong> and <strong>Access PIN</strong> on the main Login page to access the Monitor Portal and align your nutrition and workout plans.
          </p>

          {/* ID & Password Card */}
          <div className="bg-surface-container/70 border border-outline rounded-xl p-4 space-y-3">
            {/* Monitor ID */}
            <div>
              <label className="text-[11px] font-mono font-bold text-on-surface-variant uppercase block mb-1">
                Monitor Access ID
              </label>
              <div className="flex items-center justify-between bg-surface border border-outline rounded-xl px-3 py-2">
                <span className="font-mono text-sm font-black text-primary-fixed tracking-wider">
                  {monitorCredentials.monitorId}
                </span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                  title="Copy ID"
                >
                  {copiedId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Monitor PIN / Password */}
            <div>
              <label className="text-[11px] font-mono font-bold text-on-surface-variant uppercase block mb-1">
                Access PIN / Password
              </label>
              <div className="flex items-center justify-between bg-surface border border-outline rounded-xl px-3 py-2">
                <span className="font-mono text-sm font-bold text-on-surface tracking-widest">
                  {showPin ? monitorCredentials.accessPin : "••••••••"}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                    title={showPin ? "Hide Password" : "Show Password"}
                  >
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyPin}
                    className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                    title="Copy PIN"
                  >
                    {copiedPin ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Change PIN Trigger Button */}
            <button
              type="button"
              onClick={() => {
                setPinError("");
                setNewPinValue("");
                setConfirmPinValue("");
                setIsChangePinModalOpen(true);
              }}
              className="flex-1 py-2.5 rounded-xl bg-surface border border-outline hover:bg-surface-container text-xs font-bold text-on-surface flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Key className="w-3.5 h-3.5 text-primary-fixed" />
              <span>Change PIN</span>
            </button>

            {/* Direct Open Monitor Portal */}
            <Link
              href="/monitor"
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all text-center"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Open Monitor Portal</span>
            </Link>
          </div>

          {/* Active Authorized Monitors */}
          <div className="pt-2 border-t border-outline flex flex-col gap-2">
            <span className="text-[11px] font-mono uppercase font-bold text-on-surface-variant">
              Authorized Monitor Roles:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-semibold">
                🏋️‍♂️ Coach Access
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                🩺 Doctor / Physician
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-semibold">
                👨‍👩‍👦 Parents (Father/Mother)
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* ========================================================================= */}
      {/* EDIT PERSONAL INFO MODAL                                                  */}
      {/* ========================================================================= */}
      {isEditProfileModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-outline shadow-2xl max-w-lg w-full p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-outline pb-3">
              <h3 className="font-bold text-lg text-on-surface">Edit Personal Information</h3>
              <button
                type="button"
                onClick={() => setIsEditProfileModalOpen(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-mono font-bold text-on-surface-variant uppercase block mb-1">
                    Athlete Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-outline text-sm text-on-surface focus:border-primary-fixed outline-none shadow-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-on-surface-variant uppercase block mb-1">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    required
                    min={10}
                    max={100}
                    value={editFormData.age}
                    onChange={(e) => setEditFormData({ ...editFormData, age: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-outline text-sm text-on-surface focus:border-primary-fixed outline-none shadow-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-on-surface-variant uppercase block mb-1">
                    Gender
                  </label>
                  <select
                    value={editFormData.gender}
                    onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-outline text-sm text-on-surface focus:border-primary-fixed outline-none shadow-sm"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-on-surface-variant uppercase block mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    required
                    min={100}
                    max={250}
                    value={editFormData.heightCm}
                    onChange={(e) => setEditFormData({ ...editFormData, heightCm: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-outline text-sm text-on-surface focus:border-primary-fixed outline-none shadow-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono font-bold text-on-surface-variant uppercase block mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    min={30}
                    max={250}
                    value={editFormData.weightKg}
                    onChange={(e) => setEditFormData({ ...editFormData, weightKg: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-outline text-sm text-on-surface focus:border-primary-fixed outline-none shadow-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-mono font-bold text-on-surface-variant uppercase block mb-1">
                    Blood Group
                  </label>
                  <input
                    type="text"
                    value={editFormData.bloodType}
                    onChange={(e) => setEditFormData({ ...editFormData, bloodType: e.target.value })}
                    placeholder="e.g. O+ Positive, A+, B+"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-outline text-sm text-on-surface focus:border-primary-fixed outline-none shadow-sm"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-outline">
                <button
                  type="button"
                  onClick={() => setIsEditProfileModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary-fixed text-white font-bold text-xs hover:bg-primary-fixed/90 shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CHANGE MONITOR PIN MODAL                                                  */}
      {/* ========================================================================= */}
      {isChangePinModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-outline shadow-2xl max-w-sm w-full p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-outline pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-primary-fixed" />
                <h3 className="font-bold text-base text-on-surface">Update Monitor PIN</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsChangePinModalOpen(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-on-surface-variant">
              Enter a new PIN or password to secure your coach, doctor, and parent monitoring credentials.
            </p>

            <form onSubmit={handleSaveNewPin} className="space-y-3">
              <div>
                <label className="text-xs font-mono font-bold text-on-surface-variant uppercase block mb-1">
                  New PIN / Password
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ERA#2026"
                  value={newPinValue}
                  onChange={(e) => setNewPinValue(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-outline text-sm text-on-surface focus:border-primary-fixed outline-none shadow-sm"
                />
              </div>

              <div>
                <label className="text-xs font-mono font-bold text-on-surface-variant uppercase block mb-1">
                  Confirm New PIN
                </label>
                <input
                  type="text"
                  required
                  placeholder="Re-enter new PIN"
                  value={confirmPinValue}
                  onChange={(e) => setConfirmPinValue(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-outline text-sm text-on-surface focus:border-primary-fixed outline-none shadow-sm"
                />
              </div>

              {pinError && (
                <p className="text-xs text-red-600 font-semibold">{pinError}</p>
              )}

              <div className="flex gap-2 justify-end pt-3 border-t border-outline">
                <button
                  type="button"
                  onClick={() => setIsChangePinModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-primary-fixed text-white font-bold text-xs hover:bg-primary-fixed/90 shadow-sm"
                >
                  Update PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
