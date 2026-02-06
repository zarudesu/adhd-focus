/**
 * Focus Sessions API - REST calls to backend
 */
import { api } from '../lib/api-client';
import type { FocusSession, CreateFocusSessionInput, EndFocusSessionInput } from '../types';

export interface FocusSessionsResponse {
  sessions: FocusSession[];
  todayStats: {
    pomodoros: number;
    focusMinutes: number;
    sessionsCompleted: number;
  };
  totalStats: {
    totalPomodoros: number;
    totalFocusMinutes: number;
  };
}

export const focusSessionsApi = {
  /**
   * Fetch focus sessions and stats
   */
  async list(): Promise<FocusSessionsResponse> {
    return api.get<FocusSessionsResponse>('/focus/sessions');
  },

  /**
   * Start a new focus session
   */
  async create(input: { taskId?: string }): Promise<FocusSession> {
    return api.post<FocusSession>('/focus/sessions', input);
  },

  /**
   * End a focus session
   */
  async end(id: string, input: EndFocusSessionInput): Promise<FocusSession> {
    return api.patch<FocusSession>(`/focus/sessions/${id}`, input);
  },
};
