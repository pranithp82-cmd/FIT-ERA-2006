import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const ALL_20_DXA_METRICS = [
  // 1-7: Bone Health & Density
  { metricName: "Bone Mineral Density (BMD)", value: 1.18, unit: "g/cm²", region: "Total Body", referenceRange: "> 1.05 g/cm²", status: "Optimal", category: "Bone Health & Density" },
  { metricName: "Bone Mineral Content (BMC)", value: 2850, unit: "g", region: "Total Body", referenceRange: "2200 - 3400 g", status: "Normal", category: "Bone Health & Density" },
  { metricName: "T-Score", value: 0.8, unit: "SD", region: "Lumbar & Hip", referenceRange: "> -1.0 SD (Normal)", status: "Optimal", category: "Bone Health & Density" },
  { metricName: "Z-Score", value: 1.1, unit: "SD", region: "Age-Matched", referenceRange: "> -2.0 SD", status: "Normal", category: "Bone Health & Density" },
  { metricName: "Spine BMD (L1-L4)", value: 1.22, unit: "g/cm²", region: "Lumbar Spine", referenceRange: "1.05 - 1.35 g/cm²", status: "Optimal", category: "Bone Health & Density" },
  { metricName: "Total Hip BMD", value: 1.15, unit: "g/cm²", region: "Total Hip", referenceRange: "0.95 - 1.25 g/cm²", status: "Optimal", category: "Bone Health & Density" },
  { metricName: "Femoral Neck BMD", value: 1.08, unit: "g/cm²", region: "Femoral Neck", referenceRange: "0.90 - 1.20 g/cm²", status: "Normal", category: "Bone Health & Density" },

  // 8-14: Body Composition & Lean Mass Breakdown
  { metricName: "Total Body Fat Percentage", value: 14.8, unit: "%", region: "Total Body", referenceRange: "10.0 - 20.0 %", status: "Athletic / Lean", category: "Body Composition & Lean Mass" },
  { metricName: "Total Fat Mass", value: 11.5, unit: "kg", region: "Total Body", referenceRange: "8.0 - 16.0 kg", status: "Healthy", category: "Body Composition & Lean Mass" },
  { metricName: "Total Lean Mass", value: 64.2, unit: "kg", region: "Total Body", referenceRange: "55.0 - 75.0 kg", status: "High Muscle Mass", category: "Body Composition & Lean Mass" },
  { metricName: "Arm Lean Mass", value: 8.4, unit: "kg", region: "Upper Limbs (Bilateral)", referenceRange: "6.5 - 9.5 kg (98% Symmetry)", status: "Symmetric", category: "Body Composition & Lean Mass" },
  { metricName: "Leg Lean Mass", value: 21.6, unit: "kg", region: "Lower Limbs (Bilateral)", referenceRange: "18.0 - 25.0 kg (98% Symmetry)", status: "Symmetric", category: "Body Composition & Lean Mass" },
  { metricName: "Trunk Lean Mass", value: 31.4, unit: "kg", region: "Torso / Core", referenceRange: "26.0 - 36.0 kg", status: "Robust Core", category: "Body Composition & Lean Mass" },
  { metricName: "Appendicular Lean Mass (ALM)", value: 30.0, unit: "kg", region: "Arms + Legs", referenceRange: "ALM Index > 7.0 kg/m² (Score: 8.8)", status: "Athletic", category: "Body Composition & Lean Mass" },

  // 15-20: Adipose Distribution & Metabolic Risk
  { metricName: "Regional Fat Mass", value: 11.5, unit: "kg", region: "Trunk: 5.8kg • Limbs: 5.7kg", referenceRange: "Balanced subcutaneous ratio", status: "Optimal", category: "Adipose Distribution & Metabolic Risk" },
  { metricName: "Regional Fat Percentage", value: 14.8, unit: "%", region: "Trunk: 15.2% • Arms: 12.1% • Legs: 14.8%", referenceRange: "10.0 - 20.0 % across regions", status: "Balanced", category: "Adipose Distribution & Metabolic Risk" },
  { metricName: "Android Fat (Abdominal)", value: 0.95, unit: "kg", region: "Abdomen (A-Region)", referenceRange: "< 1.50 kg (< 18%)", status: "Low Risk", category: "Adipose Distribution & Metabolic Risk" },
  { metricName: "Gynoid Fat (Hips/Thighs)", value: 1.85, unit: "kg", region: "Hips & Pelvis (G-Region)", referenceRange: "1.50 - 3.00 kg", status: "Normal", category: "Adipose Distribution & Metabolic Risk" },
  { metricName: "Android/Gynoid Ratio (A/G Ratio)", value: 0.51, unit: "ratio", region: "Central Adiposity Index", referenceRange: "< 0.80 (Men) / < 0.70 (Women)", status: "Low Cardiovascular Risk", category: "Adipose Distribution & Metabolic Risk" },
  { metricName: "Visceral Adipose Tissue (VAT) Estimate", value: 48, unit: "cm²", region: "Intra-Abdominal Cavity", referenceRange: "< 100 cm² (< 1000 g)", status: "Low Visceral Fat", category: "Adipose Distribution & Metabolic Risk" },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get('userId');

    if (!userId) {
      const user = await prisma.user.findFirst();
      if (user) userId = user.id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    let reports = await prisma.dXAReport.findMany({
      where: { userId },
      include: {
        parameters: true,
      },
      orderBy: { reportDate: 'desc' },
    });

    // If user has no reports yet, initialize a default central-with-composition report
    if (reports.length === 0) {
      const newReport = await prisma.dXAReport.create({
        data: {
          userId,
          scanTypeId: "central-with-composition",
          reportDate: new Date(),
          parameters: {
            create: ALL_20_DXA_METRICS.map(m => ({
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

      reports = [newReport];
    }

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error fetching DXA reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}
