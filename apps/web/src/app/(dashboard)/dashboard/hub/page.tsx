'use client';

/**
 * Dashboard Hub - Main navigation page
 * Shows big centered buttons for all main sections
 * Progressive disclosure: only shows unlocked features
 */

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Inbox,
  Sun,
  Calendar,
  FolderKanban,
  CheckCircle2,
  Timer,
  Trophy,
  Sparkles,
  BarChart3,
  Settings,
  Lock,
} from 'lucide-react';
import { useFeatures } from '@/hooks/useFeatures';
import { cn } from '@/lib/utils';

interface NavItem {
  code: string;
  href: string;
  icon: React.ElementType;
  label: string;
  description: string;
  gradient: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    code: 'nav_inbox',
    href: '/dashboard/inbox',
    icon: Inbox,
    label: 'Inbox',
    description: 'Capture thoughts',
    gradient: 'from-blue-500/20 to-blue-600/10',
  },
  {
    code: 'nav_today',
    href: '/dashboard',
    icon: Sun,
    label: 'Today',
    description: 'Focus on now',
    gradient: 'from-amber-500/20 to-amber-600/10',
  },
  {
    code: 'nav_scheduled',
    href: '/dashboard/scheduled',
    icon: Calendar,
    label: 'Scheduled',
    description: 'Future tasks',
    gradient: 'from-purple-500/20 to-purple-600/10',
  },
  {
    code: 'nav_projects',
    href: '/dashboard/projects',
    icon: FolderKanban,
    label: 'Projects',
    description: 'Organize work',
    gradient: 'from-emerald-500/20 to-emerald-600/10',
  },
  {
    code: 'nav_completed',
    href: '/dashboard/completed',
    icon: CheckCircle2,
    label: 'Completed',
    description: 'Your wins',
    gradient: 'from-green-500/20 to-green-600/10',
  },
  {
    code: 'nav_focus',
    href: '/dashboard/focus',
    icon: Timer,
    label: 'Focus',
    description: 'Deep work timer',
    gradient: 'from-rose-500/20 to-rose-600/10',
  },
  {
    code: 'nav_achievements',
    href: '/dashboard/achievements',
    icon: Trophy,
    label: 'Achievements',
    description: 'Your progress',
    gradient: 'from-yellow-500/20 to-yellow-600/10',
  },
  {
    code: 'nav_creatures',
    href: '/dashboard/creatures',
    icon: Sparkles,
    label: 'Creatures',
    description: 'Your collection',
    gradient: 'from-pink-500/20 to-pink-600/10',
  },
  {
    code: 'nav_stats',
    href: '/dashboard/stats',
    icon: BarChart3,
    label: 'Statistics',
    description: 'Insights',
    gradient: 'from-cyan-500/20 to-cyan-600/10',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function HubPage() {
  const { navFeatures, loading } = useFeatures();

  // Check if a nav item is unlocked (all items now use nav_ prefix)
  const isNavItemUnlocked = (code: string): boolean => {
    const feature = navFeatures.find(f => f.code === code);
    return feature?.isUnlocked ?? (code === 'nav_inbox');
  };

  // Count locked items to show hint
  const lockedCount = NAV_ITEMS.filter(item => !isNavItemUnlocked(item.code)).length;

  return (
    <div className="flex-1 flex items-center justify-center p-4 min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl font-semibold mb-2">What do you want to do?</h1>
          <p className="text-muted-foreground">
            Pick a section to get started
          </p>
        </motion.div>

        {/* Navigation Grid */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 gap-3"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {NAV_ITEMS.map((navItem) => {
            const unlocked = isNavItemUnlocked(navItem.code);
            const Icon = navItem.icon;

            if (!unlocked && !loading) {
              // Show locked state
              return (
                <motion.div
                  key={navItem.code}
                  variants={item}
                  className={cn(
                    'relative p-4 rounded-xl border border-dashed border-muted-foreground/30',
                    'flex flex-col items-center justify-center text-center',
                    'bg-muted/20 opacity-50 cursor-not-allowed',
                    'min-h-[120px]'
                  )}
                >
                  <Lock className="h-6 w-6 text-muted-foreground mb-2" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Locked
                  </span>
                </motion.div>
              );
            }

            return (
              <motion.div key={navItem.code} variants={item}>
                <Link href={navItem.href}>
                  <div
                    className={cn(
                      'relative p-4 rounded-xl border bg-gradient-to-br',
                      navItem.gradient,
                      'flex flex-col items-center justify-center text-center',
                      'transition-all hover:scale-[1.02] hover:shadow-lg hover:border-primary/30',
                      'cursor-pointer min-h-[120px]'
                    )}
                  >
                    <Icon className="h-8 w-8 mb-2 text-primary" />
                    <span className="font-medium">{navItem.label}</span>
                    <span className="text-xs text-muted-foreground mt-0.5">
                      {navItem.description}
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}

          {/* Settings - always available */}
          <motion.div variants={item}>
            <Link href="/dashboard/settings">
              <div
                className={cn(
                  'relative p-4 rounded-xl border bg-gradient-to-br',
                  'from-slate-500/20 to-slate-600/10',
                  'flex flex-col items-center justify-center text-center',
                  'transition-all hover:scale-[1.02] hover:shadow-lg hover:border-primary/30',
                  'cursor-pointer min-h-[120px]'
                )}
              >
                <Settings className="h-8 w-8 mb-2 text-primary" />
                <span className="font-medium">Settings</span>
                <span className="text-xs text-muted-foreground mt-0.5">
                  Customize
                </span>
              </div>
            </Link>
          </motion.div>
        </motion.div>

        {/* Progressive unlock hint */}
        {lockedCount > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-sm text-muted-foreground mt-8"
          >
            Just start with the basics — more features unlock as you go.
          </motion.p>
        )}
      </div>
    </div>
  );
}
