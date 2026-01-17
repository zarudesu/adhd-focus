import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { users, userFeatures, features, dailyStats } from '@/db/schema';
import { eq, and, lte } from 'drizzle-orm';
import { levelFromXp } from '@/lib/gamification';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { amount, reason } = body;

    if (typeof amount !== 'number' || amount < 0) {
      return NextResponse.json({ error: 'Invalid XP amount' }, { status: 400 });
    }

    // Get current user stats
    const [user] = await db
      .select({
        xp: users.xp,
        level: users.level,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentXp = user.xp || 0;
    const currentLevel = user.level || 1;
    const newXp = currentXp + amount;
    const newLevel = levelFromXp(newXp);
    const leveledUp = newLevel > currentLevel;

    // Update user XP and level
    await db
      .update(users)
      .set({
        xp: newXp,
        level: newLevel,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));

    // Update daily stats
    const today = new Date().toISOString().split('T')[0];
    const [existingDailyStat] = await db
      .select()
      .from(dailyStats)
      .where(and(eq(dailyStats.userId, userId), eq(dailyStats.date, today)))
      .limit(1);

    if (existingDailyStat) {
      await db
        .update(dailyStats)
        .set({
          xpEarned: (existingDailyStat.xpEarned || 0) + amount,
        })
        .where(eq(dailyStats.id, existingDailyStat.id));
    } else {
      await db.insert(dailyStats).values({
        userId,
        date: today,
        xpEarned: amount,
      });
    }

    // If leveled up, check for new feature unlocks
    let newUnlocks: string[] = [];
    if (leveledUp) {
      // Get features that unlock at or below new level
      const unlockableFeatures = await db
        .select()
        .from(features)
        .where(lte(features.unlockLevel, newLevel));

      // Get already unlocked features
      const alreadyUnlocked = await db
        .select({ featureCode: userFeatures.featureCode })
        .from(userFeatures)
        .where(eq(userFeatures.userId, userId));

      const alreadyUnlockedCodes = new Set(alreadyUnlocked.map((f) => f.featureCode));

      // Find new unlocks
      for (const feature of unlockableFeatures) {
        if (!alreadyUnlockedCodes.has(feature.code)) {
          await db.insert(userFeatures).values({
            userId,
            featureCode: feature.code,
          });
          newUnlocks.push(feature.code);
        }
      }
    }

    return NextResponse.json({
      success: true,
      previousXp: currentXp,
      newXp,
      xpGained: amount,
      previousLevel: currentLevel,
      newLevel,
      leveledUp,
      newUnlocks,
      reason,
    });
  } catch (error) {
    console.error('Failed to award XP:', error);
    return NextResponse.json({ error: 'Failed to award XP' }, { status: 500 });
  }
}
