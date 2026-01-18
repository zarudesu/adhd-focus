/**
 * useHabits Hook
 * Manages habits and habit checks with optimistic updates
 */

import { useState, useCallback, useEffect } from 'react';
import type { Habit, HabitCheck } from '@/db/schema';

interface HabitWithStatus extends Habit {
  shouldDoToday: boolean;
  todayCheck: HabitCheck | null;
  isCompleted: boolean;
  isSkipped: boolean;
}

interface HabitsSummary {
  totalHabits: number;
  habitsForToday: number;
  completed: number;
  skipped: number;
  remaining: number;
  allDone: boolean;
  progress: number;
}

interface CheckResult {
  check: HabitCheck;
  xpAwarded: number;
  habitXp: number;
  bonusXp: number;
  allHabitsDone: boolean;
  levelUp: boolean | null;
  newLevel: number | null;
}

interface UseHabitsReturn {
  habits: HabitWithStatus[];
  summary: HabitsSummary;
  loading: boolean;
  error: Error | null;
  date: string;
  refresh: () => Promise<void>;
  create: (input: CreateHabitInput) => Promise<Habit>;
  update: (id: string, input: UpdateHabitInput) => Promise<Habit>;
  archive: (id: string) => Promise<void>;
  check: (id: string, skipped?: boolean, reflection?: string) => Promise<CheckResult>;
  uncheck: (id: string) => Promise<void>;
}

interface CreateHabitInput {
  name: string;
  emoji?: string;
  description?: string;
  frequency?: 'daily' | 'weekdays' | 'weekends' | 'custom';
  customDays?: number[];
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night' | 'anytime';
  color?: string;
}

interface UpdateHabitInput extends Partial<CreateHabitInput> {
  sortOrder?: number;
}

// Get today's date in YYYY-MM-DD format
function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function useHabits(): UseHabitsReturn {
  const [habits, setHabits] = useState<HabitWithStatus[]>([]);
  const [summary, setSummary] = useState<HabitsSummary>({
    totalHabits: 0,
    habitsForToday: 0,
    completed: 0,
    skipped: 0,
    remaining: 0,
    allDone: false,
    progress: 0,
  });
  const [date, setDate] = useState<string>(getTodayDate());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchHabits = useCallback(async () => {
    try {
      const res = await fetch(`/api/habits/today?date=${date}`);
      if (!res.ok) {
        throw new Error('Failed to fetch habits');
      }
      const data = await res.json();
      setHabits(data.habits);
      setSummary(data.summary);
      setDate(data.date);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const create = useCallback(async (input: CreateHabitInput): Promise<Habit> => {
    const res = await fetch('/api/habits', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to create habit');
    }

    const newHabit = await res.json();
    await fetchHabits(); // Refresh to get updated list with status
    return newHabit;
  }, [fetchHabits]);

  const update = useCallback(async (id: string, input: UpdateHabitInput): Promise<Habit> => {
    const res = await fetch(`/api/habits/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to update habit');
    }

    const updated = await res.json();
    await fetchHabits();
    return updated;
  }, [fetchHabits]);

  const archive = useCallback(async (id: string): Promise<void> => {
    const res = await fetch(`/api/habits/${id}`, {
      method: 'DELETE',
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to archive habit');
    }

    await fetchHabits();
  }, [fetchHabits]);

  const check = useCallback(async (
    id: string,
    skipped = false,
    reflection?: string
  ): Promise<CheckResult> => {
    // Optimistic update
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      return {
        ...h,
        isCompleted: !skipped,
        isSkipped: skipped,
        todayCheck: {
          id: 'temp',
          habitId: id,
          userId: '',
          date,
          checkedAt: new Date(),
          skipped,
          reflection: reflection || null,
          blockers: null,
          xpAwarded: skipped ? 0 : 5,
        },
      };
    }));

    try {
      const res = await fetch(`/api/habits/${id}/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, skipped, reflection }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to check habit');
      }

      const result = await res.json();
      await fetchHabits(); // Refresh to get accurate summary
      return result;
    } catch (err) {
      // Revert on error
      await fetchHabits();
      throw err;
    }
  }, [date, fetchHabits]);

  const uncheck = useCallback(async (id: string): Promise<void> => {
    // Optimistic update
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      return {
        ...h,
        isCompleted: false,
        isSkipped: false,
        todayCheck: null,
      };
    }));

    try {
      const res = await fetch(`/api/habits/${id}/check?date=${date}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to uncheck habit');
      }

      await fetchHabits();
    } catch (err) {
      await fetchHabits();
      throw err;
    }
  }, [date, fetchHabits]);

  return {
    habits,
    summary,
    loading,
    error,
    date,
    refresh: fetchHabits,
    create,
    update,
    archive,
    check,
    uncheck,
  };
}
