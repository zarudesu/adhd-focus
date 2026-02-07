'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Task } from '@/db/schema';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Sparkles, X, Clock } from 'lucide-react';

interface Subtask {
  title: string;
  estimatedMinutes: number;
  energyRequired: 'low' | 'medium' | 'high';
  selected: boolean;
}

interface DecomposeDialogProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateSubtasks: (parentTaskId: string, subtasks: {
    title: string;
    estimatedMinutes: number;
    energyRequired: 'low' | 'medium' | 'high';
  }[]) => Promise<void>;
}

export function DecomposeDialog({
  task,
  open,
  onOpenChange,
  onCreateSubtasks,
}: DecomposeDialogProps) {
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);

  const generate = useCallback(async () => {
    if (!task) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/decompose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: task.title,
          description: task.description || undefined,
          estimatedMinutes: task.estimatedMinutes || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Could not break down this task');
        return;
      }

      const data = await res.json();
      setSubtasks(data.subtasks.map((s: Omit<Subtask, 'selected'>) => ({ ...s, selected: true })));
      setGenerated(true);
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }, [task]);

  const handleCreate = async () => {
    if (!task) return;
    const selected = subtasks.filter(s => s.selected);
    if (selected.length === 0) return;

    setCreating(true);
    try {
      await onCreateSubtasks(
        task.id,
        selected.map(({ title, estimatedMinutes, energyRequired }) => ({
          title,
          estimatedMinutes,
          energyRequired,
        })),
      );
      onOpenChange(false);
      setSubtasks([]);
      setGenerated(false);
    } finally {
      setCreating(false);
    }
  };

  const toggleSubtask = (index: number) => {
    setSubtasks(prev => prev.map((s, i) => i === index ? { ...s, selected: !s.selected } : s));
  };

  const updateTitle = (index: number, title: string) => {
    setSubtasks(prev => prev.map((s, i) => i === index ? { ...s, title } : s));
  };

  const removeSubtask = (index: number) => {
    setSubtasks(prev => prev.filter((_, i) => i !== index));
  };

  const selectedCount = subtasks.filter(s => s.selected).length;
  const totalMinutes = subtasks.filter(s => s.selected).reduce((sum, s) => sum + s.estimatedMinutes, 0);

  // Auto-generate when dialog opens with a task
  useEffect(() => {
    if (open && task && !generated && !loading) {
      generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, task]);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setSubtasks([]);
      setGenerated(false);
      setError(null);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-violet-400" />
            Break Down Task
          </DialogTitle>
        </DialogHeader>

        {task && (
          <p className="text-sm text-muted-foreground truncate">
            {task.title}
          </p>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Breaking it into small steps...</p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="text-center py-6 space-y-3">
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={generate}>
              Try again
            </Button>
          </div>
        )}

        {/* Subtasks list */}
        {!loading && !error && subtasks.length > 0 && (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {subtasks.map((subtask, i) => (
              <div
                key={i}
                className="flex items-start gap-2 rounded-lg border bg-card p-2.5"
              >
                <Checkbox
                  checked={subtask.selected}
                  onCheckedChange={() => toggleSubtask(i)}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <Input
                    value={subtask.title}
                    onChange={(e) => updateTitle(i, e.target.value)}
                    className="h-7 text-sm border-0 p-0 shadow-none focus-visible:ring-0"
                  />
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">
                      {subtask.energyRequired}
                    </Badge>
                    <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {subtask.estimatedMinutes}m
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground"
                  onClick={() => removeSubtask(i)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        {!loading && subtasks.length > 0 && (
          <DialogFooter className="gap-2 sm:gap-0">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mr-auto">
              {selectedCount} steps &middot; ~{totalMinutes}m total
            </div>
            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={creating}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={creating || selectedCount === 0}>
              {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create {selectedCount} subtasks
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
