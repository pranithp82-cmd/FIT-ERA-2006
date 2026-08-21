import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, signAuthToken, AuthSessionUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      name,
      email,
      password,
      phone,
      avatar,
      specialization,
      experienceYears,
      monitorId,
    } = data;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check existing
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const assignedMonitorId = monitorId
      ? monitorId.toUpperCase().trim()
      : `ERA-MON-${Math.floor(1000 + Math.random() * 9000)}`;

    const passwordHash = hashPassword(password);

    // Create user and monitor profile transaction
    const user = await prisma.user.create({
      data: {
        name,
        email: cleanEmail,
        passwordHash,
        role: "MONITOR",
        phone: phone || null,
        avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${assignedMonitorId}`,
        status: "ACTIVE",
        monitorProfile: {
          create: {
            monitorId: assignedMonitorId,
            specialization: specialization || "Sports Conditioning & Biomechanics",
            experienceYears: experienceYears ? Number(experienceYears) : 3,
            status: "ACTIVE",
          },
        },
      },
      include: {
        monitorProfile: true,
      },
    });

    const authUser: AuthSessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: "MONITOR",
      avatar: user.avatar,
      monitorId: user.monitorProfile?.monitorId || assignedMonitorId,
      status: user.status,
    };

    const token = signAuthToken(authUser);

    const response = NextResponse.json({
      success: true,
      user: authUser,
      redirectUrl: "/monitor/users",
    });

    response.cookies.set("erafit_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Monitor registration error:", error);
    return NextResponse.json({ error: error.message || "Failed to register monitor" }, { status: 500 });
  }
}
