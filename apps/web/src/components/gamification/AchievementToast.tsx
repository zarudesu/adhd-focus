'use client';

/**
 * Achievement Toast Component
 * Shows a celebration toast when user unlocks an achievement
 * With beautiful shimmer animations
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Star, Sparkles } from 'lucide-react';
import type { Achievement } from '@/db/schema';

interface AchievementToastProps {
  achievement: Achievement;
  onClose: () => void;
}

// Shimmer type based on category
const categoryShimmer: Record<string, 'gold' | 'silver' | 'rainbow' | 'bronze'> = {
  progress: 'bronze',
  streak: 'silver',
  mastery: 'gold',
  hidden: 'silver',
  secret: 'gold',
  ultra_secret: 'rainbow',
};

// Shimmering text component for achievement name
function ShimmeringAchievementText({
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

export function AchievementToast({ achievement, onClose }: AchievementToastProps) {
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

    // Auto-close after 5 seconds
    const closeTimer = setTimeout(() => {
      handleClose();
    }, 5000);

    return () => {
      isMountedRef.current = false;
      clearTimeout(closeTimer);
    };
  }, [handleClose]);

  const rarityColors: Record<string, string> = {
    progress: 'from-green-500 to-emerald-600',
    streak: 'from-orange-500 to-red-600',
    mastery: 'from-purple-500 to-indigo-600',
    hidden: 'from-slate-500 to-slate-700',
    secret: 'from-yellow-500 to-amber-600',
    ultra_secret: 'from-pink-500 to-rose-600',
  };

  const gradientClass = rarityColors[achievement.category] || 'from-blue-500 to-purple-600';
  const shimmerType = categoryShimmer[achievement.category] || 'bronze';

  return (
    <motion.div
      className="fixed bottom-4 right-4 z-[100]"
      initial={{ x: 400, opacity: 0, scale: 0.8 }}
      animate={isExiting
        ? { x: 400, opacity: 0, scale: 0.8 }
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

        {/* Rainbow border for ultra secret */}
        {achievement.category === 'ultra_secret' && (
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

        {/* Content */}
        <div className="relative p-4 flex items-center gap-4 min-w-[340px]">
          {/* Icon with bounce and sparkles */}
          <motion.div
            className="relative flex-shrink-0 w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-3xl"
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
            {achievement.icon || <Trophy className="w-8 h-8 text-white" />}

            {/* Sparkles around icon */}
            {[0, 1, 2, 3].map((i) => (
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
                <Sparkles className="h-4 w-4 text-yellow-200" />
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
              <Star className="w-3 h-3" />
              Achievement Unlocked!
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="truncate"
            >
              <ShimmeringAchievementText
                text={achievement.name}
                shimmerType={shimmerType}
              />
            </motion.div>

            <motion.div
              className="text-white/80 text-sm truncate"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {achievement.description}
            </motion.div>

            {achievement.xpReward && achievement.xpReward > 0 && (
              <motion.div
                className="mt-1 text-white/90 text-xs font-medium flex items-center gap-1"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: 'spring' }}
              >
                <Sparkles className="w-3 h-3" />
                +{achievement.xpReward} XP
              </motion.div>
            )}
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

        {/* Progress bar (auto-close indicator) */}
        <div className="h-1 bg-white/20">
          <motion.div
            className="h-full bg-white/60"
            initial={{ width: '100%' }}
            animate={{ width: '0%' }}
            transition={{ duration: 5, ease: 'linear' }}
          />
        </div>
      </div>
    </motion.div>
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
    <AnimatePresence>
      <AchievementToast
        key={currentAchievement.code}
        achievement={currentAchievement}
        onClose={() => onDismiss(currentAchievement.code)}
      />
    </AnimatePresence>
  );
}
