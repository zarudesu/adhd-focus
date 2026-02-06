import { create } from 'zustand';
import type { Task, UpdateTaskInput } from '../types';

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, input: UpdateTaskInput) => void;
  removeTask: (id: string) => void;
  getTodayTasks: () => Task[];
  getInboxTasks: () => Task[];
  getCurrentTask: () => Task | null;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  setTasks: (tasks) => set({ tasks }),

  addTask: (task) => {
    set((state) => ({ tasks: [task, ...state.tasks] }));
  },

  updateTask: (id, input) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id ? { ...task, ...input } : task
      ),
    }));
  },

  removeTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    }));
  },

  getTodayTasks: () => {
    return get().tasks.filter(
      (task) => task.status === 'today' || task.status === 'in_progress'
    );
  },

  getInboxTasks: () => {
    return get().tasks.filter((task) => task.status === 'inbox');
  },

  getCurrentTask: () => {
    const todayTasks = get().getTodayTasks();
    const inProgress = todayTasks.find((t) => t.status === 'in_progress');
    return inProgress || todayTasks[0] || null;
  },
}));
