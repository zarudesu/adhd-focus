'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams, useRouter } from 'next/navigation';
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { useAllWikiPages } from "@/hooks/useAllWikiPages";
import { useProjectWiki } from "@/hooks/useProjectWiki";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { BookOpen, ChevronRight, FileText, Plus, Pencil, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

const WikiEditor = dynamic(
  () => import('@/components/wiki/WikiEditor').then(mod => ({ default: mod.WikiEditor })),
  { ssr: false, loading: () => <div className="h-[400px] border border-border rounded-lg animate-pulse bg-muted" /> }
);

export default function WikiHubPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { projectsWithPages, loading, refresh } = useAllWikiPages();

  const initialPageId = searchParams.get('page');
  const [selectedPageId, setSelectedPageId] = useState<string | null>(initialPageId);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(() => {
    if (!initialPageId) return null;
    const project = projectsWithPages.find(p => p.pages.some(pg => pg.id === initialPageId));
    return project?.projectId ?? null;
  });
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');

  // Use the project-specific wiki hook for loading/editing pages
  const wiki = useProjectWiki(selectedProjectId || '');

  const handleSelectPage = useCallback((projectId: string, pageId: string) => {
    setSelectedProjectId(projectId);
    setSelectedPageId(pageId);
    wiki.loadPage(pageId);
    router.replace(`/dashboard/wiki?page=${pageId}`, { scroll: false });
  }, [wiki, router]);

  const handleContentChange = useCallback((content: unknown) => {
    if (selectedPageId && selectedProjectId) {
      wiki.updatePage(selectedPageId, { content });
    }
  }, [selectedPageId, selectedProjectId, wiki]);

  const handleSaveTitle = useCallback(async () => {
    if (selectedPageId && titleDraft.trim()) {
      await wiki.updatePage(selectedPageId, { title: titleDraft.trim() });
      refresh();
    }
    setEditingTitle(false);
  }, [selectedPageId, titleDraft, wiki, refresh]);

  const handleCreatePage = useCallback(async (projectId: string) => {
    setSelectedProjectId(projectId);
    // Small delay to let hook re-init with new projectId
    setTimeout(async () => {
      const res = await fetch(`/api/projects/${projectId}/wiki`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Untitled' }),
      });
      if (res.ok) {
        const page = await res.json();
        refresh();
        setSelectedPageId(page.id);
        router.replace(`/dashboard/wiki?page=${page.id}`, { scroll: false });
      }
    }, 0);
  }, [refresh, router]);

  return (
    <>
      <PageHeader
        title="Wiki"
        description="All your knowledge in one place"
      />

      <main className="flex-1 p-4">
        <div className="flex gap-6 flex-col md:flex-row">
          {/* Left panel: project tree */}
          <div className="w-full md:w-64 shrink-0">
            <div className="sticky top-4 space-y-1">
              {loading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-8 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : projectsWithPages.length === 0 ? (
                <div className="text-center py-8">
                  <div className="rounded-full bg-primary/10 p-3 mx-auto w-fit mb-3">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">No wiki pages yet</p>
                  <p className="text-xs text-muted-foreground">
                    Create wiki pages in your{' '}
                    <Link href="/dashboard/projects" className="text-primary hover:underline">projects</Link>
                  </p>
                </div>
              ) : (
                projectsWithPages.map((project) => (
                  <Collapsible key={project.projectId} defaultOpen className="group/wiki">
                    <div className="flex items-center justify-between">
                      <CollapsibleTrigger className="flex items-center gap-1.5 px-2 py-1.5 text-sm font-medium hover:bg-muted rounded-md flex-1 text-left">
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 group-data-[state=open]/wiki:rotate-90" />
                        <span>{project.projectEmoji || '📁'}</span>
                        <span className="truncate">{project.projectName}</span>
                      </CollapsibleTrigger>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 opacity-0 group-hover/wiki:opacity-100"
                        onClick={() => handleCreatePage(project.projectId)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <CollapsibleContent>
                      <div className="ml-4 space-y-0.5 mt-0.5">
                        {project.pages.map((page) => (
                          <button
                            key={page.id}
                            className={cn(
                              "flex items-center gap-2 w-full px-2 py-1.5 text-sm rounded-md text-left transition-colors",
                              selectedPageId === page.id
                                ? "bg-primary/10 text-primary font-medium"
                                : "hover:bg-muted text-muted-foreground"
                            )}
                            onClick={() => handleSelectPage(project.projectId, page.id)}
                          >
                            <FileText className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{page.title}</span>
                          </button>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                ))
              )}
            </div>
          </div>

          {/* Right panel: editor */}
          <div className="flex-1 min-w-0">
            {wiki.activePage ? (
              <div className="space-y-4">
                {/* Page title */}
                <div className="flex items-center justify-between">
                  {editingTitle ? (
                    <div className="flex items-center gap-2 flex-1">
                      <Input
                        value={titleDraft}
                        onChange={(e) => setTitleDraft(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSaveTitle(); if (e.key === 'Escape') setEditingTitle(false); }}
                        className="text-xl font-bold h-10"
                        autoFocus
                      />
                      <Button size="sm" variant="ghost" onClick={handleSaveTitle}>
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <h2
                      className="text-xl font-bold cursor-pointer hover:text-muted-foreground flex items-center gap-2 group"
                      onClick={() => { setTitleDraft(wiki.activePage!.title); setEditingTitle(true); }}
                    >
                      {wiki.activePage.title}
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h2>
                  )}
                </div>

                <WikiEditor
                  content={wiki.activePage.content}
                  onChange={handleContentChange}
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="rounded-full bg-primary/10 p-4 mb-4">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-1">
                  {projectsWithPages.length === 0 ? 'Wiki' : 'Select a page'}
                </h3>
                <p className="text-sm text-muted-foreground max-w-xs">
                  {projectsWithPages.length === 0
                    ? 'Create wiki pages in your projects to see them here'
                    : 'Choose a page from the sidebar to start editing'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
