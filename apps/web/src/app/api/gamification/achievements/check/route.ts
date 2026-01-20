import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import {
  users,
  tasks,
  achievements,
  userAchievements,
  userFeatures,
  type Achievement,
  type AchievementCondition,
  type UserPreferences,
} from '@/db/schema';
import { eq, notInArray, sql, and, isNotNull } from 'drizzle-orm';
import { logError } from '@/lib/logger';

// Helper to get day of week and hour in user's timezone
function getDatePartsInTimezone(date: Date, timezone: string): { dayOfWeek: number; hour: number } {
  try {
    // Format the date in the user's timezone to get correct hour and day
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'short',
      hour: 'numeric',
      hour12: false,
    });

    const parts = formatter.formatToParts(date);
    const weekdayPart = parts.find(p => p.type === 'weekday')?.value || '';
    const hourPart = parts.find(p => p.type === 'hour')?.value || '0';

    // Map weekday string to number (0=Sunday, 1=Monday, etc.)
    const weekdayMap: Record<string, number> = {
      'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6
    };

    return {
      dayOfWeek: weekdayMap[weekdayPart] ?? date.getDay(),
      hour: parseInt(hourPart, 10),
    };
  } catch {
    // Fallback to UTC if timezone is invalid
    return {
      dayOfWeek: date.getUTCDay(),
      hour: date.getUTCHours(),
    };
  }
}

// Task stats from actual completed tasks - used for achievements that require
// checking specific task properties
interface TaskCompletionStats {
  // Day of week counts (0=Sunday, 1=Monday, etc.)
  byDayOfWeek: Record<number, number>;
  // Hour counts (0-23)
  byHour: Record<number, number>;
  // Period counts
  byPeriod: Record<string, number>;
  // Context counts
  withDescription: number;
  withSubtasks: number;
  withTags: number;
  inProject: number;
  onTime: number;
  wasOverdue: number;
}

// Checks conditions based on user aggregate stats only (fast path)
function checkSimpleCondition(
  condition: AchievementCondition,
  conditionType: string,
  userStats: {
    level: number;
    totalTasksCompleted: number;
    currentStreak: number;
    longestStreak: number;
    habitsCompleted: number;
    habitsCreated: number;
    habitStreak: number;
    longestHabitStreak: number;
    allHabitsCompletedDays: number;
  }
): boolean | 'needs_task_query' {
  switch (conditionType) {
    case 'task_count': {
      // Check if this needs task-level queries
      const needsTaskQuery = !!(
        condition.dayOfWeek !== undefined ||
        condition.period !== undefined ||
        condition.hasDescription ||
        condition.hasSubtasks ||
        condition.hasTags ||
        condition.inProject ||
        condition.onTime ||
        condition.wasOverdue ||
        condition.hour !== undefined ||
        condition.priority ||
        condition.energy
      );

      if (needsTaskQuery) {
        return 'needs_task_query';
      }

      // Simple total count check
      if (condition.timeframe && condition.timeframe !== 'total') {
        return false; // Daily/weekly timeframes need task queries
      }
      return condition.count !== undefined && userStats.totalTasksCompleted >= condition.count;
    }

    case 'streak_days':
      return condition.days !== undefined && userStats.currentStreak >= condition.days;

    case 'longest_streak':
      return condition.days !== undefined && userStats.longestStreak >= condition.days;

    case 'level':
      return condition.level !== undefined && userStats.level >= condition.level;

    case 'time':
      // Time achievements ALWAYS need task query - we check if user ever
      // completed a task at that time, not if current time matches
      return 'needs_task_query';

    case 'habit_count':
      if (condition.timeframe && condition.timeframe !== 'total') {
        return false;
      }
      if (condition.allDone || condition.timeOfDay) {
        return false;
      }
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
      return false;

    default:
      return false;
  }
}

// Check task_count and time achievements using actual task data
function checkTaskBasedCondition(
  condition: AchievementCondition,
  conditionType: string,
  taskStats: TaskCompletionStats
): boolean {
  const requiredCount = condition.count ?? 1;

  // For 'time' type, check if user completed task at specified time
  if (conditionType === 'time') {
    if (condition.dayOfWeek !== undefined) {
      return (taskStats.byDayOfWeek[condition.dayOfWeek] ?? 0) >= requiredCount;
    }
    if (condition.hour !== undefined) {
      return (taskStats.byHour[condition.hour] ?? 0) >= requiredCount;
    }
    if (condition.period !== undefined) {
      return (taskStats.byPeriod[condition.period] ?? 0) >= requiredCount;
    }
    return false;
  }

  // For 'task_count' type with filters
  if (conditionType === 'task_count') {
    // Day of week filter
    if (condition.dayOfWeek !== undefined) {
      return (taskStats.byDayOfWeek[condition.dayOfWeek] ?? 0) >= requiredCount;
    }

    // Hour filter
    if (condition.hour !== undefined) {
      return (taskStats.byHour[condition.hour] ?? 0) >= requiredCount;
    }

    // Period filter
    if (condition.period !== undefined) {
      return (taskStats.byPeriod[condition.period] ?? 0) >= requiredCount;
    }

    // Context filters
    if (condition.hasDescription) {
      return taskStats.withDescription >= requiredCount;
    }
    if (condition.hasSubtasks) {
      return taskStats.withSubtasks >= requiredCount;
    }
    if (condition.hasTags) {
      return taskStats.withTags >= requiredCount;
    }
    if (condition.inProject) {
      return taskStats.inProject >= requiredCount;
    }
    if (condition.onTime) {
      return taskStats.onTime >= requiredCount;
    }
    if (condition.wasOverdue) {
      return taskStats.wasOverdue >= requiredCount;
    }
  }

  return false;
}

// Query actual task completion data for a user
async function getTaskCompletionStats(userId: string, userTimezone: string = 'UTC'): Promise<TaskCompletionStats> {
  // Get all completed tasks with their completion timestamps
  const completedTasks = await db
    .select({
      completedAt: tasks.completedAt,
      description: tasks.description,
      parentTaskId: tasks.parentTaskId,
      tags: tasks.tags,
      projectId: tasks.projectId,
      dueDate: tasks.dueDate,
    })
    .from(tasks)
    .where(and(
      eq(tasks.userId, userId),
      eq(tasks.status, 'done'),
      isNotNull(tasks.completedAt)
    ));

  const stats: TaskCompletionStats = {
    byDayOfWeek: {},
    byHour: {},
    byPeriod: {},
    withDescription: 0,
    withSubtasks: 0,
    withTags: 0,
    inProject: 0,
    onTime: 0,
    wasOverdue: 0,
  };

  // Count subtasks (tasks that have this task as parent)
  const subtaskCounts = await db
    .select({
      parentId: tasks.parentTaskId,
      count: sql<number>`count(*)`.as('count'),
    })
    .from(tasks)
    .where(and(
      eq(tasks.userId, userId),
      isNotNull(tasks.parentTaskId)
    ))
    .groupBy(tasks.parentTaskId);

  const subtaskMap = new Map(
    subtaskCounts.map(s => [s.parentId, Number(s.count)])
  );

  for (const task of completedTasks) {
    if (!task.completedAt) continue;

    const completedDate = new Date(task.completedAt);

    // Get day of week and hour in user's timezone
    const { dayOfWeek, hour } = getDatePartsInTimezone(completedDate, userTimezone);

    // Count by day of week
    stats.byDayOfWeek[dayOfWeek] = (stats.byDayOfWeek[dayOfWeek] ?? 0) + 1;

    // Count by hour
    stats.byHour[hour] = (stats.byHour[hour] ?? 0) + 1;

    // Count by period (based on user's local time)
    let period: string;
    if (hour >= 5 && hour < 12) period = 'morning';
    else if (hour >= 12 && hour < 17) period = 'afternoon';
    else if (hour >= 17 && hour < 21) period = 'evening';
    else period = 'night';
    stats.byPeriod[period] = (stats.byPeriod[period] ?? 0) + 1;

    // Context counts
    if (task.description && task.description.trim().length > 0) {
      stats.withDescription++;
    }
    if (task.tags && task.tags.length > 0) {
      stats.withTags++;
    }
    if (task.projectId) {
      stats.inProject++;
    }

    // Check due date vs completion
    if (task.dueDate) {
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(23, 59, 59, 999);
      if (completedDate <= dueDate) {
        stats.onTime++;
      } else {
        stats.wasOverdue++;
      }
    }
  }

  // Count tasks with subtasks
  for (const task of completedTasks) {
    // We can't easily check subtasks from the query above
    // For now, count tasks that ARE subtasks (have parentTaskId)
    // This is a simplification - "has subtasks" would need another query
  }

  // Get count of completed tasks that have subtasks
  const tasksWithSubtasks = await db
    .select({
      count: sql<number>`count(distinct ${tasks.parentTaskId})`.as('count'),
    })
    .from(tasks)
    .where(and(
      eq(tasks.userId, userId),
      isNotNull(tasks.parentTaskId)
    ));

  stats.withSubtasks = Number(tasksWithSubtasks[0]?.count ?? 0);

  return stats;
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user stats and preferences (for timezone)
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
        // Preferences (for timezone)
        preferences: users.preferences,
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

    // First pass: check simple conditions (no DB query needed)
    const achievementsToUnlock: Achievement[] = [];
    const needsTaskQuery: Achievement[] = [];

    for (const achievement of lockedAchievements) {
      const condition = achievement.conditionValue as AchievementCondition;
      if (!condition) continue;

      const result = checkSimpleCondition(condition, achievement.conditionType, userStats);
      if (result === true) {
        achievementsToUnlock.push(achievement);
      } else if (result === 'needs_task_query') {
        needsTaskQuery.push(achievement);
      }
      // If result === false, skip this achievement
    }

    // Second pass: check achievements that need task query (only if there are any)
    if (needsTaskQuery.length > 0) {
      // Get user's timezone from preferences (default to UTC)
      const userTimezone = (user.preferences as UserPreferences)?.timezone || 'UTC';
      const taskStats = await getTaskCompletionStats(userId, userTimezone);

      for (const achievement of needsTaskQuery) {
        const condition = achievement.conditionValue as AchievementCondition;
        if (!condition) continue;

        const meets = checkTaskBasedCondition(condition, achievement.conditionType, taskStats);
        if (meets) {
          achievementsToUnlock.push(achievement);
        }
      }
    }

    // Unlock all qualifying achievements in a single transaction
    const newlyUnlocked: Achievement[] = [];

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
