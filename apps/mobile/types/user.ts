export interface UserPreferences {
  defaultPomodoroMinutes: number;
  defaultBreakMinutes: number;
  longBreakMinutes: number;
  pomodorosUntilLongBreak: number;
  maxDailyTasks: number;
  showOnlyOneTask: boolean;
  autoScheduleOverdue: boolean;
  morningPlanningReminder: boolean;
  highEnergyHours: number[];
  enableNotifications: boolean;
  notificationSound: boolean;
  theme: 'light' | 'dark' | 'system';
  timezone: string;
  defaultLandingPage?: 'inbox' | 'today' | 'scheduled' | 'projects' | 'completed';
  reduceAnimations?: boolean;
  enableCelebrations?: boolean;
}

export interface User {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  preferences: UserPreferences | null;
  xp: number | null;
  level: number | null;
  currentStreak: number | null;
  longestStreak: number | null;
  totalTasksCompleted: number | null;
  totalPomodoros: number | null;
  totalFocusMinutes: number | null;
  tasksAdded: number | null;
  tasksAssignedToday: number | null;
  tasksScheduled: number | null;
  projectsCreated: number | null;
  habitsCreated: number | null;
  habitsCompleted: number | null;
  habitStreak: number | null;
  createdAt: string | null;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string | null;
    name: string | null;
    level: number;
    xp: number;
    currentStreak: number;
    longestStreak: number;
    totalTasksCompleted: number;
    pomodoroWorkMinutes: number;
    pomodoroShortBreak: number;
    pomodoroLongBreak: number;
    wipLimit: number;
  };
}

export interface UserStats {
  dailyStats: DailyStatEntry[];
  periodTotals: {
    tasksCompleted: number;
    pomodorosCompleted: number;
    focusMinutes: number;
    xpEarned: number;
  };
  allTime: {
    totalTasks: number;
    totalPomodoros: number;
    totalFocusMinutes: number;
    currentStreak: number;
    longestStreak: number;
    level: number;
    xp: number;
  };
}

export interface DailyStatEntry {
  date: string;
  tasksCompleted: number;
  pomodorosCompleted: number;
  focusMinutes: number;
  xpEarned: number;
}
