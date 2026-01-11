'use client';

import { useState } from 'react';
import { Task, EnergyLevel, Priority } from '@adhd-focus/shared';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Energy level config
const ENERGY_CONFIG: Record<EnergyLevel, { label: string; className: string }> = {
  low: { label: 'Low', className: 'bg-gray-100 text-gray-600 hover:bg-gray-200' },
  medium: { label: 'Med', className: 'bg-amber-100 text-amber-700 hover:bg-amber-200' },
  high: { label: 'High', className: 'bg-red-100 text-red-700 hover:bg-red-200' },
};

// Priority config
const PRIORITY_CONFIG: Record<Priority, { label: string; className: string }> = {
  must: { label: 'Must', className: 'bg-red-100 text-red-700' },
  should: { label: 'Should', className: 'bg-amber-100 text-amber-700' },
  want: { label: 'Want', className: 'bg-blue-100 text-blue-700' },
  someday: { label: 'Someday', className: 'bg-gray-100 text-gray-600' },
};

export interface TaskCardProps {
  task: Task;
  onComplete?: (id: string) => void;
  onDelete?: (id: string) => void;
  onMoveToToday?: (id: string) => void;
  onMoveToInbox?: (id: string) => void;
  onStartFocus?: (id: string) => void;
  onClick?: (task: Task) => void;
  showProject?: boolean;
}

export function TaskCard({
  task,
  onComplete,
  onDelete,
  onMoveToToday,
  onMoveToInbox,
  onStartFocus,
  onClick,
  showProject = false,
}: TaskCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const isCompleted = task.status === 'done';
  const isInProgress = task.status === 'in_progress';

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
    if (!onComplete || isCompleting) return;
    onComplete(task.id);
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

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && !isCompleted;

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
          {/* Energy badge */}
          <Badge
            variant="secondary"
            className={cn('text-xs px-1.5 py-0', ENERGY_CONFIG[task.energy_required].className)}
          >
            {ENERGY_CONFIG[task.energy_required].label}
          </Badge>

          {/* Priority badge (only show must/should) */}
          {(task.priority === 'must' || task.priority === 'should') && (
            <Badge
              variant="secondary"
              className={cn('text-xs px-1.5 py-0', PRIORITY_CONFIG[task.priority].className)}
            >
              {PRIORITY_CONFIG[task.priority].label}
            </Badge>
          )}

          {/* Estimated time */}
          {task.estimated_minutes && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {task.estimated_minutes}m
            </span>
          )}

          {/* Due date */}
          {task.due_date && (
            <span
              className={cn(
                'flex items-center gap-1 text-xs',
                isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'
              )}
            >
              <Calendar className="h-3 w-3" />
              {formatDueDate(task.due_date)}
            </span>
          )}

          {/* Pomodoros completed */}
          {task.pomodoros_completed > 0 && (
            <span className="text-xs text-muted-foreground">
              {task.pomodoros_completed} pom
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
          {(onStartFocus || onMoveToToday || onMoveToInbox) && onDelete && (
            <DropdownMenuSeparator />
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
