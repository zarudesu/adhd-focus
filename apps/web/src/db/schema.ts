// ADHD Focus - Drizzle ORM Schema
// Database schema for PostgreSQL

import {
  boolean,
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  uuid,
  date,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { AdapterAccountType } from "@auth/core/adapters";

// ===================
// Enums
// ===================

export const taskStatusEnum = pgEnum("task_status", [
  "inbox",
  "today",
  "scheduled",
  "in_progress",
  "done",
  "archived",
]);

export const energyLevelEnum = pgEnum("energy_level", ["low", "medium", "high"]);

export const priorityEnum = pgEnum("priority", ["must", "should", "want", "someday"]);

// Gamification Enums
export const achievementVisibilityEnum = pgEnum("achievement_visibility", [
  "visible",      // Shown in list with progress
  "hidden",       // Shown as ??? until unlocked
  "invisible",    // Not shown at all until unlocked
  "ultra_secret", // Never shown to anyone else
]);

export const rarityEnum = pgEnum("rarity", [
  "common",
  "uncommon",
  "rare",
  "legendary",
  "mythic",
  "secret",
]);

// ===================
// NextAuth Tables
// ===================

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  passwordHash: text("password_hash"),

  // ADHD Focus specific
  preferences: jsonb("preferences").$type<UserPreferences>().default({
    defaultPomodoroMinutes: 25,
    defaultBreakMinutes: 5,
    longBreakMinutes: 15,
    pomodorosUntilLongBreak: 4,
    maxDailyTasks: 3,
    showOnlyOneTask: true,
    autoScheduleOverdue: true,
    morningPlanningReminder: true,
    highEnergyHours: [9, 10, 11],
    enableNotifications: true,
    notificationSound: true,
    theme: "system",
    timezone: "UTC",
  }),

  // Gamification
  xp: integer("xp").default(0),
  level: integer("level").default(1),
  totalCreatures: integer("total_creatures").default(0),
  rarestRewardSeen: text("rarest_reward_seen"),
  lastActiveDate: date("last_active_date"),

  // Stats
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  totalTasksCompleted: integer("total_tasks_completed").default(0),
  totalPomodoros: integer("total_pomodoros").default(0),
  totalFocusMinutes: integer("total_focus_minutes").default(0),

  // Onboarding progress (action counters)
  tasksAdded: integer("tasks_added").default(0),
  tasksAssignedToday: integer("tasks_assigned_today").default(0),
  tasksScheduled: integer("tasks_scheduled").default(0),
  tasksDeleted: integer("tasks_deleted").default(0),
  projectsCreated: integer("projects_created").default(0),
  inboxCleared: integer("inbox_cleared").default(0), // Times inbox was emptied
  focusSessionsCompleted: integer("focus_sessions_completed").default(0),

  // Onboarding flags
  onboardingCompleted: boolean("onboarding_completed").default(false),
  lastUnlockSeen: text("last_unlock_seen"), // Last feature unlock notification seen

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    {
      compoundKey: primaryKey({
        columns: [account.provider, account.providerAccountId],
      }),
    },
  ]
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    {
      compositePk: primaryKey({
        columns: [verificationToken.identifier, verificationToken.token],
      }),
    },
  ]
);

// ===================
// ADHD Focus Tables
// ===================

export const projects = pgTable("project", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  name: text("name").notNull(),
  description: text("description"),
  color: text("color").default("#6366f1"),
  emoji: text("emoji").default("📁"),
  archived: boolean("archived").default(false),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tasks = pgTable("task", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Core
  title: text("title").notNull(),
  description: text("description"),
  status: taskStatusEnum("status").default("inbox"),

  // ADHD-specific
  energyRequired: energyLevelEnum("energy_required").default("medium"),
  priority: priorityEnum("priority").default("should"),
  estimatedMinutes: integer("estimated_minutes"),
  actualMinutes: integer("actual_minutes"),
  pomodorosCompleted: integer("pomodoros_completed").default(0),

  // Dates
  dueDate: date("due_date"),
  scheduledDate: date("scheduled_date"),
  completedAt: timestamp("completed_at"),

  // Organization
  projectId: uuid("project_id").references(() => projects.id, { onDelete: "set null" }),
  parentTaskId: uuid("parent_task_id"),
  tags: text("tags").array().default([]),

  // Gamification
  streakContribution: boolean("streak_contribution").default(true),

  // Ordering
  sortOrder: integer("sort_order").default(0),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const focusSessions = pgTable("focus_session", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  taskId: uuid("task_id").references(() => tasks.id, { onDelete: "set null" }),

  startedAt: timestamp("started_at").notNull(),
  endedAt: timestamp("ended_at"),
  durationMinutes: integer("duration_minutes").default(0),
  pomodoros: integer("pomodoros").default(0),
  breaksTaken: integer("breaks_taken").default(0),
  completed: boolean("completed").default(false),

  createdAt: timestamp("created_at").defaultNow(),
});

export const dailyStats = pgTable("daily_stat", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  date: date("date").notNull(),

  tasksCompleted: integer("tasks_completed").default(0),
  pomodorosCompleted: integer("pomodoros_completed").default(0),
  focusMinutes: integer("focus_minutes").default(0),
  streakMaintained: boolean("streak_maintained").default(false),
  xpEarned: integer("xp_earned").default(0),
});

// ===================
// Gamification Tables
// ===================

// Feature unlocks - what features exist and when they unlock
export const features = pgTable("feature", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(), // "today", "priority", "projects"
  name: text("name").notNull(),
  description: text("description"),
  celebrationText: text("celebration_text"), // "🎉 You unlocked Today view!"

  // Unlock conditions (check in order, first match wins)
  unlockLevel: integer("unlock_level"), // Level required
  unlockAchievementCode: text("unlock_achievement_code"), // OR achievement required
  unlockTaskCount: integer("unlock_task_count"), // OR tasks completed

  // Action-based unlocks (onboarding)
  unlockTasksAdded: integer("unlock_tasks_added"), // Tasks added to inbox
  unlockTasksCompleted: integer("unlock_tasks_completed"), // Tasks completed
  unlockTasksAssignedToday: integer("unlock_tasks_assigned_today"), // Tasks moved to today
  unlockTasksScheduled: integer("unlock_tasks_scheduled"), // Tasks scheduled
  unlockProjectsCreated: integer("unlock_projects_created"), // Projects created
  unlockInboxCleared: integer("unlock_inbox_cleared"), // Times inbox cleared
  unlockFocusSessions: integer("unlock_focus_sessions"), // Focus sessions done
  unlockStreakDays: integer("unlock_streak_days"), // Streak days

  // UI
  icon: text("icon"), // Lucide icon name
  category: text("category").default("general"), // "navigation", "feature", "setting"
  sortOrder: integer("sort_order").default(0),
  isNavItem: boolean("is_nav_item").default(false), // Show in sidebar

  createdAt: timestamp("created_at").defaultNow(),
});

// User's unlocked features
export const userFeatures = pgTable("user_feature", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  featureCode: text("feature_code").notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
});

// Achievements definitions
export const achievements = pgTable("achievement", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  hiddenName: text("hidden_name").default("???"), // What to show when hidden
  description: text("description"),
  hiddenDescription: text("hidden_description").default("Complete secret conditions to unlock"),

  icon: text("icon"), // Emoji or icon
  category: text("category").notNull(), // "progress", "streak", "daily", "weekly", etc.
  subcategory: text("subcategory"), // More specific categorization

  // Visibility
  visibility: achievementVisibilityEnum("visibility").default("visible"),

  // Rewards
  xpReward: integer("xp_reward").default(0),
  unlocksFeature: text("unlocks_feature"), // Feature code to unlock
  unlocksCreature: text("unlocks_creature"), // Creature code to add

  // Conditions (JSONB for flexibility)
  conditionType: text("condition_type").notNull(), // "task_count", "streak_days", "level", "time", "special"
  conditionValue: jsonb("condition_value").$type<AchievementCondition>(),

  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// User's unlocked achievements
export const userAchievements = pgTable("user_achievement", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  achievementId: uuid("achievement_id")
    .notNull()
    .references(() => achievements.id, { onDelete: "cascade" }),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
});

// Creatures definitions
export const creatures = pgTable("creature", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  emoji: text("emoji").notNull(),
  description: text("description"),

  rarity: rarityEnum("rarity").default("common"),

  // Spawn conditions
  spawnConditions: jsonb("spawn_conditions").$type<CreatureSpawnCondition>(),
  spawnChance: integer("spawn_chance").default(100), // Out of 1000

  // Evolution
  evolvesFrom: text("evolves_from"), // Creature code
  evolvesTo: text("evolves_to"), // Creature code
  evolutionCondition: jsonb("evolution_condition").$type<CreatureEvolutionCondition>(),

  // Bonuses
  xpMultiplier: integer("xp_multiplier").default(100), // 100 = 1x, 150 = 1.5x

  createdAt: timestamp("created_at").defaultNow(),
});

// User's creature collection
export const userCreatures = pgTable("user_creature", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  creatureId: uuid("creature_id")
    .notNull()
    .references(() => creatures.id, { onDelete: "cascade" }),
  count: integer("count").default(1),
  firstCaughtAt: timestamp("first_caught_at").defaultNow(),
});

// Visual reward log (for statistics and ensuring variety)
export const rewardLogs = pgTable("reward_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  rewardType: text("reward_type").notNull(), // "sparkle", "glitch", "unicorn", etc
  rarity: rarityEnum("rarity").notNull(),
  triggeredBy: text("triggered_by"), // "task_complete", "achievement", "level_up"
  seenAt: timestamp("seen_at").defaultNow(),
});

// ===================
// Relations
// ===================

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  projects: many(projects),
  tasks: many(tasks),
  focusSessions: many(focusSessions),
  dailyStats: many(dailyStats),
  // Gamification
  userFeatures: many(userFeatures),
  userAchievements: many(userAchievements),
  userCreatures: many(userCreatures),
  rewardLogs: many(rewardLogs),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  user: one(users, {
    fields: [tasks.userId],
    references: [users.id],
  }),
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  parentTask: one(tasks, {
    fields: [tasks.parentTaskId],
    references: [tasks.id],
    relationName: "subtasks",
  }),
  subtasks: many(tasks, { relationName: "subtasks" }),
  focusSessions: many(focusSessions),
}));

export const focusSessionsRelations = relations(focusSessions, ({ one }) => ({
  user: one(users, {
    fields: [focusSessions.userId],
    references: [users.id],
  }),
  task: one(tasks, {
    fields: [focusSessions.taskId],
    references: [tasks.id],
  }),
}));

export const dailyStatsRelations = relations(dailyStats, ({ one }) => ({
  user: one(users, {
    fields: [dailyStats.userId],
    references: [users.id],
  }),
}));

// Gamification Relations
export const userFeaturesRelations = relations(userFeatures, ({ one }) => ({
  user: one(users, {
    fields: [userFeatures.userId],
    references: [users.id],
  }),
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, {
    fields: [userAchievements.userId],
    references: [users.id],
  }),
  achievement: one(achievements, {
    fields: [userAchievements.achievementId],
    references: [achievements.id],
  }),
}));

export const creaturesRelations = relations(creatures, ({ many }) => ({
  userCreatures: many(userCreatures),
}));

export const userCreaturesRelations = relations(userCreatures, ({ one }) => ({
  user: one(users, {
    fields: [userCreatures.userId],
    references: [users.id],
  }),
  creature: one(creatures, {
    fields: [userCreatures.creatureId],
    references: [creatures.id],
  }),
}));

export const rewardLogsRelations = relations(rewardLogs, ({ one }) => ({
  user: one(users, {
    fields: [rewardLogs.userId],
    references: [users.id],
  }),
}));

// ===================
// Types
// ===================

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
  theme: "light" | "dark" | "system";
  timezone: string;
  /** Default landing page after login (only unlocked pages can be selected) */
  defaultLandingPage?: "inbox" | "today" | "scheduled" | "projects" | "completed";
}

// Gamification condition types
export interface AchievementCondition {
  // For task_count
  count?: number;
  timeframe?: 'total' | 'hour' | 'day' | 'week' | 'month' | 'year';

  // Task properties
  priority?: 'critical' | 'should' | 'want' | 'someday';
  energy?: 'low' | 'medium' | 'high';
  duration?: 'quick' | 'medium' | 'long';

  // Context
  hasDescription?: boolean;
  hasSubtasks?: boolean;
  hasTags?: boolean;
  inProject?: boolean;
  noProject?: boolean;
  recurring?: boolean;
  onTime?: boolean;
  wasOverdue?: boolean;
  context?: string;

  // For streak_days
  days?: number;

  // For level
  level?: number;

  // For XP
  xp?: number;
  hours?: number;

  // For time-based
  hour?: number;
  minute?: number;
  dayOfWeek?: number; // 0-6
  dayOfMonth?: number; // 1-31
  month?: number; // 0-11
  period?: 'morning' | 'afternoon' | 'evening' | 'night';
  weekend?: boolean;
  weekday?: boolean;

  // For task numbers
  number?: number;

  // For special conditions
  special?: string; // Custom condition identifier
  action?: string;
  rarity?: string;
  all?: boolean;
  complete?: boolean;
  minutes?: number;
}

export interface CreatureSpawnCondition {
  // When can this creature spawn?
  onTaskComplete?: boolean;
  onQuickTask?: boolean; // Tasks < 5 min
  onStreakDay?: number; // Minimum streak
  onLevel?: number; // Minimum level
  onTimeRange?: { startHour: number; endHour: number };
  onSpecial?: string; // Custom condition
}

export interface CreatureEvolutionCondition {
  // What triggers evolution?
  catchCount?: number; // Have N of this creature
  streakDays?: number;
  level?: number;
  special?: string;
}

// Export types for use in the app
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
export type FocusSession = typeof focusSessions.$inferSelect;
export type NewFocusSession = typeof focusSessions.$inferInsert;
export type DailyStat = typeof dailyStats.$inferSelect;
export type NewDailyStat = typeof dailyStats.$inferInsert;

// Gamification types
export type Feature = typeof features.$inferSelect;
export type NewFeature = typeof features.$inferInsert;
export type UserFeature = typeof userFeatures.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type NewAchievement = typeof achievements.$inferInsert;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type Creature = typeof creatures.$inferSelect;
export type NewCreature = typeof creatures.$inferInsert;
export type UserCreature = typeof userCreatures.$inferSelect;
export type RewardLog = typeof rewardLogs.$inferSelect;

// Feature codes as const for type safety
export const FEATURE_CODES = {
  INBOX: 'inbox',
  TODAY: 'today',
  PRIORITY: 'priority',
  ENERGY: 'energy',
  PROJECTS: 'projects',
  SCHEDULED: 'scheduled',
  DESCRIPTION: 'description',
  QUICK_ACTIONS: 'quick_actions',
  TAGS: 'tags',
  FOCUS_MODE: 'focus_mode',
  STATS: 'stats',
  THEMES: 'themes',
  SETTINGS: 'settings',
  NOTIFICATIONS: 'notifications',
  ADVANCED_STATS: 'advanced_stats',
} as const;

export type FeatureCode = typeof FEATURE_CODES[keyof typeof FEATURE_CODES];
