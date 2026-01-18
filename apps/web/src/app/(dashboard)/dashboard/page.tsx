'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { PageHeader } from "@/components/layout/page-header";
import { ProtectedRoute } from '@/components/gamification/ProtectedRoute';
import { Button } from "@/components/ui/button";
import { TaskList, AddTaskDialog } from "@/components/tasks";
import { useTasks } from "@/hooks/useTasks";
import { useGamificationEvents } from "@/components/gamification/GamificationProvider";
import type { Task } from "@/db/schema";
import { Inbox } from "lucide-react";

const MAX_DAILY_TASKS = 3;

function TodayContent() {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const {
    todayTasks,
    loading,
    error,
    complete,
    uncomplete,
    deleteTask,
    moveToInbox,
    update,
  } = useTasks();
  const { handleTaskComplete } = useGamificationEvents();

  // Wrapper to handle task completion with gamification
  const handleComplete = useCallback(async (id: string) => {
    const result = await complete(id);

    // Always trigger gamification events (reward animation + optional level up)
    handleTaskComplete({
      levelUp: result.levelUp ? {
        newLevel: result.newLevel,
        unlockedFeatures: [],
      } : undefined,
      xpAwarded: result.xpAwarded,
      reward: result.reward,
      newAchievements: result.newAchievements,
      creature: result.creature,
    });
  }, [complete, handleTaskComplete]);

  const completedCount = todayTasks.filter(t => t.status === 'done').length;
  const activeCount = todayTasks.filter(t => t.status !== 'done').length;

  return (
    <>
      <PageHeader
        title="Today"
        description={`Focus on what matters most (${activeCount}/${MAX_DAILY_TASKS} tasks)`}
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
          emptyDescription="Move tasks from Inbox or Scheduled"
          emptyAction={
            <Button asChild variant="outline" size="sm" className="mt-3">
              <Link href="/dashboard/inbox">
                <Inbox className="h-4 w-4 mr-2" />
                Go to Inbox
              </Link>
            </Button>
          }
          onComplete={handleComplete}
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


export default function TodayPage() {
  return (
    <ProtectedRoute featureCode="nav_today">
      <TodayContent />
    </ProtectedRoute>
  );
}
