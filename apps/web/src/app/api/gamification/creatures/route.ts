/**
 * Creatures Collection API
 * GET /api/gamification/creatures - Get user's creature collection
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/mobile-auth';
import { db } from '@/db';
import { creatures, userCreatures, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { logError } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // Get user's total creatures count
    const [dbUser] = await db
      .select({
        totalCreatures: users.totalCreatures,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    // Get all creatures (for showing locked ones)
    const allCreatures = await db
      .select()
      .from(creatures)
      .orderBy(creatures.rarity, creatures.name);

    // Get user's caught creatures
    const userCollection = await db
      .select({
        creatureId: userCreatures.creatureId,
        count: userCreatures.count,
        firstCaughtAt: userCreatures.firstCaughtAt,
      })
      .from(userCreatures)
      .where(eq(userCreatures.userId, userId))
      .orderBy(desc(userCreatures.firstCaughtAt));

    // Create a map for quick lookup
    const collectionMap = new Map(
      userCollection.map((uc) => [uc.creatureId, { count: uc.count, firstCaughtAt: uc.firstCaughtAt }])
    );

    // Map creatures with user collection data
    const result = allCreatures.map((creature) => {
      const userCreatureData = collectionMap.get(creature.id);
      return {
        id: creature.id,
        code: creature.code,
        name: creature.name,
        emoji: creature.emoji,
        description: creature.description,
        rarity: creature.rarity,
        // Show creature details only if caught
        isCaught: !!userCreatureData,
        count: userCreatureData?.count || 0,
        firstCaughtAt: userCreatureData?.firstCaughtAt || null,
        // Bonus info
        xpMultiplier: creature.xpMultiplier,
      };
    });

    // Sort: caught creatures first, then by rarity
    const rarityOrder = ['common', 'uncommon', 'rare', 'legendary', 'mythic', 'secret'];
    result.sort((a, b) => {
      // Caught first
      if (a.isCaught && !b.isCaught) return -1;
      if (!a.isCaught && b.isCaught) return 1;
      // Then by rarity
      return rarityOrder.indexOf(a.rarity || 'common') - rarityOrder.indexOf(b.rarity || 'common');
    });

    // Calculate stats
    const caughtCount = result.filter(c => c.isCaught).length;
    const totalCount = result.length;

    // Count by rarity
    const byRarity = result.reduce((acc, c) => {
      const rarity = c.rarity || 'common';
      if (!acc[rarity]) {
        acc[rarity] = { total: 0, caught: 0 };
      }
      acc[rarity].total++;
      if (c.isCaught) acc[rarity].caught++;
      return acc;
    }, {} as Record<string, { total: number; caught: number }>);

    return NextResponse.json({
      creatures: result,
      stats: {
        total: totalCount,
        caught: caughtCount,
        totalCreaturesCaught: dbUser?.totalCreatures || 0, // Total including duplicates
        byRarity,
      },
    });
  } catch (error) {
    logError('GET /api/gamification/creatures', error);
    return NextResponse.json(
      { error: 'Failed to fetch creatures' },
      { status: 500 }
    );
  }
}
