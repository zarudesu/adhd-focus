/**
 * Habits API - REST calls
 */
import { api } from '../lib/api-client';
import type { Habit, HabitCheck } from '../types';

export interface CreateHabitInput {
  name: string;
  emoji?: string;
  description?: string;
  frequency?: 'daily' | 'weekdays' | 'weekends' | 'custom';
  customDays?: number[];
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night' | 'anytime';
  color?: string;
}

export const habitsApi = {
  async list(): Promise<Habit[]> {
    const data = await api.get<{ habits: Habit[]; summary: unknown; date: string }>('/habits/today');
    return data.habits;
  },

  async create(input: CreateHabitInput): Promise<Habit> {
    return api.post<Habit>('/habits', input);
  },

  async update(id: string, input: Partial<CreateHabitInput>): Promise<Habit> {
    return api.patch<Habit>(`/habits/${id}`, input);
  },

  async delete(id: string): Promise<void> {
    return api.del(`/habits/${id}`);
  },

  async check(id: string, date: string): Promise<{ check: HabitCheck; xpAwarded: number; allHabitsDone: boolean }> {
    return api.post(`/habits/${id}/check`, { date });
  },

  async uncheck(id: string, date: string): Promise<void> {
    return api.del(`/habits/${id}/check?date=${date}`);
  },
};
