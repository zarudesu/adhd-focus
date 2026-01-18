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

// Check if a feature is unlocked based on user's progress
function isFeatureUnlocked(
  feature: {
    unlockLevel?: number | null;
    unlockTaskCount?: number | null;
    unlockTasksAdded?: number | null;
    unlockTasksCompleted?: number | null;
    unlockTasksAssignedToday?: number | null;
    unlockTasksScheduled?: number | null;
    unlockProjectsCreated?: number | null;
    unlockInboxCleared?: number | null;
    unlockFocusSessions?: number | null;
    unlockStreakDays?: number | null;
  },
  userProgress: {
    level: number;
    totalTasksCompleted: number;
    tasksAdded: number;
    tasksAssignedToday: number;
    tasksScheduled: number;
    projectsCreated: number;
    inboxCleared: number;
    focusSessionsCompleted: number;
    currentStreak: number;
  }
): boolean {
  // If no unlock conditions, it's always available
  const hasConditions =
    feature.unlockLevel != null ||
    feature.unlockTaskCount != null ||
    feature.unlockTasksAdded != null ||
    feature.unlockTasksCompleted != null ||
    feature.unlockTasksAssignedToday != null ||
    feature.unlockTasksScheduled != null ||
    feature.unlockProjectsCreated != null ||
    feature.unlockInboxCleared != null ||
    feature.unlockFocusSessions != null ||
    feature.unlockStreakDays != null;

  if (!hasConditions) return true;

  // Check each condition (any one being met unlocks)
  if (feature.unlockLevel != null && userProgress.level >= feature.unlockLevel) return true;
  if (feature.unlockTaskCount != null && userProgress.totalTasksCompleted >= feature.unlockTaskCount) return true;
  if (feature.unlockTasksAdded != null && userProgress.tasksAdded >= feature.unlockTasksAdded) return true;
  if (feature.unlockTasksCompleted != null && userProgress.totalTasksCompleted >= feature.unlockTasksCompleted) return true;
  if (feature.unlockTasksAssignedToday != null && userProgress.tasksAssignedToday >= feature.unlockTasksAssignedToday) return true;
  if (feature.unlockTasksScheduled != null && userProgress.tasksScheduled >= feature.unlockTasksScheduled) return true;
  if (feature.unlockProjectsCreated != null && userProgress.projectsCreated >= feature.unlockProjectsCreated) return true;
  if (feature.unlockInboxCleared != null && userProgress.inboxCleared >= feature.unlockInboxCleared) return true;
  if (feature.unlockFocusSessions != null && userProgress.focusSessionsCompleted >= feature.unlockFocusSessions) return true;
  if (feature.unlockStreakDays != null && userProgress.currentStreak >= feature.unlockStreakDays) return true;

  return false;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user gamification data including onboarding progress
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
        // Onboarding progress
        tasksAdded: users.tasksAdded,
        tasksAssignedToday: users.tasksAssignedToday,
        tasksScheduled: users.tasksScheduled,
        tasksDeleted: users.tasksDeleted,
        projectsCreated: users.projectsCreated,
        inboxCleared: users.inboxCleared,
        focusSessionsCompleted: users.focusSessionsCompleted,
        onboardingCompleted: users.onboardingCompleted,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all features to check which are unlocked
    const allFeatures = await db
      .select()
      .from(features)
      .orderBy(features.sortOrder);

    // Build user progress object
    const userProgress = {
      level: user.level || 1,
      totalTasksCompleted: user.totalTasksCompleted || 0,
      tasksAdded: user.tasksAdded || 0,
      tasksAssignedToday: user.tasksAssignedToday || 0,
      tasksScheduled: user.tasksScheduled || 0,
      projectsCreated: user.projectsCreated || 0,
      inboxCleared: user.inboxCleared || 0,
      focusSessionsCompleted: user.focusSessionsCompleted || 0,
      currentStreak: user.currentStreak || 0,
    };

    // Calculate unlocked features based on progress
    const unlockedFeatures: string[] = [];
    const navFeatures: Array<{
      code: string;
      name: string;
      icon: string | null;
      isUnlocked: boolean;
      celebrationText: string | null;
    }> = [];

    for (const feature of allFeatures) {
      const isUnlocked = isFeatureUnlocked(feature, userProgress);

      if (isUnlocked) {
        unlockedFeatures.push(feature.code);
      }

      // Collect navigation items for sidebar
      if (feature.isNavItem) {
        navFeatures.push({
          code: feature.code,
          name: feature.name,
          icon: feature.icon,
          isUnlocked,
          celebrationText: feature.celebrationText,
        });
      }
    }

    // Always include inbox in unlocked features
    if (!unlockedFeatures.includes('nav_inbox')) {
      unlockedFeatures.push('nav_inbox');
    }

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

    return NextResponse.json({
      xp: user.xp || 0,
      level: user.level || 1,
      currentStreak: user.currentStreak || 0,
      longestStreak: user.longestStreak || 0,
      totalTasksCompleted: user.totalTasksCompleted || 0,
      totalCreatures: user.totalCreatures || 0,
      rarestRewardSeen: user.rarestRewardSeen,
      lastActiveDate: user.lastActiveDate,

      // Onboarding progress
      progress: userProgress,

      // Features
      unlockedFeatures,
      navFeatures, // Navigation items with unlock status
      features: allFeatures,

      // Achievements
      unlockedAchievements: userAchievementsData.map((a) => a.achievement.code),
      achievements: userAchievementsData,

      // Creatures
      creatures: userCreaturesData,

      // Rewards
      recentRewards: recentRewardsData.map((r) => ({
        effect: r.rewardType,
        rarity: r.rarity,
        timestamp: r.seenAt,
      })),
    });
  } catch (error) {
    logError('GET /api/gamification/stats', error);
    return NextResponse.json(
      { error: 'Failed to fetch gamification stats' },
      { status: 500 }
    );
  }
}
