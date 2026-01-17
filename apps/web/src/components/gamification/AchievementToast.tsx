'use client';

/**
 * Achievement Toast Component
 * Shows a celebration toast when user unlocks an achievement
 */

import { useEffect, useState } from 'react';
import { X, Trophy, Star } from 'lucide-react';
import type { Achievement } from '@/db/schema';

interface AchievementToastProps {
  achievement: Achievement;
  onClose: () => void;
}

export function AchievementToast({ achievement, onClose }: AchievementToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const enterTimer = setTimeout(() => setIsVisible(true), 50);

    // Auto-close after 5 seconds
    const closeTimer = setTimeout(() => {
      handleClose();
    }, 5000);

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
    progress: 'from-green-500 to-emerald-600',
    streak: 'from-orange-500 to-red-600',
    mastery: 'from-purple-500 to-indigo-600',
    hidden: 'from-slate-500 to-slate-700',
    secret: 'from-yellow-500 to-amber-600',
    ultra_secret: 'from-pink-500 to-rose-600',
  };

  const gradientClass = rarityColors[achievement.category] || 'from-blue-500 to-purple-600';

  return (
    <div
      className={`
        fixed bottom-4 right-4 z-[100]
        transform transition-all duration-300 ease-out
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="relative overflow-hidden rounded-lg shadow-2xl">
        {/* Gradient background */}
        <div className={`absolute inset-0 bg-gradient-to-r ${gradientClass} opacity-95`} />

        {/* Shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />

        {/* Content */}
        <div className="relative p-4 flex items-center gap-4 min-w-[320px]">
          {/* Icon */}
          <div className="flex-shrink-0 w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-3xl animate-bounce-gentle">
            {achievement.icon || <Trophy className="w-8 h-8 text-white" />}
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-white/80 text-xs font-medium uppercase tracking-wider">
              <Star className="w-3 h-3" />
              Achievement Unlocked!
            </div>
            <div className="text-white font-bold text-lg truncate">
              {achievement.name}
            </div>
            <div className="text-white/80 text-sm truncate">
              {achievement.description}
            </div>
            {achievement.xpReward && achievement.xpReward > 0 && (
              <div className="mt-1 text-white/90 text-xs font-medium">
                +{achievement.xpReward} XP
              </div>
            )}
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
            style={{ animationDuration: '5s' }}
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
