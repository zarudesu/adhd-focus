'use client';

import { useState, useCallback } from 'react';
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useHabits } from "@/hooks/useHabits";
import { useYesterdayReview } from "@/hooks/useYesterdayReview";
import { useGamificationEvents } from "@/components/gamification/GamificationProvider";
import { ProtectedRoute } from "@/components/gamification/ProtectedRoute";
import { AddHabitDialog, YesterdayReviewModal } from "@/components/habits";
import { EditHabitDialog } from "@/components/habits/EditHabitDialog";
import { SortableHabitItem } from "@/components/habits/SortableHabitItem";
import type { Habit } from "@/db/schema";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  Plus,
  Sparkles,
  Trophy,
  Loader2,
} from "lucide-react";

function ChecklistContent() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const { habits, summary, loading, error, check, uncheck, create, update, archive, reorder, refresh } = useHabits();
  const { data: reviewData, loading: reviewLoading, submitReview, skipReview, dismissed } = useYesterdayReview();
  const { handleTaskComplete } = useGamificationEvents();

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Show review modal if needed and not dismissed
  const showReviewModal = !reviewLoading && reviewData?.needsReview && !dismissed && habits.length > 0;

  const handleCheck = useCallback(async (id: string, skipped = false) => {
    const result = await check(id, skipped);

    // Trigger gamification events
    if (result.xpAwarded > 0) {
      handleTaskComplete({
        xpAwarded: result.xpAwarded,
        levelUp: result.levelUp ? {
          newLevel: result.newLevel!,
          unlockedFeatures: [],
        } : undefined,
      });
    }

    // beatyour8: When all habits done, show Calm Review (not celebration)
    if (result.allHabitsDone) {
      handleTaskComplete({
        xpAwarded: result.bonusXp,
        review: {
          trigger: 'habit_done',
        },
      });
    }
  }, [check, handleTaskComplete]);

  const handleUncheck = useCallback(async (id: string) => {
    await uncheck(id);
  }, [uncheck]);

  const handleArchive = useCallback(async (id: string) => {
    await archive(id);
  }, [archive]);

  const handleEdit = useCallback((id: string) => {
    const habit = habits.find(h => h.id === id);
    if (habit) {
      setEditingHabit(habit as unknown as Habit);
    }
  }, [habits]);

  const handleUpdate = useCallback(async (id: string, input: Parameters<typeof update>[1]) => {
    await update(id, input);
  }, [update]);

  const handleDragEnd = useCallback((event: DragEndEvent, sectionHabits: typeof habits) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sectionHabits.findIndex(h => h.id === active.id);
      const newIndex = sectionHabits.findIndex(h => h.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        // Create new order
        const newOrder = [...sectionHabits];
        const [moved] = newOrder.splice(oldIndex, 1);
        newOrder.splice(newIndex, 0, moved);

        // Reorder just this section
        reorder(newOrder.map(h => h.id));
      }
    }
  }, [reorder]);

  // Filter habits by time of day
  const morningHabits = habits.filter(h => h.timeOfDay === 'morning' && h.shouldDoToday);
  const afternoonHabits = habits.filter(h => h.timeOfDay === 'afternoon' && h.shouldDoToday);
  const eveningHabits = habits.filter(h => h.timeOfDay === 'evening' && h.shouldDoToday);
  const nightHabits = habits.filter(h => h.timeOfDay === 'night' && h.shouldDoToday);
  const anytimeHabits = habits.filter(h => h.timeOfDay === 'anytime' && h.shouldDoToday);
  const notTodayHabits = habits.filter(h => !h.shouldDoToday);

  return (
    <>
      <PageHeader
        title="Daily Checklist"
        description="Build powerful habits, one check at a time"
        actions={
          <Button size="sm" onClick={() => setShowAddDialog(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Habit
          </Button>
        }
      />

      <AddHabitDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSubmit={async (input) => {
          await create(input);
        }}
      />

      <EditHabitDialog
        habit={editingHabit}
        open={!!editingHabit}
        onOpenChange={(open) => !open && setEditingHabit(null)}
        onSubmit={handleUpdate}
      />

      {showReviewModal && reviewData && (
        <YesterdayReviewModal
          open={showReviewModal}
          onOpenChange={(open) => {
            if (!open) {
              // User closed modal without submitting - skip review
              skipReview();
            }
          }}
          yesterdayDate={reviewData.yesterdayDate}
          habits={reviewData.habits}
          onSubmit={async (data) => {
            await submitReview(data);
            refresh();
          }}
        />
      )}

      <main className="flex-1 p-4 space-y-4">
        {error && (
          <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
            {error.message}
          </div>
        )}

        {/* Progress Summary */}
        {summary.habitsForToday > 0 && (
          <Card className={summary.allDone ? "border-2 border-green-500 bg-green-50 dark:bg-green-950/20" : ""}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {summary.allDone ? (
                    <>
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      <span className="font-semibold text-green-700 dark:text-green-400">
                        All done! +25 XP
                      </span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 text-primary" />
                      <span className="font-medium">Today's Progress</span>
                    </>
                  )}
                </div>
                <span className="text-sm text-muted-foreground">
                  {summary.completed}/{summary.habitsForToday} completed
                </span>
              </div>
              <Progress value={summary.progress} className="h-2" />
              {summary.skipped > 0 && (
                <p className="text-xs text-muted-foreground mt-2">
                  {summary.skipped} skipped
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : habits.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No habits yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first habit to start building a routine
              </p>
              <Button onClick={() => setShowAddDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Habit
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Morning */}
            {morningHabits.length > 0 && (
              <HabitSection
                title="Morning"
                emoji="🌅"
                habits={morningHabits}
                onCheck={handleCheck}
                onUncheck={handleUncheck}
                onArchive={handleArchive}
                onEdit={handleEdit}
                onDragEnd={(e) => handleDragEnd(e, morningHabits)}
                sensors={sensors}
              />
            )}

            {/* Afternoon */}
            {afternoonHabits.length > 0 && (
              <HabitSection
                title="Afternoon"
                emoji="☀️"
                habits={afternoonHabits}
                onCheck={handleCheck}
                onUncheck={handleUncheck}
                onArchive={handleArchive}
                onEdit={handleEdit}
                onDragEnd={(e) => handleDragEnd(e, afternoonHabits)}
                sensors={sensors}
              />
            )}

            {/* Evening */}
            {eveningHabits.length > 0 && (
              <HabitSection
                title="Evening"
                emoji="🌆"
                habits={eveningHabits}
                onCheck={handleCheck}
                onUncheck={handleUncheck}
                onArchive={handleArchive}
                onEdit={handleEdit}
                onDragEnd={(e) => handleDragEnd(e, eveningHabits)}
                sensors={sensors}
              />
            )}

            {/* Night */}
            {nightHabits.length > 0 && (
              <HabitSection
                title="Night"
                emoji="🌙"
                habits={nightHabits}
                onCheck={handleCheck}
                onUncheck={handleUncheck}
                onArchive={handleArchive}
                onEdit={handleEdit}
                onDragEnd={(e) => handleDragEnd(e, nightHabits)}
                sensors={sensors}
              />
            )}

            {/* Anytime */}
            {anytimeHabits.length > 0 && (
              <HabitSection
                title="Anytime"
                emoji="✨"
                habits={anytimeHabits}
                onCheck={handleCheck}
                onUncheck={handleUncheck}
                onArchive={handleArchive}
                onEdit={handleEdit}
                onDragEnd={(e) => handleDragEnd(e, anytimeHabits)}
                sensors={sensors}
              />
            )}

            {/* Not Today */}
            {notTodayHabits.length > 0 && (
              <div className="opacity-50">
                <HabitSection
                  title="Not scheduled for today"
                  habits={notTodayHabits}
                  onCheck={handleCheck}
                  onUncheck={handleUncheck}
                  onArchive={handleArchive}
                  onEdit={handleEdit}
                  onDragEnd={(e) => handleDragEnd(e, notTodayHabits)}
                  sensors={sensors}
                  disabled
                />
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}

interface HabitSectionProps {
  title: string;
  emoji?: string;
  habits: Array<{
    id: string;
    name: string;
    emoji: string | null;
    description: string | null;
    color: string | null;
    currentStreak: number | null;
    isCompleted: boolean;
    isSkipped: boolean;
  }>;
  onCheck: (id: string, skipped?: boolean) => Promise<void>;
  onUncheck: (id: string) => Promise<void>;
  onArchive: (id: string) => Promise<void>;
  onEdit?: (id: string) => void;
  onDragEnd?: (event: DragEndEvent) => void;
  sensors: ReturnType<typeof useSensors>;
  disabled?: boolean;
}

function HabitSection({ title, emoji, habits, onCheck, onUncheck, onArchive, onEdit, onDragEnd, sensors, disabled }: HabitSectionProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          {emoji && <span>{emoji}</span>}
          {title}
          <span className="text-sm font-normal text-muted-foreground">
            ({habits.filter(h => h.isCompleted).length}/{habits.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={habits.map(h => h.id)}
            strategy={verticalListSortingStrategy}
          >
            {habits.map(habit => (
              <SortableHabitItem
                key={habit.id}
                habit={habit}
                onCheck={onCheck}
                onUncheck={onUncheck}
                onArchive={onArchive}
                onEdit={onEdit}
                disabled={disabled}
              />
            ))}
          </SortableContext>
        </DndContext>
      </CardContent>
    </Card>
  );
}

export default function ChecklistPage() {
  return (
    <ProtectedRoute featureCode="nav_checklist">
      <ChecklistContent />
    </ProtectedRoute>
  );
}
