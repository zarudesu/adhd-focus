export type CreatureRarity = 'common' | 'uncommon' | 'rare' | 'legendary' | 'mythic' | 'secret';

export interface Achievement {
  id: string;
  code: string;
  name: string;
  hiddenName: string | null;
  description: string | null;
  hiddenDescription: string | null;
  icon: string | null;
  category: string;
  visibility: 'visible' | 'hidden' | 'invisible' | 'ultra_secret' | null;
  xpReward: number | null;
  sortOrder: number | null;
  // Computed by API
  isUnlocked?: boolean;
  unlockedAt?: string | null;
  progress?: number;
}

export interface Creature {
  id: string;
  code: string;
  name: string;
  emoji: string;
  description: string | null;
  rarity: CreatureRarity | null;
  xpMultiplier: number | null;
  // Computed by API
  isCaught?: boolean;
  count?: number;
  firstCaughtAt?: string | null;
}

export interface Feature {
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  category: string | null;
  isNavItem: boolean | null;
  // Computed
  isUnlocked?: boolean;
  firstOpenedAt?: string | null;
}

export type FeatureCode =
  | 'nav_inbox'
  | 'nav_process'
  | 'nav_today'
  | 'nav_scheduled'
  | 'nav_projects'
  | 'nav_completed'
  | 'nav_checklist'
  | 'nav_quick_actions'
  | 'nav_focus'
  | 'nav_achievements'
  | 'nav_creatures'
  | 'nav_stats'
  | 'nav_settings'
  | 'priority_basic'
  | 'energy_basic'
  | 'task_time_estimate'
  | 'task_description'
  | 'task_scheduling';

export interface GamificationStats {
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  totalTasksCompleted: number;
  totalPomodoros: number;
  totalFocusMinutes: number;
  unlockedFeatures: string[];
  achievements: Achievement[];
  creatures: Creature[];
}

export interface CompleteResult {
  xpAwarded?: number;
  levelUp?: boolean;
  newLevel?: number;
  newAchievements?: Achievement[];
  creature?: Creature | null;
}
