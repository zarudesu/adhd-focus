// ADHD Focus - Projects API
// GET /api/projects - List projects
// POST /api/projects - Create project

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, projects, tasks } from "@/db";
import { eq, and, count } from "drizzle-orm";
import { z } from "zod";

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

    // Get projects with task count
    const projectList = await db
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
      })
      .from(projects)
      .where(
        includeArchived
          ? eq(projects.userId, session.user.id)
          : and(eq(projects.userId, session.user.id), eq(projects.archived, false))
      )
      .orderBy(projects.createdAt);

    // Get task counts for each project
    const projectsWithCounts = await Promise.all(
      projectList.map(async (project) => {
        const [taskCount] = await db
          .select({ count: count() })
          .from(tasks)
          .where(and(eq(tasks.projectId, project.id), eq(tasks.userId, session.user.id)));

        const [completedCount] = await db
          .select({ count: count() })
          .from(tasks)
          .where(
            and(
              eq(tasks.projectId, project.id),
              eq(tasks.userId, session.user.id),
              eq(tasks.status, "done")
            )
          );

        return {
          ...project,
          taskCount: taskCount?.count || 0,
          completedCount: completedCount?.count || 0,
        };
      })
    );

    return NextResponse.json(projectsWithCounts);
  } catch (error) {
    console.error("GET /api/projects error:", error);
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

    return NextResponse.json({ ...newProject, taskCount: 0, completedCount: 0 }, { status: 201 });
  } catch (error) {
    console.error("POST /api/projects error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
