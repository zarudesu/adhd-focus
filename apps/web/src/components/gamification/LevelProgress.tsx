'use client';

/**
 * Level Progress Component
 * Shows current level and XP progress bar
 * Uses shared state from GamificationProvider
 *
 * Design: Calm, minimal - no flashy icons
 * Animation: Smooth fill + glow + floating "+XP" on task complete
 */

import { useEffect, useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGamificationEvents } from './GamificationProvider';
import { useProfile } from '@/hooks/useProfile';
import { Progress } from '@/components/ui/progress';

interface LevelProgressProps {
  compact?: boolean;
}

export function LevelProgress({ compact = false }: LevelProgressProps) {
  const { state, levelProgress, loading, xpGainEvent } = useGamificationEvents();
  const { profile } = useProfile();
  const [floatingXp, setFloatingXp] = useState<{ amount: number; key: number } | null>(null);
  const [glowing, setGlowing] = useState(false);
  const lastEventRef = useRef<number>(0);

  const celebrationsEnabled = profile?.preferences?.enableCelebrations ?? true;

  useEffect(() => {
    if (!xpGainEvent || !celebrationsEnabled) return;
    if (xpGainEvent.timestamp === lastEventRef.current) return;
    lastEventRef.current = xpGainEvent.timestamp;

    // Defer setState to avoid cascading renders in effect
    const raf = requestAnimationFrame(() => {
      setFloatingXp({ amount: xpGainEvent.amount, key: xpGainEvent.timestamp });
      setGlowing(true);
    });
    const timer = setTimeout(() => setGlowing(false), 1500);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [xpGainEvent, celebrationsEnabled]);

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

  // Ensure we never show 0/0 - minimum xpNeeded is 100 (XP per level)
  const xpInLevel = levelProgress.xpInLevel;
  const xpNeeded = levelProgress.xpNeeded || 100;
  const progress = levelProgress.progress;

  if (compact) {
    return (
      <div className="relative flex items-center gap-2 px-4 py-2">
        <span className="text-xs text-muted-foreground">Mindfulness</span>
        <div className="relative flex-1">
          <Progress
            value={progress}
            className={`h-1.5 transition-all duration-700 ${glowing ? 'xp-glow' : ''}`}
          />
          <AnimatePresence>
            {floatingXp && (
              <motion.span
                key={floatingXp.key}
                initial={{ opacity: 1, y: 0 }}
                animate={{ opacity: 0, y: -20 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
                className="pointer-events-none absolute -top-1 right-0 text-xs font-medium text-primary"
              >
                +{floatingXp.amount} XP
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="relative px-4 py-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Mindfulness</span>
        <span className="text-xs text-muted-foreground">
          {xpInLevel} / {xpNeeded}
        </span>
      </div>
      <div className="relative mt-2">
        <Progress
          value={progress}
          className={`h-1.5 transition-all duration-700 ${glowing ? 'xp-glow' : ''}`}
        />
        <AnimatePresence>
          {floatingXp && (
            <motion.span
              key={floatingXp.key}
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -24 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="pointer-events-none absolute -top-1 right-0 text-xs font-semibold text-primary"
            >
              +{floatingXp.amount} XP
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
