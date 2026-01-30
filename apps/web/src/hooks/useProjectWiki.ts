'use client';

import { useState, useEffect, useCallback } from 'react';

interface WikiPageSummary {
  id: string;
  title: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

interface WikiPage extends WikiPageSummary {
  projectId: string;
  userId: string;
  content: unknown;
}

export function useProjectWiki(projectId: string) {
  const [pages, setPages] = useState<WikiPageSummary[]>([]);
  const [activePage, setActivePage] = useState<WikiPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPages = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${projectId}/wiki`);
      if (!res.ok) throw new Error('Failed to fetch wiki pages');
      const data = await res.json();
      setPages(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const loadPage = useCallback(async (pageId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/wiki/${pageId}`);
      if (!res.ok) throw new Error('Failed to load page');
      const data = await res.json();
      setActivePage(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    }
  }, [projectId]);

  const createPage = useCallback(async (title?: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/wiki`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title || 'Untitled' }),
      });
      if (!res.ok) throw new Error('Failed to create page');
      const page = await res.json();
      await fetchPages();
      setActivePage(page);
      return page;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    }
  }, [projectId, fetchPages]);

  const updatePage = useCallback(async (pageId: string, data: { title?: string; content?: unknown }) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/wiki/${pageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update page');
      const updated = await res.json();
      // Update active page if it's the one we edited
      if (activePage?.id === pageId) {
        setActivePage(updated);
      }
      // Update title in list if changed
      if (data.title) {
        setPages(prev => prev.map(p => p.id === pageId ? { ...p, title: data.title!, updatedAt: updated.updatedAt } : p));
      }
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    }
  }, [projectId, activePage?.id]);

  const deletePage = useCallback(async (pageId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/wiki/${pageId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete page');
      setPages(prev => prev.filter(p => p.id !== pageId));
      if (activePage?.id === pageId) {
        setActivePage(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    }
  }, [projectId, activePage?.id]);

  return {
    pages,
    activePage,
    loading,
    error,
    createPage,
    updatePage,
    deletePage,
    loadPage,
    setActivePage,
  };
}
