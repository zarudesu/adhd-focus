'use client';

/**
 * Level Progress Component
 * Shows current level and XP progress bar
 * Uses shared state from GamificationProvider
 */

import { useGamificationEvents } from './GamificationProvider';
import { Progress } from '@/components/ui/progress';
import { Sparkles } from 'lucide-react';

interface LevelProgressProps {
  compact?: boolean;
}

export function LevelProgress({ compact = false }: LevelProgressProps) {
  const { state, levelProgress, loading } = useGamificationEvents();

  if (loading) {
    return (
      <div className="px-4 py-2">
        <div className="h-8 animate-pulse rounded bg-muted" />
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
        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
          {currentLevel}
        </div>
        <Progress value={progress} className="h-2 flex-1" />
      </div>
    );
  }

  return (
    <div className="px-4 py-3">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="font-medium">Level {currentLevel}</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {xpInLevel} / {xpNeeded} XP
        </span>
      </div>
      <Progress value={progress} className="mt-2 h-2" />
      <div className="mt-1 text-xs text-muted-foreground">
        {state.xp.toLocaleString()} total XP
      </div>
    </div>
  );
}
