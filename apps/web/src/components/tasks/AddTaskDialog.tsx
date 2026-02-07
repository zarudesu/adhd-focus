'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import type { Task } from '@/db/schema';
import { useProjects } from '@/hooks/useProjects';
import { useFeatures } from '@/hooks/useFeatures';
import { format } from 'date-fns';

type EnergyLevel = 'low' | 'medium' | 'high';
type Priority = 'must' | 'should' | 'want' | 'someday';

export interface TaskInput {
  title: string;
  description?: string;
  energyRequired?: EnergyLevel;
  priority?: Priority;
  estimatedMinutes?: number;
  scheduledDate?: string;
  status?: 'inbox' | 'today' | 'scheduled';
  projectId?: string;
}
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Zap, Battery, BatteryLow, ChevronDown, ChevronUp, FolderOpen, Sun, Check, CalendarIcon, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  onSubmit: (input: TaskInput) => Promise<void>;
  defaultStatus?: 'inbox' | 'today';
  /** Default project ID when creating task from project page */
  defaultProjectId?: string;
  /** Task to edit - if provided, dialog works in edit mode */
  task?: Task | null;
  /** Show date picker for scheduling instead of "For Today" toggle */
  forScheduled?: boolean;
}

export function AddTaskDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultStatus = 'inbox',
  defaultProjectId,
  task,
  forScheduled = false,
}: AddTaskDialogProps) {
  const isEditMode = !!task;
  const { projects } = useProjects();
  const { isUnlocked } = useFeatures();
  const projectsUnlocked = isUnlocked('nav_projects');
  const energyUnlocked = isUnlocked('energy_basic');
  const priorityUnlocked = isUnlocked('priority_basic');
  const timeEstimateUnlocked = isUnlocked('task_time_estimate');
  const aiAutoFillUnlocked = isUnlocked('ai_auto_fill');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [energy, setEnergy] = useState<EnergyLevel>('medium');
  const [priority, setPriority] = useState<Priority>('should');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | undefined>();
  const [projectId, setProjectId] = useState<string | undefined>(defaultProjectId);
  const [forToday, setForToday] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | undefined>();
  const [showMore, setShowMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addedCount, setAddedCount] = useState(0);

  // AI Auto-Fill
  const [aiSuggesting, setAiSuggesting] = useState(false);
  const [aiSuggested, setAiSuggested] = useState(false);
  const aiDebounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastAiTitleRef = useRef('');

  // Populate form when editing
  useEffect(() => {
    if (task && open) {
      setTitle(task.title);
      setDescription(task.description || '');
      setEnergy((task.energyRequired as EnergyLevel) || 'medium');
      setPriority((task.priority as Priority) || 'should');
      setEstimatedMinutes(task.estimatedMinutes || undefined);
      setProjectId(task.projectId || undefined);
      setForToday(task.status === 'today' || task.status === 'in_progress');
      setScheduledDate(task.scheduledDate ? new Date(task.scheduledDate + 'T00:00:00') : undefined);
      setShowMore(!!task.description || !!task.projectId);
    } else if (open && !task) {
      // Reset to default when opening for new task
      setProjectId(defaultProjectId);
      setForToday(false);
      // Default to tomorrow for scheduled tasks
      if (forScheduled) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setScheduledDate(tomorrow);
      } else {
        setScheduledDate(undefined);
      }
      setAddedCount(0);
    }
  }, [task, open, defaultProjectId, forScheduled]);

  const resetForm = useCallback(() => {
    setTitle('');
    setDescription('');
    setEnergy('medium');
    setPriority('should');
    setEstimatedMinutes(undefined);
    setProjectId(defaultProjectId);
    setForToday(false);
    // Keep the scheduled date for quick adding multiple scheduled tasks
    if (!forScheduled) {
      setScheduledDate(undefined);
    }
    setShowMore(false);
    setAiSuggested(false);
    lastAiTitleRef.current = '';
  }, [defaultProjectId, forScheduled]);

  // AI Auto-Fill: fetch suggestions when title changes
  const fetchAiSuggestion = useCallback((titleText: string) => {
    if (aiDebounceRef.current) clearTimeout(aiDebounceRef.current);
    if (!aiAutoFillUnlocked || titleText.length < 4 || isEditMode || titleText === lastAiTitleRef.current) return;

    aiDebounceRef.current = setTimeout(async () => {
      lastAiTitleRef.current = titleText;
      setAiSuggesting(true);
      try {
        const res = await fetch('/api/ai/suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: titleText }),
        });
        if (!res.ok) return;
        const data = await res.json();

        // Only apply if fields are still at defaults (don't override user choices)
        setEnergy((prev) => prev === 'medium' ? data.energyRequired : prev);
        setPriority((prev) => prev === 'should' ? data.priority : prev);
        setEstimatedMinutes((prev) => prev === undefined ? data.estimatedMinutes : prev);
        setAiSuggested(true);
      } catch {
        // Silently fail — AI is optional
      } finally {
        setAiSuggesting(false);
      }
    }, 600);
  }, [isEditMode]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (aiDebounceRef.current) clearTimeout(aiDebounceRef.current);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      // Determine status and scheduled date
      let status: 'inbox' | 'today' | 'scheduled' = 'inbox';
      let schedDate: string | undefined;

      if (forScheduled && scheduledDate) {
        status = 'scheduled';
        schedDate = format(scheduledDate, 'yyyy-MM-dd');
      } else if (forToday) {
        status = 'today';
        // Don't set scheduledDate for "today" - it's not scheduled, it's immediate
      }

      await onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        energyRequired: energy,
        priority,
        estimatedMinutes,
        projectId,
        status,
        scheduledDate: schedDate,
      });
      if (isEditMode) {
        // Edit mode: close dialog after saving
        onOpenChange(false);
      } else {
        // Create mode: keep dialog open for quick adding
        setTitle('');
        setDescription('');
        setAddedCount((c) => c + 1);
        // Keep energy, priority, time, project settings for similar tasks
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Cmd+Enter always submits
    if (e.key === 'Enter' && e.metaKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Enter on title field submits in create mode (quick add)
    if (e.key === 'Enter' && !e.shiftKey && !isEditMode) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle>
            {isEditMode
              ? 'Edit Task'
              : forScheduled
                ? 'Schedule Task'
                : defaultStatus === 'today'
                  ? 'Add Task for Today'
                  : 'Quick Capture'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title - primary focus */}
          <div className="space-y-2">
            <div className="relative">
              <Input
                autoFocus
                placeholder="What needs to be done?"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  fetchAiSuggestion(e.target.value);
                }}
                onKeyDown={handleTitleKeyDown}
                className="text-base"
              />
              {aiSuggesting && (
                <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-pulse" />
              )}
              {aiSuggested && !aiSuggesting && (
                <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-violet-400" />
              )}
            </div>
          </div>

          {/* For Today toggle OR Date picker for scheduled */}
          {forScheduled ? (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Schedule for</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !scheduledDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduledDate ? format(scheduledDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={scheduledDate}
                    onSelect={setScheduledDate}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-amber-500" />
                <Label htmlFor="for-today" className="text-sm font-medium cursor-pointer">
                  For Today
                </Label>
              </div>
              <Switch
                id="for-today"
                checked={forToday}
                onCheckedChange={setForToday}
              />
            </div>
          )}

          {/* Quick options row - only show if features unlocked */}
          {(energyUnlocked || priorityUnlocked) && (
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Energy selector - requires energy_basic feature */}
              {energyUnlocked && (
                <div className="flex-1 min-w-0">
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Energy</Label>
                  <div className="flex gap-1">
                    {ENERGY_OPTIONS.map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        variant={energy === option.value ? 'default' : 'outline'}
                        size="sm"
                        className="flex-1 gap-1 px-2 sm:px-3"
                        onClick={() => setEnergy(option.value)}
                      >
                        {option.icon}
                        <span className="text-xs">{option.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Priority selector - requires priority_basic feature */}
              {priorityUnlocked && (
                <div className="flex-1 min-w-0">
                  <Label className="text-xs text-muted-foreground mb-1.5 block">Priority</Label>
                  <div className="flex gap-1">
                    {PRIORITY_OPTIONS.map((option) => (
                      <Button
                        key={option.value}
                        type="button"
                        variant={priority === option.value ? 'default' : 'outline'}
                        size="sm"
                        className="flex-1 px-2 sm:px-3"
                        onClick={() => setPriority(option.value)}
                      >
                        <span className="text-xs">{option.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Time estimate - requires task_time_estimate feature */}
          {timeEstimateUnlocked && (
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Time estimate</Label>
              <div className="flex gap-1">
                {TIME_PRESETS.map((mins) => (
                  <Button
                    key={mins}
                    type="button"
                    variant={estimatedMinutes === mins ? 'default' : 'outline'}
                    size="sm"
                    className="flex-1 px-2 sm:px-3"
                    onClick={() => setEstimatedMinutes(estimatedMinutes === mins ? undefined : mins)}
                  >
                    <span className="text-xs">{mins}m</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

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
            <div className="space-y-4">
              {/* Project selector - only show if projects feature is unlocked */}
              {projectsUnlocked && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Project</Label>
                  <Select
                    value={projectId || 'none'}
                    onValueChange={(value) => setProjectId(value === 'none' ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="No project (Inbox)">
                        {projectId ? (
                          <span className="flex items-center gap-2">
                            {projects.find(p => p.id === projectId)?.emoji}
                            {projects.find(p => p.id === projectId)?.name}
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <FolderOpen className="h-4 w-4" />
                            No project (Inbox)
                          </span>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <span className="flex items-center gap-2">
                          <FolderOpen className="h-4 w-4" />
                          No project (Inbox)
                        </span>
                      </SelectItem>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          <span className="flex items-center gap-2">
                            {project.emoji && <span>{project.emoji}</span>}
                            {project.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Description (optional)</Label>
                <Textarea
                  placeholder="Add notes or context..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            {/* Show added count or keyboard hint in create mode */}
            {!isEditMode && addedCount > 0 ? (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground mr-auto">
                <Check className="h-4 w-4 text-green-500" />
                <span>{addedCount} added</span>
              </div>
            ) : !isEditMode ? (
              <span className="hidden sm:inline text-xs text-muted-foreground mr-auto">
                Enter to add, &#x2318;+Enter from anywhere
              </span>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                if (!isEditMode) resetForm();
                onOpenChange(false);
              }}
              disabled={loading}
            >
              {!isEditMode && addedCount > 0 ? 'Done' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={!title.trim() || loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditMode ? 'Save' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
