import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { timestamp: "desc" },
      take: 50,
    });

    const totalUsers = await prisma.user.count({ where: { role: "USER" } });
    const totalMonitors = await prisma.monitorProfile.count();
    const activeAssignments = await prisma.userMonitorAssignment.count({ where: { status: "ACTIVE" } });

    return NextResponse.json({
      logs,
      kpis: {
        totalUsers,
        totalMonitors,
        activeAssignments,
        totalAuditLogs: logs.length,
      },
    });
  } catch (error: any) {
    console.error("Admin activity API error:", error);
    return NextResponse.json({ error: error.message || "Failed to load activity logs" }, { status: 500 });
  }
}
