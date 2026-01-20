'use client';

/**
 * Calm Review Component
 *
 * Design Philosophy: "This was enough."
 * Not celebratory - acknowledging. Calm reflection after focus session.
 * No confetti, no sparkles - just quiet recognition.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface CalmReviewProps {
  open: boolean;
  onClose: () => void;
  minutes: number;
  taskTitle?: string;
}

export function CalmReview({ open, onClose, minutes, taskTitle }: CalmReviewProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop - soft fade */}
          <motion.div
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal - minimal, calm */}
          <motion.div
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 px-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="rounded-2xl border bg-card p-6 text-center shadow-lg">
              {/* Simple acknowledgment */}
              <p className="text-lg font-medium text-foreground">
                {minutes} minutes. Done.
              </p>

              {/* Task reference if selected */}
              {taskTitle && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {taskTitle}
                </p>
              )}

              {/* Calm reflection */}
              <p className="mt-4 text-sm text-muted-foreground">
                This was enough.
              </p>

              {/* Single action */}
              <Button
                onClick={onClose}
                className="mt-6 w-full"
                variant="outline"
              >
                Continue
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
