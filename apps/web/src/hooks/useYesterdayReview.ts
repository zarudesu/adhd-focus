/**
 * useYesterdayReview Hook
 * Manages yesterday's habit review
 */

import { useState, useCallback, useEffect } from 'react';

interface YesterdayHabit {
  id: string;
  name: string;
  emoji: string | null;
  isCompleted: boolean;
  isSkipped: boolean;
}

interface YesterdayReviewData {
  needsReview: boolean;
  yesterdayDate: string;
  habits: YesterdayHabit[];
}

interface UseYesterdayReviewReturn {
  data: YesterdayReviewData | null;
  loading: boolean;
  submitReview: (data: {
    habits: { id: string; completed: boolean; skipped: boolean }[];
    notes?: string;
  }) => Promise<void>;
  skipReview: () => void;
  dismissed: boolean;
}

// Get yesterday's date in YYYY-MM-DD format
function getYesterdayDate(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
}

export function useYesterdayReview(): UseYesterdayReviewReturn {
  const [data, setData] = useState<YesterdayReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  const fetchReviewStatus = useCallback(async () => {
    try {
      const yesterdayDate = getYesterdayDate();
      const res = await fetch(`/api/habits/review?date=${yesterdayDate}`);
      if (!res.ok) {
        throw new Error('Failed to check review status');
      }
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error('Failed to fetch review status:', err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviewStatus();
  }, [fetchReviewStatus]);

  const submitReview = useCallback(async (reviewData: {
    habits: { id: string; completed: boolean; skipped: boolean }[];
    notes?: string;
  }) => {
    const yesterdayDate = getYesterdayDate();

    // Submit habit checks for yesterday
    for (const habit of reviewData.habits) {
      if (habit.completed || habit.skipped) {
        try {
          await fetch(`/api/habits/${habit.id}/check`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              date: yesterdayDate,
              skipped: habit.skipped,
            }),
          });
        } catch (err) {
          console.error(`Failed to check habit ${habit.id}:`, err);
        }
      }
    }

    // Save the review record
    await fetch('/api/habits/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: yesterdayDate,
        notes: reviewData.notes,
        habitsCompleted: reviewData.habits.filter(h => h.completed).length,
        habitsSkipped: reviewData.habits.filter(h => h.skipped).length,
      }),
    });

    setDismissed(true);
  }, []);

  const skipReview = useCallback(() => {
    setDismissed(true);
  }, []);

  return {
    data,
    loading,
    submitReview,
    skipReview,
    dismissed,
  };
}
