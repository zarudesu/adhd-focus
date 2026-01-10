/**
 * Project types
 */

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  color: string;
  emoji: string;
  archived: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  color?: string;
  emoji?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  color?: string;
  emoji?: string;
  archived?: boolean;
}

export const DEFAULT_PROJECT_COLORS = [
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#f43f5e', // Rose
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#14b8a6', // Teal
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
];

export const DEFAULT_PROJECT_EMOJIS = [
  '📁', '📂', '💼', '🎯', '🚀',
  '💡', '⭐', '🔥', '💎', '🎨',
  '📚', '🏠', '💪', '🧠', '❤️',
];
