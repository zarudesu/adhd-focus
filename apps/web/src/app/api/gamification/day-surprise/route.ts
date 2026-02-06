import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/mobile-auth';
import { db } from '@/db';
import { users, achievements, userAchievements } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // Get user's createdAt
    const [dbUser] = await db
      .select({ createdAt: users.createdAt })
      .from(users)
      .where(eq(users.id, userId));

    if (!dbUser?.createdAt) {
      return NextResponse.json({ eligible: false });
    }

    // Calculate account age in days
    const accountAge = Math.floor(
      (Date.now() - new Date(dbUser.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Only eligible on days 3-5
    if (accountAge < 3 || accountAge > 5) {
      return NextResponse.json({ eligible: false });
    }

    // Check if "still_here" achievement exists
    const [achievement] = await db
      .select()
      .from(achievements)
      .where(eq(achievements.code, 'still_here'));

    if (!achievement) {
      return NextResponse.json({ eligible: false });
    }

    // Check if already awarded
    const [existing] = await db
      .select()
      .from(userAchievements)
      .where(
        and(
          eq(userAchievements.userId, userId),
          eq(userAchievements.achievementId, achievement.id),
        )
      );

    if (existing) {
      return NextResponse.json({ eligible: false, alreadyClaimed: true });
    }

    // Award the achievement
    await db.insert(userAchievements).values({
      userId,
      achievementId: achievement.id,
    });

    // Award bonus XP via the XP endpoint
    const bonusXp = achievement.xpReward;
    await fetch(new URL('/api/gamification/xp', request.url), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        cookie: request.headers.get('cookie') || '',
      },
      body: JSON.stringify({ amount: bonusXp, reason: 'day_surprise' }),
    });

    return NextResponse.json({
      eligible: true,
      achievement,
      xpAwarded: bonusXp,
      accountAge,
    });
  } catch (error) {
    console.error('Day surprise error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
