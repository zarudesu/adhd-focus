/**
 * Safe Logger - Prevents PII leakage in production logs
 *
 * In development: logs full error details
 * In production: logs sanitized messages only
 */

const isDev = process.env.NODE_ENV === 'development';

// Patterns that might contain PII
const PII_PATTERNS = [
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, // Email
  /password["\s:=]+["']?[^"'\s,}]+/gi, // Password in strings
];

/**
 * Sanitize a string by removing potential PII
 */
function sanitize(str: string): string {
  let result = str;
  for (const pattern of PII_PATTERNS) {
    result = result.replace(pattern, '[REDACTED]');
  }
  return result;
}

/**
 * Extract safe error info
 */
function getSafeErrorInfo(error: unknown): string {
  if (error instanceof Error) {
    // Only include error name and sanitized message
    const message = sanitize(error.message);
    return `${error.name}: ${message}`;
  }
  if (typeof error === 'string') {
    return sanitize(error);
  }
  return 'Unknown error';
}

/**
 * Log an error safely
 *
 * @param context - Where the error occurred (e.g., "POST /api/auth/register")
 * @param error - The error object
 */
export function logError(context: string, error: unknown): void {
  if (isDev) {
    // In development, log full details for debugging
    console.error(`[DEV] ${context}:`, error);
  } else {
    // In production, log only sanitized info
    const safeInfo = getSafeErrorInfo(error);
    console.error(`${context}: ${safeInfo}`);
  }
}

/**
 * Log info (always sanitized in production)
 */
export function logInfo(context: string, message: string): void {
  if (isDev) {
    console.log(`[DEV] ${context}: ${message}`);
  } else {
    console.log(`${context}: ${sanitize(message)}`);
  }
}
