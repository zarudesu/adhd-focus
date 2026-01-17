'use client';

/**
 * Gamification Hook - XP, Levels, Achievements, Creatures
 * Core hook for all gamification logic
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Achievement, Creature, UserAchievement, UserCreature } from '@/db/schema';

// Re-export from shared lib for backwards compatibility
export {
  XP_CONFIG,
  xpForLevel,
  levelFromXp,
  rollReward,
  type RewardRarity,
} from '@/lib/gamification';

import { XP_CONFIG, xpForLevel, levelFromXp, type RewardRarity } from '@/lib/gamification';

export function xpToNextLevel(currentXp: number): {
  currentLevel: number;
  xpInLevel: number;
  xpNeeded: number;
  progress: number;
} {
  const currentLevel = levelFromXp(currentXp);
  const currentLevelXp = xpForLevel(currentLevel);
  const nextLevelXp = xpForLevel(currentLevel + 1);
  const xpInLevel = currentXp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;
  const progress = xpNeeded > 0 ? (xpInLevel / xpNeeded) * 100 : 100;

  return { currentLevel, xpInLevel, xpNeeded, progress };
}

// Calculate XP for a completed task
export function calculateTaskXp(task: {
  priority?: string | null;
  energyRequired?: string | null;
  estimatedMinutes?: number | null;
  dueDate?: string | null;
  completedAt?: string | null;
}, streakDays: number = 0): number {
  let xp = XP_CONFIG.taskComplete;

  // Quick task bonus
  if (task.estimatedMinutes && task.estimatedMinutes <= 5) {
    xp += XP_CONFIG.quickTaskBonus;
  }

  // Priority multiplier
  const priority = task.priority || 'should';
  const multiplier = XP_CONFIG.priorityMultiplier[priority as keyof typeof XP_CONFIG.priorityMultiplier] || 1;
  xp *= multiplier;

  // Energy bonus
  const energy = task.energyRequired || 'medium';
  xp += XP_CONFIG.energyBonus[energy as keyof typeof XP_CONFIG.energyBonus] || 0;

  // Deadline bonus
  if (task.dueDate && task.completedAt) {
    const due = new Date(task.dueDate);
    const completed = new Date(task.completedAt);
    if (completed <= due) {
      xp += XP_CONFIG.deadlineBonus;
    }
  }

  // Streak multiplier
  const streakMultiplier = Math.min(
    1 + streakDays * XP_CONFIG.streakMultiplier,
    XP_CONFIG.maxStreakMultiplier
  );
  xp *= streakMultiplier;

  return Math.floor(xp);
}

// Re-export rollRewardEffect as rollReward for backwards compatibility
import { rollReward } from '@/lib/gamification';
export const rollRewardEffect = rollReward;

// Gamification state interface
interface GamificationState {
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  totalTasksCompleted: number;
  totalCreatures: number;
  achievements: (UserAchievement & { achievement: Achievement })[];
  creatures: (UserCreature & { creature: Creature })[];
  recentRewards: { rarity: RewardRarity; effect: string; timestamp: Date }[];
}

interface UseGamificationReturn {
  state: GamificationState | null;
  loading: boolean;
  error: Error | null;

  // XP helpers
  levelProgress: { currentLevel: number; xpInLevel: number; xpNeeded: number; progress: number };

  // Actions
  awardXp: (amount: number, reason?: string) => Promise<void>;
  checkAchievements: () => Promise<Achievement[]>; // Returns newly unlocked
  spawnCreature: () => Promise<Creature | null>; // Returns spawned creature or null
  logReward: (rarity: RewardRarity, effect: string, trigger: string) => Promise<void>;

  // Refresh
  refresh: () => Promise<void>;
}

export function useGamification(): UseGamificationReturn {
  const [state, setState] = useState<GamificationState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch gamification state
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/gamification/stats');
      if (!res.ok) throw new Error('Failed to fetch gamification stats');
      const data = await res.json();
      setState(data);
    } catch (err) {
      // Fallback for new users or missing API
      setState({
        xp: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        totalTasksCompleted: 0,
        totalCreatures: 0,
        achievements: [],
        creatures: [],
        recentRewards: [],
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Level progress calculation
  const levelProgress = useMemo(() => {
    return xpToNextLevel(state?.xp || 0);
  }, [state?.xp]);

  // Award XP to user
  const awardXp = useCallback(async (amount: number, reason?: string) => {
    try {
      const res = await fetch('/api/gamification/xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, reason }),
      });
      if (!res.ok) throw new Error('Failed to award XP');
      const data = await res.json();

      // Update local state optimistically
      setState((prev) => prev ? {
        ...prev,
        xp: data.newXp,
        level: data.newLevel,
      } : null);

      // If level up occurred, it will be handled by the response
      return data;
    } catch (err) {
      console.error('Failed to award XP:', err);
      throw err;
    }
  }, []);

  // Check and unlock achievements
  const checkAchievements = useCallback(async (): Promise<Achievement[]> => {
    try {
      const res = await fetch('/api/gamification/achievements/check', {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to check achievements');
      const data = await res.json();

      // If new achievements were unlocked, refresh state
      if (data.newAchievements?.length > 0) {
        await refresh();
      }

      return data.newAchievements || [];
    } catch (err) {
      console.error('Failed to check achievements:', err);
      return [];
    }
  }, [refresh]);

  // Attempt to spawn a creature
  const spawnCreature = useCallback(async (): Promise<Creature | null> => {
    try {
      const res = await fetch('/api/gamification/creatures/spawn', {
        method: 'POST',
      });
      if (!res.ok) return null;
      const data = await res.json();

      if (data.creature) {
        await refresh();
        return data.creature;
      }
      return null;
    } catch (err) {
      console.error('Failed to spawn creature:', err);
      return null;
    }
  }, [refresh]);

  // Log a visual reward
  const logReward = useCallback(async (
    rarity: RewardRarity,
    effect: string,
    trigger: string
  ) => {
    try {
      await fetch('/api/gamification/rewards/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rarity, effect, trigger }),
      });

      // Update local state
      setState((prev) => prev ? {
        ...prev,
        recentRewards: [
          { rarity, effect, timestamp: new Date() },
          ...prev.recentRewards.slice(0, 9),
        ],
      } : null);
    } catch (err) {
      console.error('Failed to log reward:', err);
    }
  }, []);

  return {
    state,
    loading,
    error,
    levelProgress,
    awardXp,
    checkAchievements,
    spawnCreature,
    logReward,
    refresh,
  };
}

