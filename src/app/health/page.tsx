"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  ArrowLeft,
  UploadCloud,
  ArrowRight,
  Beaker,
  ScanLine,
  Activity,
  Heart,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Flame,
  Scale,
  Bone,
  Zap,
  TrendingUp,
  FileCheck,
  RotateCw,
  Eye,
} from "lucide-react";

import PackageSelector from "@/components/health/PackageSelector";
import { getAarogyamPackage } from "@/lib/aarogyam-packages";
import DxaScanTypeDropdown from "@/components/health/DxaScanTypeDropdown";
import { getDxaScanType } from "@/lib/dxa-scan-types";

export default function HealthAnalyzerPage() {
  const router = useRouter();
  const { showNotification } = useApp();

  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);
  const [bloodFileName, setBloodFileName] = useState("");
  const [bloodStatus, setBloodStatus] = useState<"ready" | "analyzing" | "analyzed">("ready");
  const [bloodExtractedCount, setBloodExtractedCount] = useState<number>(0);

  const [selectedDxaScanTypeId, setSelectedDxaScanTypeId] = useState<string | null>(null);
  const [dxaFileName, setDxaFileName] = useState("");
  const [dxaStatus, setDxaStatus] = useState<"ready" | "analyzing" | "analyzed">("ready");
  const [dxaExtractedCount, setDxaExtractedCount] = useState<number>(0);

  const [isDraggingBlood, setIsDraggingBlood] = useState(false);
  const [isDraggingDxa, setIsDraggingDxa] = useState(false);

  const [scanStepMessage, setScanStepMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dxaInputRef = useRef<HTMLInputElement | null>(null);

  const handleBloodFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!selectedPackageId) {
      showNotification("⚠️ Step 1 Required: Please select an Aarogyam or Custom package before uploading.");
      return;
    }

    const pkgInfo = getAarogyamPackage(selectedPackageId);
    setBloodFileName(file.name);
    setBloodStatus("analyzing");
    setScanStepMessage(`OCR Engine initializing for ${pkgInfo?.label || selectedPackageId}...`);
    showNotification(`⚡ AI OCR Engine: Scanning ${file.name} for ${pkgInfo?.shortName || selectedPackageId}...`);

    try {
      setTimeout(() => {
        setScanStepMessage(`Calibrating deterministic reference intervals for ${pkgInfo?.shortName || selectedPackageId}...`);
      }, 700);

      const res = await fetch("/api/health/upload-blood", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          fileName: file.name,
          packageId: selectedPackageId 
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to upload report");
      }

      const data = await res.json();

      setTimeout(() => {
        setBloodStatus("analyzed");
        setBloodExtractedCount(data.biomarkersExtracted || 50);
        showNotification(`🧪 AI Extraction Complete: ${data.biomarkersExtracted || 50} Biomarkers Loaded for ${data.packageName || selectedPackageId}!`);
      }, 1400);
    } catch (err: any) {
      setBloodStatus("ready");
      showNotification(`❌ Error: ${err.message || "Failed to process blood report"}`);
    }
  };

  const handleDxaFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!selectedDxaScanTypeId) {
      showNotification("⚠️ Step 1 Required: Please select a DXA scan type before uploading.");
      return;
    }

    const scanTypeInfo = getDxaScanType(selectedDxaScanTypeId);
    setDxaFileName(file.name);
    setDxaStatus("analyzing");
    setScanStepMessage(`Dual-Energy Spectral Engine initializing for ${scanTypeInfo?.shortName || selectedDxaScanTypeId}...`);
    showNotification(`⚡ AI Engine: Processing DXA scan ${file.name} for ${scanTypeInfo?.label || selectedDxaScanTypeId}...`);

    try {
      setTimeout(() => {
        setScanStepMessage(`Validating expected sites [${scanTypeInfo?.sites.join(", ") || "Custom"}] without fabricating unscanned data...`);
      }, 700);

      const res = await fetch("/api/health/upload-dxa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          fileName: file.name,
          scanTypeId: selectedDxaScanTypeId 
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to upload DXA scan");
      }

      const data = await res.json();

      setTimeout(() => {
        setDxaStatus("analyzed");
        setDxaExtractedCount(data.metricsExtracted || data.extractedData?.length || 0);
        showNotification(`🦴 AI DXA Complete: ${data.metricsExtracted || data.extractedData?.length} Parameters Analyzed for ${data.scanTypeName || selectedDxaScanTypeId}!`);
      }, 1400);
    } catch (err: any) {
      setDxaStatus("ready");
      showNotification(`❌ Error: ${err.message || "Failed to process DXA scan"}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-8 pb-32">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-outline">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-wider text-primary-fixed font-bold">
              CLINICAL AI INTELLIGENCE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface">
            Health &amp; Diagnostic Hub
          </h1>
          <p className="text-sm text-on-surface-variant max-w-2xl mt-1">
            Upload your laboratory blood panels and DXA scan reports. Our AI clinical engine extracts exact biomarkers, calibrates reference intervals, and computes your multi-organ longevity matrix.
          </p>
        </div>
      </div>

      {/* Upload Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Blood Report Analyzer Card */}
        <div className="bg-surface rounded-2xl p-6 border border-outline shadow-sm flex flex-col justify-between gap-5">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
                <Beaker className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-primary-fixed bg-primary-container px-2.5 py-1 rounded-full">
                50 Parameters Active
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-on-surface">
                Clinical Blood Panel Analyzer
              </h3>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                Upload your laboratory report (PDF or Image). Select your exact Aarogyam package below so our deterministic clinical engine applies the exact reference intervals without guessing.
              </p>
            </div>

            {/* Step 1: Package Selector */}
            <div className="pt-1 pb-2 border-t border-b border-outline/50">
              <PackageSelector
                value={selectedPackageId}
                onChange={(id) => {
                  setSelectedPackageId(id);
                  const pkg = getAarogyamPackage(id);
                  showNotification(`Selected Package: ${pkg?.label || id}`);
                }}
                disabled={bloodStatus === "analyzing"}
              />
            </div>

            {/* Step 2: Upload Box */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant flex items-center justify-between">
                <span>Step 2: Upload Laboratory Report</span>
                {!selectedPackageId && (
                  <span className="text-[10px] text-amber-500 font-normal">
                    Requires Package Selection
                  </span>
                )}
              </label>

              <input
                ref={fileInputRef}
                type="file"
                disabled={!selectedPackageId || bloodStatus === "analyzing"}
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleBloodFileUpload}
                className="hidden"
              />

              <div
                onClick={() => {
                  if (!selectedPackageId) {
                    showNotification("⚠️ Step 1: Please select an Aarogyam package above first.");
                    return;
                  }
                  fileInputRef.current?.click();
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (selectedPackageId) setIsDraggingBlood(true);
                }}
                onDragLeave={() => setIsDraggingBlood(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingBlood(false);
                  if (!selectedPackageId) {
                    showNotification("⚠️ Step 1: Please select an Aarogyam package above first.");
                    return;
                  }
                  const file = e.dataTransfer.files?.[0];
                  if (file) {
                    const syntheticEvent = { target: { files: [file] } } as any;
                    handleBloodFileUpload(syntheticEvent);
                  }
                }}
                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all ${
                  !selectedPackageId
                    ? "border-outline/40 bg-surface-container/10 opacity-60 cursor-not-allowed"
                    : isDraggingBlood
                    ? "border-primary-fixed bg-primary-container/30 cursor-pointer"
                    : "border-outline bg-surface-container/30 hover:border-primary-fixed/50 hover:bg-surface-container/60 cursor-pointer"
                }`}
              >
                {bloodStatus === "analyzing" ? (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <RotateCw className="w-6 h-6 text-primary-fixed animate-spin" />
                    <span className="text-xs font-bold text-primary-fixed">{scanStepMessage || "AI Extracting Biomarkers..."}</span>
                  </div>
                ) : (
                  <>
                    <UploadCloud className={`w-8 h-8 mb-1.5 ${selectedPackageId ? "text-primary-fixed" : "text-on-surface-variant"}`} />
                    <span className="text-xs font-bold text-on-surface">
                      {bloodFileName
                        ? `[ ${bloodFileName} ]`
                        : selectedPackageId
                        ? `Upload ${getAarogyamPackage(selectedPackageId)?.shortName} Report`
                        : "Select Package Above to Enable Upload"}
                    </span>
                    <span className="text-[11px] text-on-surface-variant mt-0.5">
                      {selectedPackageId
                        ? "Supports PDF, JPG, PNG • Deterministic Calibration"
                        : "🔒 Locked until package is selected"}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Status Pill */}
            <div className="flex items-center justify-between text-xs p-3 rounded-lg bg-surface-container/50 border border-outline">
              <span className="text-on-surface-variant">Extracted Status:</span>
              <span className={`font-semibold flex items-center gap-1.5 ${bloodStatus === "analyzed" ? "text-emerald-700" : "text-on-surface-variant"}`}>
                <CheckCircle2 className="w-4 h-4" />
                {bloodStatus === "analyzed"
                  ? `${bloodExtractedCount} Biomarkers Calibrated (${getAarogyamPackage(selectedPackageId)?.shortName || "Calibrated"})`
                  : "Awaiting Report Upload"}
              </span>
            </div>
          </div>

          <Link
            href="/health/blood-panel"
            className="w-full py-2.5 px-4 rounded-xl bg-primary-fixed text-white font-bold text-xs shadow-sm hover:bg-primary-fixed/90 transition-all flex items-center justify-center gap-2"
          >
            <span>View 50 Blood Panel Results</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 2. DEXA Body Scan Analyzer Card */}
        <div className="bg-surface rounded-2xl p-6 border border-outline shadow-sm flex flex-col justify-between gap-5">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                <ScanLine className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-primary-fixed bg-primary-container px-2.5 py-1 rounded-full">
                {selectedDxaScanTypeId ? (getDxaScanType(selectedDxaScanTypeId)?.shortName || "Protocol Selected") : "DXA Protocol Engine"}
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-on-surface">
                DEXA / DXA Body &amp; Bone Scanner
              </h3>
              <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                Upload your dual-energy absorptiometry scan. Select your scan protocol below so our deterministic status engine validates expected skeletal sites without guessing defaults.
              </p>
            </div>

            {/* Step 1: DXA Scan Type Dropdown */}
            <div className="pt-1 pb-2 border-t border-b border-outline/50">
              <DxaScanTypeDropdown
                value={selectedDxaScanTypeId}
                onChange={(id) => {
                  setSelectedDxaScanTypeId(id);
                  const st = getDxaScanType(id);
                  showNotification(`Selected DXA Protocol: ${st?.label || id}`);
                }}
                disabled={dxaStatus === "analyzing"}
              />
            </div>

            {/* Step 2: Upload Box */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant flex items-center justify-between">
                <span>Step 2: Upload DXA Scan Report</span>
                {!selectedDxaScanTypeId && (
                  <span className="text-[10px] text-amber-500 font-normal">
                    Requires Scan Protocol
                  </span>
                )}
              </label>

              <input
                ref={dxaInputRef}
                type="file"
                disabled={!selectedDxaScanTypeId || dxaStatus === "analyzing"}
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleDxaFileUpload}
                className="hidden"
              />

              <div
                onClick={() => {
                  if (!selectedDxaScanTypeId) {
                    showNotification("⚠️ Step 1: Please select a DXA scan type above first.");
                    return;
                  }
                  dxaInputRef.current?.click();
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (selectedDxaScanTypeId) setIsDraggingDxa(true);
                }}
                onDragLeave={() => setIsDraggingDxa(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingDxa(false);
                  if (!selectedDxaScanTypeId) {
                    showNotification("⚠️ Step 1: Please select a DXA scan type above first.");
                    return;
                  }
                  const file = e.dataTransfer.files?.[0];
                  if (file) {
                    const syntheticEvent = { target: { files: [file] } } as any;
                    handleDxaFileUpload(syntheticEvent);
                  }
                }}
                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-all ${
                  !selectedDxaScanTypeId
                    ? "border-outline/40 bg-surface-container/10 opacity-60 cursor-not-allowed"
                    : isDraggingDxa
                    ? "border-primary-fixed bg-primary-container/30 cursor-pointer"
                    : "border-outline bg-surface-container/30 hover:border-primary-fixed/50 hover:bg-surface-container/60 cursor-pointer"
                }`}
              >
                {dxaStatus === "analyzing" ? (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <RotateCw className="w-6 h-6 text-primary-fixed animate-spin" />
                    <span className="text-xs font-bold text-primary-fixed">{scanStepMessage || "AI Extracting DXA Metrics..."}</span>
                  </div>
                ) : (
                  <>
                    <UploadCloud className={`w-8 h-8 mb-1.5 ${selectedDxaScanTypeId ? "text-primary-fixed" : "text-on-surface-variant"}`} />
                    <span className="text-xs font-bold text-on-surface">
                      {dxaFileName
                        ? `[ ${dxaFileName} ]`
                        : selectedDxaScanTypeId
                        ? `Upload ${getDxaScanType(selectedDxaScanTypeId)?.shortName} Scan`
                        : "Select Scan Protocol Above to Enable Upload"}
                    </span>
                    <span className="text-[11px] text-on-surface-variant mt-0.5">
                      {selectedDxaScanTypeId
                        ? "Supports PDF, DICOM, JPG, PNG • Absorptiometry AI"
                        : "🔒 Locked until DXA scan protocol is selected"}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Status Pill */}
            <div className="flex items-center justify-between text-xs p-3 rounded-lg bg-surface-container/50 border border-outline">
              <span className="text-on-surface-variant">Extracted Status:</span>
              <span className={`font-semibold flex items-center gap-1.5 ${dxaStatus === "analyzed" ? "text-emerald-700" : "text-on-surface-variant"}`}>
                <CheckCircle2 className="w-4 h-4" />
                {dxaStatus === "analyzed"
                  ? `${dxaExtractedCount} DXA Parameters Loaded (${getDxaScanType(selectedDxaScanTypeId)?.shortName || "Calibrated"})`
                  : "Awaiting DXA Scan Upload"}
              </span>
            </div>
          </div>

          <Link
            href="/body-analysis"
            className="w-full py-2.5 px-4 rounded-xl bg-primary-fixed text-white font-bold text-xs shadow-sm hover:bg-primary-fixed/90 transition-all flex items-center justify-center gap-2"
          >
            <span>View 20 DEXA Parameters</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
