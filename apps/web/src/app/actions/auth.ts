'use server';

/**
 * Auth Server Actions - NextAuth v5 best practice
 * Using server actions for proper cookie handling
 */

import { signIn, signOut } from '@/lib/auth';
import { AuthError } from 'next-auth';
import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { registerUser } from '@/app/api/auth/register/route';

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
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const redirectTo = formData.get('redirectTo') as string || '/dashboard';

    // Call registration logic directly (no HTTP call)
    const result = await registerUser({ email, password });

    if (!result.success) {
      console.error('[Auth] Registration failed:', result.error);
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

    console.error('[Auth] Registration error:', error);

    if (error instanceof AuthError) {
      return { error: 'Failed to sign in after registration' };
    }

    return { error: 'An unexpected error occurred' };
  }
}
