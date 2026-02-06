'use client';

/**
 * Daily Quests Hook
 * Fetches today's quests and provides progress tracking
 */

import { useState, useEffect, useCallback } from 'react';

interface Quest {
  id: string;
  questType: string;
  target: number;
  progress: number;
  completed: boolean;
  xpReward: number;
  label: string;
  emoji: string;
}

interface UseQuestsReturn {
  quests: Quest[];
  loading: boolean;
  refresh: () => Promise<void>;
  updateProgress: (questType: string, increment?: number) => Promise<{
    justCompleted: boolean;
    xpAwarded: number;
  }>;
}

export function useQuests(): UseQuestsReturn {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/gamification/quests');
      if (!res.ok) return;
      const data = await res.json();
      setQuests(data.quests || []);
    } catch {
      // Ignore errors
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateProgress = useCallback(async (questType: string, increment = 1) => {
    try {
      const res = await fetch('/api/gamification/quests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questType, increment }),
      });
      if (!res.ok) return { justCompleted: false, xpAwarded: 0 };
      const data = await res.json();

      // Update local state
      if (data.quest) {
        setQuests(prev => prev.map(q =>
          q.questType === questType ? { ...q, progress: data.quest.progress, completed: data.quest.completed } : q
        ));
      }

      return { justCompleted: data.justCompleted || false, xpAwarded: data.xpAwarded || 0 };
    } catch {
      return { justCompleted: false, xpAwarded: 0 };
    }
  }, []);

  return { quests, loading, refresh, updateProgress };
}
