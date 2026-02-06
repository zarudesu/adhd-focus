export type TimerMode = 'work' | 'shortBreak' | 'longBreak';
export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface FocusSession {
  id: string;
  userId: string;
  taskId: string | null;
  startedAt: string;
  endedAt: string | null;
  durationMinutes: number | null;
  pomodoros: number | null;
  breaksTaken: number | null;
  completed: boolean | null;
  createdAt: string | null;
  // Computed
  taskTitle?: string;
}

export interface CreateFocusSessionInput {
  taskId?: string;
  startedAt: string;
  durationMinutes: number;
}

export interface EndFocusSessionInput {
  completed: boolean;
  endedAt: string;
  pomodoros: number;
  breaksTaken: number;
  durationMinutes: number;
}
