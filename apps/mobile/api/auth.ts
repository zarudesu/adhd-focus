/**
 * Auth API - Authentication operations
 */

import { supabase } from '../lib/supabase';
import type { Session, User as SupabaseUser } from '@supabase/supabase-js';

export interface AuthState {
  user: SupabaseUser | null;
  session: Session | null;
  loading: boolean;
}

export const authApi = {
  /**
   * Get current session
   */
  async getSession(): Promise<Session | null> {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  /**
   * Get current user
   */
  async getUser(): Promise<SupabaseUser | null> {
    const { data } = await supabase.auth.getUser();
    return data.user;
  },

  /**
   * Sign up with email
   */
  async signUp(email: string, password: string): Promise<{ user: SupabaseUser | null; error: Error | null }> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    return {
      user: data.user,
      error: error ? new Error(error.message) : null,
    };
  },

  /**
   * Sign in with email
   */
  async signIn(email: string, password: string): Promise<{ user: SupabaseUser | null; error: Error | null }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return {
      user: data.user,
      error: error ? new Error(error.message) : null,
    };
  },

  /**
   * Sign in with magic link
   */
  async signInWithMagicLink(email: string): Promise<{ error: Error | null }> {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'adhdfocus://auth/callback',
      },
    });

    return {
      error: error ? new Error(error.message) : null,
    };
  },

  /**
   * Sign in with OAuth provider
   */
  async signInWithOAuth(provider: 'google' | 'apple'): Promise<{ error: Error | null }> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: 'adhdfocus://auth/callback',
      },
    });

    return {
      error: error ? new Error(error.message) : null,
    };
  },

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Reset password
   */
  async resetPassword(email: string): Promise<{ error: Error | null }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'adhdfocus://auth/reset-password',
    });

    return {
      error: error ? new Error(error.message) : null,
    };
  },

  /**
   * Update password
   */
  async updatePassword(newPassword: string): Promise<{ error: Error | null }> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    return {
      error: error ? new Error(error.message) : null,
    };
  },

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
  },
};
