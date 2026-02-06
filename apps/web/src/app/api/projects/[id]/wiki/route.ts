import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/mobile-auth";
import { db, projects, projectWikiPages } from "@/db";
import { eq, and, asc } from "drizzle-orm";
import { z } from "zod";
import { logError } from "@/lib/logger";

type RouteParams = { params: Promise<{ id: string }> };

const createPageSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.any().optional(),
});

// GET /api/projects/[id]/wiki - List all wiki pages (no content)
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify project ownership
    const [project] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, id), eq(projects.userId, user.id)))
      .limit(1);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const pages = await db
      .select({
        id: projectWikiPages.id,
        title: projectWikiPages.title,
        sortOrder: projectWikiPages.sortOrder,
        createdAt: projectWikiPages.createdAt,
        updatedAt: projectWikiPages.updatedAt,
      })
      .from(projectWikiPages)
      .where(and(
        eq(projectWikiPages.projectId, id),
        eq(projectWikiPages.userId, user.id),
      ))
      .orderBy(asc(projectWikiPages.sortOrder), asc(projectWikiPages.createdAt));

    return NextResponse.json(pages);
  } catch (error) {
    logError("GET /api/projects/[id]/wiki", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/projects/[id]/wiki - Create new wiki page
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify project ownership
    const [project] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, id), eq(projects.userId, user.id)))
      .limit(1);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const body = await request.json();
    const data = createPageSchema.parse(body);

    const [page] = await db
      .insert(projectWikiPages)
      .values({
        projectId: id,
        userId: user.id,
        title: data.title || "Untitled",
        content: data.content || null,
      })
      .returning();

    return NextResponse.json(page, { status: 201 });
  } catch (error) {
    logError("POST /api/projects/[id]/wiki", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
