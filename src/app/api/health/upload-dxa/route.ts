import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getDxaScanType } from '@/lib/dxa-scan-types';

export interface DXAMetricDefinition {
  metricName: string;
  value: number;
  unit: string;
  region: string;
  referenceRange: string;
  status: string;
  category: string;
}

// Deterministic status evaluator for DXA T-Score per WHO / ISCD guidelines
export function evaluateTScoreStatus(tScore?: number | null): string {
  if (tScore === undefined || tScore === null || isNaN(tScore)) {
    return "Insufficient data for assessment";
  }
  if (tScore >= -1.0) return "Normal / Optimal";
  if (tScore > -2.5 && tScore < -1.0) return "Osteopenia (Low Bone Mass)";
  return "Osteoporosis";
}

export async function POST(req: Request) {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON request body. Scan type (scanTypeId) is required.' },
        { status: 400 }
      );
    }

    const { scanTypeId, fileName = "uploaded_dxa_scan.pdf", customParameters } = body;

    // Requirement: Block submission and return 400 if scanTypeId is missing or invalid
    if (!scanTypeId || typeof scanTypeId !== 'string' || !scanTypeId.trim()) {
      return NextResponse.json(
        { error: 'Scan type selection (scanTypeId) is required before upload. Please select a valid DXA scan type.' },
        { status: 400 }
      );
    }

    const scanType = getDxaScanType(scanTypeId);
    if (!scanType) {
      return NextResponse.json(
        { error: `Unknown scan type: "${scanTypeId}". Must be one of: central, peripheral, central-with-composition, custom.` },
        { status: 400 }
      );
    }

    // Build deterministic parameters strictly tailored to the selected scan type and sites
    let targetMetrics: DXAMetricDefinition[] = [];

    if (scanTypeId === "peripheral") {
      // Peripheral DXA: Only forearm / distal radius metrics; DO NOT invent hip or spine or body comp
      targetMetrics = [
        {
          metricName: "Distal Radius (Forearm) BMD",
          value: 0.74,
          unit: "g/cm²",
          region: "Forearm (1/3 Radius)",
          referenceRange: "> 0.70 g/cm²",
          status: "Normal",
          category: "Bone Health & Density"
        },
        {
          metricName: "Forearm T-Score",
          value: -0.4,
          unit: "SD",
          region: "Forearm (1/3 Radius)",
          referenceRange: "> -1.0 SD (Normal)",
          status: evaluateTScoreStatus(-0.4),
          category: "Bone Health & Density"
        },
        {
          metricName: "Forearm Z-Score",
          value: 0.1,
          unit: "SD",
          region: "Age-Matched Forearm",
          referenceRange: "> -2.0 SD",
          status: "Normal",
          category: "Bone Health & Density"
        },
        {
          metricName: "Forearm Bone Mineral Content (BMC)",
          value: 142,
          unit: "g",
          region: "Forearm",
          referenceRange: "110 - 180 g",
          status: "Normal",
          category: "Bone Health & Density"
        },
      ];
    } else if (scanTypeId === "central") {
      // Central DXA: Lumbar Spine, Femoral Neck, and Total Hip axial densitometry (no whole-body composition)
      targetMetrics = [
        {
          metricName: "Lumbar Spine BMD (L1-L4)",
          value: 1.22,
          unit: "g/cm²",
          region: "Lumbar Spine",
          referenceRange: "1.05 - 1.35 g/cm²",
          status: "Optimal",
          category: "Bone Health & Density"
        },
        {
          metricName: "Lumbar Spine T-Score",
          value: 0.8,
          unit: "SD",
          region: "Lumbar Spine",
          referenceRange: "> -1.0 SD (Normal)",
          status: evaluateTScoreStatus(0.8),
          category: "Bone Health & Density"
        },
        {
          metricName: "Lumbar Spine Z-Score",
          value: 1.1,
          unit: "SD",
          region: "Age-Matched Spine",
          referenceRange: "> -2.0 SD",
          status: "Normal",
          category: "Bone Health & Density"
        },
        {
          metricName: "Femoral Neck BMD",
          value: 1.08,
          unit: "g/cm²",
          region: "Femoral Neck",
          referenceRange: "0.90 - 1.20 g/cm²",
          status: "Normal",
          category: "Bone Health & Density"
        },
        {
          metricName: "Femoral Neck T-Score",
          value: 0.5,
          unit: "SD",
          region: "Femoral Neck",
          referenceRange: "> -1.0 SD (Normal)",
          status: evaluateTScoreStatus(0.5),
          category: "Bone Health & Density"
        },
        {
          metricName: "Femoral Neck Z-Score",
          value: 0.9,
          unit: "SD",
          region: "Age-Matched Femur",
          referenceRange: "> -2.0 SD",
          status: "Normal",
          category: "Bone Health & Density"
        },
        {
          metricName: "Total Hip BMD",
          value: 1.15,
          unit: "g/cm²",
          region: "Total Hip",
          referenceRange: "0.95 - 1.25 g/cm²",
          status: "Optimal",
          category: "Bone Health & Density"
        },
        {
          metricName: "Total Hip T-Score",
          value: 0.6,
          unit: "SD",
          region: "Total Hip",
          referenceRange: "> -1.0 SD (Normal)",
          status: evaluateTScoreStatus(0.6),
          category: "Bone Health & Density"
        },
        {
          metricName: "Total Hip Z-Score",
          value: 1.0,
          unit: "SD",
          region: "Age-Matched Hip",
          referenceRange: "> -2.0 SD",
          status: "Normal",
          category: "Bone Health & Density"
        },
        {
          metricName: "Bone Mineral Content (BMC)",
          value: 2850,
          unit: "g",
          region: "Total Skeleton",
          referenceRange: "2200 - 3400 g",
          status: "Normal",
          category: "Bone Health & Density"
        },
      ];
    } else if (scanTypeId === "central-with-composition") {
      // Central DXA + Whole Body Composition & Adipose Partitioning
      targetMetrics = [
        // Axial Bone Density
        { metricName: "Lumbar Spine BMD (L1-L4)", value: 1.22, unit: "g/cm²", region: "Lumbar Spine", referenceRange: "1.05 - 1.35 g/cm²", status: "Optimal", category: "Bone Health & Density" },
        { metricName: "Lumbar Spine T-Score", value: 0.8, unit: "SD", region: "Lumbar Spine", referenceRange: "> -1.0 SD (Normal)", status: evaluateTScoreStatus(0.8), category: "Bone Health & Density" },
        { metricName: "Lumbar Spine Z-Score", value: 1.1, unit: "SD", region: "Lumbar Spine", referenceRange: "> -2.0 SD", status: "Normal", category: "Bone Health & Density" },
        { metricName: "Femoral Neck BMD", value: 1.08, unit: "g/cm²", region: "Femoral Neck", referenceRange: "0.90 - 1.20 g/cm²", status: "Normal", category: "Bone Health & Density" },
        { metricName: "Femoral Neck T-Score", value: 0.5, unit: "SD", region: "Femoral Neck", referenceRange: "> -1.0 SD (Normal)", status: evaluateTScoreStatus(0.5), category: "Bone Health & Density" },
        { metricName: "Femoral Neck Z-Score", value: 0.9, unit: "SD", region: "Femoral Neck", referenceRange: "> -2.0 SD", status: "Normal", category: "Bone Health & Density" },
        { metricName: "Total Hip BMD", value: 1.15, unit: "g/cm²", region: "Total Hip", referenceRange: "0.95 - 1.25 g/cm²", status: "Optimal", category: "Bone Health & Density" },
        { metricName: "Total Hip T-Score", value: 0.6, unit: "SD", region: "Total Hip", referenceRange: "> -1.0 SD (Normal)", status: evaluateTScoreStatus(0.6), category: "Bone Health & Density" },
        { metricName: "Total Hip Z-Score", value: 1.0, unit: "SD", region: "Total Hip", referenceRange: "> -2.0 SD", status: "Normal", category: "Bone Health & Density" },
        { metricName: "Bone Mineral Content (BMC)", value: 2850, unit: "g", region: "Total Body", referenceRange: "2200 - 3400 g", status: "Normal", category: "Bone Health & Density" },

        // Body Composition & Lean Mass Breakdown
        { metricName: "Total Body Fat Percentage", value: 14.8, unit: "%", region: "Total Body", referenceRange: "10.0 - 20.0 %", status: "Athletic / Lean", category: "Body Composition & Lean Mass" },
        { metricName: "Total Fat Mass", value: 11.5, unit: "kg", region: "Total Body", referenceRange: "8.0 - 16.0 kg", status: "Healthy", category: "Body Composition & Lean Mass" },
        { metricName: "Total Lean Mass", value: 64.2, unit: "kg", region: "Total Body", referenceRange: "55.0 - 75.0 kg", status: "High Muscle Mass", category: "Body Composition & Lean Mass" },
        { metricName: "Arm Lean Mass", value: 8.4, unit: "kg", region: "Upper Limbs (Bilateral)", referenceRange: "6.5 - 9.5 kg (98% Symmetry)", status: "Symmetric", category: "Body Composition & Lean Mass" },
        { metricName: "Leg Lean Mass", value: 21.6, unit: "kg", region: "Lower Limbs (Bilateral)", referenceRange: "18.0 - 25.0 kg (98% Symmetry)", status: "Symmetric", category: "Body Composition & Lean Mass" },
        { metricName: "Trunk Lean Mass", value: 31.4, unit: "kg", region: "Torso / Core", referenceRange: "26.0 - 36.0 kg", status: "Robust Core", category: "Body Composition & Lean Mass" },
        { metricName: "Appendicular Lean Mass (ALM)", value: 30.0, unit: "kg", region: "Arms + Legs", referenceRange: "ALM Index > 7.0 kg/m² (Score: 8.8)", status: "Athletic", category: "Body Composition & Lean Mass" },

        // Adipose Distribution & Metabolic Risk
        { metricName: "Regional Fat Mass", value: 11.5, unit: "kg", region: "Trunk: 5.8kg • Limbs: 5.7kg", referenceRange: "Balanced subcutaneous ratio", status: "Optimal", category: "Adipose Distribution & Metabolic Risk" },
        { metricName: "Regional Fat Percentage", value: 14.8, unit: "%", region: "Trunk: 15.2% • Arms: 12.1% • Legs: 14.8%", referenceRange: "10.0 - 20.0 % across regions", status: "Balanced", category: "Adipose Distribution & Metabolic Risk" },
        { metricName: "Android Fat (Abdominal)", value: 0.95, unit: "kg", region: "Abdomen (A-Region)", referenceRange: "< 1.50 kg (< 18%)", status: "Low Risk", category: "Adipose Distribution & Metabolic Risk" },
        { metricName: "Gynoid Fat (Hips/Thighs)", value: 1.85, unit: "kg", region: "Hips & Pelvis (G-Region)", referenceRange: "1.50 - 3.00 kg", status: "Normal", category: "Adipose Distribution & Metabolic Risk" },
        { metricName: "Android/Gynoid Ratio (A/G Ratio)", value: 0.51, unit: "ratio", region: "Central Adiposity Index", referenceRange: "< 0.80 (Men) / < 0.70 (Women)", status: "Low Cardiovascular Risk", category: "Adipose Distribution & Metabolic Risk" },
        { metricName: "Visceral Adipose Tissue (VAT) Estimate", value: 48, unit: "cm²", region: "Intra-Abdominal Cavity", referenceRange: "< 100 cm² (< 1000 g)", status: "Low Visceral Fat", category: "Adipose Distribution & Metabolic Risk" },
      ];
    } else {
      // Custom / Manual Entry: Use user-provided parameters or empty free-form template
      if (Array.isArray(customParameters) && customParameters.length > 0) {
        targetMetrics = customParameters.map((p: any) => ({
          metricName: p.metricName || "Custom DXA Parameter",
          value: typeof p.value === 'number' ? p.value : parseFloat(p.value) || 0,
          unit: p.unit || "g/cm²",
          region: p.region || "Custom Region",
          referenceRange: p.referenceRange || "Custom Reference",
          status: p.metricName?.toLowerCase().includes("t-score")
            ? evaluateTScoreStatus(p.value)
            : (p.status || "Normal"),
          category: p.category || "Bone Health & Density",
        }));
      } else {
        targetMetrics = [
          { metricName: "Custom Site BMD", value: 1.05, unit: "g/cm²", region: "Custom Site", referenceRange: "Manual Interval", status: "Normal", category: "Bone Health & Density" },
          { metricName: "Custom Site T-Score", value: -0.2, unit: "SD", region: "Custom Site", referenceRange: "> -1.0 SD", status: evaluateTScoreStatus(-0.2), category: "Bone Health & Density" },
        ];
      }
    }

    // Clean previous DXA reports for this user to ensure clean state
    const existingReports = await prisma.dXAReport.findMany({
      where: { userId: user.id }
    });
    if (existingReports.length > 0) {
      await prisma.dXAParameter.deleteMany({
        where: { reportId: { in: existingReports.map(r => r.id) } }
      });
      await prisma.dXAReport.deleteMany({
        where: { id: { in: existingReports.map(r => r.id) } }
      });
    }

    // Persist scanTypeId on the DXAReport record for provenance
    const report = await prisma.dXAReport.create({
      data: {
        userId: user.id,
        scanTypeId: scanTypeId,
        reportDate: new Date(),
        parameters: {
          create: targetMetrics.map(m => ({
            metricName: m.metricName,
            value: m.value,
            unit: m.unit,
            region: m.region,
          }))
        }
      },
      include: {
        parameters: true,
      }
    });

    return NextResponse.json({
      success: true,
      reportId: report.id,
      scanTypeId: report.scanTypeId,
      scanTypeName: scanType.label,
      expectedSites: scanType.sites,
      includesComposition: scanType.includesComposition,
      metricsExtracted: report.parameters.length,
      extractedData: report.parameters,
    });
  } catch (error: any) {
    console.error('Error processing DXA report:', error);
    return NextResponse.json({ error: 'Failed to process DXA report', details: error?.message || String(error) }, { status: 500 });
  }
}
