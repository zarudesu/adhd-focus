'use client';

import { useState } from 'react';
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { TaskList, AddTaskDialog } from "@/components/tasks";
import { useTasks } from "@/hooks/useTasks";
import type { Task } from "@/db/schema";
import { Plus } from "lucide-react";

const MAX_DAILY_TASKS = 3;

export default function TodayPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const {
    todayTasks,
    loading,
    error,
    complete,
    uncomplete,
    deleteTask,
    moveToInbox,
    create,
    update,
  } = useTasks();

  const completedCount = todayTasks.filter(t => t.status === 'done').length;
  const activeCount = todayTasks.filter(t => t.status !== 'done').length;

  return (
    <>
      <PageHeader
        title="Today"
        description={`Focus on what matters most (${activeCount}/${MAX_DAILY_TASKS} tasks)`}
        actions={
          <Button
            size="sm"
            disabled={activeCount >= MAX_DAILY_TASKS}
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Task
          </Button>
        }
      />

      {/* Add Task Dialog */}
      <AddTaskDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={async (input) => {
          await create({ ...input, scheduledDate: new Date().toISOString().split('T')[0] });
        }}
        defaultStatus="today"
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
        defaultStatus="today"
      />

      <main className="flex-1 p-4">
        {error && (
          <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
            {error.message}
          </div>
        )}

        <TaskList
          tasks={todayTasks.filter(t => t.status !== 'done')}
          loading={loading}
          emptyMessage="No tasks for today"
          emptyDescription="Add tasks from Inbox or create new ones"
          onComplete={complete}
          onUncomplete={uncomplete}
          onDelete={deleteTask}
          onMoveToInbox={moveToInbox}
          onTaskClick={setEditingTask}
        />

        {/* Completed tasks section */}
        {completedCount > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Completed ({completedCount})
            </h3>
            <TaskList
              tasks={todayTasks.filter(t => t.status === 'done')}
              onUncomplete={uncomplete}
              onDelete={deleteTask}
              onTaskClick={setEditingTask}
            />
          </div>
        )}
      </main>
    </>
  );
}
