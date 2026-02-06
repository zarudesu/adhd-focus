// ADHD Focus - Today's Habits API
// GET /api/habits/today - Get habits with today's check status

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/mobile-auth";
import { db } from "@/db";
import { habits, habitChecks } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { logError } from "@/lib/logger";

// Get today's date in YYYY-MM-DD format
function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

// Check if habit should be done today based on frequency
function shouldDoToday(habit: {
  frequency: string | null;
  customDays: number[] | null;
}): boolean {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Sunday, 6=Saturday

  switch (habit.frequency) {
    case "daily":
      return true;
    case "weekdays":
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    case "weekends":
      return dayOfWeek === 0 || dayOfWeek === 6;
    case "custom":
      return habit.customDays?.includes(dayOfWeek) ?? false;
    default:
      return true;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || getTodayDate();

    // Get all active habits
    const userHabits = await db
      .select()
      .from(habits)
      .where(and(
        eq(habits.userId, user.id),
        eq(habits.isArchived, false)
      ))
      .orderBy(asc(habits.sortOrder), asc(habits.createdAt));

    // Get checks for the specified date
    const checks = await db
      .select()
      .from(habitChecks)
      .where(and(
        eq(habitChecks.userId, user.id),
        eq(habitChecks.date, date)
      ));

    const checksMap = new Map(checks.map(c => [c.habitId, c]));

    // Build response with check status
    const habitsWithStatus = userHabits.map(habit => ({
      ...habit,
      shouldDoToday: shouldDoToday(habit),
      todayCheck: checksMap.get(habit.id) || null,
      isCompleted: checksMap.has(habit.id) && !checksMap.get(habit.id)?.skipped,
      isSkipped: checksMap.get(habit.id)?.skipped || false,
    }));

    // Calculate summary
    const habitsForToday = habitsWithStatus.filter(h => h.shouldDoToday);
    const completedCount = habitsForToday.filter(h => h.isCompleted).length;
    const skippedCount = habitsForToday.filter(h => h.isSkipped).length;
    const totalForToday = habitsForToday.length;
    const allDone = totalForToday > 0 && completedCount === totalForToday;

    return NextResponse.json({
      habits: habitsWithStatus,
      summary: {
        totalHabits: userHabits.length,
        habitsForToday: totalForToday,
        completed: completedCount,
        skipped: skippedCount,
        remaining: totalForToday - completedCount - skippedCount,
        allDone,
        progress: totalForToday > 0 ? Math.round((completedCount / totalForToday) * 100) : 0,
      },
      date,
    });
  } catch (error) {
    logError("GET /api/habits/today", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
