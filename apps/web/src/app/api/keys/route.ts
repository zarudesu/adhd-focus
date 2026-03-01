import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { apiKeys } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import crypto from "crypto";

function generateApiKey(): string {
  const random = crypto.randomBytes(32).toString("base64url");
  return `byr8_${random}`;
}

// GET /api/keys — list user's API keys
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keys = await db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      lastUsedAt: apiKeys.lastUsedAt,
      createdAt: apiKeys.createdAt,
      expiresAt: apiKeys.expiresAt,
      revoked: apiKeys.revoked,
    })
    .from(apiKeys)
    .where(
      and(eq(apiKeys.userId, session.user.id), eq(apiKeys.revoked, false))
    );

  return NextResponse.json(keys);
}

// POST /api/keys — create new API key
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (name.length > 100) {
    return NextResponse.json({ error: "Name too long (max 100)" }, { status: 400 });
  }

  // Limit to 10 active keys per user
  const existing = await db
    .select({ id: apiKeys.id })
    .from(apiKeys)
    .where(
      and(eq(apiKeys.userId, session.user.id), eq(apiKeys.revoked, false))
    );

  if (existing.length >= 10) {
    return NextResponse.json(
      { error: "Maximum 10 active API keys allowed" },
      { status: 400 }
    );
  }

  const rawKey = generateApiKey();
  const keyHash = await bcrypt.hash(rawKey, 10);
  const keyPrefix = rawKey.slice(0, 13); // "byr8_" + 8 chars

  const [created] = await db
    .insert(apiKeys)
    .values({
      userId: session.user.id,
      name,
      keyHash,
      keyPrefix,
    })
    .returning({
      id: apiKeys.id,
      name: apiKeys.name,
      keyPrefix: apiKeys.keyPrefix,
      createdAt: apiKeys.createdAt,
    });

  return NextResponse.json({
    ...created,
    key: rawKey, // Only returned once at creation
  });
}
