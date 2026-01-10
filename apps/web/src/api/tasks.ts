/**
 * Tasks API - Direct Supabase operations
 * Low-level API calls, no business logic
 */

import { createClient } from '@/lib/supabase/client';
import type { Task, CreateTaskInput, UpdateTaskInput, TaskStatus } from '@adhd-focus/shared';

export interface TaskFilters {
  status?: TaskStatus | TaskStatus[];
  project_id?: string;
  scheduled_date?: string;
  due_date_before?: string;
  energy_required?: string;
  limit?: number;
  offset?: number;
}

export const tasksApi = {
  /**
   * Fetch tasks with optional filters
   */
  async list(filters: TaskFilters = {}): Promise<Task[]> {
    const supabase = createClient();

    let query = supabase
      .from('tasks')
      .select('*')
      .order('position', { ascending: true })
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        query = query.in('status', filters.status);
      } else {
        query = query.eq('status', filters.status);
      }
    }

    if (filters.project_id) {
      query = query.eq('project_id', filters.project_id);
    }

    if (filters.scheduled_date) {
      query = query.eq('scheduled_date', filters.scheduled_date);
    }

    if (filters.due_date_before) {
      query = query.lte('due_date', filters.due_date_before);
    }

    if (filters.energy_required) {
      query = query.eq('energy_required', filters.energy_required);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as Task[];
  },

  /**
   * Get single task by ID
   */
  async get(id: string): Promise<Task | null> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data as Task;
  },

  /**
   * Create new task
   */
  async create(input: CreateTaskInput): Promise<Task> {
    const supabase = createClient();

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        user_id: userData.user.id,
        title: input.title,
        description: input.description,
        status: 'inbox',
        energy_required: input.energy_required || 'medium',
        priority: input.priority || 'should',
        estimated_minutes: input.estimated_minutes,
        due_date: input.due_date,
        scheduled_date: input.scheduled_date,
        project_id: input.project_id,
        parent_task_id: input.parent_task_id,
        tags: input.tags || [],
      })
      .select()
      .single();

    if (error) throw error;
    return data as Task;
  },

  /**
   * Update existing task
   */
  async update(id: string, input: UpdateTaskInput): Promise<Task> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('tasks')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Task;
  },

  /**
   * Delete task (soft delete - move to archived)
   */
  async delete(id: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
      .from('tasks')
      .update({ status: 'archived' })
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Hard delete task
   */
  async hardDelete(id: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Batch update task order
   */
  async reorder(updates: { id: string; position: number }[]): Promise<void> {
    const supabase = createClient();

    for (const update of updates) {
      const { error } = await supabase
        .from('tasks')
        .update({ position: update.position })
        .eq('id', update.id);

      if (error) throw error;
    }
  },

  /**
   * Subscribe to real-time task changes
   */
  subscribe(
    userId: string,
    callback: (payload: { eventType: string; new: Task; old: Task }) => void
  ) {
    const supabase = createClient();

    return supabase
      .channel('tasks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          callback({
            eventType: payload.eventType,
            new: payload.new as Task,
            old: payload.old as Task,
          });
        }
      )
      .subscribe();
  },
};
