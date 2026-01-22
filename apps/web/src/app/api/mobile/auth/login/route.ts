// Mobile Auth - Login
// POST /api/mobile/auth/login

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, type UserPreferences } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "fallback-secret-change-me"
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email or password format" },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;

    // Find user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user?.passwordHash) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = await new SignJWT({
      userId: user.id,
      email: user.email
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(JWT_SECRET);

    // Extract preferences (with defaults)
    const prefs = (user.preferences ?? {}) as Partial<UserPreferences>;

    return NextResponse.json({
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
        // Preferences
        pomodoroWorkMinutes: prefs.defaultPomodoroMinutes ?? 25,
        pomodoroShortBreak: prefs.defaultBreakMinutes ?? 5,
        pomodoroLongBreak: prefs.longBreakMinutes ?? 15,
        wipLimit: prefs.maxDailyTasks ?? 3,
      },
    });
  } catch (error) {
    console.error("Mobile login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
