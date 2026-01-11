import { describe, it, expect, vi, beforeEach } from 'vitest';
import { tasksApi } from './tasks';

// Mock Supabase client
const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockOrder = vi.fn();
const mockEq = vi.fn();
const mockIn = vi.fn();
const mockSingle = vi.fn();
const mockGetUser = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: mockFrom,
    auth: {
      getUser: mockGetUser,
    },
  }),
}));

describe('tasksApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default chain mocks
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    });

    mockSelect.mockReturnValue({
      order: mockOrder,
      eq: mockEq,
      single: mockSingle,
    });

    mockOrder.mockReturnValue({
      eq: mockEq,
      in: mockIn,
    });

    mockInsert.mockReturnValue({
      select: mockSelect,
    });

    mockUpdate.mockReturnValue({
      eq: mockEq,
    });

    mockDelete.mockReturnValue({
      eq: mockEq,
    });

    mockEq.mockReturnValue({
      select: mockSelect,
      single: mockSingle,
    });

    // Default: user is authenticated
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-123' } },
    });
  });

  describe('list', () => {
    it('fetches tasks ordered by created_at descending', async () => {
      const mockTasks = [
        { id: '1', title: 'Task 1' },
        { id: '2', title: 'Task 2' },
      ];

      mockOrder.mockResolvedValue({ data: mockTasks, error: null });

      const result = await tasksApi.list();

      expect(mockFrom).toHaveBeenCalledWith('tasks');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
      expect(result).toEqual(mockTasks);
    });

    it('applies status filter when provided', async () => {
      mockOrder.mockReturnValue({ eq: mockEq });
      mockEq.mockResolvedValue({ data: [], error: null });

      await tasksApi.list({ status: 'today' });

      expect(mockEq).toHaveBeenCalledWith('status', 'today');
    });

    it('applies status array filter with in()', async () => {
      mockOrder.mockReturnValue({ in: mockIn });
      mockIn.mockResolvedValue({ data: [], error: null });

      await tasksApi.list({ status: ['today', 'in_progress'] });

      expect(mockIn).toHaveBeenCalledWith('status', ['today', 'in_progress']);
    });

    it('throws error when fetch fails', async () => {
      const error = { message: 'Database error' };
      mockOrder.mockResolvedValue({ data: null, error });

      await expect(tasksApi.list()).rejects.toEqual(error);
    });
  });

  describe('get', () => {
    it('fetches a single task by id', async () => {
      const mockTask = { id: '1', title: 'Task 1' };
      mockSingle.mockResolvedValue({ data: mockTask, error: null });

      const result = await tasksApi.get('1');

      expect(mockFrom).toHaveBeenCalledWith('tasks');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('id', '1');
      expect(result).toEqual(mockTask);
    });

    it('returns null when task not found', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' },
      });

      const result = await tasksApi.get('nonexistent');

      expect(result).toBeNull();
    });

    it('throws error for other errors', async () => {
      const error = { code: 'OTHER', message: 'Database error' };
      mockSingle.mockResolvedValue({ data: null, error });

      await expect(tasksApi.get('1')).rejects.toEqual(error);
    });
  });

  describe('create', () => {
    it('creates a new task with user_id', async () => {
      const createdTask = {
        id: '1',
        title: 'New Task',
        status: 'inbox',
        user_id: 'user-123',
      };

      mockSelect.mockReturnValue({ single: mockSingle });
      mockSingle.mockResolvedValue({ data: createdTask, error: null });

      const result = await tasksApi.create({ title: 'New Task' });

      expect(mockGetUser).toHaveBeenCalled();
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Task',
          user_id: 'user-123',
          status: 'inbox',
          energy_required: 'medium',
          priority: 'should',
        })
      );
      expect(result).toEqual(createdTask);
    });

    it('auto-sets status to today when scheduled_date is today', async () => {
      const today = new Date().toISOString().split('T')[0];
      const createdTask = { id: '1', title: 'Today Task', status: 'today' };

      mockSelect.mockReturnValue({ single: mockSingle });
      mockSingle.mockResolvedValue({ data: createdTask, error: null });

      await tasksApi.create({ title: 'Today Task', scheduled_date: today });

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'today',
          scheduled_date: today,
        })
      );
    });

    it('uses explicit status if provided', async () => {
      const createdTask = { id: '1', title: 'Task', status: 'today' };

      mockSelect.mockReturnValue({ single: mockSingle });
      mockSingle.mockResolvedValue({ data: createdTask, error: null });

      await tasksApi.create({ title: 'Task', status: 'today' });

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'today',
        })
      );
    });

    it('throws error when not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } });

      await expect(tasksApi.create({ title: 'Test' })).rejects.toThrow('Not authenticated');
    });

    it('throws error when creation fails', async () => {
      const error = { message: 'Insert failed' };
      mockSelect.mockReturnValue({ single: mockSingle });
      mockSingle.mockResolvedValue({ data: null, error });

      await expect(tasksApi.create({ title: 'Test' })).rejects.toEqual(error);
    });
  });

  describe('update', () => {
    it('updates a task and adds updated_at', async () => {
      const updatedTask = { id: '1', title: 'Updated Title' };

      mockEq.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ single: mockSingle });
      mockSingle.mockResolvedValue({ data: updatedTask, error: null });

      const result = await tasksApi.update('1', { title: 'Updated Title' });

      expect(mockFrom).toHaveBeenCalledWith('tasks');
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Updated Title',
          updated_at: expect.any(String),
        })
      );
      expect(mockEq).toHaveBeenCalledWith('id', '1');
      expect(result).toEqual(updatedTask);
    });

    it('throws error when update fails', async () => {
      const error = { message: 'Update failed' };
      mockEq.mockReturnValue({ select: mockSelect });
      mockSelect.mockReturnValue({ single: mockSingle });
      mockSingle.mockResolvedValue({ data: null, error });

      await expect(tasksApi.update('1', { title: 'Test' })).rejects.toEqual(error);
    });
  });

  describe('delete (soft delete)', () => {
    it('soft deletes a task by setting status to archived', async () => {
      mockEq.mockResolvedValue({ error: null });

      await tasksApi.delete('1');

      expect(mockFrom).toHaveBeenCalledWith('tasks');
      expect(mockUpdate).toHaveBeenCalledWith({ status: 'archived' });
      expect(mockEq).toHaveBeenCalledWith('id', '1');
    });

    it('throws error when delete fails', async () => {
      const error = { message: 'Delete failed' };
      mockEq.mockResolvedValue({ error });

      await expect(tasksApi.delete('1')).rejects.toEqual(error);
    });
  });

  describe('hardDelete', () => {
    it('permanently deletes a task', async () => {
      mockEq.mockResolvedValue({ error: null });

      await tasksApi.hardDelete('1');

      expect(mockFrom).toHaveBeenCalledWith('tasks');
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', '1');
    });

    it('throws error when hard delete fails', async () => {
      const error = { message: 'Delete failed' };
      mockEq.mockResolvedValue({ error });

      await expect(tasksApi.hardDelete('1')).rejects.toEqual(error);
    });
  });
});
