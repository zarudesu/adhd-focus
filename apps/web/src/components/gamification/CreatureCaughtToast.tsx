'use client';

/**
 * Creature Caught Toast Component
 * Shows a celebration toast when user catches a creature
 * With beautiful shimmer animations
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Star } from 'lucide-react';
import type { Creature } from '@/db/schema';

interface CreatureCaughtToastProps {
  creature: Creature;
  isNew: boolean;
  count: number;
  onClose: () => void;
}

// Shimmer type based on rarity
const rarityShimmer: Record<string, 'gold' | 'silver' | 'rainbow' | 'bronze'> = {
  common: 'bronze',
  uncommon: 'silver',
  rare: 'silver',
  legendary: 'gold',
  mythic: 'gold',
  secret: 'rainbow',
};

// Shimmering text for creature name
function ShimmeringCreatureName({
  text,
  shimmerType,
}: {
  text: string;
  shimmerType: 'gold' | 'silver' | 'rainbow' | 'bronze';
}) {
  const gradients = {
    gold: 'from-yellow-200 via-amber-100 via-yellow-300 to-orange-200',
    silver: 'from-white via-slate-100 via-white to-slate-200',
    rainbow: 'from-red-200 via-yellow-200 via-green-200 via-blue-200 to-purple-200',
    bronze: 'from-orange-200 via-amber-100 via-orange-300 to-yellow-200',
  };

  return (
    <motion.span
      className={`
        relative inline-block font-bold text-lg
        bg-clip-text text-transparent
        bg-gradient-to-r ${gradients[shimmerType]}
        bg-[length:200%_100%]
      `}
      animate={{
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {text}
    </motion.span>
  );
}

export function CreatureCaughtToast({ creature, isNew, count, onClose }: CreatureCaughtToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  // Use ref to track if component is still mounted
  const isMountedRef = useRef(true);

  // Store onClose in a ref to avoid stale closures
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const handleClose = useCallback(() => {
    if (!isMountedRef.current) return;
    setIsExiting(true);
    setTimeout(() => {
      if (isMountedRef.current) {
        onCloseRef.current();
      }
    }, 400);
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
  const shimmerType = rarityShimmer[creature.rarity || 'common'] || 'bronze';
  const isRare = ['legendary', 'mythic', 'secret'].includes(creature.rarity || '');

  return (
    <motion.div
      className="fixed bottom-4 left-4 z-[100]"
      initial={{ x: -400, opacity: 0, scale: 0.8 }}
      animate={isExiting
        ? { x: -400, opacity: 0, scale: 0.8 }
        : { x: 0, opacity: 1, scale: 1 }
      }
      transition={{
        type: 'spring',
        damping: 20,
        stiffness: 300
      }}
    >
      <div className="relative overflow-hidden rounded-xl shadow-2xl">
        {/* Gradient background */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-r ${gradientClass}`}
          animate={{
            opacity: [0.9, 1, 0.9],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Rainbow border for secret creatures */}
        {creature.rarity === 'secret' && (
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
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
              duration: 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )}

        {/* Shimmer sweep */}
        <motion.div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)',
          }}
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 1,
            ease: 'easeInOut',
          }}
        />

        {/* Floating particles */}
        {isRare && (
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white/40 rounded-full"
                style={{
                  left: `${10 + i * 12}%`,
                  bottom: '-10%',
                }}
                animate={{
                  y: [0, -100, -150],
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2 + i * 0.2,
                  delay: i * 0.3,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>
        )}

        {/* Content */}
        <div className="relative p-4 flex items-center gap-4 min-w-[320px]">
          {/* Creature emoji with animation */}
          <motion.div
            className="relative flex-shrink-0 w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-4xl shadow-inner"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            {creature.emoji}

            {/* Sparkles for rare creatures */}
            {isRare && [0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                className="absolute"
                style={{
                  top: ['-10%', '-10%', '90%', '90%'][i],
                  left: ['-10%', '90%', '-10%', '90%'][i],
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: [0, 1.2, 0],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 0.8,
                  delay: i * 0.2,
                  repeat: Infinity,
                  repeatDelay: 1.5,
                }}
              >
                <Star className="h-3 w-3 text-yellow-200 fill-yellow-200" />
              </motion.div>
            ))}
          </motion.div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <motion.div
              className="flex items-center gap-2 text-white/80 text-xs font-medium uppercase tracking-wider"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Sparkles className="w-3 h-3" />
              {isNew ? 'New Creature!' : 'Creature Caught!'}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="truncate"
            >
              <ShimmeringCreatureName
                text={creature.name}
                shimmerType={shimmerType}
              />
            </motion.div>

            <motion.div
              className="flex items-center gap-2 mt-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <motion.span
                className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/20 text-white"
                animate={isRare ? {
                  boxShadow: ['0 0 0 rgba(255,255,255,0)', '0 0 10px rgba(255,255,255,0.5)', '0 0 0 rgba(255,255,255,0)'],
                } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {rarityLabel}
              </motion.span>
              {!isNew && (
                <span className="text-white/80 text-xs">
                  x{count}
                </span>
              )}
            </motion.div>
          </div>

          {/* Close button */}
          <motion.button
            onClick={handleClose}
            className="flex-shrink-0 p-1.5 rounded-full hover:bg-white/20 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <X className="w-5 h-5 text-white/80" />
          </motion.button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-white/20">
          <motion.div
            className="h-full bg-white/60"
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 4, ease: 'linear' }}
          />
        </div>
      </div>
    </motion.div>
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
    <AnimatePresence>
      <CreatureCaughtToast
        key={current.creature.id}
        creature={current.creature}
        isNew={current.isNew}
        count={current.count}
        onClose={() => onDismiss(current.creature.id)}
      />
    </AnimatePresence>
  );
}
