import { create } from 'zustand';
import { Task, CreateTaskInput, UpdateTaskInput, TaskStatus } from '@adhd-focus/shared';

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;

  // Actions
  addTask: (input: CreateTaskInput) => void;
  updateTask: (id: string, input: UpdateTaskInput) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  moveToToday: (id: string) => void;

  // Selectors
  getTodayTasks: () => Task[];
  getInboxTasks: () => Task[];
  getCurrentTask: () => Task | null;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  addTask: (input) => {
    const newTask: Task = {
      id: Date.now().toString(),
      user_id: 'local',
      title: input.title,
      description: input.description,
      status: 'inbox',
      energy_required: input.energy_required || 'medium',
      priority: input.priority || 'should',
      estimated_minutes: input.estimated_minutes,
      pomodoros_completed: 0,
      due_date: input.due_date,
      scheduled_date: input.scheduled_date,
      project_id: input.project_id,
      parent_task_id: input.parent_task_id,
      tags: input.tags || [],
      streak_contribution: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sort_order: get().tasks.length,
    };

    set((state) => ({
      tasks: [...state.tasks, newTask],
    }));
  },

  updateTask: (id, input) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? { ...task, ...input, updated_at: new Date().toISOString() }
          : task
      ),
    }));
  },

  deleteTask: (id) => {
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id),
    }));
  },

  completeTask: (id) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              status: 'done' as TaskStatus,
              completed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          : task
      ),
    }));
  },

  moveToToday: (id) => {
    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.id === id
          ? {
              ...task,
              status: 'today' as TaskStatus,
              scheduled_date: new Date().toISOString().split('T')[0],
              updated_at: new Date().toISOString(),
            }
          : task
      ),
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
    // Return in_progress first, then first today task
    const inProgress = todayTasks.find((t) => t.status === 'in_progress');
    if (inProgress) return inProgress;
    return todayTasks[0] || null;
  },
}));
