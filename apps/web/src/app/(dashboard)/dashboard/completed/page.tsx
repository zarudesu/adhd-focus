'use client';

import { useState } from 'react';
import { PageHeader } from "@/components/layout/page-header";
import { ProtectedRoute } from '@/components/gamification/ProtectedRoute';
import { TaskList, AddTaskDialog } from "@/components/tasks";
import { useTasks } from "@/hooks/useTasks";
import type { Task } from "@/db/schema";
import { CheckCircle2 } from "lucide-react";

function CompletedContent() {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const {
    tasks,
    loading,
    error,
    uncomplete,
    deleteTask,
    archive,
    update,
  } = useTasks({ filters: { status: 'done' } });

  // Group tasks by completion date
  const groupedTasks = tasks.reduce((acc, task) => {
    const date = task.completedAt
      ? new Date(task.completedAt).toISOString().split('T')[0]
      : 'Unknown';
    if (!acc[date]) acc[date] = [];
    acc[date].push(task);
    return acc;
  }, {} as Record<string, typeof tasks>);

  // Sort dates (newest first)
  const sortedDates = Object.keys(groupedTasks).sort((a, b) => {
    if (a === 'Unknown') return 1;
    if (b === 'Unknown') return -1;
    return b.localeCompare(a);
  });

  const formatDate = (dateStr: string) => {
    if (dateStr === 'Unknown') return dateStr;
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <PageHeader
        title="Completed"
        description={`All finished tasks (${tasks.length} total)`}
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
              <CheckCircle2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No completed tasks yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Complete tasks from Today to see them here
            </p>
          </div>
        ) : (
          sortedDates.map((date) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                {formatDate(date)}
                <span className="text-xs">({groupedTasks[date].length})</span>
              </h3>
              <TaskList
                tasks={groupedTasks[date]}
                onUncomplete={uncomplete}
                onDelete={deleteTask}
                onArchive={archive}
                onTaskClick={setEditingTask}
              />
            </div>
          ))
        )}
      </main>
    </>
  );
}


export default function CompletedPage() {
  return (
    <ProtectedRoute featureCode="nav_completed">
      <CompletedContent />
    </ProtectedRoute>
  );
}
