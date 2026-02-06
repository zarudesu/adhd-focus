import { describe, it, expect, beforeEach, vi } from 'vitest';
import { checkRateLimit, getClientIP } from './rate-limit';

describe('checkRateLimit', () => {
  // Use unique names per test to avoid state leaking between tests
  let testName: string;

  beforeEach(() => {
    testName = `test-${Date.now()}-${Math.random()}`;
  });

  it('allows first request', () => {
    const result = checkRateLimit(testName, '1.2.3.4', {
      windowMs: 60000,
      maxRequests: 5,
    });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('allows requests up to the limit', () => {
    const config = { windowMs: 60000, maxRequests: 3 };

    const r1 = checkRateLimit(testName, '1.2.3.4', config);
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(2);

    const r2 = checkRateLimit(testName, '1.2.3.4', config);
    expect(r2.allowed).toBe(true);
    expect(r2.remaining).toBe(1);

    const r3 = checkRateLimit(testName, '1.2.3.4', config);
    expect(r3.allowed).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it('blocks requests over the limit', () => {
    const config = { windowMs: 60000, maxRequests: 2 };

    checkRateLimit(testName, '1.2.3.4', config);
    checkRateLimit(testName, '1.2.3.4', config);

    const r3 = checkRateLimit(testName, '1.2.3.4', config);
    expect(r3.allowed).toBe(false);
    expect(r3.remaining).toBe(0);
    expect(r3.retryAfter).toBeGreaterThan(0);
  });

  it('tracks different IPs separately', () => {
    const config = { windowMs: 60000, maxRequests: 1 };

    checkRateLimit(testName, '1.1.1.1', config);
    const r1 = checkRateLimit(testName, '1.1.1.1', config);
    expect(r1.allowed).toBe(false);

    const r2 = checkRateLimit(testName, '2.2.2.2', config);
    expect(r2.allowed).toBe(true);
  });

  it('resets after window expires', () => {
    const config = { windowMs: 100, maxRequests: 1 };

    checkRateLimit(testName, '1.2.3.4', config);
    const blocked = checkRateLimit(testName, '1.2.3.4', config);
    expect(blocked.allowed).toBe(false);

    // Fast-forward time past the window
    vi.useFakeTimers();
    vi.advanceTimersByTime(150);

    const allowed = checkRateLimit(testName, '1.2.3.4', config);
    expect(allowed.allowed).toBe(true);

    vi.useRealTimers();
  });

  it('returns retryAfter in seconds when blocked', () => {
    const config = { windowMs: 30000, maxRequests: 1 };

    checkRateLimit(testName, '1.2.3.4', config);
    const result = checkRateLimit(testName, '1.2.3.4', config);

    expect(result.retryAfter).toBeDefined();
    expect(result.retryAfter).toBeGreaterThan(0);
    expect(result.retryAfter).toBeLessThanOrEqual(30);
  });
});

describe('getClientIP', () => {
  it('extracts IP from x-forwarded-for', () => {
    const headers = new Headers({
      'x-forwarded-for': '1.2.3.4, 5.6.7.8',
    });
    expect(getClientIP(headers)).toBe('1.2.3.4');
  });

  it('trims whitespace from x-forwarded-for', () => {
    const headers = new Headers({
      'x-forwarded-for': '  1.2.3.4  , 5.6.7.8',
    });
    expect(getClientIP(headers)).toBe('1.2.3.4');
  });

  it('falls back to x-real-ip', () => {
    const headers = new Headers({
      'x-real-ip': '10.0.0.1',
    });
    expect(getClientIP(headers)).toBe('10.0.0.1');
  });

  it('prefers x-forwarded-for over x-real-ip', () => {
    const headers = new Headers({
      'x-forwarded-for': '1.2.3.4',
      'x-real-ip': '10.0.0.1',
    });
    expect(getClientIP(headers)).toBe('1.2.3.4');
  });

  it('returns "unknown" when no IP headers present', () => {
    const headers = new Headers();
    expect(getClientIP(headers)).toBe('unknown');
  });
});
