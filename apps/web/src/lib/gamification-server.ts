/**
 * Server-only Gamification Utilities
 * Functions that require database access
 */
import 'server-only';

import { db, users } from '@/db';
import { eq } from 'drizzle-orm';
import { levelFromXp } from './gamification';

// Award XP to a user (server-side only)
// Returns { levelUp: boolean, newLevel: number | null }
export async function awardXP(
  userId: string,
  xpAmount: number,
  _source: string
): Promise<{ levelUp: boolean; newLevel: number | null }> {
  // Get current XP and level
  const [user] = await db
    .select({ xp: users.xp, level: users.level })
    .from(users)
    .where(eq(users.id, userId));

  if (!user) {
    return { levelUp: false, newLevel: null };
  }

  const currentXp = user.xp ?? 0;
  const currentLevel = user.level ?? 1;
  const newXp = currentXp + xpAmount;
  const newLevel = levelFromXp(newXp);

  // Update user's XP and level
  await db
    .update(users)
    .set({
      xp: newXp,
      level: newLevel,
    })
    .where(eq(users.id, userId));

  return {
    levelUp: newLevel > currentLevel,
    newLevel: newLevel > currentLevel ? newLevel : null,
  };
}
