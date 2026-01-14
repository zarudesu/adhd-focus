'use client';

import { useState } from 'react';
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { TaskList, AddTaskDialog } from "@/components/tasks";
import { useTasks } from "@/hooks/useTasks";
import { Plus } from "lucide-react";

const MAX_DAILY_TASKS = 3;

export default function TodayPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const {
    todayTasks,
    loading,
    error,
    complete,
    deleteTask,
    moveToInbox,
    create,
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

      <AddTaskDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={async (input) => {
          await create({ ...input, scheduledDate: new Date().toISOString().split('T')[0] });
        }}
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
          onDelete={deleteTask}
          onMoveToInbox={moveToInbox}
        />

        {/* Completed tasks section */}
        {completedCount > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Completed ({completedCount})
            </h3>
            <TaskList
              tasks={todayTasks.filter(t => t.status === 'done')}
              onDelete={deleteTask}
            />
          </div>
        )}
      </main>
    </>
  );
}
