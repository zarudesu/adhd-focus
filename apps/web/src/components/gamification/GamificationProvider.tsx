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
import { ComboToast } from './ComboToast';
import { FeatureUnlockToastStack } from './FeatureUnlockToast';
import { ReAuthModal } from './ReAuthModal';
import { addFeatureUnlock, type PendingFeatureUnlock } from '@/lib/pending-progress';
import { MorningReviewModal } from '@/components/tasks/MorningReviewModal';
import { useGamification } from '@/hooks/useGamification';
import { useFeatures } from '@/hooks/useFeatures';
import { useTasks } from '@/hooks/useTasks';
import { useYesterdayReview } from '@/hooks/useYesterdayReview';
import { useMorningReview } from '@/hooks/useMorningReview';
import { useWelcomeBack } from '@/hooks/useWelcomeBack';
import { WelcomeBackFlow } from './WelcomeBackFlow';
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
  streakShields: number;
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
  // Combo event for toast display
  comboEvent: { count: number; bonusXp: number; timestamp: number } | null;
  // Dialog registry — prevents gamification modals from popping over open dialogs
  registerDialog: () => void;
  unregisterDialog: () => void;
}

const GamificationContext = createContext<GamificationContextType | null>(null);

export function useGamificationEvents() {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamificationEvents must be used within GamificationProvider');
  }
  return context;
}

// Safe version — returns null if not inside provider (for optional integration)
export function useGamificationContext() {
  return useContext(GamificationContext);
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
    archive: archiveTask,
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
  } = useMorningReview(morningOverdueTasks, habitsReviewData, habitsReviewLoading, session?.user?.id);

  // Welcome Back flow for returning users (3+ days away)
  const {
    showWelcome,
    daysAway,
    dismiss: dismissWelcome,
  } = useWelcomeBack(
    state?.lastActiveDate,
    morningOverdueTasks.length,
    session?.user?.id,
  );

  const [morningReviewReady, setMorningReviewReady] = useState(false);

  // Show morning review with 1s delay after loading
  useEffect(() => {
    if (morningReviewLoading || loading || morningReviewDismissed || !morningReviewData.needsReview) return;
    const timer = setTimeout(() => setMorningReviewReady(true), 1000);
    return () => clearTimeout(timer);
  }, [morningReviewLoading, loading, morningReviewDismissed, morningReviewData.needsReview]);

  // Refresh both gamification and features state
  const refreshAll = useCallback(async () => {
    try {
      await Promise.all([refresh(), refreshFeatures()]);
    } catch (err) {
      console.error('Failed to refresh gamification state:', err);
    }
  }, [refresh, refreshFeatures]);

  // Day 3-5 Surprise — bridge the novelty cliff
  useEffect(() => {
    if (loading || !state) return;
    const key = 'day-surprise-checked';
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');

    fetch('/api/gamification/day-surprise', { method: 'POST' })
      .then(res => res.json())
      .then(data => {
        if (data.eligible && data.achievement) {
          deferredAchievementsRef.current.push(data.achievement);
        }
      })
      .catch(() => {});
  }, [loading, state]);

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

  // Feature unlock toast state (subtle mid-session notification)
  const [pendingFeatureToasts, setPendingFeatureToasts] = useState<{ code: string; name: string }[]>([]);

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

  // Combo system — track consecutive task completions
  const comboRef = useRef({ count: 0, lastTime: 0 });
  const COMBO_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  const COMBO_THRESHOLD = 3; // Minimum for combo activation
  const [comboEvent, setComboEvent] = useState<{ count: number; bonusXp: number; timestamp: number } | null>(null);

  // Deferred achievements - stored until user navigates to main page
  const deferredAchievementsRef = useRef<Achievement[]>([]);

  // Batch summary for when too many achievements at once
  const [achievementBatchCount, setAchievementBatchCount] = useState(0);

  // Dialog registry — track open user dialogs to prevent modal stacking
  const dialogOpenCountRef = useRef(0);
  const pendingCalmReviewRef = useRef<{ trigger: ReviewTrigger; context?: ReviewContext } | null>(null);
  const pendingLevelUpFromDialogRef = useRef<{ newLevel: number; unlockedFeatures: string[] } | null>(null);


  // Detect new feature unlocks when navFeatures changes
  // Store in localStorage for morning review + show subtle toast
  useEffect(() => {
    if (featuresLoading) return;

    const userId = session?.user?.id;
    const currentUnlocked = new Set(
      navFeatures.filter(f => f.isUnlocked).map(f => f.code)
    );

    // Find newly unlocked features (in current but not in previous)
    const newToasts: { code: string; name: string }[] = [];
    currentUnlocked.forEach(code => {
      if (!previousUnlockedRef.current.has(code)) {
        const feature = navFeatures.find(f => f.code === code);
        if (feature && feature.firstOpenedAt === null) {
          // Store in localStorage for morning review
          if (userId) {
            addFeatureUnlock(userId, {
              code: feature.code,
              name: feature.name,
              celebrationText: feature.celebrationText,
            });
          }
          // Queue subtle toast
          newToasts.push({ code: feature.code, name: feature.name });
        }
      }
    });

    // Update previous set
    previousUnlockedRef.current = currentUnlocked;

    // Show subtle toasts for mid-session unlocks
    if (newToasts.length > 0) {
      setTimeout(() => {
        setPendingFeatureToasts(prev => [...prev, ...newToasts]);
      }, 0);
    }
  }, [navFeatures, featuresLoading, session?.user?.id]);

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

  // Dialog registry — flush pending modals when all dialogs close
  const flushPendingModals = useCallback(() => {
    if (pendingCalmReviewRef.current) {
      const { trigger, context } = pendingCalmReviewRef.current;
      pendingCalmReviewRef.current = null;
      setCalmReview({ visible: true, trigger, context });
      return; // Show one modal at a time
    }
    if (pendingLevelUpFromDialogRef.current) {
      const { newLevel, unlockedFeatures } = pendingLevelUpFromDialogRef.current;
      pendingLevelUpFromDialogRef.current = null;
      showLevelUp(newLevel, unlockedFeatures);
    }
  }, [showLevelUp]);

  const registerDialog = useCallback(() => {
    dialogOpenCountRef.current += 1;
  }, []);

  const unregisterDialog = useCallback(() => {
    dialogOpenCountRef.current = Math.max(0, dialogOpenCountRef.current - 1);
    if (dialogOpenCountRef.current === 0) {
      // Delay to let close animation finish
      setTimeout(flushPendingModals, 300);
    }
  }, [flushPendingModals]);

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

    // Combo tracking — consecutive task completions within timeout
    if (event.xpAwarded && event.xpAwarded > 0) {
      const now = Date.now();
      if (now - comboRef.current.lastTime < COMBO_TIMEOUT) {
        comboRef.current.count += 1;
      } else {
        comboRef.current.count = 1;
      }
      comboRef.current.lastTime = now;

      // Fire combo event when threshold met
      if (comboRef.current.count >= COMBO_THRESHOLD) {
        const bonusXp = 5 * comboRef.current.count; // 15, 20, 25, ...
        setComboEvent({ count: comboRef.current.count, bonusXp, timestamp: now });
        // Award combo bonus XP silently
        fetch('/api/gamification/xp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: bonusXp, reason: 'combo_bonus' }),
        }).catch(() => {});
      }
    }

    // Check if a user dialog is currently open (AddTaskDialog, etc.)
    const dialogIsOpen = dialogOpenCountRef.current > 0;

    // Show Calm Review if requested - reflection, not reward
    if (event.review) {
      if (dialogIsOpen) {
        // Defer until dialog closes to prevent modal stacking
        pendingCalmReviewRef.current = {
          trigger: event.review.trigger,
          context: event.review.context,
        };
      } else {
        setCalmReview({
          visible: true,
          trigger: event.review.trigger,
          context: event.review.context,
        });
      }

      // If there's also a level up, queue it for after review
      if (event.levelUp) {
        setPendingLevelUp({
          newLevel: event.levelUp.newLevel,
          unlockedFeatures: event.levelUp.unlockedFeatures || [],
        });
      }
      // refreshAll will be called in handleReviewComplete
    } else if (event.levelUp) {
      if (dialogIsOpen) {
        // Defer level up until dialog closes
        pendingLevelUpFromDialogRef.current = {
          newLevel: event.levelUp.newLevel,
          unlockedFeatures: event.levelUp.unlockedFeatures || [],
        };
      } else {
        showLevelUp(event.levelUp.newLevel, event.levelUp.unlockedFeatures);
      }
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
  // Batched: max 2 individual toasts, rest collapsed into summary
  const MAX_INDIVIDUAL_TOASTS = 2;

  const showDeferredAchievements = useCallback(() => {
    if (deferredAchievementsRef.current.length === 0) return;

    const all = [...deferredAchievementsRef.current];
    deferredAchievementsRef.current = [];

    const priorityOrder: Record<string, number> = {
      ultra_secret: 6,
      secret: 5,
      mastery: 4,
      hidden: 3,
      streak: 2,
      progress: 1,
    };
    all.sort((a, b) => (priorityOrder[b.category] || 0) - (priorityOrder[a.category] || 0));

    if (all.length <= MAX_INDIVIDUAL_TOASTS) {
      // Show all individually
      setPendingAchievements((prev) => [...prev, ...all]);
      setAchievementBatchCount(0);
    } else {
      // Show top 1 individually + batch summary for the rest
      setPendingAchievements((prev) => [...prev, all[0]]);
      setAchievementBatchCount(all.length - 1);
    }
  }, []);

  // Dismiss achievement from queue — when last individual one dismissed, batch count shows
  const dismissAchievement = useCallback((code: string) => {
    setPendingAchievements((prev) => prev.filter((a) => a.code !== code));
  }, []);

  // Dismiss batch summary
  const dismissAchievementBatch = useCallback(() => {
    setAchievementBatchCount(0);
  }, []);

  // Dismiss creature from queue
  const dismissCreature = useCallback((creatureId: string) => {
    setPendingCreatures((prev) => prev.filter((c) => c.creature.id !== creatureId));
  }, []);

  return (
    <GamificationContext.Provider value={{ showLevelUp, handleTaskComplete, showCalmReview, state, loading, levelProgress, refresh, refreshAll, navFeatures, featuresLoading, isNewlyUnlocked, markFeatureOpened, showDeferredAchievements, xpGainEvent, comboEvent, registerDialog, unregisterDialog }}>
      {children}

      {/* Welcome Back Flow — shown BEFORE morning review for returning users */}
      {showWelcome && !loading && !levelUpModal.open && (
        <WelcomeBackFlow
          daysAway={daysAway}
          overdueCount={morningOverdueTasks.length}
          onFreshStart={async () => {
            for (const task of morningOverdueTasks) {
              await archiveTask(task.id);
            }
          }}
          onDismiss={dismissWelcome}
        />
      )}

      {/* Morning Review Modal */}
      {morningReviewReady && !morningReviewDismissed && morningReviewData.needsReview
        && !levelUpModal.open && !calmReview.visible && !showWelcome && (
        <MorningReviewModal
          overdueTasks={morningReviewData.overdueTasks}
          habits={morningReviewData.habits}
          pendingProgress={morningReviewData.pendingProgress}
          onCompleteYesterday={completeYesterday}
          onRescheduleToToday={rescheduleToToday}
          onMoveToInbox={moveTaskToInbox}
          onDeleteTask={async (id) => { await deleteTaskAction(id); }}
          onArchive={async (id) => { await archiveTask(id); }}
          onSubmitHabits={submitHabitsReview}
          onProgressDismiss={(featureCodes) => {
            for (const code of featureCodes) {
              if (code === 'nav_projects') {
                setReAuthModal({ open: true, featureCode: code });
              } else {
                markFeatureOpened(code);
              }
            }
          }}
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

      {/* Toast channel — only ONE toast type at a time to prevent flood */}
      {(() => {
        // Priority: creature > achievement > feature
        if (pendingCreatures.length > 0) {
          return (
            <CreatureToastStack
              creatures={pendingCreatures}
              onDismiss={dismissCreature}
            />
          );
        }
        if (pendingAchievements.length > 0) {
          return (
            <AchievementToastStack
              achievements={pendingAchievements}
              onDismiss={dismissAchievement}
              batchCount={achievementBatchCount}
              onDismissBatch={dismissAchievementBatch}
            />
          );
        }
        if (achievementBatchCount > 0) {
          return (
            <AchievementToastStack
              achievements={[]}
              onDismiss={dismissAchievement}
              batchCount={achievementBatchCount}
              onDismissBatch={dismissAchievementBatch}
            />
          );
        }
        if (pendingFeatureToasts.length > 0) {
          return (
            <FeatureUnlockToastStack
              features={pendingFeatureToasts}
              onDismiss={(code) => setPendingFeatureToasts(prev => prev.filter(f => f.code !== code))}
            />
          );
        }
        return null;
      })()}

      {/* Combo Toast — always shows (brief, non-blocking) */}
      <ComboToast comboEvent={comboEvent} />
    </GamificationContext.Provider>
  );
}
