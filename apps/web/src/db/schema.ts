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

  // Stats
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  totalTasksCompleted: integer("total_tasks_completed").default(0),
  totalPomodoros: integer("total_pomodoros").default(0),
  totalFocusMinutes: integer("total_focus_minutes").default(0),

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
