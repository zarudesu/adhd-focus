/**
 * ADHD-focused task types
 * Designed to reduce decision fatigue and support executive function
 */

export type TaskStatus = 'inbox' | 'today' | 'scheduled' | 'in_progress' | 'done' | 'archived';

export type EnergyLevel = 'low' | 'medium' | 'high';

export type Priority = 'must' | 'should' | 'want' | 'someday';

export interface Task {
  id: string;
  user_id: string;

  // Core
  title: string;
  description?: string;
  status: TaskStatus;

  // ADHD-specific fields
  energy_required: EnergyLevel;      // Match task to current energy
  priority: Priority;                 // Must/Should/Want system
  estimated_minutes?: number;         // Time estimation practice
  actual_minutes?: number;            // Track actual time (learn patterns)
  pomodoros_completed: number;        // Pomodoro tracking

  // Dates
  due_date?: string;                  // ISO date
  scheduled_date?: string;            // When to work on it
  completed_at?: string;              // When finished

  // Organization
  project_id?: string;
  parent_task_id?: string;            // For subtasks (breaking down big tasks)
  tags: string[];

  // Gamification
  streak_contribution: boolean;       // Counts toward daily streak

  // Metadata
  created_at: string;
  updated_at: string;
  sort_order: number;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  energy_required?: EnergyLevel;
  priority?: Priority;
  estimated_minutes?: number;
  due_date?: string;
  scheduled_date?: string;
  project_id?: string;
  parent_task_id?: string;
  tags?: string[];
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  status?: TaskStatus;
  actual_minutes?: number;
  pomodoros_completed?: number;
  completed_at?: string;
}

// For the "one task at a time" focus mode
export interface FocusSession {
  id: string;
  user_id: string;
  task_id: string;
  started_at: string;
  ended_at?: string;
  duration_minutes: number;
  pomodoros: number;
  breaks_taken: number;
  completed: boolean;
}
