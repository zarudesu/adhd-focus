'use client';

/**
 * Daily Quests — shows 3 micro-quests on the Today page.
 * Compact inline display, no modal.
 */

import { useQuests } from '@/hooks/useQuests';
import { motion, AnimatePresence } from 'framer-motion';

export function DailyQuests() {
  const { quests, loading } = useQuests();

  if (loading || quests.length === 0) return null;

  const allDone = quests.every(q => q.completed);

  return (
    <div className="mb-4 rounded-lg border bg-card p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Daily Quests
        </span>
        {allDone && (
          <span className="text-xs text-primary font-medium">All complete!</span>
        )}
      </div>
      <div className="flex gap-2 flex-wrap">
        <AnimatePresence>
          {quests.map((quest) => (
            <motion.div
              key={quest.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                quest.completed
                  ? 'bg-primary/10 text-primary line-through opacity-60'
                  : 'bg-muted text-foreground'
              }`}
            >
              <span>{quest.emoji}</span>
              <span>{quest.label}</span>
              {!quest.completed && quest.target > 1 && (
                <span className="text-muted-foreground">
                  {quest.progress}/{quest.target}
                </span>
              )}
              {quest.completed && <span>✓</span>}
              <span className="text-muted-foreground">+{quest.xpReward}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
