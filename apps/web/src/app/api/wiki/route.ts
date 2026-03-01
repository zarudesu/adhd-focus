import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/mobile-auth";
import { db, projects, projectWikiPages } from "@/db";
import { eq, asc } from "drizzle-orm";
import { logError } from "@/lib/logger";

// GET /api/wiki - All wiki pages grouped by project
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all projects with their wiki pages
    const userProjects = await db
      .select({
        id: projects.id,
        name: projects.name,
        emoji: projects.emoji,
      })
      .from(projects)
      .where(eq(projects.userId, user.id))
      .orderBy(asc(projects.name));

    const result = await Promise.all(
      userProjects.map(async (project) => {
        const pages = await db
          .select({
            id: projectWikiPages.id,
            title: projectWikiPages.title,
            updatedAt: projectWikiPages.updatedAt,
          })
          .from(projectWikiPages)
          .where(eq(projectWikiPages.projectId, project.id))
          .orderBy(asc(projectWikiPages.sortOrder), asc(projectWikiPages.createdAt));

        return {
          projectId: project.id,
          projectName: project.name,
          projectEmoji: project.emoji,
          pages,
        };
      })
    );

    // Only return projects that have wiki pages
    const withPages = result.filter((p) => p.pages.length > 0);

    return NextResponse.json(withPages);
  } catch (error) {
    logError("GET /api/wiki", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
