'use client';

/**
 * Reward Animation Component
 * beatyour8 Brand: Calm, minimal celebration
 *
 * Philosophy: Rewards for STARTING, not for results
 * Simple checkmark, quick fade, no distraction
 */

import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Check } from 'lucide-react';
import type { RewardRarity } from '@/hooks/useGamification';

interface RewardAnimationProps {
  effect: string;
  rarity: RewardRarity;
  onComplete?: () => void;
}

export function RewardAnimation({ effect, rarity, onComplete }: RewardAnimationProps) {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);

  // All rarities now have same calm duration - no special treatment
  const duration = 1200;

  useEffect(() => {
    // Use setTimeout to batch state update (avoid lint warning)
    const mountTimer = setTimeout(() => setMounted(true), 0);
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        onComplete?.();
      }, 200);
    }, duration);

    return () => {
      clearTimeout(mountTimer);
      clearTimeout(timer);
    };
  }, [duration, onComplete]);

  const handleClick = useCallback(() => {
    setVisible(false);
    setTimeout(() => onComplete?.(), 200);
  }, [onComplete]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={`reward-overlay ${!visible ? 'hidden' : ''}`}
      onClick={handleClick}
    >
      <div className="reward-success">
        <div className="reward-success-icon">
          <Check className="w-6 h-6" />
        </div>
        <span className="reward-success-text">Done</span>
      </div>
    </div>,
    document.body
  );
}
