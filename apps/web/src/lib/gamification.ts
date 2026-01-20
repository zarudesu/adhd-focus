/**
 * Gamification Utilities
 * Shared functions for XP/Level calculations (works on client and server)
 */

// XP Calculation constants
export const XP_CONFIG = {
  taskComplete: 10,
  quickTaskBonus: 5, // Extra for tasks < 5 min
  priorityMultiplier: {
    must: 1.5,
    should: 1.0,
    want: 0.8,
    someday: 0.5,
  } as Record<string, number>,
  energyBonus: {
    low: 0,
    medium: 2,
    high: 5,
  } as Record<string, number>,
  streakMultiplier: 0.1, // +10% per streak day (capped at 200%)
  maxStreakMultiplier: 2.0,
  deadlineBonus: 5, // Completed before due date
};

// Rarity types
export type RewardRarity = 'common' | 'uncommon' | 'rare' | 'legendary' | 'mythic';

// Level calculation: Linear progression - same effort every level
// Each level requires exactly 100 mindfulness points
// This ensures users don't feel pressure to work more as they progress
const XP_PER_LEVEL = 100;

export function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return (level - 1) * XP_PER_LEVEL;
}

export function levelFromXp(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

// Reward effect rarity weights
const RARITY_WEIGHTS: { rarity: RewardRarity; weight: number }[] = [
  { rarity: 'common', weight: 600 },
  { rarity: 'uncommon', weight: 250 },
  { rarity: 'rare', weight: 120 },
  { rarity: 'legendary', weight: 29 },
  { rarity: 'mythic', weight: 1 },
];

// Effects by rarity
const EFFECTS_BY_RARITY: Record<RewardRarity, string[]> = {
  common: ['sparkle', 'wave', 'star', 'glow'],
  uncommon: ['glitch', 'rainbow', 'music', 'fire', 'crystal'],
  rare: ['portal', 'creature', 'fireworks', 'warp', 'stars'],
  legendary: ['unicorn', 'volcano', 'invert', 'rocket', 'aurora'],
  mythic: ['takeover', 'golden', 'eye'],
};

// Roll a random reward
export function rollReward(): { rarity: RewardRarity; effect: string } {
  const totalWeight = RARITY_WEIGHTS.reduce((sum, r) => sum + r.weight, 0);
  let random = Math.random() * totalWeight;

  let rarity: RewardRarity = 'common';
  for (const r of RARITY_WEIGHTS) {
    random -= r.weight;
    if (random <= 0) {
      rarity = r.rarity;
      break;
    }
  }

  const effects = EFFECTS_BY_RARITY[rarity];
  const effect = effects[Math.floor(Math.random() * effects.length)];

  return { rarity, effect };
}

