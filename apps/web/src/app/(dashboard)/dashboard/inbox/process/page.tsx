'use client';

import { useState, useEffect, useCallback } from 'react';
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { AddTaskDialog } from '@/components/tasks';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useGamificationEvents } from '@/components/gamification/GamificationProvider';
import type { Task } from '@/db/schema';
import {
  Sun,
  Calendar as CalendarIcon,
  EyeOff,
  Trash2,
  CheckCircle2,
  Loader2,
  Check,
  FolderKanban,
  Plus,
  X,
  ArrowRight,
} from 'lucide-react';
import { ProcessPageSkeleton } from '@/components/ui/skeletons';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useFeaturePageTutorial } from '@/hooks/useFeaturePageTutorial';
import { FeatureTutorial } from '@/components/gamification/FeatureTutorial';

export default function InboxProcessPage() {
  const router = useRouter();
  const {
    inboxTasks,
    loading,
    moveToToday,
    scheduleTask,
    snoozeTask,
    deleteTask,
    complete,
    update,
  } = useTasks();
  const { projects, create: createProject } = useProjects();
  const { handleTaskComplete, refreshAll } = useGamificationEvents();
  const { showTutorial, tutorial, dismiss: dismissTutorial } = useFeaturePageTutorial('nav_process');

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [creatingProject, setCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [pendingNext, setPendingNext] = useState(false);
  const [lastAction, setLastAction] = useState('');

  const totalTasks = inboxTasks.length + processedCount;

  // Current task
  const currentTask = inboxTasks[currentIndex];
  const isComplete = inboxTasks.length === 0 && !pendingNext;

  // Reset selected project when task changes
  useEffect(() => {
    if (currentTask) {
      setSelectedProject(currentTask.projectId || null);
    }
  }, [currentTask?.id]);

  // Block navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isComplete && inboxTasks.length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isComplete, inboxTasks.length]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (isComplete || inboxTasks.length === 0) {
      router.push('/dashboard/inbox');
    } else {
      setShowExitDialog(true);
    }
  }, [isComplete, inboxTasks.length, router]);

  // Process actions — now sets pendingNext instead of auto-advancing
  const handleAction = useCallback(async (action: () => Promise<unknown>, actionLabel: string) => {
    if (!currentTask || processing) return;

    setProcessing(true);
    try {
      await action();
      setProcessedCount(c => c + 1);
      setLastAction(actionLabel);
      setPendingNext(true);
      // Index adjusts automatically when task is removed from inboxTasks
      if (currentIndex >= inboxTasks.length - 1) {
        setCurrentIndex(Math.max(0, inboxTasks.length - 2));
      }
    } finally {
      setProcessing(false);
    }
  }, [currentTask, processing, currentIndex, inboxTasks.length]);

  // Move to next task after user confirms
  const handleNextTask = useCallback(() => {
    setPendingNext(false);
    setLastAction('');
    setSelectedProject(null);
    setCreatingProject(false);
    setNewProjectName('');
  }, []);

  // Move to today (with optional project assignment)
  const handleToday = async () => {
    if (!currentTask) return;

    if (selectedProject && selectedProject !== currentTask.projectId) {
      await update(currentTask.id, { projectId: selectedProject });
    }

    handleAction(() => moveToToday(currentTask.id), 'Moved to Today');
  };

  // Schedule for later
  const handleSchedule = (daysFromNow: number) => {
    if (!currentTask) return;
    setShowCalendar(false);
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    const label = daysFromNow === 1 ? 'Scheduled for tomorrow' :
      daysFromNow === 7 ? 'Scheduled for next week' :
      `Scheduled for ${format(date, 'MMM d')}`;
    handleAction(() => scheduleTask(currentTask.id, format(date, 'yyyy-MM-dd')), label);
  };

  // Not Today - snooze
  const handleNotToday = () => {
    if (!currentTask) return;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    handleAction(() => snoozeTask(currentTask.id, format(tomorrow, 'yyyy-MM-dd')), 'Snoozed until tomorrow');
  };

  // Complete task
  const handleComplete = async () => {
    if (!currentTask) return;

    setProcessing(true);
    try {
      const result = await complete(currentTask.id);
      setProcessedCount(c => c + 1);

      handleTaskComplete({
        levelUp: result.levelUp ? {
          newLevel: result.newLevel,
          unlockedFeatures: [],
        } : undefined,
        xpAwarded: result.xpAwarded,
        newAchievements: result.newAchievements,
        creature: result.creature,
      });

      if (currentIndex >= inboxTasks.length - 1) {
        setCurrentIndex(Math.max(0, inboxTasks.length - 2));
      }

      setLastAction('Completed');
      setPendingNext(true);
    } finally {
      setProcessing(false);
    }
  };

  // Delete task
  const handleDelete = () => handleAction(() => deleteTask(currentTask.id), 'Deleted');

  // Edit task
  const handleEdit = () => {
    if (currentTask) {
      setEditingTask(currentTask);
    }
  };

  // Create new project inline
  const handleCreateProject = async () => {
    if (!newProjectName.trim()) return;
    try {
      const newProject = await createProject({ name: newProjectName.trim() });
      setSelectedProject(newProject.id);
      setNewProjectName('');
      setCreatingProject(false);
      refreshAll();
    } catch {
      // Handle error silently
    }
  };

  // Loading state
  if (loading) {
    return <ProcessPageSkeleton />;
  }

  if (showTutorial) {
    return <FeatureTutorial featureCode="nav_process" tutorial={tutorial} onComplete={dismissTutorial} />;
  }

  // Complete state — all tasks processed
  if (isComplete) {
    return (
      <>
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-md" />
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Inbox Clear!</h1>
            <p className="text-muted-foreground mb-6">
              {processedCount > 0
                ? `You processed ${processedCount} task${processedCount > 1 ? 's' : ''}. Great job!`
                : 'Your inbox is empty. Nothing to process!'}
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => router.push('/dashboard/inbox')}>
                Back to Inbox
              </Button>
              <Button onClick={() => router.push('/dashboard')}>
                <Sun className="h-4 w-4 mr-2" />
                View Today
              </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Full-screen backdrop — blurs sidebar and everything underneath */}
      <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-md" />

      {/* Exit confirmation dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent className="z-[60]">
          <AlertDialogHeader>
            <AlertDialogTitle>Leave processing?</AlertDialogTitle>
            <AlertDialogDescription>
              You still have {inboxTasks.length} task{inboxTasks.length > 1 ? 's' : ''} to process.
              Leaving now means your inbox stays cluttered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep processing</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push('/dashboard/inbox')}>
              Leave anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

      {/* Process content — floats above blur */}
      <div className="fixed inset-0 z-50 flex flex-col overflow-auto">
        {/* Ambient glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 40%, rgba(217, 249, 104, 0.04) 0%, transparent 50%)',
          }}
        />
        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 45%, transparent 30%, rgba(26, 26, 26, 0.25) 100%)',
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
                /* ── Transition screen: action confirmed, waiting for user ── */
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

                  {inboxTasks.length > 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                    >
                      <Button
                        size="lg"
                        onClick={handleNextTask}
                        className="gap-2 px-8"
                      >
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
                  {/* Task card */}
                  <div className="relative">
                    {/* Soft glow behind card */}
                    <div
                      className="absolute -inset-8 -z-10 pointer-events-none"
                      style={{
                        background: 'radial-gradient(ellipse at center, rgba(217, 249, 104, 0.06) 0%, transparent 70%)',
                        filter: 'blur(30px)',
                      }}
                    />
                    <Card
                      className={cn(
                        "border-2 border-primary/50 bg-primary/5",
                        "transition-all cursor-pointer hover:border-primary hover:shadow-lg hover:shadow-primary/5"
                      )}
                      onClick={handleEdit}
                    >
                      <CardContent className="p-6">
                        <h2 className="text-xl font-semibold">{currentTask?.title}</h2>
                        {currentTask?.description && (
                          <p className="text-muted-foreground text-sm mt-2">
                            {currentTask.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground/50 mt-3">Tap to edit details</p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Step 1: Project selector */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <p className="text-xs text-muted-foreground/60 mb-1.5">Step 1 — Assign to a project</p>
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
                          value={selectedProject || "none"}
                          onValueChange={(v) => {
                            if (v === "create") {
                              setCreatingProject(true);
                            } else {
                              setSelectedProject(v === "none" ? null : v);
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
                  </motion.div>

                  {/* Quick actions: Done / Delete */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <p className="text-xs text-muted-foreground/60 mb-1.5">Already done? Or not needed?</p>
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleComplete}
                        disabled={processing}
                        className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/30"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Done
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDelete}
                        disabled={processing}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </motion.div>

                  {/* Step 2: Main action buttons */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <p className="text-xs text-muted-foreground/60 mb-1.5">Step 2 — When will you do this?</p>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        size="lg"
                        onClick={handleToday}
                        disabled={processing}
                        variant="outline"
                        className="h-14 text-base"
                      >
                        {processing ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <>
                            <Sun className="h-5 w-5 mr-2" />
                            Today
                          </>
                        )}
                      </Button>

                      <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                        <PopoverTrigger asChild>
                          <Button
                            size="lg"
                            variant="outline"
                            disabled={processing}
                            className="h-14 text-base"
                          >
                            <CalendarIcon className="h-5 w-5 mr-2" />
                            Schedule
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-2 z-[60]" align="center">
                          <div className="grid gap-1">
                            <Button variant="ghost" className="justify-start" onClick={() => handleSchedule(1)}>
                              Tomorrow
                            </Button>
                            <Button variant="ghost" className="justify-start" onClick={() => handleSchedule(2)}>
                              In 2 days
                            </Button>
                            <Button variant="ghost" className="justify-start" onClick={() => handleSchedule(7)}>
                              Next week
                            </Button>
                            <Button variant="ghost" className="justify-start" onClick={() => handleSchedule(14)}>
                              In 2 weeks
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>

                      <Button
                        size="lg"
                        variant="secondary"
                        onClick={handleNotToday}
                        disabled={processing}
                        className="h-14 text-base col-span-2"
                      >
                        <EyeOff className="h-5 w-5 mr-2" />
                        Not Today
                      </Button>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </>
  );
}
