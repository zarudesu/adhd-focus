// ADHD Focus - Middleware (Edge Runtime)
// Uses edge-compatible auth config (no bcrypt)

import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // Protect dashboard routes
  matcher: ["/dashboard/:path*"],
};
