import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const monitors = await prisma.monitorProfile.findMany({
      include: {
        user: true,
        assignments: {
          where: { status: "ACTIVE" },
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = monitors.map((m) => ({
      id: m.id,
      userId: m.userId,
      monitorId: m.monitorId,
      name: m.user.name,
      email: m.user.email,
      avatar: m.user.avatar,
      phone: m.user.phone,
      specialization: m.specialization,
      experienceYears: m.experienceYears,
      status: m.status,
      assignedCount: m.assignments.length,
      assignedUsers: m.assignments.map((a) => ({
        id: a.user.id,
        name: a.user.name,
        email: a.user.email,
      })),
      createdAt: m.createdAt,
    }));

    return NextResponse.json({ monitors: formatted });
  } catch (error: any) {
    console.error("Admin monitors API error:", error);
    return NextResponse.json({ error: error.message || "Failed to load monitors" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { monitorProfileId, status } = await req.json();
    if (!monitorProfileId || !status) {
      return NextResponse.json({ error: "monitorProfileId and status are required" }, { status: 400 });
    }

    const updated = await prisma.monitorProfile.update({
      where: { id: monitorProfileId },
      data: { status },
    });

    return NextResponse.json({ success: true, monitor: updated });
  } catch (error: any) {
    console.error("Admin monitor status update error:", error);
    return NextResponse.json({ error: error.message || "Failed to update monitor status" }, { status: 500 });
  }
}
