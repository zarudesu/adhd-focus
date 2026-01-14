// ADHD Focus - OAuth Callback Route
// NextAuth handles OAuth callbacks automatically via /api/auth/[...nextauth]

import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const origin = new URL(request.url).origin;
  // Redirect to dashboard - NextAuth handles OAuth flow automatically
  return NextResponse.redirect(`${origin}/dashboard`);
}
