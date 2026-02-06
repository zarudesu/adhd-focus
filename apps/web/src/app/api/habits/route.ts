// ADHD Focus - Habits API
// GET /api/habits - Get user's habits
// POST /api/habits - Create a new habit

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/mobile-auth";
import { db, users } from "@/db";
import { habits } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { z } from "zod";
import { logError } from "@/lib/logger";

const createHabitSchema = z.object({
  name: z.string().min(1).max(200),
  emoji: z.string().optional(),
  description: z.string().max(1000).optional(),
  frequency: z.enum(["daily", "weekdays", "weekends", "custom"]).optional(),
  customDays: z.array(z.number().min(0).max(6)).optional(), // 0=Sunday, 6=Saturday
  timeOfDay: z.enum(["morning", "afternoon", "evening", "night", "anytime"]).optional(),
  color: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userHabits = await db
      .select()
      .from(habits)
      .where(and(
        eq(habits.userId, user.id),
        eq(habits.isArchived, false)
      ))
      .orderBy(asc(habits.sortOrder), asc(habits.createdAt));

    return NextResponse.json(userHabits);
  } catch (error) {
    logError("GET /api/habits", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = createHabitSchema.parse(body);

    // Get max sortOrder for user
    const existingHabits = await db
      .select({ sortOrder: habits.sortOrder })
      .from(habits)
      .where(eq(habits.userId, user.id))
      .orderBy(asc(habits.sortOrder));

    const maxSortOrder = existingHabits.length > 0
      ? Math.max(...existingHabits.map(h => h.sortOrder ?? 0))
      : 0;

    const [newHabit] = await db
      .insert(habits)
      .values({
        userId: user.id,
        name: data.name,
        emoji: data.emoji || "✅",
        description: data.description,
        frequency: data.frequency || "daily",
        customDays: data.customDays,
        timeOfDay: data.timeOfDay || "anytime",
        color: data.color,
        sortOrder: maxSortOrder + 1,
      })
      .returning();

    // Update user's habits created count
    await db
      .update(users)
      .set({
        habitsCreated: (await db.select({ count: users.habitsCreated }).from(users).where(eq(users.id, user.id)))[0].count! + 1,
      })
      .where(eq(users.id, user.id));

    return NextResponse.json(newHabit, { status: 201 });
  } catch (error) {
    logError("POST /api/habits", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
