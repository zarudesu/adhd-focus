'use client';

/**
 * Achievement Toast Component
 * beatyour8 Brand: Calm, minimal celebration
 * No shimmer, no rainbow - just a simple acknowledgment
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { X, Trophy } from 'lucide-react';
import type { Achievement } from '@/db/schema';
import { cn } from '@/lib/utils';

const TOAST_DURATION = 3000;

interface AchievementToastProps {
  achievement: Achievement;
  onClose: () => void;
}

export function AchievementToast({ achievement, onClose }: AchievementToastProps) {
  const [isExiting, setIsExiting] = useState(false);
  const isMountedRef = useRef(true);
  const onCloseRef = useRef(onClose);

  // Keep onClose ref updated (in effect, not during render)
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const handleClose = useCallback(() => {
    if (!isMountedRef.current) return;
    setIsExiting(true);
    setTimeout(() => {
      if (isMountedRef.current) {
        onCloseRef.current();
      }
    }, 200);
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    const closeTimer = setTimeout(() => {
      handleClose();
    }, TOAST_DURATION);

    return () => {
      isMountedRef.current = false;
      clearTimeout(closeTimer);
    };
  }, [handleClose]);

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-[100] max-w-sm",
        isExiting ? "animate-slide-out-right" : "animate-slide-in-right"
      )}
    >
      <div className="relative overflow-hidden rounded-lg border border-border bg-card shadow-lg">
        {/* Content */}
        <div className="p-4 flex items-start gap-3">
          {/* Success icon - Calm Mint */}
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
            <span className="text-xl">{achievement.icon || '✓'}</span>
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-medium">
              Unlocked
            </p>
            <p className="font-medium text-foreground truncate">
              {achievement.name}
            </p>
            {achievement.description && (
              <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                {achievement.description}
              </p>
            )}
            {achievement.xpReward && achievement.xpReward > 0 && (
              <p className="text-xs text-success mt-1 font-medium">
                +{achievement.xpReward} mindfulness
              </p>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1 rounded hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-muted">
          <div
            className="h-full bg-success animate-shrink-width"
            style={{ animationDuration: `${TOAST_DURATION}ms` }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Batch Achievement Toast — "and N more achievements unlocked"
 */
function BatchAchievementToast({ count, onClose }: { count: number; onClose: () => void }) {
  const [isExiting, setIsExiting] = useState(false);
  const isMountedRef = useRef(true);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const handleClose = useCallback(() => {
    if (!isMountedRef.current) return;
    setIsExiting(true);
    setTimeout(() => {
      if (isMountedRef.current) {
        onCloseRef.current();
      }
    }, 200);
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    const closeTimer = setTimeout(() => handleClose(), TOAST_DURATION);
    return () => {
      isMountedRef.current = false;
      clearTimeout(closeTimer);
    };
  }, [handleClose]);

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-[100] max-w-sm",
        isExiting ? "animate-slide-out-right" : "animate-slide-in-right"
      )}
    >
      <div className="relative overflow-hidden rounded-lg border border-border bg-card shadow-lg">
        <div className="p-4 flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
            <Trophy className="h-5 w-5 text-success" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground">
              +{count} more unlocked
            </p>
            <a
              href="/dashboard/achievements"
              className="text-sm text-primary hover:underline"
              onClick={(e) => { e.stopPropagation(); }}
            >
              View all achievements
            </a>
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1 rounded hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="h-0.5 bg-muted">
          <div
            className="h-full bg-success animate-shrink-width"
            style={{ animationDuration: `${TOAST_DURATION}ms` }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Achievement Toast Stack - manages individual + batch toasts
 */
interface AchievementToastStackProps {
  achievements: Achievement[];
  onDismiss: (code: string) => void;
  batchCount?: number;
  onDismissBatch?: () => void;
}

export function AchievementToastStack({ achievements, onDismiss, batchCount = 0, onDismissBatch }: AchievementToastStackProps) {
  // Show individual achievements first
  if (achievements.length > 0) {
    const currentAchievement = achievements[0];
    return (
      <AchievementToast
        key={currentAchievement.code}
        achievement={currentAchievement}
        onClose={() => onDismiss(currentAchievement.code)}
      />
    );
  }

  // After all individual toasts, show batch summary
  if (batchCount > 0 && onDismissBatch) {
    return (
      <BatchAchievementToast
        key="batch-summary"
        count={batchCount}
        onClose={onDismissBatch}
      />
    );
  }

  return null;
}
