/**
 * Projects API - Direct Supabase operations
 */

import { createClient } from '@/lib/supabase/client';
import type { Project, CreateProjectInput, UpdateProjectInput } from '@adhd-focus/shared';

export const projectsApi = {
  /**
   * Fetch all projects for current user
   */
  async list(): Promise<Project[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('archived', false)
      .order('name');

    if (error) throw error;
    return data as Project[];
  },

  /**
   * Fetch all projects including archived
   */
  async listAll(): Promise<Project[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('archived')
      .order('name');

    if (error) throw error;
    return data as Project[];
  },

  /**
   * Get single project by ID
   */
  async get(id: string): Promise<Project | null> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data as Project;
  },

  /**
   * Create new project
   */
  async create(input: CreateProjectInput): Promise<Project> {
    const supabase = createClient();

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: userData.user.id,
        name: input.name,
        description: input.description,
        color: input.color || '#6366f1',
        emoji: input.emoji || '📁',
      })
      .select()
      .single();

    if (error) throw error;
    return data as Project;
  },

  /**
   * Update existing project
   */
  async update(id: string, input: UpdateProjectInput): Promise<Project> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from('projects')
      .update({
        ...input,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Project;
  },

  /**
   * Archive project (soft delete)
   */
  async archive(id: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
      .from('projects')
      .update({ archived: true })
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Unarchive project
   */
  async unarchive(id: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
      .from('projects')
      .update({ archived: false })
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Hard delete project
   */
  async delete(id: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  /**
   * Get task count for project
   */
  async getTaskCount(id: string): Promise<number> {
    const supabase = createClient();

    const { count, error } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', id)
      .neq('status', 'archived');

    if (error) throw error;
    return count || 0;
  },
};
