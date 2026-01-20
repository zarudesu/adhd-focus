'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from "@/components/layout/page-header";
import { ProtectedRoute } from '@/components/gamification/ProtectedRoute';
import { Button } from "@/components/ui/button";
import { TaskList, AddTaskDialog } from "@/components/tasks";
import { useTasks } from "@/hooks/useTasks";
import { useGamificationEvents } from "@/components/gamification/GamificationProvider";
import { EndOfDayReview, CloseDayButton } from "@/components/gamification/EndOfDayReview";
import { TodayIntro, useTodayIntro } from "@/components/gamification/TodayIntro";
import type { Task } from "@/db/schema";
import { Inbox, Eye, EyeOff } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const MAX_DAILY_TASKS = 3;

function TodayContent() {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showEndOfDay, setShowEndOfDay] = useState(false);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [daySummary, setDaySummary] = useState({
    tasksCompleted: 0,
    totalTasks: 0,
    mindfulnessEarned: 0,
    focusMinutes: 0,
    streakDays: 0,
  });
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
  const { handleTaskComplete, showCalmReview, state } = useGamificationEvents();

  // Today intro for first-time users
  const { showIntro, checked, dismissIntro } = useTodayIntro();

  // Fetch today's stats when opening end of day review
  useEffect(() => {
    if (showEndOfDay) {
      const completedToday = todayTasks.filter(t => t.status === 'done').length;
      const totalToday = todayTasks.length;

      // Fetch today's detailed stats
      fetch('/api/stats?days=1')
        .then(res => res.json())
        .then(data => {
          const todayStats = data.dailyStats?.[0] || {};
          setDaySummary({
            tasksCompleted: completedToday,
            totalTasks: totalToday,
            mindfulnessEarned: todayStats.xpEarned || 0,
            focusMinutes: todayStats.focusMinutes || 0,
            streakDays: state?.currentStreak || 0,
          });
        })
        .catch(() => {
          // Fallback to basic stats
          setDaySummary({
            tasksCompleted: completedToday,
            totalTasks: totalToday,
            mindfulnessEarned: 0,
            focusMinutes: 0,
            streakDays: state?.currentStreak || 0,
          });
        });
    }
  }, [showEndOfDay, todayTasks, state?.currentStreak]);

  // Handle closing the day
  const handleCloseDay = useCallback(() => {
    setShowEndOfDay(false);
    // Show calm review with day_end trigger
    showCalmReview('day_end', {
      tasksCompleted: daySummary.tasksCompleted,
      totalTasks: daySummary.totalTasks,
      isPartial: daySummary.tasksCompleted < daySummary.totalTasks,
    });
  }, [showCalmReview, daySummary]);

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

  const completedCount = todayTasks.filter(t => t.status === 'done').length;
  const activeCount = todayTasks.filter(t => t.status !== 'done').length;

  return (
    <>
      <PageHeader
        title="Today"
        description={`Focus on what matters most (${activeCount}/${MAX_DAILY_TASKS} tasks)`}
        actions={
          <div className="flex items-center gap-2">
            {completedCount > 0 && (
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
            <CloseDayButton onClick={() => setShowEndOfDay(true)} />
          </div>
        }
      />

      {/* End of Day Review Modal */}
      <EndOfDayReview
        open={showEndOfDay}
        onClose={() => setShowEndOfDay(false)}
        onCloseDay={handleCloseDay}
        summary={daySummary}
      />

      {/* First-time intro when user has tasks */}
      <AnimatePresence>
        {checked && showIntro && todayTasks.length > 0 && !loading && (
          <TodayIntro
            taskCount={todayTasks.filter(t => t.status !== 'done').length}
            onDismiss={dismissIntro}
          />
        )}
      </AnimatePresence>

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
        <AnimatePresence>
          {completedCount > 0 && !hideCompleted && (
            <motion.div
              className="mt-6"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Completed ({completedCount})
              </h3>
              <TaskList
                tasks={todayTasks.filter(t => t.status === 'done')}
                onUncomplete={uncomplete}
                onDelete={deleteTask}
                onTaskClick={setEditingTask}
              />
            </motion.div>
          )}
        </AnimatePresence>
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
