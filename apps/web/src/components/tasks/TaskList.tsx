'use client';

import type { ReactNode } from 'react';
import type { Task } from '@/db/schema';
import { TaskCard } from './TaskCard';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export interface TaskListProps {
  tasks: Task[];
  loading?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  onComplete?: (id: string) => void;
  onUncomplete?: (id: string) => void;
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
  onMoveToToday?: (id: string) => void;
  onMoveToInbox?: (id: string) => void;
  onStartFocus?: (id: string) => void;
  onBreakDown?: (task: Task) => void;
  onTaskClick?: (task: Task) => void;
  className?: string;
  showProject?: boolean;
  projectMap?: Map<string, { name: string; emoji: string }>;
}

// Animation variants for task cards
const taskVariants = {
  initial: { opacity: 0, y: -10, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 500,
      damping: 30,
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    x: 20,
    transition: {
      duration: 0.2,
      ease: 'easeOut' as const,
    }
  },
};

export function TaskList({
  tasks,
  loading = false,
  emptyMessage = 'No tasks',
  emptyDescription = 'Tasks you add will appear here',
  emptyAction,
  onComplete,
  onUncomplete,
  onDelete,
  onArchive,
  onMoveToToday,
  onMoveToInbox,
  onStartFocus,
  onBreakDown,
  onTaskClick,
  className,
  showProject,
  projectMap,
}: TaskListProps) {
  // Loading state
  if (loading) {
    return (
      <div className={cn('space-y-2', className)}>
        {[1, 2, 3].map((i) => (
          <TaskCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  // Empty state
  if (tasks.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-12 text-center', className)}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center"
        >
          <div className="rounded-full bg-muted p-3 mb-3">
            <svg
              className="h-6 w-6 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-muted-foreground">{emptyMessage}</p>
          <p className="text-xs text-muted-foreground mt-1">{emptyDescription}</p>
        </motion.div>
        {emptyAction}
      </div>
    );
  }

  // Task list with animations
  return (
    <div className={cn('space-y-2', className)}>
      <AnimatePresence mode="popLayout" initial={false}>
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            layout
            variants={taskVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <TaskCard
              task={task}
              onComplete={onComplete}
              onUncomplete={onUncomplete}
              onDelete={onDelete}
              onArchive={onArchive}
              onMoveToToday={onMoveToToday}
              onMoveToInbox={onMoveToInbox}
              onStartFocus={onStartFocus}
              onBreakDown={onBreakDown}
              onClick={onTaskClick}
              showProject={showProject}
              projectInfo={showProject && projectMap && task.projectId ? projectMap.get(task.projectId) : undefined}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

function TaskCardSkeleton() {
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-card p-3">
      <Skeleton className="h-5 w-5 rounded" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-5 w-12 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
    </div>
  );
}
