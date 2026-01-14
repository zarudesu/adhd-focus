// ADHD Focus - Sign Out Route
// POST /auth/signout - Signs out the current user

import { signOut } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  await signOut({ redirectTo: "/login" });
  return NextResponse.redirect(new URL("/login", request.url));
}
