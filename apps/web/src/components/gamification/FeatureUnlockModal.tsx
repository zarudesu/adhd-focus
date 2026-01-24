'use client';

/**
 * Feature Unlock Modal
 * Celebrates when user unlocks a new feature
 *
 * Philosophy: Brief celebration, then guide to action
 * - Show what's unlocked with icon
 * - Explain value in one sentence
 * - "Got it!" to dismiss
 */

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import {
  Calendar,
  CheckCircle2,
  Folder,
  Inbox,
  ListChecks,
  Settings,
  Sun,
  Timer,
  Trophy,
  Zap,
  Ghost,
  BarChart3,
  Sparkles,
  Flag,
  Battery,
  Clock,
  Repeat,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FEATURE_TUTORIALS } from '@/lib/feature-tutorials';

// Map feature codes to icons
const FEATURE_ICONS: Record<string, React.ElementType> = {
  // Navigation features
  nav_inbox: Inbox,
  nav_process: Sparkles,
  nav_today: Sun,
  nav_scheduled: Calendar,
  nav_projects: Folder,
  nav_completed: CheckCircle2,
  nav_checklist: ListChecks,
  nav_quick_actions: Zap,
  nav_focus: Timer,
  nav_achievements: Trophy,
  nav_creatures: Ghost,
  nav_stats: BarChart3,
  nav_settings: Settings,
  // Task features
  priority_basic: Flag,
  priority_full: Flag,
  task_energy: Battery,
  task_duration: Clock,
  task_recurrence: Repeat,
  task_projects: Folder,
  task_scheduling: Calendar,
};

// Feature descriptions for the modal
const FEATURE_DESCRIPTIONS: Record<string, string> = {
  // Navigation features
  nav_inbox: 'Capture thoughts quickly without organizing',
  nav_process: 'Clear your inbox one task at a time',
  nav_today: 'Focus on what matters today',
  nav_scheduled: 'Plan tasks for future dates',
  nav_projects: 'Group related tasks together',
  nav_completed: 'See your accomplishments',
  nav_checklist: 'Build daily habits',
  nav_quick_actions: 'Fast 2-minute capture mode',
  nav_focus: 'Deep work with Pomodoro timer',
  nav_achievements: 'Track your progress milestones',
  nav_creatures: 'Collect rare creatures',
  nav_stats: 'Insights into your productivity',
  nav_settings: 'Customize your experience',
  // Task features
  priority_basic: 'Mark tasks as Must or Should to focus on what matters',
  priority_full: 'Four priority levels: Must, Should, Want, and Someday',
  task_energy: 'Match tasks to your current energy level',
  task_duration: 'Estimate how long tasks will take',
  task_recurrence: 'Tasks that repeat daily, weekly, or monthly',
  task_projects: 'Organize tasks into projects',
  task_scheduling: 'Schedule tasks for specific dates',
};

export interface FeatureUnlockData {
  code: string;
  name: string;
  celebrationText?: string | null;
}

interface FeatureUnlockModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: FeatureUnlockData | null;
  onDismiss?: (code: string) => void;
}

export function FeatureUnlockModal({
  open,
  onOpenChange,
  feature,
  onDismiss,
}: FeatureUnlockModalProps) {
  const [confettiVisible, setConfettiVisible] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simple confetti effect
  useEffect(() => {
    if (!open || !canvasRef.current) return;

    setConfettiVisible(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Confetti particles
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      rotation: number;
      rotationSpeed: number;
    }> = [];

    // Create particles
    const colors = ['#D9F968', '#3A6FF8', '#F5A524', '#10B981'];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.8) * 15,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
      });
    }

    let animationFrame: number;
    const gravity = 0.3;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let allFallen = true;
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += gravity;
        p.rotation += p.rotationSpeed;

        if (p.y < canvas.height + 100) {
          allFallen = false;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      if (!allFallen) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setConfettiVisible(false);
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [open]);

  if (!feature) return null;

  const IconComponent = FEATURE_ICONS[feature.code] || Sparkles;
  const description = FEATURE_DESCRIPTIONS[feature.code] || feature.celebrationText || 'A new feature is available';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => {
              onDismiss?.(feature.code);
              onOpenChange(false);
            }}
          />

          {/* Confetti canvas */}
          {confettiVisible && (
            <canvas
              ref={canvasRef}
              className="absolute inset-0 pointer-events-none z-10"
            />
          )}

          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{
              type: 'spring',
              damping: 20,
              stiffness: 300,
            }}
            className={cn(
              'relative z-20 w-full max-w-sm rounded-xl border bg-card p-6',
              'shadow-lg'
            )}
          >
            {/* Close button */}
            <button
              onClick={() => {
                onDismiss?.(feature.code);
                onOpenChange(false);
              }}
              className="absolute top-3 right-3 p-1 rounded-md hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>

            {/* Content */}
            <div className="text-center">
              {/* Icon with bounce animation */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                  type: 'spring',
                  damping: 12,
                  stiffness: 200,
                  delay: 0.2,
                }}
                className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10"
              >
                <IconComponent className="h-8 w-8 text-primary" />
              </motion.div>

              {/* Title */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-sm text-muted-foreground mb-1">
                  You unlocked
                </p>
                <h2 className="text-xl font-semibold mb-2">
                  {feature.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {description}
                </p>
              </motion.div>

              {/* Tutorial steps for non-nav features */}
              {!feature.code.startsWith('nav_') && FEATURE_TUTORIALS[feature.code] && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="mt-4 text-left bg-muted/50 rounded-lg p-3"
                >
                  {FEATURE_TUTORIALS[feature.code].steps.map((step, index) => (
                    <div key={index} className="flex gap-2 items-start mb-1 last:mb-0">
                      <span className="text-sm font-medium text-primary">{index + 1}.</span>
                      <span className="text-sm text-muted-foreground">{step}</span>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mt-6"
              >
                <Button
                  onClick={() => {
                    onDismiss?.(feature.code);
                    onOpenChange(false);
                  }}
                  className="w-full"
                >
                  Got it!
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
