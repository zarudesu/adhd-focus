'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Task } from '@/db/schema';
import {
  getPendingProgress,
  clearPendingProgress,
  type PendingProgress,
} from '@/lib/pending-progress';

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
  pendingProgress: PendingProgress | null;
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
  userId?: string | null,
): UseMorningReviewReturn {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(getTodayKey()) === 'true';
  });

  const loading = habitsLoading;

  const data = useMemo<MorningReviewData>(() => {
    const habits = habitsReviewData?.needsReview ? habitsReviewData.habits : [];
    const pendingProgress = userId ? getPendingProgress(userId) : null;
    const needsReview = overdueTasks.length > 0 || habits.length > 0 || pendingProgress !== null;
    return { overdueTasks, habits, needsReview, pendingProgress };
  }, [overdueTasks, habitsReviewData, userId]);

  const dismiss = () => {
    localStorage.setItem(getTodayKey(), 'true');
    // Clear pending progress when review is dismissed (seen or skipped)
    if (userId) {
      clearPendingProgress(userId);
    }
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
