/**
 * Feature Opened API
 * POST /api/features/[code]/opened - Mark a feature as opened for the first time
 *
 * Used for:
 * - Stopping shimmer animation on newly unlocked features
 * - Triggering mini-tutorial display on first visit
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/mobile-auth';
import { db } from '@/db';
import { userFeatures } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { logError } from '@/lib/logger';
import { FEATURE_TUTORIALS, type TutorialContent } from '@/lib/feature-tutorials';

interface RouteParams {
  params: Promise<{ code: string }>;
}

interface FeatureOpenedResponse {
  isFirstOpen: boolean;
  tutorial: TutorialContent | null;
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse<FeatureOpenedResponse | { error: string }>> {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { code } = await params;
    const userId = user.id;

    // Find the user's feature record
    const [userFeature] = await db
      .select({
        id: userFeatures.id,
        firstOpenedAt: userFeatures.firstOpenedAt,
        unlockedAt: userFeatures.unlockedAt,
      })
      .from(userFeatures)
      .where(
        and(
          eq(userFeatures.userId, userId),
          eq(userFeatures.featureCode, code)
        )
      )
      .limit(1);

    let isFirstOpen = false;

    if (!userFeature) {
      // Feature row doesn't exist yet - create it with firstOpenedAt set
      // (Features are unlocked dynamically based on stats, rows are created on first open)
      await db.insert(userFeatures).values({
        userId,
        featureCode: code,
        unlockedAt: new Date(),
        firstOpenedAt: new Date(),
      });
      isFirstOpen = true;
    } else if (userFeature.firstOpenedAt === null) {
      // Row exists but not opened yet - update firstOpenedAt
      await db
        .update(userFeatures)
        .set({ firstOpenedAt: new Date() })
        .where(
          and(
            eq(userFeatures.userId, userId),
            eq(userFeatures.featureCode, code),
            isNull(userFeatures.firstOpenedAt)
          )
        );
      isFirstOpen = true;
    }

    // Get tutorial content if this is the first open
    const tutorial = isFirstOpen ? (FEATURE_TUTORIALS[code] || null) : null;

    return NextResponse.json({
      isFirstOpen,
      tutorial,
    });
  } catch (error) {
    logError('POST /api/features/[code]/opened', error);
    return NextResponse.json(
      { error: 'Failed to mark feature as opened' },
      { status: 500 }
    );
  }
}
