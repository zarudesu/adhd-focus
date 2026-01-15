'use server';

/**
 * Auth Server Actions - NextAuth v5 best practice
 * Using server actions for proper cookie handling
 */

import { signIn, signOut } from '@/lib/auth';
import { AuthError } from 'next-auth';

export type AuthState = {
  error?: string;
  success?: boolean;
};

/**
 * Server action for credentials login
 * Uses useActionState in the form component
 */
export async function authenticate(
  prevState: AuthState | undefined,
  formData: FormData
): Promise<AuthState> {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const redirectTo = formData.get('redirectTo') as string || '/dashboard';

    console.log('[Auth] Attempting login for:', email);

    await signIn('credentials', {
      email,
      password,
      redirectTo,
    });

    // signIn will redirect on success, this line won't execute
    return { success: true };
  } catch (error) {
    console.error('[Auth] Login error:', error);

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

    // NEXT_REDIRECT is thrown by signIn on success - rethrow it
    throw error;
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
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const redirectTo = formData.get('redirectTo') as string || '/dashboard';

    console.log('[Auth] Attempting registration for:', email);

    // Call registration API
    const res = await fetch(`${process.env.AUTH_URL || 'http://localhost:3000'}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const data = await res.json();
      console.error('[Auth] Registration failed:', data);
      return { error: data.error || 'Registration failed' };
    }

    console.log('[Auth] Registration successful, signing in...');

    // Auto sign-in after registration
    await signIn('credentials', {
      email,
      password,
      redirectTo,
    });

    return { success: true };
  } catch (error) {
    console.error('[Auth] Registration error:', error);

    if (error instanceof AuthError) {
      return { error: 'Failed to sign in after registration' };
    }

    // NEXT_REDIRECT - rethrow
    throw error;
  }
}
