/**
 * Auth Hook - Authentication state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { authApi, profileApi, AuthState } from '../api';
import type { User } from '@adhd-focus/shared';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

interface UseAuthReturn {
  // State
  user: SupabaseUser | null;
  profile: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;

  // Actions
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentSession = await authApi.getSession();
        setSession(currentSession);
        setUser(currentSession?.user || null);

        if (currentSession?.user) {
          const userProfile = await profileApi.get();
          setProfile(userProfile);
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Subscribe to auth changes
    const { data: subscription } = authApi.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user || null);

      if (newSession?.user) {
        const userProfile = await profileApi.get();
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.subscription.unsubscribe();
    };
  }, []);

  // Sign in
  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await authApi.signIn(email, password);
      if (result.user) {
        const userProfile = await profileApi.get();
        setProfile(userProfile);
      }
      return { error: result.error };
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign up
  const signUp = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await authApi.signUp(email, password);
      return { error: result.error };
    } finally {
      setLoading(false);
    }
  }, []);

  // Magic link
  const signInWithMagicLink = useCallback(async (email: string) => {
    return authApi.signInWithMagicLink(email);
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      await authApi.signOut();
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh profile
  const refreshProfile = useCallback(async () => {
    if (user) {
      const userProfile = await profileApi.get();
      setProfile(userProfile);
    }
  }, [user]);

  return {
    user,
    profile,
    session,
    loading,
    isAuthenticated: !!session,
    signIn,
    signUp,
    signInWithMagicLink,
    signOut,
    refreshProfile,
  };
}
