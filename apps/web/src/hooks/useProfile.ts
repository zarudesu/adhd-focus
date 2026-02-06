'use client';

/**
 * Profile Hook - User profile and preferences management
 */

import { useState, useEffect, useCallback } from 'react';
import type { UserPreferences } from '@/db/schema';

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  preferences: UserPreferences | null;
  currentStreak: number | null;
  longestStreak: number | null;
  totalTasksCompleted: number | null;
  totalPomodoros: number | null;
  totalFocusMinutes: number | null;
  createdAt: Date | null;
}

interface UpdateProfileInput {
  name?: string;
  preferences?: Partial<UserPreferences>;
}

interface UseProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: Error | null;
  saving: boolean;
  fetch: () => Promise<void>;
  update: (input: UpdateProfileInput) => Promise<UserProfile>;
  updatePreference: <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => Promise<UserProfile>;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  defaultPomodoroMinutes: 25,
  defaultBreakMinutes: 5,
  longBreakMinutes: 15,
  pomodorosUntilLongBreak: 4,
  maxDailyTasks: 3,
  showOnlyOneTask: false,
  autoScheduleOverdue: true,
  morningPlanningReminder: true,
  highEnergyHours: [9, 10, 11],
  enableNotifications: true,
  notificationSound: true,
  theme: 'system',
  timezone: 'UTC',
  reduceAnimations: false,
};

async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return res.json();
}

export function useProfile(): UseProfileReturn {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest<UserProfile>('/api/profile');
      setProfile(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch profile'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const update = useCallback(async (input: UpdateProfileInput): Promise<UserProfile> => {
    setSaving(true);
    try {
      const updated = await apiRequest<UserProfile>('/api/profile', {
        method: 'PATCH',
        body: JSON.stringify(input),
      });
      setProfile(updated);
      return updated;
    } finally {
      setSaving(false);
    }
  }, []);

  const updatePreference = useCallback(
    async <K extends keyof UserPreferences>(
      key: K,
      value: UserPreferences[K]
    ): Promise<UserProfile> => {
      return update({
        preferences: { [key]: value },
      });
    },
    [update]
  );

  // Return profile with default preferences merged
  const profileWithDefaults = profile
    ? {
        ...profile,
        preferences: {
          ...DEFAULT_PREFERENCES,
          ...(profile.preferences || {}),
        },
      }
    : null;

  return {
    profile: profileWithDefaults,
    loading,
    error,
    saving,
    fetch,
    update,
    updatePreference,
  };
}
