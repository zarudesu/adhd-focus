'use client';

/**
 * Creature Caught Toast Component
 * Shows a celebration toast when user catches a creature
 */

import { useEffect, useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import type { Creature } from '@/db/schema';

interface CreatureCaughtToastProps {
  creature: Creature;
  isNew: boolean;
  count: number;
  onClose: () => void;
}

export function CreatureCaughtToast({ creature, isNew, count, onClose }: CreatureCaughtToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const enterTimer = setTimeout(() => setIsVisible(true), 50);

    // Auto-close after 4 seconds
    const closeTimer = setTimeout(() => {
      handleClose();
    }, 4000);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(closeTimer);
    };
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  const rarityColors: Record<string, string> = {
    common: 'from-slate-500 to-slate-600',
    uncommon: 'from-green-500 to-emerald-600',
    rare: 'from-blue-500 to-indigo-600',
    legendary: 'from-purple-500 to-violet-600',
    mythic: 'from-amber-500 to-orange-600',
    secret: 'from-pink-500 to-rose-600',
  };

  const rarityLabels: Record<string, string> = {
    common: 'Common',
    uncommon: 'Uncommon',
    rare: 'Rare',
    legendary: 'Legendary',
    mythic: 'Mythic',
    secret: 'Secret',
  };

  const gradientClass = rarityColors[creature.rarity || 'common'] || rarityColors.common;
  const rarityLabel = rarityLabels[creature.rarity || 'common'] || 'Common';

  return (
    <div
      className={`
        fixed bottom-4 left-4 z-[100]
        transform transition-all duration-300 ease-out
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0'}
      `}
    >
      <div className="relative overflow-hidden rounded-lg shadow-2xl">
        {/* Gradient background */}
        <div className={`absolute inset-0 bg-gradient-to-r ${gradientClass} opacity-95`} />

        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />

        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white/30 rounded-full animate-float"
              style={{
                left: `${15 + i * 15}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: `${2 + i * 0.3}s`,
              }}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative p-4 flex items-center gap-4 min-w-[300px]">
          {/* Creature emoji */}
          <div className="flex-shrink-0 w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-4xl animate-bounce-gentle shadow-inner">
            {creature.emoji}
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-white/80 text-xs font-medium uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              {isNew ? 'New Creature!' : 'Creature Caught!'}
            </div>
            <div className="text-white font-bold text-lg truncate">
              {creature.name}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`
                px-2 py-0.5 rounded-full text-xs font-medium
                bg-white/20 text-white
              `}>
                {rarityLabel}
              </span>
              {!isNew && (
                <span className="text-white/80 text-xs">
                  x{count}
                </span>
              )}
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white/80" />
          </button>
        </div>

        {/* Progress bar (auto-close indicator) */}
        <div className="h-1 bg-white/20">
          <div
            className="h-full bg-white/50 animate-shrink-width"
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
