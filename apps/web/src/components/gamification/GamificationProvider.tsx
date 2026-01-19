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
import { AchievementToastStack } from './AchievementToast';
import { CreatureToastStack, type CaughtCreatureData } from './CreatureCaughtToast';
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
  creature?: {
    creature: Creature;
    isNew: boolean;
    newCount: number;
  } | null;
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

  // Phase 3: Achievement toast state
  const [pendingAchievements, setPendingAchievements] = useState<Achievement[]>([]);

  // Phase 4: Creature toast state
  const [pendingCreatures, setPendingCreatures] = useState<CaughtCreatureData[]>([]);

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

    // Phase 3: Queue new achievements for toast display
    // Limit to max 2 toasts to prevent spam when multiple achievements unlock at once
    if (event.newAchievements && event.newAchievements.length > 0) {
      setPendingAchievements((prev) => {
        const newAchievements = event.newAchievements!;
        const combined = [...prev, ...newAchievements];
        // Keep only the first 2 most important (mastery > secret > streak > progress)
        const priorityOrder: Record<string, number> = {
          ultra_secret: 6,
          secret: 5,
          mastery: 4,
          hidden: 3,
          streak: 2,
          progress: 1,
        };
        return combined
          .sort((a, b) => (priorityOrder[b.category] || 0) - (priorityOrder[a.category] || 0))
          .slice(0, 2);
      });
    }

    // Phase 4: Queue creature caught for toast display
    if (event.creature) {
      setPendingCreatures((prev) => [...prev, {
        creature: event.creature!.creature,
        isNew: event.creature!.isNew,
        count: event.creature!.newCount,
      }]);
    }
  }, [showLevelUp, refresh]);

  // Dismiss achievement from queue
  const dismissAchievement = useCallback((code: string) => {
    setPendingAchievements((prev) => prev.filter((a) => a.code !== code));
  }, []);

  // Dismiss creature from queue
  const dismissCreature = useCallback((creatureId: string) => {
    setPendingCreatures((prev) => prev.filter((c) => c.creature.id !== creatureId));
  }, []);

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

      {/* Phase 3: Achievement Toasts */}
      <AchievementToastStack
        achievements={pendingAchievements}
        onDismiss={dismissAchievement}
      />

      {/* Phase 4: Creature Toasts */}
      <CreatureToastStack
        creatures={pendingCreatures}
        onDismiss={dismissCreature}
      />
    </GamificationContext.Provider>
  );
}
