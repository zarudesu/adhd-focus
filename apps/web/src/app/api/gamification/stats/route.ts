import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import {
  users,
  userFeatures,
  userAchievements,
  userCreatures,
  achievements,
  creatures,
  features,
  rewardLogs,
  FEATURE_CODES,
} from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { logError } from '@/lib/logger';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user gamification data
    const [user] = await db
      .select({
        xp: users.xp,
        level: users.level,
        currentStreak: users.currentStreak,
        longestStreak: users.longestStreak,
        totalTasksCompleted: users.totalTasksCompleted,
        totalCreatures: users.totalCreatures,
        rarestRewardSeen: users.rarestRewardSeen,
        lastActiveDate: users.lastActiveDate,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get unlocked features
    const unlockedFeaturesData = await db
      .select({
        featureCode: userFeatures.featureCode,
        unlockedAt: userFeatures.unlockedAt,
      })
      .from(userFeatures)
      .where(eq(userFeatures.userId, userId));

    // Always include inbox
    const unlockedFeatures = [
      FEATURE_CODES.INBOX,
      ...unlockedFeaturesData.map((f) => f.featureCode),
    ];

    // Get user achievements with details
    const userAchievementsData = await db
      .select({
        id: userAchievements.id,
        unlockedAt: userAchievements.unlockedAt,
        achievement: achievements,
      })
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, userId));

    // Get user creatures with details
    const userCreaturesData = await db
      .select({
        id: userCreatures.id,
        count: userCreatures.count,
        firstCaughtAt: userCreatures.firstCaughtAt,
        creature: creatures,
      })
      .from(userCreatures)
      .innerJoin(creatures, eq(userCreatures.creatureId, creatures.id))
      .where(eq(userCreatures.userId, userId));

    // Get recent rewards
    const recentRewardsData = await db
      .select({
        rewardType: rewardLogs.rewardType,
        rarity: rewardLogs.rarity,
        seenAt: rewardLogs.seenAt,
      })
      .from(rewardLogs)
      .where(eq(rewardLogs.userId, userId))
      .orderBy(desc(rewardLogs.seenAt))
      .limit(10);

    // Get all features for unlock info
    const allFeatures = await db
      .select()
      .from(features)
      .orderBy(features.sortOrder);

    return NextResponse.json({
      xp: user.xp || 0,
      level: user.level || 1,
      currentStreak: user.currentStreak || 0,
      longestStreak: user.longestStreak || 0,
      totalTasksCompleted: user.totalTasksCompleted || 0,
      totalCreatures: user.totalCreatures || 0,
      rarestRewardSeen: user.rarestRewardSeen,
      lastActiveDate: user.lastActiveDate,
      unlockedFeatures,
      unlockedAchievements: userAchievementsData.map((a) => a.achievement.code),
      achievements: userAchievementsData,
      creatures: userCreaturesData,
      recentRewards: recentRewardsData.map((r) => ({
        effect: r.rewardType,
        rarity: r.rarity,
        timestamp: r.seenAt,
      })),
      features: allFeatures.length > 0 ? allFeatures : undefined,
    });
  } catch (error) {
    logError('GET /api/gamification/stats', error);
    return NextResponse.json(
      { error: 'Failed to fetch gamification stats' },
      { status: 500 }
    );
  }
}
