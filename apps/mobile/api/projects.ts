/**
 * Projects API - REST calls to backend
 */
import { api } from '../lib/api-client';
import type { Project } from '../types';
import type { Task } from '../types';

export interface CreateProjectInput {
  name: string;
  description?: string;
  color?: string;
  emoji?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string | null;
  color?: string;
  emoji?: string;
  archived?: boolean;
}

export const projectsApi = {
  async list(): Promise<Project[]> {
    return api.get<Project[]>('/projects');
  },

  async get(id: string): Promise<Project & { tasks: Task[] }> {
    return api.get<Project & { tasks: Task[] }>(`/projects/${id}`);
  },

  async create(input: CreateProjectInput): Promise<Project> {
    return api.post<Project>('/projects', input);
  },

  async update(id: string, input: UpdateProjectInput): Promise<Project> {
    return api.patch<Project>(`/projects/${id}`, input);
  },

  async delete(id: string): Promise<void> {
    return api.del(`/projects/${id}`);
  },
};
