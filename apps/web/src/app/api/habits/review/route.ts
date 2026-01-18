// ADHD Focus - Daily Review API
// GET /api/habits/review - Check if review is needed (yesterday not reviewed)
// POST /api/habits/review - Submit daily review

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, users } from "@/db";
import { dailyReviews, habitChecks, tasks } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
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

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const yesterday = getYesterdayDate();

    // Check if user already reviewed yesterday
    const [existingReview] = await db
      .select()
      .from(dailyReviews)
      .where(and(
        eq(dailyReviews.userId, session.user.id),
        eq(dailyReviews.date, yesterday)
      ));

    if (existingReview) {
      return NextResponse.json({
        needsReview: false,
        date: yesterday,
        existingReview,
      });
    }

    // Get yesterday's stats to prefill the review
    const [yesterdayHabitChecks] = await db
      .select({
        completed: sql<number>`COUNT(*) FILTER (WHERE ${habitChecks.skipped} = false)`,
        skipped: sql<number>`COUNT(*) FILTER (WHERE ${habitChecks.skipped} = true)`,
      })
      .from(habitChecks)
      .where(and(
        eq(habitChecks.userId, session.user.id),
        eq(habitChecks.date, yesterday)
      ));

    const [yesterdayTasks] = await db
      .select({
        completed: sql<number>`COUNT(*) FILTER (WHERE ${tasks.status} = 'done' AND DATE(${tasks.completedAt}) = ${yesterday})`,
      })
      .from(tasks)
      .where(eq(tasks.userId, session.user.id));

    return NextResponse.json({
      needsReview: true,
      date: yesterday,
      suggestions: {
        habitsCompleted: Number(yesterdayHabitChecks?.completed || 0),
        habitsSkipped: Number(yesterdayHabitChecks?.skipped || 0),
        tasksCompleted: Number(yesterdayTasks?.completed || 0),
      },
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
