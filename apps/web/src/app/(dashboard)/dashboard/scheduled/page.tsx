'use client';

import { useState } from 'react';
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { TaskList, AddTaskDialog } from "@/components/tasks";
import { useTasks } from "@/hooks/useTasks";
import { Plus, Calendar } from "lucide-react";

export default function ScheduledPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const {
    scheduledTasks,
    loading,
    error,
    complete,
    uncomplete,
    deleteTask,
    moveToToday,
    moveToInbox,
    create,
  } = useTasks();

  // Group tasks by scheduled date
  const groupedTasks = scheduledTasks.reduce((acc, task) => {
    const date = task.scheduledDate || 'No date';
    if (!acc[date]) acc[date] = [];
    acc[date].push(task);
    return acc;
  }, {} as Record<string, typeof scheduledTasks>);

  // Sort dates
  const sortedDates = Object.keys(groupedTasks).sort((a, b) => {
    if (a === 'No date') return 1;
    if (b === 'No date') return -1;
    return a.localeCompare(b);
  });

  const formatDate = (dateStr: string) => {
    if (dateStr === 'No date') return dateStr;
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';

    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <PageHeader
        title="Scheduled"
        description={`Tasks with future dates (${scheduledTasks.length} items)`}
        actions={
          <Button size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Schedule Task
          </Button>
        }
      />

      <AddTaskDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={async (input) => {
          await create({ ...input, status: 'scheduled' });
        }}
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
        ) : scheduledTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-muted p-3 mb-3">
              <Calendar className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No scheduled tasks</p>
            <p className="text-xs text-muted-foreground mt-1">
              Schedule tasks from Inbox or create new ones
            </p>
          </div>
        ) : (
          sortedDates.map((date) => (
            <div key={date}>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(date)}
                <span className="text-xs">({groupedTasks[date].length})</span>
              </h3>
              <TaskList
                tasks={groupedTasks[date]}
                onComplete={complete}
                onUncomplete={uncomplete}
                onDelete={deleteTask}
                onMoveToToday={moveToToday}
                onMoveToInbox={moveToInbox}
              />
            </div>
          ))
        )}
      </main>
    </>
  );
}
