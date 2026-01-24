'use client';

/**
 * Statistics Page
 * Shows user's gamification stats, streak, achievements, focus stats
 */

import { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { ProtectedRoute } from '@/components/gamification/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Target, CheckCircle2, Trophy, TrendingUp, Timer, Clock, ListChecks, CalendarCheck } from 'lucide-react';
import { useGamification } from '@/hooks/useGamification';
import { useHabits } from '@/hooks/useHabits';
import { cn } from '@/lib/utils';

// Stats data from API
interface DailyStat {
  date: string;
  tasksCompleted: number;
  pomodorosCompleted: number;
  focusMinutes: number;
  xpEarned: number;
  streakMaintained: boolean;
}

interface StatsData {
  dailyStats: DailyStat[];
  periodTotals: {
    tasksCompleted: number;
    pomodorosCompleted: number;
    focusMinutes: number;
    xpEarned: number;
  };
  allTime: {
    totalPomodoros: number;
    totalFocusMinutes: number;
    totalTasksCompleted: number;
    currentStreak: number;
    longestStreak: number;
  };
}

// Hook to fetch stats data
function useStats(days: number = 7) {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(`/api/stats?days=${days}`);
        if (res.ok) {
          const statsData = await res.json();
          setData(statsData);
        }
      } catch {
        // Ignore errors
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [days]);

  return { data, loading };
}

// Format minutes to hours and minutes
function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

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

// Simple bar chart component for weekly activity
function WeeklyChart({ data, dataKey, label, color }: {
  data: DailyStat[];
  dataKey: 'tasksCompleted' | 'pomodorosCompleted' | 'focusMinutes';
  label: string;
  color: string;
}) {
  const maxValue = useMemo(() => {
    const max = Math.max(...data.map(d => d[dataKey]), 1);
    return max;
  }, [data, dataKey]);

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <div className="flex items-end gap-1 h-16">
        {data.map((day) => {
          const value = day[dataKey];
          const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
          const dayOfWeek = new Date(day.date).getDay();

          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex items-end justify-center h-12">
                <div
                  className={cn(
                    'w-full max-w-6 rounded-t transition-all',
                    color,
                    value === 0 && 'opacity-20'
                  )}
                  style={{ height: `${Math.max(height, 4)}%` }}
                  title={`${day.date}: ${dataKey === 'focusMinutes' ? formatDuration(value) : value}`}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">
                {dayLabels[dayOfWeek]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatsContent() {
  const { state, loading, levelProgress } = useGamification();
  const { count: todayTasksCount, loading: todayLoading } = useTodayTasksCount();
  const wipLimit = useWipLimit();
  const { data: statsData, loading: statsLoading } = useStats(7);
  const { summary: habitSummary, loading: habitsLoading } = useHabits();

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
          {/* Consistency Card - calm, not gamified */}
          <Card>
            <CardHeader>
              <CardTitle>Consistency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground">
                  {state?.currentStreak || 0}
                </div>
                <p className="text-muted-foreground">
                  {state?.currentStreak === 1 ? 'day' : 'days'} in a row
                </p>
                {state?.longestStreak && state.longestStreak > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Longest: {state.longestStreak} days
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
                    {levelProgress.xpInLevel} / {levelProgress.xpNeeded}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Daily Goal</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {todayLoading ? '...' : todayTasksCount}/{wipLimit}
                </div>
                <Progress value={dailyGoalProgress} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Focus Stats */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center gap-2 space-y-0">
                <Timer className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Pomodoros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {statsData?.allTime.totalPomodoros || 0}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {statsData?.periodTotals.pomodorosCompleted || 0} this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-2 space-y-0">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <CardTitle>Focus Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {formatDuration(statsData?.allTime.totalFocusMinutes || 0)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatDuration(statsData?.periodTotals.focusMinutes || 0)} this week
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Habits Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* Today's Habits */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today&apos;s Habits</CardTitle>
                <ListChecks className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {habitsLoading ? '...' : habitSummary.completed}/{habitSummary.habitsForToday}
                </div>
                <Progress value={habitSummary.progress} className="mt-2" />
                {habitSummary.skipped > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {habitSummary.skipped} skipped
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Habit Streak */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Habit Streak</CardTitle>
                <CalendarCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {state?.habitStats?.habitStreak || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {state?.habitStats?.habitStreak === 1 ? 'day' : 'days'} in a row
                </p>
                {state?.habitStats?.longestHabitStreak && state.habitStats.longestHabitStreak > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Longest: {state.habitStats.longestHabitStreak} days
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Total Habits Completed */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Habits Completed</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{state?.habitStats?.habitsCompleted || 0}</div>
                <p className="text-xs text-muted-foreground">total check-ins</p>
                {state?.habitStats?.allHabitsCompletedDays && state.habitStats.allHabitsCompletedDays > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {state.habitStats.allHabitsCompletedDays} complete days
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Weekly Activity */}
          {statsData?.dailyStats && statsData.dailyStats.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Weekly Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <WeeklyChart
                  data={statsData.dailyStats}
                  dataKey="tasksCompleted"
                  label="Tasks Completed"
                  color="bg-primary"
                />
                <WeeklyChart
                  data={statsData.dailyStats}
                  dataKey="pomodorosCompleted"
                  label="Pomodoros"
                  color="bg-primary/70"
                />
                <WeeklyChart
                  data={statsData.dailyStats}
                  dataKey="focusMinutes"
                  label="Focus Minutes"
                  color="bg-primary/50"
                />
              </CardContent>
            </Card>
          )}

          {/* Mindfulness & Creatures */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Mindfulness</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{state?.xp || 0}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Level {state?.level || 1} • {levelProgress.xpNeeded - levelProgress.xpInLevel} to next
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Creatures</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{state?.totalCreatures || 0}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  {state?.creatures?.length || 0} unique species
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Achievements */}
          <Card>
            <CardHeader className="flex flex-row items-center gap-2 space-y-0">
              <Trophy className="h-5 w-5 text-muted-foreground" />
              <CardTitle>Achievements</CardTitle>
              {state?.achievements && state.achievements.length >= 3 && (
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
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-xl">
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

export default function StatsPage() {
  return (
    <ProtectedRoute featureCode="nav_stats">
      <StatsContent />
    </ProtectedRoute>
  );
}
