'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sun,
  Moon,
  Calendar,
  Trash2,
  Zap,
  Battery,
  BatteryMedium,
  BatteryFull,
  Clock,
  Mountain,
  ArrowLeft,
  Shuffle,
  ChevronRight,
  ChevronLeft,
  CalendarDays,
  Archive,
} from 'lucide-react';
import type { Task } from '@/db/schema';

type EnergyLevel = 'low' | 'medium' | 'high';

interface UpdateTaskInput {
  energyRequired?: EnergyLevel;
  estimatedMinutes?: number | null;
  description?: string | null;
}
import { cn } from '@/lib/utils';

interface InboxProcessorProps {
  tasks: Task[];
  onMoveToToday: (id: string) => Promise<void>;
  onMoveToSomeday: (id: string) => Promise<void>;
  onSchedule: (id: string, date: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, input: UpdateTaskInput) => Promise<void>;
  onClose: () => void;
}

type TimeEstimate = 'quick' | 'long' | null;

const SWIPE_THRESHOLD = 100;

export function InboxProcessor({
  tasks,
  onMoveToToday,
  onMoveToSomeday,
  onSchedule,
  onDelete,
  onUpdate,
  onClose,
}: InboxProcessorProps) {
  // Randomize tasks order on mount
  const [shuffledTasks, setShuffledTasks] = useState<Task[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | 'up' | 'down' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form state for current task
  const [timeEstimate, setTimeEstimate] = useState<TimeEstimate>(null);
  const [energy, setEnergy] = useState<EnergyLevel>('medium');
  const [firstStep, setFirstStep] = useState('');

  // Shuffle tasks on mount
  useEffect(() => {
    const shuffled = [...tasks].sort(() => Math.random() - 0.5);
    setShuffledTasks(shuffled);
  }, [tasks]);

  const currentTask = shuffledTasks[currentIndex];
  const remainingCount = shuffledTasks.length - currentIndex;
  const isComplete = currentIndex >= shuffledTasks.length;

  // Reset form when task changes
  useEffect(() => {
    if (currentTask) {
      setTimeEstimate(null);
      setEnergy(currentTask.energyRequired || 'medium');
      setFirstStep('');
    }
  }, [currentTask?.id]);

  const saveAndProceed = useCallback(async (
    action: 'today' | 'someday' | 'schedule' | 'delete',
    scheduleDate?: string
  ) => {
    if (!currentTask || isProcessing) return;

    setIsProcessing(true);

    try {
      // First update task with form values
      const updates: UpdateTaskInput = {
        energyRequired: energy,
      };

      if (timeEstimate === 'quick') {
        updates.estimatedMinutes = 15;
      } else if (timeEstimate === 'long') {
        updates.estimatedMinutes = 45;
      }

      if (firstStep.trim()) {
        updates.description = firstStep.trim();
      }

      await onUpdate(currentTask.id, updates);

      // Then perform the action
      switch (action) {
        case 'today':
          setDirection('right');
          await onMoveToToday(currentTask.id);
          break;
        case 'someday':
          setDirection('left');
          await onMoveToSomeday(currentTask.id);
          break;
        case 'schedule':
          setDirection('up');
          if (scheduleDate) {
            await onSchedule(currentTask.id, scheduleDate);
          }
          break;
        case 'delete':
          setDirection('down');
          await onDelete(currentTask.id);
          break;
      }

      // Move to next task after animation
      setTimeout(() => {
        setCurrentIndex((prev) => prev + 1);
        setDirection(null);
      }, 300);
    } catch (error) {
      console.error('Failed to process task:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [currentTask, energy, timeEstimate, firstStep, isProcessing, onUpdate, onMoveToToday, onMoveToSomeday, onSchedule, onDelete]);

  const handleDragEnd = useCallback((event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset } = info;

    if (Math.abs(offset.x) > Math.abs(offset.y)) {
      // Horizontal swipe
      if (offset.x > SWIPE_THRESHOLD) {
        saveAndProceed('today');
      } else if (offset.x < -SWIPE_THRESHOLD) {
        saveAndProceed('someday');
      }
    } else {
      // Vertical swipe
      if (offset.y < -SWIPE_THRESHOLD) {
        // Swipe up - schedule for tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        saveAndProceed('schedule', tomorrow.toISOString().split('T')[0]);
      } else if (offset.y > SWIPE_THRESHOLD) {
        saveAndProceed('delete');
      }
    }
  }, [saveAndProceed]);

  const getExitAnimation = () => {
    switch (direction) {
      case 'right':
        return { x: 500, opacity: 0 };
      case 'left':
        return { x: -500, opacity: 0 };
      case 'up':
        return { y: -500, opacity: 0 };
      case 'down':
        return { y: 500, opacity: 0 };
      default:
        return { opacity: 0 };
    }
  };

  if (isComplete) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold">Inbox Clear!</h2>
          <p className="text-muted-foreground">
            You processed {shuffledTasks.length} tasks. Great job!
          </p>
          <Button onClick={onClose} size="lg">
            Done
          </Button>
        </div>
      </div>
    );
  }

  if (!currentTask) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Exit
        </Button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{remainingCount} left</span>
          <Shuffle className="h-4 w-4" />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden">
        {/* Swipe hints */}
        <div className="absolute inset-x-0 top-20 flex justify-between px-8 text-muted-foreground/50 text-sm pointer-events-none">
          <div className="flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />
            <Archive className="h-4 w-4" />
            Someday
          </div>
          <div className="flex items-center gap-1">
            Today
            <Sun className="h-4 w-4" />
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentTask.id}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1, x: 0, y: 0 }}
            exit={getExitAnimation()}
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.7}
            onDragEnd={handleDragEnd}
            className="w-full max-w-md cursor-grab active:cursor-grabbing"
          >
            <Card className="shadow-lg">
              <CardContent className="p-6 space-y-6">
                {/* Task title */}
                <div className="text-center">
                  <h2 className="text-xl font-semibold leading-relaxed">
                    {currentTask.title}
                  </h2>
                </div>

                {/* Time estimate */}
                <div className="space-y-2">
                  <label htmlFor="time-estimate-quick" className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Quick or Long?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={timeEstimate === 'quick' ? 'default' : 'outline'}
                      onClick={() => setTimeEstimate(timeEstimate === 'quick' ? null : 'quick')}
                      className="h-12"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Quick (&lt;15m)
                    </Button>
                    <Button
                      variant={timeEstimate === 'long' ? 'default' : 'outline'}
                      onClick={() => setTimeEstimate(timeEstimate === 'long' ? null : 'long')}
                      className="h-12"
                    >
                      <Mountain className="h-4 w-4 mr-2" />
                      Long (15m+)
                    </Button>
                  </div>
                </div>

                {/* Energy level */}
                <div className="space-y-2">
                  <label htmlFor="energy-low" className="text-sm text-muted-foreground flex items-center gap-2">
                    <BatteryMedium className="h-4 w-4" />
                    Energy needed?
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant={energy === 'low' ? 'default' : 'outline'}
                      onClick={() => setEnergy('low')}
                      className={cn(
                        'h-12',
                        energy === 'low' && 'bg-green-600 hover:bg-green-700'
                      )}
                    >
                      <Battery className="h-4 w-4 mr-1" />
                      Low
                    </Button>
                    <Button
                      variant={energy === 'medium' ? 'default' : 'outline'}
                      onClick={() => setEnergy('medium')}
                      className={cn(
                        'h-12',
                        energy === 'medium' && 'bg-yellow-600 hover:bg-yellow-700'
                      )}
                    >
                      <BatteryMedium className="h-4 w-4 mr-1" />
                      Med
                    </Button>
                    <Button
                      variant={energy === 'high' ? 'default' : 'outline'}
                      onClick={() => setEnergy('high')}
                      className={cn(
                        'h-12',
                        energy === 'high' && 'bg-red-600 hover:bg-red-700'
                      )}
                    >
                      <BatteryFull className="h-4 w-4 mr-1" />
                      High
                    </Button>
                  </div>
                </div>

                {/* First step */}
                <div className="space-y-2">
                  <label htmlFor="first-step-input" className="text-sm text-muted-foreground">
                    What's the first tiny step?
                  </label>
                  <Input
                    id="first-step-input"
                    value={firstStep}
                    onChange={(e) => setFirstStep(e.target.value)}
                    placeholder="e.g., Open the app..."
                    className="h-12"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Bottom swipe hint */}
        <div className="absolute bottom-32 text-muted-foreground/50 text-sm flex flex-col items-center gap-1">
          <span>↓ Delete</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="p-4 border-t space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => saveAndProceed('someday')}
            disabled={isProcessing}
            className="h-12"
          >
            <Archive className="h-4 w-4 mr-2" />
            Someday
          </Button>
          <Button
            onClick={() => saveAndProceed('today')}
            disabled={isProcessing}
            className="h-12"
          >
            <Sun className="h-4 w-4 mr-2" />
            Today
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => {
              const tomorrow = new Date();
              tomorrow.setDate(tomorrow.getDate() + 1);
              saveAndProceed('schedule', tomorrow.toISOString().split('T')[0]);
            }}
            disabled={isProcessing}
            className="h-12"
          >
            <CalendarDays className="h-4 w-4 mr-2" />
            Tomorrow
          </Button>
          <Button
            variant="destructive"
            onClick={() => saveAndProceed('delete')}
            disabled={isProcessing}
            className="h-12"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
