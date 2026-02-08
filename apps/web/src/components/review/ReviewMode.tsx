'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Task } from '@/db/schema';
import { CheckCircle2, X, ArrowRight, Check, Loader2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { ProcessPageSkeleton } from '@/components/ui/skeletons';
import { useFeaturePageTutorial } from '@/hooks/useFeaturePageTutorial';
import { FeatureTutorial } from '@/components/gamification/FeatureTutorial';

// ── Types ──

export interface ReviewAction {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Handler receives current task. Return a string label for transition screen.
   *  Return '' to stay on current task (e.g. "Break down" opens a dialog). */
  handler: (task: Task) => Promise<string>;
  group: 'primary' | 'secondary';
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost';
  /** If set, renders custom content (e.g. popover) instead of a plain button.
   *  Call `triggerAction(label)` after your async work to trigger the transition screen. */
  popoverContent?: (task: Task, triggerAction: (label: string) => void) => ReactNode;
  /** CSS classes for the button */
  className?: string;
  /** Span 2 columns in the primary grid */
  colSpan2?: boolean;
}

export interface ReviewStep {
  label: string;
  content: (task: Task) => ReactNode;
}

export interface ReviewCompletion {
  title: string;
  message: (processedCount: number) => string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}

export interface ReviewExitMessage {
  title: string;
  description: (remainingCount: number) => string;
  keepLabel?: string;
  leaveLabel?: string;
}

export interface ReviewModeProps {
  tasks: Task[];
  loading?: boolean;
  actions: ReviewAction[];
  steps?: ReviewStep[];
  getTaskContext?: (task: Task) => string | null;
  completion: ReviewCompletion;
  onExit: string; // URL to navigate to when exiting
  exitMessage?: ReviewExitMessage;
  tutorialFeatureCode?: string;
  extraDialogs?: ReactNode;
  /** Called when user clicks the task card (for editing) */
  onTaskClick?: (task: Task) => void;
  /** Called after each task action with updated processed count */
  onTaskProcessed?: () => void;
}

// ── Component ──

export function ReviewMode({
  tasks,
  loading,
  actions,
  steps,
  getTaskContext,
  completion,
  onExit,
  exitMessage,
  tutorialFeatureCode,
  extraDialogs,
  onTaskClick,
  onTaskProcessed,
}: ReviewModeProps) {
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [pendingNext, setPendingNext] = useState(false);
  const [lastAction, setLastAction] = useState('');

  const totalTasks = tasks.length + processedCount;
  const currentTask = tasks[currentIndex];
  const isComplete = tasks.length === 0 && !pendingNext;

  // Tutorial
  const { showTutorial, tutorial, dismiss: dismissTutorial } = useFeaturePageTutorial(
    tutorialFeatureCode || '__none__'
  );

  // Block navigation while processing
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isComplete && tasks.length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isComplete, tasks.length]);

  // Handle back / exit
  const handleBack = useCallback(() => {
    if (isComplete || tasks.length === 0) {
      router.push(onExit);
    } else {
      setShowExitDialog(true);
    }
  }, [isComplete, tasks.length, router, onExit]);

  // Generic action handler — sets pendingNext after completion
  const handleAction = useCallback(
    async (actionFn: (task: Task) => Promise<string>) => {
      if (!currentTask || processing) return;

      setProcessing(true);
      try {
        const label = await actionFn(currentTask);

        // Empty label means "stay on current task" (e.g., dialog opened)
        if (label === '') {
          return;
        }

        setProcessedCount((c) => c + 1);
        setLastAction(label);
        setPendingNext(true);
        onTaskProcessed?.();

        if (currentIndex >= tasks.length - 1) {
          setCurrentIndex(Math.max(0, tasks.length - 2));
        }
      } finally {
        setProcessing(false);
      }
    },
    [currentTask, processing, currentIndex, tasks.length, onTaskProcessed]
  );

  // Trigger transition directly (used by popoverContent actions like Schedule)
  const triggerTransition = useCallback(
    (label: string) => {
      setProcessedCount((c) => c + 1);
      setLastAction(label);
      setPendingNext(true);
      onTaskProcessed?.();

      if (currentIndex >= tasks.length - 1) {
        setCurrentIndex(Math.max(0, tasks.length - 2));
      }
    },
    [currentIndex, tasks.length, onTaskProcessed]
  );

  // Move to next task after user confirms
  const handleNextTask = useCallback(() => {
    setPendingNext(false);
    setLastAction('');
  }, []);

  // ── Loading ──
  if (loading) {
    return <ProcessPageSkeleton />;
  }

  // ── Tutorial ──
  if (tutorialFeatureCode && showTutorial) {
    return (
      <FeatureTutorial
        featureCode={tutorialFeatureCode}
        tutorial={tutorial}
        onComplete={dismissTutorial}
      />
    );
  }

  // ── Completion screen ──
  if (isComplete) {
    return (
      <>
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-md" />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold mb-2">{completion.title}</h1>
            <p className="text-muted-foreground mb-6">
              {completion.message(processedCount)}
            </p>
            <div className="flex gap-3 justify-center">
              {completion.secondaryHref && (
                <Button variant="outline" onClick={() => router.push(completion.secondaryHref!)}>
                  {completion.secondaryLabel || 'Back'}
                </Button>
              )}
              <Button onClick={() => router.push(completion.primaryHref)}>
                {completion.primaryLabel}
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ── Separate action groups ──
  const secondaryActions = actions.filter((a) => a.group === 'secondary');
  const primaryActions = actions.filter((a) => a.group === 'primary');

  return (
    <>
      {/* Full-screen backdrop */}
      <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-md" />

      {/* Exit confirmation dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent className="z-[60]">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {exitMessage?.title || 'Leave review?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {exitMessage
                ? exitMessage.description(tasks.length)
                : `You still have ${tasks.length} task${tasks.length > 1 ? 's' : ''} to review.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {exitMessage?.keepLabel || 'Keep reviewing'}
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push(onExit)}>
              {exitMessage?.leaveLabel || 'Leave anyway'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Extra dialogs (DecomposeDialog, EditTaskDialog, etc.) */}
      {extraDialogs}

      {/* Process content — floats above blur */}
      <div className="fixed inset-0 z-50 flex flex-col overflow-auto">
        {/* Ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 50% 40%, rgba(217, 249, 104, 0.04) 0%, transparent 50%)',
          }}
        />
        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 50% 45%, transparent 30%, rgba(26, 26, 26, 0.25) 100%)',
          }}
        />

        {/* Header with progress */}
        <header className="relative z-10 p-4">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">
                {processedCount + 1} of {totalTasks}
              </span>
              <button
                onClick={handleBack}
                className="rounded-full p-2 hover:bg-muted/50 transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <Progress value={(processedCount / totalTasks) * 100} className="h-1.5" />
          </div>
        </header>

        {/* Main content */}
        <main className="relative z-10 flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <AnimatePresence mode="wait">
              {pendingNext ? (
                /* ── Transition screen ── */
                <motion.div
                  key="pending-next"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="flex flex-col items-center justify-center space-y-6 py-12"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
                    className="rounded-full bg-primary/10 p-4"
                  >
                    <Check className="h-8 w-8 text-primary" />
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="text-sm text-muted-foreground"
                  >
                    {lastAction}
                  </motion.p>

                  {tasks.length > 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Button size="lg" onClick={handleNextTask} className="gap-2 px-8">
                        Next task
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Button
                        size="lg"
                        onClick={() => {
                          setPendingNext(false);
                          setLastAction('');
                        }}
                        className="gap-2 px-8"
                      >
                        See results
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              ) : (
                /* ── Task card + actions ── */
                <motion.div
                  key={currentTask?.id || 'task'}
                  initial={{ opacity: 0, y: 20, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.97 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="space-y-5"
                >
                  {/* Context badge */}
                  {getTaskContext && currentTask && (() => {
                    const ctx = getTaskContext(currentTask);
                    return ctx ? (
                      <div className="flex justify-center">
                        <span className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                          {ctx}
                        </span>
                      </div>
                    ) : null;
                  })()}

                  {/* Task card */}
                  <div className="relative">
                    <div
                      className="absolute -inset-8 -z-10 pointer-events-none"
                      style={{
                        background:
                          'radial-gradient(ellipse at center, rgba(217, 249, 104, 0.06) 0%, transparent 70%)',
                        filter: 'blur(30px)',
                      }}
                    />
                    <Card
                      className={cn(
                        'border-2 border-primary/50 bg-primary/5',
                        'transition-all cursor-pointer hover:border-primary hover:shadow-lg hover:shadow-primary/5'
                      )}
                      onClick={() => currentTask && onTaskClick?.(currentTask)}
                    >
                      <CardContent className="p-6">
                        <h2 className="text-xl font-semibold">{currentTask?.title}</h2>
                        {currentTask?.description && (
                          <p className="text-muted-foreground text-sm mt-2">
                            {currentTask.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground/50 mt-3">
                          Tap to edit details
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Steps (project selector, etc.) */}
                  {steps?.map((step, i) => (
                    <motion.div
                      key={`step-${i}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.05 }}
                    >
                      <p className="text-xs text-muted-foreground/60 mb-1.5">{step.label}</p>
                      {currentTask && (step.content(currentTask) as React.ReactNode)}
                    </motion.div>
                  ))}

                  {/* Secondary actions (Done / Delete / Break down) */}
                  {secondaryActions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + (steps?.length || 0) * 0.05 }}
                    >
                      <p className="text-xs text-muted-foreground/60 mb-1.5">
                        Already done? Or not needed?
                      </p>
                      <div className="flex justify-center gap-2">
                        {secondaryActions.map((action) => (
                          <Button
                            key={action.id}
                            variant={action.variant || 'outline'}
                            size="sm"
                            onClick={() => handleAction(action.handler)}
                            disabled={processing}
                            className={action.className}
                          >
                            {processing ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <action.icon className="h-4 w-4 mr-1" />
                                {action.label}
                              </>
                            )}
                          </Button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Primary actions (Today / Schedule / Not Today) */}
                  {primaryActions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.15 + (steps?.length || 0) * 0.05,
                      }}
                    >
                      <p className="text-xs text-muted-foreground/60 mb-1.5">
                        When will you do this?
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {primaryActions.map((action) =>
                          action.popoverContent && currentTask ? (
                            <div key={action.id} className={action.colSpan2 ? 'col-span-2' : ''}>
                              {action.popoverContent(currentTask, triggerTransition)}
                            </div>
                          ) : (
                            <Button
                              key={action.id}
                              size="lg"
                              variant={action.variant || 'outline'}
                              onClick={() => handleAction(action.handler)}
                              disabled={processing}
                              className={cn(
                                'h-14 text-base',
                                action.colSpan2 && 'col-span-2',
                                action.className
                              )}
                            >
                              {processing ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                              ) : (
                                <>
                                  <action.icon className="h-5 w-5 mr-2" />
                                  {action.label}
                                </>
                              )}
                            </Button>
                          )
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </>
  );
}
