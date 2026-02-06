/**
 * Gamification API
 */
import { api } from '../lib/api-client';
import type { Achievement, Creature, GamificationStats } from '../types';

interface AchievementsResponse {
  achievements: (Achievement & { isUnlocked: boolean; unlockedAt: string | null; progress: { current: number; target: number } | null })[];
  stats: { total: number; unlocked: number; visible: number };
}

interface CreaturesResponse {
  creatures: (Creature & { isCaught: boolean; count: number; firstCaughtAt: string | null })[];
  stats: { total: number; caught: number; totalCreaturesCaught: number; byRarity: Record<string, { total: number; caught: number }> };
}

export const gamificationApi = {
  async getStats(): Promise<GamificationStats> {
    return api.get<GamificationStats>('/gamification/stats');
  },

  async awardXp(amount: number, source: string): Promise<{ xp: number; level: number; levelUp: boolean }> {
    return api.post('/gamification/xp', { amount, source });
  },

  async getAchievements(): Promise<AchievementsResponse> {
    return api.get<AchievementsResponse>('/gamification/achievements');
  },

  async checkAchievements(): Promise<void> {
    return api.post('/gamification/achievements/check', {});
  },

  async getCreatures(): Promise<CreaturesResponse> {
    return api.get<CreaturesResponse>('/gamification/creatures');
  },
};
