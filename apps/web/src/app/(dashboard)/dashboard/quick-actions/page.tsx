'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/gamification/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { useGamificationEvents } from '@/components/gamification/GamificationProvider';
import {
  Play,
  Pause,
  SkipForward,
  CheckCircle2,
  Clock,
  Zap,
  Battery,
  BatteryLow,
  ChevronLeft,
  Loader2,
  Shuffle,
  ArrowUpDown,
  FolderOpen,
  AlertTriangle,
} from 'lucide-react';
import { QuickActionsPageSkeleton } from '@/components/ui/skeletons';
import { cn } from '@/lib/utils';
import { useFeaturePageTutorial } from '@/hooks/useFeaturePageTutorial';
import { FeatureTutorial } from '@/components/gamification/FeatureTutorial';

type SortMode = 'random' | 'priority' | 'project' | 'energy';

const QUICK_TASK_THRESHOLD = 5; // minutes
const WARNING_TIME = 5 * 60; // 5 minutes in seconds
const OVERTIME_TIME = 8 * 60; // 8 minutes in seconds

function QuickActionsContent() {
  const router = useRouter();
  const { tasks, loading, complete, update } = useTasks();
  const { projects } = useProjects();
  const { handleTaskComplete } = useGamificationEvents();
  const { showTutorial, tutorial, dismiss: dismissTutorial } = useFeaturePageTutorial('nav_quick_actions');

  const [sortMode, setSortMode] = useState<SortMode>('priority');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [showOvertimeDialog, setShowOvertimeDialog] = useState(false);
  const [overtimeShown, setOvertimeShown] = useState(false);
  // Store shuffle order for random mode (generated in effect, not during render)
  const [shuffleOrder, setShuffleOrder] = useState<string[]>([]);

  // Generate shuffle order when switching to random mode
  useEffect(() => {
    if (sortMode === 'random') {
      // Use setTimeout to batch state update (avoid lint warning)
      const timeoutId = setTimeout(() => {
        const filtered = tasks.filter(
          (t) =>
            t.status !== 'done' &&
            t.status !== 'archived' &&
            t.estimatedMinutes &&
            t.estimatedMinutes <= QUICK_TASK_THRESHOLD
        );
        // Fisher-Yates shuffle (in effect, not render)
        const ids = filtered.map(t => t.id);
        for (let i = ids.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [ids[i], ids[j]] = [ids[j], ids[i]];
        }
        setShuffleOrder(ids);
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [sortMode, tasks]);

  // Filter quick tasks (5 min or less, not completed)
  const quickTasks = useMemo(() => {
    const filtered = tasks.filter(
      (t) =>
        t.status !== 'done' &&
        t.status !== 'archived' &&
        t.estimatedMinutes &&
        t.estimatedMinutes <= QUICK_TASK_THRESHOLD
    );

    // Sort based on mode
    switch (sortMode) {
      case 'random':
        // Use pre-computed shuffle order (deterministic in render)
        return [...filtered].sort((a, b) => {
          const indexA = shuffleOrder.indexOf(a.id);
          const indexB = shuffleOrder.indexOf(b.id);
          // Put tasks not in shuffle order at the end
          if (indexA === -1 && indexB === -1) return 0;
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });
      case 'priority':
        const priorityOrder = { must: 0, should: 1, want: 2, someday: 3 };
        return [...filtered].sort(
          (a, b) =>
            (priorityOrder[a.priority as keyof typeof priorityOrder] || 3) -
            (priorityOrder[b.priority as keyof typeof priorityOrder] || 3)
        );
      case 'project':
        return [...filtered].sort((a, b) => {
          if (!a.projectId && !b.projectId) return 0;
          if (!a.projectId) return 1;
          if (!b.projectId) return -1;
          return a.projectId.localeCompare(b.projectId);
        });
      case 'energy':
        const energyOrder = { low: 0, medium: 1, high: 2 };
        return [...filtered].sort(
          (a, b) =>
            (energyOrder[a.energyRequired as keyof typeof energyOrder] || 1) -
            (energyOrder[b.energyRequired as keyof typeof energyOrder] || 1)
        );
      default:
        return filtered;
    }
  }, [tasks, sortMode, shuffleOrder]);

  const currentTask = quickTasks[currentIndex];
  const isComplete = quickTasks.length === 0;

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (timerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((s) => {
          const newSeconds = s + 1;
          // Check for overtime
          if (newSeconds >= OVERTIME_TIME && !overtimeShown) {
            setShowOvertimeDialog(true);
            setOvertimeShown(true);
          }
          return newSeconds;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, overtimeShown]);

  // Reset timer when task changes
  useEffect(() => {
    // Use setTimeout to batch state updates (avoid lint warning)
    const timeoutId = setTimeout(() => {
      setElapsedSeconds(0);
      setTimerRunning(false);
      setOvertimeShown(false);
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [currentIndex]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer state
  const isWarning = elapsedSeconds >= WARNING_TIME;
  const isOvertime = elapsedSeconds >= OVERTIME_TIME;

  // Actions
  const handleStart = () => setTimerRunning(true);
  const handlePause = () => setTimerRunning(false);

  const handleComplete = async () => {
    if (!currentTask) return;
    setTimerRunning(false);
    const result = await complete(currentTask.id);

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

    // Move to next or stay at current index
    if (currentIndex >= quickTasks.length - 1) {
      setCurrentIndex(Math.max(0, quickTasks.length - 2));
    }
  };

  const handleSkip = () => {
    if (currentIndex < quickTasks.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleRemoveQuickLabel = async () => {
    if (!currentTask) return;
    setShowOvertimeDialog(false);
    setTimerRunning(false);
    // Remove the 5-min estimate
    await update(currentTask.id, { estimatedMinutes: null });
    // Move to next
    if (currentIndex >= quickTasks.length - 1) {
      setCurrentIndex(Math.max(0, quickTasks.length - 2));
    }
  };

  const handleContinue = () => {
    setShowOvertimeDialog(false);
    // Keep going
  };

  // Get project info
  const getProjectInfo = (projectId?: string | null) => {
    if (!projectId) return null;
    return projects.find((p) => p.id === projectId);
  };

  // Energy icon
  const getEnergyIcon = (energy?: string | null) => {
    switch (energy) {
      case 'low':
        return <BatteryLow className="h-4 w-4" />;
      case 'high':
        return <Zap className="h-4 w-4" />;
      default:
        return <Battery className="h-4 w-4" />;
    }
  };

  // Loading state
  if (loading) {
    return <QuickActionsPageSkeleton />;
  }

  if (showTutorial) {
    return <FeatureTutorial featureCode="nav_quick_actions" tutorial={tutorial} onComplete={dismissTutorial} />;
  }

  // No quick tasks
  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-md">
          <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <Zap className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">No Quick Tasks</h1>
          <p className="text-muted-foreground mb-6">
            You don&apos;t have any tasks marked as 5 minutes or less.
            Add time estimates to your tasks to use Quick Actions.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              Back to Today
            </Button>
            <Button onClick={() => router.push('/dashboard/inbox')}>
              Go to Inbox
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Overtime dialog */}
      <AlertDialog open={showOvertimeDialog} onOpenChange={setShowOvertimeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Taking longer than expected
            </AlertDialogTitle>
            <AlertDialogDescription>
              This task has taken {formatTime(elapsedSeconds)} - longer than the 5-minute estimate.
              Would you like to remove the quick task label and move on?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleContinue}>
              Keep going
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveQuickLabel}>
              Remove label & skip
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <header className="border-b bg-card p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} of {quickTasks.length} quick tasks
              </span>
            </div>
            <Select value={sortMode} onValueChange={(v) => setSortMode(v as SortMode)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="priority">
                  <span className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4" />
                    Priority
                  </span>
                </SelectItem>
                <SelectItem value="random">
                  <span className="flex items-center gap-2">
                    <Shuffle className="h-4 w-4" />
                    Random
                  </span>
                </SelectItem>
                <SelectItem value="project">
                  <span className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" />
                    By Project
                  </span>
                </SelectItem>
                <SelectItem value="energy">
                  <span className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    By Energy
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Timer */}
          <div className="text-center mb-6">
            <div
              className={cn(
                'text-6xl font-mono font-bold transition-colors',
                isOvertime && 'text-red-500',
                isWarning && !isOvertime && 'text-amber-500'
              )}
            >
              {formatTime(elapsedSeconds)}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {isOvertime
                ? 'Over 8 minutes!'
                : isWarning
                ? 'Over 5 minutes'
                : `Target: ${currentTask?.estimatedMinutes || 5}m`}
            </p>
          </div>

          {/* Task card */}
          <Card className={cn(isOvertime && 'border-red-500', isWarning && !isOvertime && 'border-amber-500')}>
            <CardContent className="p-6">
              {/* Project badge */}
              {currentTask?.projectId && (
                <div className="mb-3">
                  <span
                    className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full"
                    style={{
                      backgroundColor: `${getProjectInfo(currentTask.projectId)?.color || '#6366f1'}20`,
                      color: getProjectInfo(currentTask.projectId)?.color || '#6366f1',
                    }}
                  >
                    {getProjectInfo(currentTask.projectId)?.emoji}
                    {getProjectInfo(currentTask.projectId)?.name}
                  </span>
                </div>
              )}

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
                <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                  <Clock className="h-3 w-3" />
                  {currentTask?.estimatedMinutes}m
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Action buttons */}
          <div className="flex gap-3 mt-6">
            {!timerRunning ? (
              <Button size="lg" className="flex-1 h-14" onClick={handleStart}>
                <Play className="h-5 w-5 mr-2" />
                Start
              </Button>
            ) : (
              <Button size="lg" variant="outline" className="flex-1 h-14" onClick={handlePause}>
                <Pause className="h-5 w-5 mr-2" />
                Pause
              </Button>
            )}

            <Button
              size="lg"
              variant="default"
              className="flex-1 h-14 bg-green-600 hover:bg-green-700"
              onClick={handleComplete}
            >
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Done
            </Button>

            <Button
              size="lg"
              variant="ghost"
              className="h-14"
              onClick={handleSkip}
              disabled={currentIndex >= quickTasks.length - 1}
              aria-label="Skip to next task"
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>

          {/* Hint */}
          <p className="text-center text-xs text-muted-foreground mt-4">
            {timerRunning
              ? 'Focus on this task. Click Done when finished.'
              : 'Click Start to begin the timer'}
          </p>
        </div>
      </main>
    </div>
  );
}

export default function QuickActionsPage() {
  return (
    <ProtectedRoute featureCode="nav_quick_actions">
      <QuickActionsContent />
    </ProtectedRoute>
  );
}
