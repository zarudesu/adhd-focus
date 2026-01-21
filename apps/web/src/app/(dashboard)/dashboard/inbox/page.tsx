'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TaskList, AddTaskDialog } from "@/components/tasks";
import { useTasks } from "@/hooks/useTasks";
import { useProfile } from "@/hooks/useProfile";
import { useFeatures } from "@/hooks/useFeatures";
import { useGamificationEvents } from "@/components/gamification/GamificationProvider";
import type { Task } from "@/db/schema";
import { Plus, Sparkles, EyeOff, Eye } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

// Map landing page preference to route and feature code
const LANDING_PAGE_ROUTES: Record<string, { route: string; featureCode: string }> = {
  inbox: { route: '/dashboard/inbox', featureCode: 'nav_inbox' },
  today: { route: '/dashboard', featureCode: 'nav_today' },
  scheduled: { route: '/dashboard/scheduled', featureCode: 'nav_scheduled' },
  projects: { route: '/dashboard/projects', featureCode: 'nav_projects' },
  completed: { route: '/dashboard/completed', featureCode: 'nav_completed' },
};

export default function InboxPage() {
  const router = useRouter();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showSnoozed, setShowSnoozed] = useState(false);
  const hasCheckedLanding = useRef(false);

  const { profile, loading: profileLoading } = useProfile();
  const { navFeatures, loading: featuresLoading } = useFeatures();
  const {
    inboxTasks,
    snoozedTasks,
    loading,
    error,
    complete,
    uncomplete,
    deleteTask,
    moveToToday,
    unsnoozeTask,
    update,
    create,
  } = useTasks({ showSnoozed });
  const { handleTaskComplete } = useGamificationEvents();

  // Check if user should be redirected to their preferred landing page
  useEffect(() => {
    // Only check once per mount, and only after data is loaded
    if (hasCheckedLanding.current || profileLoading || featuresLoading) return;
    hasCheckedLanding.current = true;

    const defaultPage = profile?.preferences?.defaultLandingPage;

    // Skip if no preference or preference is inbox (already here)
    if (!defaultPage || defaultPage === 'inbox') return;

    const pageConfig = LANDING_PAGE_ROUTES[defaultPage];
    if (!pageConfig) return;

    // Check if the preferred page feature is unlocked
    const feature = navFeatures.find(f => f.code === pageConfig.featureCode);
    if (!feature?.isUnlocked) return;

    // Redirect to preferred page
    router.replace(pageConfig.route);
  }, [profile, profileLoading, featuresLoading, navFeatures, router]);

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

  const estimatedMinutes = Math.ceil(inboxTasks.length * 0.5); // ~30 sec per task

  const handleStartProcessing = () => {
    router.push('/dashboard/inbox/process');
  };

  return (
    <>
      <PageHeader
        title="Inbox"
        description={`Quick capture, process later (${inboxTasks.length} items)`}
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
            {inboxTasks.length > 0 && navFeatures.find(f => f.code === 'nav_process')?.isUnlocked && (
              <Button size="sm" variant="secondary" onClick={handleStartProcessing}>
                <Sparkles className="h-4 w-4 mr-1" />
                Triage ({inboxTasks.length})
              </Button>
            )}
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

      <main className="flex-1 p-4 space-y-4">
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
            {error.message}
          </div>
        )}

        {/* Big centered Add button when empty or few tasks */}
        {inboxTasks.length < 3 && (
          <div className="flex justify-center py-8">
            <Button
              size="lg"
              onClick={() => setShowAddDialog(true)}
              className="h-16 px-8 text-lg gap-3"
            >
              <Plus className="h-6 w-6" />
              Add a thought
            </Button>
          </div>
        )}

        {/* Big centered buttons when Process is unlocked */}
        {inboxTasks.length >= 3 && navFeatures.find(f => f.code === 'nav_process')?.isUnlocked && (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="flex gap-3">
              <Button
                size="lg"
                onClick={() => setShowAddDialog(true)}
                className="h-14 px-6 text-base gap-2"
              >
                <Plus className="h-5 w-5" />
                Add a thought
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={handleStartProcessing}
                className="h-14 px-6 text-base gap-2"
              >
                <Sparkles className="h-5 w-5" />
                Triage ({inboxTasks.length})
              </Button>
            </div>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              <span className="font-medium text-foreground">Triage</span> — go through each item one by one, decide what to do: schedule it, do it now, or delete. Takes ~{estimatedMinutes} min.
            </p>
          </div>
        )}


        {/* Task list */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">
              Or pick one:
            </h3>
            {/* Show Not Today toggle - only if there are snoozed tasks */}
            {snoozedTasks.length > 0 && (
              <div className="flex items-center gap-2">
                <Switch
                  id="show-snoozed"
                  checked={showSnoozed}
                  onCheckedChange={setShowSnoozed}
                />
                <Label
                  htmlFor="show-snoozed"
                  className="text-sm text-muted-foreground cursor-pointer flex items-center gap-1"
                >
                  {showSnoozed ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  Not Today ({snoozedTasks.length})
                </Label>
              </div>
            )}
          </div>
          <TaskList
            tasks={inboxTasks}
            loading={loading}
            emptyMessage="Inbox is empty"
            emptyDescription="Quick capture ideas here, process them later"
            onComplete={handleComplete}
            onUncomplete={uncomplete}
            onDelete={deleteTask}
            onMoveToToday={moveToToday}
            onTaskClick={setEditingTask}
          />
        </div>
      </main>
    </>
  );
}
