/**
 * Profile API - User profile and preferences
 */

import { createClient } from '@/lib/supabase/client';
import type { User, UserPreferences } from '@adhd-focus/shared';

export const profileApi = {
  /**
   * Get current user profile
   */
  async get(): Promise<User | null> {
    const supabase = createClient();
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return {
      id: data.id,
      email: data.email,
      display_name: data.display_name,
      avatar_url: data.avatar_url,
      preferences: data.preferences as UserPreferences,
      stats: {
        current_streak: data.current_streak,
        longest_streak: data.longest_streak,
        total_tasks_completed: data.total_tasks_completed,
        total_pomodoros: data.total_pomodoros,
        total_focus_minutes: data.total_focus_minutes,
        tasks_completed_this_week: 0,
        pomodoros_this_week: 0,
        focus_minutes_this_week: 0,
        achievements: data.achievements || [],
      },
      created_at: data.created_at,
      updated_at: data.updated_at,
    } as User;
  },

  /**
   * Update profile
   */
  async update(updates: {
    display_name?: string;
    avatar_url?: string;
  }): Promise<User> {
    const supabase = createClient();
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', authUser.user.id)
      .select()
      .single();

    if (error) throw error;
    return this.get() as Promise<User>;
  },

  /**
   * Update preferences
   */
  async updatePreferences(preferences: Partial<UserPreferences>): Promise<UserPreferences> {
    const supabase = createClient();
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) throw new Error('Not authenticated');

    const current = await this.get();
    const merged = {
      ...current?.preferences,
      ...preferences,
    };

    const { data, error } = await supabase
      .from('profiles')
      .update({ preferences: merged })
      .eq('id', authUser.user.id)
      .select('preferences')
      .single();

    if (error) throw error;
    return data.preferences as UserPreferences;
  },
};
