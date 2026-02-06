// Mobile Auth - Register
// POST /api/mobile/auth/register
// Creates account and returns JWT token (mirrors /api/mobile/auth/login response)

import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/app/api/auth/register/route";
import { db } from "@/db";
import { users, type UserPreferences } from "@/db/schema";
import { eq } from "drizzle-orm";
import { SignJWT } from "jose";
import { logError } from "@/lib/logger";

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "fallback-secret-change-me"
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Use shared registration logic
    const result = await registerUser({
      email: body.email,
      password: body.password,
      name: body.name,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // Fetch the created user for full response
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, result.user.id))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "User creation failed" },
        { status: 500 }
      );
    }

    // Generate JWT token (same as login)
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(JWT_SECRET);

    const prefs = (user.preferences ?? {}) as Partial<UserPreferences>;

    return NextResponse.json(
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          level: user.level ?? 1,
          xp: user.xp ?? 0,
          currentStreak: user.currentStreak ?? 0,
          longestStreak: user.longestStreak ?? 0,
          totalTasksCompleted: user.totalTasksCompleted ?? 0,
          pomodoroWorkMinutes: prefs.defaultPomodoroMinutes ?? 25,
          pomodoroShortBreak: prefs.defaultBreakMinutes ?? 5,
          pomodoroLongBreak: prefs.longBreakMinutes ?? 15,
          wipLimit: prefs.maxDailyTasks ?? 3,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    logError("POST /api/mobile/auth/register", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
