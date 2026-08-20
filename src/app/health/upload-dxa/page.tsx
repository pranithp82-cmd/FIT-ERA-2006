"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import DxaScanTypeDropdown from "@/components/health/DxaScanTypeDropdown";
import { getDxaScanType } from "@/lib/dxa-scan-types";
import {
  ArrowLeft,
  UploadCloud,
  ArrowRight,
  ScanLine,
  CheckCircle2,
  RotateCw,
  ShieldCheck,
  Bone,
} from "lucide-react";

export default function UploadDxaReportPage() {
  const router = useRouter();
  const { showNotification, generateWeakMusclesFromDxa } = useApp();

  const [selectedScanTypeId, setSelectedScanTypeId] = useState<string | null>(null);
  const [dxaFileName, setDxaFileName] = useState("");
  const [dxaStatus, setDxaStatus] = useState<"ready" | "analyzing" | "analyzed">("ready");
  const [dxaExtractedCount, setDxaExtractedCount] = useState<number>(0);
  const [isDraggingDxa, setIsDraggingDxa] = useState(false);
  const [scanStepMessage, setScanStepMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleDxaFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!selectedScanTypeId) {
      showNotification("⚠️ Step 1 Required: Please select a DXA scan type before uploading.");
      return;
    }

    const scanTypeInfo = getDxaScanType(selectedScanTypeId);
    setDxaFileName(file.name);
    setDxaStatus("analyzing");
    setScanStepMessage(`Dual-Energy Spectral Engine initializing for ${scanTypeInfo?.shortName || selectedScanTypeId}...`);
    showNotification(`⚡ AI Engine: Processing DXA scan ${file.name} for ${scanTypeInfo?.label || selectedScanTypeId}...`);

    try {
      setTimeout(() => {
        setScanStepMessage(`Validating expected sites [${scanTypeInfo?.sites.join(", ") || "Custom"}] without fabricating unscanned data...`);
      }, 700);

      const res = await fetch("/api/health/upload-dxa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          fileName: file.name,
          scanTypeId: selectedScanTypeId 
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
        generateWeakMusclesFromDxa(data.extractedData);
        showNotification(`🦴 AI DXA Complete: ${data.metricsExtracted || data.extractedData?.length} Parameters Analyzed for ${data.scanTypeName || selectedScanTypeId}!`);
      }, 1400);
    } catch (err: any) {
      setDxaStatus("ready");
      showNotification(`❌ Error: ${err.message || "Failed to process DXA scan"}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 flex flex-col gap-6 pb-32">
      {/* Back Button & Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/health"
          className="p-2 rounded-xl bg-surface border border-outline hover:bg-surface-container-high transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-on-surface" />
        </Link>
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-primary-fixed font-bold">
            DUAL-ENERGY X-RAY ABSORPTIOMETRY
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface">
            Upload DXA Scan Report
          </h1>
        </div>
      </div>

      {/* Main Form Container */}
      <div className="bg-surface rounded-2xl p-6 sm:p-8 border border-outline shadow-sm flex flex-col gap-6">
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary-container/30 border border-primary-fixed/20 text-xs text-on-surface leading-relaxed">
          <ShieldCheck className="w-5 h-5 text-primary-fixed shrink-0 mt-0.5" />
          <div>
            <strong className="font-semibold block mb-0.5">Deterministic Status Engine (Never Guesses Values):</strong>
            DXA scans vary by scan type (Central vs Peripheral) and anatomical sites imaged. Explicit scan type selection ensures the engine expects and validates only relevant fields without fabricating unscanned sites.
          </div>
        </div>

        {/* Step 1: DXA Scan Type Dropdown */}
        <DxaScanTypeDropdown
          value={selectedScanTypeId}
          onChange={(id) => {
            setSelectedScanTypeId(id);
            const st = getDxaScanType(id);
            showNotification(`Selected Protocol: ${st?.label || id}`);
          }}
          disabled={dxaStatus === "analyzing"}
        />

        {/* Step 2: Upload Area */}
        <div className="flex flex-col gap-3 pt-4 border-t border-outline">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
              <Bone className="w-3.5 h-3.5 text-primary-fixed" />
              Step 2: Upload DXA Scan File (PDF, Image, DICOM) <span className="text-danger">*</span>
            </label>
            {!selectedScanTypeId && (
              <span className="text-[11px] font-mono text-amber-500 font-semibold">
                ⚠️ Select scan type in Step 1 first
              </span>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            disabled={!selectedScanTypeId || dxaStatus === "analyzing"}
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={handleDxaFileUpload}
            className="hidden"
          />

          <div
            onClick={() => {
              if (!selectedScanTypeId) {
                showNotification("⚠️ Step 1 Required: Select your DXA scan type above first.");
                return;
              }
              fileInputRef.current?.click();
            }}
            onDragOver={(e) => {
              e.preventDefault();
              if (selectedScanTypeId) setIsDraggingDxa(true);
            }}
            onDragLeave={() => setIsDraggingDxa(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingDxa(false);
              if (!selectedScanTypeId) {
                showNotification("⚠️ Step 1 Required: Select your DXA scan type above first.");
                return;
              }
              const file = e.dataTransfer.files?.[0];
              if (file) {
                const syntheticEvent = { target: { files: [file] } } as any;
                handleDxaFileUpload(syntheticEvent);
              }
            }}
            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all ${
              !selectedScanTypeId
                ? "border-outline/40 bg-surface-container/10 opacity-60 cursor-not-allowed"
                : isDraggingDxa
                ? "border-primary-fixed bg-primary-container/30 cursor-pointer"
                : "border-outline bg-surface-container/30 hover:border-primary-fixed/50 hover:bg-surface-container/60 cursor-pointer"
            }`}
          >
            {dxaStatus === "analyzing" ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <RotateCw className="w-8 h-8 text-primary-fixed animate-spin" />
                <span className="text-sm font-bold text-primary-fixed">{scanStepMessage || "AI Extracting DXA Metrics..."}</span>
                <span className="text-xs text-on-surface-variant">Validating deterministic anatomical sites...</span>
              </div>
            ) : (
              <>
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 ${
                  selectedScanTypeId ? "bg-primary-container text-primary-fixed" : "bg-surface-container text-on-surface-variant"
                }`}>
                  <UploadCloud className="w-8 h-8" />
                </div>
                <span className="text-sm font-bold text-on-surface">
                  {dxaFileName
                    ? `[ ${dxaFileName} ]`
                    : selectedScanTypeId
                    ? `Upload ${getDxaScanType(selectedScanTypeId)?.label} Scan`
                    : "Step 1: Select DXA Protocol Above to Enable Upload"}
                </span>
                <span className="text-xs text-on-surface-variant mt-1">
                  {selectedScanTypeId
                    ? "Supports PDF, JPG, PNG, DICOM • Deterministic Site Validation"
                    : "Upload is locked until a DXA scan type is explicitly selected."}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Status and Action Buttons */}
        {dxaStatus === "analyzed" && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <div className="flex items-center gap-2.5 text-emerald-700">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <div>
                <span className="font-bold text-sm block">DXA Report Extracted Successfully</span>
                <span className="text-xs text-emerald-600">
                  {dxaExtractedCount} parameters calibrated for {getDxaScanType(selectedScanTypeId)?.label || "Selected Protocol"}.
                </span>
              </div>
            </div>

            <Link
              href="/body-analysis"
              className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-primary-fixed text-white font-bold text-xs shadow-sm hover:bg-primary-fixed/90 transition-all flex items-center justify-center gap-2 shrink-0"
            >
              <span>View DXA Results</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
