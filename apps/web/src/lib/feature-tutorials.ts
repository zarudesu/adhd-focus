/**
 * Feature Tutorials Content
 * Mini-tutorials shown when user first opens a newly unlocked feature
 *
 * Philosophy: ADHD-friendly, brief, actionable
 * - 3 bullet points max
 * - Focus on immediate value
 * - No overwhelming information
 */

export interface TutorialContent {
  title: string;
  icon?: string; // Emoji for visual appeal
  steps: string[];
}

export const FEATURE_TUTORIALS: Record<string, TutorialContent> = {
  // Navigation Features
  nav_inbox: {
    title: 'Inbox',
    icon: '📥',
    steps: [
      'Capture any thought quickly',
      'Don\'t organize yet - just get it out',
      'Process when you\'re ready',
    ],
  },

  nav_process: {
    title: 'Process Mode',
    icon: '✨',
    steps: [
      'Go through tasks one by one',
      'Decide: Today, Later, or Delete',
      'Clearing your inbox feels amazing',
    ],
  },

  nav_today: {
    title: 'Today\'s Focus',
    icon: '☀️',
    steps: [
      'Only tasks you can do today',
      'Keep it to 3 or fewer tasks',
      'Complete one at a time',
    ],
  },

  nav_scheduled: {
    title: 'Scheduled',
    icon: '📅',
    steps: [
      'Tasks with future dates',
      'They move to Today when due',
      'Great for planning ahead',
    ],
  },

  nav_projects: {
    title: 'Projects',
    icon: '📁',
    steps: [
      'Group related tasks together',
      'Add emoji + color for quick recognition',
      'Keep projects small and focused',
    ],
  },

  nav_completed: {
    title: 'Completed',
    icon: '✅',
    steps: [
      'See everything you\'ve done',
      'Celebrate your wins',
      'Can bring tasks back if needed',
    ],
  },

  nav_checklist: {
    title: 'Daily Checklist',
    icon: '📋',
    steps: [
      'Habits you want to build',
      'Track daily consistency',
      'Small habits compound over time',
    ],
  },

  nav_quick_actions: {
    title: 'Quick Actions',
    icon: '⚡',
    steps: [
      '2-minute timer for quick captures',
      'Beat the clock to capture tasks',
      'Great for brain dumps',
    ],
  },

  nav_focus: {
    title: 'Focus Mode',
    icon: '🎯',
    steps: [
      'Pomodoro timer for deep work',
      'Pick one task to focus on',
      'Earn XP for completed sessions',
    ],
  },

  nav_achievements: {
    title: 'Achievements',
    icon: '🏆',
    steps: [
      'Unlock by completing tasks',
      'Some are hidden surprises',
      'Collect them all!',
    ],
  },

  nav_creatures: {
    title: 'Creatures',
    icon: '👻',
    steps: [
      'Rare creatures appear randomly',
      'Collected when you complete tasks',
      'Some only appear in special conditions',
    ],
  },

  nav_stats: {
    title: 'Statistics',
    icon: '📊',
    steps: [
      'Track your progress over time',
      'See streaks and patterns',
      'Insights to help you improve',
    ],
  },

  nav_settings: {
    title: 'Settings',
    icon: '⚙️',
    steps: [
      'Customize your experience',
      'Adjust timer durations',
      'Choose your theme',
    ],
  },

  // Legacy feature codes (non-nav)
  today: {
    title: 'Today View',
    icon: '☀️',
    steps: [
      'Your focused list for today',
      'Keep it minimal',
      'Complete tasks to earn XP',
    ],
  },

  priority: {
    title: 'Priority Levels',
    icon: '🎯',
    steps: [
      'Must: Critical, do first',
      'Should: Important, schedule it',
      'Want: Nice to have, if time permits',
    ],
  },

  // Task features (component-level)
  priority_basic: {
    title: 'Priority Levels',
    icon: '🎯',
    steps: [
      'Must: Critical, do first',
      'Should: Important, schedule it',
    ],
  },

  priority_full: {
    title: 'Full Priority',
    icon: '🎯',
    steps: [
      'Must: Critical, do first',
      'Should: Important, schedule it',
      'Want: Nice to have, if time permits',
      'Someday: No rush, when inspiration strikes',
    ],
  },

  energy: {
    title: 'Energy Levels',
    icon: '⚡',
    steps: [
      'Match tasks to your energy',
      'High energy = challenging tasks',
      'Low energy = simple tasks',
    ],
  },

  description: {
    title: 'Task Descriptions',
    icon: '📝',
    steps: [
      'Add context to tasks',
      'Break down complex tasks',
      'Future you will thank you',
    ],
  },

  tags: {
    title: 'Tags',
    icon: '🏷️',
    steps: [
      'Categorize tasks freely',
      'Filter by tag later',
      'Keep tags simple',
    ],
  },
};

// Helper to get tutorial content
export function getTutorialForFeature(code: string): TutorialContent | null {
  return FEATURE_TUTORIALS[code] || null;
}
