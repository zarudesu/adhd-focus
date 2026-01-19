'use client';

/**
 * Achievements Page
 * Shows all achievements with shimmer effects (gold/silver/rainbow)
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/layout/page-header';
import { ProtectedRoute } from '@/components/gamification/ProtectedRoute';
import { Trophy, Lock, Check, Sparkles } from 'lucide-react';
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
  streak: 'Streaks',
  mastery: 'Mastery',
  hidden: 'Hidden',
  secret: 'Secret',
  ultra_secret: 'Ultra Secret',
};

// Shimmer types for different categories
const categoryShimmer: Record<string, 'gold' | 'silver' | 'rainbow' | 'bronze'> = {
  progress: 'bronze',
  streak: 'silver',
  mastery: 'gold',
  hidden: 'silver',
  secret: 'gold',
  ultra_secret: 'rainbow',
};

const categoryColors: Record<string, string> = {
  progress: 'from-green-500 to-emerald-600',
  streak: 'from-orange-500 to-red-600',
  mastery: 'from-purple-500 to-indigo-600',
  hidden: 'from-slate-500 to-slate-700',
  secret: 'from-yellow-500 to-amber-600',
  ultra_secret: 'from-pink-500 to-rose-600',
};

// Shimmer sparkle component
function ShimmerSparkle({ shimmerType }: { shimmerType: 'gold' | 'silver' | 'rainbow' | 'bronze' }) {
  const colors = {
    gold: ['#fbbf24', '#f59e0b', '#fcd34d'],
    silver: ['#e5e7eb', '#d1d5db', '#f3f4f6'],
    rainbow: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'],
    bronze: ['#cd7f32', '#b87333', '#da9048'],
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
      {/* Shimmer sweep */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: shimmerType === 'rainbow'
            ? 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)'
            : `linear-gradient(90deg, transparent 0%, ${colors[shimmerType][1]}40 50%, transparent 100%)`,
        }}
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 3,
          ease: 'easeInOut',
        }}
      />

      {/* Sparkle particles */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${20 + Math.random() * 60}%`,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 0.8,
            delay: 2 + i * 0.2 + Math.random() * 0.5,
            repeat: Infinity,
            repeatDelay: 4,
          }}
        >
          <Sparkles
            className="h-3 w-3"
            style={{
              color: colors[shimmerType][i % colors[shimmerType].length],
              filter: `drop-shadow(0 0 4px ${colors[shimmerType][i % colors[shimmerType].length]})`,
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}

// Rainbow border animation for ultra secret
function RainbowBorder() {
  return (
    <motion.div
      className="absolute inset-0 rounded-lg pointer-events-none"
      style={{
        padding: '2px',
        background: 'linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6, #ef4444)',
        backgroundSize: '200% 100%',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
      }}
      animate={{
        backgroundPosition: ['0% 0%', '200% 0%'],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
}

// Metallic shine effect for icon
function MetallicIcon({
  icon,
  shimmerType,
  gradientClass,
}: {
  icon: string;
  shimmerType: 'gold' | 'silver' | 'rainbow' | 'bronze';
  gradientClass: string;
}) {
  const metallicGradients = {
    gold: 'from-yellow-300 via-yellow-500 to-amber-600',
    silver: 'from-slate-200 via-slate-400 to-slate-500',
    rainbow: 'from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500',
    bronze: 'from-orange-300 via-orange-500 to-orange-700',
  };

  return (
    <motion.div
      className={cn(
        'relative flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-2xl overflow-hidden',
        `bg-gradient-to-br ${gradientClass} text-white shadow-lg`
      )}
      whileHover={{ scale: 1.1, rotate: 5 }}
      transition={{ type: 'spring', stiffness: 400 }}
    >
      {/* Metallic overlay */}
      <motion.div
        className={cn(
          'absolute inset-0 opacity-50',
          `bg-gradient-to-br ${metallicGradients[shimmerType]}`
        )}
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Shine sweep */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.6) 50%, transparent 60%)',
        }}
        initial={{ x: '-100%' }}
        animate={{ x: '200%' }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatDelay: 2,
          ease: 'easeInOut',
        }}
      />

      <span className="relative z-10">{icon}</span>
    </motion.div>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const gradientClass = categoryColors[achievement.category] || 'from-blue-500 to-purple-600';
  const shimmerType = categoryShimmer[achievement.category] || 'bronze';
  const progressPercent = achievement.progress
    ? (achievement.progress.current / achievement.progress.target) * 100
    : 0;

  const isUltraSecret = achievement.category === 'ultra_secret';

  return (
    <motion.div
      className={cn(
        'relative overflow-hidden rounded-lg border transition-all duration-200',
        achievement.isUnlocked
          ? 'bg-card border-primary/20 shadow-md'
          : 'bg-muted/30 border-border opacity-70 hover:opacity-90'
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={achievement.isUnlocked ? { y: -2, scale: 1.02 } : {}}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {/* Rainbow border for ultra secret */}
      {achievement.isUnlocked && isUltraSecret && <RainbowBorder />}

      {/* Shimmer effect for unlocked achievements */}
      {achievement.isUnlocked && <ShimmerSparkle shimmerType={shimmerType} />}

      {/* Unlocked badge gradient */}
      {achievement.isUnlocked && (
        <motion.div
          className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradientClass}`}
          layoutId={`badge-${achievement.id}`}
        />
      )}

      <div className="p-4 relative z-10">
        <div className="flex items-start gap-3">
          {/* Icon */}
          {achievement.isUnlocked ? (
            <MetallicIcon
              icon={achievement.icon}
              shimmerType={shimmerType}
              gradientClass={gradientClass}
            />
          ) : (
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Lock className="h-5 w-5" />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3
                className={cn(
                  'font-semibold truncate',
                  achievement.isUnlocked ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {achievement.name}
              </h3>
              {achievement.isUnlocked && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                >
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                </motion.div>
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
                <Progress value={progressPercent} className="h-1.5" />
              </div>
            )}

            {/* XP reward and unlock date */}
            <div className="flex items-center gap-3 mt-2 text-xs">
              {achievement.xpReward && achievement.xpReward > 0 && (
                <motion.span
                  className={cn(
                    'flex items-center gap-1',
                    achievement.isUnlocked ? 'text-primary' : 'text-muted-foreground'
                  )}
                  animate={
                    achievement.isUnlocked
                      ? {
                          color: ['hsl(var(--primary))', 'hsl(45, 100%, 50%)', 'hsl(var(--primary))'],
                        }
                      : {}
                  }
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="h-3 w-3" />+{achievement.xpReward} XP
                </motion.span>
              )}
              {achievement.isUnlocked && achievement.unlockedAt && (
                <span className="text-muted-foreground">
                  Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
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
  const gradientClass = categoryColors[category] || 'from-blue-500 to-purple-600';

  return (
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-3">
        <div className={`h-6 w-1 rounded-full bg-gradient-to-b ${gradientClass}`} />
        <h2 className="font-semibold text-lg">{categoryLabels[category] || category}</h2>
        <span className="text-sm text-muted-foreground">
          {unlocked} / {achievements.length}
        </span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {achievements.map((ach, index) => (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <AchievementCard achievement={ach} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Trophy with shimmer for summary card
function ShimmeringTrophy() {
  return (
    <motion.div
      className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 overflow-hidden"
      whileHover={{ scale: 1.1, rotate: 10 }}
    >
      {/* Metallic shine */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.8) 50%, transparent 70%)',
        }}
        animate={{ x: ['-150%', '150%'] }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatDelay: 1,
          ease: 'easeInOut',
        }}
      />

      <Trophy className="h-7 w-7 text-white relative z-10" />

      {/* Sparkles around */}
      {[0, 1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            top: ['10%', '10%', '80%', '80%'][i],
            left: ['10%', '80%', '10%', '80%'][i],
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 0.6,
            delay: i * 0.3,
            repeat: Infinity,
            repeatDelay: 2,
          }}
        >
          <Sparkles className="h-3 w-3 text-yellow-200" />
        </motion.div>
      ))}
    </motion.div>
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
        <PageHeader title="Achievements" description="Track your progress and unlock rewards" />
        <main className="p-4 space-y-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-lg" />
            ))}
          </div>
        </main>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <PageHeader title="Achievements" description="Track your progress and unlock rewards" />
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
        description={`${data.stats.unlocked} of ${data.stats.visible} achievements unlocked`}
      />
      <main className="p-4 space-y-8">
        {/* Summary card with shimmering trophy */}
        <motion.div
          className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 overflow-hidden relative"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Background shimmer */}
          <motion.div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255,215,0,0.1) 50%, transparent 100%)',
            }}
            animate={{ x: ['-100%', '200%'] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatDelay: 2,
              ease: 'easeInOut',
            }}
          />

          <ShimmeringTrophy />

          <div className="relative z-10">
            <div className="text-2xl font-bold">
              {data.stats.unlocked} / {data.stats.visible}
            </div>
            <div className="text-sm text-muted-foreground">Achievements Unlocked</div>
          </div>
          <div className="ml-auto relative z-10">
            <Progress value={(data.stats.unlocked / data.stats.visible) * 100} className="w-32 h-2" />
          </div>
        </motion.div>

        {/* Achievement categories */}
        {sortedCategories.map((category) => (
          <CategorySection key={category} category={category} achievements={byCategory[category]} />
        ))}

        {/* Hidden achievements hint */}
        {data.stats.total > data.stats.visible && (
          <motion.div
            className="text-center py-4 text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span className="inline-flex items-center gap-2">
              <Lock className="h-4 w-4" />
              {data.stats.total - data.stats.visible} secret achievements remain hidden...
            </span>
          </motion.div>
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
