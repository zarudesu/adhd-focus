/**
 * Pending Tasks - localStorage helpers
 * Stores tasks before user registration
 */

export type PendingTask = {
  title: string;
  createdAt: string;
};

const STORAGE_KEY = 'adhd-focus-pending-tasks';

export function addPendingTask(title: string): void {
  if (typeof window === 'undefined') return;

  const tasks = getPendingTasks();
  tasks.push({
    title: title.trim(),
    createdAt: new Date().toISOString(),
  });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
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
