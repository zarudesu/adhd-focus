'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Check, X, Loader2, Calendar, Sparkles } from "lucide-react";

interface YesterdayHabit {
  id: string;
  name: string;
  emoji: string | null;
  isCompleted: boolean;
  isSkipped: boolean;
}

interface YesterdayReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  yesterdayDate: string;
  habits: YesterdayHabit[];
  onSubmit: (data: {
    habits: { id: string; completed: boolean; skipped: boolean }[];
    notes?: string;
  }) => Promise<void>;
}

export function YesterdayReviewModal({
  open,
  onOpenChange,
  yesterdayDate,
  habits,
  onSubmit,
}: YesterdayReviewModalProps) {
  const [habitStates, setHabitStates] = useState<Record<string, 'completed' | 'skipped' | null>>({});
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Initialize habit states from props
  useEffect(() => {
    const initial: Record<string, 'completed' | 'skipped' | null> = {};
    habits.forEach(h => {
      if (h.isCompleted) initial[h.id] = 'completed';
      else if (h.isSkipped) initial[h.id] = 'skipped';
      else initial[h.id] = null;
    });
    setHabitStates(initial);
  }, [habits]);

  const toggleHabit = (id: string, state: 'completed' | 'skipped') => {
    setHabitStates(prev => ({
      ...prev,
      [id]: prev[id] === state ? null : state,
    }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onSubmit({
        habits: habits.map(h => ({
          id: h.id,
          completed: habitStates[h.id] === 'completed',
          skipped: habitStates[h.id] === 'skipped',
        })),
        notes: notes.trim() || undefined,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  const handleSkipReview = () => {
    onOpenChange(false);
  };

  const completedCount = Object.values(habitStates).filter(s => s === 'completed').length;
  const skippedCount = Object.values(habitStates).filter(s => s === 'skipped').length;

  // Format yesterday's date nicely
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Yesterday&apos;s Review
          </DialogTitle>
          <DialogDescription>
            How did {formatDate(yesterdayDate)} go? Mark your habits.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {habits.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No habits to review for yesterday</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {habits.map(habit => (
                <div
                  key={habit.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-all",
                    habitStates[habit.id] === 'completed' && "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900",
                    habitStates[habit.id] === 'skipped' && "bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800",
                    !habitStates[habit.id] && "hover:bg-muted/50"
                  )}
                >
                  <span className="text-lg">{habit.emoji || '✅'}</span>
                  <span className={cn(
                    "flex-1 font-medium",
                    habitStates[habit.id] && "line-through text-muted-foreground"
                  )}>
                    {habit.name}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => toggleHabit(habit.id, 'completed')}
                      className={cn(
                        "h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all",
                        habitStates[habit.id] === 'completed'
                          ? "bg-green-500 border-green-500 text-white"
                          : "border-muted-foreground/30 hover:border-green-500 hover:bg-green-500/10"
                      )}
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleHabit(habit.id, 'skipped')}
                      className={cn(
                        "h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all",
                        habitStates[habit.id] === 'skipped'
                          ? "bg-gray-400 border-gray-400 text-white"
                          : "border-muted-foreground/30 hover:border-gray-400 hover:bg-gray-400/10"
                      )}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {habits.length > 0 && (
            <>
              <div className="text-sm text-muted-foreground text-center">
                {completedCount} completed, {skippedCount} skipped
              </div>

              <div className="space-y-2">
                <Label htmlFor="review-notes">Notes (optional)</Label>
                <Textarea
                  id="review-notes"
                  placeholder="How did yesterday go? Any blockers?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>
            </>
          )}

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" onClick={handleSkipReview}>
              Skip Review
            </Button>
            <Button onClick={handleSubmit} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {habits.length === 0 ? 'Done' : 'Save Review'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
