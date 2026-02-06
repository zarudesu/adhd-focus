export type TaskStatus = 'inbox' | 'today' | 'scheduled' | 'in_progress' | 'done' | 'archived';
export type EnergyLevel = 'low' | 'medium' | 'high';
export type Priority = 'must' | 'should' | 'want' | 'someday';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  status: TaskStatus | null;
  energyRequired: EnergyLevel | null;
  priority: Priority | null;
  estimatedMinutes: number | null;
  actualMinutes: number | null;
  pomodorosCompleted: number | null;
  dueDate: string | null;
  scheduledDate: string | null;
  completedAt: string | null;
  snoozedUntil: string | null;
  projectId: string | null;
  parentTaskId: string | null;
  tags: string[] | null;
  streakContribution: boolean | null;
  sortOrder: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  energyRequired?: EnergyLevel;
  priority?: Priority;
  estimatedMinutes?: number;
  dueDate?: string;
  scheduledDate?: string;
  projectId?: string;
  status?: 'inbox' | 'today' | 'scheduled';
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  energyRequired?: EnergyLevel;
  priority?: Priority;
  estimatedMinutes?: number | null;
  dueDate?: string | null;
  scheduledDate?: string | null;
  projectId?: string | null;
  completedAt?: string | null;
  sortOrder?: number;
}
