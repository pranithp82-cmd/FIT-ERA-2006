import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUserFromRequest } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const sessionUser = getAuthUserFromRequest(req);

    if (!sessionUser) {
      // Fallback: If no session cookie exists yet, look up default user Pranith A
      let defaultUser = await prisma.user.findFirst({
        where: { email: "pranithp82@gmail.com" },
        include: { monitorProfile: true },
      });

      if (!defaultUser) {
        defaultUser = await prisma.user.findFirst({
          where: { role: "USER" },
          include: { monitorProfile: true },
        });
      }

      if (defaultUser) {
        return NextResponse.json({
          user: {
            id: defaultUser.id,
            email: defaultUser.email,
            name: defaultUser.name,
            role: defaultUser.role,
            avatar: defaultUser.avatar,
            monitorId: defaultUser.monitorProfile?.monitorId || null,
            status: defaultUser.status,
            age: defaultUser.age,
            gender: defaultUser.gender,
            heightCm: defaultUser.heightCm,
            weightKg: defaultUser.weightKg,
            goal: defaultUser.goal,
            bloodType: defaultUser.bloodType,
          },
        });
      }

      return NextResponse.json({ user: null });
    }

    const freshUser = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      include: {
        monitorProfile: true,
      },
    });

    if (!freshUser || freshUser.status === "INACTIVE") {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: freshUser.id,
        email: freshUser.email,
        name: freshUser.name,
        role: freshUser.role,
        avatar: freshUser.avatar,
        monitorId: freshUser.monitorProfile?.monitorId || null,
        status: freshUser.status,
        age: freshUser.age,
        gender: freshUser.gender,
        heightCm: freshUser.heightCm,
        weightKg: freshUser.weightKg,
        goal: freshUser.goal,
        bloodType: freshUser.bloodType,
        phone: freshUser.phone,
        specialization: freshUser.monitorProfile?.specialization || null,
        experienceYears: freshUser.monitorProfile?.experienceYears || null,
      },
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json({ user: null });
  }
}
