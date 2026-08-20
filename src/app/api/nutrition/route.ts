import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const logs = await prisma.foodLog.findMany({
      where: {
        userId: user.id,
        logDate: { gte: today },
      },
      include: { food: true },
      orderBy: { logDate: 'desc' }
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching nutrition logs:', error);
    return NextResponse.json({ error: 'Failed to fetch nutrition logs' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    let food = await prisma.food.findFirst({ where: { name: data.name } });
    
    if (!food) {
      food = await prisma.food.create({
        data: {
          name: data.name,
          calories: data.calories,
          protein: data.protein,
          carbs: data.carbs,
          fat: data.fats || data.fat || 0,
          fiber: data.fiber || 0,
          servingSize: data.servingSize || "1 serving"
        }
      });
    }

    const newLog = await prisma.foodLog.create({
      data: {
        userId: user.id,
        foodId: food.id,
        mealType: data.mealType || "Snack",
        quantity: 1,
      },
      include: { food: true }
    });

    return NextResponse.json(newLog);
  } catch (error) {
    console.error('Error saving food log:', error);
    return NextResponse.json({ error: 'Failed to save food log' }, { status: 500 });
  }
}
