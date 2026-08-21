import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { role: "USER" },
      include: {
        assignedToMonitors: {
          include: {
            monitor: {
              include: { user: { select: { name: true, email: true } } },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = users.map((u) => {
      const activeAssignment = u.assignedToMonitors.find((a) => a.status === "ACTIVE");
      return {
        id: u.id,
        name: u.name,
        email: u.email,
        avatar: u.avatar,
        phone: u.phone,
        age: u.age,
        gender: u.gender,
        goal: u.goal,
        weightKg: u.weightKg,
        heightCm: u.heightCm,
        status: u.status,
        createdAt: u.createdAt,
        assignedMonitor: activeAssignment
          ? {
              id: activeAssignment.monitor.id,
              monitorId: activeAssignment.monitor.monitorId,
              name: activeAssignment.monitor.user.name,
              email: activeAssignment.monitor.user.email,
            }
          : null,
      };
    });

    return NextResponse.json({ users: formatted });
  } catch (error: any) {
    console.error("Admin users API error:", error);
    return NextResponse.json({ error: error.message || "Failed to load users" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId, status } = await req.json();
    if (!userId || !status) {
      return NextResponse.json({ error: "userId and status are required" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { status },
    });

    await prisma.auditLog.create({
      data: {
        actorId: "admin",
        actorName: "System Administrator",
        actorRole: "ADMIN",
        targetUserId: userId,
        action: "STATUS_CHANGE",
        fieldName: "Account Status",
        previousValue: status === "ACTIVE" ? "INACTIVE" : "ACTIVE",
        newValue: status,
        notes: `User status changed to ${status}`,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    console.error("Admin user status error:", error);
    return NextResponse.json({ error: error.message || "Failed to update user status" }, { status: 500 });
  }
}
