// ADHD Focus - Profile API
// GET /api/profile - Get current user profile
// PATCH /api/profile - Update profile

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/mobile-auth";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import type { UserPreferences } from "@/db/schema";
import { logError } from "@/lib/logger";

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  preferences: z.object({
    defaultPomodoroMinutes: z.number().min(1).max(120).optional(),
    defaultBreakMinutes: z.number().min(1).max(60).optional(),
    longBreakMinutes: z.number().min(1).max(60).optional(),
    pomodorosUntilLongBreak: z.number().min(1).max(10).optional(),
    maxDailyTasks: z.number().min(1).max(20).optional(),
    showOnlyOneTask: z.boolean().optional(),
    autoScheduleOverdue: z.boolean().optional(),
    morningPlanningReminder: z.boolean().optional(),
    highEnergyHours: z.array(z.number().min(0).max(23)).optional(),
    enableNotifications: z.boolean().optional(),
    notificationSound: z.boolean().optional(),
    theme: z.enum(["light", "dark", "system"]).optional(),
    timezone: z.string().optional(),
    defaultLandingPage: z.enum(["inbox", "today", "scheduled", "projects", "completed"]).optional(),
  }).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [profile] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        preferences: users.preferences,
        currentStreak: users.currentStreak,
        longestStreak: users.longestStreak,
        totalTasksCompleted: users.totalTasksCompleted,
        totalPomodoros: users.totalPomodoros,
        totalFocusMinutes: users.totalFocusMinutes,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, user.id));

    if (!profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(profile);
  } catch (error) {
    logError("GET /api/profile", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = updateProfileSchema.parse(body);

    // Get current user to merge preferences
    const [currentUser] = await db
      .select({ preferences: users.preferences })
      .from(users)
      .where(eq(users.id, user.id));

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    if (data.preferences) {
      // Merge new preferences with existing
      const currentPrefs = (currentUser.preferences || {}) as UserPreferences;
      updateData.preferences = {
        ...currentPrefs,
        ...data.preferences,
      };
    }

    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, user.id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        image: users.image,
        preferences: users.preferences,
        currentStreak: users.currentStreak,
        longestStreak: users.longestStreak,
        totalTasksCompleted: users.totalTasksCompleted,
        totalPomodoros: users.totalPomodoros,
        totalFocusMinutes: users.totalFocusMinutes,
        createdAt: users.createdAt,
      });

    return NextResponse.json(updatedUser);
  } catch (error) {
    logError("PATCH /api/profile", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
