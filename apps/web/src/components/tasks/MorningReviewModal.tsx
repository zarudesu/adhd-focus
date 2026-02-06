'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X, Check, Inbox, Trash2, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Task } from '@/db/schema';

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
  onCompleteYesterday: (id: string) => Promise<unknown>;
  onRescheduleToToday: (id: string) => Promise<unknown>;
  onMoveToInbox: (id: string) => Promise<unknown>;
  onDeleteTask: (id: string) => Promise<unknown>;
  onSubmitHabits: (data: {
    habits: { id: string; completed: boolean; skipped: boolean }[];
  }) => Promise<void>;
  onDismiss: () => void;
}

type Step = 'tasks' | 'habits';

export function MorningReviewModal({
  overdueTasks,
  habits,
  onCompleteYesterday,
  onRescheduleToToday,
  onMoveToInbox,
  onDeleteTask,
  onSubmitHabits,
  onDismiss,
}: MorningReviewModalProps) {
  const hasOverdue = overdueTasks.length > 0;
  const hasHabits = habits.length > 0;

  const [step, setStep] = useState<Step>(hasOverdue ? 'tasks' : 'habits');
  const [processedIds, setProcessedIds] = useState<Set<string>>(new Set());
  const [habitStates, setHabitStates] = useState<Record<string, 'done' | 'skipped' | null>>(
    () => Object.fromEntries(habits.map(h => [h.id, null]))
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const remainingTasks = overdueTasks.filter(t => !processedIds.has(t.id));
  const currentTask = remainingTasks[0];
  const totalTasks = overdueTasks.length;
  const processedCount = processedIds.size;

  const handleTaskAction = useCallback(async (
    action: (id: string) => Promise<unknown>,
    taskId: string,
  ) => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await action(taskId);
      setProcessedIds(prev => new Set([...prev, taskId]));

      // If no more tasks, move to habits or dismiss
      const newRemaining = overdueTasks.filter(t => !processedIds.has(t.id) && t.id !== taskId);
      if (newRemaining.length === 0) {
        if (hasHabits) {
          setStep('habits');
        } else {
          onDismiss();
        }
      }
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, overdueTasks, processedIds, hasHabits, onDismiss]);

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

        {/* Step 1: Overdue tasks */}
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
              <Button
                variant="outline"
                className="h-12 text-muted-foreground"
                disabled={isProcessing}
                onClick={() => handleTaskAction(onDeleteTask, currentTask.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Yesterday's habits */}
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
