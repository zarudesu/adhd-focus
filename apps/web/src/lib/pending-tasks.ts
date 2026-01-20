/**
 * Pending Tasks - localStorage helpers
 * beatyour8 Philosophy: Capture thoughts before registration
 *
 * Users can add tasks on landing page without auth.
 * Tasks sync to their account after registration.
 */

export interface PendingTask {
  id: string;
  title: string;
  createdAt: string;
}

const STORAGE_KEY = 'adhd-focus-pending-tasks';

function generateId(): string {
  return `pending-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function addPendingTask(title: string): PendingTask {
  const tasks = getPendingTasks();
  const newTask: PendingTask = {
    id: generateId(),
    title: title.trim(),
    createdAt: new Date().toISOString(),
  };
  tasks.push(newTask);

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }

  return newTask;
}

export function getPendingTasks(): PendingTask[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function clearPendingTasks(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function hasPendingTasks(): boolean {
  return getPendingTasks().length > 0;
}

export function getPendingTaskCount(): number {
  return getPendingTasks().length;
}
