'use client';

/**
 * Today Page Introduction
 * Shows on first visit when user has tasks assigned to Today
 *
 * beatyour8 Philosophy: Help, don't overwhelm
 * Just explain the concept - 3 tasks max, focus on what matters
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sun, Target, CheckCircle2 } from 'lucide-react';

interface TodayIntroProps {
  taskCount: number;
  onDismiss: () => void;
}

const STORAGE_KEY = 'adhd-focus-today-intro-seen';

export function TodayIntro({ taskCount, onDismiss }: TodayIntroProps) {
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Sun className="h-8 w-8 text-primary" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">This is Today</h2>
            <p className="text-muted-foreground">
              {taskCount === 1
                ? "You've chosen 1 task to focus on."
                : `You've chosen ${taskCount} task${taskCount > 1 ? 's' : ''} to focus on.`}
            </p>
          </div>

          {/* The 3 rules - calm, helpful */}
          <div className="space-y-4 text-left bg-muted/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Maximum 3 tasks</p>
                <p className="text-sm text-muted-foreground">
                  ADHD brains work better with fewer choices.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Sun className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Only for today</p>
                <p className="text-sm text-muted-foreground">
                  Tomorrow is a fresh start with fresh tasks.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Complete = mindfulness</p>
                <p className="text-sm text-muted-foreground">
                  Each completion builds your focus muscle.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <Button onClick={onDismiss} size="lg" className="w-full">
            Got it
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * Hook to manage Today intro visibility
 * Shows intro only once per user (stored in localStorage)
 */
export function useTodayIntro() {
  const [showIntro, setShowIntro] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Check if intro was already seen (use setTimeout to batch state updates)
    const timeoutId = setTimeout(() => {
      const seen = localStorage.getItem(STORAGE_KEY);
      if (!seen) {
        setShowIntro(true);
      }
      setChecked(true);
    }, 0);
    return () => clearTimeout(timeoutId);
  }, []);

  const dismissIntro = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setShowIntro(false);
  };

  return {
    showIntro,
    checked,
    dismissIntro,
  };
}
