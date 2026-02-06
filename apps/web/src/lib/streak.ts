/**
 * Streak Engine
 *
 * Manages daily activity streaks with shield protection.
 * - Streak increments when user is active on consecutive days
 * - Every 7-day streak milestone earns 1 shield (max 3)
 * - If a day is missed, a shield is consumed to protect the streak
 * - If no shields, streak resets to 1
 */
import 'server-only';

import { db, users } from '@/db';
import { eq } from 'drizzle-orm';

const MAX_SHIELDS = 3;
const SHIELD_EARN_INTERVAL = 7; // Earn a shield every 7 days

interface StreakResult {
  currentStreak: number;
  longestStreak: number;
  streakShields: number;
  shieldUsed: boolean;
  shieldEarned: boolean;
  streakBroken: boolean;
}

/**
 * Update streak for a user based on their last active date.
 * Call this whenever a user completes a task or habit.
 */
export async function updateStreak(userId: string): Promise<StreakResult> {
  const [user] = await db
    .select({
      currentStreak: users.currentStreak,
      longestStreak: users.longestStreak,
      streakShields: users.streakShields,
      lastActiveDate: users.lastActiveDate,
    })
    .from(users)
    .where(eq(users.id, userId));

  if (!user) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      streakShields: 0,
      shieldUsed: false,
      shieldEarned: false,
      streakBroken: false,
    };
  }

  const today = new Date().toISOString().split('T')[0];
  const lastActive = user.lastActiveDate;
  let currentStreak = user.currentStreak ?? 0;
  let longestStreak = user.longestStreak ?? 0;
  let shields = user.streakShields ?? 0;
  let shieldUsed = false;
  let shieldEarned = false;
  let streakBroken = false;

  if (!lastActive) {
    // First activity ever
    currentStreak = 1;
  } else if (lastActive === today) {
    // Already active today — no streak change
    return {
      currentStreak,
      longestStreak,
      streakShields: shields,
      shieldUsed: false,
      shieldEarned: false,
      streakBroken: false,
    };
  } else {
    const lastDate = new Date(lastActive + 'T00:00:00Z');
    const todayDate = new Date(today + 'T00:00:00Z');
    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      // Consecutive day — extend streak
      currentStreak += 1;
    } else if (diffDays === 2 && shields > 0) {
      // Missed exactly 1 day — use a shield
      shields -= 1;
      currentStreak += 1; // Shield preserves continuity
      shieldUsed = true;
    } else {
      // Missed too many days or no shields — streak breaks
      streakBroken = currentStreak > 0;
      currentStreak = 1;
    }
  }

  // Check if a new shield was earned (every 7-day milestone)
  if (currentStreak > 0 && currentStreak % SHIELD_EARN_INTERVAL === 0 && shields < MAX_SHIELDS) {
    shields += 1;
    shieldEarned = true;
  }

  // Update longest streak
  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  // Persist
  await db
    .update(users)
    .set({
      currentStreak,
      longestStreak,
      streakShields: shields,
      lastActiveDate: today,
    })
    .where(eq(users.id, userId));

  return {
    currentStreak,
    longestStreak,
    streakShields: shields,
    shieldUsed,
    shieldEarned,
    streakBroken,
  };
}
