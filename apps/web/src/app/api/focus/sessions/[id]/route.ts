/**
 * Focus Session API - Single session operations
 * PATCH /api/focus/sessions/[id] - Update/complete a focus session
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { focusSessions, users, tasks, dailyStats } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH - Update/complete a focus session
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { completed, pomodoros, durationMinutes } = body;

    // Get the current session
    const [existingSession] = await db
      .select()
      .from(focusSessions)
      .where(
        and(
          eq(focusSessions.id, id),
          eq(focusSessions.userId, session.user.id)
        )
      )
      .limit(1);

    if (!existingSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Calculate duration if not provided
    const endedAt = new Date();
    const calculatedDuration = durationMinutes ?? Math.floor(
      (endedAt.getTime() - new Date(existingSession.startedAt).getTime()) / 60000
    );

    // Update the session
    const [updated] = await db
      .update(focusSessions)
      .set({
        endedAt,
        durationMinutes: calculatedDuration,
        pomodoros: pomodoros ?? existingSession.pomodoros,
        completed: completed ?? existingSession.completed,
      })
      .where(eq(focusSessions.id, id))
      .returning();

    // If session completed with pomodoros, update user stats
    if (completed && (pomodoros ?? 0) > 0) {
      const pomodoroCount = pomodoros ?? 1;

      // Update user totals
      await db
        .update(users)
        .set({
          totalPomodoros: sql`${users.totalPomodoros} + ${pomodoroCount}`,
          totalFocusMinutes: sql`${users.totalFocusMinutes} + ${calculatedDuration}`,
        })
        .where(eq(users.id, session.user.id));

      // Update task pomodoros if linked
      if (existingSession.taskId) {
        await db
          .update(tasks)
          .set({
            pomodorosCompleted: sql`${tasks.pomodorosCompleted} + ${pomodoroCount}`,
            actualMinutes: sql`COALESCE(${tasks.actualMinutes}, 0) + ${calculatedDuration}`,
          })
          .where(eq(tasks.id, existingSession.taskId));
      }

      // Update or create daily stats
      const today = new Date().toISOString().split('T')[0];
      const [existingStat] = await db
        .select()
        .from(dailyStats)
        .where(
          and(
            eq(dailyStats.userId, session.user.id),
            eq(dailyStats.date, today)
          )
        )
        .limit(1);

      if (existingStat) {
        await db
          .update(dailyStats)
          .set({
            pomodorosCompleted: sql`${dailyStats.pomodorosCompleted} + ${pomodoroCount}`,
            focusMinutes: sql`${dailyStats.focusMinutes} + ${calculatedDuration}`,
          })
          .where(eq(dailyStats.id, existingStat.id));
      } else {
        await db.insert(dailyStats).values({
          userId: session.user.id,
          date: today,
          pomodorosCompleted: pomodoroCount,
          focusMinutes: calculatedDuration,
        });
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update focus session:', error);
    return NextResponse.json(
      { error: 'Failed to update focus session' },
      { status: 500 }
    );
  }
}
