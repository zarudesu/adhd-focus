'use client';

import { useState, useEffect, useCallback } from 'react';

interface WikiPageInfo {
  id: string;
  title: string;
  updatedAt: string;
}

interface ProjectWithPages {
  projectId: string;
  projectName: string;
  projectEmoji: string | null;
  pages: WikiPageInfo[];
}

export function useAllWikiPages() {
  const [projectsWithPages, setProjectsWithPages] = useState<ProjectWithPages[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/wiki');
      if (!res.ok) throw new Error('Failed to fetch wiki pages');
      const data = await res.json();
      setProjectsWithPages(data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { projectsWithPages, loading, refresh };
}
