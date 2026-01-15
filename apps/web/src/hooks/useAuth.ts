'use client';

/**
 * Auth Hook - NextAuth session management
 */

import { useSession, signIn, signOut } from 'next-auth/react';
import { useCallback } from 'react';

interface UseAuthReturn {
  user: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
  } | null;
  loading: boolean;
  signIn: (provider?: string) => Promise<void>;
  signInWithCredentials: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

export function useAuth(): UseAuthReturn {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const isAuthenticated = status === 'authenticated';

  const handleSignIn = useCallback(async (provider = 'google') => {
    await signIn(provider, { callbackUrl: '/dashboard' });
  }, []);

  const handleSignInWithCredentials = useCallback(async (email: string, password: string) => {
    try {
      // Use NextAuth's built-in redirect for proper cookie handling
      await signIn('credentials', {
        email,
        password,
        callbackUrl: '/dashboard',
        redirect: true,
      });
      return { error: null };
    } catch {
      return { error: new Error('Authentication failed') };
    }
  }, []);

  const handleSignUp = useCallback(async (email: string, password: string) => {
    // Call registration API
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        return { error: new Error(data.error || 'Registration failed') };
      }

      // Auto sign-in after registration
      return handleSignInWithCredentials(email, password);
    } catch (err) {
      return { error: err instanceof Error ? err : new Error('Registration failed') };
    }
  }, [handleSignInWithCredentials]);

  const handleSignOut = useCallback(async () => {
    await signOut({ callbackUrl: '/' });
  }, []);

  return {
    user: session?.user ?? null,
    loading,
    signIn: handleSignIn,
    signInWithCredentials: handleSignInWithCredentials,
    signUp: handleSignUp,
    signOut: handleSignOut,
    isAuthenticated,
  };
}
