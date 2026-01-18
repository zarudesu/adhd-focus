// ADHD Focus - Daily Review API
// GET /api/habits/review - Check if review is needed (yesterday not reviewed)
// POST /api/habits/review - Submit daily review

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, users } from "@/db";
import { dailyReviews, habitChecks, tasks, habits } from "@/db/schema";
import { eq, and, sql, inArray } from "drizzle-orm";
import { z } from "zod";
import { logError } from "@/lib/logger";

// Get yesterday's date in YYYY-MM-DD format
function getYesterdayDate(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split("T")[0];
}

const reviewSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  tasksCompleted: z.number().min(0).optional(),
  tasksSkipped: z.number().min(0).optional(),
  habitsCompleted: z.number().min(0).optional(),
  habitsSkipped: z.number().min(0).optional(),
  mood: z.enum(["great", "good", "okay", "bad", "terrible"]).optional(),
  notes: z.string().max(2000).optional(),
  lessonsLearned: z.string().max(2000).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const targetDate = dateParam || getYesterdayDate();

    // Check if user already reviewed this date
    const [existingReview] = await db
      .select()
      .from(dailyReviews)
      .where(and(
        eq(dailyReviews.userId, session.user.id),
        eq(dailyReviews.date, targetDate)
      ));

    if (existingReview) {
      return NextResponse.json({
        needsReview: false,
        yesterdayDate: targetDate,
        habits: [],
        existingReview,
      });
    }

    // Get user's active habits
    const userHabits = await db
      .select({
        id: habits.id,
        name: habits.name,
        emoji: habits.emoji,
      })
      .from(habits)
      .where(and(
        eq(habits.userId, session.user.id),
        eq(habits.isArchived, false)
      ));

    if (userHabits.length === 0) {
      return NextResponse.json({
        needsReview: false,
        yesterdayDate: targetDate,
        habits: [],
      });
    }

    // Get checks for the target date
    const checks = await db
      .select({
        habitId: habitChecks.habitId,
        skipped: habitChecks.skipped,
      })
      .from(habitChecks)
      .where(and(
        eq(habitChecks.userId, session.user.id),
        eq(habitChecks.date, targetDate),
        inArray(habitChecks.habitId, userHabits.map(h => h.id))
      ));

    const checkMap = new Map(checks.map(c => [c.habitId, c]));

    // Build habits list with their status
    const habitsWithStatus = userHabits.map(habit => {
      const check = checkMap.get(habit.id);
      return {
        id: habit.id,
        name: habit.name,
        emoji: habit.emoji,
        isCompleted: check ? !check.skipped : false,
        isSkipped: check?.skipped || false,
      };
    });

    // Only need review if there are unchecked habits
    const hasUncheckedHabits = habitsWithStatus.some(h => !h.isCompleted && !h.isSkipped);

    return NextResponse.json({
      needsReview: hasUncheckedHabits,
      yesterdayDate: targetDate,
      habits: habitsWithStatus,
    });
  } catch (error) {
    logError("GET /api/habits/review", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = reviewSchema.parse(body);

    // Check if already reviewed
    const [existing] = await db
      .select()
      .from(dailyReviews)
      .where(and(
        eq(dailyReviews.userId, session.user.id),
        eq(dailyReviews.date, data.date)
      ));

    if (existing) {
      // Update existing review
      const [updated] = await db
        .update(dailyReviews)
        .set({
          tasksCompleted: data.tasksCompleted,
          tasksSkipped: data.tasksSkipped,
          habitsCompleted: data.habitsCompleted,
          habitsSkipped: data.habitsSkipped,
          mood: data.mood,
          notes: data.notes,
          lessonsLearned: data.lessonsLearned,
          reviewedAt: new Date(),
        })
        .where(eq(dailyReviews.id, existing.id))
        .returning();

      return NextResponse.json(updated);
    }

    // Create new review
    const [review] = await db
      .insert(dailyReviews)
      .values({
        userId: session.user.id,
        date: data.date,
        tasksCompleted: data.tasksCompleted || 0,
        tasksSkipped: data.tasksSkipped || 0,
        habitsCompleted: data.habitsCompleted || 0,
        habitsSkipped: data.habitsSkipped || 0,
        mood: data.mood,
        notes: data.notes,
        lessonsLearned: data.lessonsLearned,
      })
      .returning();

    // Update user's last review date
    await db
      .update(users)
      .set({
        lastReviewDate: data.date,
      })
      .where(eq(users.id, session.user.id));

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    logError("POST /api/habits/review", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
