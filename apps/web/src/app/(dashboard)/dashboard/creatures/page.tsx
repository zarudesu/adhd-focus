'use client';

/**
 * Creatures Collection Page
 * Shows all creatures with catch status
 */

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { ProtectedRoute } from '@/components/gamification/ProtectedRoute';
import { Lock, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { CreatureCardSkeleton } from '@/components/ui/skeletons';
import { cn } from '@/lib/utils';

interface CreatureData {
  id: string;
  code: string;
  name: string;
  emoji: string;
  description: string | null;
  rarity: string | null;
  isCaught: boolean;
  count: number;
  firstCaughtAt: string | null;
  xpMultiplier: number | null;
}

interface CreaturesResponse {
  creatures: CreatureData[];
  stats: {
    total: number;
    caught: number;
    totalCreaturesCaught: number;
    byRarity: Record<string, { total: number; caught: number }>;
  };
}

const rarityColors: Record<string, string> = {
  common: 'from-slate-400 to-slate-500',
  uncommon: 'from-green-400 to-emerald-500',
  rare: 'from-blue-400 to-indigo-500',
  legendary: 'from-purple-400 to-violet-500',
  mythic: 'from-amber-400 to-orange-500',
  secret: 'from-pink-400 to-rose-500',
};

const rarityLabels: Record<string, string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  legendary: 'Legendary',
  mythic: 'Mythic',
  secret: 'Secret',
};

const rarityOrder = ['common', 'uncommon', 'rare', 'legendary', 'mythic', 'secret'];

function CreatureCard({ creature }: { creature: CreatureData }) {
  const rarity = creature.rarity || 'common';
  const gradientClass = rarityColors[rarity] || rarityColors.common;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border transition-all duration-200',
        creature.isCaught
          ? 'bg-card border-primary/20 shadow-md hover:shadow-lg'
          : 'bg-muted/30 border-border opacity-50'
      )}
    >
      {/* Rarity indicator */}
      {creature.isCaught && (
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradientClass}`} />
      )}

      <div className="p-4 text-center">
        {/* Creature emoji */}
        <div
          className={cn(
            'mx-auto w-20 h-20 flex items-center justify-center rounded-full text-5xl mb-3',
            creature.isCaught
              ? `bg-gradient-to-br ${gradientClass} shadow-lg`
              : 'bg-muted'
          )}
        >
          {creature.isCaught ? (
            creature.emoji
          ) : (
            <Lock className="h-8 w-8 text-muted-foreground" />
          )}
        </div>

        {/* Name */}
        <h3 className={cn(
          'font-semibold text-sm',
          creature.isCaught ? 'text-foreground' : 'text-muted-foreground'
        )}>
          {creature.isCaught ? creature.name : '???'}
        </h3>

        {/* Rarity badge */}
        <span className={cn(
          'inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium',
          creature.isCaught
            ? `bg-gradient-to-r ${gradientClass} text-white`
            : 'bg-muted text-muted-foreground'
        )}>
          {rarityLabels[rarity]}
        </span>

        {/* Count for caught creatures */}
        {creature.isCaught && creature.count > 1 && (
          <div className="mt-2 text-xs text-muted-foreground">
            x{creature.count} caught
          </div>
        )}

        {/* Description (only for caught) */}
        {creature.isCaught && creature.description && (
          <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
            {creature.description}
          </p>
        )}

        {/* Mindfulness multiplier */}
        {creature.isCaught && creature.xpMultiplier && creature.xpMultiplier > 100 && (
          <div className="mt-2 flex items-center justify-center gap-1 text-xs text-primary">
            <Sparkles className="h-3 w-3" />
            {(creature.xpMultiplier / 100).toFixed(1)}x mindfulness
          </div>
        )}
      </div>
    </div>
  );
}

function RaritySection({
  rarity,
  creatures,
}: {
  rarity: string;
  creatures: CreatureData[];
}) {
  const caught = creatures.filter((c) => c.isCaught).length;
  const gradientClass = rarityColors[rarity] || rarityColors.common;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className={`h-6 w-1 rounded-full bg-gradient-to-b ${gradientClass}`} />
        <h2 className="font-semibold text-lg">
          {rarityLabels[rarity] || rarity}
        </h2>
        <span className="text-sm text-muted-foreground">
          {caught} / {creatures.length}
        </span>
      </div>
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {creatures.map((creature) => (
          <CreatureCard key={creature.id} creature={creature} />
        ))}
      </div>
    </div>
  );
}

function CreaturesContent() {
  const [data, setData] = useState<CreaturesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCreatures() {
      try {
        const res = await fetch('/api/gamification/creatures');
        if (!res.ok) throw new Error('Failed to fetch creatures');
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load creatures');
      } finally {
        setLoading(false);
      }
    }
    fetchCreatures();
  }, []);

  if (loading) {
    return (
      <>
        <PageHeader
          title="Creatures"
          description="Your creature collection"
        />
        <main className="p-4 space-y-6">
          <Skeleton className="h-24" />
          <Skeleton className="h-4" />
          <div className="space-y-6">
            <div>
              <Skeleton className="h-6 w-32 mb-3" />
              <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <CreatureCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <PageHeader
          title="Creatures"
          description="Your creature collection"
        />
        <main className="p-4">
          <div className="text-center py-12">
            <p className="text-muted-foreground">{error || 'Failed to load creatures'}</p>
          </div>
        </main>
      </>
    );
  }

  // Group creatures by rarity
  const byRarity = data.creatures.reduce((acc, creature) => {
    const rarity = creature.rarity || 'common';
    if (!acc[rarity]) acc[rarity] = [];
    acc[rarity].push(creature);
    return acc;
  }, {} as Record<string, CreatureData[]>);

  // Sort by rarity order
  const sortedRarities = rarityOrder.filter((r) => byRarity[r]?.length > 0);

  const progressPercent = data.stats.total > 0
    ? (data.stats.caught / data.stats.total) * 100
    : 0;

  return (
    <>
      <PageHeader
        title="Creatures"
        description={`${data.stats.caught} of ${data.stats.total} creatures discovered`}
      />
      <main className="p-4 space-y-8">
        {/* Summary card */}
        <div className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-500/20 text-3xl">
            {data.creatures.find(c => c.isCaught)?.emoji || '?'}
          </div>
          <div className="flex-1">
            <div className="text-2xl font-bold">
              {data.stats.caught} / {data.stats.total}
            </div>
            <div className="text-sm text-muted-foreground">
              Creatures Discovered
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-muted-foreground">
              {data.stats.totalCreaturesCaught}
            </div>
            <div className="text-xs text-muted-foreground">
              Total Caught
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <Progress value={progressPercent} className="h-2" />
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>Collection Progress</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
        </div>

        {/* Creatures by rarity */}
        {sortedRarities.map((rarity) => (
          <RaritySection
            key={rarity}
            rarity={rarity}
            creatures={byRarity[rarity]}
          />
        ))}

        {/* Empty state */}
        {data.stats.caught === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">?</div>
            <h3 className="text-lg font-semibold mb-2">No creatures yet!</h3>
            <p className="text-muted-foreground">
              Complete tasks to discover creatures. They appear randomly when you finish tasks!
            </p>
          </div>
        )}
      </main>
    </>
  );
}

export default function CreaturesPage() {
  return (
    <ProtectedRoute featureCode="nav_creatures">
      <CreaturesContent />
    </ProtectedRoute>
  );
}
