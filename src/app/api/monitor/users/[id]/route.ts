import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUserFromRequest } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: targetUserId } = await params;
    const authUser = getAuthUserFromRequest(req);

    // Fetch Target User
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        healthReports: {
          orderBy: { reportDate: "desc" },
          include: { parameters: true },
        },
        dxaReports: {
          orderBy: { reportDate: "desc" },
          include: { parameters: true },
        },
        foodLogs: {
          orderBy: { logDate: "desc" },
          take: 10,
          include: { food: true },
        },
        workouts: {
          orderBy: { startTime: "desc" },
          take: 10,
          include: {
            sets: { include: { exercise: true } },
          },
        },
        waterLogs: {
          orderBy: { logDate: "desc" },
          take: 7,
        },
        healthMetrics: {
          orderBy: { date: "desc" },
          take: 15,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch Assignment Details
    const assignment = await prisma.userMonitorAssignment.findFirst({
      where: { userId: targetUserId },
      include: {
        monitor: {
          include: { user: { select: { name: true, email: true, avatar: true } } },
        },
      },
    });

    // Fetch Assigned Workout & Diet Plans
    const assignedWorkout = await prisma.assignedWorkoutPlan.findFirst({
      where: { userId: targetUserId, active: true },
      orderBy: { createdAt: "desc" },
    });

    const assignedDiet = await prisma.assignedDietPlan.findFirst({
      where: { userId: targetUserId, active: true },
      orderBy: { createdAt: "desc" },
    });

    // Fetch Notes & Tasks
    const monitorNotes = await prisma.monitorNote.findMany({
      where: { userId: targetUserId },
      orderBy: { createdAt: "desc" },
    });

    // Fetch Audit Trail for this Athlete
    const auditLogs = await prisma.auditLog.findMany({
      where: { targetUserId: targetUserId },
      orderBy: { timestamp: "desc" },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        age: user.age || 28,
        gender: user.gender || "Male",
        heightCm: user.heightCm || 180,
        weightKg: user.weightKg || 78,
        goal: user.goal || "Hypertrophy & Longevity",
        bloodType: user.bloodType || "O+ Positive",
        status: user.status,
        trainerSync: user.trainerSync,
        createdAt: user.createdAt,
      },
      assignment: assignment
        ? {
            id: assignment.id,
            status: assignment.status,
            assignedAt: assignment.assignedAt,
            notes: assignment.notes,
            monitorId: assignment.monitor.monitorId,
            monitorName: assignment.monitor.user.name,
          }
        : null,
      assignedWorkout: assignedWorkout
        ? {
            id: assignedWorkout.id,
            title: assignedWorkout.title,
            notes: assignedWorkout.notes,
            exercises: JSON.parse(assignedWorkout.exercises || "[]"),
            assignedByName: assignedWorkout.assignedByName,
            updatedAt: assignedWorkout.updatedAt,
          }
        : null,
      assignedDiet: assignedDiet
        ? {
            id: assignedDiet.id,
            title: assignedDiet.title,
            targetCalories: assignedDiet.targetCalories || 2850,
            targetProtein: assignedDiet.targetProtein || 160,
            targetCarbs: assignedDiet.targetCarbs || 300,
            targetFat: assignedDiet.targetFat || 70,
            notes: assignedDiet.notes,
            meals: JSON.parse(assignedDiet.meals || "[]"),
            assignedByName: assignedDiet.assignedByName,
            updatedAt: assignedDiet.updatedAt,
          }
        : null,
      // SENSITIVE CLINICAL DATA (Strictly Read-Only for Monitors)
      healthReports: user.healthReports.map((hr) => ({
        id: hr.id,
        reportDate: hr.reportDate,
        laboratory: hr.laboratory,
        packageId: hr.packageId,
        readOnly: true,
        parameters: hr.parameters.map((p) => ({
          testName: p.testName,
          value: p.value,
          unit: p.unit,
          referenceLow: p.referenceLow,
          referenceHigh: p.referenceHigh,
          status: p.status,
          category: p.category,
        })),
      })),
      dxaReports: user.dxaReports.map((dr) => ({
        id: dr.id,
        reportDate: dr.reportDate,
        scanTypeId: dr.scanTypeId,
        readOnly: true,
        parameters: dr.parameters.map((p) => ({
          metricName: p.metricName,
          value: p.value,
          unit: p.unit,
          region: p.region,
        })),
      })),
      recentWorkouts: user.workouts,
      recentMeals: user.foodLogs,
      waterLogs: user.waterLogs,
      healthMetrics: user.healthMetrics,
      monitorNotes: monitorNotes.map((n) => ({
        id: n.id,
        title: n.title,
        content: n.content,
        category: n.category,
        isTask: n.isTask,
        completed: n.completed,
        createdAt: n.createdAt,
      })),
      auditLogs,
    });
  } catch (error: any) {
    console.error("User monitoring detail API error:", error);
    return NextResponse.json({ error: error.message || "Failed to load user monitoring data" }, { status: 500 });
  }
}
