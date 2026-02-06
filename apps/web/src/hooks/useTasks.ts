'use client';

/**
 * Tasks Hook - Business logic for task operations
 * Uses Next.js API routes with fetch
 * Integrated with gamification system (XP, achievements, creatures)
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { Task, Achievement, Creature } from '@/db/schema';
import { calculateTaskXp } from './useGamification';

interface TaskFilters {
  status?: string | string[];
  projectId?: string | null; // UUID, "null" for no project, or null to not filter
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
  snoozedUntil?: string | null;
}

// Result of completing a task with gamification
// beatyour8 Philosophy: No dopamine rewards on task completion
// XP and achievements are tracked silently, level ups are acknowledged calmly
export interface CompleteResult {
  task: Task;
  xpAwarded: number;
  levelUp: boolean;
  newLevel: number;
  newAchievements: Achievement[];
  creature: {
    creature: Creature;
    isNew: boolean;
    newCount: number;
  } | null;
}

interface UseTasksOptions {
  filters?: TaskFilters;
  autoFetch?: boolean;
  showSnoozed?: boolean; // Include snoozed tasks in inboxTasks
}

interface UseTasksReturn {
  tasks: Task[];
  loading: boolean;
  error: Error | null;
  fetch: () => Promise<void>;
  create: (input: CreateTaskInput) => Promise<Task>;
  update: (id: string, input: UpdateTaskInput) => Promise<Task>;
  complete: (id: string) => Promise<CompleteResult>;
  uncomplete: (id: string) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  moveToToday: (id: string) => Promise<Task>;
  moveToInbox: (id: string) => Promise<Task>;
  moveToSomeday: (id: string) => Promise<Task>;
  scheduleTask: (id: string, date: string) => Promise<Task>;
  snoozeTask: (id: string, until: string) => Promise<Task>;
  unsnoozeTask: (id: string) => Promise<Task>;
  archive: (id: string) => Promise<Task>;
  rescheduleToToday: (id: string) => Promise<Task>;
  completeYesterday: (id: string) => Promise<Task>;
  todayTasks: Task[];
  overdueTasks: Task[];
  inboxTasks: Task[];
  allInboxTasks: Task[];
  snoozedTasks: Task[];
  scheduledTasks: Task[];
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
  const { filters = {}, autoFetch = true, showSnoozed = false } = options;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const completingIdsRef = useRef<Set<string>>(new Set());

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.status) {
        params.set('status', Array.isArray(filters.status) ? filters.status.join(',') : filters.status);
      }
      if (filters.projectId !== undefined) {
        params.set('projectId', filters.projectId === null ? 'null' : filters.projectId);
      }
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
  }, [
    filters.status,
    filters.projectId,
    filters.scheduledDate,
    filters.dueDateBefore,
    filters.energyRequired,
    filters.limit,
    filters.offset,
  ]);

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

  const complete = useCallback(async (id: string): Promise<CompleteResult> => {
    // Prevent rapid double-clicks from awarding XP twice
    if (completingIdsRef.current.has(id)) {
      return { task: tasks.find((t) => t.id === id) as Task, xpAwarded: 0, levelUp: false, newLevel: 1, newAchievements: [], creature: null };
    }
    completingIdsRef.current.add(id);

    // Find task before completing
    const task = tasks.find((t) => t.id === id);

    // 1. Complete the task
    const updatedTask = await update(id, {
      status: 'done',
      completedAt: new Date().toISOString(),
    });

    // Default result (for unauthenticated users or errors)
    // beatyour8: No visual reward - just track progress silently
    const result: CompleteResult = {
      task: updatedTask,
      xpAwarded: 0,
      levelUp: false,
      newLevel: 1,
      newAchievements: [],
      creature: null,
    };

    try {
      // Get current streak for XP calculation
      let currentStreak = 0;
      try {
        const statsRes = await window.fetch('/api/gamification/stats');
        if (statsRes.ok) {
          const stats = await statsRes.json();
          currentStreak = stats.currentStreak || 0;
        }
      } catch {
        // Ignore - use 0 streak
      }

      // 2. Calculate and award XP
      const completedAtStr = updatedTask.completedAt
        ? typeof updatedTask.completedAt === 'string'
          ? updatedTask.completedAt
          : updatedTask.completedAt.toISOString()
        : null;

      const xpAmount = calculateTaskXp(
        {
          priority: task?.priority,
          energyRequired: task?.energyRequired,
          estimatedMinutes: task?.estimatedMinutes,
          dueDate: task?.dueDate,
          completedAt: completedAtStr,
        },
        currentStreak
      );

      const xpRes = await window.fetch('/api/gamification/xp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: xpAmount, reason: 'task_complete' }),
      });

      if (xpRes.ok) {
        const xpData = await xpRes.json();
        result.xpAwarded = xpAmount;
        result.levelUp = xpData.leveledUp || false;
        result.newLevel = xpData.newLevel || 1;
      }

      // beatyour8: No visual reward on task completion
      // Progress is tracked silently, reflection happens at meaningful moments

      // 3. Check achievements
      const achieveRes = await window.fetch('/api/gamification/achievements/check', {
        method: 'POST',
      });
      if (achieveRes.ok) {
        const achieveData = await achieveRes.json();
        result.newAchievements = achieveData.newAchievements || [];
      }

      // 5. Try to spawn creature
      const creatureRes = await window.fetch('/api/gamification/creatures/spawn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          onTaskComplete: true,
          isQuickTask: (task?.estimatedMinutes || 0) <= 5,
        }),
      });
      if (creatureRes.ok) {
        const creatureData = await creatureRes.json();
        if (creatureData.creature) {
          result.creature = {
            creature: creatureData.creature,
            isNew: creatureData.isNew ?? true,
            newCount: creatureData.newCount ?? 1,
          };
        }
      }
    } catch (err) {
      // Gamification errors should not break task completion
      console.error('Gamification error:', err);
    } finally {
      completingIdsRef.current.delete(id);
    }

    return result;
  }, [tasks, update]);

  const uncomplete = useCallback(async (id: string): Promise<Task> => {
    return update(id, {
      status: 'today',
      completedAt: null,
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

  const archive = useCallback(async (id: string): Promise<Task> => {
    return update(id, {
      status: 'archived',
    });
  }, [update]);

  const snoozeTask = useCallback(async (id: string, until: string): Promise<Task> => {
    // Snooze keeps task in inbox but hides it until the specified date
    return update(id, {
      snoozedUntil: until,
    });
  }, [update]);

  const unsnoozeTask = useCallback(async (id: string): Promise<Task> => {
    return update(id, {
      snoozedUntil: null,
    });
  }, [update]);

  const rescheduleToToday = useCallback(async (id: string): Promise<Task> => {
    const todayStr = new Date().toISOString().split('T')[0];
    return update(id, { scheduledDate: todayStr });
  }, [update]);

  const completeYesterday = useCallback(async (id: string): Promise<Task> => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(23, 59, 0, 0);
    return update(id, {
      status: 'done',
      completedAt: yesterday.toISOString(),
    });
  }, [update]);

  // Memoize today's date string to prevent filter recalculations
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Overdue tasks: status today/in_progress with scheduledDate before today
  const overdueTasks = useMemo(
    () =>
      tasks.filter(
        (t) =>
          (t.status === 'today' || t.status === 'in_progress') &&
          t.scheduledDate != null &&
          t.scheduledDate < today
      ),
    [tasks, today]
  );

  const overdueIds = useMemo(() => new Set(overdueTasks.map(t => t.id)), [overdueTasks]);

  const todayTasks = useMemo(
    () =>
      tasks.filter(
        (t) => {
          // Exclude overdue tasks from today list
          if (overdueIds.has(t.id)) return false;
          return (
            t.status === 'today' ||
            t.status === 'in_progress' ||
            (t.status === 'done' && (
              t.scheduledDate === today ||
              (t.completedAt !== null && new Date(t.completedAt).toISOString().startsWith(today))
            ))
          );
        }
      ),
    [tasks, today, overdueIds]
  );

  // Inbox tasks: status is inbox, no project, and not snoozed (unless showSnoozed is true)
  const inboxTasks = useMemo(
    () => tasks.filter((t) => {
      if (t.status !== 'inbox' || t.projectId) return false;
      // Check if snoozed
      if (t.snoozedUntil && !showSnoozed) {
        // Hide if snoozedUntil is in the future
        return t.snoozedUntil <= today;
      }
      return true;
    }),
    [tasks, showSnoozed, today]
  );

  // All inbox tasks including those with projects (for grouped inbox view)
  const allInboxTasks = useMemo(
    () => tasks.filter((t) => {
      if (t.status !== 'inbox') return false;
      if (t.snoozedUntil && !showSnoozed) {
        return t.snoozedUntil <= today;
      }
      return true;
    }),
    [tasks, showSnoozed, today]
  );

  // Snoozed tasks: inbox tasks with snoozedUntil in the future
  const snoozedTasks = useMemo(
    () => tasks.filter((t) =>
      t.status === 'inbox' &&
      !t.projectId &&
      t.snoozedUntil &&
      t.snoozedUntil > today
    ),
    [tasks, today]
  );

  const scheduledTasks = useMemo(
    () => tasks.filter((t) => t.status === 'scheduled'),
    [tasks]
  );

  const currentTask = useMemo(
    () => todayTasks.find((t) => t.status === 'in_progress') || todayTasks[0] || null,
    [todayTasks]
  );

  return {
    tasks,
    loading,
    error,
    fetch,
    create,
    update,
    complete,
    uncomplete,
    deleteTask,
    moveToToday,
    moveToInbox,
    moveToSomeday,
    scheduleTask,
    snoozeTask,
    unsnoozeTask,
    archive,
    rescheduleToToday,
    completeYesterday,
    todayTasks,
    overdueTasks,
    inboxTasks,
    allInboxTasks,
    snoozedTasks,
    scheduledTasks,
    currentTask,
  };
}
