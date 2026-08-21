import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const assignments = await prisma.userMonitorAssignment.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true, goal: true } },
        monitor: {
          include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
        },
      },
      orderBy: { assignedAt: "desc" },
    });

    const history = await prisma.assignmentHistory.findMany({
      orderBy: { timestamp: "desc" },
      take: 20,
    });

    return NextResponse.json({
      assignments: assignments.map((a) => ({
        id: a.id,
        userId: a.userId,
        userName: a.user.name,
        userEmail: a.user.email,
        userAvatar: a.user.avatar,
        userGoal: a.user.goal,
        monitorProfileId: a.monitorId,
        monitorId: a.monitor.monitorId,
        monitorName: a.monitor.user.name,
        monitorEmail: a.monitor.user.email,
        monitorAvatar: a.monitor.user.avatar,
        assignedAt: a.assignedAt,
        status: a.status,
        notes: a.notes,
      })),
      history,
    });
  } catch (error: any) {
    console.error("Admin assignments GET error:", error);
    return NextResponse.json({ error: error.message || "Failed to load assignments" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { action, userId, monitorProfileId, notes, performedBy } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const adminName = performedBy || "Admin";

    // 1. ASSIGN OR REASSIGN
    if (action === "ASSIGN" || action === "REASSIGN") {
      if (!monitorProfileId) {
        return NextResponse.json({ error: "monitorProfileId is required for assignment" }, { status: 400 });
      }

      const monitor = await prisma.monitorProfile.findUnique({
        where: { id: monitorProfileId },
        include: { user: true },
      });

      if (!monitor) return NextResponse.json({ error: "Monitor not found" }, { status: 404 });

      // Check existing active assignments for this user
      const existingAssignment = await prisma.userMonitorAssignment.findFirst({
        where: { userId: userId, status: "ACTIVE" },
        include: { monitor: { include: { user: true } } },
      });

      // Revoke any previous active assignment
      if (existingAssignment && existingAssignment.monitorId !== monitorProfileId) {
        await prisma.userMonitorAssignment.update({
          where: { id: existingAssignment.id },
          data: { status: "REVOKED" },
        });

        await prisma.assignmentHistory.create({
          data: {
            userId: user.id,
            userName: user.name,
            monitorId: existingAssignment.monitorId,
            monitorName: existingAssignment.monitor.user.name,
            action: "REASSIGNED",
            performedBy: adminName,
            details: `Reassigned from ${existingAssignment.monitor.user.name} to ${monitor.user.name}`,
          },
        });
      }

      // Upsert new assignment
      const assignment = await prisma.userMonitorAssignment.upsert({
        where: {
          userId_monitorId: {
            userId: user.id,
            monitorId: monitor.id,
          },
        },
        create: {
          userId: user.id,
          monitorId: monitor.id,
          status: "ACTIVE",
          notes: notes || "Assigned by system administrator.",
          assignedBy: adminName,
        },
        update: {
          status: "ACTIVE",
          notes: notes || "Re-activated assignment.",
          assignedBy: adminName,
        },
      });

      // Update trainerSync on user
      await prisma.user.update({
        where: { id: user.id },
        data: { trainerSync: true },
      });

      // Log to AssignmentHistory
      await prisma.assignmentHistory.create({
        data: {
          userId: user.id,
          userName: user.name,
          monitorId: monitor.id,
          monitorName: monitor.user.name,
          action: existingAssignment ? "REASSIGNED" : "ASSIGNED",
          performedBy: adminName,
          details: `Assigned to ${monitor.user.name} (${monitor.monitorId})`,
        },
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          actorId: "admin",
          actorName: adminName,
          actorRole: "ADMIN",
          targetUserId: user.id,
          action: "ASSIGN_MONITOR",
          fieldName: "Assigned Monitor",
          previousValue: existingAssignment?.monitor?.user?.name || "Unassigned",
          newValue: `${monitor.user.name} (${monitor.monitorId})`,
          notes: notes || "Admin assigned athlete to monitor.",
        },
      });

      return NextResponse.json({ success: true, assignment });
    }

    // 2. REMOVE / REVOKE ASSIGNMENT
    if (action === "REMOVE") {
      const activeAssignment = await prisma.userMonitorAssignment.findFirst({
        where: { userId: userId, status: "ACTIVE" },
        include: { monitor: { include: { user: true } } },
      });

      if (activeAssignment) {
        await prisma.userMonitorAssignment.update({
          where: { id: activeAssignment.id },
          data: { status: "REVOKED" },
        });

        await prisma.assignmentHistory.create({
          data: {
            userId: user.id,
            userName: user.name,
            monitorId: activeAssignment.monitorId,
            monitorName: activeAssignment.monitor.user.name,
            action: "REMOVED",
            performedBy: adminName,
            details: `Removed assignment with ${activeAssignment.monitor.user.name}`,
          },
        });

        await prisma.auditLog.create({
          data: {
            actorId: "admin",
            actorName: adminName,
            actorRole: "ADMIN",
            targetUserId: user.id,
            action: "ASSIGN_MONITOR",
            fieldName: "Assigned Monitor",
            previousValue: activeAssignment.monitor.user.name,
            newValue: "Unassigned",
            notes: "Admin revoked monitor assignment.",
          },
        });
      }

      return NextResponse.json({ success: true, message: "Assignment removed" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin assignment POST error:", error);
    return NextResponse.json({ error: error.message || "Failed to process assignment" }, { status: 500 });
  }
}
