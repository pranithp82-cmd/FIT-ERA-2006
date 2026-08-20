import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category")?.trim() || "";
    const vegetarianParam = searchParams.get("vegetarian");
    const veganParam = searchParams.get("vegan");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const sortBy = searchParams.get("sortBy") || "name";
    const sortOrder = searchParams.get("sortOrder") === "desc" ? "desc" : "asc";

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { foodId: { contains: search } },
        { category: { contains: search } },
      ];
    }

    if (category && category !== "All") {
      where.category = category;
    }

    if (vegetarianParam === "true") {
      where.vegetarian = true;
    }

    if (veganParam === "true") {
      where.vegan = true;
    }

    const skip = (page - 1) * limit;

    // Allowed sort fields
    const validSortFields = ["name", "calories", "protein", "carbs", "fat", "createdAt"];
    const orderByField = validSortFields.includes(sortBy) ? sortBy : "name";

    const [total, foods] = await Promise.all([
      prisma.food.count({ where }),
      prisma.food.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [orderByField]: sortOrder },
      }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      foods,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error("Food search API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch foods", details: String(error) },
      { status: 500 }
    );
  }
}
