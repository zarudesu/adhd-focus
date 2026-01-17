'use client';

/**
 * Features Hook - Progressive feature unlocking system
 * Manages which features are available to the user based on level and achievements
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { FEATURE_CODES, type FeatureCode } from '@/db/schema';

interface Feature {
  code: FeatureCode;
  name: string;
  description: string;
  unlockLevel?: number;
  unlockTaskCount?: number;
  unlockAchievementCode?: string;
  icon?: string;
  unlockedAt?: string;
}

interface UserGamificationStats {
  level: number;
  xp: number;
  totalTasksCompleted: number;
  unlockedFeatures: string[];
  unlockedAchievements: string[];
}

interface UseFeaturesReturn {
  features: Feature[];
  unlockedFeatures: Set<FeatureCode>;
  loading: boolean;
  error: Error | null;
  isUnlocked: (code: FeatureCode) => boolean;
  getNextUnlock: () => Feature | null;
  refreshFeatures: () => Promise<void>;
}

// Default features with unlock conditions
const DEFAULT_FEATURES: Feature[] = [
  { code: FEATURE_CODES.INBOX, name: 'Inbox', description: 'Capture tasks quickly', unlockLevel: 0 },
  { code: FEATURE_CODES.TODAY, name: 'Today', description: 'Focus on daily tasks', unlockLevel: 2, unlockTaskCount: 3 },
  { code: FEATURE_CODES.PRIORITY, name: 'Priority', description: 'Prioritize your tasks', unlockLevel: 3, unlockTaskCount: 5 },
  { code: FEATURE_CODES.ENERGY, name: 'Energy Levels', description: 'Match tasks to your energy', unlockLevel: 4, unlockTaskCount: 10 },
  { code: FEATURE_CODES.PROJECTS, name: 'Projects', description: 'Organize tasks into projects', unlockLevel: 5, unlockTaskCount: 15 },
  { code: FEATURE_CODES.SCHEDULED, name: 'Scheduled', description: 'Plan tasks for future days', unlockLevel: 6 },
  { code: FEATURE_CODES.DESCRIPTION, name: 'Descriptions', description: 'Add details to tasks', unlockLevel: 7, unlockTaskCount: 20 },
  { code: FEATURE_CODES.QUICK_ACTIONS, name: 'Quick Actions', description: 'Speed through small tasks', unlockLevel: 8 },
  { code: FEATURE_CODES.TAGS, name: 'Tags', description: 'Categorize with tags', unlockLevel: 9 },
  { code: FEATURE_CODES.FOCUS_MODE, name: 'Focus Mode', description: 'Pomodoro timer for deep work', unlockLevel: 10 },
  { code: FEATURE_CODES.STATS, name: 'Statistics', description: 'Track your progress', unlockLevel: 12 },
  { code: FEATURE_CODES.THEMES, name: 'Themes', description: 'Customize appearance', unlockLevel: 15 },
  { code: FEATURE_CODES.SETTINGS, name: 'Settings', description: 'Full app configuration', unlockLevel: 18 },
  { code: FEATURE_CODES.NOTIFICATIONS, name: 'Notifications', description: 'Get reminders', unlockLevel: 20 },
  { code: FEATURE_CODES.ADVANCED_STATS, name: 'Advanced Stats', description: 'Deep analytics', unlockLevel: 25 },
];

export function useFeatures(): UseFeaturesReturn {
  const [features, setFeatures] = useState<Feature[]>(DEFAULT_FEATURES);
  const [userStats, setUserStats] = useState<UserGamificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch user's gamification stats and unlocked features
  const refreshFeatures = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/gamification/stats');
      if (!res.ok) throw new Error('Failed to fetch gamification stats');
      const data = await res.json();
      setUserStats(data);

      // Merge with feature definitions
      if (data.features) {
        setFeatures(data.features);
      }
    } catch (err) {
      // If API doesn't exist yet, use defaults with level 1
      setUserStats({
        level: 1,
        xp: 0,
        totalTasksCompleted: 0,
        unlockedFeatures: [FEATURE_CODES.INBOX], // Always have inbox
        unlockedAchievements: [],
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshFeatures();
  }, [refreshFeatures]);

  // Calculate unlocked features based on user stats
  const unlockedFeatures = useMemo(() => {
    if (!userStats) {
      return new Set<FeatureCode>([FEATURE_CODES.INBOX]);
    }

    const unlocked = new Set<FeatureCode>();

    // Always unlock inbox
    unlocked.add(FEATURE_CODES.INBOX);

    // Add features from server
    userStats.unlockedFeatures.forEach((code) => {
      unlocked.add(code as FeatureCode);
    });

    // Also check local conditions (in case API is behind)
    features.forEach((feature) => {
      const meetsLevel = feature.unlockLevel !== undefined && userStats.level >= feature.unlockLevel;
      const meetsTaskCount = feature.unlockTaskCount !== undefined && userStats.totalTasksCompleted >= feature.unlockTaskCount;
      const meetsAchievement = feature.unlockAchievementCode !== undefined &&
        userStats.unlockedAchievements.includes(feature.unlockAchievementCode);

      // Unlock if meets level OR task count OR achievement
      if (meetsLevel || meetsTaskCount || meetsAchievement) {
        unlocked.add(feature.code);
      }
    });

    return unlocked;
  }, [userStats, features]);

  // Check if a specific feature is unlocked
  const isUnlocked = useCallback((code: FeatureCode): boolean => {
    return unlockedFeatures.has(code);
  }, [unlockedFeatures]);

  // Get the next feature that will be unlocked
  const getNextUnlock = useCallback((): Feature | null => {
    if (!userStats) return null;

    const locked = features.filter((f) => !unlockedFeatures.has(f.code));
    if (locked.length === 0) return null;

    // Sort by unlock level
    locked.sort((a, b) => (a.unlockLevel || 999) - (b.unlockLevel || 999));
    return locked[0];
  }, [features, unlockedFeatures, userStats]);

  return {
    features,
    unlockedFeatures,
    loading,
    error,
    isUnlocked,
    getNextUnlock,
    refreshFeatures,
  };
}

// Simple check hook for components
export function useFeatureCheck(code: FeatureCode): boolean {
  const { isUnlocked, loading } = useFeatures();

  // While loading, be permissive for existing users
  if (loading) return true;

  return isUnlocked(code);
}
