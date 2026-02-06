export type HabitFrequency = 'daily' | 'weekdays' | 'weekends' | 'custom';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night' | 'anytime';

export interface Habit {
  id: string;
  userId: string;
  name: string;
  emoji: string | null;
  description: string | null;
  frequency: HabitFrequency | null;
  customDays: number[] | null;
  timeOfDay: TimeOfDay | null;
  sortOrder: number | null;
  color: string | null;
  isArchived: boolean | null;
  currentStreak: number | null;
  longestStreak: number | null;
  totalCompletions: number | null;
  createdAt: string | null;
  archivedAt: string | null;
  // Computed by API
  shouldDoToday?: boolean;
  todayCheck?: HabitCheck | null;
  isCompleted?: boolean;
  isSkipped?: boolean;
}

export interface HabitCheck {
  id: string;
  habitId: string;
  userId: string;
  date: string;
  checkedAt: string | null;
  skipped: boolean | null;
  reflection: string | null;
  blockers: string[] | null;
  xpAwarded: number | null;
}

export interface CreateHabitInput {
  name: string;
  emoji?: string;
  description?: string;
  frequency?: HabitFrequency;
  customDays?: number[];
  timeOfDay?: TimeOfDay;
  color?: string;
}

export interface UpdateHabitInput {
  name?: string;
  emoji?: string;
  description?: string;
  frequency?: HabitFrequency;
  customDays?: number[];
  timeOfDay?: TimeOfDay;
  color?: string;
  sortOrder?: number;
}
