'use client';

/**
 * Unlock Modal - First task celebration + registration prompt
 * Beautiful building blocks animation + confetti
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkles, Zap, ArrowRight, CheckCircle } from 'lucide-react';

interface UnlockModalProps {
  open: boolean;
  onClose: () => void;
  taskCount: number;
}

// Building block colors
const BLOCK_COLORS = [
  'from-violet-500 to-purple-600',
  'from-cyan-400 to-blue-500',
  'from-emerald-400 to-green-500',
  'from-amber-400 to-orange-500',
  'from-pink-400 to-rose-500',
  'from-indigo-400 to-blue-600',
];

// Confetti colors
const CONFETTI_COLORS = ['#fbbf24', '#f59e0b', '#ef4444', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];

// Building blocks that assemble together
function BuildingBlocks() {
  const blocks = [
    { x: -80, y: 100, rotate: -45, delay: 0, size: 'w-16 h-16', color: BLOCK_COLORS[0] },
    { x: 80, y: 120, rotate: 30, delay: 0.1, size: 'w-14 h-14', color: BLOCK_COLORS[1] },
    { x: -60, y: -80, rotate: 60, delay: 0.15, size: 'w-12 h-12', color: BLOCK_COLORS[2] },
    { x: 100, y: -60, rotate: -20, delay: 0.2, size: 'w-10 h-10', color: BLOCK_COLORS[3] },
    { x: 0, y: 140, rotate: 15, delay: 0.25, size: 'w-12 h-12', color: BLOCK_COLORS[4] },
    { x: -100, y: 0, rotate: -60, delay: 0.3, size: 'w-8 h-8', color: BLOCK_COLORS[5] },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {blocks.map((block, i) => (
        <motion.div
          key={i}
          className={`absolute left-1/2 top-1/2 ${block.size} rounded-xl bg-gradient-to-br ${block.color} shadow-lg`}
          initial={{
            x: block.x * 3,
            y: block.y * 3,
            rotate: block.rotate * 2,
            opacity: 0,
            scale: 0.3,
          }}
          animate={{
            x: block.x * 0.3,
            y: block.y * 0.3,
            rotate: block.rotate * 0.2,
            opacity: [0, 1, 1, 0.8],
            scale: [0.3, 1.2, 1, 0.9],
          }}
          transition={{
            duration: 1.2,
            delay: block.delay,
            ease: [0.34, 1.56, 0.64, 1], // Spring-like ease
          }}
          style={{
            marginLeft: `-${parseInt(block.size.split(' ')[0].replace('w-', '')) * 2}px`,
            marginTop: `-${parseInt(block.size.split(' ')[0].replace('w-', '')) * 2}px`,
          }}
        />
      ))}
    </div>
  );
}

// Sparkle particles that burst out
function SparkleParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    angle: (i / 20) * 360,
    distance: 80 + Math.random() * 60,
    size: 4 + Math.random() * 6,
    delay: Math.random() * 0.3,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map((p, i) => {
        const rad = (p.angle * Math.PI) / 180;
        const x = Math.cos(rad) * p.distance;
        const y = Math.sin(rad) * p.distance;

        return (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            }}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
            animate={{
              x: [0, x * 1.5, x * 2],
              y: [0, y * 1.5, y * 2],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 1.5,
              delay: 0.4 + p.delay,
              ease: 'easeOut',
            }}
          />
        );
      })}
    </div>
  );
}

// Confetti rain
function Confetti() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          initial={{
            x: `${Math.random() * 100}vw`,
            y: -20,
            rotate: 0,
          }}
          animate={{
            y: '110vh',
            rotate: Math.random() * 720 - 360,
          }}
          transition={{
            duration: 2.5 + Math.random() * 2,
            delay: Math.random() * 0.8,
            ease: 'linear',
          }}
        >
          <motion.span
            className="block rounded-sm"
            style={{
              width: 8 + Math.random() * 4,
              height: 8 + Math.random() * 4,
              backgroundColor: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
            }}
            animate={{
              rotateX: [0, 360],
              rotateY: [0, 360],
            }}
            transition={{
              duration: 1 + Math.random(),
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </motion.div>
      ))}
    </div>
  );
}

// Central icon that pulses and glows
function CelebrationIcon() {
  return (
    <motion.div
      className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 0.6, type: 'spring', stiffness: 200, damping: 15 }}
    >
      {/* Glow rings */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.5, 0.2, 0.5],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute inset-2 rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.7, 0.3, 0.7],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
      />

      {/* Main icon */}
      <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 shadow-2xl">
        <Sparkles className="h-10 w-10 text-white" />
      </div>
    </motion.div>
  );
}

export function UnlockModal({ open, onClose, taskCount }: UnlockModalProps) {
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (open) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleCreateAccount = () => {
    router.push('/signup?callbackUrl=/dashboard/inbox&sync=pending');
  };

  const isFirstTask = taskCount === 1;

  return (
    <AnimatePresence>
      {open && (
        <>
          {showConfetti && <Confetti />}

          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 px-4"
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          >
            <div className="relative rounded-2xl border bg-card p-8 shadow-2xl text-center overflow-hidden">
              {/* Building blocks animation */}
              <BuildingBlocks />
              <SparkleParticles />

              {/* Celebration icon */}
              <CelebrationIcon />

              {/* Title */}
              <motion.h2
                className="text-2xl font-bold mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                {isFirstTask ? 'Amazing!' : `${taskCount} tasks done!`}
              </motion.h2>

              {/* Description */}
              <motion.p
                className="text-muted-foreground mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                {isFirstTask
                  ? "You just completed your first task!"
                  : "You're on a roll. Don't lose your progress."}
              </motion.p>

              {/* Unlock badge with shimmer */}
              <motion.div
                className="relative inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium mb-6 overflow-hidden"
                style={{
                  background: 'linear-gradient(90deg, #fbbf24, #f59e0b, #fcd34d, #fbbf24)',
                  backgroundSize: '200% 100%',
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  backgroundPosition: ['0% 0%', '200% 0%'],
                }}
                transition={{
                  opacity: { delay: 0.9 },
                  scale: { delay: 0.9, type: 'spring' },
                  backgroundPosition: { duration: 2, repeat: Infinity, ease: 'linear', delay: 1.5 }
                }}
              >
                {/* Shimmer sweep */}
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
                  }}
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatDelay: 2,
                    ease: 'easeInOut',
                    delay: 1.2,
                  }}
                />

                {/* Sparkle bursts */}
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{
                      left: `${20 + i * 30}%`,
                      top: '50%',
                    }}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: [0, 1.5, 0],
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 0.6,
                      delay: 2.5 + i * 0.2,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                  >
                    <Sparkles className="h-3 w-3 text-white drop-shadow-lg" />
                  </motion.div>
                ))}

                <Zap className="h-4 w-4 text-white relative z-10" />
                <span className="text-white font-semibold relative z-10 drop-shadow-sm">
                  {isFirstTask ? "You've unlocked: Registration" : 'Save your progress'}
                </span>
              </motion.div>

              {/* Buttons */}
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  onClick={handleCreateAccount}
                >
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  onClick={onClose}
                >
                  Maybe Later
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
