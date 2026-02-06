/**
 * Habits Hook
 */
import { useState, useEffect, useCallback } from 'react';
import { habitsApi } from '../api/habits';
import type { Habit } from '../types';

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await habitsApi.list();
      setHabits(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch habits'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const check = useCallback(async (id: string, date: string) => {
    const result = await habitsApi.check(id, date);
    await fetch();
    return result;
  }, [fetch]);

  const uncheck = useCallback(async (id: string, date: string) => {
    await habitsApi.uncheck(id, date);
    await fetch();
  }, [fetch]);

  const morningHabits = habits.filter((h) => h.timeOfDay === 'morning');
  const afternoonHabits = habits.filter((h) => h.timeOfDay === 'afternoon');
  const eveningHabits = habits.filter((h) => h.timeOfDay === 'evening' || h.timeOfDay === 'night');
  const anytimeHabits = habits.filter((h) => h.timeOfDay === 'anytime' || !h.timeOfDay);

  return {
    habits,
    loading,
    error,
    fetch,
    check,
    uncheck,
    morningHabits,
    afternoonHabits,
    eveningHabits,
    anytimeHabits,
  };
}
