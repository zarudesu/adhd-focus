'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Loader2 } from "lucide-react";
import type { Habit } from '@/db/schema';

interface EditHabitDialogProps {
  habit: Habit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (id: string, input: HabitUpdateInput) => Promise<void>;
}

interface HabitUpdateInput {
  name?: string;
  emoji?: string;
  description?: string;
  frequency?: 'daily' | 'weekdays' | 'weekends' | 'custom';
  customDays?: number[];
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night' | 'anytime';
  color?: string;
}

const EMOJI_OPTIONS = ['✅', '💪', '📚', '🧘', '🏃', '💧', '🍎', '💊', '🌟', '🎯', '🧠', '❤️'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function EditHabitDialog({ habit, open, onOpenChange, onSubmit }: EditHabitDialogProps) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('✅');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekdays' | 'weekends' | 'custom'>('daily');
  const [customDays, setCustomDays] = useState<string[]>([]);
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening' | 'night' | 'anytime'>('anytime');
  const [saving, setSaving] = useState(false);

  // Populate form when habit changes
  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setEmoji(habit.emoji || '✅');
      setDescription(habit.description || '');
      setFrequency(habit.frequency || 'daily');
      setCustomDays(
        Array.isArray(habit.customDays)
          ? (habit.customDays as number[]).map(String)
          : []
      );
      setTimeOfDay(habit.timeOfDay || 'anytime');
    }
  }, [habit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!habit || !name.trim()) return;

    setSaving(true);
    try {
      await onSubmit(habit.id, {
        name: name.trim(),
        emoji,
        description: description.trim() || undefined,
        frequency,
        customDays: frequency === 'custom' ? customDays.map(Number) : undefined,
        timeOfDay,
      });
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  if (!habit) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Habit</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-habit-name">Habit Name</Label>
            <div className="flex gap-2">
              <Select value={emoji} onValueChange={setEmoji}>
                <SelectTrigger className="w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EMOJI_OPTIONS.map(e => (
                    <SelectItem key={e} value={e}>{e}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                id="edit-habit-name"
                placeholder="e.g., Drink water, Exercise, Read..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Time of Day</Label>
            <Select value={timeOfDay} onValueChange={(v) => setTimeOfDay(v as typeof timeOfDay)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="morning">🌅 Morning</SelectItem>
                <SelectItem value="afternoon">☀️ Afternoon</SelectItem>
                <SelectItem value="evening">🌆 Evening</SelectItem>
                <SelectItem value="night">🌙 Night</SelectItem>
                <SelectItem value="anytime">✨ Anytime</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select value={frequency} onValueChange={(v) => setFrequency(v as typeof frequency)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Every day</SelectItem>
                <SelectItem value="weekdays">Weekdays only</SelectItem>
                <SelectItem value="weekends">Weekends only</SelectItem>
                <SelectItem value="custom">Custom days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {frequency === 'custom' && (
            <div className="space-y-2">
              <Label>Select Days</Label>
              <ToggleGroup
                type="multiple"
                value={customDays}
                onValueChange={setCustomDays}
                className="flex flex-wrap justify-start gap-1"
              >
                {DAY_NAMES.map((day, i) => (
                  <ToggleGroupItem
                    key={i}
                    value={String(i)}
                    className="px-3"
                  >
                    {day}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-habit-description">Description (optional)</Label>
            <Textarea
              id="edit-habit-description"
              placeholder="Why is this habit important to you?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
