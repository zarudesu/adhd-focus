'use client';

/**
 * Landing Page - beatyour8
 *
 * Design Philosophy: Organic Dark Mode, Soft Biomorphism
 * Visual Metaphor: Breaking the infinite loop of anxiety
 *
 * The interface should feel like a quiet room with dim lights
 * where you can whisper a thought and it gets caught safely.
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { BeatLogo } from '@/components/brand/BeatLogo';
import { UnlockModal } from '@/components/landing/UnlockModal';
import {
  addPendingTask,
  getPendingTasks,
  type PendingTask,
} from '@/lib/pending-tasks';

export default function Home() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState<PendingTask[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showContinueMessage, setShowContinueMessage] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load existing tasks on mount
  useEffect(() => {
    setTasks(getPendingTasks());
  }, []);

  // Focus input after logo animation
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = task.trim();
    if (!trimmed) return;

    // Store task
    addPendingTask(trimmed);
    const updatedTasks = getPendingTasks();
    setTasks(updatedTasks);
    setTask('');

    // After first task: show continue message
    if (updatedTasks.length >= 1) {
      setShowContinueMessage(true);
    }

    // Third task and every 3 tasks after: show registration modal
    if (updatedTasks.length >= 3 && updatedTasks.length % 3 === 0) {
      setTimeout(() => setShowModal(true), 300);
    }
  };

  const taskCount = tasks.length;

  return (
    <div className="landing-dark flex min-h-screen flex-col items-center justify-center px-6 bg-[#1A1A1A]">
      {/* Main content - organic, centered */}
      <div className="w-full max-w-md text-center">
        {/* Logo with draw animation */}
        <motion.div
          className="mb-6 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <BeatLogo size="xl" />
        </motion.div>

        {/* Tagline below logo - changes after tasks */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <AnimatePresence mode="wait">
            {showContinueMessage ? (
              <motion.p
                key="continue"
                className="text-sm text-[#D9F968]/70"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                Feels lighter, right? Keep going.
              </motion.p>
            ) : (
              <motion.p
                key="intro"
                className="text-sm text-[#9CA3AF] leading-relaxed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                A place to unload your thoughts.
                <br />
                <span className="text-[#6B7280]">Just dump them here — I'll help from there.</span>
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Input form - the capture pool */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5, duration: 0.5 }}
        >
          <div className="relative">
            {/* Soft glow background - the "pool" */}
            <div
              className="absolute inset-0 rounded-2xl opacity-20"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(217, 249, 104, 0.3) 0%, transparent 70%)',
                filter: 'blur(20px)',
              }}
            />

            {/* Input container - biomorphic shape */}
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full h-16 pl-6 pr-16 text-lg rounded-2xl
                  bg-[#232323] border border-white/10
                  text-[#E5E7EB] placeholder:text-[#6B7280]
                  focus:outline-none focus:border-[#D9F968]/30
                  focus:shadow-[0_0_30px_rgba(217,249,104,0.15)]
                  transition-all duration-300"
                autoComplete="off"
              />

              {/* Submit button - the escape dot */}
              <motion.button
                type="submit"
                disabled={!task.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2
                  w-10 h-10 rounded-xl
                  flex items-center justify-center
                  bg-transparent text-[#6B7280]
                  disabled:opacity-30 disabled:cursor-not-allowed
                  hover:bg-[#D9F968] hover:text-[#1A1A1A]
                  transition-all duration-200"
                whileHover={task.trim() ? { scale: 1.05 } : undefined}
                whileTap={task.trim() ? { scale: 0.95 } : undefined}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </motion.form>

        {/* Hint text */}
        <motion.p
          className="mt-5 text-sm text-[#6B7280]/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 0.3 }}
        >
          Press Enter to capture
        </motion.p>

        {/* Task list - floating islands */}
        <AnimatePresence>
          {taskCount > 0 && (
            <motion.div
              className="mt-10 space-y-3 text-left"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {/* Counter */}
              <p className="text-xs text-[#6B7280] mb-4 flex items-center gap-2">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: '#D9F968' }}
                />
                {taskCount} thought{taskCount !== 1 ? 's' : ''} captured
              </p>

              {/* Tasks as floating bubbles */}
              {tasks.map((t, index) => (
                <motion.div
                  key={t.id}
                  className="flex items-center gap-4 p-4 rounded-xl
                    bg-[#232323]/80 border border-white/5
                    backdrop-blur-sm"
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {/* Subtle glow dot */}
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{
                      background: '#D9F968',
                      boxShadow: '0 0 8px rgba(217, 249, 104, 0.4)'
                    }}
                  />

                  {/* Task title */}
                  <span className="flex-1 text-sm text-[#E5E7EB]/80">
                    {t.title}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Login link */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3.5, duration: 0.3 }}
        >
          <a
            href="/login"
            className="text-sm text-[#6B7280]/50 hover:text-[#D9F968]/70 transition-colors"
          >
            Already have an account? Sign in
          </a>
        </motion.div>
      </div>

      {/* Unlock Modal */}
      <UnlockModal
        open={showModal}
        onClose={() => setShowModal(false)}
        taskCount={taskCount}
      />
    </div>
  );
}
