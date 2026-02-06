'use client';

import { useState, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from "@/components/layout/page-header";
import { ProtectedRoute } from '@/components/gamification/ProtectedRoute';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { TaskList, AddTaskDialog } from "@/components/tasks";
import { WikiPageList } from "@/components/wiki/WikiPageList";
import { useTasks } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";
import { useProjectWiki } from "@/hooks/useProjectWiki";
import { useGamificationEvents } from "@/components/gamification/GamificationProvider";
import type { Task } from "@/db/schema";
import { TaskGroupSkeleton } from "@/components/ui/skeletons";
import { Plus, Settings, ArrowLeft, FolderOpen, Eye, EyeOff, FileText, Pencil, Check } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const WikiEditor = dynamic(
  () => import('@/components/wiki/WikiEditor').then(mod => ({ default: mod.WikiEditor })),
  { ssr: false, loading: () => <div className="h-[300px] border rounded-lg animate-pulse bg-muted" /> }
);

function ProjectDetailContent() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');

  const { projects, loading: projectsLoading, fetch: fetchProjects } = useProjects();
  const project = projects.find(p => p.id === projectId);

  const {
    tasks,
    loading: tasksLoading,
    error,
    complete,
    uncomplete,
    deleteTask,
    moveToToday,
    moveToInbox,
    create,
    update,
  } = useTasks({ filters: { projectId } });
  const { handleTaskComplete, refreshAll } = useGamificationEvents();

  const wiki = useProjectWiki(projectId);

  const handleComplete = useCallback(async (id: string) => {
    const result = await complete(id);
    fetchProjects();
    handleTaskComplete({
      levelUp: result.levelUp ? {
        newLevel: result.newLevel,
        unlockedFeatures: [],
      } : undefined,
      xpAwarded: result.xpAwarded,
      newAchievements: result.newAchievements,
      creature: result.creature,
    });
  }, [complete, fetchProjects, handleTaskComplete]);

  const activeTasks = useMemo(() => tasks.filter(t => t.status !== 'done' && t.status !== 'archived'), [tasks]);
  const completedTasks = useMemo(() => tasks.filter(t => t.status === 'done'), [tasks]);

  const loading = projectsLoading || tasksLoading;

  const handleSaveTitle = useCallback(async () => {
    if (wiki.activePage && titleDraft.trim()) {
      await wiki.updatePage(wiki.activePage.id, { title: titleDraft.trim() });
    }
    setEditingTitle(false);
  }, [wiki, titleDraft]);

  const handleContentChange = useCallback((content: unknown) => {
    if (wiki.activePage) {
      wiki.updatePage(wiki.activePage.id, { content });
    }
  }, [wiki]);

  return (
    <>
      <PageHeader
        title={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="p-1 h-auto"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            {project?.emoji && <span>{project.emoji}</span>}
            {project?.name || 'Loading...'}
          </div>
        }
        description={project?.description || `${activeTasks.length} active tasks`}
        actions={
          <div className="flex items-center gap-2">
            {completedTasks.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setHideCompleted(!hideCompleted)}
                className="gap-1.5"
              >
                {hideCompleted ? (
                  <>
                    <Eye className="h-4 w-4" />
                    <span className="hidden sm:inline">Show done</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="h-4 w-4" />
                    <span className="hidden sm:inline">Hide done</span>
                  </>
                )}
              </Button>
            )}
            <Button size="sm" variant="outline">
              <Settings className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Task
            </Button>
          </div>
        }
      />

      <AddTaskDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={async (input) => {
          await create(input);
          fetchProjects();
          refreshAll();
        }}
        defaultStatus="inbox"
        defaultProjectId={projectId}
      />

      <AddTaskDialog
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
        onSubmit={async (input) => {
          if (editingTask) {
            await update(editingTask.id, input);
            refreshAll();
          }
        }}
        task={editingTask}
        defaultStatus="inbox"
      />

      <main className="flex-1 p-4">
        <Tabs defaultValue="tasks">
          <TabsList>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="wiki" className="gap-1.5">
              <FileText className="h-3.5 w-3.5" />
              Wiki
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="space-y-6 mt-4">
            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
                {error.message}
              </div>
            )}

            {loading ? (
              <TaskGroupSkeleton />
            ) : tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-3 mb-3">
                  <FolderOpen className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">No tasks in this project</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Add tasks to organize your work
                </p>
              </div>
            ) : (
              <>
                {activeTasks.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Active ({activeTasks.length})
                    </h3>
                    <TaskList
                      tasks={activeTasks}
                      onComplete={handleComplete}
                      onUncomplete={uncomplete}
                      onDelete={deleteTask}
                      onMoveToToday={moveToToday}
                      onMoveToInbox={moveToInbox}
                      onTaskClick={setEditingTask}
                    />
                  </div>
                )}

                <AnimatePresence>
                  {completedTasks.length > 0 && !hideCompleted && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">
                        Completed ({completedTasks.length})
                      </h3>
                      <TaskList
                        tasks={completedTasks}
                        onUncomplete={uncomplete}
                        onDelete={deleteTask}
                        onTaskClick={setEditingTask}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </TabsContent>

          <TabsContent value="wiki" className="mt-4">
            <div className="flex gap-4 flex-col md:flex-row">
              {/* Page list sidebar */}
              <div className="w-full md:w-56 shrink-0">
                <WikiPageList
                  pages={wiki.pages}
                  activePageId={wiki.activePage?.id || null}
                  onSelectPage={wiki.loadPage}
                  onCreatePage={wiki.createPage}
                  onDeletePage={wiki.deletePage}
                />
              </div>

              {/* Editor area */}
              <div className="flex-1 min-w-0">
                {wiki.activePage ? (
                  <div className="space-y-3">
                    {/* Page title */}
                    <div className="flex items-center gap-2">
                      {editingTitle ? (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            value={titleDraft}
                            onChange={(e) => setTitleDraft(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSaveTitle(); if (e.key === 'Escape') setEditingTitle(false); }}
                            className="text-lg font-semibold h-9"
                            autoFocus
                          />
                          <Button size="sm" variant="ghost" onClick={handleSaveTitle}>
                            <Check className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <h2
                          className="text-lg font-semibold cursor-pointer hover:text-muted-foreground flex items-center gap-2"
                          onClick={() => { setTitleDraft(wiki.activePage!.title); setEditingTitle(true); }}
                        >
                          {wiki.activePage.title}
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        </h2>
                      )}
                    </div>

                    <WikiEditor
                      content={wiki.activePage.content}
                      onChange={handleContentChange}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="rounded-full bg-muted p-3 mb-3">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {wiki.pages.length === 0 ? 'No wiki pages yet' : 'Select a page to edit'}
                    </p>
                    {wiki.pages.length === 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3 gap-1.5"
                        onClick={() => wiki.createPage()}
                      >
                        <Plus className="h-4 w-4" />
                        Create first page
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </>
  );
}

export default function ProjectDetailPage() {
  return (
    <ProtectedRoute featureCode="nav_projects">
      <ProjectDetailContent />
    </ProtectedRoute>
  );
}
