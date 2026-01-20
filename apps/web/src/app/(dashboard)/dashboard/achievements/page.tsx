'use client';

/**
 * Achievements Page
 * Design Philosophy: Calm recognition, not celebration
 * Subtle shimmer effects for unlocked achievements
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

// Get tier based on category and XP reward
function getAchievementTier(ach: Achievement): 'bronze' | 'silver' | 'gold' {
  // Secret/ultra_secret/mastery = gold
  if (['mastery', 'secret', 'ultra_secret'].includes(ach.category)) return 'gold';
  // Streak achievements = silver
  if (ach.category === 'streak') return 'silver';
  // High XP rewards = gold, medium = silver, low = bronze
  const xp = ach.xpReward || 0;
  if (xp >= 100) return 'gold';
  if (xp >= 50) return 'silver';
  return 'bronze';
}

// Tier colors for unlocked achievements
const tierStyles: Record<string, { border: string; bg: string; shimmer: string }> = {
  bronze: {
    border: 'border-amber-600/30',
    bg: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20',
    shimmer: 'before:from-amber-200/0 before:via-amber-200/30 before:to-amber-200/0',
  },
  silver: {
    border: 'border-slate-400/40',
    bg: 'bg-gradient-to-br from-slate-50 to-zinc-100 dark:from-slate-900/30 dark:to-zinc-900/30',
    shimmer: 'before:from-slate-200/0 before:via-slate-200/40 before:to-slate-200/0',
  },
  gold: {
    border: 'border-yellow-500/40',
    bg: 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30',
    shimmer: 'before:from-yellow-200/0 before:via-yellow-200/50 before:to-yellow-200/0',
  },
};

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const progressPercent = achievement.progress
    ? (achievement.progress.current / achievement.progress.target) * 100
    : 0;

  const tier = getAchievementTier(achievement);
  const style = tierStyles[tier];

  return (
    <div
      className={cn(
        'relative rounded-lg border p-4 transition-all overflow-hidden',
        achievement.isUnlocked
          ? cn(
              style.bg,
              style.border,
              // Subtle shimmer animation for unlocked
              'before:absolute before:inset-0 before:bg-gradient-to-r',
              style.shimmer,
              'before:animate-shimmer before:-translate-x-full'
            )
          : 'bg-muted/30 border-border opacity-60'
      )}
    >
      <div className="relative flex items-start gap-3">
        {/* Icon */}
        <div
          className={cn(
            'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-xl',
            achievement.isUnlocked
              ? tier === 'gold'
                ? 'bg-yellow-100 dark:bg-yellow-900/30'
                : tier === 'silver'
                  ? 'bg-slate-100 dark:bg-slate-800/50'
                  : 'bg-amber-100 dark:bg-amber-900/30'
              : 'bg-muted text-muted-foreground'
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

          {/* Mindfulness reward and unlock date */}
          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            {achievement.xpReward && achievement.xpReward > 0 && (
              <span>+{achievement.xpReward} mindfulness</span>
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

  // Separate unlocked and locked achievements
  const unlockedAchievements = data.achievements.filter(a => a.isUnlocked);
  const lockedWithProgress = data.achievements.filter(a => !a.isUnlocked && a.progress);
  const lockedNoProgress = data.achievements.filter(a => !a.isUnlocked && !a.progress);

  // Sort unlocked by tier (gold first) then by unlock date
  const tierOrder = { gold: 0, silver: 1, bronze: 2 };
  unlockedAchievements.sort((a, b) => {
    const tierDiff = tierOrder[getAchievementTier(a)] - tierOrder[getAchievementTier(b)];
    if (tierDiff !== 0) return tierDiff;
    // Then by unlock date (most recent first)
    const dateA = a.unlockedAt ? new Date(a.unlockedAt).getTime() : 0;
    const dateB = b.unlockedAt ? new Date(b.unlockedAt).getTime() : 0;
    return dateB - dateA;
  });

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

        {/* Unlocked achievements - shown first */}
        {unlockedAchievements.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h2 className="font-medium">Unlocked</h2>
              <span className="text-sm text-muted-foreground">
                {unlockedAchievements.length}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {unlockedAchievements.map((ach) => (
                <AchievementCard key={ach.id} achievement={ach} />
              ))}
            </div>
          </div>
        )}

        {/* In Progress achievements */}
        {lockedWithProgress.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h2 className="font-medium">In Progress</h2>
              <span className="text-sm text-muted-foreground">
                {lockedWithProgress.length}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {lockedWithProgress.map((ach) => (
                <AchievementCard key={ach.id} achievement={ach} />
              ))}
            </div>
          </div>
        )}

        {/* Locked achievements */}
        {lockedNoProgress.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <h2 className="font-medium">Locked</h2>
              <span className="text-sm text-muted-foreground">
                {lockedNoProgress.length}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {lockedNoProgress.map((ach) => (
                <AchievementCard key={ach.id} achievement={ach} />
              ))}
            </div>
          </div>
        )}

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
