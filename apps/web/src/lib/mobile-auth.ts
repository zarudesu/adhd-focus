// Mobile Auth Helper
// Verifies JWT tokens from mobile app

import { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { auth } from "./auth";

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "fallback-secret-change-me"
);

interface MobileSession {
  user: {
    id: string;
    email: string;
  };
}

/**
 * Get authenticated user from either NextAuth session (web) or Bearer token (mobile)
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

  // Try Bearer token (for mobile requests)
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
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
