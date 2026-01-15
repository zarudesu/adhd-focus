// ADHD Focus - NextAuth Configuration
// Full config with bcrypt (Node.js only, not Edge)

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

// Validation schema
const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

// Helper to get user by email
async function getUser(email: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return user;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    // Email/Password credentials
    Credentials({
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          console.log("[Auth] Invalid credentials format");
          return null;
        }

        const { email, password } = parsed.data;
        const user = await getUser(email);

        if (!user || !user.passwordHash) {
          console.log("[Auth] User not found or no password");
          return null;
        }

        const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordsMatch) {
          console.log("[Auth] Password mismatch");
          return null;
        }

        console.log("[Auth] Login successful for:", email);
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),

    // Google OAuth (optional)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
});

// Type augmentation
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
    };
  }
}
