'use client';

/**
 * Statistics Page
 * Shows user's gamification stats, streak, achievements
 */

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Flame, Target, CheckCircle2, Trophy, Sparkles, TrendingUp } from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';
import { cn } from '@/lib/utils';

// Calculate tasks completed today
function useTodayTasksCount() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTodayTasks() {
      try {
        const today = new Date().toISOString().split('T')[0];
        const res = await fetch(`/api/tasks?status=done`);
        if (res.ok) {
          const tasks = await res.json();
          // Count tasks completed today
          const todayCount = tasks.filter((task: { completedAt: string | null }) => {
            if (!task.completedAt) return false;
            return task.completedAt.startsWith(today);
          }).length;
          setCount(todayCount);
        }
      } catch {
        // Ignore errors
      } finally {
        setLoading(false);
      }
    }
    fetchTodayTasks();
  }, []);

  return { count, loading };
}

// Get WIP limit from user preferences
function useWipLimit() {
  const [limit, setLimit] = useState(3);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const profile = await res.json();
          if (profile.preferences?.wipLimit) {
            setLimit(profile.preferences.wipLimit);
          }
        }
      } catch {
        // Use default
      }
    }
    fetchProfile();
  }, []);

  return limit;
}

function StatsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-32 w-full" />
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <Skeleton className="h-48" />
    </div>
  );
}

export default function StatsPage() {
  const { state, loading, levelProgress } = useGamification();
  const { count: todayTasksCount, loading: todayLoading } = useTodayTasksCount();
  const wipLimit = useWipLimit();

  if (loading) {
    return (
      <>
        <PageHeader
          title="Statistics"
          description="Track your progress"
        />
        <main className="flex-1 p-4">
          <StatsSkeleton />
        </main>
      </>
    );
  }

  const dailyGoalProgress = Math.min((todayTasksCount / wipLimit) * 100, 100);
  const dailyGoalComplete = todayTasksCount >= wipLimit;

  return (
    <>
      <PageHeader
        title="Statistics"
        description="Track your progress"
      />
      <main className="flex-1 p-4">
        <div className="space-y-6">
          {/* Streak Card */}
          <Card className={cn(
            'overflow-hidden',
            state?.currentStreak && state.currentStreak > 0 && 'border-orange-500/30'
          )}>
            {state?.currentStreak && state.currentStreak > 0 && (
              <div className="h-1 bg-gradient-to-r from-orange-400 to-red-500" />
            )}
            <CardHeader className="flex flex-row items-center space-y-0 gap-2">
              <Flame className={cn(
                'h-5 w-5',
                state?.currentStreak && state.currentStreak > 0
                  ? 'text-orange-500'
                  : 'text-muted-foreground'
              )} />
              <CardTitle>Current Streak</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className={cn(
                  'text-5xl font-bold',
                  state?.currentStreak && state.currentStreak > 0 && 'text-orange-500'
                )}>
                  {state?.currentStreak || 0}
                </div>
                <p className="text-muted-foreground">
                  {state?.currentStreak === 1 ? 'day' : 'days'}
                </p>
                {state?.longestStreak && state.longestStreak > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Best: {state.longestStreak} days
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{state?.totalTasksCompleted || 0}</div>
                <p className="text-xs text-muted-foreground">total</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Level</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{state?.level || 1}</div>
                <div className="mt-2">
                  <Progress value={levelProgress.progress} className="h-1.5" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {levelProgress.xpInLevel} / {levelProgress.xpNeeded} XP
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className={cn(dailyGoalComplete && 'border-green-500/30')}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Daily Goal</CardTitle>
                <Target className={cn(
                  'h-4 w-4',
                  dailyGoalComplete ? 'text-green-500' : 'text-muted-foreground'
                )} />
              </CardHeader>
              <CardContent>
                <div className={cn(
                  'text-2xl font-bold',
                  dailyGoalComplete && 'text-green-500'
                )}>
                  {todayLoading ? '...' : todayTasksCount}/{wipLimit}
                </div>
                <Progress
                  value={dailyGoalProgress}
                  className={cn('mt-2', dailyGoalComplete && '[&>div]:bg-green-500')}
                />
              </CardContent>
            </Card>
          </div>

          {/* XP & Creatures Summary */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 space-y-0">
                <Sparkles className="h-5 w-5 text-yellow-500" />
                <CardTitle>Experience Points</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{state?.xp || 0} XP</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Level {state?.level || 1} • {levelProgress.xpNeeded - levelProgress.xpInLevel} XP to next level
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-2 space-y-0">
                <span className="text-xl">🐾</span>
                <CardTitle>Creatures</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{state?.totalCreatures || 0}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  {state?.creatures?.length || 0} unique species discovered
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Achievements */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-2 space-y-0">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <CardTitle>Achievements</CardTitle>
              {state?.achievements && state.achievements.length > 0 && (
                <span className="ml-auto text-sm text-muted-foreground">
                  {state.achievements.length} unlocked
                </span>
              )}
            </CardHeader>
            <CardContent>
              {state?.achievements && state.achievements.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {state.achievements.map((userAchievement) => (
                    <div
                      key={userAchievement.id}
                      className="flex items-center gap-3 rounded-lg border bg-card p-3"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/10 text-xl">
                        {userAchievement.achievement.icon || '🏆'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium truncate">
                          {userAchievement.achievement.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {userAchievement.achievement.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                  <Trophy className="mx-auto h-8 w-8 mb-2 opacity-50" />
                  <p>Complete tasks to unlock achievements</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
