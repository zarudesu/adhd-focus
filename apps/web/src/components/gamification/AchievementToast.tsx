'use client';

/**
 * Achievement Toast Component
 * beatyour8 Brand: Calm, minimal celebration
 * No shimmer, no rainbow - just a simple acknowledgment
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { X, Check } from 'lucide-react';
import type { Achievement } from '@/db/schema';
import { cn } from '@/lib/utils';

interface AchievementToastProps {
  achievement: Achievement;
  onClose: () => void;
}

export function AchievementToast({ achievement, onClose }: AchievementToastProps) {
  const [isExiting, setIsExiting] = useState(false);
  const isMountedRef = useRef(true);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

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

    // Auto-close after 4 seconds (shorter = less intrusive)
    const closeTimer = setTimeout(() => {
      handleClose();
    }, 4000);

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
            style={{ animationDuration: '4s' }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Achievement Toast Stack - manages multiple toasts
 */
interface AchievementToastStackProps {
  achievements: Achievement[];
  onDismiss: (code: string) => void;
}

export function AchievementToastStack({ achievements, onDismiss }: AchievementToastStackProps) {
  if (achievements.length === 0) return null;

  // Show only the first achievement, others will show after dismiss
  const currentAchievement = achievements[0];

  return (
    <AchievementToast
      key={currentAchievement.code}
      achievement={currentAchievement}
      onClose={() => onDismiss(currentAchievement.code)}
    />
  );
}
