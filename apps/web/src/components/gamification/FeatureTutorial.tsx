'use client';

/**
 * Feature Tutorial Component
 * Shows mini-tutorial when user first opens a newly unlocked feature
 *
 * Philosophy: ADHD-friendly, brief, actionable
 * - Semi-transparent overlay
 * - Centered card with 2-3 bullet points
 * - "Start" button to dismiss
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FEATURE_TUTORIALS, type TutorialContent } from '@/lib/feature-tutorials';
import { cn } from '@/lib/utils';

interface FeatureTutorialProps {
  featureCode: string;
  tutorial?: TutorialContent | null;
  onComplete: () => void;
}

export function FeatureTutorial({
  featureCode,
  tutorial: providedTutorial,
  onComplete,
}: FeatureTutorialProps) {
  // Use provided tutorial or look up from static content
  const tutorial = providedTutorial || FEATURE_TUTORIALS[featureCode];

  if (!tutorial) {
    // No tutorial content, just complete immediately
    onComplete();
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        {/* Semi-transparent backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/60 backdrop-blur-[2px]"
          onClick={onComplete}
        />

        {/* Tutorial card */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.98 }}
          transition={{
            duration: 0.3,
            ease: [0.16, 1, 0.3, 1], // ease-out-expo
          }}
          className={cn(
            'relative z-10 w-full max-w-sm rounded-xl border bg-card p-6',
            'shadow-lg'
          )}
        >
          {/* Icon + Title */}
          <div className="text-center mb-4">
            {tutorial.icon && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'spring',
                  damping: 12,
                  stiffness: 200,
                  delay: 0.1,
                }}
                className="inline-block text-4xl mb-2"
              >
                {tutorial.icon}
              </motion.span>
            )}
            <h2 className="text-lg font-semibold">
              {tutorial.title}
            </h2>
          </div>

          {/* Steps */}
          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-3 mb-6"
          >
            {tutorial.steps.map((step, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="flex items-start gap-3"
              >
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                  {index + 1}
                </span>
                <span className="text-sm text-muted-foreground pt-0.5">
                  {step}
                </span>
              </motion.li>
            ))}
          </motion.ul>

          {/* Start button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              onClick={onComplete}
              className="w-full"
            >
              Start
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Hook for managing tutorial state on feature pages
 * Call this on feature page mount to check if tutorial should show
 */
export function useFeatureTutorial(featureCode: string) {
  // This will be handled by the useFeatures hook
  // This is just a placeholder for the pattern
  return {
    shouldShowTutorial: false,
    dismissTutorial: () => {},
  };
}
