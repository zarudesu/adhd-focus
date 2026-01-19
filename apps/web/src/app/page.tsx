'use client';

/**
 * Minimal Landing Page - beatyour8
 * ADHD-friendly: one input field, task list, celebrate on completion
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, ArrowRight, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UnlockModal } from '@/components/landing/UnlockModal';
import {
  addPendingTask,
  getPendingTasks,
  getPendingTaskCount,
  clearPendingTasks,
  type PendingTask,
} from '@/lib/pending-tasks';

export default function Home() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState<PendingTask[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showSparkle, setShowSparkle] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load existing tasks on mount
  useEffect(() => {
    setTasks(getPendingTasks());
  }, []);

  // Focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = task.trim();
    if (!trimmed) return;

    // Store task
    addPendingTask(trimmed);
    setTasks(getPendingTasks());
    setTask('');

    // Mini sparkle on add
    setShowSparkle(true);
    setTimeout(() => setShowSparkle(false), 800);
  };

  const handleComplete = (taskToComplete: PendingTask) => {
    // Remove from list
    const updatedTasks = tasks.filter(t => t.createdAt !== taskToComplete.createdAt);

    // Update localStorage
    clearPendingTasks();
    updatedTasks.forEach(t => addPendingTask(t.title));

    setTasks(updatedTasks);
    const newCompletedCount = completedCount + 1;
    setCompletedCount(newCompletedCount);

    // First completion: full celebration + modal
    if (newCompletedCount === 1) {
      setShowModal(true);
    }
    // Every 3 completions: show modal again
    else if (newCompletedCount % 3 === 0) {
      setShowModal(true);
    }
    // Other completions: mini sparkle effect
    else {
      setShowSparkle(true);
      setTimeout(() => setShowSparkle(false), 800);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md text-center">
        {/* Logo */}
        <motion.div
          className="flex items-center justify-center gap-2 mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <Timer className="h-8 w-8" />
          <span className="text-2xl font-bold">beatyour8</span>
        </motion.div>

        {/* Input form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
        >
          <div className="relative">
            <Input
              ref={inputRef}
              type="text"
              value={task}
              onChange={(e) => setTask(e.target.value)}
              placeholder="What's on your mind?"
              className="h-14 pl-5 pr-14 text-lg rounded-full border-2 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
              autoComplete="off"
            />
            <Button
              type="submit"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full"
              disabled={!task.trim()}
            >
              <ArrowRight className="h-5 w-5" />
            </Button>

            {/* Mini sparkle effect */}
            <AnimatePresence>
              {showSparkle && (
                <motion.div
                  className="absolute -right-2 -top-2"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Sparkles className="h-6 w-6 text-yellow-500" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.form>

        {/* Hint text */}
        <motion.p
          className="mt-3 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          {tasks.length === 0 ? 'Press Enter to add a task' : 'Check off a task to celebrate'}
        </motion.p>

        {/* Task list */}
        <AnimatePresence>
          {tasks.length > 0 && (
            <motion.div
              className="mt-6 space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {tasks.map((t, index) => (
                <motion.div
                  key={t.createdAt}
                  className="flex items-center gap-3 p-3 rounded-lg bg-card border hover:border-primary/30 transition-colors group cursor-pointer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, scale: 0.8 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleComplete(t)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {/* Checkbox */}
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-muted-foreground/30 group-hover:border-primary group-hover:bg-primary/10 transition-colors">
                    <Check className="h-4 w-4 text-transparent group-hover:text-primary transition-colors" />
                  </div>

                  {/* Task title */}
                  <span className="flex-1 text-left text-sm font-medium">
                    {t.title}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Completed count (only after first completion) */}
        <AnimatePresence>
          {completedCount > 0 && (
            <motion.div
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-green-500/10 border border-green-500/20 px-4 py-2 text-sm text-green-600"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Check className="h-4 w-4" />
              {completedCount} task{completedCount !== 1 ? 's' : ''} completed
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Unlock Modal */}
      <UnlockModal
        open={showModal}
        onClose={() => setShowModal(false)}
        taskCount={completedCount}
      />
    </div>
  );
}
