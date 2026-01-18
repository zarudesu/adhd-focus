'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from "@/components/layout/page-header";
import { ProtectedRoute } from '@/components/gamification/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useFocusTimer, TimerMode } from "@/hooks/useFocusTimer";
import { useTasks } from "@/hooks/useTasks";
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Coffee,
  Timer,
  CheckCircle2,
  Clock,
  Target
} from "lucide-react";
import { cn } from "@/lib/utils";

function FocusContent() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [sessionStats, setSessionStats] = useState<{
    todayPomodoros: number;
    todayMinutes: number;
    totalPomodoros: number;
  }>({ todayPomodoros: 0, todayMinutes: 0, totalPomodoros: 0 });

  const { todayTasks } = useTasks();

  const {
    mode,
    status,
    timeRemaining,
    pomodorosCompleted,
    progress,
    formattedTime,
    start,
    pause,
    resume,
    reset,
    skip,
    setMode,
    workDuration,
    shortBreakDuration,
    longBreakDuration,
  } = useFocusTimer({
    taskId: selectedTaskId,
    onPomodoroComplete: () => {
      // Refresh stats when pomodoro completes
      fetchSessionStats();
    },
  });

  // Fetch session stats
  const fetchSessionStats = async () => {
    try {
      const res = await fetch('/api/focus/sessions');
      if (res.ok) {
        const data = await res.json();
        setSessionStats({
          todayPomodoros: data.todayStats?.pomodoros || 0,
          todayMinutes: data.todayStats?.focusMinutes || 0,
          totalPomodoros: data.totalStats?.totalPomodoros || 0,
        });
      }
    } catch {
      // Ignore errors
    }
  };

  useEffect(() => {
    fetchSessionStats();
  }, []);

  // Get selected task
  const selectedTask = todayTasks.find(t => t.id === selectedTaskId);

  // Mode configuration
  const modes: { value: TimerMode; label: string; duration: number; icon: React.ReactNode }[] = [
    { value: 'work', label: 'Focus', duration: workDuration, icon: <Target className="h-4 w-4" /> },
    { value: 'shortBreak', label: 'Short Break', duration: shortBreakDuration, icon: <Coffee className="h-4 w-4" /> },
    { value: 'longBreak', label: 'Long Break', duration: longBreakDuration, icon: <Timer className="h-4 w-4" /> },
  ];

  // Calculate circle progress for SVG
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <>
      <PageHeader
        title="Focus Mode"
        description="One task at a time"
      />
      <main className="flex-1 p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Timer Card */}
          <Card>
            <CardContent className="pt-6">
              {/* Mode Selector */}
              <div className="flex justify-center gap-2 mb-8">
                {modes.map((m) => (
                  <Button
                    key={m.value}
                    variant={mode === m.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => status === 'idle' && setMode(m.value)}
                    disabled={status !== 'idle'}
                    className="gap-2"
                  >
                    {m.icon}
                    <span className="hidden sm:inline">{m.label}</span>
                    <span className="text-xs opacity-70">{m.duration}m</span>
                  </Button>
                ))}
              </div>

              {/* Circular Timer Display */}
              <div className="relative flex items-center justify-center mb-8">
                <svg className="transform -rotate-90" width="280" height="280">
                  {/* Background circle */}
                  <circle
                    cx="140"
                    cy="140"
                    r="120"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    className="text-muted"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="140"
                    cy="140"
                    r="120"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    style={{
                      strokeDasharray: circumference,
                      strokeDashoffset: strokeDashoffset,
                      transition: 'stroke-dashoffset 0.5s ease',
                    }}
                    className={cn(
                      mode === 'work' ? 'text-primary' : 'text-green-500'
                    )}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-6xl font-mono font-bold tracking-tight">
                    {formattedTime}
                  </span>
                  <span className="text-sm text-muted-foreground mt-2 capitalize">
                    {mode === 'work' ? 'Focus Time' : mode === 'shortBreak' ? 'Short Break' : 'Long Break'}
                  </span>
                  {pomodorosCompleted > 0 && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <CheckCircle2 className="h-3 w-3" />
                      {pomodorosCompleted} pomodoro{pomodorosCompleted !== 1 ? 's' : ''} this session
                    </div>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-3">
                <Button
                  size="lg"
                  variant="outline"
                  onClick={reset}
                  disabled={status === 'idle'}
                >
                  <RotateCcw className="h-5 w-5" />
                </Button>

                {status === 'idle' || status === 'completed' ? (
                  <Button size="lg" onClick={start} className="gap-2 px-8">
                    <Play className="h-5 w-5" />
                    Start
                  </Button>
                ) : status === 'running' ? (
                  <Button size="lg" onClick={pause} className="gap-2 px-8">
                    <Pause className="h-5 w-5" />
                    Pause
                  </Button>
                ) : (
                  <Button size="lg" onClick={resume} className="gap-2 px-8">
                    <Play className="h-5 w-5" />
                    Resume
                  </Button>
                )}

                <Button
                  size="lg"
                  variant="outline"
                  onClick={skip}
                  disabled={status === 'idle'}
                >
                  <SkipForward className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Task Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4" />
                Current Task
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTask ? (
                <div className="p-3 rounded-lg border bg-muted/50 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{selectedTask.title}</p>
                    {(selectedTask.pomodorosCompleted || 0) > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {selectedTask.pomodorosCompleted} pomodoro{selectedTask.pomodorosCompleted !== 1 ? 's' : ''} completed
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedTaskId(null)}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {todayTasks.filter(t => !t.completedAt).length > 0 ? (
                    todayTasks
                      .filter(t => !t.completedAt)
                      .slice(0, 5)
                      .map(task => (
                        <button
                          key={task.id}
                          onClick={() => setSelectedTaskId(task.id)}
                          className="w-full p-3 rounded-lg border hover:bg-muted/50 text-left transition-colors"
                        >
                          <p className="font-medium text-sm">{task.title}</p>
                          {(task.pomodorosCompleted || 0) > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {task.pomodorosCompleted} pomodoro{task.pomodorosCompleted !== 1 ? 's' : ''} done
                            </p>
                          )}
                        </button>
                      ))
                  ) : (
                    <div className="rounded-lg border border-dashed p-4 text-center text-muted-foreground">
                      <p>No tasks for today</p>
                      <p className="text-xs mt-1">Add tasks to Today to focus on them</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Today&apos;s Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold">{sessionStats.todayPomodoros}</p>
                  <p className="text-xs text-muted-foreground">Pomodoros</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">{sessionStats.todayMinutes}</p>
                  <p className="text-xs text-muted-foreground">Minutes</p>
                </div>
                <div>
                  <p className="text-3xl font-bold">{sessionStats.totalPomodoros}</p>
                  <p className="text-xs text-muted-foreground">All Time</p>
                </div>
              </div>
              {sessionStats.todayPomodoros > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Daily goal</span>
                    <span>{sessionStats.todayPomodoros}/8 pomodoros</span>
                  </div>
                  <Progress value={(sessionStats.todayPomodoros / 8) * 100} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}

export default function FocusPage() {
  return (
    <ProtectedRoute featureCode="nav_focus">
      <FocusContent />
    </ProtectedRoute>
  );
}
