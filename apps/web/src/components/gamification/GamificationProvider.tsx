'use client';

/**
 * Gamification Provider
 * Provides context for gamification events (level up, achievements, creatures)
 * Phase 2: Now includes visual reward animations
 * Also manages gamification state centrally for sidebar updates
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { LevelUpModal } from './LevelUpModal';
import { RewardAnimation } from './RewardAnimation';
import { useGamification, type RewardRarity } from '@/hooks/useGamification';
import type { Achievement, Creature } from '@/db/schema';

interface GamificationEvent {
  levelUp?: {
    newLevel: number;
    unlockedFeatures?: string[];
  };
  xpAwarded?: number;
  reward?: {
    rarity: RewardRarity;
    effect: string;
  };
  newAchievements?: Achievement[];
  creature?: Creature | null;
}

// Shared gamification state for sidebar
interface GamificationState {
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  totalTasksCompleted: number;
  totalCreatures: number;
}

interface GamificationContextType {
  showLevelUp: (newLevel: number, unlockedFeatures?: string[]) => void;
  handleTaskComplete: (event: GamificationEvent) => void;
  // Shared state
  state: GamificationState | null;
  loading: boolean;
  levelProgress: { currentLevel: number; xpInLevel: number; xpNeeded: number; progress: number };
  refresh: () => Promise<void>;
}

const GamificationContext = createContext<GamificationContextType | null>(null);

export function useGamificationEvents() {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamificationEvents must be used within GamificationProvider');
  }
  return context;
}

interface GamificationProviderProps {
  children: ReactNode;
}

export function GamificationProvider({ children }: GamificationProviderProps) {
  // Centralized gamification state
  const { state, loading, levelProgress, refresh } = useGamification();

  const [levelUpModal, setLevelUpModal] = useState<{
    open: boolean;
    newLevel: number;
    unlockedFeatures: string[];
  }>({
    open: false,
    newLevel: 1,
    unlockedFeatures: [],
  });

  // Phase 2: Reward animation state
  const [rewardAnimation, setRewardAnimation] = useState<{
    visible: boolean;
    effect: string;
    rarity: RewardRarity;
  }>({
    visible: false,
    effect: 'sparkle',
    rarity: 'common',
  });

  // Queue for pending events (level up shown after reward animation)
  const [pendingLevelUp, setPendingLevelUp] = useState<{
    newLevel: number;
    unlockedFeatures: string[];
  } | null>(null);

  const showLevelUp = useCallback((newLevel: number, unlockedFeatures: string[] = []) => {
    setLevelUpModal({
      open: true,
      newLevel,
      unlockedFeatures,
    });
  }, []);

  const handleRewardComplete = useCallback(() => {
    setRewardAnimation((prev) => ({ ...prev, visible: false }));

    // Refresh stats after animation completes
    refresh();

    // Show pending level up after reward animation
    if (pendingLevelUp) {
      showLevelUp(pendingLevelUp.newLevel, pendingLevelUp.unlockedFeatures);
      setPendingLevelUp(null);
    }
  }, [pendingLevelUp, showLevelUp, refresh]);

  const handleTaskComplete = useCallback((event: GamificationEvent) => {
    // Phase 2: Show visual reward first
    if (event.reward) {
      setRewardAnimation({
        visible: true,
        effect: event.reward.effect,
        rarity: event.reward.rarity,
      });

      // If there's also a level up, queue it for after animation
      if (event.levelUp) {
        setPendingLevelUp({
          newLevel: event.levelUp.newLevel,
          unlockedFeatures: event.levelUp.unlockedFeatures || [],
        });
      }
    } else if (event.levelUp) {
      // No reward, show level up immediately
      showLevelUp(event.levelUp.newLevel, event.levelUp.unlockedFeatures);
      refresh();
    }

    // TODO: Handle new achievements toast (Phase 3)
    // TODO: Handle creature caught animation (Phase 4)
  }, [showLevelUp, refresh]);

  return (
    <GamificationContext.Provider value={{ showLevelUp, handleTaskComplete, state, loading, levelProgress, refresh }}>
      {children}

      {/* Phase 2: Reward Animation */}
      {rewardAnimation.visible && (
        <RewardAnimation
          effect={rewardAnimation.effect}
          rarity={rewardAnimation.rarity}
          onComplete={handleRewardComplete}
        />
      )}

      <LevelUpModal
        open={levelUpModal.open}
        onOpenChange={(open) => setLevelUpModal((prev) => ({ ...prev, open }))}
        newLevel={levelUpModal.newLevel}
        unlockedFeatures={levelUpModal.unlockedFeatures}
      />
    </GamificationContext.Provider>
  );
}
