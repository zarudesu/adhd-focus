/**
 * Focus Sessions API
 * POST /api/focus/sessions - Start a new focus session
 * GET /api/focus/sessions - Get today's focus sessions
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { focusSessions, users, tasks } from '@/db/schema';
import { eq, and, gte, desc } from 'drizzle-orm';

// POST - Start a new focus session
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { taskId } = body;

    // Create new focus session
    const [focusSession] = await db
      .insert(focusSessions)
      .values({
        userId: session.user.id,
        taskId: taskId || null,
        startedAt: new Date(),
        durationMinutes: 0,
        pomodoros: 0,
        breaksTaken: 0,
        completed: false,
      })
      .returning();

    return NextResponse.json(focusSession);
  } catch (error) {
    console.error('Failed to create focus session:', error);
    return NextResponse.json(
      { error: 'Failed to create focus session' },
      { status: 500 }
    );
  }
}

// GET - Get today's focus sessions
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get today's start
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get focus sessions from today
    const sessions = await db
      .select({
        id: focusSessions.id,
        taskId: focusSessions.taskId,
        startedAt: focusSessions.startedAt,
        endedAt: focusSessions.endedAt,
        durationMinutes: focusSessions.durationMinutes,
        pomodoros: focusSessions.pomodoros,
        breaksTaken: focusSessions.breaksTaken,
        completed: focusSessions.completed,
        taskTitle: tasks.title,
      })
      .from(focusSessions)
      .leftJoin(tasks, eq(focusSessions.taskId, tasks.id))
      .where(
        and(
          eq(focusSessions.userId, userId),
          gte(focusSessions.startedAt, today)
        )
      )
      .orderBy(desc(focusSessions.startedAt));

    // Get user's total pomodoros
    const [user] = await db
      .select({
        totalPomodoros: users.totalPomodoros,
        totalFocusMinutes: users.totalFocusMinutes,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    // Calculate today's stats
    const todayStats = sessions.reduce(
      (acc, s) => ({
        pomodoros: acc.pomodoros + (s.pomodoros || 0),
        focusMinutes: acc.focusMinutes + (s.durationMinutes || 0),
        sessionsCompleted: acc.sessionsCompleted + (s.completed ? 1 : 0),
      }),
      { pomodoros: 0, focusMinutes: 0, sessionsCompleted: 0 }
    );

    return NextResponse.json({
      sessions,
      todayStats,
      totalStats: {
        totalPomodoros: user?.totalPomodoros || 0,
        totalFocusMinutes: user?.totalFocusMinutes || 0,
      },
    });
  } catch (error) {
    console.error('Failed to fetch focus sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch focus sessions' },
      { status: 500 }
    );
  }
}
