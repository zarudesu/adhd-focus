'use client';

/**
 * Unlock Modal - Calm acknowledgment + registration prompt
 *
 * Design Philosophy: Organic Dark Mode, Soft Biomorphism
 * The modal is a soft container that appears gently,
 * like a bubble rising to the surface.
 *
 * No confetti, no sparkles - just calm recognition.
 */

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { BeatLogo } from '@/components/brand/BeatLogo';

interface UnlockModalProps {
  open: boolean;
  onClose: () => void;
  taskCount: number;
}

export function UnlockModal({ open, onClose, taskCount }: UnlockModalProps) {
  const router = useRouter();

  const handleCreateAccount = () => {
    router.push('/signup?callbackUrl=/dashboard/inbox&sync=pending');
  };

  const isFirstTask = taskCount === 1;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop - deep, immersive */}
          <motion.div
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(26, 26, 26, 0.95)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal - biomorphic container */}
          <motion.div
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 px-4"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            {/* Soft glow behind modal */}
            <div
              className="absolute inset-0 -z-10"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(217, 249, 104, 0.08) 0%, transparent 60%)',
                filter: 'blur(40px)',
                transform: 'scale(1.5)',
              }}
            />

            <div
              className="rounded-3xl p-8 text-center"
              style={{
                background: '#232323',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              }}
            >
              {/* Logo as accent */}
              <div className="mb-6 flex justify-center">
                <BeatLogo size="md" />
              </div>

              {/* Heading - calm, not celebratory */}
              <h2 className="text-xl font-medium text-[#E5E7EB] mb-3">
                {isFirstTask ? 'Captured.' : `${taskCount} thoughts captured.`}
              </h2>

              {/* Body - explains the value */}
              <p className="text-[#9CA3AF] text-sm leading-relaxed mb-6 whitespace-pre-line">
                {isFirstTask
                  ? "You took the first step.\nThat's what matters."
                  : "You're building momentum.\nDon't lose it."}
              </p>

              {/* Unlock badge - subtle glow */}
              <div
                className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs mb-8"
                style={{
                  background: 'rgba(217, 249, 104, 0.1)',
                  color: '#D9F968',
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: '#D9F968',
                    boxShadow: '0 0 6px rgba(217, 249, 104, 0.6)',
                  }}
                />
                {isFirstTask ? 'Registration available' : 'Save your progress'}
              </div>

              {/* Buttons - organic shapes */}
              <div className="space-y-3">
                <motion.button
                  onClick={handleCreateAccount}
                  className="w-full h-12 rounded-xl flex items-center justify-center gap-2 font-medium transition-all"
                  style={{
                    background: '#D9F968',
                    color: '#1A1A1A',
                  }}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: '0 0 30px rgba(217, 249, 104, 0.3)',
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  Create Account
                  <ArrowRight className="w-4 h-4" />
                </motion.button>

                <motion.button
                  onClick={onClose}
                  className="w-full h-10 rounded-xl text-sm transition-colors"
                  style={{ color: '#6B7280' }}
                  whileHover={{ color: '#9CA3AF' }}
                >
                  Continue without saving
                </motion.button>
              </div>

              {/* Subtle hint */}
              <p className="mt-6 text-xs" style={{ color: 'rgba(107, 114, 128, 0.6)' }}>
                Your thoughts are stored locally until you sign up
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
