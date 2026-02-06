/**
 * Projects Hook
 */
import { useState, useEffect, useCallback } from 'react';
import { projectsApi, type CreateProjectInput } from '../api/projects';
import type { Project } from '../types';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await projectsApi.list();
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

  const create = useCallback(async (input: CreateProjectInput): Promise<Project> => {
    const project = await projectsApi.create(input);
    setProjects((prev) => [...prev, project]);
    return project;
  }, []);

  return { projects, loading, error, fetch, create };
}
