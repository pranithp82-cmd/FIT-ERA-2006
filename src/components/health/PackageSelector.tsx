"use client";

import React, { useState, useRef, useEffect } from "react";
import { AAROGYAM_PACKAGES, AarogyamPackage, getAarogyamPackage } from "@/lib/aarogyam-packages";
import {
  CheckCircle2,
  FlaskConical,
  Sparkles,
  ChevronDown,
  Info,
  Layers,
} from "lucide-react";

interface PackageSelectorProps {
  value: string | null;
  onChange: (packageId: string) => void;
  disabled?: boolean;
}

export default function PackageSelector({
  value,
  onChange,
  disabled = false,
}: PackageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const selectedPackage = getAarogyamPackage(value);

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

  const handleSelect = (pkgId: string) => {
    onChange(pkgId);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col gap-2.5" ref={dropdownRef}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
          <FlaskConical className="w-3.5 h-3.5 text-primary-fixed" />
          Step 1: Select Laboratory / Aarogyam Package <span className="text-danger">*</span>
        </label>
        {selectedPackage && (
          <span className="text-[11px] font-mono text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Ready for Calibration
          </span>
        )}
      </div>

      {/* Custom Dropdown Trigger */}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen((prev) => !prev)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={`w-full px-4 py-3 rounded-xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
            isOpen
              ? "bg-surface border-primary-fixed ring-2 ring-primary-fixed/20 shadow-md"
              : selectedPackage
              ? "bg-surface border-primary-fixed/60 shadow-xs"
              : "bg-surface border-outline hover:border-primary-fixed/40 hover:bg-surface-container-high/40"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {selectedPackage ? (
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-primary-container text-primary-fixed flex items-center justify-center font-bold text-xs shrink-0">
                <FlaskConical className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-on-surface truncate font-display-md">
                    {selectedPackage.label}
                  </span>
                  {selectedPackage.popular && (
                    <span className="bg-primary-fixed text-white text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5 shrink-0">
                      <Sparkles className="w-2.5 h-2.5" /> Popular
                    </span>
                  )}
                </div>
                <span className="text-xs text-on-surface-variant truncate">
                  {selectedPackage.paramCount > 0
                    ? `${selectedPackage.paramCount} Parameters • ${selectedPackage.categories.slice(0, 3).join(", ")}...`
                    : "Custom Reference Intervals"}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 text-on-surface-variant text-sm">
              <FlaskConical className="w-4 h-4 text-on-surface-variant/70" />
              <span>Click to select an Aarogyam package...</span>
            </div>
          )}

          <ChevronDown
            className={`w-4 h-4 text-on-surface-variant shrink-0 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-primary-fixed" : ""
            }`}
          />
        </button>

        {/* Dropdown Popover List */}
        {isOpen && (
          <div className="absolute left-0 right-0 top-full mt-2 z-50 rounded-2xl bg-surface/98 backdrop-blur-xl border border-outline shadow-2xl overflow-hidden max-h-80 overflow-y-auto animate-scaleUp origin-top transition-all">
            <div className="p-2 border-b border-outline/50 bg-surface-container/40 flex items-center justify-between text-[11px] text-on-surface-variant px-3">
              <span className="font-mono uppercase tracking-wider font-semibold">Available Packages ({AAROGYAM_PACKAGES.length})</span>
              <span>Thyrocare Certified</span>
            </div>

            <div className="p-1.5 flex flex-col gap-1">
              {AAROGYAM_PACKAGES.map((pkg: AarogyamPackage) => {
                const isSelected = value === pkg.id;

                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => handleSelect(pkg.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? "bg-primary-container/60 text-primary-fixed border border-primary-fixed/30"
                        : "hover:bg-surface-container text-on-surface hover:text-on-surface"
                    }`}
                  >
                    <div className="flex flex-col min-w-0 gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold font-display-md ${isSelected ? "text-primary-fixed" : "text-on-surface"}`}>
                          {pkg.label}
                        </span>
                        {pkg.popular && (
                          <span className="bg-primary-fixed text-white text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                            <Sparkles className="w-2.5 h-2.5" /> Popular
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-on-surface-variant line-clamp-1">
                        {pkg.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-surface-container-high text-on-surface-variant">
                        {pkg.paramCount > 0 ? `${pkg.paramCount} Params` : "Custom"}
                      </span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? "border-primary-fixed bg-primary-fixed text-white"
                          : "border-outline text-transparent"
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

      {/* Selected Package Details Pill */}
      {selectedPackage && (
        <div className="p-3 rounded-xl bg-surface-container/50 border border-outline/70 flex items-start gap-2.5 text-xs text-on-surface">
          <Info className="w-4 h-4 text-primary-fixed shrink-0 mt-0.5" />
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <strong className="font-semibold text-on-surface">{selectedPackage.label}:</strong>
              <span className="text-[11px] text-on-surface-variant">{selectedPackage.description}</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] font-mono text-on-surface-variant font-medium">Included Profiles:</span>
              {selectedPackage.categories.map((cat, i) => (
                <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-outline text-on-surface-variant">
                  {cat}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
