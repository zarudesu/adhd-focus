'use client';

import { useState, useCallback } from 'react';
import { PageHeader } from "@/components/layout/page-header";
import { ProtectedRoute } from '@/components/gamification/ProtectedRoute';
import { Button } from "@/components/ui/button";
import { TaskList, AddTaskDialog } from "@/components/tasks";
import { useTasks } from "@/hooks/useTasks";
import { useGamificationEvents } from "@/components/gamification/GamificationProvider";
import type { Task } from "@/db/schema";
import { Plus, Calendar } from "lucide-react";
import { TaskGroupSkeleton } from "@/components/ui/skeletons";
import { useFeaturePageTutorial } from "@/hooks/useFeaturePageTutorial";
import { FeatureTutorial } from "@/components/gamification/FeatureTutorial";

function ScheduledContent() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
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
    update,
  } = useTasks();
  const { handleTaskComplete, refreshAll } = useGamificationEvents();
  const { showTutorial, tutorial, dismiss: dismissTutorial } = useFeaturePageTutorial('nav_scheduled');

  // Wrapper to handle task completion with gamification
  const handleComplete = useCallback(async (id: string) => {
    const result = await complete(id);

    // Always trigger gamification events (reward animation + optional level up)
    // beatyour8: No visual reward - progress tracked silently
    handleTaskComplete({
      levelUp: result.levelUp ? {
        newLevel: result.newLevel,
        unlockedFeatures: [],
      } : undefined,
      xpAwarded: result.xpAwarded,
      newAchievements: result.newAchievements,
      creature: result.creature,
    });
  }, [complete, handleTaskComplete]);

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


  // Feature tutorial for first-time users
  if (showTutorial) {
    return (
      <FeatureTutorial
        featureCode="nav_scheduled"
        tutorial={tutorial}
        onComplete={dismissTutorial}
      />
    );
  }

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

      {/* Add Task Dialog */}
      <AddTaskDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={async (input) => {
          await create(input);
          refreshAll();
        }}
        forScheduled
      />

      {/* Edit Task Dialog */}
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

      <main className="flex-1 p-4 space-y-6">
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
            {error.message}
          </div>
        )}

        {loading ? (
          <div className="space-y-6">
            <TaskGroupSkeleton />
            <TaskGroupSkeleton />
            <TaskGroupSkeleton />
          </div>
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
                onComplete={handleComplete}
                onUncomplete={uncomplete}
                onDelete={deleteTask}
                onMoveToToday={moveToToday}
                onMoveToInbox={moveToInbox}
                onTaskClick={setEditingTask}
              />
            </div>
          ))
        )}
      </main>
    </>
  );
}


export default function ScheduledPage() {
  return (
    <ProtectedRoute featureCode="nav_scheduled">
      <ScheduledContent />
    </ProtectedRoute>
  );
}
