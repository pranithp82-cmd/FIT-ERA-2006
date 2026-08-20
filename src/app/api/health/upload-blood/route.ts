import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { ALL_50_BIOMARKERS } from '@/app/api/health/blood-panel/route';
import { getAarogyamPackage } from '@/lib/aarogyam-packages';

function evaluateStatus(value: number, min?: number | null, max?: number | null): string {
  // Deterministic status engine: if reference ranges are missing, status is UNKNOWN (never guessed)
  if (min == null && max == null) return "UNKNOWN";
  if (min != null && value < min) return "LOW";
  if (max != null && value > max) return "HIGH";
  if (min != null && max != null) {
    if (value >= min && value <= max) return "NORMAL";
  }
  if (min != null && max == null && value >= min) return "NORMAL";
  if (max != null && min == null && value <= max) return "NORMAL";
  return "UNKNOWN";
}

export async function POST(req: Request) {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON request body. Package selection (packageId) is required.' },
        { status: 400 }
      );
    }

    const { packageId, fileName = "uploaded_blood_report.pdf" } = body;

    // Requirement: Block submission and return 400 error if packageId is missing
    if (!packageId || typeof packageId !== 'string' || !packageId.trim()) {
      return NextResponse.json(
        { error: 'Package selection (packageId) is required before upload. Please select a valid Aarogyam or Custom package.' },
        { status: 400 }
      );
    }

    const selectedPackage = getAarogyamPackage(packageId);
    const labTitle = selectedPackage
      ? `Thyrocare Technologies / ${selectedPackage.label} (${fileName})`
      : `Clinical Laboratory / ${packageId} (${fileName})`;

    // Clean previous reports to avoid duplicates
    const existingReports = await prisma.healthReport.findMany({
      where: { userId: user.id }
    });
    if (existingReports.length > 0) {
      await prisma.bloodParameter.deleteMany({
        where: { reportId: { in: existingReports.map(r => r.id) } }
      });
      await prisma.healthReport.deleteMany({
        where: { id: { in: existingReports.map(r => r.id) } }
      });
    }

    const report = await prisma.healthReport.create({
      data: {
        userId: user.id,
        packageId: packageId,
        reportDate: new Date(),
        laboratory: labTitle,
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
            source: packageId === 'custom-manual' ? 'MANUAL_ENTRY' : 'OCR_EXTRACTED',
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
      packageId: report.packageId,
      packageName: selectedPackage?.label || packageId,
      biomarkersExtracted: report.parameters.length,
      extractedData: report.parameters,
    });
  } catch (error) {
    console.error('Error processing blood report:', error);
    return NextResponse.json({ error: 'Failed to process report' }, { status: 500 });
  }
}
