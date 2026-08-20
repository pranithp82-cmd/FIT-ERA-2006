"use client";

import React, { useState, useRef, useEffect } from "react";
import { DXA_SCAN_TYPES, DxaScanType, getDxaScanType } from "@/lib/dxa-scan-types";
import {
  CheckCircle2,
  Bone,
  ChevronDown,
  Info,
  Scan,
  ShieldCheck,
} from "lucide-react";

interface DxaScanTypeDropdownProps {
  value: string | null;
  onChange: (scanTypeId: string) => void;
  disabled?: boolean;
}

export default function DxaScanTypeDropdown({
  value,
  onChange,
  disabled = false,
}: DxaScanTypeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const selectedScanType = getDxaScanType(value);

  // Close dropdown on click outside or Escape
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

  const handleSelect = (typeId: string) => {
    onChange(typeId);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col gap-2.5 w-full" ref={dropdownRef}>
      <div className="flex items-center justify-between flex-wrap gap-1">
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
          <Bone className="w-3.5 h-3.5 text-[#2563EB]" />
          Step 1: Select DXA Scan Protocol <span className="text-red-500">*</span>
        </label>
        {selectedScanType && (
          <span className="text-[11px] font-mono text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Protocol Selected
          </span>
        )}
      </div>

      {/* Dropdown Trigger */}
      <div className="relative w-full">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={`w-full px-4 py-3 rounded-xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
            isOpen
              ? "bg-surface border-[#2563EB] ring-2 ring-[#2563EB]/20 shadow-md"
              : selectedScanType
              ? "bg-surface border-[#2563EB]/60 shadow-xs"
              : "bg-surface border-slate-200 dark:border-slate-800 hover:border-[#2563EB]/40 hover:bg-slate-50 dark:hover:bg-slate-900/50"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {selectedScanType ? (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center font-bold text-xs shrink-0">
                <Scan className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-on-surface truncate font-display-md">
                    {selectedScanType.label}
                  </span>
                </div>
                <span className="text-xs text-on-surface-variant truncate">
                  {selectedScanType.sites.length > 0
                    ? `Sites: ${selectedScanType.sites.join(", ")} ${
                        selectedScanType.includesComposition
                          ? "• + Body Comp"
                          : "• Bone Density Only"
                      }`
                    : "Free-form manual site entry"}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 text-on-surface-variant text-sm truncate">
              <Bone className="w-4 h-4 text-on-surface-variant/70 shrink-0" />
              <span className="truncate">Click to select DXA scan type (Central vs Peripheral)...</span>
            </div>
          )}

          <ChevronDown
            className={`w-4 h-4 text-on-surface-variant shrink-0 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-[#2563EB]" : ""
            }`}
          />
        </button>

        {/* Dropdown Popover List */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl bg-surface/98 backdrop-blur-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden max-h-80 overflow-y-auto animate-scaleUp origin-top transition-all">
            <div className="p-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-[11px] text-on-surface-variant px-3">
              <span className="font-mono uppercase tracking-wider font-semibold">Standard DXA Protocols ({DXA_SCAN_TYPES.length})</span>
              <span className="flex items-center gap-1 font-mono text-[#2563EB]">
                <ShieldCheck className="w-3 h-3" /> ISCD Validated
              </span>
            </div>

            <div className="p-1.5 flex flex-col gap-1">
              {DXA_SCAN_TYPES.map((type: DxaScanType) => {
                const isSelected = value === type.id;

                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleSelect(type.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? "bg-[#2563EB]/10 text-[#2563EB] border border-[#2563EB]/30"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800 text-on-surface hover:text-on-surface"
                    }`}
                  >
                    <div className="flex flex-col min-w-0 gap-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-bold font-display-md ${isSelected ? "text-[#2563EB]" : "text-on-surface"}`}>
                          {type.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant line-clamp-1">
                        {type.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-on-surface-variant">
                        {type.includesComposition === true
                          ? "Bone + Comp"
                          : type.includesComposition === false
                          ? "Bone Only"
                          : "Custom"}
                      </span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? "border-[#2563EB] bg-[#2563EB] text-white"
                          : "border-slate-300 dark:border-slate-700 text-transparent"
                      }`}>
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Selected Type Details Info Box */}
      {selectedScanType && (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5 text-xs text-on-surface">
          <Info className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <strong className="font-semibold text-on-surface">{selectedScanType.label}:</strong>
              <span className="text-[11px] text-on-surface-variant">{selectedScanType.description}</span>
            </div>
            {selectedScanType.sites.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1">
                <span className="text-[10px] font-mono text-on-surface-variant font-medium">Expected Skeletal Sites:</span>
                {selectedScanType.sites.map((site, i) => (
                  <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-slate-200 dark:border-slate-800 text-[#2563EB] font-semibold">
                    {site}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
