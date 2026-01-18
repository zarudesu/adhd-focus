'use client';

/**
 * Features Hook - Progressive feature unlocking system
 * Manages which features are available to the user based on actions and progress
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { FEATURE_CODES, type FeatureCode } from '@/db/schema';

interface Feature {
  code: string;
  name: string;
  description?: string;
  icon?: string;
  isNavItem?: boolean;
  celebrationText?: string;
  unlockLevel?: number | null;
  unlockTasksAdded?: number | null;
  unlockTasksCompleted?: number | null;
}

interface NavFeature {
  code: string;
  name: string;
  icon: string | null;
  isUnlocked: boolean;
  celebrationText: string | null;
}

interface UserProgress {
  level: number;
  totalTasksCompleted: number;
  tasksAdded: number;
  tasksAssignedToday: number;
  tasksScheduled: number;
  projectsCreated: number;
  inboxCleared: number;
  focusSessionsCompleted: number;
  currentStreak: number;
}

interface UserGamificationStats {
  level: number;
  xp: number;
  totalTasksCompleted: number;
  unlockedFeatures: string[];
  unlockedAchievements: string[];
  navFeatures: NavFeature[];
  progress: UserProgress;
}

interface UseFeaturesReturn {
  features: Feature[];
  unlockedFeatures: Set<string>;
  navFeatures: NavFeature[];
  progress: UserProgress | null;
  loading: boolean;
  error: Error | null;
  isUnlocked: (code: string) => boolean;
  isNavUnlocked: (code: string) => boolean;
  getNextUnlock: () => Feature | null;
  refreshFeatures: () => Promise<void>;
}

// Default navigation features (shown while loading)
const DEFAULT_NAV_FEATURES: NavFeature[] = [
  { code: 'nav_inbox', name: 'Inbox', icon: 'Inbox', isUnlocked: true, celebrationText: null },
];

export function useFeatures(): UseFeaturesReturn {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [navFeatures, setNavFeatures] = useState<NavFeature[]>(DEFAULT_NAV_FEATURES);
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

      // Update features from server
      if (data.features) {
        setFeatures(data.features);
      }

      // Update navigation features
      if (data.navFeatures) {
        setNavFeatures(data.navFeatures);
      }
    } catch (err) {
      // If API doesn't exist yet, use defaults
      setUserStats({
        level: 1,
        xp: 0,
        totalTasksCompleted: 0,
        unlockedFeatures: ['nav_inbox'],
        unlockedAchievements: [],
        navFeatures: DEFAULT_NAV_FEATURES,
        progress: {
          level: 1,
          totalTasksCompleted: 0,
          tasksAdded: 0,
          tasksAssignedToday: 0,
          tasksScheduled: 0,
          projectsCreated: 0,
          inboxCleared: 0,
          focusSessionsCompleted: 0,
          currentStreak: 0,
        },
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
      return new Set<string>(['nav_inbox']);
    }

    return new Set<string>(userStats.unlockedFeatures);
  }, [userStats]);

  // Check if a specific feature is unlocked
  const isUnlocked = useCallback((code: string): boolean => {
    return unlockedFeatures.has(code);
  }, [unlockedFeatures]);

  // Check if a navigation item is unlocked
  const isNavUnlocked = useCallback((code: string): boolean => {
    const nav = navFeatures.find(n => n.code === code);
    return nav?.isUnlocked ?? false;
  }, [navFeatures]);

  // Get the next feature that will be unlocked
  const getNextUnlock = useCallback((): Feature | null => {
    if (!userStats) return null;

    const locked = features.filter((f) => !unlockedFeatures.has(f.code));
    if (locked.length === 0) return null;

    return locked[0];
  }, [features, unlockedFeatures, userStats]);

  return {
    features,
    unlockedFeatures,
    navFeatures,
    progress: userStats?.progress || null,
    loading,
    error,
    isUnlocked,
    isNavUnlocked,
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
