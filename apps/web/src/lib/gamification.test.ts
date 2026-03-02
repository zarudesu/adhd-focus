import { describe, it, expect } from 'vitest';
import { xpForLevel, xpForNextLevel, levelFromXp, rollReward, XP_CONFIG } from './gamification';

describe('xpForNextLevel', () => {
  it('returns 100 for level 1', () => {
    expect(xpForNextLevel(1)).toBe(100);
  });

  it('returns increasing values for higher levels', () => {
    let prev = 0;
    for (let level = 1; level <= 20; level++) {
      const needed = xpForNextLevel(level);
      expect(needed).toBeGreaterThan(prev);
      prev = needed;
    }
  });

  it('follows floor(100 * level^0.7) formula', () => {
    expect(xpForNextLevel(1)).toBe(Math.floor(100 * Math.pow(1, 0.7)));
    expect(xpForNextLevel(5)).toBe(Math.floor(100 * Math.pow(5, 0.7)));
    expect(xpForNextLevel(10)).toBe(Math.floor(100 * Math.pow(10, 0.7)));
  });
});

describe('xpForLevel', () => {
  it('returns 0 XP for level 1', () => {
    expect(xpForLevel(1)).toBe(0);
  });

  it('returns 100 XP for level 2', () => {
    expect(xpForLevel(2)).toBe(100);
  });

  it('returns sum of xpForNextLevel(1..N-1) for level N', () => {
    for (let level = 2; level <= 10; level++) {
      let expected = 0;
      for (let i = 1; i < level; i++) {
        expected += xpForNextLevel(i);
      }
      expect(xpForLevel(level)).toBe(expected);
    }
  });

  it('returns 0 for level 0 or negative', () => {
    expect(xpForLevel(0)).toBe(0);
    expect(xpForLevel(-1)).toBe(0);
  });

  it('grows faster than linear (soft exponential)', () => {
    // Level 10 should require significantly more total XP than 9 * 100
    expect(xpForLevel(10)).toBeGreaterThan(900);
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

  it('handles large XP values without exceeding reasonable levels', () => {
    // With new curve, 10000 XP should be much less than 101
    const level = levelFromXp(10000);
    expect(level).toBeGreaterThan(10);
    expect(level).toBeLessThan(50);
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
