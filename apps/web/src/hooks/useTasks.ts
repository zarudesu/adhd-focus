'use client';

/**
 * Tasks Hook - Business logic for task operations
 * Uses Next.js API routes with fetch
 */

import { useState, useEffect, useCallback } from 'react';
import type { Task } from '@/db/schema';

interface TaskFilters {
  status?: string | string[];
  projectId?: string;
  scheduledDate?: string;
  dueDateBefore?: string;
  energyRequired?: 'low' | 'medium' | 'high';
  limit?: number;
  offset?: number;
}

interface CreateTaskInput {
  title: string;
  description?: string;
  status?: 'inbox' | 'today' | 'scheduled';
  energyRequired?: 'low' | 'medium' | 'high';
  priority?: 'must' | 'should' | 'want' | 'someday';
  estimatedMinutes?: number;
  dueDate?: string;
  scheduledDate?: string;
  projectId?: string;
  tags?: string[];
}

interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: 'inbox' | 'today' | 'scheduled' | 'in_progress' | 'done' | 'archived';
  energyRequired?: 'low' | 'medium' | 'high';
  priority?: 'must' | 'should' | 'want' | 'someday';
  estimatedMinutes?: number | null;
  actualMinutes?: number | null;
  pomodorosCompleted?: number;
  dueDate?: string | null;
  scheduledDate?: string | null;
  completedAt?: string | null;
  projectId?: string | null;
  tags?: string[];
  sortOrder?: number;
}

interface UseTasksOptions {
  filters?: TaskFilters;
  autoFetch?: boolean;
}

interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: Error | null;
  fetch: () => Promise<void>;
  create: (input: CreateTaskInput) => Promise<Task>;
  update: (id: string, input: UpdateTaskInput) => Promise<Task>;
  complete: (id: string) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  moveToToday: (id: string) => Promise<Task>;
  moveToInbox: (id: string) => Promise<Task>;
  moveToSomeday: (id: string) => Promise<Task>;
  scheduleTask: (id: string, date: string) => Promise<Task>;
  todayTasks: Task[];
  inboxTasks: Task[];
  currentTask: Task | null;
}

// API helper
async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  return res.json();
}

export function useTasks(options: UseTasksOptions = {}): UseTasksReturn {
  const { filters = {}, autoFetch = true } = options;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.status) {
        params.set('status', Array.isArray(filters.status) ? filters.status.join(',') : filters.status);
      }
      if (filters.projectId) params.set('projectId', filters.projectId);
      if (filters.scheduledDate) params.set('scheduledDate', filters.scheduledDate);
      if (filters.dueDateBefore) params.set('dueDateBefore', filters.dueDateBefore);
      if (filters.energyRequired) params.set('energyRequired', filters.energyRequired);
      if (filters.limit) params.set('limit', String(filters.limit));
      if (filters.offset) params.set('offset', String(filters.offset));

      const url = `/api/tasks${params.toString() ? `?${params}` : ''}`;
      const data = await apiRequest<Task[]>(url);
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch tasks'));
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    if (autoFetch) {
      fetch();
    }
  }, [fetch, autoFetch]);

  const create = useCallback(async (input: CreateTaskInput): Promise<Task> => {
    const newTask = await apiRequest<Task>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  }, []);

  const update = useCallback(async (id: string, input: UpdateTaskInput): Promise<Task> => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...input } as Task : t))
    );

    try {
      const updated = await apiRequest<Task>(`/api/tasks/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(input),
      });
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? updated : t))
      );
      return updated;
    } catch (err) {
      // Rollback on error
      fetch();
      throw err;
    }
  }, [fetch]);

  const complete = useCallback(async (id: string): Promise<Task> => {
    return update(id, {
      status: 'done',
      completedAt: new Date().toISOString(),
    });
  }, [update]);

  const deleteTask = useCallback(async (id: string): Promise<void> => {
    // Optimistic delete
    setTasks((prev) => prev.filter((t) => t.id !== id));

    try {
      await apiRequest(`/api/tasks/${id}`, { method: 'DELETE' });
    } catch (err) {
      fetch();
      throw err;
    }
  }, [fetch]);

  const moveToToday = useCallback(async (id: string): Promise<Task> => {
    const today = new Date().toISOString().split('T')[0];
    return update(id, {
      status: 'today',
      scheduledDate: today,
    });
  }, [update]);

  const moveToInbox = useCallback(async (id: string): Promise<Task> => {
    return update(id, {
      status: 'inbox',
      scheduledDate: null,
    });
  }, [update]);

  const moveToSomeday = useCallback(async (id: string): Promise<Task> => {
    return update(id, {
      priority: 'someday',
      status: 'archived',
    });
  }, [update]);

  const scheduleTask = useCallback(async (id: string, date: string): Promise<Task> => {
    return update(id, {
      status: 'scheduled',
      scheduledDate: date,
    });
  }, [update]);

  const todayTasks = tasks.filter(
    (t) => t.status === 'today' || t.status === 'in_progress'
  );

  const inboxTasks = tasks.filter((t) => t.status === 'inbox');

  const currentTask = todayTasks.find((t) => t.status === 'in_progress') || todayTasks[0] || null;

  return {
    tasks,
    loading,
    error,
    fetch,
    create,
    update,
    complete,
    deleteTask,
    moveToToday,
    moveToInbox,
    moveToSomeday,
    scheduleTask,
    todayTasks,
    inboxTasks,
    currentTask,
  };
}
