export type DxaSite = "lumbarSpine" | "femoralNeck" | "totalHip" | "forearm";

export interface DxaScanType {
  id: string;
  label: string;
  shortName: string;
  sites: string[];
  includesComposition: boolean | null;
  description: string;
}

export const DXA_SCAN_TYPES: DxaScanType[] = [
  {
    id: "central",
    label: "Central DXA (Hip & Spine)",
    shortName: "Central DXA",
    sites: ["lumbarSpine", "femoralNeck", "totalHip"],
    includesComposition: true,
    description: "Axial skeleton bone densitometry covering L1-L4 Lumbar Spine, Femoral Neck & Total Hip.",
  },
  {
    id: "peripheral",
    label: "Peripheral DXA (Wrist/Heel/Forearm)",
    shortName: "Peripheral DXA",
    sites: ["forearm"],
    includesComposition: false,
    description: "Distal radius / forearm BMD measurement for peripheral skeletal screening.",
  },
  {
    id: "central-with-composition",
    label: "Central DXA + Body Composition",
    shortName: "Central DXA + Body Comp",
    sites: ["lumbarSpine", "femoralNeck", "totalHip"],
    includesComposition: true,
    description: "Axial bone densitometry + whole-body fat/lean compartmental partitioning and visceral fat.",
  },
  {
    id: "custom",
    label: "Other / Manual Entry",
    shortName: "Custom / Manual",
    sites: [],
    includesComposition: null,
    description: "Free-form per-site manual entry for custom DXA scanners without guessed defaults.",
  },
];

export function getDxaScanType(id?: string | null): DxaScanType | undefined {
  if (!id) return undefined;
  return DXA_SCAN_TYPES.find((t) => t.id === id);
}
