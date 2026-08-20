import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const workouts = await prisma.workout.findMany({
      where: { userId: user.id },
      orderBy: { startTime: 'desc' },
      include: {
        sets: {
          include: { exercise: true }
        }
      }
    });

    return NextResponse.json(workouts);
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return NextResponse.json({ error: 'Failed to fetch workouts' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const user = await prisma.user.findFirst();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // data structure expected:
    // { name: "Push Day", durationMin: 45, exercises: [{ name: "Bench Press", category: "Chest", sets: [{reps: 10, weight: 60, completed: true}] }] }

    const workout = await prisma.workout.create({
      data: {
        userId: user.id,
        name: data.name || "Custom Workout",
        durationMin: data.durationMin || 0,
        endTime: new Date(),
      }
    });

    // For each exercise, find or create the exercise, then add sets
    for (const ex of data.exercises || []) {
      let exerciseRecord = await prisma.exercise.findFirst({
        where: { name: ex.name }
      });
      if (!exerciseRecord) {
        exerciseRecord = await prisma.exercise.create({
          data: {
            name: ex.name,
            category: ex.category || "General",
          }
        });
      }

      for (const set of ex.sets || []) {
        if (set.completed) {
          await prisma.workoutSet.create({
            data: {
              workoutId: workout.id,
              exerciseId: exerciseRecord.id,
              setNumber: set.setNumber || 1,
              reps: set.reps,
              weight: set.weightKg || set.weight || 0,
              completed: true,
            }
          });
        }
      }
    }

    return NextResponse.json({ success: true, workoutId: workout.id });
  } catch (error) {
    console.error('Error saving workout:', error);
    return NextResponse.json({ error: 'Failed to save workout' }, { status: 500 });
  }
}
