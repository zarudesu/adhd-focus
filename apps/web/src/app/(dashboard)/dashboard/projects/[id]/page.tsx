'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { TaskList, AddTaskDialog } from "@/components/tasks";
import { useTasks } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";
import type { Task } from "@/db/schema";
import { Plus, Settings, ArrowLeft, FolderOpen } from "lucide-react";

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { projects, loading: projectsLoading } = useProjects();
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

  const activeTasks = tasks.filter(t => t.status !== 'done' && t.status !== 'archived');
  const completedTasks = tasks.filter(t => t.status === 'done');

  const loading = projectsLoading || tasksLoading;

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
          <div className="flex gap-2">
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

      {/* Add Task Dialog */}
      <AddTaskDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={async (input) => {
          await create(input);
        }}
        defaultStatus="inbox"
        defaultProjectId={projectId}
      />

      {/* Edit Task Dialog */}
      <AddTaskDialog
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
        onSubmit={async (input) => {
          if (editingTask) {
            await update(editingTask.id, input);
          }
        }}
        task={editingTask}
        defaultStatus="inbox"
      />

      <main className="flex-1 p-4 space-y-6">
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
            {error.message}
          </div>
        )}

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
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
            {/* Active tasks */}
            {activeTasks.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Active ({activeTasks.length})
                </h3>
                <TaskList
                  tasks={activeTasks}
                  onComplete={complete}
                  onUncomplete={uncomplete}
                  onDelete={deleteTask}
                  onMoveToToday={moveToToday}
                  onMoveToInbox={moveToInbox}
                  onTaskClick={setEditingTask}
                />
              </div>
            )}

            {/* Completed tasks */}
            {completedTasks.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Completed ({completedTasks.length})
                </h3>
                <TaskList
                  tasks={completedTasks}
                  onUncomplete={uncomplete}
                  onDelete={deleteTask}
                  onTaskClick={setEditingTask}
                />
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}
