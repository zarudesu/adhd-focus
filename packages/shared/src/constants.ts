/**
 * App constants
 */

export const APP_NAME = 'ADHD Focus';
export const APP_VERSION = '0.0.1';

// Task limits (ADHD-friendly defaults)
export const MAX_DAILY_TASKS = 3;
export const MAX_INBOX_BEFORE_WARNING = 10;
export const MAX_TASK_TITLE_LENGTH = 200;

// Pomodoro defaults
export const DEFAULT_POMODORO_MINUTES = 25;
export const DEFAULT_SHORT_BREAK_MINUTES = 5;
export const DEFAULT_LONG_BREAK_MINUTES = 15;
export const POMODOROS_UNTIL_LONG_BREAK = 4;

// Energy levels with emojis for UI
export const ENERGY_LABELS = {
  low: { emoji: '🔋', label: 'Low energy', color: '#6B7280' },
  medium: { emoji: '⚡', label: 'Medium energy', color: '#F59E0B' },
  high: { emoji: '🔥', label: 'High energy', color: '#EF4444' },
} as const;

// Priority labels with emojis
export const PRIORITY_LABELS = {
  must: { emoji: '🎯', label: 'Must do', color: '#EF4444' },
  should: { emoji: '📌', label: 'Should do', color: '#F59E0B' },
  want: { emoji: '💡', label: 'Want to do', color: '#3B82F6' },
  someday: { emoji: '🌙', label: 'Someday', color: '#6B7280' },
} as const;

// Status labels
export const STATUS_LABELS = {
  inbox: { emoji: '📥', label: 'Inbox' },
  today: { emoji: '📅', label: 'Today' },
  scheduled: { emoji: '🗓️', label: 'Scheduled' },
  in_progress: { emoji: '🚀', label: 'In Progress' },
  done: { emoji: '✅', label: 'Done' },
  archived: { emoji: '📦', label: 'Archived' },
} as const;

// Gamification
export const STREAK_MILESTONE = [3, 7, 14, 30, 60, 100, 365];

export const ACHIEVEMENTS = {
  first_task: { name: 'First Step', description: 'Complete your first task' },
  streak_3: { name: 'Getting Started', description: '3-day streak' },
  streak_7: { name: 'Week Warrior', description: '7-day streak' },
  streak_30: { name: 'Monthly Master', description: '30-day streak' },
  pomodoro_10: { name: 'Focus Finder', description: 'Complete 10 pomodoros' },
  pomodoro_100: { name: 'Focus Master', description: 'Complete 100 pomodoros' },
} as const;
