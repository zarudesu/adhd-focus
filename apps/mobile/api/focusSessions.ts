/**
 * Focus Sessions API - Pomodoro/Focus tracking
 */

import { supabase } from '../lib/supabase';
import type { FocusSession } from '@adhd-focus/shared';

export interface CreateFocusSessionInput {
  task_id?: string;
}

export interface EndFocusSessionInput {
  duration_minutes: number;
  pomodoros: number;
  breaks_taken: number;
  completed: boolean;
}

export const focusSessionsApi = {
  /**
   * Start a new focus session
   */
  async start(input: CreateFocusSessionInput = {}): Promise<FocusSession> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('focus_sessions')
      .insert({
        user_id: user.user.id,
        task_id: input.task_id,
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data as FocusSession;
  },

  /**
   * End a focus session
   */
  async end(id: string, input: EndFocusSessionInput): Promise<FocusSession> {
    const { data, error } = await supabase
      .from('focus_sessions')
      .update({
        ended_at: new Date().toISOString(),
        duration_minutes: input.duration_minutes,
        pomodoros: input.pomodoros,
        breaks_taken: input.breaks_taken,
        completed: input.completed,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as FocusSession;
  },

  /**
   * Get active session (not ended)
   */
  async getActive(): Promise<FocusSession | null> {
    const { data, error } = await supabase
      .from('focus_sessions')
      .select('*')
      .is('ended_at', null)
      .order('started_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as FocusSession;
  },

  /**
   * Get sessions for date range (for stats)
   */
  async getForDateRange(startDate: string, endDate: string): Promise<FocusSession[]> {
    const { data, error } = await supabase
      .from('focus_sessions')
      .select('*')
      .gte('started_at', startDate)
      .lte('started_at', endDate)
      .order('started_at', { ascending: false });

    if (error) throw error;
    return data as FocusSession[];
  },

  /**
   * Get total stats
   */
  async getStats(): Promise<{
    totalSessions: number;
    totalPomodoros: number;
    totalMinutes: number;
  }> {
    const { data, error } = await supabase
      .from('focus_sessions')
      .select('pomodoros, duration_minutes')
      .eq('completed', true);

    if (error) throw error;

    return {
      totalSessions: data.length,
      totalPomodoros: data.reduce((sum, s) => sum + (s.pomodoros || 0), 0),
      totalMinutes: data.reduce((sum, s) => sum + (s.duration_minutes || 0), 0),
    };
  },
};
