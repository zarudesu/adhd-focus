/**
 * Simple in-memory rate limiter
 * NOTE: In production with multiple instances, use Redis instead
 */

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

interface RateLimiterConfig {
  windowMs: number;
  maxRequests: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfter?: number;
}

// Separate maps for different rate limit types
const rateLimitMaps = new Map<string, Map<string, RateLimitRecord>>();

function getMap(name: string): Map<string, RateLimitRecord> {
  if (!rateLimitMaps.has(name)) {
    rateLimitMaps.set(name, new Map());
  }
  return rateLimitMaps.get(name)!;
}

/**
 * Check rate limit for a given key (usually IP or user ID)
 */
export function checkRateLimit(
  name: string,
  key: string,
  config: RateLimiterConfig
): RateLimitResult {
  const now = Date.now();
  const map = getMap(name);
  const record = map.get(key);

  // Clean up expired entries periodically (when map gets large)
  if (map.size > 10000) {
    for (const [k, v] of map.entries()) {
      if (now > v.resetTime) {
        map.delete(k);
      }
    }
  }

  // New key or expired record
  if (!record || now > record.resetTime) {
    map.set(key, { count: 1, resetTime: now + config.windowMs });
    return { allowed: true, remaining: config.maxRequests - 1 };
  }

  // Check if over limit
  if (record.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((record.resetTime - now) / 1000),
    };
  }

  // Increment counter
  record.count++;
  return { allowed: true, remaining: config.maxRequests - record.count };
}

/**
 * Pre-configured rate limiters for common use cases
 */
export const rateLimiters = {
  /**
   * Registration: 5 attempts per 15 minutes
   */
  register: (key: string) =>
    checkRateLimit('register', key, {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 5,
    }),

  /**
   * Login: 10 attempts per 15 minutes (slightly more lenient for typos)
   */
  login: (key: string) =>
    checkRateLimit('login', key, {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 10,
    }),

  /**
   * Password reset: 3 attempts per hour
   */
  passwordReset: (key: string) =>
    checkRateLimit('password-reset', key, {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 3,
    }),

  /**
   * API calls: 100 per minute
   */
  api: (key: string) =>
    checkRateLimit('api', key, {
      windowMs: 60 * 1000, // 1 minute
      maxRequests: 100,
    }),
};

/**
 * Get client IP from request headers (for server actions)
 * Falls back to 'unknown' if not available
 */
export function getClientIP(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headers.get('x-real-ip') ||
    'unknown'
  );
}
