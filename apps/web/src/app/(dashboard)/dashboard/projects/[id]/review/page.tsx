'use client';

import { useState, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useGamificationEvents } from '@/components/gamification/GamificationProvider';
import { ReviewMode, type ReviewAction } from '@/components/review/ReviewMode';
import { SchedulePopover } from '@/components/review/SchedulePopover';
import { AddTaskDialog } from '@/components/tasks';
import { DecomposeDialog } from '@/components/tasks/DecomposeDialog';
import { ProtectedRoute } from '@/components/gamification/ProtectedRoute';
import type { Task } from '@/db/schema';
import { Sun, EyeOff, Trash2, Check, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

function ProjectReviewContent() {
  const params = useParams();
  const projectId = params.id as string;

  const {
    tasks,
    loading,
    moveToToday,
    scheduleTask,
    snoozeTask,
    deleteTask,
    complete,
    update,
    create,
  } = useTasks({ filters: { projectId } });
  const { projects } = useProjects();
  const { handleTaskComplete, refreshAll } = useGamificationEvents();

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [decomposeTask, setDecomposeTask] = useState<Task | null>(null);

  const project = projects.find((p) => p.id === projectId);
  const reviewTasks = useMemo(
    () => tasks.filter((t) => t.status !== 'done' && t.status !== 'archived'),
    [tasks]
  );

  const handleCreateSubtasks = useCallback(
    async (parentTaskId: string, subtasks: { title: string; estimatedMinutes: number; energyRequired: 'low' | 'medium' | 'high' }[]) => {
      for (const subtask of subtasks) {
        await create({
          title: subtask.title,
          estimatedMinutes: subtask.estimatedMinutes,
          energyRequired: subtask.energyRequired,
          parentTaskId,
          status: 'inbox',
          projectId,
        });
      }
      refreshAll();
    },
    [create, refreshAll, projectId]
  );

  const actions: ReviewAction[] = [
    {
      id: 'done',
      label: 'Done',
      icon: Check,
      group: 'secondary',
      className: 'text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30',
      handler: async (task) => {
        const result = await complete(task.id);
        handleTaskComplete({
          levelUp: result.levelUp ? { newLevel: result.newLevel, unlockedFeatures: [] } : undefined,
          xpAwarded: result.xpAwarded,
          newAchievements: result.newAchievements,
          creature: result.creature,
        });
        return 'Completed';
      },
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: Trash2,
      group: 'secondary',
      className: 'text-destructive hover:text-destructive',
      handler: async (task) => {
        await deleteTask(task.id);
        return 'Deleted';
      },
    },
    {
      id: 'decompose',
      label: 'Break down',
      icon: Sparkles,
      group: 'secondary',
      handler: async (task) => {
        setDecomposeTask(task);
        return ''; // don't advance — dialog opens
      },
    },
    {
      id: 'today',
      label: 'Today',
      icon: Sun,
      group: 'primary',
      handler: async (task) => {
        await moveToToday(task.id);
        return 'Moved to Today';
      },
    },
    {
      id: 'schedule',
      label: 'Schedule',
      icon: Sun,
      group: 'primary',
      handler: async () => '',
      popoverContent: (task, triggerAction) => (
        <SchedulePopover
          onSchedule={async (date, label) => {
            await scheduleTask(task.id, date);
            triggerAction(label);
          }}
        />
      ),
    },
    {
      id: 'not-today',
      label: 'Not Today',
      icon: EyeOff,
      group: 'primary',
      variant: 'secondary',
      colSpan2: true,
      handler: async (task) => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        await snoozeTask(task.id, format(tomorrow, 'yyyy-MM-dd'));
        return 'Snoozed until tomorrow';
      },
    },
  ];

  const projectName = project ? `${project.emoji || ''} ${project.name}`.trim() : 'Project';

  return (
    <ReviewMode
      tasks={reviewTasks}
      loading={loading}
      actions={actions}
      onExit={`/dashboard/projects/${projectId}`}
      exitMessage={{
        title: 'Leave review?',
        description: (n) => `You still have ${n} task${n > 1 ? 's' : ''} to review in this project.`,
      }}
      completion={{
        title: `${projectName} \u2014 All Reviewed!`,
        message: (n) =>
          n > 0
            ? `You reviewed ${n} task${n > 1 ? 's' : ''}. Nice work!`
            : 'No tasks to review in this project.',
        primaryLabel: 'Back to Project',
        primaryHref: `/dashboard/projects/${projectId}`,
        secondaryLabel: 'View Today',
        secondaryHref: '/dashboard',
      }}
      onTaskClick={setEditingTask}
      extraDialogs={
        <>
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
          <DecomposeDialog
            task={decomposeTask}
            open={!!decomposeTask}
            onOpenChange={(open) => !open && setDecomposeTask(null)}
            onCreateSubtasks={handleCreateSubtasks}
          />
        </>
      }
    />
  );
}

export default function ProjectReviewPage() {
  return (
    <ProtectedRoute featureCode="nav_projects">
      <ProjectReviewContent />
    </ProtectedRoute>
  );
}
