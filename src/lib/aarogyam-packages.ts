export interface AarogyamPackage {
  id: string;
  label: string;
  shortName: string;
  paramCount: number;
  description: string;
  popular?: boolean;
  categories: string[];
}

export const AAROGYAM_PACKAGES: AarogyamPackage[] = [
  {
    id: "aarogyam-b",
    label: "Aarogyam B",
    shortName: "Aarogyam B",
    paramCount: 60,
    description: "Core wellness profile covering CBC, Lipids, Liver, and Kidney panels.",
    categories: ["CBC", "Lipid Profile", "Liver Function", "Renal Function", "Glycemic"],
  },
  {
    id: "aarogyam-c-utsh",
    label: "Aarogyam C (with UTSH)",
    shortName: "Aarogyam C (UTSH)",
    paramCount: 64,
    description: "Comprehensive panel with Ultrasensitive Thyroid (UTSH) & Iron status.",
    categories: ["CBC", "Thyroid (UTSH)", "Iron Deficiency", "Lipids", "LFT", "KFT"],
  },
  {
    id: "aarogyam-c-pro-crm-utsh",
    label: "Aarogyam C Pro + CRM (with UTSH)",
    shortName: "C Pro + CRM (UTSH)",
    paramCount: 68,
    description: "Advanced profile with Cardiac Risk Markers (CRM) & High-Sensitivity UTSH.",
    popular: true,
    categories: ["Cardiac Markers", "Thyroid (UTSH)", "Lipid Fractions", "Liver", "Kidney", "CBC"],
  },
  {
    id: "aarogyam-c-pro-crm-adv",
    label: "Aarogyam C Pro + CRM Advanced",
    shortName: "C Pro + CRM Adv",
    paramCount: 72,
    description: "Complete cardio-metabolic screen with Apolipoproteins and Homocysteine.",
    categories: ["Apo-A1/B", "Homocysteine", "hs-CRP", "Thyroid", "Metabolic Matrix"],
  },
  {
    id: "aarogyam-d-pro",
    label: "Aarogyam D Pro",
    shortName: "Aarogyam D Pro",
    paramCount: 80,
    description: "Extensive diagnostic package with Vitamins D3 & B12 + Electrolytes.",
    categories: ["Vitamin D3", "Vitamin B12", "Electrolytes", "Cardiac", "Renal", "Hepatic"],
  },
  {
    id: "aarogyam-e-pro-utsh",
    label: "Aarogyam E Pro (with UTSH)",
    shortName: "E Pro (UTSH)",
    paramCount: 90,
    description: "Elite whole-body longevity panel including Toxic Metals & Steroids.",
    categories: ["Toxic Elements", "Steroid Profile", "Vitamins", "Pancreatic", "Immune"],
  },
  {
    id: "aarogyam-x-utsh",
    label: "Aarogyam X (with UTSH)",
    shortName: "Aarogyam X (UTSH)",
    paramCount: 105,
    description: "Exhaustive ultra-longevity panel covering 100+ clinical biomarkers.",
    categories: ["Full 100+ Bio-matrix", "Vitamins", "Minerals", "Hormones", "Inflammatory"],
  },
  {
    id: "custom-manual",
    label: "Custom / Manual Entry",
    shortName: "Custom Lab / Manual",
    paramCount: 0,
    description: "Upload any other laboratory report (Quest, LabCorp, Dr. Lal PathLabs, SRL, etc.) with custom reference intervals.",
    categories: ["Custom Bio-markers", "Manual Calibrated Reference Ranges"],
  },
];

export function getAarogyamPackage(packageId?: string | null): AarogyamPackage | undefined {
  if (!packageId) return undefined;
  return AAROGYAM_PACKAGES.find((pkg) => pkg.id === packageId);
}
