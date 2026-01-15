// ADHD Focus - NextAuth Edge-Compatible Config
// This file is used by middleware (Edge runtime)
// bcrypt is NOT imported here - it's not edge-compatible

import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  // Providers added in auth.ts (bcrypt requires Node.js)
  providers: [],

  callbacks: {
    // Route protection - runs in middleware (Edge)
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");

      if (isOnDashboard) {
        return isLoggedIn; // Redirect to login if not authenticated
      }

      return true;
    },

    // JWT callback - adds user id to token
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    // Session callback - adds user id to session
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
