// Verify Credentials API
// POST /api/auth/verify-credentials
// Used for re-authentication when unlocking sensitive features

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";
import { compare } from "bcryptjs";
import { z } from "zod";
import { logError } from "@/lib/logger";

const verifySchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export async function POST(request: NextRequest) {
  try {
    // Must be authenticated
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = verifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { password } = parsed.data;

    // Get user with password hash
    const [user] = await db
      .select({ passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user?.passwordHash) {
      // User logged in via OAuth, no password
      return NextResponse.json(
        { error: "Password authentication not available for this account" },
        { status: 400 }
      );
    }

    // Verify password
    const valid = await compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 401 }
      );
    }

    // Mark user as verified (for future email verification feature)
    await db
      .update(users)
      .set({
        onboardingCompleted: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("POST /api/auth/verify-credentials", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
