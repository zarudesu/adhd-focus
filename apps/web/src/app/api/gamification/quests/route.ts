/**
 * Daily Quests API
 * GET  — returns today's quests (generates if none exist)
 * POST — updates quest progress
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/mobile-auth';
import { db } from '@/db';
import { dailyQuests, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { logError } from '@/lib/logger';
import { awardXP } from '@/lib/gamification-server';

// Quest pool — definitions for all possible quests
// Selected based on user level and activity
interface QuestTemplate {
  type: string;
  label: string;
  emoji: string;
  target: number;
  xpReward: number;
  minLevel: number;
}

const QUEST_POOL: QuestTemplate[] = [
  // Beginner quests (level 1+)
  { type: 'complete_tasks', label: 'Complete 1 task', emoji: '✅', target: 1, xpReward: 10, minLevel: 1 },
  { type: 'add_tasks', label: 'Add 2 tasks to inbox', emoji: '📝', target: 2, xpReward: 10, minLevel: 1 },

  // Intermediate quests (level 2+)
  { type: 'complete_tasks_3', label: 'Complete 3 tasks', emoji: '🎯', target: 3, xpReward: 25, minLevel: 2 },
  { type: 'check_habits', label: 'Check all habits', emoji: '🧘', target: 1, xpReward: 20, minLevel: 2 },

  // Active quests (level 3+)
  { type: 'complete_tasks_5', label: 'Complete 5 tasks', emoji: '⚡', target: 5, xpReward: 40, minLevel: 3 },
  { type: 'focus_session', label: 'Do 1 pomodoro', emoji: '🍅', target: 1, xpReward: 20, minLevel: 3 },

  // Advanced quests (level 5+)
  { type: 'focus_sessions_3', label: 'Do 3 pomodoros', emoji: '🔥', target: 3, xpReward: 40, minLevel: 5 },
  { type: 'complete_must', label: 'Complete a Must-do task', emoji: '🏆', target: 1, xpReward: 30, minLevel: 5 },

  // Power user (level 8+)
  { type: 'complete_tasks_7', label: 'Complete 7 tasks', emoji: '💪', target: 7, xpReward: 60, minLevel: 8 },
  { type: 'clear_inbox', label: 'Clear your inbox', emoji: '📭', target: 1, xpReward: 35, minLevel: 8 },
];

/**
 * Select 3 quests for a user based on their level.
 * Uses a seeded random based on date + userId for consistency.
 */
function selectQuests(userLevel: number, userId: string, date: string): QuestTemplate[] {
  const eligible = QUEST_POOL.filter(q => q.minLevel <= userLevel);
  if (eligible.length <= 3) return eligible;

  // Simple seeded shuffle based on date + userId
  const seed = hashCode(`${date}-${userId}`);
  const shuffled = [...eligible];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.abs((seed * (i + 1)) % (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, 3);
}

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return hash;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date().toISOString().split('T')[0];

    // Check if quests already exist for today
    const existing = await db
      .select()
      .from(dailyQuests)
      .where(and(
        eq(dailyQuests.userId, user.id),
        eq(dailyQuests.date, today),
      ));

    if (existing.length > 0) {
      return NextResponse.json({ quests: existing, date: today });
    }

    // Get user level to select appropriate quests
    const [dbUser] = await db
      .select({ level: users.level })
      .from(users)
      .where(eq(users.id, user.id));

    const level = dbUser?.level || 1;
    const templates = selectQuests(level, user.id, today);

    // Create quests for today
    const created = await db
      .insert(dailyQuests)
      .values(templates.map(t => ({
        userId: user.id,
        date: today,
        questType: t.type,
        target: t.target,
        xpReward: t.xpReward,
        label: t.label,
        emoji: t.emoji,
      })))
      .returning();

    return NextResponse.json({ quests: created, date: today });
  } catch (error) {
    logError('GET /api/gamification/quests', error);
    return NextResponse.json({ error: 'Failed to fetch quests' }, { status: 500 });
  }
}

// POST — update quest progress
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { questType, increment = 1 } = body;

    if (!questType) {
      return NextResponse.json({ error: 'questType required' }, { status: 400 });
    }

    const today = new Date().toISOString().split('T')[0];

    // Find the quest
    const [quest] = await db
      .select()
      .from(dailyQuests)
      .where(and(
        eq(dailyQuests.userId, user.id),
        eq(dailyQuests.date, today),
        eq(dailyQuests.questType, questType),
      ));

    if (!quest || quest.completed) {
      return NextResponse.json({ quest: quest || null, justCompleted: false });
    }

    const newProgress = Math.min((quest.progress || 0) + increment, quest.target);
    const justCompleted = newProgress >= quest.target;

    // Update progress
    const [updated] = await db
      .update(dailyQuests)
      .set({
        progress: newProgress,
        completed: justCompleted,
      })
      .where(eq(dailyQuests.id, quest.id))
      .returning();

    // Award XP if just completed
    let xpResult = null;
    if (justCompleted) {
      xpResult = await awardXP(user.id, quest.xpReward, 'quest_complete');
    }

    return NextResponse.json({
      quest: updated,
      justCompleted,
      xpAwarded: justCompleted ? quest.xpReward : 0,
      levelUp: xpResult?.levelUp || false,
      newLevel: xpResult?.newLevel,
    });
  } catch (error) {
    logError('POST /api/gamification/quests', error);
    return NextResponse.json({ error: 'Failed to update quest' }, { status: 500 });
  }
}
