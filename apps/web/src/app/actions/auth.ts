'use server';

/**
 * Auth Server Actions - NextAuth v5 best practice
 * Using server actions for proper cookie handling
 */

import { headers } from 'next/headers';
import { signIn, signOut } from '@/lib/auth';
import { AuthError } from 'next-auth';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { registerUser } from '@/app/api/auth/register/route';
import { logError } from '@/lib/logger';
import { rateLimiters, getClientIP } from '@/lib/rate-limit';
import { z } from 'zod';

export type AuthState = {
  error?: string;
  success?: boolean;
};

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  redirectTo: z.string().optional().default('/dashboard/inbox'),
});

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  redirectTo: z.string().optional().default('/dashboard/inbox'),
  // Honeypot field - should be empty (bots fill it)
  website: z.string().optional(),
  // Timestamp when form was rendered (to check speed)
  _ts: z.string().optional(),
});

/**
 * Helper to safely extract form data with validation
 */
function parseFormData<T extends z.ZodSchema>(formData: FormData, schema: T): z.infer<T> | { error: string } {
  const raw: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    raw[key] = typeof value === 'string' ? value : undefined;
  });

  const result = schema.safeParse(raw);
  if (!result.success) {
    return { error: result.error.issues[0]?.message || 'Invalid input' };
  }
  return result.data;
}

/**
 * Server action for credentials login
 * Uses useActionState in the form component
 */
export async function authenticate(
  prevState: AuthState | undefined,
  formData: FormData
): Promise<AuthState> {
  try {
    // Rate limiting
    const headersList = await headers();
    const ip = getClientIP(headersList);
    const rateLimit = rateLimiters.login(ip);

    if (!rateLimit.allowed) {
      return {
        error: `Too many login attempts. Please try again in ${Math.ceil(rateLimit.retryAfter! / 60)} minutes.`
      };
    }

    // Validate form data
    const parsed = parseFormData(formData, loginSchema);
    if ('error' in parsed) {
      return { error: parsed.error };
    }

    const { email, password, redirectTo } = parsed;

    await signIn('credentials', {
      email,
      password,
      redirectTo,
    });

    // signIn will redirect on success, this line won't execute
    return { success: true };
  } catch (error) {
    // NEXT_REDIRECT is thrown by signIn on success - rethrow immediately
    if (isRedirectError(error)) {
      throw error;
    }

    logError('[Auth] Login', error);

    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid email or password' };
        case 'CallbackRouteError':
          return { error: 'Authentication callback failed' };
        default:
          return { error: 'Authentication failed. Please try again.' };
      }
    }

    return { error: 'An unexpected error occurred' };
  }
}

/**
 * Server action for logout
 */
export async function logout() {
  await signOut({ redirectTo: '/' });
}

/**
 * Server action for registration + auto-login
 */
export async function register(
  prevState: AuthState | undefined,
  formData: FormData
): Promise<AuthState> {
  try {
    // Rate limiting
    const headersList = await headers();
    const ip = getClientIP(headersList);
    const rateLimit = rateLimiters.register(ip);

    if (!rateLimit.allowed) {
      return {
        error: `Too many registration attempts. Please try again in ${Math.ceil(rateLimit.retryAfter! / 60)} minutes.`
      };
    }

    // Validate form data
    const parsed = parseFormData(formData, registerSchema);
    if ('error' in parsed) {
      return { error: parsed.error };
    }

    const { email, password, redirectTo, website, _ts } = parsed;

    // Bot detection 1: Honeypot field should be empty
    if (website) {
      // Silently fail - don't give bots feedback
      return { success: true };
    }

    // Bot detection 2: Form filled too fast (< 3 seconds = likely bot)
    if (_ts) {
      const formAge = Date.now() - parseInt(_ts, 10);
      if (formAge < 3000) {
        // Form filled in less than 3 seconds - likely a bot
        return { success: true };
      }
    }

    // Call registration logic directly (no HTTP call)
    const result = await registerUser({ email, password });

    if (!result.success) {
      return { error: result.error };
    }

    // Auto sign-in after registration
    await signIn('credentials', {
      email,
      password,
      redirectTo,
    });

    return { success: true };
  } catch (error) {
    // NEXT_REDIRECT is thrown by signIn on success - rethrow immediately
    if (isRedirectError(error)) {
      throw error;
    }

    logError('[Auth] Registration', error);

    if (error instanceof AuthError) {
      return { error: 'Failed to sign in after registration' };
    }

    return { error: 'An unexpected error occurred' };
  }
}
