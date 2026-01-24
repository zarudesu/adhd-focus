'use client';

/**
 * Achievements Page - Redesigned
 * Two-column layout: list on left, sparkling trophy on right
 * Trophy shows count of new (unseen) achievements
 */

import { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { ProtectedRoute } from '@/components/gamification/ProtectedRoute';
import { Trophy, Lock, Check, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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

// LocalStorage key for seen achievements
const SEEN_ACHIEVEMENTS_KEY = 'adhd-focus-seen-achievements';

function getSeenAchievements(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  const stored = localStorage.getItem(SEEN_ACHIEVEMENTS_KEY);
  if (!stored) return new Set();
  try {
    return new Set(JSON.parse(stored));
  } catch {
    return new Set();
  }
}

function markAchievementsSeen(ids: string[]) {
  const current = getSeenAchievements();
  ids.forEach(id => current.add(id));
  localStorage.setItem(SEEN_ACHIEVEMENTS_KEY, JSON.stringify([...current]));
}

// Get tier based on category and XP reward
function getAchievementTier(ach: Achievement): 'bronze' | 'silver' | 'gold' {
  if (['mastery', 'secret', 'ultra_secret'].includes(ach.category)) return 'gold';
  if (ach.category === 'streak') return 'silver';
  const xp = ach.xpReward || 0;
  if (xp >= 100) return 'gold';
  if (xp >= 50) return 'silver';
  return 'bronze';
}

// Tier styles
const tierStyles: Record<string, { border: string; bg: string; icon: string }> = {
  bronze: {
    border: 'border-amber-600/30',
    bg: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20',
    icon: 'bg-amber-100 dark:bg-amber-900/30',
  },
  silver: {
    border: 'border-slate-400/40',
    bg: 'bg-gradient-to-br from-slate-50 to-zinc-100 dark:from-slate-900/30 dark:to-zinc-900/30',
    icon: 'bg-slate-100 dark:bg-slate-800/50',
  },
  gold: {
    border: 'border-yellow-500/40',
    bg: 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30',
    icon: 'bg-yellow-100 dark:bg-yellow-900/30',
  },
};

function AchievementRow({ achievement, isNew }: { achievement: Achievement; isNew: boolean }) {
  const tier = getAchievementTier(achievement);
  const style = tierStyles[tier];
  const progressPercent = achievement.progress
    ? (achievement.progress.current / achievement.progress.target) * 100
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border transition-all',
        achievement.isUnlocked
          ? cn(style.bg, style.border)
          : 'bg-muted/20 border-border/50 opacity-60'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-lg',
          achievement.isUnlocked ? style.icon : 'bg-muted text-muted-foreground'
        )}
      >
        {achievement.isUnlocked ? achievement.icon : <Lock className="h-4 w-4" />}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{achievement.name}</span>
          {achievement.isUnlocked && <Check className="h-4 w-4 text-primary flex-shrink-0" />}
          {isNew && (
            <Badge variant="default" className="text-[10px] px-1.5 py-0 h-4 bg-primary">
              NEW
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">{achievement.description}</p>

        {/* Progress for locked */}
        {!achievement.isUnlocked && achievement.progress && (
          <div className="mt-1.5 flex items-center gap-2">
            <Progress value={progressPercent} className="h-1 flex-1" />
            <span className="text-[10px] text-muted-foreground">
              {achievement.progress.current}/{achievement.progress.target}
            </span>
          </div>
        )}
      </div>

      {/* Date or XP */}
      <div className="text-right flex-shrink-0">
        {achievement.isUnlocked && achievement.unlockedAt ? (
          <span className="text-xs text-muted-foreground">
            {new Date(achievement.unlockedAt).toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'short',
            })}
          </span>
        ) : achievement.xpReward ? (
          <span className="text-xs text-muted-foreground">+{achievement.xpReward}</span>
        ) : null}
      </div>
    </motion.div>
  );
}

// Pre-generated sparkle positions (stable, no Math.random during render)
const SPARKLE_POSITIONS = [
  { left: '25%', top: '15%' },
  { left: '70%', top: '25%' },
  { left: '35%', top: '55%' },
  { left: '65%', top: '45%' },
  { left: '45%', top: '20%' },
  { left: '55%', top: '65%' },
];

// Sparkling Trophy Component
function SparklingTrophy({ unlockedCount, totalCount, newCount }: {
  unlockedCount: number;
  totalCount: number;
  newCount: number;
}) {
  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Sparkle particles */}
      <div className="absolute inset-0 overflow-hidden">
        {SPARKLE_POSITIONS.map((pos, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={pos}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              rotate: [0, 180],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.4,
              ease: 'easeInOut',
            }}
          >
            <Sparkles className="h-4 w-4 text-yellow-400" />
          </motion.div>
        ))}
      </div>

      {/* Trophy with glow */}
      <motion.div
        className="relative"
        animate={{
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 blur-2xl bg-yellow-400/30 rounded-full scale-150" />

        {/* Trophy */}
        <div className="relative h-32 w-32 flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg shadow-yellow-500/30">
          <Trophy className="h-16 w-16 text-white drop-shadow-md" />
        </div>

        {/* New achievements badge */}
        <AnimatePresence>
          {newCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-1 -right-1 h-8 w-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-lg"
            >
              {newCount}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Stats below trophy */}
      <div className="mt-6 text-center">
        <motion.div
          className="text-4xl font-bold"
          key={unlockedCount}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
        >
          {unlockedCount}
        </motion.div>
        <div className="text-sm text-muted-foreground">
          of {totalCount} achievements
        </div>
        <Progress
          value={(unlockedCount / totalCount) * 100}
          className="w-32 h-1.5 mt-3 mx-auto"
        />
      </div>
    </div>
  );
}

function AchievementsContent() {
  const [data, setData] = useState<AchievementsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load seen achievements from localStorage
    setSeenIds(getSeenAchievements());
  }, []);

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

  // Mark all current unlocked achievements as seen when viewing page
  useEffect(() => {
    if (data) {
      const unlockedIds = data.achievements
        .filter(a => a.isUnlocked)
        .map(a => a.id);

      // Delay marking as seen so user can see "NEW" badges briefly
      const timer = setTimeout(() => {
        markAchievementsSeen(unlockedIds);
        setSeenIds(getSeenAchievements());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [data]);

  // Filter to only unlocked achievements, sorted by date (most recent first)
  const sortedAchievements = useMemo(() => {
    if (!data) return [];

    // Only show unlocked achievements
    return data.achievements
      .filter(a => a.isUnlocked)
      .sort((a, b) => {
        // Sort by date (most recent first)
        const dateA = a.unlockedAt ? new Date(a.unlockedAt).getTime() : 0;
        const dateB = b.unlockedAt ? new Date(b.unlockedAt).getTime() : 0;
        return dateB - dateA;
      });
  }, [data]);

  // Count new (unseen) achievements
  const newCount = useMemo(() => {
    if (!data) return 0;
    return data.achievements.filter(a => a.isUnlocked && !seenIds.has(a.id)).length;
  }, [data, seenIds]);

  if (loading) {
    return (
      <>
        <PageHeader title="Achievements" description="Track your progress" />
        <main className="p-4">
          <div className="animate-pulse space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-muted rounded-lg" />
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

  return (
    <>
      <PageHeader
        title="Achievements"
        description={data.stats.unlocked >= 3 ? `${data.stats.unlocked} of ${data.stats.visible} unlocked` : 'Your progress milestones'}
      />
      <main className="p-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Achievement list */}
          <div className="flex-1 space-y-2 order-2 lg:order-1">
            {sortedAchievements.length === 0 ? (
              <div className="text-center py-12">
                <Trophy className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  Complete tasks to earn achievements
                </p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Your progress milestones will appear here
                </p>
              </div>
            ) : (
              <AnimatePresence>
                {sortedAchievements.map((ach, index) => (
                  <motion.div
                    key={ach.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <AchievementRow
                      achievement={ach}
                      isNew={ach.isUnlocked && !seenIds.has(ach.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {/* Hidden achievements hint */}
            {data.stats.total > data.stats.visible && sortedAchievements.length > 0 && (
              <div className="text-center py-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  More achievements to discover
                </span>
              </div>
            )}
          </div>

          {/* Right: Sparkling Trophy */}
          <div className="lg:w-64 flex items-start justify-center order-1 lg:order-2 py-8 lg:py-12 lg:sticky lg:top-4">
            <SparklingTrophy
              unlockedCount={data.stats.unlocked}
              totalCount={data.stats.visible}
              newCount={newCount}
            />
          </div>
        </div>
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
