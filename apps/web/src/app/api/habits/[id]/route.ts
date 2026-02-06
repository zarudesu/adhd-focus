// ADHD Focus - Individual Habit API
// GET /api/habits/[id] - Get habit details
// PATCH /api/habits/[id] - Update habit
// DELETE /api/habits/[id] - Archive habit

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/mobile-auth";
import { db } from "@/db";
import { habits } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { logError } from "@/lib/logger";

const updateHabitSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  emoji: z.string().optional(),
  description: z.string().max(1000).optional().nullable(),
  frequency: z.enum(["daily", "weekdays", "weekends", "custom"]).optional(),
  customDays: z.array(z.number().min(0).max(6)).optional().nullable(),
  timeOfDay: z.enum(["morning", "afternoon", "evening", "night", "anytime"]).optional(),
  color: z.string().optional().nullable(),
  sortOrder: z.number().optional(),
  isArchived: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [habit] = await db
      .select()
      .from(habits)
      .where(and(
        eq(habits.id, id),
        eq(habits.userId, user.id)
      ));

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    return NextResponse.json(habit);
  } catch (error) {
    logError("GET /api/habits/[id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const data = updateHabitSchema.parse(body);

    // Verify ownership
    const [existing] = await db
      .select()
      .from(habits)
      .where(and(
        eq(habits.id, id),
        eq(habits.userId, user.id)
      ));

    if (!existing) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.emoji !== undefined) updateData.emoji = data.emoji;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.frequency !== undefined) updateData.frequency = data.frequency;
    if (data.customDays !== undefined) updateData.customDays = data.customDays;
    if (data.timeOfDay !== undefined) updateData.timeOfDay = data.timeOfDay;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;
    if (data.isArchived !== undefined) {
      updateData.isArchived = data.isArchived;
      if (data.isArchived) {
        updateData.archivedAt = new Date();
      } else {
        updateData.archivedAt = null;
      }
    }

    const [updated] = await db
      .update(habits)
      .set(updateData)
      .where(and(
        eq(habits.id, id),
        eq(habits.userId, user.id)
      ))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    logError("PATCH /api/habits/[id]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Soft delete (archive)
    const [archived] = await db
      .update(habits)
      .set({
        isArchived: true,
        archivedAt: new Date(),
      })
      .where(and(
        eq(habits.id, id),
        eq(habits.userId, user.id)
      ))
      .returning();

    if (!archived) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("DELETE /api/habits/[id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
