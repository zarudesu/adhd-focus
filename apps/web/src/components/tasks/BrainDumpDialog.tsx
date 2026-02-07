'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Sparkles, Clock, Brain } from 'lucide-react';

interface BrainDumpItem {
  title: string;
  type: 'task' | 'idea' | 'reminder';
  priority: 'must' | 'should' | 'want' | 'someday';
  energyRequired: 'low' | 'medium' | 'high';
  estimatedMinutes: number;
  selected: boolean;
}

interface BrainDumpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateTasks: (tasks: {
    title: string;
    priority: string;
    energyRequired: string;
    estimatedMinutes: number;
  }[]) => Promise<void>;
}

const TYPE_CONFIG = {
  task: { label: 'Task', className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  idea: { label: 'Idea', className: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' },
  reminder: { label: 'Reminder', className: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
};

export function BrainDumpDialog({
  open,
  onOpenChange,
  onCreateTasks,
}: BrainDumpDialogProps) {
  const [text, setText] = useState('');
  const [items, setItems] = useState<BrainDumpItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'input' | 'review'>('input');

  const handleProcess = async () => {
    if (!text.trim()) return;
    setProcessing(true);
    setError(null);

    try {
      const res = await fetch('/api/ai/brain-dump', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Could not process. Try again.');
        return;
      }

      const data = await res.json();
      setItems(data.items.map((item: Omit<BrainDumpItem, 'selected'>) => ({ ...item, selected: true })));
      setStep('review');
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleCreate = async () => {
    const selected = items.filter(i => i.selected);
    if (selected.length === 0) return;

    setCreating(true);
    try {
      await onCreateTasks(
        selected.map(({ title, priority, energyRequired, estimatedMinutes }) => ({
          title,
          priority,
          energyRequired,
          estimatedMinutes,
        })),
      );
      handleClose();
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setText('');
    setItems([]);
    setStep('input');
    setError(null);
  };

  const toggleItem = (index: number) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, selected: !item.selected } : item));
  };

  const selectedCount = items.filter(i => i.selected).length;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen ? handleClose() : onOpenChange(true)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-violet-400" />
            Brain Dump
          </DialogTitle>
        </DialogHeader>

        {/* Step 1: Text input */}
        {step === 'input' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Dump everything from your head. Don&apos;t organize — just write.
            </p>
            <Textarea
              autoFocus
              placeholder="Everything on my mind... grocery shopping, call dentist, that project thing, need to fix the sink, remember to email Sarah..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={6}
              className="resize-none"
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <DialogFooter>
              <Button variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleProcess} disabled={!text.trim() || processing}>
                {processing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Process
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Step 2: Review items */}
        {step === 'review' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {items.length} items found. Deselect anything you don&apos;t need.
            </p>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 rounded-lg border bg-card p-2.5"
                >
                  <Checkbox
                    checked={item.selected}
                    onCheckedChange={() => toggleItem(i)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{item.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="secondary"
                        className={`text-xs px-1.5 py-0 ${TYPE_CONFIG[item.type].className}`}
                      >
                        {TYPE_CONFIG[item.type].label}
                      </Badge>
                      <Badge variant="secondary" className="text-xs px-1.5 py-0">
                        {item.priority}
                      </Badge>
                      <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {item.estimatedMinutes}m
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mr-auto">
                {selectedCount} selected
              </div>
              <Button variant="ghost" onClick={() => { setStep('input'); setItems([]); }}>
                Back
              </Button>
              <Button onClick={handleCreate} disabled={creating || selectedCount === 0}>
                {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Add {selectedCount} to inbox
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
