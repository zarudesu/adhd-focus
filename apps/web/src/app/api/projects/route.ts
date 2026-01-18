// ADHD Focus - Projects API
// GET /api/projects - List projects
// POST /api/projects - Create project

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, projects, tasks, users } from "@/db";
import { eq, and, count, sql } from "drizzle-orm";
import { z } from "zod";
import { logError } from "@/lib/logger";

const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().nullable().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  emoji: z.string().max(4).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const includeArchived = searchParams.get("includeArchived") === "true";

    // Get projects with task counts using a single aggregation query
    const projectsWithCounts = await db
      .select({
        id: projects.id,
        userId: projects.userId,
        name: projects.name,
        description: projects.description,
        color: projects.color,
        emoji: projects.emoji,
        archived: projects.archived,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        taskCount: sql<number>`cast(count(${tasks.id}) as int)`,
        completedCount: sql<number>`cast(count(case when ${tasks.status} = 'done' then 1 end) as int)`,
      })
      .from(projects)
      .leftJoin(
        tasks,
        and(eq(tasks.projectId, projects.id), eq(tasks.userId, session.user.id))
      )
      .where(
        includeArchived
          ? eq(projects.userId, session.user.id)
          : and(eq(projects.userId, session.user.id), eq(projects.archived, false))
      )
      .groupBy(projects.id)
      .orderBy(projects.createdAt);

    return NextResponse.json(projectsWithCounts);
  } catch (error) {
    logError("GET /api/projects", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = createProjectSchema.parse(body);

    const [newProject] = await db
      .insert(projects)
      .values({
        userId: session.user.id,
        name: data.name,
        description: data.description || null,
        color: data.color || "#6366f1",
        emoji: data.emoji || "📁",
      })
      .returning();

    // Track onboarding progress - project created
    await db
      .update(users)
      .set({
        projectsCreated: sql`COALESCE(${users.projectsCreated}, 0) + 1`,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({ ...newProject, taskCount: 0, completedCount: 0 }, { status: 201 });
  } catch (error) {
    logError("POST /api/projects", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
