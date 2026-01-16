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
import { useTasks } from '@/hooks/useTasks';
import {
  Sun,
  Calendar as CalendarIcon,
  Archive,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Zap,
  Battery,
  BatteryLow,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';

export default function InboxProcessPage() {
  const router = useRouter();
  const { inboxTasks, loading, moveToToday, scheduleTask, moveToSomeday, deleteTask, fetch } = useTasks();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const totalTasks = inboxTasks.length + processedCount;

  // Current task
  const currentTask = inboxTasks[currentIndex];
  const isComplete = inboxTasks.length === 0;

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

  const handleToday = () => handleAction(() => moveToToday(currentTask.id));

  const handleSchedule = (daysFromNow: number) => {
    setShowCalendar(false);
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    handleAction(() => scheduleTask(currentTask.id, format(date, 'yyyy-MM-dd')));
  };

  const handleSomeday = () => handleAction(() => moveToSomeday(currentTask.id));

  const handleDelete = () => handleAction(() => deleteTask(currentTask.id));

  // Skip to next/prev (without processing)
  const handleNext = () => {
    if (currentIndex < inboxTasks.length - 1) {
      setCurrentIndex(i => i + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(i => i - 1);
    }
  };

  // Energy icon
  const getEnergyIcon = (energy?: string | null) => {
    switch (energy) {
      case 'low': return <BatteryLow className="h-4 w-4" />;
      case 'high': return <Zap className="h-4 w-4" />;
      default: return <Battery className="h-4 w-4" />;
    }
  };

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

      {/* Main content - Task card */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Navigation arrows */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handlePrev}
              disabled={currentIndex === 0 || processing}
              className="shrink-0"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {/* Task card */}
            <Card className="flex-1">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-3">{currentTask?.title}</h2>

                {currentTask?.description && (
                  <p className="text-muted-foreground text-sm mb-4">
                    {currentTask.description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-full">
                    {getEnergyIcon(currentTask?.energyRequired)}
                    {currentTask?.energyRequired || 'Medium'}
                  </span>
                  <span className="inline-flex items-center text-xs bg-muted px-2 py-1 rounded-full">
                    {currentTask?.priority || 'Should'}
                  </span>
                  {currentTask?.estimatedMinutes && (
                    <span className="inline-flex items-center text-xs bg-muted px-2 py-1 rounded-full">
                      {currentTask.estimatedMinutes}m
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleNext}
              disabled={currentIndex >= inboxTasks.length - 1 || processing}
              className="shrink-0"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            <Button
              size="lg"
              onClick={handleToday}
              disabled={processing}
              className="h-16 text-base"
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
                  className="h-16 text-base"
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
              onClick={handleSomeday}
              disabled={processing}
              className="h-16 text-base"
            >
              <Archive className="h-5 w-5 mr-2" />
              Someday
            </Button>

            <Button
              size="lg"
              variant="ghost"
              onClick={handleDelete}
              disabled={processing}
              className="h-16 text-base text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="h-5 w-5 mr-2" />
              Delete
            </Button>
          </div>

          {/* Skip hint */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            Use arrows to skip tasks you're unsure about
          </p>
        </div>
      </main>
    </div>
  );
}
