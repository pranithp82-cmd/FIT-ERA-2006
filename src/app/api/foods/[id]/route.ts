import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const food = await prisma.food.findFirst({
      where: {
        OR: [{ id }, { foodId: id }],
      },
    });

    if (!food) {
      return NextResponse.json({ error: "Food item not found" }, { status: 404 });
    }

    return NextResponse.json({ food });
  } catch (error) {
    console.error("Failed to fetch food details:", error);
    return NextResponse.json(
      { error: "Failed to fetch food details", details: String(error) },
      { status: 500 }
    );
  }
}
