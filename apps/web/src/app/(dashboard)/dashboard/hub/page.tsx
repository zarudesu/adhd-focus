'use client';

/**
 * Dashboard Hub - Main navigation page
 * Shows big centered buttons for all main sections
 * Progressive disclosure: only shows unlocked features
 * Drag & drop to reorder (saved to localStorage)
 */

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  ListChecks,
  Zap,
  GripVertical,
} from 'lucide-react';
import { useFeatures } from '@/hooks/useFeatures';
import { cn } from '@/lib/utils';

interface NavItemConfig {
  code: string;
  href: string;
  icon: React.ElementType;
  label: string;
  description: string;
  gradient: string;
}

// All possible nav items with their config
const NAV_CONFIG: Record<string, NavItemConfig> = {
  nav_inbox: {
    code: 'nav_inbox',
    href: '/dashboard/inbox',
    icon: Inbox,
    label: 'Inbox',
    description: 'Capture thoughts',
    gradient: 'from-blue-500/20 to-blue-600/10',
  },
  nav_today: {
    code: 'nav_today',
    href: '/dashboard',
    icon: Sun,
    label: 'Today',
    description: 'Focus on now',
    gradient: 'from-amber-500/20 to-amber-600/10',
  },
  nav_scheduled: {
    code: 'nav_scheduled',
    href: '/dashboard/scheduled',
    icon: Calendar,
    label: 'Scheduled',
    description: 'Future tasks',
    gradient: 'from-purple-500/20 to-purple-600/10',
  },
  nav_projects: {
    code: 'nav_projects',
    href: '/dashboard/projects',
    icon: FolderKanban,
    label: 'Projects',
    description: 'Organize work',
    gradient: 'from-emerald-500/20 to-emerald-600/10',
  },
  nav_completed: {
    code: 'nav_completed',
    href: '/dashboard/completed',
    icon: CheckCircle2,
    label: 'Completed',
    description: 'Your wins',
    gradient: 'from-green-500/20 to-green-600/10',
  },
  nav_checklist: {
    code: 'nav_checklist',
    href: '/dashboard/checklist',
    icon: ListChecks,
    label: 'Checklist',
    description: 'Daily habits',
    gradient: 'from-teal-500/20 to-teal-600/10',
  },
  nav_quick_actions: {
    code: 'nav_quick_actions',
    href: '/dashboard/quick-actions',
    icon: Zap,
    label: 'Quick Actions',
    description: 'Fast capture',
    gradient: 'from-orange-500/20 to-orange-600/10',
  },
  nav_focus: {
    code: 'nav_focus',
    href: '/dashboard/focus',
    icon: Timer,
    label: 'Focus',
    description: 'Deep work timer',
    gradient: 'from-rose-500/20 to-rose-600/10',
  },
  nav_achievements: {
    code: 'nav_achievements',
    href: '/dashboard/achievements',
    icon: Trophy,
    label: 'Achievements',
    description: 'Your progress',
    gradient: 'from-yellow-500/20 to-yellow-600/10',
  },
  nav_creatures: {
    code: 'nav_creatures',
    href: '/dashboard/creatures',
    icon: Sparkles,
    label: 'Creatures',
    description: 'Your collection',
    gradient: 'from-pink-500/20 to-pink-600/10',
  },
  nav_stats: {
    code: 'nav_stats',
    href: '/dashboard/stats',
    icon: BarChart3,
    label: 'Statistics',
    description: 'Insights',
    gradient: 'from-cyan-500/20 to-cyan-600/10',
  },
};

// Default order for nav items
const DEFAULT_ORDER = [
  'nav_inbox',
  'nav_today',
  'nav_scheduled',
  'nav_projects',
  'nav_completed',
  'nav_checklist',
  'nav_quick_actions',
  'nav_focus',
  'nav_achievements',
  'nav_creatures',
  'nav_stats',
];

const STORAGE_KEY = 'hub-nav-order';

// Sortable nav card component
function SortableNavCard({
  navItem,
  isUnlocked,
  isDragging,
}: {
  navItem: NavItemConfig;
  isUnlocked: boolean;
  isDragging?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isCurrentlyDragging,
  } = useSortable({ id: navItem.code, disabled: !isUnlocked });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isCurrentlyDragging ? 50 : undefined,
  };

  const Icon = navItem.icon;

  if (!isUnlocked) {
    return (
      <div
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
      </div>
    );
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group">
      {/* Drag handle - visible on hover */}
      <div
        {...attributes}
        {...listeners}
        className={cn(
          'absolute -top-2 -right-2 z-10 p-1.5 rounded-full',
          'bg-background border shadow-sm cursor-grab active:cursor-grabbing',
          'opacity-0 group-hover:opacity-100 transition-opacity',
          isCurrentlyDragging && 'opacity-100'
        )}
      >
        <GripVertical className="h-3 w-3 text-muted-foreground" />
      </div>

      <Link href={navItem.href}>
        <div
          className={cn(
            'relative p-4 rounded-xl border bg-gradient-to-br',
            navItem.gradient,
            'flex flex-col items-center justify-center text-center',
            'transition-all hover:scale-[1.02] hover:shadow-lg hover:border-primary/30',
            'cursor-pointer min-h-[120px]',
            isCurrentlyDragging && 'shadow-xl scale-105 opacity-90'
          )}
        >
          <Icon className="h-8 w-8 mb-2 text-primary" />
          <span className="font-medium">{navItem.label}</span>
          <span className="text-xs text-muted-foreground mt-0.5">
            {navItem.description}
          </span>
        </div>
      </Link>
    </div>
  );
}

export default function HubPage() {
  const { navFeatures, loading } = useFeatures();
  const [order, setOrder] = useState<string[]>(DEFAULT_ORDER);
  const [mounted, setMounted] = useState(false);

  // Load saved order from localStorage
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with default order to include any new items
        const merged = [
          ...parsed.filter((code: string) => DEFAULT_ORDER.includes(code)),
          ...DEFAULT_ORDER.filter((code) => !parsed.includes(code)),
        ];
        setOrder(merged);
      } catch {
        setOrder(DEFAULT_ORDER);
      }
    }
  }, []);

  // Save order to localStorage
  const saveOrder = (newOrder: string[]) => {
    setOrder(newOrder);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newOrder));
  };

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Check if a nav item is unlocked
  const isNavItemUnlocked = (code: string): boolean => {
    const feature = navFeatures.find((f) => f.code === code);
    return feature?.isUnlocked ?? code === 'nav_inbox';
  };

  // Get ordered nav items (only those with config)
  const orderedItems = useMemo(() => {
    return order
      .filter((code) => NAV_CONFIG[code])
      .map((code) => NAV_CONFIG[code]);
  }, [order]);

  // Only unlocked items should be in sortable context
  const sortableItems = useMemo(() => {
    return order.filter((code) => isNavItemUnlocked(code));
  }, [order, navFeatures]);

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = order.indexOf(active.id as string);
      const newIndex = order.indexOf(over.id as string);
      const newOrder = arrayMove(order, oldIndex, newIndex);
      saveOrder(newOrder);
    }
  };

  // Count locked items
  const lockedCount = orderedItems.filter(
    (item) => !isNavItemUnlocked(item.code)
  ).length;

  if (!mounted) {
    return null;
  }

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

        {/* Navigation Grid with DnD */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={sortableItems} strategy={rectSortingStrategy}>
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {orderedItems.map((navItem) => (
                <SortableNavCard
                  key={navItem.code}
                  navItem={navItem}
                  isUnlocked={isNavItemUnlocked(navItem.code)}
                />
              ))}

              {/* Settings - always available, not draggable */}
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
          </SortableContext>
        </DndContext>

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

        {/* Drag hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-center text-xs text-muted-foreground/60 mt-2"
        >
          Drag to reorder
        </motion.p>
      </div>
    </div>
  );
}
