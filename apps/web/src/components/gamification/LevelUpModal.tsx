'use client';

/**
 * Level Up Modal
 * Celebratory modal shown when user levels up
 */

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Star, Trophy, Zap } from 'lucide-react';

interface LevelUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newLevel: number;
  unlockedFeatures?: string[];
}

// Feature names for display
const FEATURE_NAMES: Record<string, string> = {
  today: 'Today View',
  priority: 'Task Priority',
  energy: 'Energy Levels',
  projects: 'Projects',
  scheduled: 'Scheduled Tasks',
  description: 'Task Descriptions',
  quick_actions: 'Quick Actions',
  tags: 'Tags',
  focus_mode: 'Focus Mode',
  stats: 'Statistics',
  themes: 'Themes',
  settings: 'Settings',
  notifications: 'Notifications',
  advanced_stats: 'Advanced Statistics',
};

export function LevelUpModal({
  open,
  onOpenChange,
  newLevel,
  unlockedFeatures = [],
}: LevelUpModalProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (open) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500">
            <Trophy className="h-10 w-10 text-white" />
          </div>
          <DialogTitle className="text-2xl">
            <span className="flex items-center justify-center gap-2">
              <Sparkles className="h-6 w-6 text-yellow-500" />
              Level {newLevel}!
              <Sparkles className="h-6 w-6 text-yellow-500" />
            </span>
          </DialogTitle>
          <DialogDescription className="text-base">
            Congratulations! You&apos;ve reached a new level.
          </DialogDescription>
        </DialogHeader>

        {unlockedFeatures.length > 0 && (
          <div className="mt-4 rounded-lg bg-muted p-4">
            <div className="mb-2 flex items-center gap-2 font-medium">
              <Zap className="h-4 w-4 text-primary" />
              New Features Unlocked!
            </div>
            <ul className="space-y-1">
              {unlockedFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <Star className="h-3 w-3 text-yellow-500" />
                  {FEATURE_NAMES[feature] || feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-4 flex justify-center">
          <Button onClick={() => onOpenChange(false)} size="lg">
            Continue
          </Button>
        </div>

        {/* Simple confetti effect */}
        {showConfetti && (
          <div className="pointer-events-none fixed inset-0 overflow-hidden">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="absolute animate-fall"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-20px',
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                }}
              >
                <span
                  className="block h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: ['#fbbf24', '#f59e0b', '#ef4444', '#22c55e', '#3b82f6', '#a855f7'][
                      Math.floor(Math.random() * 6)
                    ],
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
