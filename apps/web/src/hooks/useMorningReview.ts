'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Task } from '@/db/schema';

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

interface MorningReviewData {
  overdueTasks: Task[];
  habits: YesterdayHabit[];
  needsReview: boolean;
}

interface UseMorningReviewReturn {
  data: MorningReviewData;
  loading: boolean;
  dismissed: boolean;
  dismiss: () => void;
}

function getTodayKey(): string {
  return `morning-review-dismissed-${new Date().toISOString().split('T')[0]}`;
}

export function useMorningReview(
  overdueTasks: Task[],
  habitsReviewData: YesterdayReviewData | null,
  habitsLoading: boolean,
): UseMorningReviewReturn {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(getTodayKey()) === 'true';
  });

  const loading = habitsLoading;

  const data = useMemo<MorningReviewData>(() => {
    const habits = habitsReviewData?.needsReview ? habitsReviewData.habits : [];
    const needsReview = overdueTasks.length > 0 || habits.length > 0;
    return { overdueTasks, habits, needsReview };
  }, [overdueTasks, habitsReviewData]);

  const dismiss = () => {
    localStorage.setItem(getTodayKey(), 'true');
    setDismissed(true);
  };

  // Clean up old keys
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const todayKey = getTodayKey();
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('morning-review-dismissed-') && key !== todayKey) {
        localStorage.removeItem(key);
      }
    }
  }, []);

  return { data, loading, dismissed, dismiss };
}
