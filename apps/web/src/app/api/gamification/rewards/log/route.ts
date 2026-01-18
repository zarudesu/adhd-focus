import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { users, rewardLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { logError } from '@/lib/logger';

// Rarity hierarchy for "rarest seen" tracking
const RARITY_ORDER = ['common', 'uncommon', 'rare', 'legendary', 'mythic'];

function isRarer(a: string, b: string | null): boolean {
  if (!b) return true;
  return RARITY_ORDER.indexOf(a) > RARITY_ORDER.indexOf(b);
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { rarity, effect, trigger } = body;

    if (!rarity || !effect) {
      return NextResponse.json(
        { error: 'Rarity and effect are required' },
        { status: 400 }
      );
    }

    // Log the reward
    await db.insert(rewardLogs).values({
      userId,
      rewardType: effect,
      rarity,
      triggeredBy: trigger,
    });

    // Update rarest reward seen if applicable
    const [user] = await db
      .select({ rarestRewardSeen: users.rarestRewardSeen })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (user && isRarer(rarity, user.rarestRewardSeen)) {
      await db
        .update(users)
        .set({
          rarestRewardSeen: rarity,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logError('POST /api/gamification/rewards/log', error);
    return NextResponse.json({ error: 'Failed to log reward' }, { status: 500 });
  }
}
