'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Task } from '@/db/schema';
import { useProjects } from '@/hooks/useProjects';

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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Zap, Battery, BatteryLow, ChevronDown, ChevronUp, FolderOpen } from 'lucide-react';

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
}

export function AddTaskDialog({
  open,
  onOpenChange,
  onSubmit,
  defaultStatus = 'inbox',
  defaultProjectId,
  task,
}: AddTaskDialogProps) {
  const isEditMode = !!task;
  const { projects } = useProjects();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [energy, setEnergy] = useState<EnergyLevel>('medium');
  const [priority, setPriority] = useState<Priority>('should');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | undefined>();
  const [projectId, setProjectId] = useState<string | undefined>(defaultProjectId);
  const [showMore, setShowMore] = useState(false);
  const [loading, setLoading] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (task && open) {
      setTitle(task.title);
      setDescription(task.description || '');
      setEnergy((task.energyRequired as EnergyLevel) || 'medium');
      setPriority((task.priority as Priority) || 'should');
      setEstimatedMinutes(task.estimatedMinutes || undefined);
      setProjectId(task.projectId || undefined);
      setShowMore(!!task.description || !!task.projectId);
    } else if (open && !task) {
      // Reset to default when opening for new task
      setProjectId(defaultProjectId);
    }
  }, [task, open, defaultProjectId]);

  const resetForm = useCallback(() => {
    setTitle('');
    setDescription('');
    setEnergy('medium');
    setPriority('should');
    setEstimatedMinutes(undefined);
    setProjectId(defaultProjectId);
    setShowMore(false);
  }, [defaultProjectId]);

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
        projectId,
        // Only set scheduledDate when creating new task for today
        scheduledDate: !isEditMode && defaultStatus === 'today'
          ? new Date().toISOString().split('T')[0]
          : undefined,
      });
      if (!isEditMode) resetForm();
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
            {isEditMode
              ? 'Edit Task'
              : defaultStatus === 'today'
                ? 'Add Task for Today'
                : 'Quick Capture'}
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
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Energy selector */}
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

            {/* Priority selector */}
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
                  className="flex-1 px-2 sm:px-3"
                  onClick={() => setEstimatedMinutes(estimatedMinutes === mins ? undefined : mins)}
                >
                  <span className="text-xs">{mins}m</span>
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
            <div className="space-y-4">
              {/* Project selector */}
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
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                if (!isEditMode) resetForm();
                onOpenChange(false);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || loading}>
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isEditMode ? 'Save' : 'Add Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
