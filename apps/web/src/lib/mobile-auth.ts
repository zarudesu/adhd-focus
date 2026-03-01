// Mobile Auth Helper
// Verifies JWT tokens from mobile app and API keys

import { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { auth } from "./auth";
import { db } from "@/db";
import { apiKeys, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";

if (!process.env.AUTH_SECRET) {
  throw new Error("AUTH_SECRET environment variable is required");
}

const JWT_SECRET = new TextEncoder().encode(process.env.AUTH_SECRET);

/**
 * Get authenticated user from either NextAuth session (web), JWT token (mobile), or API key
 */
export async function getAuthUser(
  request: NextRequest
): Promise<{ id: string; email: string } | null> {
  // Try NextAuth session first (for web requests)
  const session = await auth();
  if (session?.user?.id) {
    return {
      id: session.user.id,
      email: session.user.email,
    };
  }

  // Try Bearer token (for mobile/API requests)
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);

    // Check if it's an API key (starts with byr8_)
    if (token.startsWith("byr8_")) {
      return verifyApiKey(token);
    }

    // Otherwise try JWT
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      if (payload.userId && payload.email) {
        return {
          id: payload.userId as string,
          email: payload.email as string,
        };
      }
    } catch {
      // Invalid token
      return null;
    }
  }

  return null;
}

async function verifyApiKey(
  rawKey: string
): Promise<{ id: string; email: string } | null> {
  const prefix = rawKey.slice(0, 13);

  // Find keys matching the prefix that aren't revoked
  const candidates = await db
    .select({
      id: apiKeys.id,
      keyHash: apiKeys.keyHash,
      userId: apiKeys.userId,
      expiresAt: apiKeys.expiresAt,
    })
    .from(apiKeys)
    .where(and(eq(apiKeys.keyPrefix, prefix), eq(apiKeys.revoked, false)));

  for (const candidate of candidates) {
    // Check expiration
    if (candidate.expiresAt && candidate.expiresAt < new Date()) {
      continue;
    }

    const valid = await bcrypt.compare(rawKey, candidate.keyHash);
    if (valid) {
      // Update lastUsedAt (fire and forget)
      db.update(apiKeys)
        .set({ lastUsedAt: new Date() })
        .where(eq(apiKeys.id, candidate.id))
        .then(() => {});

      // Get user email
      const [user] = await db
        .select({ id: users.id, email: users.email })
        .from(users)
        .where(eq(users.id, candidate.userId));

      if (user) {
        return { id: user.id, email: user.email! };
      }
    }
  }

  return null;
}
