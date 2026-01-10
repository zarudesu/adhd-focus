'use client';

/**
 * Tasks Hook - Business logic for task operations
 * Wraps API calls with caching, optimistic updates, and state management
 */

import { useState, useEffect, useCallback } from 'react';
import { tasksApi, TaskFilters } from '@/api';
import type { Task, CreateTaskInput, UpdateTaskInput } from '@adhd-focus/shared';
import { formatDate } from '@adhd-focus/shared';

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
  todayTasks: Task[];
  inboxTasks: Task[];
  currentTask: Task | null;
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
      const data = await tasksApi.list(filters);
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
    const newTask = await tasksApi.create(input);
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  }, []);

  const update = useCallback(async (id: string, input: UpdateTaskInput): Promise<Task> => {
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
      fetch();
      throw err;
    }
  }, [fetch]);

  const complete = useCallback(async (id: string): Promise<Task> => {
    return update(id, {
      status: 'done',
      completed_at: new Date().toISOString(),
    });
  }, [update]);

  const deleteTask = useCallback(async (id: string): Promise<void> => {
    setTasks((prev) => prev.filter((t) => t.id !== id));

    try {
      await tasksApi.delete(id);
    } catch (err) {
      fetch();
      throw err;
    }
  }, [fetch]);

  const moveToToday = useCallback(async (id: string): Promise<Task> => {
    return update(id, {
      status: 'today',
      scheduled_date: formatDate(new Date()),
    });
  }, [update]);

  const moveToInbox = useCallback(async (id: string): Promise<Task> => {
    return update(id, {
      status: 'inbox',
      scheduled_date: undefined,
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
    todayTasks,
    inboxTasks,
    currentTask,
  };
}
