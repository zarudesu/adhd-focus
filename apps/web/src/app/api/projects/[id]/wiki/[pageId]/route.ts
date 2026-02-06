import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/mobile-auth";
import { db, projectWikiPages } from "@/db";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { logError } from "@/lib/logger";

type RouteParams = { params: Promise<{ id: string; pageId: string }> };

const updatePageSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.any().optional(),
});

// GET /api/projects/[id]/wiki/[pageId] - Get single page with content
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, pageId } = await params;

    const [page] = await db
      .select()
      .from(projectWikiPages)
      .where(and(
        eq(projectWikiPages.id, pageId),
        eq(projectWikiPages.projectId, id),
        eq(projectWikiPages.userId, user.id),
      ))
      .limit(1);

    if (!page) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json(page);
  } catch (error) {
    logError("GET /api/projects/[id]/wiki/[pageId]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/projects/[id]/wiki/[pageId] - Update page
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, pageId } = await params;
    const body = await request.json();
    const data = updatePageSchema.parse(body);

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };
    if (data.title !== undefined) updateData.title = data.title;
    if (data.content !== undefined) updateData.content = data.content;

    const [updated] = await db
      .update(projectWikiPages)
      .set(updateData)
      .where(and(
        eq(projectWikiPages.id, pageId),
        eq(projectWikiPages.projectId, id),
        eq(projectWikiPages.userId, user.id),
      ))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    logError("PATCH /api/projects/[id]/wiki/[pageId]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid data", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/projects/[id]/wiki/[pageId] - Delete page
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, pageId } = await params;

    const [deleted] = await db
      .delete(projectWikiPages)
      .where(and(
        eq(projectWikiPages.id, pageId),
        eq(projectWikiPages.projectId, id),
        eq(projectWikiPages.userId, user.id),
      ))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Page not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError("DELETE /api/projects/[id]/wiki/[pageId]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
