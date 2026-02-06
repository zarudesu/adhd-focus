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

import { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import { LevelUpModal } from './LevelUpModal';
import { CalmReview, type CalmReviewProps } from './CalmReview';
import { AchievementToastStack } from './AchievementToast';
import { CreatureToastStack, type CaughtCreatureData } from './CreatureCaughtToast';
import { FeatureUnlockModal, type FeatureUnlockData } from './FeatureUnlockModal';
import { ReAuthModal } from './ReAuthModal';
import { MorningReviewModal } from '@/components/tasks/MorningReviewModal';
import { useGamification } from '@/hooks/useGamification';
import { useFeatures } from '@/hooks/useFeatures';
import { useTasks } from '@/hooks/useTasks';
import { useYesterdayReview } from '@/hooks/useYesterdayReview';
import { useMorningReview } from '@/hooks/useMorningReview';
import { useSession } from 'next-auth/react';
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
  firstOpenedAt: Date | null;
}

interface XpGainEvent {
  amount: number;
  timestamp: number;
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
  // Shimmer effect tracking
  isNewlyUnlocked: (code: string) => boolean;
  markFeatureOpened: (code: string) => Promise<{ isFirstOpen: boolean; tutorial: unknown } | null>;
  // Deferred achievements - show queued achievements (called from Today page)
  showDeferredAchievements: () => void;
  // XP gain event for progress bar animation
  xpGainEvent: XpGainEvent | null;
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
  // Get session for user email (for re-auth modal)
  const { data: session } = useSession();

  // Centralized gamification state
  const { state, loading, levelProgress, refresh } = useGamification();
  // Features state (for menu/nav updates) - shared with sidebar
  const {
    refreshFeatures,
    navFeatures,
    loading: featuresLoading,
    isNewlyUnlocked,
    markFeatureOpened,
  } = useFeatures();

  // Morning review: overdue tasks + yesterday habits
  const {
    overdueTasks: morningOverdueTasks,
    rescheduleToToday,
    completeYesterday,
    moveToInbox: moveTaskToInbox,
    deleteTask: deleteTaskAction,
  } = useTasks();
  const {
    data: habitsReviewData,
    loading: habitsReviewLoading,
    submitReview: submitHabitsReview,
  } = useYesterdayReview();
  const {
    data: morningReviewData,
    loading: morningReviewLoading,
    dismissed: morningReviewDismissed,
    dismiss: dismissMorningReview,
  } = useMorningReview(morningOverdueTasks, habitsReviewData, habitsReviewLoading);

  const [morningReviewReady, setMorningReviewReady] = useState(false);

  // Show morning review with 1s delay after loading
  useEffect(() => {
    if (morningReviewLoading || loading || morningReviewDismissed || !morningReviewData.needsReview) return;
    const timer = setTimeout(() => setMorningReviewReady(true), 1000);
    return () => clearTimeout(timer);
  }, [morningReviewLoading, loading, morningReviewDismissed, morningReviewData.needsReview]);

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

  // Feature unlock modal state
  const [featureUnlockModal, setFeatureUnlockModal] = useState<{
    open: boolean;
    feature: FeatureUnlockData | null;
  }>({
    open: false,
    feature: null,
  });

  // Re-auth modal state (shown after Projects unlock)
  const [reAuthModal, setReAuthModal] = useState<{
    open: boolean;
    featureCode: string | null;
  }>({
    open: false,
    featureCode: null,
  });

  // Track previously seen unlocked features to detect new unlocks
  const previousUnlockedRef = useRef<Set<string>>(new Set());

  // XP gain event for LevelProgress animation
  const [xpGainEvent, setXpGainEvent] = useState<XpGainEvent | null>(null);

  // Deferred achievements - stored until user navigates to main page
  const deferredAchievementsRef = useRef<Achievement[]>([]);

  // Detect new feature unlocks when navFeatures changes
  useEffect(() => {
    if (featuresLoading) return;

    const currentUnlocked = new Set(
      navFeatures.filter(f => f.isUnlocked).map(f => f.code)
    );

    // Find newly unlocked features (in current but not in previous)
    const newlyUnlocked: FeatureUnlockData[] = [];
    currentUnlocked.forEach(code => {
      if (!previousUnlockedRef.current.has(code)) {
        const feature = navFeatures.find(f => f.code === code);
        if (feature && feature.firstOpenedAt === null) {
          // This is a truly new unlock (never opened before)
          newlyUnlocked.push({
            code: feature.code,
            name: feature.name,
            celebrationText: feature.celebrationText,
          });
        }
      }
    });

    // Update previous set
    previousUnlockedRef.current = currentUnlocked;

    // Show feature unlock modal for the first new feature
    // (we'll show one at a time to avoid overwhelm)
    if (newlyUnlocked.length > 0 && !featureUnlockModal.open && !calmReview.visible && !levelUpModal.open) {
      // Use setTimeout to avoid setState during render
      setTimeout(() => {
        setFeatureUnlockModal({
          open: true,
          feature: newlyUnlocked[0],
        });
      }, 0);
    }
  }, [navFeatures, featuresLoading, featureUnlockModal.open, calmReview.visible, levelUpModal.open]);

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

    // Phase 3: Defer achievements - store for later display on main page
    // This prevents interrupting flow during inbox processing, focus mode, etc.
    if (event.newAchievements && event.newAchievements.length > 0) {
      deferredAchievementsRef.current = [
        ...deferredAchievementsRef.current,
        ...event.newAchievements,
      ];
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

    // Fire XP gain event for progress bar animation
    if (event.xpAwarded && event.xpAwarded > 0) {
      setXpGainEvent({ amount: event.xpAwarded, timestamp: Date.now() });
    }

    // Always refresh features after task completion events (updates menu)
    // Features can unlock based on: tasks completed, level up, achievements
    // This ensures newly unlocked features appear in sidebar without page reload
    if (needsRefresh || event.xpAwarded) {
      refreshAll();
    }
  }, [showLevelUp, refreshAll]);

  // Show deferred achievements - called when user navigates to main page
  const showDeferredAchievements = useCallback(() => {
    if (deferredAchievementsRef.current.length === 0) return;

    // Move deferred to pending with priority sorting
    setPendingAchievements((prev) => {
      const combined = [...prev, ...deferredAchievementsRef.current];
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

    // Clear deferred
    deferredAchievementsRef.current = [];
  }, []);

  // Dismiss achievement from queue
  const dismissAchievement = useCallback((code: string) => {
    setPendingAchievements((prev) => prev.filter((a) => a.code !== code));
  }, []);

  // Dismiss creature from queue
  const dismissCreature = useCallback((creatureId: string) => {
    setPendingCreatures((prev) => prev.filter((c) => c.creature.id !== creatureId));
  }, []);

  return (
    <GamificationContext.Provider value={{ showLevelUp, handleTaskComplete, showCalmReview, state, loading, levelProgress, refresh, refreshAll, navFeatures, featuresLoading, isNewlyUnlocked, markFeatureOpened, showDeferredAchievements, xpGainEvent }}>
      {children}

      {/* Morning Review Modal */}
      {morningReviewReady && !morningReviewDismissed && morningReviewData.needsReview
        && !levelUpModal.open && !featureUnlockModal.open && !calmReview.visible && (
        <MorningReviewModal
          overdueTasks={morningReviewData.overdueTasks}
          habits={morningReviewData.habits}
          onCompleteYesterday={completeYesterday}
          onRescheduleToToday={rescheduleToToday}
          onMoveToInbox={moveTaskToInbox}
          onDeleteTask={async (id) => { await deleteTaskAction(id); }}
          onSubmitHabits={submitHabitsReview}
          onDismiss={dismissMorningReview}
        />
      )}

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

      {/* Feature Unlock Modal */}
      <FeatureUnlockModal
        open={featureUnlockModal.open}
        onOpenChange={(open) => setFeatureUnlockModal((prev) => ({ ...prev, open }))}
        feature={featureUnlockModal.feature}
        onDismiss={(code) => {
          // For Projects, show re-auth modal first
          if (code === 'nav_projects') {
            setReAuthModal({ open: true, featureCode: code });
          } else {
            // Mark feature as opened in database so modal doesn't show again
            markFeatureOpened(code);
          }
        }}
      />

      {/* Re-Auth Modal (shown after Projects unlock) */}
      <ReAuthModal
        open={reAuthModal.open}
        onOpenChange={(open) => setReAuthModal((prev) => ({ ...prev, open }))}
        userEmail={session?.user?.email || ''}
        onVerified={() => {
          // Mark Projects feature as opened after verification
          if (reAuthModal.featureCode) {
            markFeatureOpened(reAuthModal.featureCode);
          }
        }}
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
