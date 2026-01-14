'use client';

/**
 * Projects Hook - Business logic for project operations
 */

import { useState, useEffect, useCallback } from 'react';
import type { Project } from '@/db/schema';

interface ProjectWithCounts extends Project {
  taskCount: number;
  completedCount: number;
}

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

interface UseProjectsReturn {
  projects: ProjectWithCounts[];
  loading: boolean;
  error: Error | null;
  fetch: () => Promise<void>;
  create: (input: CreateProjectInput) => Promise<ProjectWithCounts>;
  update: (id: string, input: UpdateProjectInput) => Promise<ProjectWithCounts>;
  archive: (id: string) => Promise<void>;
}

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

export function useProjects(): UseProjectsReturn {
  const [projects, setProjects] = useState<ProjectWithCounts[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiRequest<ProjectWithCounts[]>('/api/projects');
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch projects'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const create = useCallback(async (input: CreateProjectInput): Promise<ProjectWithCounts> => {
    const newProject = await apiRequest<ProjectWithCounts>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    setProjects((prev) => [...prev, newProject]);
    return newProject;
  }, []);

  const update = useCallback(async (id: string, input: UpdateProjectInput): Promise<ProjectWithCounts> => {
    const updated = await apiRequest<ProjectWithCounts>(`/api/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p))
    );
    return updated;
  }, []);

  const archive = useCallback(async (id: string): Promise<void> => {
    await apiRequest(`/api/projects/${id}`, { method: 'DELETE' });
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return {
    projects,
    loading,
    error,
    fetch,
    create,
    update,
    archive,
  };
}
