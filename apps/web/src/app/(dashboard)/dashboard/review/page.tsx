'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useGamificationEvents } from '@/components/gamification/GamificationProvider';
import { ReviewMode, type ReviewAction, type ReviewStep } from '@/components/review/ReviewMode';
import { SchedulePopover } from '@/components/review/SchedulePopover';
import { AddTaskDialog } from '@/components/tasks';
import { DecomposeDialog } from '@/components/tasks/DecomposeDialog';
import { ProtectedRoute } from '@/components/gamification/ProtectedRoute';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import type { Task } from '@/db/schema';
import {
  Sun,
  EyeOff,
  Trash2,
  Check,
  Sparkles,
  FolderKanban,
  Plus,
} from 'lucide-react';
import { format, differenceInDays, parseISO } from 'date-fns';

function GlobalReviewContent() {
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
  } = useTasks();
  const { projects, create: createProject } = useProjects();
  const { handleTaskComplete, refreshAll } = useGamificationEvents();

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [decomposeTask, setDecomposeTask] = useState<Task | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [creatingProject, setCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  // Build review task list: inbox + overdue today + stale scheduled + inbox w/ project
  const today = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);

  const reviewTasks = useMemo(() => {
    const result: { task: Task; context: string; priority: number }[] = [];

    for (const task of tasks) {
      if (task.status === 'done' || task.status === 'archived') continue;

      const scheduledDate = task.scheduledDate ? String(task.scheduledDate) : null;

      // 1. Overdue today tasks
      if (task.status === 'today' || task.status === 'in_progress') {
        if (scheduledDate && scheduledDate < today) {
          const days = differenceInDays(new Date(), parseISO(scheduledDate));
          const projectName = task.projectId
            ? projects.find((p) => p.id === task.projectId)?.name
            : null;
          const ctx = projectName
            ? `${projectName} \u2014 Overdue ${days} day${days > 1 ? 's' : ''}`
            : `Overdue ${days} day${days > 1 ? 's' : ''}`;
          result.push({ task, context: ctx, priority: 0 });
          continue;
        }
      }

      // 2. Inbox tasks (no project)
      if (task.status === 'inbox' && !task.projectId) {
        result.push({ task, context: 'From Inbox', priority: 1 });
        continue;
      }

      // 3. Inbox tasks with project (needs triage)
      if (task.status === 'inbox' && task.projectId) {
        const projectName = projects.find((p) => p.id === task.projectId)?.name || 'Project';
        result.push({ task, context: `${projectName} \u2014 Needs triage`, priority: 3 });
        continue;
      }

      // 4. Stale scheduled (3+ days past scheduled date)
      if (task.status === 'scheduled' && scheduledDate) {
        const days = differenceInDays(new Date(), parseISO(scheduledDate));
        if (days >= 3) {
          result.push({
            task,
            context: `Scheduled ${days} day${days > 1 ? 's' : ''} ago`,
            priority: 2,
          });
          continue;
        }
      }
    }

    // Sort: overdue first, then inbox, then stale scheduled, then inbox w/ project
    result.sort((a, b) => a.priority - b.priority);
    return result;
  }, [tasks, projects, today]);

  const reviewTaskList = useMemo(() => reviewTasks.map((r) => r.task), [reviewTasks]);
  const contextMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const r of reviewTasks) {
      map.set(r.task.id, r.context);
    }
    return map;
  }, [reviewTasks]);

  // Reset project selector when task changes
  const currentTask = reviewTaskList[0];
  const currentTaskId = currentTask?.id;
  useEffect(() => {
    if (currentTask) {
      setTimeout(() => {
        setSelectedProject(currentTask.projectId || null);
        setCreatingProject(false);
        setNewProjectName('');
      }, 0);
    }
  }, [currentTaskId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreateProject = useCallback(async () => {
    if (!newProjectName.trim()) return;
    try {
      const newProject = await createProject({ name: newProjectName.trim() });
      setSelectedProject(newProject.id);
      setNewProjectName('');
      setCreatingProject(false);
      refreshAll();
    } catch {
      // silently handled
    }
  }, [newProjectName, createProject, refreshAll]);

  const handleCreateSubtasks = useCallback(
    async (parentTaskId: string, subtasks: { title: string; estimatedMinutes: number; energyRequired: 'low' | 'medium' | 'high' }[]) => {
      for (const subtask of subtasks) {
        await create({
          title: subtask.title,
          estimatedMinutes: subtask.estimatedMinutes,
          energyRequired: subtask.energyRequired,
          parentTaskId,
          status: 'inbox',
        });
      }
      refreshAll();
    },
    [create, refreshAll]
  );

  const actions: ReviewAction[] = [
    // Secondary
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
        return '';
      },
    },
    // Primary
    {
      id: 'today',
      label: 'Today',
      icon: Sun,
      group: 'primary',
      handler: async (task) => {
        if (selectedProject && selectedProject !== task.projectId) {
          await update(task.id, { projectId: selectedProject });
        }
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
            if (selectedProject && selectedProject !== task.projectId) {
              await update(task.id, { projectId: selectedProject });
            }
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

  // Steps: project selector (same as inbox process)
  const steps: ReviewStep[] = [
    {
      label: 'Assign to a project',
      content: () => (
        <div className="flex items-center gap-2">
          <FolderKanban className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          {creatingProject ? (
            <div className="flex-1 flex gap-2">
              <Input
                autoFocus
                placeholder="Project name..."
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateProject();
                  if (e.key === 'Escape') {
                    setCreatingProject(false);
                    setNewProjectName('');
                  }
                }}
                className="h-10"
              />
              <Button size="sm" onClick={handleCreateProject} disabled={!newProjectName.trim()}>
                <Check className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Select
              value={selectedProject || 'none'}
              onValueChange={(v) => {
                if (v === 'create') {
                  setCreatingProject(true);
                } else {
                  setSelectedProject(v === 'none' ? null : v);
                }
              }}
            >
              <SelectTrigger className="flex-1 h-10">
                <SelectValue placeholder="Select project..." />
              </SelectTrigger>
              <SelectContent className="z-[60]">
                <SelectItem value="none">No project</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.emoji} {project.name}
                  </SelectItem>
                ))}
                <SelectItem value="create" className="text-primary">
                  <span className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create project
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      ),
    },
  ];

  return (
    <ReviewMode
      tasks={reviewTaskList}
      loading={loading}
      actions={actions}
      steps={steps}
      getTaskContext={(task) => contextMap.get(task.id) || null}
      onExit="/dashboard/hub"
      exitMessage={{
        title: 'Leave review?',
        description: (n) => `You still have ${n} task${n > 1 ? 's' : ''} to review.`,
      }}
      completion={{
        title: 'All Clear!',
        message: (n) =>
          n > 0
            ? `You reviewed ${n} task${n > 1 ? 's' : ''}. Everything is sorted!`
            : 'Nothing needed review. You\'re on top of it!',
        primaryLabel: 'View Today',
        primaryHref: '/dashboard',
        secondaryLabel: 'Back to Hub',
        secondaryHref: '/dashboard/hub',
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

export default function GlobalReviewPage() {
  return (
    <ProtectedRoute featureCode="nav_review">
      <GlobalReviewContent />
    </ProtectedRoute>
  );
}
