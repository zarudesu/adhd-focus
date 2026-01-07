/**
 * User types with ADHD-friendly preferences
 */

export interface User {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;

  // Preferences
  preferences: UserPreferences;

  // Gamification stats
  stats: UserStats;

  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  // Focus settings
  default_pomodoro_minutes: number;      // Default: 25
  default_break_minutes: number;         // Default: 5
  long_break_minutes: number;            // Default: 15
  pomodoros_until_long_break: number;    // Default: 4

  // ADHD settings
  max_daily_tasks: number;               // WIP limit for today (default: 3)
  show_only_one_task: boolean;           // Hide other tasks during focus
  auto_schedule_overdue: boolean;        // Move overdue to today automatically
  morning_planning_reminder: boolean;    // Remind to plan the day

  // Energy-based scheduling
  high_energy_hours: number[];           // e.g., [9, 10, 11] - morning person

  // Notifications
  enable_notifications: boolean;
  notification_sound: boolean;

  // Theme
  theme: 'light' | 'dark' | 'system';

  // Timezone
  timezone: string;
}

export interface UserStats {
  current_streak: number;               // Days in a row with completed tasks
  longest_streak: number;
  total_tasks_completed: number;
  total_pomodoros: number;
  total_focus_minutes: number;

  // Weekly stats
  tasks_completed_this_week: number;
  pomodoros_this_week: number;
  focus_minutes_this_week: number;

  // Achievements unlocked
  achievements: string[];
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  default_pomodoro_minutes: 25,
  default_break_minutes: 5,
  long_break_minutes: 15,
  pomodoros_until_long_break: 4,
  max_daily_tasks: 3,
  show_only_one_task: true,
  auto_schedule_overdue: true,
  morning_planning_reminder: true,
  high_energy_hours: [9, 10, 11],
  enable_notifications: true,
  notification_sound: true,
  theme: 'system',
  timezone: 'UTC',
};
