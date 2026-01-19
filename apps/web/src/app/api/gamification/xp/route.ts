import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { users, userFeatures, features, dailyStats } from '@/db/schema';
import { eq, and, lte } from 'drizzle-orm';
import { levelFromXp } from '@/lib/gamification';
import { logError } from '@/lib/logger';
import { z } from 'zod';

const xpSchema = z.object({
  amount: z.number().min(0).max(10000), // Cap XP amount
  reason: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();

    // Validate input
    const parseResult = xpSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.issues[0]?.message || 'Invalid input' },
        { status: 400 }
      );
    }

    const { amount, reason } = parseResult.data;

    // Use transaction for atomicity
    const result = await db.transaction(async (tx) => {
      // Get current user stats
      const [user] = await tx
        .select({
          xp: users.xp,
          level: users.level,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user) {
        throw new Error('User not found');
      }

      const currentXp = user.xp || 0;
      const currentLevel = user.level || 1;
      const newXp = currentXp + amount;
      const newLevel = levelFromXp(newXp);
      const leveledUp = newLevel > currentLevel;

      // Update user XP and level
      await tx
        .update(users)
        .set({
          xp: newXp,
          level: newLevel,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      // Update daily stats
      const today = new Date().toISOString().split('T')[0];
      const [existingDailyStat] = await tx
        .select()
        .from(dailyStats)
        .where(and(eq(dailyStats.userId, userId), eq(dailyStats.date, today)))
        .limit(1);

      if (existingDailyStat) {
        await tx
          .update(dailyStats)
          .set({
            xpEarned: (existingDailyStat.xpEarned || 0) + amount,
          })
          .where(eq(dailyStats.id, existingDailyStat.id));
      } else {
        await tx.insert(dailyStats).values({
          userId,
          date: today,
          xpEarned: amount,
        });
      }

      // If leveled up, check for new feature unlocks
      const newUnlocks: string[] = [];
      if (leveledUp) {
        // Get features that unlock at or below new level
        const unlockableFeatures = await tx
          .select()
          .from(features)
          .where(lte(features.unlockLevel, newLevel));

        // Get already unlocked features
        const alreadyUnlocked = await tx
          .select({ featureCode: userFeatures.featureCode })
          .from(userFeatures)
          .where(eq(userFeatures.userId, userId));

        const alreadyUnlockedCodes = new Set(alreadyUnlocked.map((f) => f.featureCode));

        // Find new unlocks
        for (const feature of unlockableFeatures) {
          if (!alreadyUnlockedCodes.has(feature.code)) {
            await tx.insert(userFeatures).values({
              userId,
              featureCode: feature.code,
            });
            newUnlocks.push(feature.code);
          }
        }
      }

      return {
        previousXp: currentXp,
        newXp,
        xpGained: amount,
        previousLevel: currentLevel,
        newLevel,
        leveledUp,
        newUnlocks,
        reason,
      };
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'User not found') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    logError('POST /api/gamification/xp', error);
    return NextResponse.json({ error: 'Failed to award XP' }, { status: 500 });
  }
}
