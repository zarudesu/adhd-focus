import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import {
  users,
  achievements,
  userAchievements,
  userFeatures,
  type Achievement,
  type AchievementCondition,
} from '@/db/schema';
import { eq, notInArray } from 'drizzle-orm';
import { logError } from '@/lib/logger';

// Check if a user meets an achievement condition
function checkCondition(
  condition: AchievementCondition,
  conditionType: string,
  userStats: {
    level: number;
    totalTasksCompleted: number;
    currentStreak: number;
    longestStreak: number;
    // Habit stats
    habitsCompleted: number;
    habitsCreated: number;
    habitStreak: number;
    longestHabitStreak: number;
    allHabitsCompletedDays: number;
  },
  context?: {
    currentHour?: number;
    currentMinute?: number;
    currentDayOfWeek?: number;
    currentDayOfMonth?: number;
    currentMonth?: number;
  }
): boolean {
  switch (conditionType) {
    case 'task_count':
      return condition.count !== undefined && userStats.totalTasksCompleted >= condition.count;

    case 'streak_days':
      return condition.days !== undefined && userStats.currentStreak >= condition.days;

    case 'longest_streak':
      return condition.days !== undefined && userStats.longestStreak >= condition.days;

    case 'level':
      return condition.level !== undefined && userStats.level >= condition.level;

    case 'time':
      if (!context) return false;
      // Check time-based conditions
      if (condition.hour !== undefined && context.currentHour !== condition.hour) return false;
      if (condition.minute !== undefined && context.currentMinute !== condition.minute) return false;
      if (condition.dayOfWeek !== undefined && context.currentDayOfWeek !== condition.dayOfWeek) return false;
      if (condition.dayOfMonth !== undefined && context.currentDayOfMonth !== condition.dayOfMonth) return false;
      if (condition.month !== undefined && context.currentMonth !== condition.month) return false;
      return true;

    // Habit achievements
    case 'habit_count':
      return condition.count !== undefined && userStats.habitsCompleted >= condition.count;

    case 'habit_create':
      return condition.count !== undefined && userStats.habitsCreated >= condition.count;

    case 'habit_streak':
      return condition.days !== undefined && userStats.habitStreak >= condition.days;

    case 'habit_longest_streak':
      return condition.days !== undefined && userStats.longestHabitStreak >= condition.days;

    case 'all_habits_days':
      return condition.count !== undefined && userStats.allHabitsCompletedDays >= condition.count;

    case 'special':
      // Special conditions are checked elsewhere with specific logic
      return false;

    default:
      return false;
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user stats
    const [user] = await db
      .select({
        level: users.level,
        totalTasksCompleted: users.totalTasksCompleted,
        currentStreak: users.currentStreak,
        longestStreak: users.longestStreak,
        // Habit stats
        habitsCompleted: users.habitsCompleted,
        habitsCreated: users.habitsCreated,
        habitStreak: users.habitStreak,
        longestHabitStreak: users.longestHabitStreak,
        allHabitsCompletedDays: users.allHabitsCompletedDays,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get already unlocked achievement IDs
    const unlockedAchievements = await db
      .select({ achievementId: userAchievements.achievementId })
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId));

    const unlockedIds = unlockedAchievements.map((a) => a.achievementId);

    // Get all locked achievements
    const lockedAchievements = await db
      .select()
      .from(achievements)
      .where(
        unlockedIds.length > 0
          ? notInArray(achievements.id, unlockedIds)
          : undefined
      );

    // Current time context
    const now = new Date();
    const context = {
      currentHour: now.getHours(),
      currentMinute: now.getMinutes(),
      currentDayOfWeek: now.getDay(),
      currentDayOfMonth: now.getDate(),
      currentMonth: now.getMonth(),
    };

    // Check each locked achievement and use transaction for unlocking
    const newlyUnlocked: Achievement[] = [];

    const userStats = {
      level: user.level || 1,
      totalTasksCompleted: user.totalTasksCompleted || 0,
      currentStreak: user.currentStreak || 0,
      longestStreak: user.longestStreak || 0,
      habitsCompleted: user.habitsCompleted || 0,
      habitsCreated: user.habitsCreated || 0,
      habitStreak: user.habitStreak || 0,
      longestHabitStreak: user.longestHabitStreak || 0,
      allHabitsCompletedDays: user.allHabitsCompletedDays || 0,
    };

    // Find achievements that should be unlocked
    const achievementsToUnlock: Achievement[] = [];

    for (const achievement of lockedAchievements) {
      const condition = achievement.conditionValue as AchievementCondition;
      if (!condition) continue;

      const meets = checkCondition(condition, achievement.conditionType, userStats, context);
      if (meets) {
        achievementsToUnlock.push(achievement);
      }
    }

    // Unlock all qualifying achievements in a single transaction
    if (achievementsToUnlock.length > 0) {
      await db.transaction(async (tx) => {
        let totalXpToAdd = 0;

        for (const achievement of achievementsToUnlock) {
          // Unlock achievement
          await tx.insert(userAchievements).values({
            userId,
            achievementId: achievement.id,
          });

          // If achievement unlocks a feature, unlock it
          if (achievement.unlocksFeature) {
            await tx.insert(userFeatures).values({
              userId,
              featureCode: achievement.unlocksFeature,
            }).onConflictDoNothing();
          }

          // Accumulate XP
          if (achievement.xpReward && achievement.xpReward > 0) {
            totalXpToAdd += achievement.xpReward;
          }

          newlyUnlocked.push(achievement);
        }

        // Award all XP at once
        if (totalXpToAdd > 0) {
          const [currentUser] = await tx
            .select({ xp: users.xp })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

          await tx
            .update(users)
            .set({
              xp: (currentUser?.xp || 0) + totalXpToAdd,
              updatedAt: new Date(),
            })
            .where(eq(users.id, userId));
        }
      });
    }

    return NextResponse.json({
      checked: lockedAchievements.length,
      newAchievements: newlyUnlocked,
    });
  } catch (error) {
    logError('POST /api/gamification/achievements/check', error);
    return NextResponse.json(
      { error: 'Failed to check achievements' },
      { status: 500 }
    );
  }
}
