'use client';

/**
 * Achievements Page
 * Design Philosophy: Calm recognition, not celebration
 * Simple display of progress without flashy effects
 */

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { ProtectedRoute } from '@/components/gamification/ProtectedRoute';
import { Trophy, Lock, Check } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  visibility: string;
  xpReward: number | null;
  isUnlocked: boolean;
  unlockedAt: string | null;
  progress: { current: number; target: number } | null;
}

interface AchievementsData {
  achievements: Achievement[];
  stats: {
    total: number;
    unlocked: number;
    visible: number;
  };
}

const categoryLabels: Record<string, string> = {
  progress: 'Progress',
  streak: 'Consistency',
  mastery: 'Mastery',
  hidden: 'Hidden',
  secret: 'Secret',
  ultra_secret: 'Ultra Secret',
};

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const progressPercent = achievement.progress
    ? (achievement.progress.current / achievement.progress.target) * 100
    : 0;

  return (
    <div
      className={cn(
        'rounded-lg border p-4 transition-all',
        achievement.isUnlocked
          ? 'bg-card border-border'
          : 'bg-muted/30 border-border opacity-60'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-xl',
            achievement.isUnlocked ? 'bg-muted' : 'bg-muted text-muted-foreground'
          )}
        >
          {achievement.isUnlocked ? achievement.icon : <Lock className="h-4 w-4" />}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium truncate">{achievement.name}</h3>
            {achievement.isUnlocked && (
              <Check className="h-4 w-4 text-primary flex-shrink-0" />
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
            {achievement.description}
          </p>

          {/* Progress bar for locked achievements */}
          {!achievement.isUnlocked && achievement.progress && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>
                  {achievement.progress.current} / {achievement.progress.target}
                </span>
              </div>
              <Progress value={progressPercent} className="h-1" />
            </div>
          )}

          {/* XP reward and unlock date */}
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            {achievement.xpReward && achievement.xpReward > 0 && (
              <span>+{achievement.xpReward} XP</span>
            )}
            {achievement.isUnlocked && achievement.unlockedAt && (
              <span>
                {new Date(achievement.unlockedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CategorySection({
  category,
  achievements,
}: {
  category: string;
  achievements: Achievement[];
}) {
  const unlocked = achievements.filter((a) => a.isUnlocked).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <h2 className="font-medium">{categoryLabels[category] || category}</h2>
        <span className="text-sm text-muted-foreground">
          {unlocked} / {achievements.length}
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((ach) => (
          <AchievementCard key={ach.id} achievement={ach} />
        ))}
      </div>
    </div>
  );
}

function AchievementsContent() {
  const [data, setData] = useState<AchievementsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAchievements() {
      try {
        const res = await fetch('/api/gamification/achievements');
        if (!res.ok) throw new Error('Failed to fetch achievements');
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load achievements');
      } finally {
        setLoading(false);
      }
    }
    fetchAchievements();
  }, []);

  if (loading) {
    return (
      <>
        <PageHeader title="Achievements" description="Track your progress" />
        <main className="p-4 space-y-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-lg" />
            ))}
          </div>
        </main>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <PageHeader title="Achievements" description="Track your progress" />
        <main className="p-4">
          <div className="text-center py-12">
            <p className="text-muted-foreground">{error || 'Failed to load achievements'}</p>
          </div>
        </main>
      </>
    );
  }

  // Group achievements by category
  const byCategory = data.achievements.reduce(
    (acc, ach) => {
      if (!acc[ach.category]) acc[ach.category] = [];
      acc[ach.category].push(ach);
      return acc;
    },
    {} as Record<string, Achievement[]>
  );

  // Order categories
  const categoryOrder = ['progress', 'streak', 'mastery', 'hidden', 'secret', 'ultra_secret'];
  const sortedCategories = Object.keys(byCategory).sort(
    (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  );

  return (
    <>
      <PageHeader
        title="Achievements"
        description={`${data.stats.unlocked} of ${data.stats.visible} unlocked`}
      />
      <main className="p-4 space-y-8">
        {/* Summary card - simple */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Trophy className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <div className="text-2xl font-bold">
              {data.stats.unlocked} / {data.stats.visible}
            </div>
            <div className="text-sm text-muted-foreground">Achievements</div>
          </div>
          <div className="ml-auto">
            <Progress value={(data.stats.unlocked / data.stats.visible) * 100} className="w-24 h-1.5" />
          </div>
        </div>

        {/* Achievement categories */}
        {sortedCategories.map((category) => (
          <CategorySection key={category} category={category} achievements={byCategory[category]} />
        ))}

        {/* Hidden achievements hint */}
        {data.stats.total > data.stats.visible && (
          <div className="text-center py-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <Lock className="h-4 w-4" />
              {data.stats.total - data.stats.visible} hidden achievements
            </span>
          </div>
        )}
      </main>
    </>
  );
}

export default function AchievementsPage() {
  return (
    <ProtectedRoute featureCode="nav_achievements">
      <AchievementsContent />
    </ProtectedRoute>
  );
}
