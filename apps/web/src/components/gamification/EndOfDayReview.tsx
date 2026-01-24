'use client';

/**
 * End of Day Review Component
 * beatyour8 Philosophy: Close the day with acceptance
 *
 * Not celebration. Not guilt.
 * Just acknowledgment: "This was what today held."
 *
 * Flow:
 * 1. Show today's summary (tasks, mindfulness, streaks)
 * 2. User clicks "Close Day"
 * 3. CalmReview appears with day_end message
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Moon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DaySummary {
  tasksCompleted: number;
  totalTasks: number;
  mindfulnessEarned: number;
  focusMinutes: number;
  streakDays: number;
}

interface EndOfDayReviewProps {
  open: boolean;
  onClose: () => void;
  onCloseDay: () => void;
  summary: DaySummary;
}

export function EndOfDayReview({
  open,
  onClose,
  onCloseDay,
  summary,
}: EndOfDayReviewProps) {
  const { tasksCompleted, totalTasks, mindfulnessEarned, focusMinutes, streakDays } = summary;

  // Generate reflection message based on day
  const getReflection = () => {
    if (tasksCompleted === 0) {
      return "Some days are like this. Tomorrow is fresh.";
    }
    if (tasksCompleted === totalTasks && totalTasks > 0) {
      return "Everything you planned. Done.";
    }
    if (tasksCompleted > 0) {
      return "You moved forward. That's what counts.";
    }
    return "The day happened. That's enough.";
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[99] bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed left-1/2 top-1/2 z-[100] w-full max-w-sm -translate-x-1/2 -translate-y-1/2 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className="rounded-2xl border bg-card p-6 shadow-lg">
              {/* Header - subtle, calm */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <Moon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h2 className="font-medium">End of Day</h2>
                  <p className="text-sm text-muted-foreground">
                    {new Date().toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              {/* Summary - minimal stats */}
              <div className="space-y-3 mb-6">
                {/* Tasks */}
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Tasks completed</span>
                  <span className="font-medium">
                    {tasksCompleted}
                    {totalTasks > 0 && (
                      <span className="text-muted-foreground font-normal"> / {totalTasks}</span>
                    )}
                  </span>
                </div>

                {/* Mindfulness */}
                {mindfulnessEarned > 0 && (
                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">Mindfulness earned</span>
                    <span className="font-medium">+{mindfulnessEarned}</span>
                  </div>
                )}

                {/* Focus time */}
                {focusMinutes > 0 && (
                  <div className="flex items-center justify-between py-2 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">Focus time</span>
                    <span className="font-medium">{focusMinutes} min</span>
                  </div>
                )}

                {/* Streak */}
                {streakDays > 0 && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-muted-foreground">Current streak</span>
                    <span className="font-medium">{streakDays} days</span>
                  </div>
                )}
              </div>

              {/* Reflection - the meaning */}
              <p className="text-center text-muted-foreground text-sm mb-6">
                {getReflection()}
              </p>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Button
                  onClick={onCloseDay}
                  className="w-full"
                >
                  This was enough
                </Button>
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="w-full text-muted-foreground"
                >
                  Not yet
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Floating button to trigger end of day review
 * Only shows after 6 PM or when tasks are completed
 */
interface CloseDayButtonProps {
  onClick: () => void;
  className?: string;
}

export function CloseDayButton({ onClick, className }: CloseDayButtonProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if it's evening (after 6 PM)
    const checkTime = () => {
      const hour = new Date().getHours();
      setVisible(hour >= 18 || hour < 4); // Show between 6 PM and 4 AM
    };

    checkTime();
    const interval = setInterval(checkTime, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={cn(
        "gap-2 text-muted-foreground hover:text-foreground",
        className
      )}
    >
      <Moon className="h-4 w-4" />
      Close Day
    </Button>
  );
}
