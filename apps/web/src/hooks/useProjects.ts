'use client';

/**
 * Projects Hook - Business logic for project operations
 * Uses Next.js API routes with fetch
 */

import { useState, useEffect, useCallback } from 'react';
import type { Project } from '@/db/schema';

interface CreateProjectInput {
  name: string;
  description?: string;
  color?: string;
  emoji?: string;
}

interface UpdateProjectInput {
  name?: string;
  description?: string | null;
  color?: string;
  emoji?: string;
  archived?: boolean;
}

interface UseProjectsOptions {
  includeArchived?: boolean;
  withTaskCount?: boolean;
  autoFetch?: boolean;
}

interface ProjectWithCount extends Project {
  taskCount?: number;
}

interface UseProjectsReturn {
  projects: ProjectWithCount[];
  loading: boolean;
  error: Error | null;
  fetch: () => Promise<void>;
  create: (input: CreateProjectInput) => Promise<Project>;
  update: (id: string, input: UpdateProjectInput) => Promise<Project>;
  archive: (id: string) => Promise<void>;
  unarchive: (id: string) => Promise<void>;
  deleteProject: (id: string, hard?: boolean) => Promise<void>;
  getById: (id: string) => ProjectWithCount | undefined;
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

export function useProjects(options: UseProjectsOptions = {}): UseProjectsReturn {
  const { includeArchived = false, withTaskCount = false, autoFetch = true } = options;

  const [projects, setProjects] = useState<ProjectWithCount[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (includeArchived) params.set('includeArchived', 'true');
      if (withTaskCount) params.set('withTaskCount', 'true');

      const url = `/api/projects${params.toString() ? `?${params}` : ''}`;
      const data = await apiRequest<ProjectWithCount[]>(url);
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch projects'));
    } finally {
      setLoading(false);
    }
  }, [includeArchived, withTaskCount]);

  useEffect(() => {
    if (autoFetch) {
      fetch();
    }
  }, [fetch, autoFetch]);

  const create = useCallback(async (input: CreateProjectInput): Promise<Project> => {
    const newProject = await apiRequest<Project>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    setProjects((prev) => [...prev, newProject].sort((a, b) => a.name.localeCompare(b.name)));
    return newProject;
  }, []);

  const update = useCallback(async (id: string, input: UpdateProjectInput): Promise<Project> => {
    const updated = await apiRequest<Project>(`/api/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
    return updated;
  }, []);

  const archive = useCallback(async (id: string): Promise<void> => {
    await update(id, { archived: true });
  }, [update]);

  const unarchive = useCallback(async (id: string): Promise<void> => {
    await update(id, { archived: false });
  }, [update]);

  const deleteProject = useCallback(async (id: string, hard = false): Promise<void> => {
    const url = hard ? `/api/projects/${id}?hard=true` : `/api/projects/${id}`;
    await apiRequest(url, { method: 'DELETE' });
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const getById = useCallback((id: string): ProjectWithCount | undefined => {
    return projects.find((p) => p.id === id);
  }, [projects]);

  return {
    projects,
    loading,
    error,
    fetch,
    create,
    update,
    archive,
    unarchive,
    deleteProject,
    getById,
  };
}
