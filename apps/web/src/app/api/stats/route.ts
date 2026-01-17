/**
 * Stats API
 * GET /api/stats - Get user's historical daily stats
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { dailyStats, users } from '@/db/schema';
import { eq, and, gte, desc } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7', 10);

    // Calculate start date
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);
    const startDateStr = startDate.toISOString().split('T')[0];

    // Get daily stats for the period
    const stats = await db
      .select()
      .from(dailyStats)
      .where(
        and(
          eq(dailyStats.userId, userId),
          gte(dailyStats.date, startDateStr)
        )
      )
      .orderBy(desc(dailyStats.date));

    // Get user totals
    const [user] = await db
      .select({
        totalPomodoros: users.totalPomodoros,
        totalFocusMinutes: users.totalFocusMinutes,
        totalTasksCompleted: users.totalTasksCompleted,
        currentStreak: users.currentStreak,
        longestStreak: users.longestStreak,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    // Calculate period totals
    const periodTotals = stats.reduce(
      (acc, s) => ({
        tasksCompleted: acc.tasksCompleted + (s.tasksCompleted || 0),
        pomodorosCompleted: acc.pomodorosCompleted + (s.pomodorosCompleted || 0),
        focusMinutes: acc.focusMinutes + (s.focusMinutes || 0),
        xpEarned: acc.xpEarned + (s.xpEarned || 0),
      }),
      { tasksCompleted: 0, pomodorosCompleted: 0, focusMinutes: 0, xpEarned: 0 }
    );

    // Fill in missing days with zeros
    const filledStats = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const existing = stats.find(s => s.date === dateStr);
      filledStats.push({
        date: dateStr,
        tasksCompleted: existing?.tasksCompleted || 0,
        pomodorosCompleted: existing?.pomodorosCompleted || 0,
        focusMinutes: existing?.focusMinutes || 0,
        xpEarned: existing?.xpEarned || 0,
        streakMaintained: existing?.streakMaintained || false,
      });
    }

    return NextResponse.json({
      dailyStats: filledStats,
      periodTotals,
      allTime: {
        totalPomodoros: user?.totalPomodoros || 0,
        totalFocusMinutes: user?.totalFocusMinutes || 0,
        totalTasksCompleted: user?.totalTasksCompleted || 0,
        currentStreak: user?.currentStreak || 0,
        longestStreak: user?.longestStreak || 0,
      },
    });
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
