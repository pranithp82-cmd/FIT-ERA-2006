import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUserFromRequest } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const authUser = getAuthUserFromRequest(req);

    let monitorProfile = null;
    if (authUser && (authUser.role === "MONITOR" || authUser.role === "ADMIN")) {
      const user = await prisma.user.findUnique({
        where: { id: authUser.id },
        include: { monitorProfile: true },
      });
      monitorProfile = user?.monitorProfile;
    }

    if (!monitorProfile) {
      // Fallback
      monitorProfile = await prisma.monitorProfile.findFirst({
        where: { monitorId: "ERA-MON-8942" },
      });
    }

    if (!monitorProfile) {
      return NextResponse.json({ users: [] });
    }

    const assignments = await prisma.userMonitorAssignment.findMany({
      where: {
        monitorId: monitorProfile.id,
      },
      include: {
        user: {
          include: {
            workouts: { take: 1, orderBy: { startTime: "desc" } },
            healthReports: { take: 1, orderBy: { reportDate: "desc" } },
            dxaReports: { take: 1, orderBy: { reportDate: "desc" } },
          },
        },
      },
      orderBy: { assignedAt: "desc" },
    });

    const users = assignments.map((a) => ({
      id: a.user.id,
      name: a.user.name,
      email: a.user.email,
      avatar: a.user.avatar,
      age: a.user.age || 28,
      gender: a.user.gender || "Male",
      heightCm: a.user.heightCm || 180,
      weightKg: a.user.weightKg || 78,
      goal: a.user.goal || "Hypertrophy & Longevity",
      bloodType: a.user.bloodType || "O+ Positive",
      status: a.status,
      assignedDate: a.assignedAt.toISOString().split("T")[0],
      notes: a.notes,
      hasBloodReport: a.user.healthReports.length > 0,
      hasDxaReport: a.user.dxaReports.length > 0,
      progress: 88,
    }));

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("Monitor users list error:", error);
    return NextResponse.json({ error: error.message || "Failed to load users" }, { status: 500 });
  }
}
