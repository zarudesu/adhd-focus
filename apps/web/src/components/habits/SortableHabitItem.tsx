'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { HabitItem } from './HabitItem';

interface SortableHabitItemProps {
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

export function SortableHabitItem({
  habit,
  onCheck,
  onUncheck,
  onArchive,
  onEdit,
  disabled,
}: SortableHabitItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: habit.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative flex items-center gap-1">
      <button
        className="flex-shrink-0 p-1 text-muted-foreground/40 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex-1">
        <HabitItem
          habit={habit}
          onCheck={onCheck}
          onUncheck={onUncheck}
          onArchive={onArchive}
          onEdit={onEdit}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
