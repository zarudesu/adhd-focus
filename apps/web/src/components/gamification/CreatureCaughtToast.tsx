'use client';

/**
 * Creature Caught Toast Component
 * beatyour8 Brand: Calm, minimal celebration
 * No shimmer, no rainbow - just a simple acknowledgment
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { X } from 'lucide-react';
import type { Creature } from '@/db/schema';
import { cn } from '@/lib/utils';

interface CreatureCaughtToastProps {
  creature: Creature;
  isNew: boolean;
  count: number;
  onClose: () => void;
}

export function CreatureCaughtToast({ creature, isNew, count, onClose }: CreatureCaughtToastProps) {
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

    // Auto-close after 4 seconds
    const closeTimer = setTimeout(() => {
      handleClose();
    }, 4000);

    return () => {
      isMountedRef.current = false;
      clearTimeout(closeTimer);
    };
  }, [handleClose]);

  const rarityLabels: Record<string, string> = {
    common: 'Common',
    uncommon: 'Uncommon',
    rare: 'Rare',
    legendary: 'Legendary',
    mythic: 'Mythic',
    secret: 'Secret',
  };

  const rarityLabel = rarityLabels[creature.rarity || 'common'] || 'Common';

  return (
    <div
      className={cn(
        "fixed bottom-4 left-4 z-[100] max-w-sm",
        isExiting ? "animate-slide-out-right" : "animate-slide-in-right"
      )}
      style={{ transform: isExiting ? 'translateX(-100%)' : undefined }}
    >
      <div className="relative overflow-hidden rounded-lg border border-border bg-card shadow-lg">
        {/* Content */}
        <div className="p-4 flex items-start gap-3">
          {/* Creature emoji */}
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-muted flex items-center justify-center text-2xl">
            {creature.emoji}
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-medium">
              {isNew ? 'New!' : 'Caught'}
            </p>
            <p className="font-medium text-foreground truncate">
              {creature.name}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                {rarityLabel}
              </span>
              {!isNew && count > 1 && (
                <span className="text-muted-foreground text-xs">
                  ×{count}
                </span>
              )}
            </div>
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
 * Creature Caught data structure
 */
export interface CaughtCreatureData {
  creature: Creature;
  isNew: boolean;
  count: number;
}

/**
 * Creature Toast Stack - manages creature notifications
 */
interface CreatureToastStackProps {
  creatures: CaughtCreatureData[];
  onDismiss: (creatureId: string) => void;
}

export function CreatureToastStack({ creatures, onDismiss }: CreatureToastStackProps) {
  if (creatures.length === 0) return null;

  // Show only the first creature, others will show after dismiss
  const current = creatures[0];

  return (
    <CreatureCaughtToast
      key={current.creature.id}
      creature={current.creature}
      isNew={current.isNew}
      count={current.count}
      onClose={() => onDismiss(current.creature.id)}
    />
  );
}
