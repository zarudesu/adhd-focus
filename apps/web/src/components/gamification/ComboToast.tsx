'use client';

/**
 * Combo Toast — shows when user completes tasks in rapid succession.
 * Appears briefly (2s) with combo count and bonus XP.
 */

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface ComboToastProps {
  comboEvent: { count: number; bonusXp: number; timestamp: number } | null;
}

export function ComboToast({ comboEvent }: ComboToastProps) {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState<{ count: number; bonusXp: number } | null>(null);

  useEffect(() => {
    if (!comboEvent) return;
    const showTimer = setTimeout(() => {
      setCurrent({ count: comboEvent.count, bonusXp: comboEvent.bonusXp });
      setVisible(true);
    }, 0);
    const hideTimer = setTimeout(() => setVisible(false), 2500);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [comboEvent]);

  return (
    <AnimatePresence>
      {visible && current && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
        >
          <div className="bg-primary text-primary-foreground px-5 py-3 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium">
            <span className="text-lg">
              {current.count >= 7 ? '🔥' : current.count >= 5 ? '⚡' : '✨'}
            </span>
            <span>Combo x{current.count}!</span>
            <span className="text-primary-foreground/70">+{current.bonusXp} XP</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
