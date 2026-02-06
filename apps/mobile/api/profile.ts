/**
 * Profile API - REST calls to backend
 */
import { api } from '../lib/api-client';
import type { User, UserPreferences } from '../types';

export const profileApi = {
  /**
   * Get current user profile
   */
  async get(): Promise<User> {
    return api.get<User>('/profile');
  },

  /**
   * Update profile
   */
  async update(data: { name?: string; preferences?: Partial<UserPreferences> }): Promise<User> {
    return api.patch<User>('/profile', data);
  },
};
