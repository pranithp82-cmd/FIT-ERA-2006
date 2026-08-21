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
      age,
      gender,
      heightCm,
      weightKg,
      goal,
      bloodType,
    } = data;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check existing
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const passwordHash = hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email: cleanEmail,
        passwordHash,
        role: "USER",
        phone: phone || null,
        avatar: avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanEmail}`,
        age: age ? Number(age) : null,
        gender: gender || "Other",
        heightCm: heightCm ? Number(heightCm) : null,
        weightKg: weightKg ? Number(weightKg) : null,
        goal: goal || "General Health & Longevity",
        bloodType: bloodType || "O+ Positive",
        status: "ACTIVE",
        trainerSync: true,
      },
    });

    const authUser: AuthSessionUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: "USER",
      avatar: user.avatar,
      monitorId: null,
      status: user.status,
    };

    const token = signAuthToken(authUser);

    const response = NextResponse.json({
      success: true,
      user: authUser,
      redirectUrl: "/",
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
    console.error("User registration error:", error);
    return NextResponse.json({ error: error.message || "Failed to register user" }, { status: 500 });
  }
}
