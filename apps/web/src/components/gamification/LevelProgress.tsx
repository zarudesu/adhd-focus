'use client';

/**
 * Level Progress Component
 * Shows current level and XP progress bar
 * Uses shared state from GamificationProvider
 *
 * Design: Calm, minimal - no flashy icons
 */

import { useGamificationEvents } from './GamificationProvider';
import { Progress } from '@/components/ui/progress';

interface LevelProgressProps {
  compact?: boolean;
}

export function LevelProgress({ compact = false }: LevelProgressProps) {
  const { state, levelProgress, loading } = useGamificationEvents();

  if (loading) {
    return (
      <div className="px-4 py-2">
        <div className="h-6 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (!state) {
    return null;
  }

  const { currentLevel, xpInLevel, xpNeeded, progress } = levelProgress;

  if (compact) {
    return (
      <div className="flex items-center gap-2 px-4 py-2">
        <span className="text-xs text-muted-foreground">L{currentLevel}</span>
        <Progress value={progress} className="h-1.5 flex-1" />
      </div>
    );
  }

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Level {currentLevel}</span>
        <span className="text-xs text-muted-foreground">
          {xpInLevel} / {xpNeeded}
        </span>
      </div>
      <Progress value={progress} className="mt-2 h-1.5" />
    </div>
  );
}
