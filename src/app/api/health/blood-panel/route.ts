import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const ALL_50_BIOMARKERS = [
  // 1-9: Complete Blood Count (CBC)
  { testName: "Hemoglobin (Hb)", value: 14.2, unit: "g/dL", referenceLow: 13.0, referenceHigh: 17.0, referenceText: "13.0 - 17.0", category: "Complete Blood Count (CBC)" },
  { testName: "Red Blood Cell Count (RBC)", value: 4.85, unit: "10^6/uL", referenceLow: 4.50, referenceHigh: 5.90, referenceText: "4.50 - 5.90", category: "Complete Blood Count (CBC)" },
  { testName: "White Blood Cell Count (WBC)", value: 6.8, unit: "10^3/uL", referenceLow: 4.0, referenceHigh: 11.0, referenceText: "4.0 - 11.0", category: "Complete Blood Count (CBC)" },
  { testName: "Platelet Count", value: 260, unit: "10^3/uL", referenceLow: 150, referenceHigh: 450, referenceText: "150 - 450", category: "Complete Blood Count (CBC)" },
  { testName: "Hematocrit (HCT/PCV)", value: 42.5, unit: "%", referenceLow: 38.8, referenceHigh: 50.0, referenceText: "38.8 - 50.0", category: "Complete Blood Count (CBC)" },
  { testName: "Mean Corpuscular Volume (MCV)", value: 88.2, unit: "fL", referenceLow: 80.0, referenceHigh: 100.0, referenceText: "80.0 - 100.0", category: "Complete Blood Count (CBC)" },
  { testName: "Mean Corpuscular Hemoglobin (MCH)", value: 29.5, unit: "pg", referenceLow: 27.0, referenceHigh: 33.0, referenceText: "27.0 - 33.0", category: "Complete Blood Count (CBC)" },
  { testName: "Mean Corpuscular Hemoglobin Concentration (MCHC)", value: 33.4, unit: "g/dL", referenceLow: 32.0, referenceHigh: 36.0, referenceText: "32.0 - 36.0", category: "Complete Blood Count (CBC)" },
  { testName: "Red Cell Distribution Width (RDW)", value: 12.8, unit: "%", referenceLow: 11.5, referenceHigh: 14.5, referenceText: "11.5 - 14.5", category: "Complete Blood Count (CBC)" },

  // 10-16: Differential Leukocyte Count (DLC)
  { testName: "Neutrophils", value: 58, unit: "%", referenceLow: 40, referenceHigh: 70, referenceText: "40 - 70", category: "Differential Leukocytes (DLC)" },
  { testName: "Lymphocytes", value: 32, unit: "%", referenceLow: 20, referenceHigh: 40, referenceText: "20 - 40", category: "Differential Leukocytes (DLC)" },
  { testName: "Monocytes", value: 6, unit: "%", referenceLow: 2, referenceHigh: 8, referenceText: "2 - 8", category: "Differential Leukocytes (DLC)" },
  { testName: "Eosinophils", value: 3, unit: "%", referenceLow: 1, referenceHigh: 4, referenceText: "1 - 4", category: "Differential Leukocytes (DLC)" },
  { testName: "Basophils", value: 1, unit: "%", referenceLow: 0, referenceHigh: 2, referenceText: "0 - 2", category: "Differential Leukocytes (DLC)" },
  { testName: "Absolute Neutrophil Count (ANC)", value: 3.94, unit: "10^3/uL", referenceLow: 1.80, referenceHigh: 7.70, referenceText: "1.80 - 7.70", category: "Differential Leukocytes (DLC)" },
  { testName: "Absolute Lymphocyte Count (ALC)", value: 2.18, unit: "10^3/uL", referenceLow: 1.00, referenceHigh: 4.80, referenceText: "1.00 - 4.80", category: "Differential Leukocytes (DLC)" },

  // 17-19: Glycemic Profile
  { testName: "Fasting Blood Glucose", value: 88, unit: "mg/dL", referenceLow: 70, referenceHigh: 99, referenceText: "70 - 99", category: "Glycemic & Diabetes" },
  { testName: "Random Blood Glucose", value: 110, unit: "mg/dL", referenceLow: 70, referenceHigh: 140, referenceText: "70 - 140", category: "Glycemic & Diabetes" },
  { testName: "HbA1c", value: 5.3, unit: "%", referenceLow: 4.0, referenceHigh: 5.6, referenceText: "4.0 - 5.6", category: "Glycemic & Diabetes" },

  // 20-25: Lipid Profile
  { testName: "Total Cholesterol", value: 178, unit: "mg/dL", referenceLow: 125, referenceHigh: 200, referenceText: "125 - 200", category: "Lipid Profile" },
  { testName: "LDL Cholesterol", value: 95, unit: "mg/dL", referenceLow: 0, referenceHigh: 100, referenceText: "< 100", category: "Lipid Profile" },
  { testName: "HDL Cholesterol", value: 58, unit: "mg/dL", referenceLow: 40, referenceHigh: 60, referenceText: "> 40", category: "Lipid Profile" },
  { testName: "Triglycerides", value: 112, unit: "mg/dL", referenceLow: 0, referenceHigh: 150, referenceText: "< 150", category: "Lipid Profile" },
  { testName: "VLDL Cholesterol", value: 22, unit: "mg/dL", referenceLow: 5, referenceHigh: 30, referenceText: "5 - 30", category: "Lipid Profile" },
  { testName: "Total Cholesterol/HDL Ratio", value: 3.07, unit: "ratio", referenceLow: 0.0, referenceHigh: 4.5, referenceText: "< 4.5", category: "Lipid Profile" },

  // 26-29: Renal Function (KFT)
  { testName: "Serum Creatinine", value: 0.95, unit: "mg/dL", referenceLow: 0.70, referenceHigh: 1.30, referenceText: "0.70 - 1.30", category: "Renal Function (KFT)" },
  { testName: "Blood Urea Nitrogen (BUN)", value: 14, unit: "mg/dL", referenceLow: 7, referenceHigh: 20, referenceText: "7 - 20", category: "Renal Function (KFT)" },
  { testName: "Uric Acid", value: 5.4, unit: "mg/dL", referenceLow: 3.5, referenceHigh: 7.2, referenceText: "3.5 - 7.2", category: "Renal Function (KFT)" },
  { testName: "Estimated Glomerular Filtration Rate (eGFR)", value: 104, unit: "mL/min", referenceLow: 90, referenceHigh: 120, referenceText: "> 90", category: "Renal Function (KFT)" },

  // 30-34: Electrolytes & Minerals
  { testName: "Sodium", value: 140, unit: "mEq/L", referenceLow: 135, referenceHigh: 145, referenceText: "135 - 145", category: "Electrolytes & Minerals" },
  { testName: "Potassium", value: 4.3, unit: "mEq/L", referenceLow: 3.5, referenceHigh: 5.0, referenceText: "3.5 - 5.0", category: "Electrolytes & Minerals" },
  { testName: "Chloride", value: 101, unit: "mEq/L", referenceLow: 96, referenceHigh: 106, referenceText: "96 - 106", category: "Electrolytes & Minerals" },
  { testName: "Calcium", value: 9.4, unit: "mg/dL", referenceLow: 8.5, referenceHigh: 10.2, referenceText: "8.5 - 10.2", category: "Electrolytes & Minerals" },
  { testName: "Magnesium", value: 2.1, unit: "mg/dL", referenceLow: 1.7, referenceHigh: 2.4, referenceText: "1.7 - 2.4", category: "Electrolytes & Minerals" },

  // 35-42: Liver Function (LFT)
  { testName: "Total Protein", value: 7.2, unit: "g/dL", referenceLow: 6.0, referenceHigh: 8.3, referenceText: "6.0 - 8.3", category: "Liver Function (LFT)" },
  { testName: "Albumin", value: 4.5, unit: "g/dL", referenceLow: 3.5, referenceHigh: 5.0, referenceText: "3.5 - 5.0", category: "Liver Function (LFT)" },
  { testName: "Total Bilirubin", value: 0.7, unit: "mg/dL", referenceLow: 0.2, referenceHigh: 1.2, referenceText: "0.2 - 1.2", category: "Liver Function (LFT)" },
  { testName: "Direct Bilirubin", value: 0.2, unit: "mg/dL", referenceLow: 0.0, referenceHigh: 0.3, referenceText: "< 0.3", category: "Liver Function (LFT)" },
  { testName: "ALT (SGPT)", value: 24, unit: "U/L", referenceLow: 7, referenceHigh: 56, referenceText: "7 - 56", category: "Liver Function (LFT)" },
  { testName: "AST (SGOT)", value: 22, unit: "U/L", referenceLow: 10, referenceHigh: 40, referenceText: "10 - 40", category: "Liver Function (LFT)" },
  { testName: "Alkaline Phosphatase (ALP)", value: 68, unit: "U/L", referenceLow: 44, referenceHigh: 147, referenceText: "44 - 147", category: "Liver Function (LFT)" },
  { testName: "Gamma-Glutamyl Transferase (GGT)", value: 18, unit: "U/L", referenceLow: 9, referenceHigh: 48, referenceText: "9 - 48", category: "Liver Function (LFT)" },

  // 43-45: Thyroid & Hormones
  { testName: "Thyroid Stimulating Hormone (TSH)", value: 2.15, unit: "uIU/mL", referenceLow: 0.40, referenceHigh: 4.50, referenceText: "0.40 - 4.50", category: "Thyroid & Hormones" },
  { testName: "Free T4", value: 1.28, unit: "ng/dL", referenceLow: 0.80, referenceHigh: 1.80, referenceText: "0.80 - 1.80", category: "Thyroid & Hormones" },
  { testName: "Free T3", value: 3.2, unit: "pg/mL", referenceLow: 2.3, referenceHigh: 4.2, referenceText: "2.3 - 4.2", category: "Thyroid & Hormones" },

  // 46-50: Iron Profile & Vitamins
  { testName: "Ferritin", value: 142, unit: "ng/mL", referenceLow: 30, referenceHigh: 400, referenceText: "30 - 400", category: "Iron & Vitamins" },
  { testName: "Serum Iron", value: 95, unit: "ug/dL", referenceLow: 65, referenceHigh: 175, referenceText: "65 - 175", category: "Iron & Vitamins" },
  { testName: "Vitamin B12", value: 540, unit: "pg/mL", referenceLow: 200, referenceHigh: 900, referenceText: "200 - 900", category: "Iron & Vitamins" },
  { testName: "Folate (Vitamin B9)", value: 12.4, unit: "ng/mL", referenceLow: 3.0, referenceHigh: 20.0, referenceText: "3.0 - 20.0", category: "Iron & Vitamins" },
  { testName: "Vitamin D (25-OH Vitamin D)", value: 44.5, unit: "ng/mL", referenceLow: 30.0, referenceHigh: 100.0, referenceText: "30.0 - 100.0", category: "Iron & Vitamins" },
];

function evaluateStatus(value: number, min?: number | null, max?: number | null): string {
  if (min == null || max == null) return "NORMAL";
  if (value < min) return "LOW";
  if (value > max) return "HIGH";
  return "NORMAL";
}

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

    let reports = await prisma.healthReport.findMany({
      where: { userId },
      include: {
        parameters: true,
      },
      orderBy: { reportDate: 'desc' },
    });

    // If no report or incomplete parameter set, create/seed the complete 50-biomarker report
    if (reports.length === 0 || reports[0].parameters.length < 50) {
      // Remove partial reports if any to avoid duplication
      if (reports.length > 0) {
        await prisma.bloodParameter.deleteMany({
          where: { reportId: { in: reports.map(r => r.id) } }
        });
        await prisma.healthReport.deleteMany({
          where: { id: { in: reports.map(r => r.id) } }
        });
      }

      const newReport = await prisma.healthReport.create({
        data: {
          userId,
          reportDate: new Date(),
          laboratory: "Quest Diagnostics / Core Comprehensive Clinical Lab",
          parameters: {
            create: ALL_50_BIOMARKERS.map(b => ({
              testName: b.testName,
              value: b.value,
              unit: b.unit,
              referenceLow: b.referenceLow,
              referenceHigh: b.referenceHigh,
              referenceText: b.referenceText,
              status: evaluateStatus(b.value, b.referenceLow, b.referenceHigh),
              category: b.category,
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
    console.error('Error fetching blood reports:', error);
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, reportDate, laboratory, parameters } = body;

    if (!userId || !reportDate || !parameters) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const enrichedParameters = parameters.map((param: any) => {
      const status = evaluateStatus(param.value, param.referenceLow, param.referenceHigh);
      return { ...param, status };
    });

    const report = await prisma.healthReport.create({
      data: {
        userId,
        reportDate: new Date(reportDate),
        laboratory: laboratory || "Clinical Lab",
        parameters: {
          create: enrichedParameters,
        },
      },
      include: {
        parameters: true,
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('Error creating blood report:', error);
    return NextResponse.json({ error: 'Failed to create report' }, { status: 500 });
  }
}
