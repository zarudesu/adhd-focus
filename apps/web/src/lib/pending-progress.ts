'use client';

/**
 * Pending Progress — localStorage helpers
 * Stores feature unlocks and level ups between sessions.
 * Shown in the morning review "progress" step.
 */

export interface PendingFeatureUnlock {
  code: string;
  name: string;
  celebrationText: string | null;
}

export interface PendingLevelUp {
  newLevel: number;
}

export interface PendingProgress {
  featureUnlocks: PendingFeatureUnlock[];
  levelUps: PendingLevelUp[];
  updatedAt: number;
}

const EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function getKey(userId: string): string {
  return `pending-progress-${userId}`;
}

function read(userId: string): PendingProgress | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(getKey(userId));
    if (!raw) return null;
    const data = JSON.parse(raw) as PendingProgress;
    // Expire after 7 days
    if (Date.now() - data.updatedAt > EXPIRY_MS) {
      localStorage.removeItem(getKey(userId));
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function write(userId: string, data: PendingProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getKey(userId), JSON.stringify(data));
  } catch {
    // localStorage full or unavailable — ignore
  }
}

function getOrCreate(userId: string): PendingProgress {
  return read(userId) || { featureUnlocks: [], levelUps: [], updatedAt: Date.now() };
}

export function addFeatureUnlock(userId: string, feature: PendingFeatureUnlock): void {
  const data = getOrCreate(userId);
  // Avoid duplicates
  if (data.featureUnlocks.some(f => f.code === feature.code)) return;
  data.featureUnlocks.push(feature);
  data.updatedAt = Date.now();
  write(userId, data);
}

export function addLevelUp(userId: string, level: number): void {
  const data = getOrCreate(userId);
  // Avoid duplicates
  if (data.levelUps.some(l => l.newLevel === level)) return;
  data.levelUps.push({ newLevel: level });
  data.updatedAt = Date.now();
  write(userId, data);
}

export function getPendingProgress(userId: string): PendingProgress | null {
  const data = read(userId);
  if (!data) return null;
  if (data.featureUnlocks.length === 0 && data.levelUps.length === 0) return null;
  return data;
}

export function clearPendingProgress(userId: string): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(getKey(userId));
}
