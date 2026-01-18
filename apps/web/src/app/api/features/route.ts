/**
 * Features API
 * GET /api/features - Get user's unlocked features
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { features, users } from '@/db/schema';
import { eq, lte } from 'drizzle-orm';
import { logError } from '@/lib/logger';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user's current level
    const [user] = await db
      .select({
        level: users.level,
        xp: users.xp,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const userLevel = user?.level || 1;

    // Get all features that are unlocked at or below user's level
    const unlockedFeatures = await db
      .select({
        code: features.code,
        name: features.name,
        description: features.description,
        icon: features.icon,
        unlockLevel: features.unlockLevel,
      })
      .from(features)
      .where(lte(features.unlockLevel, userLevel));

    // Create a set of unlocked feature codes for easy lookup
    const unlockedCodes = new Set(unlockedFeatures.map(f => f.code));

    return NextResponse.json({
      level: userLevel,
      xp: user?.xp || 0,
      unlockedFeatures,
      unlockedCodes: Array.from(unlockedCodes),
    });
  } catch (error) {
    logError('GET /api/features', error);
    return NextResponse.json(
      { error: 'Failed to fetch features' },
      { status: 500 }
    );
  }
}
