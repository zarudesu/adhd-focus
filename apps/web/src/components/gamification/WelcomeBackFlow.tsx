'use client';

/**
 * Welcome Back Flow — shown when user returns after 3+ days.
 * Compassionate re-engagement: celebrate return, offer fresh start.
 * Research: Fresh Start Effect, Compassion-Focused Therapy.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Archive, ArrowRight } from 'lucide-react';

interface WelcomeBackFlowProps {
  daysAway: number;
  overdueCount: number;
  onDismiss: () => void;
  onFreshStart: () => Promise<void>;
}

function getWelcomeMessage(daysAway: number): { heading: string; body: string } {
  if (daysAway >= 14) {
    return {
      heading: 'Hey. You came back.',
      body: 'That took courage. No matter how long it\'s been,\nshowing up is the hardest part. And you did it.',
    };
  }
  if (daysAway >= 7) {
    return {
      heading: 'Welcome back.',
      body: 'A week away doesn\'t erase anything.\nYour progress is still here. So are you.',
    };
  }
  return {
    heading: 'Hey. You\'re back.',
    body: 'A few days away is normal.\nFor ADHD brains, coming back IS the win.',
  };
}

export function WelcomeBackFlow({ daysAway, overdueCount, onDismiss, onFreshStart }: WelcomeBackFlowProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'welcome' | 'done'>('welcome');
  const message = getWelcomeMessage(daysAway);

  const handleFreshStart = async () => {
    setLoading(true);
    try {
      await onFreshStart();
      setStep('done');
      setTimeout(onDismiss, 1500);
    } catch {
      setLoading(false);
    }
  };

  if (typeof window === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-background/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="mx-4 w-full max-w-md rounded-2xl border bg-card p-8 shadow-lg"
        >
          {step === 'welcome' && (
            <div className="space-y-6">
              <div className="space-y-3 text-center">
                <h2 className="text-xl font-semibold tracking-tight">
                  {message.heading}
                </h2>
                <p className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
                  {message.body}
                </p>
              </div>

              {overdueCount > 0 && (
                <p className="text-center text-xs text-muted-foreground">
                  {overdueCount} {overdueCount === 1 ? 'task has' : 'tasks have'} been waiting.
                  {'\n'}You can sort them or start fresh.
                </p>
              )}

              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => { router.push('/dashboard/review'); onDismiss(); }}
                  className="w-full"
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Review all tasks
                </Button>
                {overdueCount > 0 && (
                  <Button
                    variant="outline"
                    onClick={handleFreshStart}
                    disabled={loading}
                    className="w-full"
                  >
                    <Archive className="h-4 w-4 mr-2" />
                    {loading ? 'Archiving...' : 'Fresh start'}
                  </Button>
                )}
                <p className="text-center text-[11px] text-muted-foreground mt-1">
                  Fresh start archives overdue tasks. You can find them later.
                </p>
              </div>
            </div>
          )}

          {step === 'done' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-2 py-4"
            >
              <h2 className="text-xl font-semibold">Clean slate.</h2>
              <p className="text-sm text-muted-foreground">
                What matters is today.
              </p>
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
