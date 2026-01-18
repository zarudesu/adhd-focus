/**
 * Seed script for gamification data
 * Run with: npx tsx src/db/seed-gamification.ts
 */

import { db } from './index';
import { features, achievements, creatures, FEATURE_CODES } from './schema';
import { generateAllAchievements } from './generate-achievements';

async function seedFeatures() {
  console.log('Seeding features...');

  const featureData = [
    // ==========================================
    // NAVIGATION ITEMS (shown in sidebar)
    // ==========================================

    // Always visible - starting point
    {
      code: 'nav_inbox',
      name: 'Inbox',
      description: 'Capture your thoughts',
      icon: 'Inbox',
      category: 'navigation',
      isNavItem: true,
      sortOrder: 1,
      // No unlock conditions = always available
    },

    // After 3 tasks added - first achievement triggers this
    {
      code: 'nav_achievements',
      name: 'Achievements',
      description: 'Track your progress',
      celebrationText: '🏆 Achievements unlocked! See your first badge!',
      icon: 'Trophy',
      category: 'navigation',
      isNavItem: true,
      unlockTasksAdded: 3,
      sortOrder: 10,
    },

    // After completing 1 task
    {
      code: 'nav_completed',
      name: 'Completed',
      description: 'Your finished tasks',
      celebrationText: '✅ You can now view completed tasks!',
      icon: 'CheckCircle2',
      category: 'navigation',
      isNavItem: true,
      unlockTasksCompleted: 1,
      sortOrder: 5,
    },

    // After assigning 1 task to today
    {
      code: 'nav_today',
      name: 'Today',
      description: 'Focus on daily tasks',
      celebrationText: '☀️ Today view unlocked! Focus on what matters.',
      icon: 'Sun',
      category: 'navigation',
      isNavItem: true,
      unlockTasksAssignedToday: 1,
      sortOrder: 2,
    },

    // After scheduling 1 task
    {
      code: 'nav_scheduled',
      name: 'Scheduled',
      description: 'Plan ahead',
      celebrationText: '📅 Scheduled view unlocked! Plan your future.',
      icon: 'Calendar',
      category: 'navigation',
      isNavItem: true,
      unlockTasksScheduled: 1,
      sortOrder: 3,
    },

    // After creating 1 project
    {
      code: 'nav_projects',
      name: 'Projects',
      description: 'Organize by project',
      celebrationText: '📁 Projects unlocked! Organize your tasks.',
      icon: 'Folder',
      category: 'navigation',
      isNavItem: true,
      unlockProjectsCreated: 1,
      sortOrder: 4,
    },

    // After completing 10 tasks
    {
      code: 'nav_quick_actions',
      name: 'Quick Actions',
      description: 'Speed through small tasks',
      celebrationText: '⚡ Quick Actions unlocked! Crush small tasks fast.',
      icon: 'Zap',
      category: 'navigation',
      isNavItem: true,
      unlockTasksCompleted: 10,
      sortOrder: 6,
    },

    // After completing 1 focus session
    {
      code: 'nav_focus',
      name: 'Focus Mode',
      description: 'Deep work timer',
      celebrationText: '🎯 Focus Mode unlocked! Enter the zone.',
      icon: 'Timer',
      category: 'navigation',
      isNavItem: true,
      unlockFocusSessions: 1,
      sortOrder: 7,
    },

    // After level 5
    {
      code: 'nav_creatures',
      name: 'Creatures',
      description: 'Collect productivity companions',
      celebrationText: '👻 Creatures unlocked! Collect them all.',
      icon: 'Ghost',
      category: 'navigation',
      isNavItem: true,
      unlockLevel: 5,
      sortOrder: 9,
    },

    // After 7-day streak
    {
      code: 'nav_stats',
      name: 'Statistics',
      description: 'Your productivity insights',
      celebrationText: '📊 Statistics unlocked! Track your growth.',
      icon: 'ChartBar',
      category: 'navigation',
      isNavItem: true,
      unlockStreakDays: 7,
      sortOrder: 11,
    },

    // ==========================================
    // FEATURES (functionality within pages)
    // ==========================================

    // Basic features - always available
    { code: 'inbox_basic', name: 'Inbox', description: 'Capture tasks quickly', icon: 'Inbox', sortOrder: 101 },
    { code: 'inbox_count', name: 'Inbox Count', description: 'See how many tasks in inbox', icon: 'Hash', unlockTasksAdded: 1, sortOrder: 102 },
    { code: 'inbox_quick_add', name: 'Quick Add', description: 'Add tasks with Cmd+N', icon: 'Plus', unlockTasksAdded: 5, sortOrder: 103 },
    { code: 'today_complete', name: 'Complete Tasks', description: 'Mark tasks as done', icon: 'Check', sortOrder: 105 },
    { code: 'today_progress', name: 'Daily Progress', description: 'See your daily progress bar', icon: 'BarChart2', unlockTasksCompleted: 3, sortOrder: 106 },
    { code: 'priority_basic', name: 'Basic Priority', description: '2 priority levels', icon: 'Flag', unlockTasksAdded: 5, sortOrder: 107 },
    { code: 'inbox_process', name: 'Process Mode', description: 'Swipe through inbox tasks', icon: 'Shuffle', unlockTasksAdded: 10, sortOrder: 108 },
    { code: 'energy_basic', name: 'Energy Levels', description: 'Low and High energy', icon: 'Battery', unlockTasksCompleted: 5, sortOrder: 109 },
    { code: 'project_create', name: 'Create Project', description: 'Organize tasks into projects', icon: 'Folder', unlockTasksAdded: 5, sortOrder: 110 },
    { code: 'theme_dark', name: 'Dark Mode', description: 'Dark theme for night work', icon: 'Moon', unlockLevel: 3, sortOrder: 111 },

    // INTERMEDIATE (Level 6-12)
    { code: 'priority_full', name: 'Full Priority', description: '4 priority levels', icon: 'Flag', unlockLevel: 6, sortOrder: 12 },
    { code: 'energy_full', name: 'Full Energy', description: '3 energy levels', icon: 'Zap', unlockLevel: 6, sortOrder: 13 },
    { code: 'project_colors', name: 'Project Colors', description: 'Color-code projects', icon: 'Palette', unlockLevel: 6, sortOrder: 14 },
    { code: 'scheduled_tomorrow', name: 'Schedule Tomorrow', description: 'Plan for tomorrow', icon: 'Calendar', unlockLevel: 6, sortOrder: 15 },
    { code: 'project_emoji', name: 'Project Emoji', description: 'Add emoji to projects', icon: 'Smile', unlockLevel: 7, sortOrder: 16 },
    { code: 'scheduled_date', name: 'Schedule Date', description: 'Pick any date', icon: 'CalendarDays', unlockLevel: 7, sortOrder: 17 },
    { code: 'task_description', name: 'Task Descriptions', description: 'Add notes to tasks', icon: 'FileText', unlockLevel: 7, sortOrder: 18 },
    { code: 'today_reorder', name: 'Reorder Tasks', description: 'Drag to reorder', icon: 'GripVertical', unlockLevel: 8, sortOrder: 19 },
    { code: 'quick_actions', name: 'Quick Actions', description: 'Speed mode for 2-min tasks', icon: 'Zap', unlockLevel: 8, sortOrder: 20 },
    { code: 'scheduled_week', name: 'Week View', description: 'See week ahead', icon: 'Calendar', unlockLevel: 8, sortOrder: 21 },
    { code: 'inbox_bulk', name: 'Bulk Select', description: 'Select multiple inbox tasks', icon: 'CheckSquare', unlockLevel: 9, sortOrder: 22 },
    { code: 'tags_basic', name: 'Tags', description: 'Add tags to tasks', icon: 'Tag', unlockLevel: 9, sortOrder: 23 },
    { code: 'focus_timer', name: 'Focus Timer', description: 'Basic timer', icon: 'Timer', unlockLevel: 10, sortOrder: 24 },
    { code: 'tags_filter', name: 'Filter by Tag', description: 'Filter tasks by tag', icon: 'Filter', unlockLevel: 10, sortOrder: 25 },
    { code: 'scheduled_drag', name: 'Drag to Schedule', description: 'Drag tasks to dates', icon: 'Move', unlockLevel: 10, sortOrder: 26 },
    { code: 'font_size', name: 'Font Size', description: 'Adjust text size', icon: 'Type', unlockLevel: 10, sortOrder: 27 },
    { code: 'focus_pomodoro', name: 'Pomodoro', description: 'Pomodoro presets', icon: 'Clock', unlockLevel: 11, sortOrder: 28 },
    { code: 'pomo_work_time', name: 'Work Duration', description: 'Set work interval', icon: 'Settings', unlockLevel: 11, sortOrder: 29 },
    { code: 'tags_colors', name: 'Tag Colors', description: 'Color-code tags', icon: 'Palette', unlockLevel: 11, sortOrder: 30 },
    { code: 'stats_daily', name: 'Daily Stats', description: 'See daily stats', icon: 'BarChart', unlockLevel: 12, sortOrder: 31 },
    { code: 'focus_breaks', name: 'Break Reminders', description: 'Get break reminders', icon: 'Coffee', unlockLevel: 12, sortOrder: 32 },
    { code: 'scheduled_calendar', name: 'Calendar View', description: 'Full calendar view', icon: 'Calendar', unlockLevel: 12, sortOrder: 33 },
    { code: 'project_archive', name: 'Archive Projects', description: 'Archive old projects', icon: 'Archive', unlockLevel: 12, sortOrder: 34 },
    { code: 'compact_mode', name: 'Compact Mode', description: 'Compact task list', icon: 'Minimize2', unlockLevel: 12, sortOrder: 35 },
    { code: 'profile_email', name: 'Change Email', description: 'Update email address', icon: 'Mail', unlockLevel: 12, sortOrder: 36 },
    { code: 'task_subtasks', name: 'Subtasks', description: 'Break down tasks', icon: 'List', unlockLevel: 12, sortOrder: 37 },

    // ADVANCED (Level 13-20)
    { code: 'tags_multiple', name: 'Multiple Tags', description: 'Multiple tags per task', icon: 'Tags', unlockLevel: 13, sortOrder: 38 },
    { code: 'stats_tasks_chart', name: 'Task Chart', description: 'Task completion chart', icon: 'LineChart', unlockLevel: 13, sortOrder: 39 },
    { code: 'focus_sounds', name: 'Focus Sounds', description: 'Timer sounds', icon: 'Volume2', unlockLevel: 13, sortOrder: 40 },
    { code: 'focus_custom_time', name: 'Custom Timer', description: 'Set any timer length', icon: 'Timer', unlockLevel: 14, sortOrder: 41 },
    { code: 'stats_weekly', name: 'Weekly Stats', description: 'Weekly overview', icon: 'BarChart2', unlockLevel: 14, sortOrder: 42 },
    { code: 'pomo_long_break', name: 'Long Break', description: 'Configure long break', icon: 'Coffee', unlockLevel: 14, sortOrder: 43 },
    { code: 'accent_colors', name: 'Accent Colors', description: '5 accent color options', icon: 'Palette', unlockLevel: 15, sortOrder: 44 },
    { code: 'stats_streak', name: 'Streak Stats', description: 'See streak history', icon: 'Flame', unlockLevel: 15, sortOrder: 45 },
    { code: 'project_progress', name: 'Project Progress', description: 'Progress bar per project', icon: 'BarChart', unlockLevel: 15, sortOrder: 46 },
    { code: 'profile_password', name: 'Change Password', description: 'Update password', icon: 'Lock', unlockLevel: 15, sortOrder: 47 },
    { code: 'task_checklist', name: 'Checklists', description: 'Add checklists to tasks', icon: 'CheckSquare', unlockLevel: 15, sortOrder: 48 },
    { code: 'notif_achievements', name: 'Achievement Alerts', description: 'Get notified on unlock', icon: 'Bell', unlockLevel: 15, sortOrder: 49 },
    { code: 'scheduled_month', name: 'Month View', description: 'See month ahead', icon: 'Calendar', unlockLevel: 15, sortOrder: 50 },
    { code: 'focus_music', name: 'Focus Music', description: 'Background music', icon: 'Music', unlockLevel: 16, sortOrder: 51 },
    { code: 'tags_autocomplete', name: 'Tag Autocomplete', description: 'Quick tag entry', icon: 'Sparkles', unlockLevel: 16, sortOrder: 52 },
    { code: 'pomo_auto_start', name: 'Auto-start Breaks', description: 'Auto-start breaks', icon: 'Play', unlockLevel: 16, sortOrder: 53 },
    { code: 'quick_timer', name: 'Quick Task Timer', description: 'Timer in quick actions', icon: 'Timer', unlockLevel: 16, sortOrder: 54 },
    { code: 'stats_monthly', name: 'Monthly Stats', description: 'Monthly overview', icon: 'BarChart', unlockLevel: 17, sortOrder: 55 },
    { code: 'task_time_estimate', name: 'Time Estimates', description: 'Estimate task duration', icon: 'Clock', unlockLevel: 18, sortOrder: 56 },
    { code: 'stats_heatmap', name: 'Activity Heatmap', description: 'GitHub-style heatmap', icon: 'Grid', unlockLevel: 18, sortOrder: 57 },
    { code: 'project_templates', name: 'Project Templates', description: 'Create from templates', icon: 'Copy', unlockLevel: 18, sortOrder: 58 },
    { code: 'accent_custom', name: 'Custom Accent', description: 'Pick any color', icon: 'Paintbrush', unlockLevel: 18, sortOrder: 59 },
    { code: 'profile_export', name: 'Export Data', description: 'Download your data', icon: 'Download', unlockLevel: 18, sortOrder: 60 },
    { code: 'pomo_sounds', name: 'Timer Sounds', description: 'Customize sounds', icon: 'Volume2', unlockLevel: 18, sortOrder: 61 },
    { code: 'pref_keyboard', name: 'Keyboard Shortcuts', description: 'Full keyboard control', icon: 'Keyboard', unlockLevel: 18, sortOrder: 62 },
    { code: 'focus_stats', name: 'Focus Stats', description: 'Focus session stats', icon: 'BarChart2', unlockLevel: 18, sortOrder: 63 },
    { code: 'notif_streak', name: 'Streak Alerts', description: 'Streak warning', icon: 'AlertTriangle', unlockLevel: 18, sortOrder: 64 },
    { code: 'scheduled_reminders', name: 'Reminders', description: 'Task reminders', icon: 'Bell', unlockLevel: 18, sortOrder: 65 },

    // EXPERT (Level 20-30)
    { code: 'stats_time_analysis', name: 'Time Analysis', description: 'Best productive hours', icon: 'Clock', unlockLevel: 20, sortOrder: 66 },
    { code: 'tags_groups', name: 'Tag Groups', description: 'Organize tags', icon: 'Folders', unlockLevel: 20, sortOrder: 67 },
    { code: 'notif_daily_summary', name: 'Daily Summary', description: 'End of day recap', icon: 'Mail', unlockLevel: 20, sortOrder: 68 },
    { code: 'focus_streak', name: 'Focus Streaks', description: 'Track focus streaks', icon: 'Flame', unlockLevel: 20, sortOrder: 69 },
    { code: 'profile_2fa', name: 'Two-Factor Auth', description: 'Extra security', icon: 'Shield', unlockLevel: 20, sortOrder: 70 },
    { code: 'project_goals', name: 'Project Goals', description: 'Set project targets', icon: 'Target', unlockLevel: 20, sortOrder: 71 },
    { code: 'pomo_goals', name: 'Pomodoro Goals', description: 'Daily pomo targets', icon: 'Target', unlockLevel: 20, sortOrder: 72 },
    { code: 'pref_command_palette', name: 'Command Palette', description: 'Cmd+K power user', icon: 'Command', unlockLevel: 20, sortOrder: 73 },
    { code: 'scheduled_smart_dates', name: 'Smart Dates', description: 'Type "next week"', icon: 'Wand2', unlockLevel: 20, sortOrder: 74 },
    { code: 'theme_seasonal', name: 'Seasonal Themes', description: 'Holiday themes', icon: 'Sparkles', unlockLevel: 20, sortOrder: 75 },
    { code: 'task_actual_time', name: 'Time Tracking', description: 'Track actual time', icon: 'Timer', unlockLevel: 20, sortOrder: 76 },
    { code: 'stats_project', name: 'Project Stats', description: 'Per-project analytics', icon: 'PieChart', unlockLevel: 22, sortOrder: 77 },
    { code: 'task_recurring', name: 'Recurring Tasks', description: 'Repeat tasks', icon: 'Repeat', unlockLevel: 22, sortOrder: 78 },
    { code: 'focus_deep_work', name: 'Deep Work Mode', description: 'Distraction blocker', icon: 'Shield', unlockLevel: 22, sortOrder: 79 },
    { code: 'notif_reminders', name: 'Task Reminders', description: 'Push notifications', icon: 'Bell', unlockLevel: 22, sortOrder: 80 },
    { code: 'project_milestones', name: 'Milestones', description: 'Project milestones', icon: 'Flag', unlockLevel: 22, sortOrder: 81 },
    { code: 'notif_focus', name: 'Focus Notifications', description: 'Focus mode alerts', icon: 'Bell', unlockLevel: 24, sortOrder: 82 },
    { code: 'stats_export', name: 'Export Stats', description: 'Download analytics', icon: 'Download', unlockLevel: 25, sortOrder: 83 },
    { code: 'tags_smart', name: 'Smart Tags', description: 'Auto-assign tags', icon: 'Wand2', unlockLevel: 25, sortOrder: 84 },
    { code: 'game_leaderboard', name: 'Leaderboards', description: 'Compare with others', icon: 'Trophy', unlockLevel: 25, sortOrder: 85 },
    { code: 'project_nested', name: 'Nested Projects', description: 'Sub-projects', icon: 'GitBranch', unlockLevel: 25, sortOrder: 86 },
    { code: 'theme_custom', name: 'Custom Themes', description: 'Create themes', icon: 'Paintbrush', unlockLevel: 25, sortOrder: 87 },
    { code: 'task_templates', name: 'Task Templates', description: 'Reusable tasks', icon: 'Copy', unlockLevel: 25, sortOrder: 88 },
    { code: 'profile_delete', name: 'Delete Account', description: 'Account deletion', icon: 'Trash2', unlockLevel: 25, sortOrder: 89 },
    { code: 'focus_ambient', name: 'Ambient Mode', description: 'Fire, rain sounds', icon: 'Cloud', unlockLevel: 25, sortOrder: 90 },
    { code: 'scheduled_calendar_sync', name: 'Calendar Sync', description: 'Google/Apple sync', icon: 'RefreshCw', unlockLevel: 25, sortOrder: 91 },
    { code: 'notif_custom', name: 'Custom Alerts', description: 'Custom notifications', icon: 'Settings', unlockLevel: 26, sortOrder: 92 },
    { code: 'notif_schedule', name: 'Quiet Hours', description: 'Schedule notifications', icon: 'Moon', unlockLevel: 28, sortOrder: 93 },
    { code: 'task_dependencies', name: 'Task Dependencies', description: 'Link tasks together', icon: 'Link', unlockLevel: 28, sortOrder: 94 },
    { code: 'focus_blockers', name: 'App Blockers', description: 'Block distractions', icon: 'Shield', unlockLevel: 28, sortOrder: 95 },
    { code: 'stats_comparative', name: 'Compare Stats', description: 'Week over week', icon: 'GitCompare', unlockLevel: 30, sortOrder: 96 },
    { code: 'project_deadline', name: 'Project Deadlines', description: 'Due dates for projects', icon: 'Calendar', unlockLevel: 30, sortOrder: 97 },
    { code: 'game_challenges', name: 'Weekly Challenges', description: 'Compete in challenges', icon: 'Swords', unlockLevel: 30, sortOrder: 98 },
    { code: 'theme_share', name: 'Share Themes', description: 'Share with community', icon: 'Share2', unlockLevel: 30, sortOrder: 99 },
    { code: 'focus_ai_coach', name: 'AI Focus Coach', description: 'AI productivity tips', icon: 'Bot', unlockLevel: 30, sortOrder: 100 },
    { code: 'task_attachments', name: 'Attachments', description: 'Add files to tasks', icon: 'Paperclip', unlockLevel: 30, sortOrder: 101 },

    // MASTER (Level 35+)
    { code: 'int_calendar', name: 'Calendar Integration', description: 'Full calendar sync', icon: 'Calendar', unlockLevel: 30, sortOrder: 102 },
    { code: 'stats_insights', name: 'AI Insights', description: 'AI productivity analysis', icon: 'Sparkles', unlockLevel: 35, sortOrder: 103 },
    { code: 'game_seasons', name: 'Seasonal Events', description: 'Special events', icon: 'Gift', unlockLevel: 35, sortOrder: 104 },
    { code: 'project_sharing', name: 'Share Projects', description: 'Collaborate on projects', icon: 'Users', unlockLevel: 35, sortOrder: 105 },
    { code: 'int_todoist', name: 'Todoist Import', description: 'Import from Todoist', icon: 'Download', unlockLevel: 35, sortOrder: 106 },
    { code: 'task_automation', name: 'Automation', description: 'Auto-assign rules', icon: 'Wand2', unlockLevel: 35, sortOrder: 107 },
    { code: 'int_notion', name: 'Notion Import', description: 'Import from Notion', icon: 'Download', unlockLevel: 38, sortOrder: 108 },
    { code: 'project_team', name: 'Team Projects', description: 'Work with others', icon: 'Users', unlockLevel: 40, sortOrder: 109 },
    { code: 'int_api', name: 'API Access', description: 'Developer API', icon: 'Code', unlockLevel: 40, sortOrder: 110 },
    { code: 'int_webhooks', name: 'Webhooks', description: 'Event webhooks', icon: 'Webhook', unlockLevel: 45, sortOrder: 111 },
    { code: 'int_zapier', name: 'Zapier', description: 'Zapier integration', icon: 'Zap', unlockLevel: 50, sortOrder: 112 },
  ];

  for (const feature of featureData) {
    await db.insert(features).values(feature).onConflictDoNothing();
  }

  console.log(`Seeded ${featureData.length} features`);
}

async function seedAchievements() {
  console.log('Generating achievements...');

  const generatedAchievements = generateAllAchievements();

  console.log(`Seeding ${generatedAchievements.length} achievements...`);

  // Insert in batches of 100 for performance
  const batchSize = 100;
  for (let i = 0; i < generatedAchievements.length; i += batchSize) {
    const batch = generatedAchievements.slice(i, i + batchSize);
    await db.insert(achievements).values(batch).onConflictDoNothing();

    if ((i + batchSize) % 500 === 0 || i + batchSize >= generatedAchievements.length) {
      console.log(`  Inserted ${Math.min(i + batchSize, generatedAchievements.length)}/${generatedAchievements.length}`);
    }
  }

  console.log(`Seeded ${generatedAchievements.length} achievements`);
}

async function seedCreatures() {
  console.log('Seeding creatures...');

  const creatureData = [
    // COMMON (spawn frequently)
    { code: 'task_ant', name: 'Task Ant', emoji: '🐜', description: 'A diligent worker that appears when you complete tasks', rarity: 'common' as const, spawnConditions: { onTaskComplete: true }, spawnChance: 200 },
    { code: 'focus_snail', name: 'Focus Snail', emoji: '🐌', description: 'Slow but steady wins the race', rarity: 'common' as const, spawnConditions: { onTaskComplete: true }, spawnChance: 150 },
    { code: 'busy_bee', name: 'Busy Bee', emoji: '🐝', description: 'Always buzzing with productivity', rarity: 'common' as const, spawnConditions: { onTaskComplete: true }, spawnChance: 150 },
    { code: 'study_mouse', name: 'Study Mouse', emoji: '🐭', description: 'Small tasks lead to big results', rarity: 'common' as const, spawnConditions: { onTaskComplete: true }, spawnChance: 150 },
    { code: 'garden_worm', name: 'Garden Worm', emoji: '🪱', description: 'Tilling the soil of productivity', rarity: 'common' as const, spawnConditions: { onTaskComplete: true }, spawnChance: 120 },

    // UNCOMMON (specific conditions)
    { code: 'quick_fox', name: 'Quick Fox', emoji: '🦊', description: 'Appears when you complete quick tasks', rarity: 'uncommon' as const, spawnConditions: { onQuickTask: true }, spawnChance: 100 },
    { code: 'night_owl', name: 'Night Owl', emoji: '🦉', description: 'A nocturnal companion for late work', rarity: 'uncommon' as const, spawnConditions: { onTimeRange: { startHour: 22, endHour: 6 } }, spawnChance: 80 },
    { code: 'morning_rooster', name: 'Morning Rooster', emoji: '🐓', description: 'Greets the early birds', rarity: 'uncommon' as const, spawnConditions: { onTimeRange: { startHour: 5, endHour: 8 } }, spawnChance: 80 },
    { code: 'streak_cat', name: 'Streak Cat', emoji: '🐱', description: 'Loves consistency', rarity: 'uncommon' as const, spawnConditions: { onStreakDay: 3 }, spawnChance: 70 },
    { code: 'project_penguin', name: 'Project Penguin', emoji: '🐧', description: 'Organized and methodical', rarity: 'uncommon' as const, spawnConditions: { onTaskComplete: true }, spawnChance: 60 },
    { code: 'inbox_rabbit', name: 'Inbox Rabbit', emoji: '🐰', description: 'Hops through your inbox', rarity: 'uncommon' as const, spawnConditions: { onTaskComplete: true, onSpecial: 'inbox_clear' }, spawnChance: 50 },
    { code: 'weekend_bear', name: 'Weekend Bear', emoji: '🐻', description: 'Weekend productivity champion', rarity: 'uncommon' as const, spawnConditions: { onSpecial: 'weekend' }, spawnChance: 60 },

    // RARE (harder to get)
    { code: 'fire_spirit', name: 'Flame Spirit', emoji: '🔥', description: 'Born from a week of dedication', rarity: 'rare' as const, spawnConditions: { onStreakDay: 7 }, spawnChance: 50 },
    { code: 'crystal_butterfly', name: 'Crystal Butterfly', emoji: '🦋', description: 'A beautiful transformation', rarity: 'rare' as const, spawnConditions: { onLevel: 5 }, spawnChance: 40 },
    { code: 'thunder_wolf', name: 'Thunder Wolf', emoji: '🐺', description: 'Strikes with speed and power', rarity: 'rare' as const, spawnConditions: { onQuickTask: true, onStreakDay: 5 }, spawnChance: 30 },
    { code: 'golden_fish', name: 'Golden Fish', emoji: '🐠', description: 'Grants productivity wishes', rarity: 'rare' as const, spawnConditions: { onLevel: 10 }, spawnChance: 35 },
    { code: 'wise_turtle', name: 'Wise Turtle', emoji: '🐢', description: 'Patience and persistence', rarity: 'rare' as const, spawnConditions: { onStreakDay: 14 }, spawnChance: 25 },
    { code: 'moon_moth', name: 'Moon Moth', emoji: '🦋', description: 'Emerges in the quiet hours', rarity: 'rare' as const, spawnConditions: { onTimeRange: { startHour: 0, endHour: 4 } }, spawnChance: 20 },

    // LEGENDARY (very rare)
    { code: 'deadline_dragon', name: 'Deadline Dragon', emoji: '🐉', description: 'Master of time management', rarity: 'legendary' as const, spawnConditions: { onStreakDay: 30 }, spawnChance: 20 },
    { code: 'phoenix', name: 'Phoenix', emoji: '🔥', description: 'Rises from the ashes of procrastination', rarity: 'legendary' as const, spawnConditions: { onLevel: 25 }, spawnChance: 15 },
    { code: 'flow_unicorn', name: 'Flow Unicorn', emoji: '🦄', description: 'Appears in states of deep focus', rarity: 'legendary' as const, spawnConditions: { onTaskComplete: true, onStreakDay: 14 }, spawnChance: 10 },
    { code: 'star_lion', name: 'Star Lion', emoji: '🦁', description: 'Roars with accomplishment', rarity: 'legendary' as const, spawnConditions: { onLevel: 20 }, spawnChance: 12 },
    { code: 'frost_eagle', name: 'Frost Eagle', emoji: '🦅', description: 'Soars above distractions', rarity: 'legendary' as const, spawnConditions: { onStreakDay: 21 }, spawnChance: 8 },

    // MYTHIC (extremely rare)
    { code: 'cosmic_whale', name: 'Cosmic Whale', emoji: '🐋', description: 'Swims through the stars of achievement', rarity: 'mythic' as const, spawnConditions: { onLevel: 50 }, spawnChance: 5 },
    { code: 'time_turtle', name: 'Time Turtle', emoji: '🐢', description: 'Ancient wisdom of consistency', rarity: 'mythic' as const, spawnConditions: { onStreakDay: 100 }, spawnChance: 3 },
    { code: 'void_octopus', name: 'Void Octopus', emoji: '🐙', description: 'Master of multitasking', rarity: 'mythic' as const, spawnConditions: { onLevel: 75 }, spawnChance: 2 },
    { code: 'eternal_phoenix', name: 'Eternal Phoenix', emoji: '🔥', description: 'Never stops burning bright', rarity: 'mythic' as const, spawnConditions: { onStreakDay: 365 }, spawnChance: 1 },

    // SECRET (hidden conditions)
    { code: 'ghost', name: 'Midnight Ghost', emoji: '👻', description: '???', rarity: 'secret' as const, spawnConditions: { onTimeRange: { startHour: 0, endHour: 1 }, onSpecial: 'midnight_task' }, spawnChance: 10 },
    { code: 'lucky_clover', name: 'Lucky Clover', emoji: '🍀', description: '???', rarity: 'secret' as const, spawnConditions: { onSpecial: 'lucky_7' }, spawnChance: 7 },
    { code: 'shadow_cat', name: 'Shadow Cat', emoji: '🐈‍⬛', description: '???', rarity: 'secret' as const, spawnConditions: { onSpecial: 'friday_13' }, spawnChance: 13 },
    { code: 'rainbow_serpent', name: 'Rainbow Serpent', emoji: '🐍', description: '???', rarity: 'secret' as const, spawnConditions: { onSpecial: 'all_priorities' }, spawnChance: 5 },
  ];

  for (const creature of creatureData) {
    await db.insert(creatures).values(creature).onConflictDoNothing();
  }

  console.log(`Seeded ${creatureData.length} creatures`);
}

async function main() {
  try {
    console.log('🎮 Starting gamification seed...\n');

    await seedFeatures();
    console.log('');

    await seedAchievements();
    console.log('');

    await seedCreatures();
    console.log('');

    console.log('✅ Gamification seed complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

main();
