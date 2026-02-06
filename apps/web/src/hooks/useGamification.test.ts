import { describe, it, expect } from 'vitest';
import { calculateTaskXp, xpToNextLevel } from './useGamification';

describe('calculateTaskXp', () => {
  it('returns base XP (10) for a default task', () => {
    const xp = calculateTaskXp({});
    // Base 10 * should(1.0) + medium(2) = 12
    expect(xp).toBe(12);
  });

  it('adds quick task bonus for tasks <= 5 minutes', () => {
    const quick = calculateTaskXp({ estimatedMinutes: 5 });
    const normal = calculateTaskXp({ estimatedMinutes: 15 });
    // quick: (10 + 5) * 1.0 + 2 = 17
    // normal: 10 * 1.0 + 2 = 12
    expect(quick).toBe(17);
    expect(normal).toBe(12);
  });

  it('does not add quick bonus for null estimatedMinutes', () => {
    const xp = calculateTaskXp({ estimatedMinutes: null });
    expect(xp).toBe(12); // base + medium energy
  });

  it('applies priority multiplier: must = 1.5x', () => {
    const xp = calculateTaskXp({ priority: 'must' });
    // 10 * 1.5 + 2 = 17
    expect(xp).toBe(17);
  });

  it('applies priority multiplier: want = 0.8x', () => {
    const xp = calculateTaskXp({ priority: 'want' });
    // 10 * 0.8 + 2 = 10
    expect(xp).toBe(10);
  });

  it('applies priority multiplier: someday = 0.5x', () => {
    const xp = calculateTaskXp({ priority: 'someday' });
    // 10 * 0.5 + 2 = 7
    expect(xp).toBe(7);
  });

  it('adds energy bonus: high = +5', () => {
    const xp = calculateTaskXp({ energyRequired: 'high' });
    // 10 * 1.0 + 5 = 15
    expect(xp).toBe(15);
  });

  it('adds energy bonus: low = +0', () => {
    const xp = calculateTaskXp({ energyRequired: 'low' });
    // 10 * 1.0 + 0 = 10
    expect(xp).toBe(10);
  });

  it('adds deadline bonus when completed before due date', () => {
    const xp = calculateTaskXp({
      dueDate: '2026-02-10',
      completedAt: '2026-02-08T12:00:00Z',
    });
    // 10 * 1.0 + 2 + 5 = 17
    expect(xp).toBe(17);
  });

  it('does not add deadline bonus when completed after due date', () => {
    const xp = calculateTaskXp({
      dueDate: '2026-02-05',
      completedAt: '2026-02-08T12:00:00Z',
    });
    // 10 * 1.0 + 2 = 12 (no deadline bonus)
    expect(xp).toBe(12);
  });

  it('does not add deadline bonus when dueDate or completedAt is null', () => {
    expect(calculateTaskXp({ dueDate: '2026-02-10' })).toBe(12);
    expect(calculateTaskXp({ completedAt: '2026-02-08' })).toBe(12);
  });

  it('applies streak multiplier', () => {
    // 5-day streak: multiplier = 1 + 5*0.1 = 1.5x
    const xp = calculateTaskXp({}, 5);
    // (10 * 1.0 + 2) * 1.5 = 18
    expect(xp).toBe(18);
  });

  it('caps streak multiplier at 2.0x', () => {
    // 15-day streak: would be 1 + 15*0.1 = 2.5, capped at 2.0
    const xp = calculateTaskXp({}, 15);
    // (10 * 1.0 + 2) * 2.0 = 24
    expect(xp).toBe(24);
  });

  it('handles 10-day streak at exactly 2.0x cap', () => {
    const xp = calculateTaskXp({}, 10);
    // (10 * 1.0 + 2) * 2.0 = 24
    expect(xp).toBe(24);
  });

  it('handles zero streak', () => {
    const xp = calculateTaskXp({}, 0);
    // (10 * 1.0 + 2) * 1.0 = 12
    expect(xp).toBe(12);
  });

  it('combines all bonuses correctly', () => {
    const xp = calculateTaskXp({
      priority: 'must',
      energyRequired: 'high',
      estimatedMinutes: 3, // quick
      dueDate: '2026-02-10',
      completedAt: '2026-02-08T12:00:00Z',
    }, 5);
    // Base: 10 + quickBonus: 5 = 15
    // Priority: 15 * 1.5 = 22.5
    // Energy: 22.5 + 5 = 27.5
    // Deadline: 27.5 + 5 = 32.5
    // Streak (5 days, 1.5x): 32.5 * 1.5 = 48.75
    // Floor: 48
    expect(xp).toBe(48);
  });

  it('floors the result to an integer', () => {
    // want priority: 10 * 0.8 = 8.0 + medium 2 = 10 → integer
    const xp = calculateTaskXp({ priority: 'want' });
    expect(Number.isInteger(xp)).toBe(true);
  });
});

describe('xpToNextLevel', () => {
  it('returns correct values for level 1 (0 XP)', () => {
    const result = xpToNextLevel(0);
    expect(result.currentLevel).toBe(1);
    expect(result.xpInLevel).toBe(0);
    expect(result.xpNeeded).toBe(100);
    expect(result.progress).toBe(0);
  });

  it('returns 50% progress at 50 XP', () => {
    const result = xpToNextLevel(50);
    expect(result.currentLevel).toBe(1);
    expect(result.xpInLevel).toBe(50);
    expect(result.xpNeeded).toBe(100);
    expect(result.progress).toBe(50);
  });

  it('returns level 2 at 100 XP', () => {
    const result = xpToNextLevel(100);
    expect(result.currentLevel).toBe(2);
    expect(result.xpInLevel).toBe(0);
    expect(result.progress).toBe(0);
  });

  it('returns correct progress mid-level', () => {
    const result = xpToNextLevel(175);
    expect(result.currentLevel).toBe(2);
    expect(result.xpInLevel).toBe(75);
    expect(result.xpNeeded).toBe(100);
    expect(result.progress).toBe(75);
  });

  it('handles high XP values', () => {
    const result = xpToNextLevel(1050);
    expect(result.currentLevel).toBe(11);
    expect(result.xpInLevel).toBe(50);
    expect(result.xpNeeded).toBe(100);
    expect(result.progress).toBe(50);
  });
});
