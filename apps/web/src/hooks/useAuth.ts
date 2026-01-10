'use client';

/**
 * Auth Hook - Authentication state and operations
 */

import { useState, useEffect, useCallback } from 'react';
import { authApi, profileApi } from '@/api';
import type { User } from '@adhd-focus/shared';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

interface UseAuthReturn {
  user: SupabaseUser | null;
  profile: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

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

  const signUp = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const result = await authApi.signUp(email, password);
      return { error: result.error };
    } finally {
      setLoading(false);
    }
  }, []);

  const signInWithMagicLink = useCallback(async (email: string) => {
    return authApi.signInWithMagicLink(email);
  }, []);

  const signInWithOAuth = useCallback(async (provider: 'google' | 'github') => {
    return authApi.signInWithOAuth(provider);
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      await authApi.signOut();
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

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
    signInWithOAuth,
    signOut,
    refreshProfile,
  };
}
