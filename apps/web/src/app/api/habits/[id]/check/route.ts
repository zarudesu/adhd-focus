// ADHD Focus - Habit Check API
// POST /api/habits/[id]/check - Check/complete a habit for a date
// DELETE /api/habits/[id]/check - Uncheck a habit for a date

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, users } from "@/db";
import { habits, habitChecks } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { z } from "zod";
import { logError } from "@/lib/logger";
import { awardXP } from "@/lib/gamification-server";

// XP rewards for habits
const HABIT_XP = 5; // XP per habit
const ALL_HABITS_BONUS_XP = 20; // Bonus XP when all habits are completed

const checkHabitSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
  skipped: z.boolean().optional(),
  reflection: z.string().max(1000).optional(),
  blockers: z.array(z.string()).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const data = checkHabitSchema.parse(body);

    // Verify habit ownership
    const [habit] = await db
      .select()
      .from(habits)
      .where(and(
        eq(habits.id, id),
        eq(habits.userId, session.user.id)
      ));

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    // Check if already checked for this date
    const [existing] = await db
      .select()
      .from(habitChecks)
      .where(and(
        eq(habitChecks.habitId, id),
        eq(habitChecks.userId, session.user.id),
        eq(habitChecks.date, data.date)
      ));

    if (existing) {
      return NextResponse.json({ error: "Habit already checked for this date" }, { status: 400 });
    }

    // Calculate XP (no XP for skipped habits)
    const xpAwarded = data.skipped ? 0 : HABIT_XP;

    // Create the check
    const [check] = await db
      .insert(habitChecks)
      .values({
        habitId: id,
        userId: session.user.id,
        date: data.date,
        skipped: data.skipped || false,
        reflection: data.reflection,
        blockers: data.blockers,
        xpAwarded,
      })
      .returning();

    // Update habit stats (only if not skipped)
    if (!data.skipped) {
      await db
        .update(habits)
        .set({
          totalCompletions: sql`${habits.totalCompletions} + 1`,
          currentStreak: sql`${habits.currentStreak} + 1`,
          longestStreak: sql`GREATEST(${habits.longestStreak}, ${habits.currentStreak} + 1)`,
        })
        .where(eq(habits.id, id));

      // Update user's total habit completions
      await db
        .update(users)
        .set({
          habitsCompleted: sql`${users.habitsCompleted} + 1`,
        })
        .where(eq(users.id, session.user.id));
    }

    // Check if all habits for today are done
    let allHabitsDone = false;
    let bonusXpAwarded = 0;

    if (!data.skipped) {
      // Get all non-archived habits for user
      const allUserHabits = await db
        .select({ id: habits.id })
        .from(habits)
        .where(and(
          eq(habits.userId, session.user.id),
          eq(habits.isArchived, false)
        ));

      // Get all checks for today
      const todayChecks = await db
        .select({ habitId: habitChecks.habitId, skipped: habitChecks.skipped })
        .from(habitChecks)
        .where(and(
          eq(habitChecks.userId, session.user.id),
          eq(habitChecks.date, data.date)
        ));

      const completedHabitIds = new Set(
        todayChecks
          .filter(c => !c.skipped)
          .map(c => c.habitId)
      );

      allHabitsDone = allUserHabits.every(h => completedHabitIds.has(h.id));

      if (allHabitsDone) {
        bonusXpAwarded = ALL_HABITS_BONUS_XP;

        // Update user's all habits completed days count
        await db
          .update(users)
          .set({
            allHabitsCompletedDays: sql`${users.allHabitsCompletedDays} + 1`,
            habitStreak: sql`${users.habitStreak} + 1`,
            longestHabitStreak: sql`GREATEST(${users.longestHabitStreak}, ${users.habitStreak} + 1)`,
          })
          .where(eq(users.id, session.user.id));
      }
    }

    // Award XP
    const totalXp = xpAwarded + bonusXpAwarded;
    let levelUp = null;
    let newLevel = null;

    if (totalXp > 0) {
      const xpResult = await awardXP(session.user.id, totalXp, "habit_complete");
      levelUp = xpResult.levelUp;
      newLevel = xpResult.newLevel;
    }

    return NextResponse.json({
      check,
      xpAwarded: totalXp,
      habitXp: xpAwarded,
      bonusXp: bonusXpAwarded,
      allHabitsDone,
      levelUp,
      newLevel,
    }, { status: 201 });
  } catch (error) {
    logError("POST /api/habits/[id]/check", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
      return NextResponse.json({ error: "Date parameter required" }, { status: 400 });
    }

    // Get the check to see if it was completed (not skipped)
    const [existing] = await db
      .select()
      .from(habitChecks)
      .where(and(
        eq(habitChecks.habitId, id),
        eq(habitChecks.userId, session.user.id),
        eq(habitChecks.date, date)
      ));

    if (!existing) {
      return NextResponse.json({ error: "Check not found" }, { status: 404 });
    }

    // Delete the check
    await db
      .delete(habitChecks)
      .where(and(
        eq(habitChecks.habitId, id),
        eq(habitChecks.userId, session.user.id),
        eq(habitChecks.date, date)
      ));

    // If it was a completion (not skipped), decrement stats
    if (!existing.skipped) {
      await db
        .update(habits)
        .set({
          totalCompletions: sql`GREATEST(${habits.totalCompletions} - 1, 0)`,
          // Note: We don't decrement streak here as it's complex to recalculate
        })
        .where(eq(habits.id, id));

      await db
        .update(users)
        .set({
          habitsCompleted: sql`GREATEST(${users.habitsCompleted} - 1, 0)`,
        })
        .where(eq(users.id, session.user.id));

      // Note: XP is not removed - once earned, it stays
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("DELETE /api/habits/[id]/check", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
