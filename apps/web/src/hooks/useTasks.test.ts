import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useTasks } from './useTasks';
import { tasksApi } from '@/api';
import type { Task } from '@adhd-focus/shared';

// Mock the API
vi.mock('@/api', () => ({
  tasksApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockTasksApi = tasksApi as {
  list: ReturnType<typeof vi.fn>;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
};

// Mock task factory
const createMockTask = (overrides: Partial<Task> = {}): Task => ({
  id: 'task-1',
  user_id: 'user-1',
  title: 'Test Task',
  status: 'today',
  energy_required: 'medium',
  priority: 'should',
  pomodoros_completed: 0,
  tags: [],
  streak_contribution: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  sort_order: 0,
  ...overrides,
});

describe('useTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockTasksApi.list.mockResolvedValue([]);
  });

  describe('initialization', () => {
    it('fetches tasks on mount when autoFetch is true', async () => {
      const mockTasks = [createMockTask()];
      mockTasksApi.list.mockResolvedValue(mockTasks);

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockTasksApi.list).toHaveBeenCalled();
      expect(result.current.tasks).toEqual(mockTasks);
    });

    it('does not fetch tasks when autoFetch is false', async () => {
      renderHook(() => useTasks({ autoFetch: false }));

      await new Promise((r) => setTimeout(r, 50));

      expect(mockTasksApi.list).not.toHaveBeenCalled();
    });

    it('sets loading state correctly', async () => {
      mockTasksApi.list.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve([]), 50))
      );

      const { result } = renderHook(() => useTasks());

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('todayTasks filter', () => {
    it('returns only tasks with status today or in_progress', async () => {
      const mockTasks = [
        createMockTask({ id: '1', status: 'today' }),
        createMockTask({ id: '2', status: 'in_progress' }),
        createMockTask({ id: '3', status: 'inbox' }),
        createMockTask({ id: '4', status: 'done' }),
      ];
      mockTasksApi.list.mockResolvedValue(mockTasks);

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.todayTasks).toHaveLength(2);
      expect(result.current.todayTasks.map((t) => t.id)).toEqual(['1', '2']);
    });
  });

  describe('inboxTasks filter', () => {
    it('returns only tasks with status inbox', async () => {
      const mockTasks = [
        createMockTask({ id: '1', status: 'today' }),
        createMockTask({ id: '2', status: 'inbox' }),
        createMockTask({ id: '3', status: 'inbox' }),
      ];
      mockTasksApi.list.mockResolvedValue(mockTasks);

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.inboxTasks).toHaveLength(2);
      expect(result.current.inboxTasks.map((t) => t.id)).toEqual(['2', '3']);
    });
  });

  describe('create', () => {
    it('adds new task to the list', async () => {
      mockTasksApi.list.mockResolvedValue([]);
      const newTask = createMockTask({ id: 'new-task', title: 'New Task' });
      mockTasksApi.create.mockResolvedValue(newTask);

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.create({ title: 'New Task' });
      });

      expect(result.current.tasks).toContainEqual(newTask);
    });
  });

  describe('complete', () => {
    it('updates task status to done', async () => {
      const task = createMockTask({ id: 'task-1', status: 'today' });
      mockTasksApi.list.mockResolvedValue([task]);
      mockTasksApi.update.mockResolvedValue({ ...task, status: 'done' });

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.complete('task-1');
      });

      expect(mockTasksApi.update).toHaveBeenCalledWith('task-1', {
        status: 'done',
        completed_at: expect.any(String),
      });
    });
  });

  describe('moveToToday', () => {
    it('updates task status to today with scheduled_date', async () => {
      const task = createMockTask({ id: 'task-1', status: 'inbox' });
      mockTasksApi.list.mockResolvedValue([task]);
      mockTasksApi.update.mockResolvedValue({ ...task, status: 'today' });

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.moveToToday('task-1');
      });

      expect(mockTasksApi.update).toHaveBeenCalledWith('task-1', {
        status: 'today',
        scheduled_date: expect.any(String),
      });
    });
  });

  describe('moveToInbox', () => {
    it('updates task status to inbox', async () => {
      const task = createMockTask({ id: 'task-1', status: 'today' });
      mockTasksApi.list.mockResolvedValue([task]);
      mockTasksApi.update.mockResolvedValue({ ...task, status: 'inbox' });

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.moveToInbox('task-1');
      });

      expect(mockTasksApi.update).toHaveBeenCalledWith('task-1', {
        status: 'inbox',
        scheduled_date: undefined,
      });
    });
  });

  describe('deleteTask', () => {
    it('removes task from the list optimistically', async () => {
      const task = createMockTask({ id: 'task-1' });
      mockTasksApi.list.mockResolvedValue([task]);
      mockTasksApi.delete.mockResolvedValue(undefined);

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.tasks).toHaveLength(1);

      await act(async () => {
        await result.current.deleteTask('task-1');
      });

      expect(result.current.tasks).toHaveLength(0);
      expect(mockTasksApi.delete).toHaveBeenCalledWith('task-1');
    });
  });

  describe('error handling', () => {
    it('sets error state when fetch fails', async () => {
      const error = new Error('Network error');
      mockTasksApi.list.mockRejectedValue(error);

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toEqual(error);
    });
  });

  describe('currentTask', () => {
    it('returns in_progress task if exists', async () => {
      const mockTasks = [
        createMockTask({ id: '1', status: 'today' }),
        createMockTask({ id: '2', status: 'in_progress' }),
      ];
      mockTasksApi.list.mockResolvedValue(mockTasks);

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.currentTask?.id).toBe('2');
    });

    it('returns first today task if no in_progress', async () => {
      const mockTasks = [
        createMockTask({ id: '1', status: 'today' }),
        createMockTask({ id: '2', status: 'today' }),
      ];
      mockTasksApi.list.mockResolvedValue(mockTasks);

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.currentTask?.id).toBe('1');
    });

    it('returns null if no today tasks', async () => {
      mockTasksApi.list.mockResolvedValue([
        createMockTask({ status: 'inbox' }),
      ]);

      const { result } = renderHook(() => useTasks());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.currentTask).toBeNull();
    });
  });
});
