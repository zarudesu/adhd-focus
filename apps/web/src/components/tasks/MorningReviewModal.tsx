'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X, Check, Inbox, Trash2, Sun, Archive, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Task } from '@/db/schema';
import type { PendingProgress } from '@/lib/pending-progress';
import {
  Calendar,
  CheckCircle2,
  Folder,
  ListChecks,
  Timer,
  Trophy,
  Zap,
  Ghost,
  BarChart3,
  Flag,
  Battery,
  Clock,
  Repeat,
  Brain,
} from 'lucide-react';

// Feature icons — reused from FeatureUnlockModal pattern
const FEATURE_ICONS: Record<string, React.ElementType> = {
  nav_inbox: Inbox,
  nav_process: Sparkles,
  nav_today: Sun,
  nav_scheduled: Calendar,
  nav_projects: Folder,
  nav_completed: CheckCircle2,
  nav_checklist: ListChecks,
  nav_quick_actions: Zap,
  nav_focus: Timer,
  nav_achievements: Trophy,
  nav_creatures: Ghost,
  nav_stats: BarChart3,
  priority_basic: Flag,
  priority_full: Flag,
  task_energy: Battery,
  task_duration: Clock,
  task_recurrence: Repeat,
  ai_auto_fill: Sparkles,
  ai_decompose: Sparkles,
  ai_brain_dump: Brain,
};

const FEATURE_DESCRIPTIONS: Record<string, string> = {
  nav_inbox: 'Capture thoughts quickly without organizing',
  nav_process: 'Clear your inbox one task at a time',
  nav_today: 'Focus on what matters today',
  nav_scheduled: 'Plan tasks for future dates',
  nav_projects: 'Group related tasks together',
  nav_completed: 'See your accomplishments',
  nav_checklist: 'Build daily habits',
  nav_quick_actions: 'Fast 2-minute capture mode',
  nav_focus: 'Deep work with Pomodoro timer',
  nav_achievements: 'Track your progress milestones',
  nav_creatures: 'Collect rare creatures',
  nav_stats: 'Insights into your productivity',
  ai_auto_fill: 'AI suggests priority, energy, and time',
  ai_decompose: 'Break big tasks into small steps',
  ai_brain_dump: 'Turn messy thoughts into tasks',
};

interface YesterdayHabit {
  id: string;
  name: string;
  emoji: string | null;
  isCompleted: boolean;
  isSkipped: boolean;
}

interface MorningReviewModalProps {
  overdueTasks: Task[];
  habits: YesterdayHabit[];
  pendingProgress: PendingProgress | null;
  onCompleteYesterday: (id: string) => Promise<unknown>;
  onRescheduleToToday: (id: string) => Promise<unknown>;
  onMoveToInbox: (id: string) => Promise<unknown>;
  onDeleteTask: (id: string) => Promise<unknown>;
  onArchive?: (id: string) => Promise<unknown>;
  onSubmitHabits: (data: {
    habits: { id: string; completed: boolean; skipped: boolean }[];
  }) => Promise<void>;
  onProgressDismiss?: (featureCodes: string[]) => void;
  onDismiss: () => void;
}

type Step = 'progress' | 'stale' | 'tasks' | 'habits';

const STALE_DAYS = 14;

function getDaysOld(scheduledDate: string): number {
  return Math.floor((Date.now() - new Date(scheduledDate + 'T00:00:00').getTime()) / (1000 * 60 * 60 * 24));
}

export function MorningReviewModal({
  overdueTasks,
  habits,
  pendingProgress,
  onCompleteYesterday,
  onRescheduleToToday,
  onMoveToInbox,
  onDeleteTask,
  onArchive,
  onSubmitHabits,
  onProgressDismiss,
  onDismiss,
}: MorningReviewModalProps) {
  const hasOverdue = overdueTasks.length > 0;
  const hasHabits = habits.length > 0;
  const hasProgress = pendingProgress !== null && (
    pendingProgress.featureUnlocks.length > 0 || pendingProgress.levelUps.length > 0
  );

  // Split overdue into stale (14+ days) and recent
  const staleTasks = overdueTasks.filter(
    t => t.scheduledDate && getDaysOld(t.scheduledDate) >= STALE_DAYS
  );
  const recentOverdue = overdueTasks.filter(
    t => !t.scheduledDate || getDaysOld(t.scheduledDate) < STALE_DAYS
  );
  const hasStale = staleTasks.length > 0 && !!onArchive;

  const initialStep: Step = hasProgress ? 'progress'
    : hasStale ? 'stale'
    : hasOverdue ? 'tasks'
    : 'habits';

  const [step, setStep] = useState<Step>(initialStep);
  const [processedIds, setProcessedIds] = useState<Set<string>>(new Set());
  const [habitStates, setHabitStates] = useState<Record<string, 'done' | 'skipped' | null>>(
    () => Object.fromEntries(habits.map(h => [h.id, null]))
  );
  const [isProcessing, setIsProcessing] = useState(false);

  // In tasks step, only show recent overdue (stale ones handled separately)
  const tasksForReview = hasStale ? recentOverdue : overdueTasks;
  const remainingTasks = tasksForReview.filter(t => !processedIds.has(t.id));
  const currentTask = remainingTasks[0];
  const totalTasks = tasksForReview.length;
  const processedCount = processedIds.size;

  const goToNextStep = useCallback((after: Step) => {
    if (after === 'progress') {
      // After progress: proceed to stale → tasks → habits → done
      if (hasStale) setStep('stale');
      else if (totalTasks > 0) setStep('tasks');
      else if (hasHabits) setStep('habits');
      else onDismiss();
    } else if (after === 'stale') {
      if (totalTasks > 0) setStep('tasks');
      else if (hasHabits) setStep('habits');
      else onDismiss();
    } else if (after === 'tasks') {
      if (hasHabits) setStep('habits');
      else onDismiss();
    }
  }, [totalTasks, hasHabits, hasStale, onDismiss]);

  const handleProgressDone = useCallback(() => {
    if (pendingProgress && onProgressDismiss) {
      onProgressDismiss(pendingProgress.featureUnlocks.map(f => f.code));
    }
    goToNextStep('progress');
  }, [pendingProgress, onProgressDismiss, goToNextStep]);

  const handleTaskAction = useCallback(async (
    action: (id: string) => Promise<unknown>,
    taskId: string,
  ) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await action(taskId);
      setProcessedIds(prev => new Set([...prev, taskId]));

      // If no more tasks, move to next step
      const newRemaining = tasksForReview.filter(t => !processedIds.has(t.id) && t.id !== taskId);
      if (newRemaining.length === 0) {
        goToNextStep('tasks');
      }
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, tasksForReview, processedIds, goToNextStep]);

  const handleArchiveStale = useCallback(async () => {
    if (isProcessing || !onArchive) return;
    setIsProcessing(true);
    try {
      for (const task of staleTasks) {
        await onArchive(task.id);
      }
      goToNextStep('stale');
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, onArchive, staleTasks, goToNextStep]);

  const handleHabitToggle = (id: string, state: 'done' | 'skipped') => {
    setHabitStates(prev => ({
      ...prev,
      [id]: prev[id] === state ? null : state,
    }));
  };

  const handleSubmitHabits = async () => {
    setIsProcessing(true);
    try {
      await onSubmitHabits({
        habits: habits.map(h => ({
          id: h.id,
          completed: habitStates[h.id] === 'done',
          skipped: habitStates[h.id] === 'skipped',
        })),
      });
      onDismiss();
    } finally {
      setIsProcessing(false);
    }
  };

  // Max level from level ups
  const maxLevel = pendingProgress?.levelUps.length
    ? Math.max(...pendingProgress.levelUps.map(l => l.newLevel))
    : null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="w-full max-w-md mx-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* Skip button */}
        <div className="flex justify-end mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Skip
          </Button>
        </div>

        {/* Step: Progress summary */}
        {step === 'progress' && pendingProgress && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-lg font-medium">
                Your Progress
              </h2>
              <p className="text-sm text-muted-foreground">
                {hasOverdue || hasHabits
                  ? 'Before we start — here\u2019s what happened.'
                  : 'Here\u2019s what\u2019s new.'}
              </p>
            </div>

            <div className="space-y-3">
              {/* Level ups */}
              {maxLevel && (
                <div className="rounded-lg border bg-card p-3 flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Level {maxLevel} reached</p>
                    <p className="text-xs text-muted-foreground">The system trusts you more.</p>
                  </div>
                </div>
              )}

              {/* Feature unlocks */}
              {pendingProgress.featureUnlocks.map(feature => {
                const IconComponent = FEATURE_ICONS[feature.code] || Sparkles;
                const description = FEATURE_DESCRIPTIONS[feature.code] || feature.celebrationText || 'A new feature is available';
                return (
                  <div
                    key={feature.code}
                    className="rounded-lg border bg-card p-3 flex items-center gap-3"
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <IconComponent className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{feature.name}</p>
                      <p className="text-xs text-muted-foreground">{description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <Button
              className="w-full"
              onClick={handleProgressDone}
            >
              {hasOverdue || hasHabits ? 'Continue' : 'Nice!'}
            </Button>
          </div>
        )}

        {/* Step: Stale tasks (14+ days old) — batch archive */}
        {step === 'stale' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-lg font-medium">
                {staleTasks.length === 1
                  ? 'This task has been waiting a while.'
                  : `${staleTasks.length} tasks have been waiting a while.`}
              </h2>
              <p className="text-sm text-muted-foreground">
                It&apos;s okay to let go of what no longer fits.
              </p>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {staleTasks.map(task => (
                <div
                  key={task.id}
                  className="rounded-lg border bg-card p-3 flex items-start justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    {task.scheduledDate && (
                      <p className="text-xs text-muted-foreground">
                        {getDaysOld(task.scheduledDate)} days ago
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Button
                className="w-full"
                disabled={isProcessing}
                onClick={handleArchiveStale}
              >
                <Archive className="h-4 w-4 mr-2" />
                {staleTasks.length === 1 ? 'Let it go' : `Let them all go (${staleTasks.length})`}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                disabled={isProcessing}
                onClick={() => goToNextStep('stale')}
              >
                Keep for now
              </Button>
            </div>
          </div>
        )}

        {/* Step: Overdue tasks */}
        {step === 'tasks' && currentTask && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-lg font-medium">
                Good morning. Let&apos;s sort yesterday.
              </h2>
              <p className="text-sm text-muted-foreground">
                {processedCount + 1} of {totalTasks}
              </p>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentTask.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.2 }}
                className="rounded-lg border bg-card p-4"
              >
                <p className="text-base font-medium">{currentTask.title}</p>
                {currentTask.description && (
                  <p className="text-sm text-muted-foreground mt-1">{currentTask.description}</p>
                )}
                {currentTask.scheduledDate && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Scheduled for {new Date(currentTask.scheduledDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="h-12"
                disabled={isProcessing}
                onClick={() => handleTaskAction(onCompleteYesterday, currentTask.id)}
              >
                <Check className="h-4 w-4 mr-2" />
                Did it
              </Button>
              <Button
                variant="outline"
                className="h-12"
                disabled={isProcessing}
                onClick={() => handleTaskAction(onRescheduleToToday, currentTask.id)}
              >
                <Sun className="h-4 w-4 mr-2" />
                Today
              </Button>
              <Button
                variant="outline"
                className="h-12"
                disabled={isProcessing}
                onClick={() => handleTaskAction(onMoveToInbox, currentTask.id)}
              >
                <Inbox className="h-4 w-4 mr-2" />
                Inbox
              </Button>
              {onArchive ? (
                <Button
                  variant="outline"
                  className="h-12 text-muted-foreground"
                  disabled={isProcessing}
                  onClick={() => handleTaskAction(onArchive, currentTask.id)}
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Let go
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="h-12 text-muted-foreground"
                  disabled={isProcessing}
                  onClick={() => handleTaskAction(onDeleteTask, currentTask.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Step: Yesterday's habits */}
        {step === 'habits' && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-lg font-medium">
                {hasOverdue ? 'One more thing.' : 'Good morning.'}
              </h2>
              <p className="text-sm text-muted-foreground">
                How did yesterday&apos;s habits go?
              </p>
            </div>

            <div className="space-y-2">
              {habits.map(habit => (
                <div
                  key={habit.id}
                  className="flex items-center justify-between rounded-lg border bg-card p-3"
                >
                  <span className="text-sm font-medium">
                    {habit.emoji && <span className="mr-2">{habit.emoji}</span>}
                    {habit.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={habitStates[habit.id] === 'done' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleHabitToggle(habit.id, 'done')}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant={habitStates[habit.id] === 'skipped' ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => handleHabitToggle(habit.id, 'skipped')}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button
              className="w-full"
              disabled={isProcessing}
              onClick={handleSubmitHabits}
            >
              Save
            </Button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
