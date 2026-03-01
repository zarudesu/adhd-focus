'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { BeatLogo } from '@/components/brand/BeatLogo';
import Link from 'next/link';

interface PersonalizedLandingProps {
  userName: string | null | undefined;
}

export function PersonalizedLanding({ userName }: PersonalizedLandingProps) {
  const [task, setTask] = useState('');
  const [captured, setCaptured] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = task.trim();
    if (!trimmed) return;

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: trimmed, status: 'inbox' }),
      });
      if (res.ok) {
        setCaptured(true);
        setTask('');
        setTimeout(() => setCaptured(false), 2000);
      }
    } catch {
      // silently fail
    }
  };

  const displayName = userName?.split(' ')[0] || 'there';

  return (
    <div className="landing-dark flex min-h-screen flex-col items-center justify-center px-6 bg-[#1A1A1A]">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <motion.div
          className="mb-6 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <BeatLogo size="xl" />
        </motion.div>

        {/* Greeting */}
        <motion.p
          className="mb-10 text-lg text-[#E5E7EB]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          Hey, {displayName}.
        </motion.p>

        {/* Quick capture input */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <div className="relative">
            <div
              className="absolute inset-0 rounded-2xl opacity-20"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(217, 249, 104, 0.3) 0%, transparent 70%)',
                filter: 'blur(20px)',
              }}
            />
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="Quick capture to inbox..."
                className="w-full h-14 pl-6 pr-16 text-base rounded-2xl
                  bg-[#232323] border border-white/10
                  text-[#E5E7EB] placeholder:text-[#6B7280]
                  focus:outline-none focus:border-[#D9F968]/30
                  focus:shadow-[0_0_30px_rgba(217,249,104,0.15)]
                  transition-all duration-300"
                autoComplete="off"
              />
              <motion.button
                type="submit"
                disabled={!task.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2
                  w-10 h-10 rounded-xl flex items-center justify-center
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

        {/* Captured feedback */}
        <div className="mt-4 h-6">
          <AnimatePresence>
            {captured && (
              <motion.p
                className="flex items-center justify-center gap-1.5 text-sm text-[#D9F968]"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
              >
                <Check className="w-4 h-4" />
                Captured to Inbox
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Dashboard link */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-[#232323] border border-white/10
              px-6 py-3 text-sm text-[#E5E7EB] hover:border-[#D9F968]/30 hover:text-[#D9F968]
              transition-all duration-200"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

        {/* Footer */}
        <motion.div
          className="mt-16 flex justify-center gap-4 text-xs text-[#6B7280]/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <Link href="/privacy" className="hover:text-[#D9F968]/70 transition-colors">
            Privacy Policy
          </Link>
          <span>&middot;</span>
          <Link href="/terms" className="hover:text-[#D9F968]/70 transition-colors">
            Terms of Service
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
