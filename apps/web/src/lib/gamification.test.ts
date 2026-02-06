import { describe, it, expect } from 'vitest';
import { xpForLevel, levelFromXp, rollReward, XP_CONFIG } from './gamification';

describe('xpForLevel', () => {
  it('returns 0 XP for level 1', () => {
    expect(xpForLevel(1)).toBe(0);
  });

  it('returns 100 XP for level 2', () => {
    expect(xpForLevel(2)).toBe(100);
  });

  it('returns 900 XP for level 10', () => {
    expect(xpForLevel(10)).toBe(900);
  });

  it('returns 0 for level 0 or negative', () => {
    expect(xpForLevel(0)).toBe(0);
    expect(xpForLevel(-1)).toBe(0);
  });

  it('scales linearly (100 XP per level)', () => {
    for (let level = 1; level <= 20; level++) {
      expect(xpForLevel(level)).toBe(Math.max(0, (level - 1) * 100));
    }
  });
});

describe('levelFromXp', () => {
  it('returns level 1 for 0 XP', () => {
    expect(levelFromXp(0)).toBe(1);
  });

  it('returns level 1 for 99 XP', () => {
    expect(levelFromXp(99)).toBe(1);
  });

  it('returns level 2 at exactly 100 XP', () => {
    expect(levelFromXp(100)).toBe(2);
  });

  it('returns level 3 for 250 XP', () => {
    expect(levelFromXp(250)).toBe(3);
  });

  it('handles large XP values', () => {
    expect(levelFromXp(10000)).toBe(101);
  });
});

describe('xpForLevel / levelFromXp roundtrip', () => {
  it('levelFromXp(xpForLevel(N)) === N for levels 1-50', () => {
    for (let level = 1; level <= 50; level++) {
      expect(levelFromXp(xpForLevel(level))).toBe(level);
    }
  });

  it('level boundary: XP just below threshold stays at previous level', () => {
    for (let level = 2; level <= 10; level++) {
      const threshold = xpForLevel(level);
      expect(levelFromXp(threshold - 1)).toBe(level - 1);
      expect(levelFromXp(threshold)).toBe(level);
    }
  });
});

describe('rollReward', () => {
  it('returns an object with rarity and effect', () => {
    const reward = rollReward();
    expect(reward).toHaveProperty('rarity');
    expect(reward).toHaveProperty('effect');
  });

  it('returns a valid rarity', () => {
    const validRarities = ['common', 'uncommon', 'rare', 'legendary', 'mythic'];
    for (let i = 0; i < 50; i++) {
      const { rarity } = rollReward();
      expect(validRarities).toContain(rarity);
    }
  });

  it('returns a non-empty effect string', () => {
    for (let i = 0; i < 50; i++) {
      const { effect } = rollReward();
      expect(typeof effect).toBe('string');
      expect(effect.length).toBeGreaterThan(0);
    }
  });
});

describe('XP_CONFIG', () => {
  it('has expected base values', () => {
    expect(XP_CONFIG.taskComplete).toBe(10);
    expect(XP_CONFIG.quickTaskBonus).toBe(5);
    expect(XP_CONFIG.deadlineBonus).toBe(5);
  });

  it('has priority multipliers for all priorities', () => {
    expect(XP_CONFIG.priorityMultiplier.must).toBe(1.5);
    expect(XP_CONFIG.priorityMultiplier.should).toBe(1.0);
    expect(XP_CONFIG.priorityMultiplier.want).toBe(0.8);
    expect(XP_CONFIG.priorityMultiplier.someday).toBe(0.5);
  });

  it('has energy bonuses for all levels', () => {
    expect(XP_CONFIG.energyBonus.low).toBe(0);
    expect(XP_CONFIG.energyBonus.medium).toBe(2);
    expect(XP_CONFIG.energyBonus.high).toBe(5);
  });

  it('has streak config', () => {
    expect(XP_CONFIG.streakMultiplier).toBe(0.1);
    expect(XP_CONFIG.maxStreakMultiplier).toBe(2.0);
  });
});
