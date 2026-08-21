import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getAuthUserFromRequest } from "@/lib/auth";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: targetUserId } = await params;
    const body = await req.json();
    const { actionType, payload, auditNote } = body;

    const authUser = getAuthUserFromRequest(req);

    // Identify Actor
    let actorId = authUser?.id || "ERA-MON-8942";
    let actorName = authUser?.name || "Marcus Vance (Monitor)";
    let actorRole = authUser?.role || "MONITOR";

    // Validate target user exists
    let targetUser = null;
    if (targetUserId === "current") {
      targetUser = await prisma.user.findFirst({
        where: { role: "USER" },
      });
    } else {
      targetUser = await prisma.user.findUnique({
        where: { id: targetUserId },
      });
    }

    if (!targetUser) {
      targetUser = await prisma.user.findFirst({
        where: { role: "USER" },
      });
    }

    if (!targetUser) {
      return NextResponse.json({ error: "Target athlete not found" }, { status: 404 });
    }

    const resolvedUserId = targetUser.id;

    // 1. UPDATE WORKOUT PLAN
    if (actionType === "UPDATE_WORKOUT_PLAN") {
      const { title, exercises, notes } = payload;

      const previousPlan = await prisma.assignedWorkoutPlan.findFirst({
        where: { userId: resolvedUserId, active: true },
        orderBy: { createdAt: "desc" },
      });

      const previousExercisesCount = previousPlan
        ? JSON.parse(previousPlan.exercises || "[]").length
        : 0;

      // Deactivate older plans
      await prisma.assignedWorkoutPlan.updateMany({
        where: { userId: resolvedUserId },
        data: { active: false },
      });

      // Create new plan
      const newPlan = await prisma.assignedWorkoutPlan.create({
        data: {
          userId: resolvedUserId,
          title: title || "Monitor Assigned Protocol",
          notes: notes || "",
          exercises: JSON.stringify(exercises || []),
          assignedBy: actorId,
          assignedByName: actorName,
          active: true,
        },
      });

      // Write Audit Log
      await prisma.auditLog.create({
        data: {
          actorId,
          actorName,
          actorRole,
          targetUserId: resolvedUserId,
          action: "UPDATE_WORKOUT",
          fieldName: "Assigned Workout Plan",
          previousValue: `${previousPlan?.title || "None"} (${previousExercisesCount} movements)`,
          newValue: `${newPlan.title} (${exercises.length} movements)`,
          notes: auditNote || notes || "Monitor updated workout routines and exercise loading.",
        },
      });

      return NextResponse.json({ success: true, newPlan });
    }

    // 2. UPDATE DIET PLAN
    if (actionType === "UPDATE_DIET_PLAN") {
      const { title, targetCalories, targetProtein, targetCarbs, targetFat, meals, notes } = payload;

      const previousPlan = await prisma.assignedDietPlan.findFirst({
        where: { userId: resolvedUserId, active: true },
        orderBy: { createdAt: "desc" },
      });

      const previousCalories = previousPlan?.targetCalories || 2850;
      const previousProtein = previousPlan?.targetProtein || 150;

      // Deactivate older plans
      await prisma.assignedDietPlan.updateMany({
        where: { userId: resolvedUserId },
        data: { active: false },
      });

      // Create new plan
      const newPlan = await prisma.assignedDietPlan.create({
        data: {
          userId: resolvedUserId,
          title: title || "Monitor Target Nutrition Plan",
          targetCalories: Number(targetCalories) || 2850,
          targetProtein: Number(targetProtein) || 160,
          targetCarbs: Number(targetCarbs) || 300,
          targetFat: Number(targetFat) || 70,
          meals: JSON.stringify(meals || []),
          notes: notes || "",
          assignedBy: actorId,
          assignedByName: actorName,
          active: true,
        },
      });

      // Write Audit Log
      await prisma.auditLog.create({
        data: {
          actorId,
          actorName,
          actorRole,
          targetUserId: resolvedUserId,
          action: "UPDATE_DIET",
          fieldName: "Target Calories & Protein",
          previousValue: `${previousCalories} kcal • ${previousProtein}g Protein`,
          newValue: `${newPlan.targetCalories} kcal • ${newPlan.targetProtein}g Protein`,
          notes: auditNote || notes || "Monitor updated target macros and meal timing plan.",
        },
      });

      return NextResponse.json({ success: true, newPlan });
    }

    // 3. ADD MONITOR NOTE / TASK
    if (actionType === "ADD_NOTE") {
      const { title, content, category, isTask } = payload;

      // Find monitor profile
      const monitorProfile = await prisma.monitorProfile.findFirst();
      const mId = monitorProfile?.id || targetUserId;

      const note = await prisma.monitorNote.create({
        data: {
          userId: targetUserId,
          monitorId: mId,
          title: title || "Observation Note",
          content: content || "",
          category: category || "GENERAL",
          isTask: !!isTask,
          completed: false,
        },
      });

      // Write Audit Log
      await prisma.auditLog.create({
        data: {
          actorId,
          actorName,
          actorRole,
          targetUserId,
          action: "ADD_NOTE",
          fieldName: isTask ? "Monitor Action Task" : "Clinical Observation Note",
          previousValue: "None",
          newValue: title,
          notes: content,
        },
      });

      return NextResponse.json({ success: true, note });
    }

    // 4. TOGGLE TASK
    if (actionType === "TOGGLE_TASK") {
      const { taskId, completed } = payload;

      const note = await prisma.monitorNote.update({
        where: { id: taskId },
        data: { completed: !!completed },
      });

      // Write Audit Log
      await prisma.auditLog.create({
        data: {
          actorId,
          actorName,
          actorRole,
          targetUserId,
          action: "TOGGLE_TASK",
          fieldName: `Task: ${note.title}`,
          previousValue: completed ? "Pending" : "Completed",
          newValue: completed ? "Completed" : "Pending",
          notes: "Task completion status changed by monitor.",
        },
      });

      return NextResponse.json({ success: true, note });
    }

    // 5. UPDATE ATHLETE GOAL
    if (actionType === "UPDATE_GOAL") {
      const { goal } = payload;
      const previousGoal = targetUser.goal || "None";

      const updatedUser = await prisma.user.update({
        where: { id: targetUserId },
        data: { goal },
      });

      // Write Audit Log
      await prisma.auditLog.create({
        data: {
          actorId,
          actorName,
          actorRole,
          targetUserId,
          action: "UPDATE_GOAL",
          fieldName: "Athletic Goal",
          previousValue: previousGoal,
          newValue: goal,
          notes: auditNote || "Goal updated following diagnostic review.",
        },
      });

      return NextResponse.json({ success: true, user: updatedUser });
    }

    return NextResponse.json({ error: "Invalid action type" }, { status: 400 });
  } catch (error: any) {
    console.error("Monitor edit action error:", error);
    return NextResponse.json({ error: error.message || "Failed to process edit" }, { status: 500 });
  }
}
