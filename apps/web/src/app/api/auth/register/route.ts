// ADHD Focus - User Registration API
// POST /api/auth/register - Create new user
// Rate limiting handled by middleware.ts

import { NextRequest, NextResponse } from "next/server";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { hash } from "bcryptjs";
import { logError } from "@/lib/logger";

// Registration schema
const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export type RegisterResult =
  | { success: true; user: { id: string; email: string } }
  | { success: false; error: string };

/**
 * Shared registration logic - can be called directly from server actions
 */
export async function registerUser(input: RegisterInput): Promise<RegisterResult> {
  // Validate input
  const parseResult = registerSchema.safeParse(input);
  if (!parseResult.success) {
    return { success: false, error: parseResult.error.issues[0]?.message || "Invalid data" };
  }
  const data = parseResult.data;

  // Check if user already exists
  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);

  if (existingUser) {
    return { success: false, error: "User with this email already exists" };
  }

  // Hash password
  const passwordHash = await hash(data.password, 12);

  // Create user
  const [newUser] = await db
    .insert(users)
    .values({
      email: data.email,
      name: data.name,
      passwordHash,
    })
    .returning();

  return { success: true, user: { id: newUser.id, email: newUser.email! } };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await registerUser(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        message: "User created successfully",
        user: result.user
      },
      { status: 201 }
    );
  } catch (error) {
    logError("POST /api/auth/register", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
