/**
 * Tasks API - REST calls to backend
 */
import { api } from '../lib/api-client';
import type { Task, TaskStatus, CreateTaskInput, UpdateTaskInput } from '../types';

export interface TaskFilters {
  status?: TaskStatus | TaskStatus[];
  projectId?: string;
  scheduledDate?: string;
  energyRequired?: string;
  limit?: number;
  offset?: number;
}

export const tasksApi = {
  /**
   * Fetch tasks with optional filters
   */
  async list(filters: TaskFilters = {}): Promise<Task[]> {
    const params = new URLSearchParams();
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        params.set('status', filters.status.join(','));
      } else {
        params.set('status', filters.status);
      }
    }
    if (filters.projectId) params.set('projectId', filters.projectId);
    if (filters.scheduledDate) params.set('scheduledDate', filters.scheduledDate);
    if (filters.energyRequired) params.set('energyRequired', filters.energyRequired);
    if (filters.limit) params.set('limit', String(filters.limit));
    if (filters.offset) params.set('offset', String(filters.offset));

    const query = params.toString();
    return api.get<Task[]>(`/tasks${query ? `?${query}` : ''}`);
  },

  /**
   * Create new task
   */
  async create(input: CreateTaskInput): Promise<Task> {
    return api.post<Task>('/tasks', input);
  },

  /**
   * Update existing task
   */
  async update(id: string, input: UpdateTaskInput): Promise<Task> {
    return api.patch<Task>(`/tasks/${id}`, input);
  },

  /**
   * Delete task
   */
  async delete(id: string): Promise<void> {
    return api.del(`/tasks/${id}`);
  },
};
