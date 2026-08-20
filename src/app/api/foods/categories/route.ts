import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const rawCategories = await prisma.food.groupBy({
      by: ["category"],
      _count: {
        _all: true,
      },
      orderBy: {
        category: "asc",
      },
    });

    const categories = rawCategories.map((c) => ({
      name: c.category,
      count: c._count._all,
    }));

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Failed to fetch food categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories", details: String(error) },
      { status: 500 }
    );
  }
}
