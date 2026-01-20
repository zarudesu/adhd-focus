'use client';

/**
 * Gamification Provider
 * beatyour8 Philosophy: Not rewards, but meaning
 *
 * ADHD brains don't get dopamine from completion.
 * We provide cognitive replacement - understanding WHY it was enough.
 *
 * This provider manages:
 * - Calm Review: Reflection moments that return meaning
 * - Level ups: Trust building with the system
 * - Achievements: Quiet acknowledgments
 * - Creatures: Collection (shown subtly)
 */

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { LevelUpModal } from './LevelUpModal';
import { CalmReview, type CalmReviewProps } from './CalmReview';
import { AchievementToastStack } from './AchievementToast';
import { CreatureToastStack, type CaughtCreatureData } from './CreatureCaughtToast';
import { useGamification } from '@/hooks/useGamification';
import { useFeatures } from '@/hooks/useFeatures';
import type { Achievement, Creature } from '@/db/schema';

// Types for Calm Review triggers
type ReviewTrigger = CalmReviewProps['trigger'];
type ReviewContext = CalmReviewProps['context'];

interface GamificationEvent {
  levelUp?: {
    newLevel: number;
    unlockedFeatures?: string[];
  };
  xpAwarded?: number;
  // New: Calm Review instead of reward
  review?: {
    trigger: ReviewTrigger;
    context?: ReviewContext;
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

interface NavFeature {
  code: string;
  name: string;
  icon: string | null;
  isUnlocked: boolean;
  celebrationText: string | null;
}

interface GamificationContextType {
  showLevelUp: (newLevel: number, unlockedFeatures?: string[]) => void;
  handleTaskComplete: (event: GamificationEvent) => void;
  // Calm Review - show reflection at meaningful moments
  showCalmReview: (trigger: ReviewTrigger, context?: ReviewContext) => void;
  // Shared state
  state: GamificationState | null;
  loading: boolean;
  levelProgress: { currentLevel: number; xpInLevel: number; xpNeeded: number; progress: number };
  refresh: () => Promise<void>;
  // Refresh both gamification and features (for menu updates)
  refreshAll: () => Promise<void>;
  // Navigation features (shared state for sidebar)
  navFeatures: NavFeature[];
  featuresLoading: boolean;
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
  // Features state (for menu/nav updates) - shared with sidebar
  const { refreshFeatures, navFeatures, loading: featuresLoading } = useFeatures();

  // Refresh both gamification and features state
  const refreshAll = useCallback(async () => {
    await Promise.all([refresh(), refreshFeatures()]);
  }, [refresh, refreshFeatures]);

  const [levelUpModal, setLevelUpModal] = useState<{
    open: boolean;
    newLevel: number;
    unlockedFeatures: string[];
  }>({
    open: false,
    newLevel: 1,
    unlockedFeatures: [],
  });

  // Calm Review state - reflection moments that return meaning
  const [calmReview, setCalmReview] = useState<{
    visible: boolean;
    trigger: ReviewTrigger;
    context?: ReviewContext;
  }>({
    visible: false,
    trigger: 'task_complete',
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

  // Show Calm Review at meaningful moments
  const showCalmReview = useCallback((trigger: ReviewTrigger, context?: ReviewContext) => {
    setCalmReview({
      visible: true,
      trigger,
      context,
    });
  }, []);

  const handleReviewComplete = useCallback(() => {
    setCalmReview((prev) => ({ ...prev, visible: false }));

    // Refresh stats and features after review completes (updates menu)
    refreshAll();

    // Show pending level up after review
    if (pendingLevelUp) {
      showLevelUp(pendingLevelUp.newLevel, pendingLevelUp.unlockedFeatures);
      setPendingLevelUp(null);
    }
  }, [pendingLevelUp, showLevelUp, refreshAll]);

  const handleTaskComplete = useCallback((event: GamificationEvent) => {
    // Track if we need to refresh features (for menu updates)
    let needsRefresh = false;

    // Show Calm Review if requested - reflection, not reward
    if (event.review) {
      setCalmReview({
        visible: true,
        trigger: event.review.trigger,
        context: event.review.context,
      });

      // If there's also a level up, queue it for after review
      if (event.levelUp) {
        setPendingLevelUp({
          newLevel: event.levelUp.newLevel,
          unlockedFeatures: event.levelUp.unlockedFeatures || [],
        });
      }
      // refreshAll will be called in handleReviewComplete
    } else if (event.levelUp) {
      // No review, show level up immediately
      showLevelUp(event.levelUp.newLevel, event.levelUp.unlockedFeatures);
      needsRefresh = true; // Level up can unlock features
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
      needsRefresh = true; // Achievements can unlock features
    }

    // Phase 4: Queue creature caught for toast display
    if (event.creature) {
      setPendingCreatures((prev) => [...prev, {
        creature: event.creature!.creature,
        isNew: event.creature!.isNew,
        count: event.creature!.newCount,
      }]);
    }

    // Always refresh features after task completion events (updates menu)
    // Features can unlock based on: tasks completed, level up, achievements
    // This ensures newly unlocked features appear in sidebar without page reload
    if (needsRefresh || event.xpAwarded) {
      refreshAll();
    }
  }, [showLevelUp, refreshAll]);

  // Dismiss achievement from queue
  const dismissAchievement = useCallback((code: string) => {
    setPendingAchievements((prev) => prev.filter((a) => a.code !== code));
  }, []);

  // Dismiss creature from queue
  const dismissCreature = useCallback((creatureId: string) => {
    setPendingCreatures((prev) => prev.filter((c) => c.creature.id !== creatureId));
  }, []);

  return (
    <GamificationContext.Provider value={{ showLevelUp, handleTaskComplete, showCalmReview, state, loading, levelProgress, refresh, refreshAll, navFeatures, featuresLoading }}>
      {children}

      {/* Calm Review - Reflection, not reward */}
      {calmReview.visible && (
        <CalmReview
          trigger={calmReview.trigger}
          context={calmReview.context}
          onComplete={handleReviewComplete}
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
