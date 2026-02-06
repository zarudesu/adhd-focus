import type { Task, EnergyLevel } from '../../types';

export type Duration = 'quick' | 'long';

export type ProcessingAction = 'today' | 'someday' | 'schedule' | 'delete';

export interface ProcessingState {
  duration: Duration | null;
  energy: EnergyLevel | null;
  projectId: string | null;
  firstStep: string;
}

export interface ProcessingCardProps {
  task: Task;
  onAction: (action: ProcessingAction, state: ProcessingState) => void;
  totalCount: number;
  currentIndex: number;
}
