'use client';

import { useState } from 'react';
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TaskList, AddTaskDialog } from "@/components/tasks";
import { InboxProcessor } from "@/components/inbox";
import { useTasks } from "@/hooks/useTasks";
import { Plus, Sparkles, AlertTriangle } from "lucide-react";

const MAX_INBOX_BEFORE_WARNING = 10;

export default function InboxPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showProcessor, setShowProcessor] = useState(false);
  const {
    inboxTasks,
    loading,
    error,
    complete,
    uncomplete,
    deleteTask,
    moveToToday,
    moveToSomeday,
    scheduleTask,
    update,
    create,
  } = useTasks();

  const showWarning = inboxTasks.length >= MAX_INBOX_BEFORE_WARNING;
  const estimatedMinutes = Math.ceil(inboxTasks.length * 0.5); // ~30 sec per task

  if (showProcessor && inboxTasks.length > 0) {
    return (
      <InboxProcessor
        tasks={inboxTasks}
        onMoveToToday={async (id) => { await moveToToday(id); }}
        onMoveToSomeday={async (id) => { await moveToSomeday(id); }}
        onSchedule={async (id, date) => { await scheduleTask(id, date); }}
        onDelete={async (id) => { await deleteTask(id); }}
        onUpdate={async (id, input) => { await update(id, input); }}
        onClose={() => setShowProcessor(false)}
      />
    );
  }

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

      <main className="flex-1 p-4 space-y-4">
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
            {error.message}
          </div>
        )}

        {/* Process CTA */}
        {inboxTasks.length > 0 && (
          <Card className="border-2 border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="font-semibold flex items-center justify-center sm:justify-start gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Ready to process?
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {inboxTasks.length} items • Takes ~{estimatedMinutes} min
                  </p>
                </div>
                <Button
                  size="lg"
                  onClick={() => setShowProcessor(true)}
                  className="w-full sm:w-auto"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Process All ({inboxTasks.length})
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Warning */}
        {showWarning && (
          <div className="flex items-start gap-3 p-3 text-sm text-amber-700 bg-amber-50 rounded-lg border border-amber-200">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Inbox getting full!</p>
              <p className="text-amber-600">
                {inboxTasks.length} items can feel overwhelming.
                Process them now to clear your mind.
              </p>
            </div>
          </div>
        )}

        {/* Task list */}
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Or pick one:
          </h3>
          <TaskList
            tasks={inboxTasks}
            loading={loading}
            emptyMessage="Inbox is empty"
            emptyDescription="Quick capture ideas here, process them later"
            onComplete={complete}
            onUncomplete={uncomplete}
            onDelete={deleteTask}
            onMoveToToday={moveToToday}
          />
        </div>
      </main>
    </>
  );
}
