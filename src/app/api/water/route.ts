import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const logs = await prisma.waterLog.findMany({
      where: {
        userId: user.id,
        logDate: { gte: today },
      },
    });

    const totalAmountMl = logs.reduce((sum, log) => sum + log.amountMl, 0);

    return NextResponse.json({ totalAmountMl, logs });
  } catch (error) {
    console.error('Error fetching water logs:', error);
    return NextResponse.json({ error: 'Failed to fetch water logs' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const newLog = await prisma.waterLog.create({
      data: {
        userId: user.id,
        amountMl: data.amountMl || 250,
      }
    });

    return NextResponse.json(newLog);
  } catch (error) {
    console.error('Error saving water log:', error);
    return NextResponse.json({ error: 'Failed to save water log' }, { status: 500 });
  }
}
