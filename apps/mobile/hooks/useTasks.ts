/**
 * Tasks Hook - Business logic for task operations
 * Wraps API calls with caching, optimistic updates, and state management
 */

import { useState, useEffect, useCallback } from 'react';
import { tasksApi, TaskFilters } from '../api';
import type { Task, CreateTaskInput, UpdateTaskInput, TaskStatus } from '@adhd-focus/shared';
import { formatDate } from '@adhd-focus/shared';

interface UseTasksOptions {
  filters?: TaskFilters;
  autoFetch?: boolean;
}

interface UseTasksReturn {
  // Data
  tasks: Task[];
  loading: boolean;
  error: Error | null;

  // Actions
  fetch: () => Promise<void>;
  create: (input: CreateTaskInput) => Promise<Task>;
  update: (id: string, input: UpdateTaskInput) => Promise<Task>;
  complete: (id: string) => Promise<Task>;
  delete: (id: string) => Promise<void>;
  moveToToday: (id: string) => Promise<Task>;
  moveToInbox: (id: string) => Promise<Task>;

  // Computed
  todayTasks: Task[];
  inboxTasks: Task[];
  currentTask: Task | null;
}

export function useTasks(options: UseTasksOptions = {}): UseTasksReturn {
  const { filters = {}, autoFetch = true } = options;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch tasks
  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await tasksApi.list(filters);
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch tasks'));
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetch();
    }
  }, [fetch, autoFetch]);

  // Create task
  const create = useCallback(async (input: CreateTaskInput): Promise<Task> => {
    const newTask = await tasksApi.create(input);
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  }, []);

  // Update task
  const update = useCallback(async (id: string, input: UpdateTaskInput): Promise<Task> => {
    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...input } : t))
    );

    try {
      const updated = await tasksApi.update(id, input);
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

  // Complete task
  const complete = useCallback(async (id: string): Promise<Task> => {
    return update(id, {
      status: 'done',
      completed_at: new Date().toISOString(),
    });
  }, [update]);

  // Delete task
  const deleteTask = useCallback(async (id: string): Promise<void> => {
    // Optimistic delete
    setTasks((prev) => prev.filter((t) => t.id !== id));

    try {
      await tasksApi.delete(id);
    } catch (err) {
      fetch();
      throw err;
    }
  }, [fetch]);

  // Move to today
  const moveToToday = useCallback(async (id: string): Promise<Task> => {
    return update(id, {
      status: 'today',
      scheduled_date: formatDate(new Date()),
    });
  }, [update]);

  // Move to inbox
  const moveToInbox = useCallback(async (id: string): Promise<Task> => {
    return update(id, {
      status: 'inbox',
      scheduled_date: undefined,
    });
  }, [update]);

  // Computed values
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
    delete: deleteTask,
    moveToToday,
    moveToInbox,
    todayTasks,
    inboxTasks,
    currentTask,
  };
}
