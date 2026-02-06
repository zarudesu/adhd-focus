'use client';

import { useState, useEffect, useMemo } from 'react';

interface UseWelcomeBackReturn {
  showWelcome: boolean;
  daysAway: number;
  overdueCount: number;
  dismiss: () => void;
  checked: boolean;
}

function getWelcomeKey(userId: string): string {
  return `welcome-back-shown-${userId}-${new Date().toISOString().split("T")[0]}`;
}

export function useWelcomeBack(
  lastActiveDate: string | null | undefined,
  overdueCount: number,
  userId: string | null | undefined,
): UseWelcomeBackReturn {
  const [dismissed, setDismissed] = useState(true);
  const [checked, setChecked] = useState(false);

  const daysAway = useMemo(() => {
    if (!lastActiveDate) return 0;
    const last = new Date(lastActiveDate + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
  }, [lastActiveDate]);

  useEffect(() => {
    if (typeof window === 'undefined' || !userId) return;
    const key = getWelcomeKey(userId);
    const alreadyShown = localStorage.getItem(key) === 'true';
    setTimeout(() => {
      setDismissed(alreadyShown);
      setChecked(true);
    }, 0);

    // Clean old keys
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith('welcome-back-shown-') && k !== key) {
        localStorage.removeItem(k);
      }
    }
  }, [userId]);

  const dismiss = () => {
    if (userId) {
      localStorage.setItem(getWelcomeKey(userId), 'true');
    }
    setDismissed(true);
  };

  const showWelcome = checked && !dismissed && daysAway >= 3 && overdueCount > 0;

  return { showWelcome, daysAway, overdueCount, dismiss, checked };
}
