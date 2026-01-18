import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import {
  users,
  creatures,
  userCreatures,
  type Creature,
  type CreatureSpawnCondition,
} from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { logError } from '@/lib/logger';

// Check if spawn conditions are met
function checkSpawnConditions(
  conditions: CreatureSpawnCondition | null,
  context: {
    onTaskComplete?: boolean;
    isQuickTask?: boolean;
    streakDays: number;
    level: number;
    currentHour: number;
  }
): boolean {
  if (!conditions) {
    // No conditions = can always spawn (based on spawn_chance)
    return true;
  }

  // Check each condition - ALL must be met
  if (conditions.onTaskComplete && !context.onTaskComplete) return false;
  if (conditions.onQuickTask && !context.isQuickTask) return false;
  if (conditions.onStreakDay && context.streakDays < conditions.onStreakDay) return false;
  if (conditions.onLevel && context.level < conditions.onLevel) return false;

  if (conditions.onTimeRange) {
    const { startHour, endHour } = conditions.onTimeRange;
    if (context.currentHour < startHour || context.currentHour >= endHour) return false;
  }

  return true;
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get optional context from body
    let body: { onTaskComplete?: boolean; isQuickTask?: boolean } = {};
    try {
      body = await request.json();
    } catch {
      // Empty body is ok
    }

    // Get user stats
    const [user] = await db
      .select({
        level: users.level,
        currentStreak: users.currentStreak,
        totalCreatures: users.totalCreatures,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const now = new Date();
    const context = {
      onTaskComplete: body.onTaskComplete ?? true,
      isQuickTask: body.isQuickTask ?? false,
      streakDays: user.currentStreak || 0,
      level: user.level || 1,
      currentHour: now.getHours(),
    };

    // Get all creatures
    const allCreatures = await db.select().from(creatures);

    // Filter to eligible creatures
    const eligibleCreatures = allCreatures.filter((creature) => {
      const conditions = creature.spawnConditions as CreatureSpawnCondition | null;
      return checkSpawnConditions(conditions, context);
    });

    if (eligibleCreatures.length === 0) {
      return NextResponse.json({ creature: null, reason: 'No eligible creatures' });
    }

    // Calculate total spawn weight
    const totalWeight = eligibleCreatures.reduce(
      (sum, c) => sum + (c.spawnChance || 100),
      0
    );

    // Roll for spawn (base 30% chance that ANY creature spawns)
    const spawnRoll = Math.random();
    if (spawnRoll > 0.3) {
      return NextResponse.json({ creature: null, reason: 'Spawn roll failed' });
    }

    // Pick a creature based on weights
    let roll = Math.random() * totalWeight;
    let selectedCreature: Creature | null = null;

    for (const creature of eligibleCreatures) {
      roll -= creature.spawnChance || 100;
      if (roll <= 0) {
        selectedCreature = creature;
        break;
      }
    }

    if (!selectedCreature) {
      selectedCreature = eligibleCreatures[0]; // Fallback
    }

    // Check if user already has this creature
    const [existingUserCreature] = await db
      .select()
      .from(userCreatures)
      .where(
        and(
          eq(userCreatures.userId, userId),
          eq(userCreatures.creatureId, selectedCreature.id)
        )
      )
      .limit(1);

    if (existingUserCreature) {
      // Increment count
      await db
        .update(userCreatures)
        .set({
          count: (existingUserCreature.count || 1) + 1,
        })
        .where(eq(userCreatures.id, existingUserCreature.id));
    } else {
      // Add new creature
      await db.insert(userCreatures).values({
        userId,
        creatureId: selectedCreature.id,
        count: 1,
      });

      // Update user's total creatures count
      await db
        .update(users)
        .set({
          totalCreatures: (user.totalCreatures || 0) + 1,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    }

    return NextResponse.json({
      creature: selectedCreature,
      isNew: !existingUserCreature,
      newCount: existingUserCreature ? (existingUserCreature.count || 1) + 1 : 1,
    });
  } catch (error) {
    logError('POST /api/gamification/creatures/spawn', error);
    return NextResponse.json(
      { error: 'Failed to spawn creature' },
      { status: 500 }
    );
  }
}
