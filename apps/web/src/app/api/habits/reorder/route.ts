/**
 * Habits Reorder API
 * POST /api/habits/reorder - Update sort order for multiple habits
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/mobile-auth';
import { db } from '@/db';
import { habits } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { logError } from '@/lib/logger';

interface ReorderItem {
  id: string;
  sortOrder: number;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;
    const body = await request.json();
    const { habits: updates } = body as { habits: ReorderItem[] };

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: habits array required' },
        { status: 400 }
      );
    }

    // Update each habit's sort order
    // Only update habits owned by this user
    await Promise.all(
      updates.map(async (item) => {
        await db
          .update(habits)
          .set({ sortOrder: item.sortOrder })
          .where(
            and(
              eq(habits.id, item.id),
              eq(habits.userId, userId)
            )
          );
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    logError('POST /api/habits/reorder', error);
    return NextResponse.json(
      { error: 'Failed to reorder habits' },
      { status: 500 }
    );
  }
}
