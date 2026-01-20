/**
 * Achievements API
 * GET /api/gamification/achievements - Get all achievements with user progress
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { achievements, userAchievements, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { logError } from '@/lib/logger';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user stats for progress calculation
    const [user] = await db
      .select({
        totalTasksCompleted: users.totalTasksCompleted,
        currentStreak: users.currentStreak,
        longestStreak: users.longestStreak,
        level: users.level,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    // Get all achievements
    const allAchievements = await db
      .select()
      .from(achievements)
      .orderBy(achievements.sortOrder);

    // Get user's unlocked achievements
    const unlockedList = await db
      .select({
        achievementId: userAchievements.achievementId,
        unlockedAt: userAchievements.unlockedAt,
      })
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId));

    const unlockedMap = new Map(
      unlockedList.map((u) => [u.achievementId, u.unlockedAt])
    );

    // Map achievements with unlock status and progress
    const result = allAchievements.map((ach) => {
      const isUnlocked = unlockedMap.has(ach.id);
      const unlockedAt = unlockedMap.get(ach.id) || null;

      // Calculate progress for countable achievements
      // NOTE: Only show progress for achievements we can accurately track
      // Achievements with filters (priority, energy, duration, non-total timeframe)
      // cannot be tracked without detailed task queries
      let progress: { current: number; target: number } | null = null;
      const condition = ach.conditionValue as Record<string, unknown> | null;

      if (condition && !isUnlocked) {
        // Only show progress for TOTAL task count without filters
        const hasFilters = condition.priority || condition.energy || condition.duration;
        const hasTimeframe = condition.timeframe && condition.timeframe !== 'total';

        if (ach.conditionType === 'task_count' && condition.count && !hasFilters && !hasTimeframe) {
          progress = {
            current: Math.min(user?.totalTasksCompleted || 0, condition.count as number),
            target: condition.count as number,
          };
        } else if (ach.conditionType === 'streak_days' && condition.days) {
          progress = {
            current: Math.min(user?.currentStreak || 0, condition.days as number),
            target: condition.days as number,
          };
        } else if (ach.conditionType === 'longest_streak' && condition.days) {
          progress = {
            current: Math.min(user?.longestStreak || 0, condition.days as number),
            target: condition.days as number,
          };
        } else if (ach.conditionType === 'level' && condition.level) {
          progress = {
            current: Math.min(user?.level || 1, condition.level as number),
            target: condition.level as number,
          };
        }
      }

      // Handle visibility
      // - visible: always show name/description
      // - hidden: show ??? until unlocked
      // - invisible: don't show at all until unlocked
      // - ultra_secret: never show (even after unlock, only in personal collection)

      const shouldHide = !isUnlocked && (ach.visibility === 'hidden' || ach.visibility === 'invisible');
      const shouldExclude = !isUnlocked && (ach.visibility === 'invisible' || ach.visibility === 'ultra_secret');

      if (shouldExclude) {
        return null; // Will be filtered out
      }

      return {
        id: ach.id,
        code: ach.code,
        name: shouldHide ? (ach.hiddenName || '???') : ach.name,
        description: shouldHide ? (ach.hiddenDescription || 'Complete secret conditions') : ach.description,
        icon: shouldHide ? '❓' : ach.icon,
        category: ach.category,
        visibility: ach.visibility,
        xpReward: ach.xpReward,
        isUnlocked,
        unlockedAt,
        progress,
      };
    }).filter(Boolean);

    return NextResponse.json({
      achievements: result,
      stats: {
        total: allAchievements.length,
        unlocked: unlockedList.length,
        visible: result.length,
      },
    });
  } catch (error) {
    logError('GET /api/gamification/achievements', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}
