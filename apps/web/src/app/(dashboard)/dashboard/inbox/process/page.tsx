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
  ChevronLeft,
  CheckCircle2,
  Loader2,
  Pencil,
  Check,
  FolderKanban,
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

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
  const { projects } = useProjects();
  const { handleTaskComplete } = useGamificationEvents();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const totalTasks = inboxTasks.length + processedCount;

  // Current task
  const currentTask = inboxTasks[currentIndex];
  const isComplete = inboxTasks.length === 0;

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

  // Process actions
  const handleAction = useCallback(async (action: () => Promise<unknown>) => {
    if (!currentTask || processing) return;

    setProcessing(true);
    try {
      await action();
      setProcessedCount(c => c + 1);
      // Task will be removed from inboxTasks automatically via useTasks
      // Reset index if needed
      if (currentIndex >= inboxTasks.length - 1) {
        setCurrentIndex(Math.max(0, inboxTasks.length - 2));
      }
    } finally {
      setProcessing(false);
    }
  }, [currentTask, processing, currentIndex, inboxTasks.length]);

  // Move to today (with optional project assignment)
  const handleToday = async () => {
    if (!currentTask) return;

    // If project selected, assign it first
    if (selectedProject && selectedProject !== currentTask.projectId) {
      await update(currentTask.id, { projectId: selectedProject });
    }

    handleAction(() => moveToToday(currentTask.id));
  };

  // Schedule for later
  const handleSchedule = (daysFromNow: number) => {
    if (!currentTask) return;
    setShowCalendar(false);
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    handleAction(() => scheduleTask(currentTask.id, format(date, 'yyyy-MM-dd')));
  };

  // Not Today - snooze task in inbox until tomorrow
  const handleNotToday = () => {
    if (!currentTask) return;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    handleAction(() => snoozeTask(currentTask.id, format(tomorrow, 'yyyy-MM-dd')));
  };

  // Complete task
  const handleComplete = async () => {
    if (!currentTask) return;

    setProcessing(true);
    try {
      const result = await complete(currentTask.id);
      setProcessedCount(c => c + 1);

      // Trigger gamification
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
    } finally {
      setProcessing(false);
    }
  };

  // Delete task
  const handleDelete = () => handleAction(() => deleteTask(currentTask.id));

  // Edit task
  const handleEdit = () => {
    if (currentTask) {
      setEditingTask(currentTask);
    }
  };

  // Check if "Next" conditions are met (project assigned)
  const canProceed = selectedProject !== null;

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Complete state
  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
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
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Exit confirmation dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
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
          }
        }}
        task={editingTask}
        defaultStatus="inbox"
      />

      {/* Header with progress */}
      <header className="border-b bg-card p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Exit
            </Button>
            <span className="text-sm font-medium">
              {processedCount + 1} of {totalTasks}
            </span>
            <div className="w-16" /> {/* Spacer for alignment */}
          </div>
          <Progress value={(processedCount / totalTasks) * 100} className="h-2" />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-4">

          {/* Task card - green border, clean content */}
          <Card className={cn(
            "border-2 border-primary/50 bg-primary/5",
            "transition-all"
          )}>
            <CardContent className="p-6">
              {/* Task title */}
              <h2 className="text-xl font-semibold mb-2">{currentTask?.title}</h2>

              {/* Description if exists */}
              {currentTask?.description && (
                <p className="text-muted-foreground text-sm mb-4">
                  {currentTask.description}
                </p>
              )}

              {/* Project selector inside card */}
              <div className="flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={selectedProject || "none"}
                  onValueChange={(v) => setSelectedProject(v === "none" ? null : v)}
                >
                  <SelectTrigger className="flex-1 h-9">
                    <SelectValue placeholder="Select project..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No project</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.emoji} {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Quick actions row - edit, complete, delete */}
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              disabled={processing}
            >
              <Pencil className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleComplete}
              disabled={processing}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
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

          {/* Main action buttons */}
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
              <PopoverContent className="w-48 p-2" align="center">
                <div className="grid gap-1">
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => handleSchedule(1)}
                  >
                    Tomorrow
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => handleSchedule(2)}
                  >
                    In 2 days
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => handleSchedule(7)}
                  >
                    Next week
                  </Button>
                  <Button
                    variant="ghost"
                    className="justify-start"
                    onClick={() => handleSchedule(14)}
                  >
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

        </div>
      </main>
    </div>
  );
}
