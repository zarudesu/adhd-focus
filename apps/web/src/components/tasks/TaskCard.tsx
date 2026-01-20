'use client';

import { useState } from 'react';
import type { Task } from '@/db/schema';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Calendar,
  Clock,
  Inbox,
  Sun,
  Trash2,
  Play,
  Archive,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFeatures } from '@/hooks/useFeatures';

type EnergyLevel = 'low' | 'medium' | 'high';
type Priority = 'must' | 'should' | 'want' | 'someday';

// Energy level config - neutral, calm colors
const ENERGY_CONFIG: Record<EnergyLevel, { label: string; className: string }> = {
  low: { label: 'Low', className: 'bg-muted text-muted-foreground' },
  medium: { label: 'Med', className: 'bg-muted text-muted-foreground' },
  high: { label: 'High', className: 'bg-muted text-muted-foreground' },
};

// Priority config - neutral, no urgency colors
const PRIORITY_CONFIG: Record<Priority, { label: string; className: string }> = {
  must: { label: 'Must', className: 'bg-muted text-foreground' },
  should: { label: 'Should', className: 'bg-muted text-muted-foreground' },
  want: { label: 'Want', className: 'bg-muted text-muted-foreground' },
  someday: { label: 'Someday', className: 'bg-muted text-muted-foreground' },
};

export interface TaskCardProps {
  task: Task;
  onComplete?: (id: string) => void;
  onUncomplete?: (id: string) => void;
  onDelete?: (id: string) => void;
  onArchive?: (id: string) => void;
  onMoveToToday?: (id: string) => void;
  onMoveToInbox?: (id: string) => void;
  onStartFocus?: (id: string) => void;
  onClick?: (task: Task) => void;
  showProject?: boolean;
}

export function TaskCard({
  task,
  onComplete,
  onUncomplete,
  onDelete,
  onArchive,
  onMoveToToday,
  onMoveToInbox,
  onStartFocus,
  onClick,
  showProject = false,
}: TaskCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const { isUnlocked } = useFeatures();
  const isCompleted = task.status === 'done';
  const isInProgress = task.status === 'in_progress';

  // Feature gating for badges
  const showEnergyBadge = isUnlocked('energy');
  const showPriorityBadge = isUnlocked('priority');

  const handleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onComplete || isCompleting) return;

    setIsCompleting(true);
    try {
      await onComplete(task.id);
    } finally {
      setIsCompleting(false);
    }
  };

  const handleCheckboxChange = () => {
    if (isCompleting) return;
    if (isCompleted) {
      onUncomplete?.(task.id);
    } else {
      onComplete?.(task.id);
    }
  };

  const formatDueDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isCompleted;
  const energyRequired = task.energyRequired || 'medium';
  const priority = task.priority || 'should';

  return (
    <div
      className={cn(
        'group flex items-start gap-3 rounded-lg border bg-card p-3 transition-all',
        'hover:shadow-sm hover:border-primary/20',
        isInProgress && 'border-primary/50 bg-primary/5',
        isCompleted && 'opacity-60',
        onClick && 'cursor-pointer'
      )}
      onClick={() => onClick?.(task)}
    >
      {/* Checkbox */}
      <div className="pt-0.5">
        <Checkbox
          checked={isCompleted}
          disabled={isCompleting}
          onCheckedChange={handleCheckboxChange}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'h-5 w-5',
            isInProgress && 'border-primary'
          )}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <p
          className={cn(
            'text-sm font-medium leading-tight',
            isCompleted && 'line-through text-muted-foreground'
          )}
        >
          {task.title}
        </p>

        {/* Meta info */}
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {/* Energy badge - only show if feature unlocked */}
          {showEnergyBadge && (
            <Badge
              variant="secondary"
              className={cn('text-xs px-1.5 py-0', ENERGY_CONFIG[energyRequired].className)}
            >
              {ENERGY_CONFIG[energyRequired].label}
            </Badge>
          )}

          {/* Priority badge (only show must/should) - only if feature unlocked */}
          {showPriorityBadge && (priority === 'must' || priority === 'should') && (
            <Badge
              variant="secondary"
              className={cn('text-xs px-1.5 py-0', PRIORITY_CONFIG[priority].className)}
            >
              {PRIORITY_CONFIG[priority].label}
            </Badge>
          )}

          {/* Estimated time */}
          {task.estimatedMinutes && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {task.estimatedMinutes}m
            </span>
          )}

          {/* Due date */}
          {task.dueDate && (
            <span
              className={cn(
                'flex items-center gap-1 text-xs',
                isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'
              )}
            >
              <Calendar className="h-3 w-3" />
              {formatDueDate(task.dueDate)}
            </span>
          )}

          {/* Pomodoros completed */}
          {task.pomodorosCompleted && task.pomodorosCompleted > 0 && (
            <span className="text-xs text-muted-foreground">
              {task.pomodorosCompleted} pom
            </span>
          )}
        </div>
      </div>

      {/* Actions menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Task actions</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onStartFocus && task.status !== 'done' && (
            <DropdownMenuItem onClick={() => onStartFocus(task.id)}>
              <Play className="h-4 w-4 mr-2" />
              Start Focus
            </DropdownMenuItem>
          )}
          {onMoveToToday && task.status === 'inbox' && (
            <DropdownMenuItem onClick={() => onMoveToToday(task.id)}>
              <Sun className="h-4 w-4 mr-2" />
              Move to Today
            </DropdownMenuItem>
          )}
          {onMoveToInbox && task.status !== 'inbox' && task.status !== 'done' && (
            <DropdownMenuItem onClick={() => onMoveToInbox(task.id)}>
              <Inbox className="h-4 w-4 mr-2" />
              Move to Inbox
            </DropdownMenuItem>
          )}
          {(onStartFocus || onMoveToToday || onMoveToInbox) && (onDelete || onArchive) && (
            <DropdownMenuSeparator />
          )}
          {onArchive && task.status === 'done' && (
            <DropdownMenuItem onClick={() => onArchive(task.id)}>
              <Archive className="h-4 w-4 mr-2" />
              Archive
            </DropdownMenuItem>
          )}
          {onDelete && (
            <DropdownMenuItem
              onClick={() => onDelete(task.id)}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
