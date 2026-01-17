/**
 * Seed script for gamification data
 * Run with: npx tsx src/db/seed-gamification.ts
 */

import { db } from './index';
import { features, achievements, creatures, FEATURE_CODES } from './schema';

async function seedFeatures() {
  console.log('Seeding features...');

  const featureData = [
    { code: FEATURE_CODES.INBOX, name: 'Inbox', description: 'Capture tasks quickly without organizing', icon: 'Inbox', unlockLevel: 0, sortOrder: 1 },
    { code: FEATURE_CODES.TODAY, name: 'Today', description: 'Focus on your daily tasks', icon: 'Sun', unlockLevel: 2, unlockTaskCount: 3, sortOrder: 2 },
    { code: FEATURE_CODES.PRIORITY, name: 'Priority', description: 'Set task priorities (must/should/want/someday)', icon: 'Flag', unlockLevel: 3, unlockTaskCount: 5, sortOrder: 3 },
    { code: FEATURE_CODES.ENERGY, name: 'Energy Levels', description: 'Match tasks to your energy level', icon: 'Zap', unlockLevel: 4, unlockTaskCount: 10, sortOrder: 4 },
    { code: FEATURE_CODES.PROJECTS, name: 'Projects', description: 'Organize tasks into projects', icon: 'Folder', unlockLevel: 5, unlockTaskCount: 15, sortOrder: 5 },
    { code: FEATURE_CODES.SCHEDULED, name: 'Scheduled', description: 'Plan tasks for future days', icon: 'Calendar', unlockLevel: 6, sortOrder: 6 },
    { code: FEATURE_CODES.DESCRIPTION, name: 'Descriptions', description: 'Add detailed notes to tasks', icon: 'FileText', unlockLevel: 7, unlockTaskCount: 20, sortOrder: 7 },
    { code: FEATURE_CODES.QUICK_ACTIONS, name: 'Quick Actions', description: 'Speed through small tasks', icon: 'Zap', unlockLevel: 8, sortOrder: 8 },
    { code: FEATURE_CODES.TAGS, name: 'Tags', description: 'Categorize tasks with tags', icon: 'Tag', unlockLevel: 9, sortOrder: 9 },
    { code: FEATURE_CODES.FOCUS_MODE, name: 'Focus Mode', description: 'Pomodoro timer for deep work', icon: 'Timer', unlockLevel: 10, sortOrder: 10 },
    { code: FEATURE_CODES.STATS, name: 'Statistics', description: 'Track your productivity', icon: 'BarChart', unlockLevel: 12, sortOrder: 11 },
    { code: FEATURE_CODES.THEMES, name: 'Themes', description: 'Customize app appearance', icon: 'Palette', unlockLevel: 15, sortOrder: 12 },
    { code: FEATURE_CODES.SETTINGS, name: 'Settings', description: 'Full app configuration', icon: 'Settings', unlockLevel: 18, sortOrder: 13 },
    { code: FEATURE_CODES.NOTIFICATIONS, name: 'Notifications', description: 'Get reminders and alerts', icon: 'Bell', unlockLevel: 20, sortOrder: 14 },
    { code: FEATURE_CODES.ADVANCED_STATS, name: 'Advanced Stats', description: 'Deep productivity analytics', icon: 'LineChart', unlockLevel: 25, sortOrder: 15 },
  ];

  for (const feature of featureData) {
    await db.insert(features).values(feature).onConflictDoNothing();
  }

  console.log(`Seeded ${featureData.length} features`);
}

async function seedAchievements() {
  console.log('Seeding achievements...');

  const achievementData = [
    // PROGRESS - visible
    { code: 'first_task', name: 'First Steps', description: 'Complete your first task', icon: '🎯', category: 'progress', visibility: 'visible' as const, xpReward: 10, conditionType: 'task_count', conditionValue: { count: 1 }, sortOrder: 1 },
    { code: 'task_10', name: 'Getting Started', description: 'Complete 10 tasks', icon: '🌱', category: 'progress', visibility: 'visible' as const, xpReward: 25, conditionType: 'task_count', conditionValue: { count: 10 }, sortOrder: 2 },
    { code: 'task_50', name: 'Halfway There', description: 'Complete 50 tasks', icon: '🌿', category: 'progress', visibility: 'visible' as const, xpReward: 50, conditionType: 'task_count', conditionValue: { count: 50 }, sortOrder: 3 },
    { code: 'task_100', name: 'Centurion', description: 'Complete 100 tasks', icon: '🌳', category: 'progress', visibility: 'visible' as const, xpReward: 100, conditionType: 'task_count', conditionValue: { count: 100 }, sortOrder: 4 },
    { code: 'task_500', name: 'Task Master', description: 'Complete 500 tasks', icon: '🏔️', category: 'progress', visibility: 'visible' as const, xpReward: 250, conditionType: 'task_count', conditionValue: { count: 500 }, sortOrder: 5 },
    { code: 'task_1000', name: 'Legendary', description: 'Complete 1000 tasks', icon: '⭐', category: 'progress', visibility: 'visible' as const, xpReward: 500, conditionType: 'task_count', conditionValue: { count: 1000 }, sortOrder: 6 },

    // STREAKS - visible
    { code: 'streak_3', name: 'Spark', description: '3 day streak', icon: '✨', category: 'streak', visibility: 'visible' as const, xpReward: 15, conditionType: 'streak_days', conditionValue: { days: 3 }, sortOrder: 10 },
    { code: 'streak_7', name: 'Flame', description: '7 day streak', icon: '🔥', category: 'streak', visibility: 'visible' as const, xpReward: 35, conditionType: 'streak_days', conditionValue: { days: 7 }, sortOrder: 11 },
    { code: 'streak_14', name: 'Blaze', description: '14 day streak', icon: '🔥🔥', category: 'streak', visibility: 'visible' as const, xpReward: 70, conditionType: 'streak_days', conditionValue: { days: 14 }, sortOrder: 12 },
    { code: 'streak_30', name: 'Inferno', description: '30 day streak', icon: '🌋', category: 'streak', visibility: 'visible' as const, xpReward: 150, conditionType: 'streak_days', conditionValue: { days: 30 }, sortOrder: 13 },
    { code: 'streak_100', name: 'Eternal Flame', description: '100 day streak', icon: '💎', category: 'streak', visibility: 'visible' as const, xpReward: 500, conditionType: 'streak_days', conditionValue: { days: 100 }, sortOrder: 14 },
    { code: 'streak_365', name: 'Phoenix', description: '365 day streak', icon: '🌟', category: 'streak', visibility: 'visible' as const, xpReward: 1000, conditionType: 'streak_days', conditionValue: { days: 365 }, sortOrder: 15 },

    // LEVELS - visible
    { code: 'level_5', name: 'Apprentice', description: 'Reach level 5', icon: '🥉', category: 'mastery', visibility: 'visible' as const, xpReward: 25, conditionType: 'level', conditionValue: { level: 5 }, sortOrder: 20 },
    { code: 'level_10', name: 'Journeyman', description: 'Reach level 10', icon: '🥈', category: 'mastery', visibility: 'visible' as const, xpReward: 50, conditionType: 'level', conditionValue: { level: 10 }, sortOrder: 21 },
    { code: 'level_25', name: 'Expert', description: 'Reach level 25', icon: '🥇', category: 'mastery', visibility: 'visible' as const, xpReward: 125, conditionType: 'level', conditionValue: { level: 25 }, sortOrder: 22 },
    { code: 'level_50', name: 'Master', description: 'Reach level 50', icon: '🏆', category: 'mastery', visibility: 'visible' as const, xpReward: 250, conditionType: 'level', conditionValue: { level: 50 }, sortOrder: 23 },
    { code: 'level_100', name: 'Grandmaster', description: 'Reach level 100', icon: '👑', category: 'mastery', visibility: 'visible' as const, xpReward: 500, conditionType: 'level', conditionValue: { level: 100 }, sortOrder: 24 },

    // HIDDEN - shown as ???
    { code: 'night_owl', name: 'Night Owl', hiddenName: '???', description: 'Complete a task after midnight', hiddenDescription: 'Complete secret conditions', icon: '🦉', category: 'hidden', visibility: 'hidden' as const, xpReward: 20, conditionType: 'time', conditionValue: { hour: 0 }, sortOrder: 30 },
    { code: 'early_bird', name: 'Early Bird', hiddenName: '???', description: 'Complete a task before 6 AM', hiddenDescription: 'Complete secret conditions', icon: '🐦', category: 'hidden', visibility: 'hidden' as const, xpReward: 20, conditionType: 'time', conditionValue: { hour: 5 }, sortOrder: 31 },
    { code: 'weekend_warrior', name: 'Weekend Warrior', hiddenName: '???', description: 'Complete 5 tasks on a weekend', hiddenDescription: 'Complete secret conditions', icon: '⚔️', category: 'hidden', visibility: 'hidden' as const, xpReward: 30, conditionType: 'special', conditionValue: { special: 'weekend_5_tasks' }, sortOrder: 32 },
    { code: 'lucky_seven', name: 'Lucky Seven', hiddenName: '???', description: 'Complete 7 tasks on the 7th at 7:07', hiddenDescription: 'Complete secret conditions', icon: '🍀', category: 'hidden', visibility: 'hidden' as const, xpReward: 77, conditionType: 'time', conditionValue: { dayOfMonth: 7, hour: 7, minute: 7 }, sortOrder: 33 },
    { code: 'midnight_hero', name: 'Midnight Hero', hiddenName: '???', description: 'Complete a task at exactly midnight', hiddenDescription: 'Complete secret conditions', icon: '🌙', category: 'hidden', visibility: 'hidden' as const, xpReward: 50, conditionType: 'time', conditionValue: { hour: 0, minute: 0 }, sortOrder: 34 },

    // INVISIBLE - not shown until unlocked
    { code: 'triple_three', name: '3:33 AM', hiddenName: '???', description: 'Complete a task at 3:33 AM', hiddenDescription: '???', icon: '👁️', category: 'secret', visibility: 'invisible' as const, xpReward: 66, conditionType: 'time', conditionValue: { hour: 3, minute: 33 }, sortOrder: 40 },
    { code: 'friday_13', name: 'Fearless', hiddenName: '???', description: 'Complete a task on Friday the 13th', hiddenDescription: '???', icon: '🎃', category: 'secret', visibility: 'invisible' as const, xpReward: 113, conditionType: 'special', conditionValue: { special: 'friday_13' }, sortOrder: 41 },
    { code: 'new_year', name: 'New Beginnings', hiddenName: '???', description: 'Complete a task at midnight on New Year', hiddenDescription: '???', icon: '🎆', category: 'secret', visibility: 'invisible' as const, xpReward: 100, conditionType: 'time', conditionValue: { month: 0, dayOfMonth: 1, hour: 0 }, sortOrder: 42 },
    { code: 'task_666', name: 'The Number', hiddenName: '???', description: 'Complete your 666th task', hiddenDescription: '???', icon: '😈', category: 'secret', visibility: 'invisible' as const, xpReward: 66, conditionType: 'task_count', conditionValue: { count: 666 }, sortOrder: 43 },
    { code: 'palindrome', name: 'Mirror Mirror', hiddenName: '???', description: 'Complete task #121, #131, #141...', hiddenDescription: '???', icon: '🪞', category: 'secret', visibility: 'invisible' as const, xpReward: 50, conditionType: 'special', conditionValue: { special: 'palindrome_task' }, sortOrder: 44 },

    // ULTRA SECRET - never shown
    { code: 'ultra_1', name: 'The Watcher', hiddenName: '???', description: 'You found a secret', hiddenDescription: '???', icon: '👁️‍🗨️', category: 'ultra_secret', visibility: 'ultra_secret' as const, xpReward: 200, conditionType: 'special', conditionValue: { special: 'ultra_1' }, sortOrder: 50 },
    { code: 'ultra_2', name: 'Time Lord', hiddenName: '???', description: 'Complete tasks at every hour of the day', hiddenDescription: '???', icon: '⏰', category: 'ultra_secret', visibility: 'ultra_secret' as const, xpReward: 240, conditionType: 'special', conditionValue: { special: 'all_hours' }, sortOrder: 51 },
    { code: 'ultra_3', name: 'Dedication', hiddenName: '???', description: 'Use the app for 1000 days total', hiddenDescription: '???', icon: '💫', category: 'ultra_secret', visibility: 'ultra_secret' as const, xpReward: 1000, conditionType: 'special', conditionValue: { special: 'days_1000' }, sortOrder: 52 },
  ];

  for (const achievement of achievementData) {
    await db.insert(achievements).values(achievement).onConflictDoNothing();
  }

  console.log(`Seeded ${achievementData.length} achievements`);
}

async function seedCreatures() {
  console.log('Seeding creatures...');

  const creatureData = [
    // COMMON
    { code: 'task_ant', name: 'Task Ant', emoji: '🐜', description: 'A diligent worker that appears when you complete tasks', rarity: 'common' as const, spawnConditions: { onTaskComplete: true }, spawnChance: 200 },
    { code: 'focus_snail', name: 'Focus Snail', emoji: '🐌', description: 'Slow but steady wins the race', rarity: 'common' as const, spawnConditions: { onTaskComplete: true }, spawnChance: 150 },
    { code: 'busy_bee', name: 'Busy Bee', emoji: '🐝', description: 'Always buzzing with productivity', rarity: 'common' as const, spawnConditions: { onTaskComplete: true }, spawnChance: 150 },

    // UNCOMMON
    { code: 'quick_fox', name: 'Quick Fox', emoji: '🦊', description: 'Appears when you complete quick tasks', rarity: 'uncommon' as const, spawnConditions: { onQuickTask: true }, spawnChance: 100 },
    { code: 'night_owl', name: 'Night Owl', emoji: '🦉', description: 'A nocturnal companion for late work', rarity: 'uncommon' as const, spawnConditions: { onTimeRange: { startHour: 22, endHour: 6 } }, spawnChance: 80 },
    { code: 'morning_rooster', name: 'Morning Rooster', emoji: '🐓', description: 'Greets the early birds', rarity: 'uncommon' as const, spawnConditions: { onTimeRange: { startHour: 5, endHour: 8 } }, spawnChance: 80 },
    { code: 'streak_cat', name: 'Streak Cat', emoji: '🐱', description: 'Loves consistency', rarity: 'uncommon' as const, spawnConditions: { onStreakDay: 3 }, spawnChance: 70 },

    // RARE
    { code: 'fire_spirit', name: 'Flame Spirit', emoji: '🔥', description: 'Born from a week of dedication', rarity: 'rare' as const, spawnConditions: { onStreakDay: 7 }, spawnChance: 50 },
    { code: 'crystal_butterfly', name: 'Crystal Butterfly', emoji: '🦋', description: 'A beautiful transformation', rarity: 'rare' as const, spawnConditions: { onLevel: 5 }, spawnChance: 40 },
    { code: 'thunder_wolf', name: 'Thunder Wolf', emoji: '🐺', description: 'Strikes with speed and power', rarity: 'rare' as const, spawnConditions: { onQuickTask: true, onStreakDay: 5 }, spawnChance: 30 },

    // LEGENDARY
    { code: 'deadline_dragon', name: 'Deadline Dragon', emoji: '🐉', description: 'Master of time management', rarity: 'legendary' as const, spawnConditions: { onStreakDay: 30 }, spawnChance: 20 },
    { code: 'phoenix', name: 'Phoenix', emoji: '🔥', description: 'Rises from the ashes of procrastination', rarity: 'legendary' as const, spawnConditions: { onLevel: 25 }, spawnChance: 15 },
    { code: 'flow_unicorn', name: 'Flow Unicorn', emoji: '🦄', description: 'Appears in states of deep focus', rarity: 'legendary' as const, spawnConditions: { onTaskComplete: true, onStreakDay: 14 }, spawnChance: 10 },

    // MYTHIC
    { code: 'cosmic_whale', name: 'Cosmic Whale', emoji: '🐋', description: 'Swims through the stars of achievement', rarity: 'mythic' as const, spawnConditions: { onLevel: 50 }, spawnChance: 5 },
    { code: 'time_turtle', name: 'Time Turtle', emoji: '🐢', description: 'Ancient wisdom of consistency', rarity: 'mythic' as const, spawnConditions: { onStreakDay: 100 }, spawnChance: 3 },

    // SECRET
    { code: 'ghost', name: 'Midnight Ghost', emoji: '👻', description: '???', rarity: 'secret' as const, spawnConditions: { onTimeRange: { startHour: 0, endHour: 1 }, onSpecial: 'midnight_task' }, spawnChance: 10 },
  ];

  for (const creature of creatureData) {
    await db.insert(creatures).values(creature).onConflictDoNothing();
  }

  console.log(`Seeded ${creatureData.length} creatures`);
}

async function main() {
  try {
    await seedFeatures();
    await seedAchievements();
    await seedCreatures();
    console.log('Gamification seed complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

main();
