'use client';

import { useState } from 'react';
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { TaskList, AddTaskDialog } from "@/components/tasks";
import { useTasks } from "@/hooks/useTasks";
import { Plus } from "lucide-react";
import { MAX_INBOX_BEFORE_WARNING } from "@adhd-focus/shared";

export default function InboxPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const {
    inboxTasks,
    loading,
    error,
    complete,
    deleteTask,
    moveToToday,
    create,
  } = useTasks();

  const showWarning = inboxTasks.length >= MAX_INBOX_BEFORE_WARNING;

  return (
    <>
      <PageHeader
        title="Inbox"
        description={`Quick capture, process later (${inboxTasks.length} items)`}
        actions={
          <Button size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Quick Add
          </Button>
        }
      />

      <AddTaskDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={async (input) => {
          await create(input);
        }}
        defaultStatus="inbox"
      />
      <main className="flex-1 p-4">
        {error && (
          <div className="mb-4 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
            {error.message}
          </div>
        )}

        {showWarning && (
          <div className="mb-4 p-3 text-sm text-amber-700 bg-amber-50 rounded-lg border border-amber-200">
            Your inbox has {inboxTasks.length} items. Consider processing some tasks to stay focused.
          </div>
        )}

        <TaskList
          tasks={inboxTasks}
          loading={loading}
          emptyMessage="Inbox is empty"
          emptyDescription="Quick capture ideas here, process them later"
          onComplete={complete}
          onDelete={deleteTask}
          onMoveToToday={moveToToday}
        />
      </main>
    </>
  );
}
