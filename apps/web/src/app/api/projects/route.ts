// ADHD Focus - Projects API
// GET /api/projects - List projects
// POST /api/projects - Create project

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, projects, tasks, type NewProject } from "@/db";
import { eq, and, asc, ne, count } from "drizzle-orm";
import { z } from "zod";

// Query params schema
const querySchema = z.object({
  includeArchived: z.coerce.boolean().default(false),
  withTaskCount: z.coerce.boolean().default(false),
});

// Create project schema
const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  emoji: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const params = querySchema.parse(Object.fromEntries(searchParams));

    // Build query conditions
    const conditions = [eq(projects.userId, session.user.id)];

    if (!params.includeArchived) {
      conditions.push(eq(projects.archived, false));
    }

    const result = await db
      .select()
      .from(projects)
      .where(and(...conditions))
      .orderBy(asc(projects.name));

    // Optionally include task count
    if (params.withTaskCount) {
      const projectsWithCount = await Promise.all(
        result.map(async (project) => {
          const [{ taskCount }] = await db
            .select({ taskCount: count() })
            .from(tasks)
            .where(
              and(
                eq(tasks.projectId, project.id),
                ne(tasks.status, "archived")
              )
            );
          return { ...project, taskCount };
        })
      );
      return NextResponse.json(projectsWithCount);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/projects error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid parameters", details: error.issues }, { status: 400 });
    }
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
        description: data.description,
        color: data.color || "#6366f1",
        emoji: data.emoji || "📁",
      } satisfies NewProject)
      .returning();

    return NextResponse.json(newProject, { status: 201 });
  } catch (error) {
    console.error("POST /api/projects error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
