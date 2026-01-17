// ADHD Focus - Single Project API
// GET /api/projects/[id] - Get project with tasks
// PATCH /api/projects/[id] - Update project
// DELETE /api/projects/[id] - Archive project

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db, projects, tasks } from "@/db";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { logError } from "@/lib/logger";

type RouteParams = { params: Promise<{ id: string }> };

const updateProjectSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().nullable().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  emoji: z.string().max(4).optional(),
  archived: z.boolean().optional(),
});

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, id), eq(projects.userId, session.user.id)))
      .limit(1);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Get tasks for this project
    const projectTasks = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.projectId, id), eq(tasks.userId, session.user.id)))
      .orderBy(tasks.sortOrder, tasks.createdAt);

    return NextResponse.json({ ...project, tasks: projectTasks });
  } catch (error) {
    logError("GET /api/projects/[id]", error);
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
    const data = updateProjectSchema.parse(body);

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.emoji !== undefined) updateData.emoji = data.emoji;
    if (data.archived !== undefined) updateData.archived = data.archived;

    const [updatedProject] = await db
      .update(projects)
      .set(updateData)
      .where(and(eq(projects.id, id), eq(projects.userId, session.user.id)))
      .returning();

    if (!updatedProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(updatedProject);
  } catch (error) {
    logError("PATCH /api/projects/[id]", error);
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

    // Soft delete - archive
    const [archivedProject] = await db
      .update(projects)
      .set({ archived: true, updatedAt: new Date() })
      .where(and(eq(projects.id, id), eq(projects.userId, session.user.id)))
      .returning();

    if (!archivedProject) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("DELETE /api/projects/[id]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
