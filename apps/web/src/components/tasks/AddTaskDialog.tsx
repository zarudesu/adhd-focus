'use client';

import { useState, useCallback } from 'react';

type EnergyLevel = 'low' | 'medium' | 'high';
type Priority = 'must' | 'should' | 'want' | 'someday';

interface CreateTaskInput {
  title: string;
  description?: string;
  energyRequired?: EnergyLevel;
  priority?: Priority;
  estimatedMinutes?: number;
  scheduledDate?: string;
  status?: 'inbox' | 'today' | 'scheduled';
}
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Zap, Battery, BatteryLow, ChevronDown, ChevronUp } from 'lucide-react';

const ENERGY_OPTIONS: { value: EnergyLevel; label: string; icon: React.ReactNode }[] = [
  { value: 'low', label: 'Low', icon: <BatteryLow className="h-4 w-4" /> },
  { value: 'medium', label: 'Med', icon: <Battery className="h-4 w-4" /> },
  { value: 'high', label: 'High', icon: <Zap className="h-4 w-4" /> },
];

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'must', label: 'Must' },
  { value: 'should', label: 'Should' },
  { value: 'want', label: 'Want' },
];

const TIME_PRESETS = [5, 15, 25, 45];

export interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: CreateTaskInput) => Promise<void>;
  defaultStatus?: 'inbox' | 'today';
}

export function AddTaskDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultStatus = 'inbox',
}: AddTaskDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [energy, setEnergy] = useState<EnergyLevel>('medium');
  const [priority, setPriority] = useState<Priority>('should');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | undefined>();
  const [showMore, setShowMore] = useState(false);
  const [loading, setLoading] = useState(false);

  const resetForm = useCallback(() => {
    setTitle('');
    setDescription('');
    setEnergy('medium');
    setPriority('should');
    setEstimatedMinutes(undefined);
    setShowMore(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        energyRequired: energy,
        priority,
        estimatedMinutes,
        scheduledDate: defaultStatus === 'today' ? new Date().toISOString().split('T')[0] : undefined,
      });
      resetForm();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.metaKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle>
            {defaultStatus === 'today' ? 'Add Task for Today' : 'Quick Capture'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title - primary focus */}
          <div className="space-y-2">
            <Input
              autoFocus
              placeholder="What needs to be done?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-base"
            />
          </div>

          {/* Quick options row */}
          <div className="flex gap-4">
            {/* Energy selector */}
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1.5 block">Energy</Label>
              <div className="flex gap-1">
                {ENERGY_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={energy === option.value ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => setEnergy(option.value)}
                  >
                    {option.icon}
                    <span className="hidden sm:inline">{option.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Priority selector */}
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground mb-1.5 block">Priority</Label>
              <div className="flex gap-1">
                {PRIORITY_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={priority === option.value ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1"
                    onClick={() => setPriority(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Time estimate */}
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Time estimate</Label>
            <div className="flex gap-1">
              {TIME_PRESETS.map((mins) => (
                <Button
                  key={mins}
                  type="button"
                  variant={estimatedMinutes === mins ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setEstimatedMinutes(estimatedMinutes === mins ? undefined : mins)}
                >
                  {mins}m
                </Button>
              ))}
            </div>
          </div>

          {/* Expandable section */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground"
            onClick={() => setShowMore(!showMore)}
          >
            {showMore ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Less options
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                More options
              </>
            )}
          </Button>

          {showMore && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Description (optional)</Label>
              <Textarea
                placeholder="Add notes or context..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Add Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
