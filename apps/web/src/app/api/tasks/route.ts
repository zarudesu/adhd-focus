// ADHD Focus - Tasks API
// GET /api/tasks - List tasks
// POST /api/tasks - Create task

import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/mobile-auth";
import { db, tasks, users, type NewTask } from "@/db";
import { eq, and, inArray, lte, desc, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { logError } from "@/lib/logger";

// Query params schema
const querySchema = z.object({
  status: z.string().optional(),
  projectId: z.string().optional(), // UUID or "null" for tasks without project
  scheduledDate: z.string().optional(),
  dueDateBefore: z.string().optional(),
  energyRequired: z.enum(["low", "medium", "high"]).optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

// Create task schema
const createTaskSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().optional(),
  status: z.enum(["inbox", "today", "scheduled", "in_progress", "done", "archived"]).optional(),
  energyRequired: z.enum(["low", "medium", "high"]).optional(),
  priority: z.enum(["must", "should", "want", "someday"]).optional(),
  estimatedMinutes: z.number().positive().optional(),
  dueDate: z.string().optional(),
  scheduledDate: z.string().optional(),
  projectId: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const params = querySchema.parse(Object.fromEntries(searchParams));

    // Build query conditions
    const conditions = [eq(tasks.userId, user.id)];

    if (params.status) {
      const statuses = params.status.split(",") as Array<"inbox" | "today" | "scheduled" | "in_progress" | "done" | "archived">;
      if (statuses.length === 1) {
        conditions.push(eq(tasks.status, statuses[0]));
      } else {
        conditions.push(inArray(tasks.status, statuses));
      }
    }

    if (params.projectId) {
      if (params.projectId === "null") {
        // Filter for tasks without a project (inbox tasks)
        conditions.push(isNull(tasks.projectId));
      } else {
        conditions.push(eq(tasks.projectId, params.projectId));
      }
    }

    if (params.scheduledDate) {
      conditions.push(eq(tasks.scheduledDate, params.scheduledDate));
    }

    if (params.dueDateBefore) {
      conditions.push(lte(tasks.dueDate, params.dueDateBefore));
    }

    if (params.energyRequired) {
      conditions.push(eq(tasks.energyRequired, params.energyRequired));
    }

    const result = await db
      .select()
      .from(tasks)
      .where(and(...conditions))
      .orderBy(desc(tasks.createdAt))
      .limit(params.limit)
      .offset(params.offset);

    return NextResponse.json(result);
  } catch (error) {
    logError("GET /api/tasks", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid parameters", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = createTaskSchema.parse(body);

    // Auto-set status to "today" if scheduled for today
    let status = data.status || "inbox";
    if (!data.status && data.scheduledDate) {
      const today = new Date().toISOString().split("T")[0];
      if (data.scheduledDate === today) {
        status = "today";
      }
    }

    const [newTask] = await db
      .insert(tasks)
      .values({
        userId: user.id,
        title: data.title,
        description: data.description,
        status,
        energyRequired: data.energyRequired || "medium",
        priority: data.priority || "should",
        estimatedMinutes: data.estimatedMinutes,
        dueDate: data.dueDate,
        scheduledDate: data.scheduledDate,
        projectId: data.projectId,
        tags: data.tags || [],
      } satisfies NewTask)
      .returning();

    // Track onboarding progress
    const progressUpdates: Record<string, unknown> = {
      tasksAdded: sql`COALESCE(${users.tasksAdded}, 0) + 1`,
      updatedAt: new Date(),
    };

    // Track if assigned to today
    if (status === "today") {
      progressUpdates.tasksAssignedToday = sql`COALESCE(${users.tasksAssignedToday}, 0) + 1`;
    }

    // Track if scheduled (only for future dates, not "today")
    if (data.scheduledDate) {
      const today = new Date().toISOString().split("T")[0];
      if (data.scheduledDate > today) {
        progressUpdates.tasksScheduled = sql`COALESCE(${users.tasksScheduled}, 0) + 1`;
      }
    }

    await db
      .update(users)
      .set(progressUpdates)
      .where(eq(users.id, user.id));

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    logError("POST /api/tasks", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
