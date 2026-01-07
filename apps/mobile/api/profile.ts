/**
 * Profile API - User profile and preferences
 */

import { supabase } from '../lib/supabase';
import type { User, UserPreferences, UserStats, DEFAULT_PREFERENCES } from '@adhd-focus/shared';

export const profileApi = {
  /**
   * Get current user profile
   */
  async get(): Promise<User | null> {
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

    // Map DB fields to User type
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
        tasks_completed_this_week: 0, // Calculated separately
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
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
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
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) throw new Error('Not authenticated');

    // Get current preferences and merge
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

  /**
   * Increment stats (called after completing tasks/pomodoros)
   */
  async incrementStats(stats: {
    tasks_completed?: number;
    pomodoros?: number;
    focus_minutes?: number;
  }): Promise<void> {
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) throw new Error('Not authenticated');

    // Use RPC for atomic increment (or manual update)
    const { data: current } = await supabase
      .from('profiles')
      .select('total_tasks_completed, total_pomodoros, total_focus_minutes')
      .eq('id', authUser.user.id)
      .single();

    if (!current) return;

    const { error } = await supabase
      .from('profiles')
      .update({
        total_tasks_completed: (current.total_tasks_completed || 0) + (stats.tasks_completed || 0),
        total_pomodoros: (current.total_pomodoros || 0) + (stats.pomodoros || 0),
        total_focus_minutes: (current.total_focus_minutes || 0) + (stats.focus_minutes || 0),
      })
      .eq('id', authUser.user.id);

    if (error) throw error;
  },

  /**
   * Update streak
   */
  async updateStreak(newStreak: number): Promise<void> {
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) throw new Error('Not authenticated');

    const { data: current } = await supabase
      .from('profiles')
      .select('longest_streak')
      .eq('id', authUser.user.id)
      .single();

    const updates: Record<string, number> = {
      current_streak: newStreak,
    };

    // Update longest if current is higher
    if (current && newStreak > (current.longest_streak || 0)) {
      updates.longest_streak = newStreak;
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', authUser.user.id);

    if (error) throw error;
  },

  /**
   * Add achievement
   */
  async addAchievement(achievementId: string): Promise<void> {
    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) throw new Error('Not authenticated');

    const { data: current } = await supabase
      .from('profiles')
      .select('achievements')
      .eq('id', authUser.user.id)
      .single();

    const achievements = current?.achievements || [];
    if (achievements.includes(achievementId)) return; // Already has it

    const { error } = await supabase
      .from('profiles')
      .update({
        achievements: [...achievements, achievementId],
      })
      .eq('id', authUser.user.id);

    if (error) throw error;
  },
};
