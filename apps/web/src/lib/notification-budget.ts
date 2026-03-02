'use client';

/**
 * Notification Budget — controls gamification notification frequency
 *
 * Instead of showing all achievements/creatures at once, spreads them out:
 * - Max 2 achievement notifications per session
 * - Max 1 creature notification per session
 * - Overflow stored in localStorage for next session
 * - On next session start, shows 1 from overflow
 */

interface DeferredReward {
  type: 'achievement' | 'creature';
  data: unknown; // Achievement or CaughtCreatureData
  createdAt: number;
}

interface NotificationStore {
  deferred: DeferredReward[];
  updatedAt: number;
}

const EXPIRY_MS = 3 * 24 * 60 * 60 * 1000; // 3 days max

function getKey(userId: string): string {
  return `notification-budget-${userId}`;
}

function getSessionKey(): string {
  return 'notification-budget-session';
}

function read(userId: string): NotificationStore | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(getKey(userId));
    if (!raw) return null;
    const data = JSON.parse(raw) as NotificationStore;
    if (Date.now() - data.updatedAt > EXPIRY_MS) {
      localStorage.removeItem(getKey(userId));
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function write(userId: string, data: NotificationStore): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getKey(userId), JSON.stringify(data));
  } catch {
    // ignore
  }
}

interface SessionBudget {
  achievementsShown: number;
  creaturesShown: number;
}

function getSessionBudget(): SessionBudget {
  if (typeof window === 'undefined') return { achievementsShown: 0, creaturesShown: 0 };
  try {
    const raw = sessionStorage.getItem(getSessionKey());
    if (!raw) return { achievementsShown: 0, creaturesShown: 0 };
    return JSON.parse(raw) as SessionBudget;
  } catch {
    return { achievementsShown: 0, creaturesShown: 0 };
  }
}

function setSessionBudget(budget: SessionBudget): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(getSessionKey(), JSON.stringify(budget));
  } catch {
    // ignore
  }
}

export const BUDGET_LIMITS = {
  achievementsPerSession: 2,
  creaturesPerSession: 1,
  dripOnSessionStart: 1, // How many deferred to show on new session
} as const;

/**
 * Check if we can show an achievement notification this session
 */
export function canShowAchievement(): boolean {
  const budget = getSessionBudget();
  return budget.achievementsShown < BUDGET_LIMITS.achievementsPerSession;
}

/**
 * Check if we can show a creature notification this session
 */
export function canShowCreature(): boolean {
  const budget = getSessionBudget();
  return budget.creaturesShown < BUDGET_LIMITS.creaturesPerSession;
}

/**
 * Record that an achievement notification was shown
 */
export function recordAchievementShown(): void {
  const budget = getSessionBudget();
  budget.achievementsShown += 1;
  setSessionBudget(budget);
}

/**
 * Record that a creature notification was shown
 */
export function recordCreatureShown(): void {
  const budget = getSessionBudget();
  budget.creaturesShown += 1;
  setSessionBudget(budget);
}

/**
 * Defer a reward to localStorage for later sessions
 */
export function deferReward(userId: string, type: 'achievement' | 'creature', data: unknown): void {
  const store = read(userId) || { deferred: [], updatedAt: Date.now() };
  store.deferred.push({ type, data, createdAt: Date.now() });
  store.updatedAt = Date.now();
  write(userId, store);
}

/**
 * Get and clear deferred rewards for drip display on session start.
 * Returns up to BUDGET_LIMITS.dripOnSessionStart items.
 */
export function popDeferredRewards(userId: string): DeferredReward[] {
  const store = read(userId);
  if (!store || store.deferred.length === 0) return [];

  const toShow = store.deferred.splice(0, BUDGET_LIMITS.dripOnSessionStart);
  store.updatedAt = Date.now();

  if (store.deferred.length === 0) {
    localStorage.removeItem(getKey(userId));
  } else {
    write(userId, store);
  }

  return toShow;
}

/**
 * Get count of deferred rewards (for UI badge/indicator)
 */
export function getDeferredCount(userId: string): number {
  const store = read(userId);
  return store?.deferred.length || 0;
}
