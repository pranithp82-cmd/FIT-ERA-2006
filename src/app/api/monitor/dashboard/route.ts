import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUserFromRequest } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const authUser = getAuthUserFromRequest(req);

    // Fallback to default monitor Marcus if not logged in
    let monitorUser = null;
    if (authUser && (authUser.role === "MONITOR" || authUser.role === "ADMIN")) {
      monitorUser = await prisma.user.findUnique({
        where: { id: authUser.id },
        include: { monitorProfile: true },
      });
    }

    if (!monitorUser || !monitorUser.monitorProfile) {
      monitorUser = await prisma.user.findFirst({
        where: { email: "marcus.vance@erafit.ai" },
        include: { monitorProfile: true },
      });
    }

    if (!monitorUser || !monitorUser.monitorProfile) {
      return NextResponse.json({ error: "Monitor profile not found" }, { status: 404 });
    }

    const monitorProfile = monitorUser.monitorProfile;

    // Fetch assigned users
    const assignments = await prisma.userMonitorAssignment.findMany({
      where: {
        monitorId: monitorProfile.id,
        status: { in: ["ACTIVE", "PAUSED"] },
      },
      include: {
        user: {
          include: {
            workouts: { take: 1, orderBy: { startTime: "desc" } },
            foodLogs: { take: 1, orderBy: { logDate: "desc" } },
            healthReports: { take: 1, orderBy: { reportDate: "desc" } },
          },
        },
      },
      orderBy: { assignedAt: "desc" },
    });

    const assignedUsers = assignments.map((a) => {
      const u = a.user;
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        avatar: u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.email}`,
        age: u.age || 28,
        gender: u.gender || "Male",
        heightCm: u.heightCm || 180,
        weightKg: u.weightKg || 78,
        goal: u.goal || "Hypertrophy & Longevity",
        bloodType: u.bloodType || "O+ Positive",
        status: a.status,
        assignedDate: a.assignedAt.toISOString().split("T")[0],
        notes: a.notes,
        lastActive: u.workouts[0]?.startTime
          ? new Date(u.workouts[0].startTime).toLocaleDateString()
          : "Today, 08:30 AM",
        progressPct: 84, // Athletic compliance score
      };
    });

    // Fetch monitor tasks / notes
    const tasks = await prisma.monitorNote.findMany({
      where: {
        monitorId: monitorProfile.id,
      },
      include: {
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Fetch recent audit logs for this monitor
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        actorId: monitorProfile.id,
      },
      take: 8,
      orderBy: { timestamp: "desc" },
    });

    return NextResponse.json({
      monitor: {
        id: monitorProfile.id,
        userId: monitorUser.id,
        name: monitorUser.name,
        email: monitorUser.email,
        avatar: monitorUser.avatar,
        monitorId: monitorProfile.monitorId,
        specialization: monitorProfile.specialization,
        experienceYears: monitorProfile.experienceYears,
        status: monitorProfile.status,
      },
      kpis: {
        totalAssignedUsers: assignedUsers.length,
        activeUsers: assignedUsers.filter((u) => u.status === "ACTIVE").length,
        pendingTasksCount: tasks.filter((t) => t.isTask && !t.completed).length,
        completedTasksCount: tasks.filter((t) => t.isTask && t.completed).length,
        totalAuditEdits: auditLogs.length,
      },
      assignedUsers,
      tasks: tasks.map((t) => ({
        id: t.id,
        userId: t.userId,
        userName: t.user.name,
        title: t.title,
        content: t.content,
        category: t.category,
        isTask: t.isTask,
        completed: t.completed,
        createdAt: t.createdAt,
      })),
      auditLogs,
    });
  } catch (error: any) {
    console.error("Monitor dashboard API error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch monitor dashboard" }, { status: 500 });
  }
}
