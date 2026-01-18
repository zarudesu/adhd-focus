'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, X, MoreHorizontal, Trash2, Flame, Loader2, Pencil } from "lucide-react";

interface HabitItemProps {
  habit: {
    id: string;
    name: string;
    emoji: string | null;
    description: string | null;
    color: string | null;
    currentStreak: number | null;
    isCompleted: boolean;
    isSkipped: boolean;
  };
  onCheck: (id: string, skipped?: boolean) => Promise<void>;
  onUncheck: (id: string) => Promise<void>;
  onArchive: (id: string) => Promise<void>;
  onEdit?: (id: string) => void;
  disabled?: boolean;
}

export function HabitItem({ habit, onCheck, onUncheck, onArchive, onEdit, disabled }: HabitItemProps) {
  const [loading, setLoading] = useState(false);

  const handleCheck = async () => {
    if (disabled || loading) return;
    setLoading(true);
    try {
      if (habit.isCompleted || habit.isSkipped) {
        await onUncheck(habit.id);
      } else {
        await onCheck(habit.id, false);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    if (disabled || loading) return;
    setLoading(true);
    try {
      await onCheck(habit.id, true);
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await onArchive(habit.id);
    } finally {
      setLoading(false);
    }
  };

  const streak = habit.currentStreak || 0;

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border transition-all",
        habit.isCompleted && "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900",
        habit.isSkipped && "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 opacity-60",
        !habit.isCompleted && !habit.isSkipped && "hover:bg-muted/50",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {/* Check Button */}
      <button
        onClick={handleCheck}
        disabled={disabled || loading}
        className={cn(
          "flex-shrink-0 h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all",
          habit.isCompleted && "bg-green-500 border-green-500 text-white",
          habit.isSkipped && "bg-gray-300 dark:bg-gray-700 border-gray-300 dark:border-gray-700 text-gray-500",
          !habit.isCompleted && !habit.isSkipped && "border-muted-foreground/30 hover:border-primary hover:bg-primary/10",
          disabled && "cursor-not-allowed"
        )}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : habit.isCompleted ? (
          <Check className="h-4 w-4" />
        ) : habit.isSkipped ? (
          <X className="h-3 w-3" />
        ) : null}
      </button>

      {/* Habit Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-lg">{habit.emoji || '✅'}</span>
          <span className={cn(
            "font-medium truncate",
            (habit.isCompleted || habit.isSkipped) && "line-through text-muted-foreground"
          )}>
            {habit.name}
          </span>
          {streak > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-orange-500 font-medium">
              <Flame className="h-3 w-3" />
              {streak}
            </span>
          )}
        </div>
        {habit.description && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {habit.description}
          </p>
        )}
      </div>

      {/* Actions */}
      {!habit.isCompleted && !habit.isSkipped && !disabled && (
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground h-8 px-2"
          onClick={handleSkip}
          disabled={loading}
        >
          Skip
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={loading}>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onEdit && (
            <DropdownMenuItem onClick={() => onEdit(habit.id)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>
          )}
          {(habit.isCompleted || habit.isSkipped) && (
            <DropdownMenuItem onClick={handleCheck}>
              Undo
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            onClick={handleArchive}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
