// ADHD Focus - Single Task API
// GET /api/tasks/[id] - Get task
// PATCH /api/tasks/[id] - Update task
// DELETE /api/tasks/[id] - Delete task

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, tasks } from "@/db";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

type RouteParams = { params: Promise<{ id: string }> };

// Update task schema
const updateTaskSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().nullable().optional(),
  status: z.enum(["inbox", "today", "scheduled", "in_progress", "done", "archived"]).optional(),
  energyRequired: z.enum(["low", "medium", "high"]).optional(),
  priority: z.enum(["must", "should", "want", "someday"]).optional(),
  estimatedMinutes: z.number().positive().nullable().optional(),
  actualMinutes: z.number().positive().nullable().optional(),
  pomodorosCompleted: z.number().min(0).optional(),
  dueDate: z.string().nullable().optional(),
  scheduledDate: z.string().nullable().optional(),
  completedAt: z.string().nullable().optional(),
  projectId: z.string().uuid().nullable().optional(),
  tags: z.array(z.string()).optional(),
  sortOrder: z.number().optional(),
});

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [task] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, session.user.id)))
      .limit(1);

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("GET /api/tasks/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const data = updateTaskSchema.parse(body);

    // Build update data with proper date conversion
    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    // Copy fields, converting date strings to Date objects
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.energyRequired !== undefined) updateData.energyRequired = data.energyRequired;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.estimatedMinutes !== undefined) updateData.estimatedMinutes = data.estimatedMinutes;
    if (data.actualMinutes !== undefined) updateData.actualMinutes = data.actualMinutes;
    if (data.pomodorosCompleted !== undefined) updateData.pomodorosCompleted = data.pomodorosCompleted;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate;
    if (data.scheduledDate !== undefined) updateData.scheduledDate = data.scheduledDate;
    if (data.projectId !== undefined) updateData.projectId = data.projectId;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.sortOrder !== undefined) updateData.sortOrder = data.sortOrder;

    // Handle completedAt - convert string to Date
    if (data.completedAt !== undefined) {
      updateData.completedAt = data.completedAt ? new Date(data.completedAt) : null;
    } else if (data.status === "done") {
      updateData.completedAt = new Date();
    }

    const [updatedTask] = await db
      .update(tasks)
      .set(updateData)
      .where(and(eq(tasks.id, id), eq(tasks.userId, session.user.id)))
      .returning();

    if (!updatedTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("PATCH /api/tasks/[id] error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Soft delete - move to archived
    const [archivedTask] = await db
      .update(tasks)
      .set({ status: "archived", updatedAt: new Date() })
      .where(and(eq(tasks.id, id), eq(tasks.userId, session.user.id)))
      .returning();

    if (!archivedTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/tasks/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
