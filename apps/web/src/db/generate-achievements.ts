/**
 * Achievement Generator
 * Generates 1000+ achievements with all combinations
 * Run with: npx tsx src/db/generate-achievements.ts
 */

// ============================================
// ICONS LIBRARY
// ============================================

const ICONS = {
  // Numbers & Progress
  numbers: ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'],
  progress: ['🎯', '✅', '☑️', '✔️', '💪', '🏃', '🚀', '⬆️', '📈', '🔝'],

  // Milestones
  milestones: ['🌱', '🌿', '🌳', '🏔️', '⛰️', '🗻', '🌋', '🏆', '👑', '💎', '⭐', '🌟', '✨', '💫'],

  // Priorities
  priority: {
    critical: ['🔴', '❗', '‼️', '🚨', '⚠️', '🎯', '💥', '⚡'],
    should: ['🟠', '🔶', '📌', '📍', '🎪'],
    want: ['🟡', '💛', '⭐', '🌟', '✨'],
    someday: ['🟢', '💚', '🌿', '🍀', '🌴', '☘️'],
  },

  // Energy
  energy: {
    low: ['🔋', '😴', '🛋️', '☕', '🧘', '💤', '🌙'],
    medium: ['⚡', '💪', '🏃', '🎯', '⚙️'],
    high: ['🔥', '💥', '⚡', '🚀', '💪', '🏋️', '🎸', '🌋'],
  },

  // Duration
  duration: {
    quick: ['⚡', '🏃', '💨', '🐇', '🚀', '⏱️'],
    medium: ['⏰', '🕐', '📊', '⚙️'],
    long: ['🏔️', '🐢', '🧘', '📚', '🎓', '🏗️'],
  },

  // Time periods
  time: {
    hour: ['⏱️', '⌛', '⏳'],
    day: ['☀️', '🌅', '🌄', '📅'],
    week: ['📆', '🗓️', '7️⃣'],
    month: ['🗓️', '📅', '🌙'],
    year: ['🎊', '🎉', '📆', '🗓️'],
  },

  // Time of day
  timeOfDay: {
    morning: ['🌅', '🌄', '☀️', '🐓', '🌞', '🍳'],
    afternoon: ['☀️', '🌤️', '💼', '🏢'],
    evening: ['🌆', '🌇', '🌃', '🍷'],
    night: ['🌙', '🌃', '🦉', '🌌', '⭐', '🌟', '😴'],
  },

  // Days of week
  days: {
    monday: ['😤', '💪', '🏋️'],
    tuesday: ['📊', '⚙️'],
    wednesday: ['🐪', '⚡'],
    thursday: ['🎯', '📈'],
    friday: ['🎉', '🥳', '🍻'],
    saturday: ['🎮', '🎬', '🏖️'],
    sunday: ['☀️', '🧘', '📚'],
    weekend: ['🎉', '🥳', '🏖️', '🎮', '🌴'],
    weekday: ['💼', '🏢', '📊', '⚙️'],
  },

  // Streaks
  streaks: ['🔥', '💥', '⚡', '🌋', '☄️', '💫', '✨', '🌟', '⭐', '💎', '👑'],

  // Habits
  habits: ['✨', '📝', '🎯', '💪', '🌱', '🔄', '⏰', '📋', '💯', '🏆'],

  // Projects
  projects: ['📁', '📂', '🗂️', '📋', '📊', '🏗️', '🏢', '🎯'],

  // Inbox
  inbox: ['📥', '📤', '📭', '📬', '✉️', '📧', '🧹', '🧼'],

  // Focus
  focus: ['🍅', '⏱️', '🧘', '🎯', '🔕', '🎧', '💭', '🧠'],

  // Creatures
  creatures: ['🐾', '🦋', '🐉', '🦄', '🦊', '🐺', '🦅', '🐋'],

  // Special
  special: ['🎃', '🎄', '❤️', '🎆', '🎇', '🎁', '🥧', '🦃'],

  // Hidden/Secret
  hidden: ['❓', '❔', '🔮', '👁️', '🕵️', '🔍', '🗝️', '🚪'],
  secret: ['👻', '💀', '🎭', '🃏', '♠️', '♣️', '♥️', '♦️'],
  ultraSecret: ['👁️‍🗨️', '🌌', '🕳️', '♾️', '🔱', '⚜️'],

  // Combos
  combos: ['🎰', '🎲', '🎯', '💫', '⚡', '🔥', '💥', '✨'],

  // Speed
  speed: ['⚡', '🏃', '💨', '🚀', '🏎️', '✈️', '🚄'],

  // Perfect
  perfect: ['💯', '🎯', '👌', '✨', '💎', '👑', '🏆'],

  // Levels
  levels: ['🥉', '🥈', '🥇', '🏅', '🎖️', '🏆', '👑', '💎', '💫'],

  // XP
  xp: ['⭐', '✨', '💫', '🌟', '💎', '💰', '🪙'],
};

// ============================================
// CONFIGURATION
// ============================================

const COUNTS = {
  micro: [1, 2, 3],
  small: [5, 7, 10],
  medium: [15, 20, 25, 30, 40, 50],
  large: [75, 100, 150, 200, 250],
  huge: [500, 750, 1000, 1500, 2000, 2500],
  legendary: [5000, 7500, 10000],
  mythic: [25000, 50000, 100000],
};

const ALL_COUNTS = [
  ...COUNTS.micro,
  ...COUNTS.small,
  ...COUNTS.medium,
  ...COUNTS.large,
  ...COUNTS.huge,
  ...COUNTS.legendary,
  ...COUNTS.mythic,
];

const DAILY_COUNTS = [1, 3, 5, 7, 10, 15, 20, 25, 30, 40, 50, 75, 100];
const WEEKLY_COUNTS = [5, 10, 20, 35, 50, 70, 100, 150, 200, 300, 500];
const MONTHLY_COUNTS = [25, 50, 100, 150, 200, 300, 500, 750, 1000];
const HOURLY_COUNTS = [1, 2, 3, 5, 7, 10, 15, 20];
const STREAK_COUNTS = [1, 2, 3, 5, 7, 10, 14, 21, 30, 45, 60, 90, 100, 120, 150, 180, 200, 250, 300, 365, 500, 730, 1000];

const PRIORITIES = ['critical', 'should', 'want', 'someday'] as const;
const ENERGIES = ['low', 'medium', 'high'] as const;
const DURATIONS = ['quick', 'medium', 'long'] as const;

type Priority = typeof PRIORITIES[number];
type Energy = typeof ENERGIES[number];
type Duration = typeof DURATIONS[number];

// ============================================
// XP CALCULATION
// ============================================

function calculateXP(count: number, multiplier: number = 1): number {
  if (count <= 1) return Math.round(5 * multiplier);
  if (count <= 5) return Math.round(10 * multiplier);
  if (count <= 10) return Math.round(15 * multiplier);
  if (count <= 25) return Math.round(25 * multiplier);
  if (count <= 50) return Math.round(40 * multiplier);
  if (count <= 100) return Math.round(75 * multiplier);
  if (count <= 250) return Math.round(125 * multiplier);
  if (count <= 500) return Math.round(200 * multiplier);
  if (count <= 1000) return Math.round(350 * multiplier);
  if (count <= 2500) return Math.round(500 * multiplier);
  if (count <= 5000) return Math.round(750 * multiplier);
  if (count <= 10000) return Math.round(1000 * multiplier);
  return Math.round(1500 * multiplier);
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function pickIcon(icons: string[], index: number): string {
  return icons[index % icons.length];
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${n / 1000000}M`;
  if (n >= 1000) return `${n / 1000}k`;
  return n.toString();
}

function getCountName(count: number): string {
  const names: Record<number, string> = {
    1: 'First',
    2: 'Double',
    3: 'Triple',
    5: 'Five',
    7: 'Lucky Seven',
    10: 'Ten',
    15: 'Fifteen',
    20: 'Twenty',
    25: 'Quarter Century',
    30: 'Thirty',
    40: 'Forty',
    50: 'Half Century',
    75: 'Seventy-Five',
    100: 'Centurion',
    150: 'One-Fifty',
    200: 'Two Hundred',
    250: 'Quarter Thousand',
    500: 'Half Thousand',
    750: 'Seven-Fifty',
    1000: 'Thousand',
    1500: 'Fifteen Hundred',
    2000: 'Two Thousand',
    2500: 'Twenty-Five Hundred',
    5000: 'Five Thousand',
    7500: 'Seventy-Five Hundred',
    10000: 'Ten Thousand',
    25000: 'Twenty-Five Thousand',
    50000: 'Fifty Thousand',
    100000: 'Hundred Thousand',
  };
  return names[count] || formatNumber(count);
}

// ============================================
// ACHIEVEMENT TYPE
// ============================================

interface Achievement {
  code: string;
  name: string;
  hiddenName?: string;
  description: string;
  hiddenDescription?: string;
  icon: string;
  category: string;
  subcategory?: string;
  visibility: 'visible' | 'hidden' | 'invisible' | 'ultra_secret';
  xpReward: number;
  conditionType: string;
  conditionValue: Record<string, any>;
  sortOrder: number;
}

let sortOrderCounter = 0;

function createAchievement(
  code: string,
  name: string,
  description: string,
  icon: string,
  category: string,
  xpReward: number,
  conditionType: string,
  conditionValue: Record<string, any>,
  visibility: 'visible' | 'hidden' | 'invisible' | 'ultra_secret' = 'visible',
  subcategory?: string
): Achievement {
  sortOrderCounter++;
  return {
    code,
    name,
    description,
    icon,
    category,
    subcategory,
    visibility,
    xpReward,
    conditionType,
    conditionValue,
    sortOrder: sortOrderCounter,
    ...(visibility !== 'visible' && {
      hiddenName: '???',
      hiddenDescription: 'Complete secret conditions',
    }),
  };
}

// ============================================
// GENERATORS
// ============================================

const achievements: Achievement[] = [];

// 1. TOTAL TASK COMPLETION
function generateTotalTaskAchievements() {
  const counts = [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000];
  const names = [
    'First Step', 'Getting Started', 'Double Digits', 'Quarter Century',
    'Half Century', 'Centurion', 'Dedicated', 'Committed', 'Thousand Club',
    'Elite', 'Legendary', 'Mythical', 'Demigod', 'Titan', 'Immortal'
  ];

  counts.forEach((count, i) => {
    achievements.push(createAchievement(
      `tasks_total_${count}`,
      names[i] || `${formatNumber(count)} Tasks`,
      `Complete ${formatNumber(count)} tasks total`,
      pickIcon(ICONS.milestones, i),
      'progress',
      calculateXP(count),
      'task_count',
      { count, timeframe: 'total' },
      'visible',
      'total'
    ));
  });
}

// 2. TASKS BY PRIORITY - TOTAL
function generatePriorityTotalAchievements() {
  const counts = [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];

  PRIORITIES.forEach((priority) => {
    const icons = ICONS.priority[priority];
    const priorityName = priority.charAt(0).toUpperCase() + priority.slice(1);

    counts.forEach((count, i) => {
      achievements.push(createAchievement(
        `tasks_${priority}_total_${count}`,
        `${priorityName} ${getCountName(count)}`,
        `Complete ${formatNumber(count)} ${priority} priority tasks`,
        pickIcon(icons, i),
        'priority',
        calculateXP(count, priority === 'critical' ? 1.5 : 1),
        'task_count',
        { count, priority, timeframe: 'total' },
        'visible',
        priority
      ));
    });
  });
}

// 3. TASKS BY ENERGY - TOTAL
function generateEnergyTotalAchievements() {
  const counts = [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];

  ENERGIES.forEach((energy) => {
    const icons = ICONS.energy[energy];
    const energyName = energy.charAt(0).toUpperCase() + energy.slice(1);

    counts.forEach((count, i) => {
      achievements.push(createAchievement(
        `tasks_${energy}_energy_total_${count}`,
        `${energyName} Energy ${getCountName(count)}`,
        `Complete ${formatNumber(count)} ${energy} energy tasks`,
        pickIcon(icons, i),
        'energy',
        calculateXP(count),
        'task_count',
        { count, energy, timeframe: 'total' },
        'visible',
        energy
      ));
    });
  });
}

// 4. TASKS BY DURATION - TOTAL
function generateDurationTotalAchievements() {
  const counts = [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];
  const durationLabels = {
    quick: 'Quick (<15m)',
    medium: 'Medium (15-45m)',
    long: 'Long (>45m)',
  };

  DURATIONS.forEach((duration) => {
    const icons = ICONS.duration[duration];
    const durationName = duration.charAt(0).toUpperCase() + duration.slice(1);

    counts.forEach((count, i) => {
      achievements.push(createAchievement(
        `tasks_${duration}_duration_total_${count}`,
        `${durationName} Task ${getCountName(count)}`,
        `Complete ${formatNumber(count)} ${durationLabels[duration]} tasks`,
        pickIcon(icons, i),
        'duration',
        calculateXP(count),
        'task_count',
        { count, duration, timeframe: 'total' },
        'visible',
        duration
      ));
    });
  });
}

// 5. DAILY ACHIEVEMENTS
function generateDailyAchievements() {
  // Any tasks in a day
  DAILY_COUNTS.forEach((count, i) => {
    achievements.push(createAchievement(
      `tasks_daily_${count}`,
      `Daily ${getCountName(count)}`,
      `Complete ${count} tasks in one day`,
      pickIcon(ICONS.time.day, i),
      'daily',
      calculateXP(count, 1.5),
      'task_count',
      { count, timeframe: 'day' },
      'visible',
      'any'
    ));
  });

  // By priority - daily
  PRIORITIES.forEach((priority) => {
    const counts = priority === 'someday' ? [1, 3, 5, 7, 10, 15, 20] : [1, 3, 5, 7, 10, 15, 20, 25, 30];
    const icons = ICONS.priority[priority];
    const priorityName = priority.charAt(0).toUpperCase() + priority.slice(1);

    counts.forEach((count, i) => {
      achievements.push(createAchievement(
        `tasks_${priority}_daily_${count}`,
        `${priorityName} Day ${count}`,
        `Complete ${count} ${priority} tasks in one day`,
        pickIcon(icons, i),
        'daily',
        calculateXP(count, priority === 'critical' ? 2 : 1.5),
        'task_count',
        { count, priority, timeframe: 'day' },
        'visible',
        `daily_${priority}`
      ));
    });
  });

  // By energy - daily
  ENERGIES.forEach((energy) => {
    const counts = [1, 3, 5, 7, 10, 15, 20];
    const icons = ICONS.energy[energy];
    const energyName = energy.charAt(0).toUpperCase() + energy.slice(1);

    counts.forEach((count, i) => {
      achievements.push(createAchievement(
        `tasks_${energy}_energy_daily_${count}`,
        `${energyName} Energy Day ${count}`,
        `Complete ${count} ${energy} energy tasks in one day`,
        pickIcon(icons, i),
        'daily',
        calculateXP(count, 1.5),
        'task_count',
        { count, energy, timeframe: 'day' },
        'visible',
        `daily_${energy}`
      ));
    });
  });

  // By duration - daily
  DURATIONS.forEach((duration) => {
    const counts = duration === 'long' ? [1, 3, 5, 7, 10] : [1, 3, 5, 10, 15, 20, 25, 30];
    const icons = ICONS.duration[duration];
    const durationName = duration.charAt(0).toUpperCase() + duration.slice(1);

    counts.forEach((count, i) => {
      achievements.push(createAchievement(
        `tasks_${duration}_duration_daily_${count}`,
        `${durationName} Day ${count}`,
        `Complete ${count} ${duration} tasks in one day`,
        pickIcon(icons, i),
        'daily',
        calculateXP(count, 1.5),
        'task_count',
        { count, duration, timeframe: 'day' },
        'visible',
        `daily_${duration}`
      ));
    });
  });

  // Special daily achievements
  achievements.push(createAchievement(
    'daily_all_priorities',
    'Priority Rainbow',
    'Complete tasks of all 4 priorities in one day',
    '🌈',
    'daily',
    50,
    'special',
    { special: 'all_priorities_day' },
    'visible',
    'special'
  ));

  achievements.push(createAchievement(
    'daily_all_energies',
    'Energy Spectrum',
    'Complete tasks of all 3 energy levels in one day',
    '🔋',
    'daily',
    40,
    'special',
    { special: 'all_energies_day' },
    'visible',
    'special'
  ));

  achievements.push(createAchievement(
    'daily_all_durations',
    'Time Master',
    'Complete quick, medium, and long tasks in one day',
    '⏰',
    'daily',
    40,
    'special',
    { special: 'all_durations_day' },
    'visible',
    'special'
  ));
}

// 6. WEEKLY ACHIEVEMENTS
function generateWeeklyAchievements() {
  // Any tasks in a week
  WEEKLY_COUNTS.forEach((count, i) => {
    achievements.push(createAchievement(
      `tasks_weekly_${count}`,
      `Weekly ${getCountName(count)}`,
      `Complete ${count} tasks in one week`,
      pickIcon(ICONS.time.week, i),
      'weekly',
      calculateXP(count, 1.3),
      'task_count',
      { count, timeframe: 'week' },
      'visible',
      'any'
    ));
  });

  // By priority - weekly
  PRIORITIES.forEach((priority) => {
    const counts = [5, 10, 20, 35, 50, 70, 100];
    const icons = ICONS.priority[priority];
    const priorityName = priority.charAt(0).toUpperCase() + priority.slice(1);

    counts.forEach((count, i) => {
      achievements.push(createAchievement(
        `tasks_${priority}_weekly_${count}`,
        `${priorityName} Week ${count}`,
        `Complete ${count} ${priority} tasks in one week`,
        pickIcon(icons, i),
        'weekly',
        calculateXP(count, priority === 'critical' ? 1.5 : 1.3),
        'task_count',
        { count, priority, timeframe: 'week' },
        'visible',
        `weekly_${priority}`
      ));
    });
  });

  // Perfect days in week
  [1, 2, 3, 4, 5, 6, 7].forEach((days) => {
    achievements.push(createAchievement(
      `perfect_days_week_${days}`,
      days === 7 ? 'Perfect Week' : `${days} Perfect Days`,
      `Have ${days} perfect day${days > 1 ? 's' : ''} in one week`,
      days === 7 ? '💯' : pickIcon(ICONS.perfect, days),
      'weekly',
      days * 15,
      'special',
      { special: 'perfect_days_week', count: days },
      'visible',
      'perfect'
    ));
  });
}

// 7. MONTHLY ACHIEVEMENTS
function generateMonthlyAchievements() {
  MONTHLY_COUNTS.forEach((count, i) => {
    achievements.push(createAchievement(
      `tasks_monthly_${count}`,
      `Monthly ${getCountName(count)}`,
      `Complete ${count} tasks in one month`,
      pickIcon(ICONS.time.month, i),
      'monthly',
      calculateXP(count, 1.2),
      'task_count',
      { count, timeframe: 'month' },
      'visible',
      'any'
    ));
  });

  // Perfect weeks in month
  [1, 2, 3, 4].forEach((weeks) => {
    achievements.push(createAchievement(
      `perfect_weeks_month_${weeks}`,
      weeks === 4 ? 'Perfect Month' : `${weeks} Perfect Week${weeks > 1 ? 's' : ''}`,
      `Have ${weeks} perfect week${weeks > 1 ? 's' : ''} in one month`,
      weeks === 4 ? '💯' : pickIcon(ICONS.perfect, weeks),
      'monthly',
      weeks * 50,
      'special',
      { special: 'perfect_weeks_month', count: weeks },
      'visible',
      'perfect'
    ));
  });
}

// 8. HOURLY ACHIEVEMENTS
function generateHourlyAchievements() {
  HOURLY_COUNTS.forEach((count, i) => {
    achievements.push(createAchievement(
      `tasks_hourly_${count}`,
      `Power Hour ${count}`,
      `Complete ${count} tasks in one hour`,
      pickIcon(ICONS.speed, i),
      'hourly',
      calculateXP(count, 2),
      'task_count',
      { count, timeframe: 'hour' },
      'visible',
      'any'
    ));
  });

  // Quick tasks in an hour
  [3, 5, 10, 15, 20, 25, 30].forEach((count, i) => {
    achievements.push(createAchievement(
      `quick_tasks_hourly_${count}`,
      `Speed Demon ${count}`,
      `Complete ${count} quick tasks in one hour`,
      pickIcon(ICONS.speed, i),
      'hourly',
      calculateXP(count, 2.5),
      'task_count',
      { count, duration: 'quick', timeframe: 'hour' },
      'visible',
      'quick'
    ));
  });
}

// 9. STREAK ACHIEVEMENTS
function generateStreakAchievements() {
  const streakNames: Record<number, string> = {
    1: 'Started', 2: 'Pair', 3: 'Spark', 5: 'Flame', 7: 'Week Warrior',
    10: 'Tenacious', 14: 'Fortnight', 21: 'Three Weeks', 30: 'Monthly',
    45: 'Forty-Five', 60: 'Two Months', 90: 'Quarter Year', 100: 'Century',
    120: 'Four Months', 150: 'Five Months', 180: 'Half Year', 200: 'Two Hundred',
    250: 'Eight Months', 300: 'Ten Months', 365: 'Year', 500: 'Five Hundred',
    730: 'Two Years', 1000: 'Thousand Days'
  };

  STREAK_COUNTS.forEach((days, i) => {
    const name = streakNames[days] || `${days} Days`;
    achievements.push(createAchievement(
      `streak_${days}`,
      `Streak: ${name}`,
      `Maintain a ${days} day streak`,
      pickIcon(ICONS.streaks, Math.floor(i / 2)),
      'streak',
      calculateXP(days, 1.5),
      'streak_days',
      { days },
      'visible',
      'days'
    ));
  });

  // Week streaks (all 7 days)
  [1, 2, 3, 4, 8, 12, 26, 52, 104, 156].forEach((weeks, i) => {
    achievements.push(createAchievement(
      `week_streak_${weeks}`,
      `Full Week${weeks > 1 ? 's' : ''}: ${weeks}`,
      `Complete tasks every day for ${weeks} full week${weeks > 1 ? 's' : ''}`,
      pickIcon(ICONS.streaks, i),
      'streak',
      weeks * 25,
      'special',
      { special: 'full_weeks', count: weeks },
      'visible',
      'weeks'
    ));
  });
}

// 10. PROJECT ACHIEVEMENTS
function generateProjectAchievements() {
  // Create projects
  [1, 2, 3, 5, 10, 15, 20, 30, 50, 100].forEach((count, i) => {
    achievements.push(createAchievement(
      `projects_created_${count}`,
      `Project Creator ${count}`,
      `Create ${count} project${count > 1 ? 's' : ''}`,
      pickIcon(ICONS.projects, i),
      'projects',
      calculateXP(count),
      'project_count',
      { count, action: 'create' },
      'visible',
      'create'
    ));
  });

  // Complete projects
  [1, 2, 3, 5, 10, 15, 20, 30, 50, 100].forEach((count, i) => {
    achievements.push(createAchievement(
      `projects_completed_${count}`,
      `Project Finisher ${count}`,
      `Complete ${count} project${count > 1 ? 's' : ''}`,
      pickIcon(ICONS.projects, i),
      'projects',
      calculateXP(count, 1.5),
      'project_count',
      { count, action: 'complete' },
      'visible',
      'complete'
    ));
  });

  // Tasks in single project
  [5, 10, 25, 50, 100, 250, 500, 1000].forEach((count, i) => {
    achievements.push(createAchievement(
      `project_tasks_${count}`,
      `Big Project ${count}`,
      `Complete ${count} tasks in a single project`,
      pickIcon(ICONS.projects, i),
      'projects',
      calculateXP(count),
      'special',
      { special: 'tasks_in_project', count },
      'visible',
      'size'
    ));
  });

  // Complete project in timeframe
  achievements.push(createAchievement(
    'project_complete_day',
    'Speed Project',
    'Complete a project in one day',
    '⚡',
    'projects',
    50,
    'special',
    { special: 'project_in_day' },
    'visible',
    'speed'
  ));

  achievements.push(createAchievement(
    'project_complete_week',
    'Weekly Project',
    'Complete a project in one week',
    '📆',
    'projects',
    35,
    'special',
    { special: 'project_in_week' },
    'visible',
    'speed'
  ));
}

// 11. INBOX ACHIEVEMENTS
function generateInboxAchievements() {
  // Process from inbox
  [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000].forEach((count, i) => {
    achievements.push(createAchievement(
      `inbox_processed_${count}`,
      `Inbox Processor ${count}`,
      `Process ${count} tasks from inbox`,
      pickIcon(ICONS.inbox, i),
      'inbox',
      calculateXP(count),
      'task_count',
      { count, context: 'from_inbox' },
      'visible',
      'process'
    ));
  });

  // Inbox Zero times
  [1, 5, 10, 25, 50, 100, 250, 365, 500, 1000].forEach((count, i) => {
    achievements.push(createAchievement(
      `inbox_zero_${count}`,
      count === 1 ? 'Inbox Zero!' : `Inbox Zero x${count}`,
      `Reach Inbox Zero ${count} time${count > 1 ? 's' : ''}`,
      count >= 365 ? '👑' : pickIcon(ICONS.inbox, i),
      'inbox',
      calculateXP(count, 1.2),
      'special',
      { special: 'inbox_zero', count },
      'visible',
      'zero'
    ));
  });

  // Speed process
  [3, 5, 10, 15, 20, 25, 30].forEach((count, i) => {
    achievements.push(createAchievement(
      `inbox_speed_${count}`,
      `Speed Clear ${count}`,
      `Process ${count} inbox tasks in 5 minutes`,
      pickIcon(ICONS.speed, i),
      'inbox',
      calculateXP(count, 2),
      'special',
      { special: 'inbox_speed', count, minutes: 5 },
      'visible',
      'speed'
    ));
  });

  // Inbox Zero streak
  [3, 5, 7, 14, 30, 60, 100, 365].forEach((days, i) => {
    achievements.push(createAchievement(
      `inbox_zero_streak_${days}`,
      `Zero Streak ${days}`,
      `Maintain Inbox Zero for ${days} days`,
      pickIcon(ICONS.streaks, i),
      'inbox',
      days * 5,
      'special',
      { special: 'inbox_zero_streak', days },
      'visible',
      'streak'
    ));
  });

  // Bulk process
  [10, 20, 30, 40, 50, 75, 100].forEach((count, i) => {
    achievements.push(createAchievement(
      `inbox_bulk_${count}`,
      `Bulk Clear ${count}`,
      `Process ${count}+ tasks from inbox at once`,
      pickIcon(ICONS.inbox, i),
      'inbox',
      calculateXP(count, 1.5),
      'special',
      { special: 'inbox_bulk', count },
      'visible',
      'bulk'
    ));
  });
}

// 12. FOCUS/POMODORO ACHIEVEMENTS
function generateFocusAchievements() {
  // Total pomodoros
  [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000].forEach((count, i) => {
    achievements.push(createAchievement(
      `pomodoros_total_${count}`,
      `Pomodoro ${getCountName(count)}`,
      `Complete ${formatNumber(count)} pomodoros`,
      '🍅',
      'focus',
      calculateXP(count),
      'pomodoro_count',
      { count, timeframe: 'total' },
      'visible',
      'total'
    ));
  });

  // Pomodoros in a day
  [1, 2, 3, 4, 5, 6, 8, 10, 12, 15, 20].forEach((count, i) => {
    achievements.push(createAchievement(
      `pomodoros_daily_${count}`,
      `Daily Pomodoro ${count}`,
      `Complete ${count} pomodoros in one day`,
      pickIcon(ICONS.focus, i),
      'focus',
      count * 5,
      'pomodoro_count',
      { count, timeframe: 'day' },
      'visible',
      'daily'
    ));
  });

  // Focus hours total
  [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000].forEach((hours, i) => {
    achievements.push(createAchievement(
      `focus_hours_total_${hours}`,
      `${hours} Hours Focused`,
      `Accumulate ${hours} hours of focus time`,
      pickIcon(ICONS.focus, i),
      'focus',
      calculateXP(hours * 2),
      'focus_time',
      { hours, timeframe: 'total' },
      'visible',
      'hours_total'
    ));
  });

  // Focus hours in a day
  [1, 2, 3, 4, 5, 6, 8, 10, 12].forEach((hours, i) => {
    achievements.push(createAchievement(
      `focus_hours_daily_${hours}`,
      `${hours}h Focus Day`,
      `Focus for ${hours} hours in one day`,
      pickIcon(ICONS.focus, i),
      'focus',
      hours * 15,
      'focus_time',
      { hours, timeframe: 'day' },
      'visible',
      'hours_daily'
    ));
  });

  // Focus streak
  [3, 5, 7, 14, 21, 30, 60, 90, 100, 180, 365].forEach((days, i) => {
    achievements.push(createAchievement(
      `focus_streak_${days}`,
      `Focus Streak ${days}`,
      `Complete a pomodoro ${days} days in a row`,
      pickIcon(ICONS.streaks, i),
      'focus',
      days * 3,
      'special',
      { special: 'focus_streak', days },
      'visible',
      'streak'
    ));
  });

  // Deep work (4+ hours)
  [1, 5, 10, 25, 50, 100].forEach((count, i) => {
    achievements.push(createAchievement(
      `deep_work_${count}`,
      `Deep Work ${count}`,
      `Have ${count} deep work session${count > 1 ? 's' : ''} (4+ hours)`,
      '🧘',
      'focus',
      count * 20,
      'special',
      { special: 'deep_work', count },
      'visible',
      'deep'
    ));
  });
}

// 13. TIME OF DAY ACHIEVEMENTS
function generateTimeOfDayAchievements() {
  // Complete at each hour
  for (let hour = 0; hour < 24; hour++) {
    const period = hour < 6 ? 'night' : hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : hour < 22 ? 'evening' : 'night';
    achievements.push(createAchievement(
      `hour_${hour}`,
      `${hour}:00 Worker`,
      `Complete a task at ${hour}:00`,
      pickIcon(ICONS.timeOfDay[period], hour % ICONS.timeOfDay[period].length),
      'time_of_day',
      10,
      'time',
      { hour },
      'hidden',
      'hour'
    ));
  }

  // Time periods
  const periods = ['morning', 'afternoon', 'evening', 'night'] as const;
  const periodLabels = {
    morning: 'Morning (5-9)',
    afternoon: 'Afternoon (9-17)',
    evening: 'Evening (17-22)',
    night: 'Night (22-5)',
  };

  periods.forEach((period) => {
    [1, 5, 10, 25, 50, 100, 250, 500].forEach((count, i) => {
      achievements.push(createAchievement(
        `${period}_tasks_${count}`,
        `${period.charAt(0).toUpperCase() + period.slice(1)} ${count}`,
        `Complete ${count} tasks during ${periodLabels[period]}`,
        pickIcon(ICONS.timeOfDay[period], i),
        'time_of_day',
        calculateXP(count),
        'task_count',
        { count, period },
        'visible',
        period
      ));
    });
  });

  // All periods in one day
  [1, 5, 10, 25, 50].forEach((count, i) => {
    achievements.push(createAchievement(
      `all_periods_day_${count}`,
      count === 1 ? 'Around the Clock' : `Around the Clock x${count}`,
      `Complete tasks in all 4 time periods in ${count === 1 ? 'a' : count} day${count > 1 ? 's' : ''}`,
      '🕰️',
      'time_of_day',
      count * 25,
      'special',
      { special: 'all_periods_day', count },
      'visible',
      'all'
    ));
  });
}

// 14. DAY OF WEEK ACHIEVEMENTS
function generateDayOfWeekAchievements() {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  days.forEach((day, dayIndex) => {
    const icons = ICONS.days[day];
    [1, 5, 10, 25, 50, 100, 250, 500, 1000].forEach((count, i) => {
      achievements.push(createAchievement(
        `${day}_tasks_${count}`,
        `${dayNames[dayIndex]} ${count}`,
        `Complete ${count} tasks on ${dayNames[dayIndex]}s`,
        pickIcon(icons, i),
        'day_of_week',
        calculateXP(count),
        'task_count',
        { count, dayOfWeek: dayIndex },
        'visible',
        day
      ));
    });
  });

  // Weekend
  [1, 5, 10, 25, 50, 100, 250, 500].forEach((count, i) => {
    achievements.push(createAchievement(
      `weekend_tasks_${count}`,
      `Weekend Warrior ${count}`,
      `Complete ${count} tasks on weekends`,
      pickIcon(ICONS.days.weekend, i),
      'day_of_week',
      calculateXP(count),
      'task_count',
      { count, weekend: true },
      'visible',
      'weekend'
    ));
  });

  // Weekday
  [5, 10, 25, 50, 100, 250, 500, 1000].forEach((count, i) => {
    achievements.push(createAchievement(
      `weekday_tasks_${count}`,
      `Weekday Worker ${count}`,
      `Complete ${count} tasks on weekdays`,
      pickIcon(ICONS.days.weekday, i),
      'day_of_week',
      calculateXP(count),
      'task_count',
      { count, weekday: true },
      'visible',
      'weekday'
    ));
  });
}

// 15. SPECIAL DATES ACHIEVEMENTS
function generateSpecialDateAchievements() {
  // Friday 13th
  [1, 3, 5, 7, 13].forEach((count) => {
    achievements.push(createAchievement(
      `friday_13_tasks_${count}`,
      count === 13 ? 'Fearless 13' : `Friday 13th ${count}`,
      `Complete ${count} tasks on Friday the 13th`,
      '🎃',
      'special_dates',
      count * 13,
      'special',
      { special: 'friday_13', count },
      'hidden',
      'friday_13'
    ));
  });

  // New Year
  achievements.push(createAchievement(
    'new_year_midnight',
    'New Year Resolution',
    'Complete a task at midnight on New Year',
    '🎆',
    'special_dates',
    100,
    'time',
    { month: 0, dayOfMonth: 1, hour: 0 },
    'invisible',
    'new_year'
  ));

  [1, 5, 10].forEach((count) => {
    achievements.push(createAchievement(
      `new_year_tasks_${count}`,
      `New Year ${count}`,
      `Complete ${count} tasks on New Year's Day`,
      '🎊',
      'special_dates',
      count * 20,
      'special',
      { special: 'new_year_day', count },
      'hidden',
      'new_year'
    ));
  });

  // Valentine's
  [1, 14].forEach((count) => {
    achievements.push(createAchievement(
      `valentine_tasks_${count}`,
      count === 14 ? 'Valentine\'s 14' : 'Valentine\'s Task',
      `Complete ${count} tasks on Valentine's Day`,
      '❤️',
      'special_dates',
      count * 10,
      'special',
      { special: 'valentine', count },
      'hidden',
      'valentine'
    ));
  });

  // Pi Day
  achievements.push(createAchievement(
    'pi_day',
    'Pi Day',
    'Complete a task at 3:14 on March 14th',
    '🥧',
    'special_dates',
    31,
    'time',
    { month: 2, dayOfMonth: 14, hour: 3, minute: 14 },
    'invisible',
    'pi'
  ));

  // Halloween
  [1, 13, 31].forEach((count) => {
    achievements.push(createAchievement(
      `halloween_tasks_${count}`,
      count === 31 ? 'Halloween Master' : `Halloween ${count}`,
      `Complete ${count} tasks on Halloween`,
      '🎃',
      'special_dates',
      count * 5,
      'special',
      { special: 'halloween', count },
      'hidden',
      'halloween'
    ));
  });

  // Leap Day
  achievements.push(createAchievement(
    'leap_day_1',
    'Leap Day',
    'Complete a task on February 29th',
    '🐸',
    'special_dates',
    29,
    'special',
    { special: 'leap_day', count: 1 },
    'hidden',
    'leap'
  ));

  achievements.push(createAchievement(
    'leap_day_29',
    'Leap Master',
    'Complete 29 tasks on February 29th',
    '🦘',
    'special_dates',
    290,
    'special',
    { special: 'leap_day', count: 29 },
    'invisible',
    'leap'
  ));

  // First/Last of month
  [1, 5, 10].forEach((count) => {
    achievements.push(createAchievement(
      `first_of_month_${count}`,
      `Month Starter ${count}`,
      `Complete ${count} tasks on the 1st of the month`,
      '📅',
      'special_dates',
      count * 5,
      'special',
      { special: 'first_of_month', count },
      'visible',
      'month_day'
    ));
  });
}

// 16. COMBO ACHIEVEMENTS
function generateComboAchievements() {
  // Priority + Energy
  PRIORITIES.forEach((priority) => {
    ENERGIES.forEach((energy) => {
      [1, 5, 10, 25, 50, 100].forEach((count, i) => {
        achievements.push(createAchievement(
          `combo_${priority}_${energy}_${count}`,
          `${priority.charAt(0).toUpperCase()}${priority.slice(1)} + ${energy.charAt(0).toUpperCase()}${energy.slice(1)} ${count}`,
          `Complete ${count} ${priority} priority + ${energy} energy tasks`,
          pickIcon(ICONS.combos, i),
          'combos',
          calculateXP(count, 1.3),
          'task_count',
          { count, priority, energy },
          'visible',
          'priority_energy'
        ));
      });
    });
  });

  // Priority + Duration
  PRIORITIES.forEach((priority) => {
    DURATIONS.forEach((duration) => {
      [1, 5, 10, 25, 50].forEach((count, i) => {
        achievements.push(createAchievement(
          `combo_${priority}_${duration}_${count}`,
          `${priority.charAt(0).toUpperCase()}${priority.slice(1)} + ${duration.charAt(0).toUpperCase()}${duration.slice(1)} ${count}`,
          `Complete ${count} ${priority} priority + ${duration} duration tasks`,
          pickIcon(ICONS.combos, i),
          'combos',
          calculateXP(count, 1.3),
          'task_count',
          { count, priority, duration },
          'visible',
          'priority_duration'
        ));
      });
    });
  });

  // Energy + Duration
  ENERGIES.forEach((energy) => {
    DURATIONS.forEach((duration) => {
      [1, 5, 10, 25, 50].forEach((count, i) => {
        achievements.push(createAchievement(
          `combo_${energy}_${duration}_${count}`,
          `${energy.charAt(0).toUpperCase()}${energy.slice(1)} + ${duration.charAt(0).toUpperCase()}${duration.slice(1)} ${count}`,
          `Complete ${count} ${energy} energy + ${duration} duration tasks`,
          pickIcon(ICONS.combos, i),
          'combos',
          calculateXP(count, 1.3),
          'task_count',
          { count, energy, duration },
          'visible',
          'energy_duration'
        ));
      });
    });
  });

  // Triple combos (priority + energy + duration)
  // Just the most interesting ones
  const tripleCosmobs = [
    { priority: 'critical', energy: 'high', duration: 'quick', name: 'Urgent Sprint' },
    { priority: 'critical', energy: 'high', duration: 'long', name: 'Epic Battle' },
    { priority: 'critical', energy: 'low', duration: 'quick', name: 'Low-Key Critical' },
    { priority: 'someday', energy: 'low', duration: 'quick', name: 'Easy Pickings' },
    { priority: 'want', energy: 'medium', duration: 'medium', name: 'Balanced' },
  ];

  tripleCosmobs.forEach(({ priority, energy, duration, name }) => {
    [1, 5, 10, 25].forEach((count, i) => {
      achievements.push(createAchievement(
        `triple_${priority}_${energy}_${duration}_${count}`,
        `${name} ${count}`,
        `Complete ${count} ${priority}/${energy}/${duration} tasks`,
        pickIcon(ICONS.combos, i),
        'combos',
        calculateXP(count, 1.5),
        'task_count',
        { count, priority, energy, duration },
        'visible',
        'triple'
      ));
    });
  });

  // Daily combos
  achievements.push(createAchievement(
    'daily_critical_quick_5',
    'Critical Speed Day',
    'Complete 5 critical + quick tasks in one day',
    '⚡',
    'combos',
    75,
    'task_count',
    { count: 5, priority: 'critical', duration: 'quick', timeframe: 'day' },
    'visible',
    'daily_combo'
  ));

  achievements.push(createAchievement(
    'daily_high_long_3',
    'Epic Day',
    'Complete 3 high energy + long tasks in one day',
    '🏔️',
    'combos',
    100,
    'task_count',
    { count: 3, energy: 'high', duration: 'long', timeframe: 'day' },
    'visible',
    'daily_combo'
  ));

  achievements.push(createAchievement(
    'daily_low_quick_10',
    'Chill Sprint Day',
    'Complete 10 low energy + quick tasks in one day',
    '🧘',
    'combos',
    60,
    'task_count',
    { count: 10, energy: 'low', duration: 'quick', timeframe: 'day' },
    'visible',
    'daily_combo'
  ));
}

// 17. CONTEXT ACHIEVEMENTS
function generateContextAchievements() {
  // With description
  [1, 5, 10, 25, 50, 100, 250, 500, 1000].forEach((count, i) => {
    achievements.push(createAchievement(
      `with_description_${count}`,
      `Detailed ${count}`,
      `Complete ${count} tasks with descriptions`,
      '📝',
      'context',
      calculateXP(count),
      'task_count',
      { count, hasDescription: true },
      'visible',
      'description'
    ));
  });

  // With subtasks
  [1, 5, 10, 25, 50, 100, 250].forEach((count, i) => {
    achievements.push(createAchievement(
      `with_subtasks_${count}`,
      `Subtasker ${count}`,
      `Complete ${count} tasks with subtasks`,
      '📋',
      'context',
      calculateXP(count, 1.2),
      'task_count',
      { count, hasSubtasks: true },
      'visible',
      'subtasks'
    ));
  });

  // With tags
  [1, 5, 10, 25, 50, 100, 250, 500].forEach((count, i) => {
    achievements.push(createAchievement(
      `with_tags_${count}`,
      `Tagged ${count}`,
      `Complete ${count} tasks with tags`,
      '🏷️',
      'context',
      calculateXP(count),
      'task_count',
      { count, hasTags: true },
      'visible',
      'tags'
    ));
  });

  // In project
  [1, 10, 50, 100, 500, 1000, 5000].forEach((count, i) => {
    achievements.push(createAchievement(
      `in_project_${count}`,
      `Project Worker ${count}`,
      `Complete ${count} tasks within projects`,
      '📁',
      'context',
      calculateXP(count),
      'task_count',
      { count, inProject: true },
      'visible',
      'project'
    ));
  });

  // No project (direct from inbox)
  [5, 25, 100, 500].forEach((count, i) => {
    achievements.push(createAchievement(
      `no_project_${count}`,
      `Free Agent ${count}`,
      `Complete ${count} tasks without a project`,
      '🆓',
      'context',
      calculateXP(count),
      'task_count',
      { count, noProject: true },
      'visible',
      'no_project'
    ));
  });

  // Recurring
  [5, 10, 25, 50, 100, 250, 500].forEach((count, i) => {
    achievements.push(createAchievement(
      `recurring_${count}`,
      `Recurring ${count}`,
      `Complete ${count} recurring task instances`,
      '🔄',
      'context',
      calculateXP(count, 1.1),
      'task_count',
      { count, recurring: true },
      'visible',
      'recurring'
    ));
  });

  // Scheduled on time
  [1, 5, 10, 25, 50, 100, 250, 500].forEach((count, i) => {
    achievements.push(createAchievement(
      `on_time_${count}`,
      `Punctual ${count}`,
      `Complete ${count} tasks on their scheduled date`,
      '⏰',
      'context',
      calculateXP(count, 1.2),
      'task_count',
      { count, onTime: true },
      'visible',
      'scheduled'
    ));
  });

  // Overdue rescued
  [1, 5, 10, 25, 50].forEach((count, i) => {
    achievements.push(createAchievement(
      `overdue_rescued_${count}`,
      `Rescued ${count}`,
      `Complete ${count} overdue tasks`,
      '🦸',
      'context',
      calculateXP(count),
      'task_count',
      { count, wasOverdue: true },
      'visible',
      'overdue'
    ));
  });
}

// 18. SPEED ACHIEVEMENTS
function generateSpeedAchievements() {
  // Complete within 1 min of creation
  [1, 5, 10, 25, 50, 100].forEach((count, i) => {
    achievements.push(createAchievement(
      `instant_${count}`,
      `Instant ${count}`,
      `Complete ${count} tasks within 1 minute of creation`,
      pickIcon(ICONS.speed, i),
      'speed',
      calculateXP(count, 1.5),
      'special',
      { special: 'instant', count },
      'visible',
      'instant'
    ));
  });

  // Complete same day
  [10, 50, 100, 500, 1000].forEach((count, i) => {
    achievements.push(createAchievement(
      `same_day_${count}`,
      `Same Day ${count}`,
      `Complete ${count} tasks on the day they were created`,
      pickIcon(ICONS.speed, i),
      'speed',
      calculateXP(count),
      'special',
      { special: 'same_day', count },
      'visible',
      'same_day'
    ));
  });

  // Complete before deadline
  [1, 5, 10, 25, 50, 100].forEach((count, i) => {
    achievements.push(createAchievement(
      `early_${count}`,
      `Early Bird ${count}`,
      `Complete ${count} tasks before their deadline`,
      '🐦',
      'speed',
      calculateXP(count, 1.3),
      'special',
      { special: 'early', count },
      'visible',
      'early'
    ));
  });
}

// 19. PERFECT ACHIEVEMENTS
function generatePerfectAchievements() {
  // Perfect days
  [1, 3, 5, 7, 14, 30, 60, 100, 365].forEach((count, i) => {
    achievements.push(createAchievement(
      `perfect_day_${count}`,
      count === 1 ? 'Perfect Day' : `Perfect Day x${count}`,
      `Complete all planned tasks for ${count} day${count > 1 ? 's' : ''}`,
      pickIcon(ICONS.perfect, i),
      'perfect',
      count * 15,
      'special',
      { special: 'perfect_day', count },
      'visible',
      'day'
    ));
  });

  // Perfect week (all 7 days perfect)
  [1, 2, 4, 8, 12, 26, 52].forEach((count, i) => {
    achievements.push(createAchievement(
      `perfect_week_${count}`,
      count === 1 ? 'Perfect Week' : `Perfect Week x${count}`,
      `Have ${count} perfect week${count > 1 ? 's' : ''}`,
      count >= 52 ? '👑' : pickIcon(ICONS.perfect, i),
      'perfect',
      count * 100,
      'special',
      { special: 'perfect_week', count },
      'visible',
      'week'
    ));
  });

  // Perfect month
  [1, 3, 6, 12].forEach((count, i) => {
    achievements.push(createAchievement(
      `perfect_month_${count}`,
      count === 1 ? 'Perfect Month' : `Perfect Month x${count}`,
      `Have ${count} perfect month${count > 1 ? 's' : ''}`,
      count === 12 ? '💎' : pickIcon(ICONS.perfect, i),
      'perfect',
      count * 500,
      'special',
      { special: 'perfect_month', count },
      'visible',
      'month'
    ));
  });
}

// 20. CREATURE ACHIEVEMENTS
function generateCreatureAchievements() {
  // Catch total
  [1, 5, 10, 25, 50, 100, 250, 500, 1000].forEach((count, i) => {
    achievements.push(createAchievement(
      `creatures_caught_${count}`,
      `Creature Catcher ${count}`,
      `Catch ${count} creatures total`,
      pickIcon(ICONS.creatures, i),
      'creatures',
      calculateXP(count),
      'creature_count',
      { count },
      'visible',
      'total'
    ));
  });

  // Unique creatures
  [1, 3, 5, 8, 10, 12, 15, 16].forEach((count, i) => {
    achievements.push(createAchievement(
      `unique_creatures_${count}`,
      count === 16 ? 'Creature Master' : `Unique ${count}`,
      `Catch ${count} unique creature species`,
      pickIcon(ICONS.creatures, i),
      'creatures',
      count * 20,
      'creature_unique',
      { count },
      'visible',
      'unique'
    ));
  });

  // By rarity
  const rarities = ['common', 'uncommon', 'rare', 'legendary', 'mythic', 'secret'];
  rarities.forEach((rarity, i) => {
    achievements.push(createAchievement(
      `all_${rarity}_creatures`,
      `All ${rarity.charAt(0).toUpperCase() + rarity.slice(1)}`,
      `Catch all ${rarity} creatures`,
      pickIcon(ICONS.creatures, i),
      'creatures',
      (i + 1) * 50,
      'creature_rarity',
      { rarity, all: true },
      i >= 3 ? 'hidden' : 'visible',
      'rarity'
    ));
  });

  // Complete collection
  achievements.push(createAchievement(
    'creature_collection_complete',
    'Master Collector',
    'Catch all creatures',
    '🏆',
    'creatures',
    1000,
    'creature_collection',
    { complete: true },
    'visible',
    'collection'
  ));

  // Same creature multiple times
  [3, 5, 10, 25, 50].forEach((count, i) => {
    achievements.push(createAchievement(
      `creature_duplicate_${count}`,
      `Creature Fan ${count}`,
      `Catch the same creature ${count} times`,
      pickIcon(ICONS.creatures, i),
      'creatures',
      count * 5,
      'creature_duplicate',
      { count },
      'visible',
      'duplicate'
    ));
  });
}

// 21. LEVEL & XP ACHIEVEMENTS
function generateLevelXPAchievements() {
  // Levels
  [2, 3, 5, 7, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100].forEach((level, i) => {
    achievements.push(createAchievement(
      `level_${level}`,
      `Level ${level}`,
      `Reach level ${level}`,
      pickIcon(ICONS.levels, Math.floor(i / 2)),
      'levels',
      level * 5,
      'level',
      { level },
      'visible',
      'level'
    ));
  });

  // Total XP
  [100, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000, 500000, 1000000].forEach((xp, i) => {
    achievements.push(createAchievement(
      `xp_total_${xp}`,
      `${formatNumber(xp)} XP`,
      `Earn ${formatNumber(xp)} XP total`,
      pickIcon(ICONS.xp, i),
      'xp',
      Math.floor(xp / 100),
      'xp_total',
      { xp },
      'visible',
      'total'
    ));
  });

  // XP in a day
  [50, 100, 250, 500, 1000, 2000].forEach((xp, i) => {
    achievements.push(createAchievement(
      `xp_daily_${xp}`,
      `${xp} XP Day`,
      `Earn ${xp} XP in one day`,
      pickIcon(ICONS.xp, i),
      'xp',
      Math.floor(xp / 10),
      'xp_daily',
      { xp },
      'visible',
      'daily'
    ));
  });
}

// 22. HABIT ACHIEVEMENTS
function generateHabitAchievements() {
  // Total habit completions
  [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000].forEach((count, i) => {
    achievements.push(createAchievement(
      `habits_total_${count}`,
      `Habit Builder ${getCountName(count)}`,
      `Complete ${formatNumber(count)} habit checks total`,
      '✨',
      'habits',
      calculateXP(count),
      'habit_count',
      { count, timeframe: 'total' },
      'visible',
      'total'
    ));
  });

  // All habits done in a day (bonus achievement)
  [1, 3, 5, 7, 14, 21, 30, 60, 90, 100, 180, 365].forEach((count, i) => {
    achievements.push(createAchievement(
      `all_habits_day_${count}`,
      count === 1 ? 'Perfect Habit Day' : `Perfect Habit Day x${count}`,
      `Complete all habits in ${count} day${count > 1 ? 's' : ''}`,
      '💯',
      'habits',
      count * 10,
      'habit_count',
      { count, allDone: true, timeframe: 'days' },
      'visible',
      'perfect_day'
    ));
  });

  // Habit streak (days in a row with all habits done)
  [3, 5, 7, 14, 21, 30, 45, 60, 90, 100, 120, 150, 180, 200, 250, 300, 365].forEach((days, i) => {
    const names: Record<number, string> = {
      3: 'Habit Spark', 5: 'Habit Flame', 7: 'Week of Habits',
      14: 'Fortnight of Habits', 21: '3 Weeks', 30: 'Monthly Habit Master',
      45: '45 Days Strong', 60: '2 Months', 90: 'Quarter Year',
      100: 'Century of Habits', 120: '4 Months', 150: '5 Months',
      180: 'Half Year', 200: '200 Days', 250: 'Marathon',
      300: '10 Months', 365: 'Year of Habits',
    };
    achievements.push(createAchievement(
      `habit_streak_${days}`,
      names[days] || `${days} Day Streak`,
      `Complete all habits ${days} days in a row`,
      pickIcon(ICONS.streaks, Math.floor(i / 2)),
      'habits',
      days * 5,
      'habit_streak',
      { days },
      'visible',
      'streak'
    ));
  });

  // Create habits
  [1, 3, 5, 7, 10, 15, 20].forEach((count, i) => {
    achievements.push(createAchievement(
      `habits_created_${count}`,
      `Habit Creator ${count}`,
      `Create ${count} habit${count > 1 ? 's' : ''}`,
      '📝',
      'habits',
      count * 5,
      'habit_create',
      { count },
      'visible',
      'create'
    ));
  });

  // Individual habit streaks (same habit done X days in a row)
  [7, 14, 30, 60, 90, 180, 365].forEach((days, i) => {
    achievements.push(createAchievement(
      `single_habit_streak_${days}`,
      `Dedicated ${days}`,
      `Complete the same habit ${days} days in a row`,
      pickIcon(ICONS.streaks, i),
      'habits',
      days * 3,
      'single_habit_streak',
      { days },
      'visible',
      'single_streak'
    ));
  });

  // Morning/evening habits
  const timeCategories = ['morning', 'afternoon', 'evening', 'night'] as const;
  timeCategories.forEach((time) => {
    [10, 50, 100, 250].forEach((count, i) => {
      achievements.push(createAchievement(
        `habits_${time}_${count}`,
        `${time.charAt(0).toUpperCase() + time.slice(1)} Habit ${count}`,
        `Complete ${count} ${time} habits`,
        pickIcon(ICONS.timeOfDay[time], i),
        'habits',
        calculateXP(count),
        'habit_count',
        { count, timeOfDay: time },
        'visible',
        `time_${time}`
      ));
    });
  });

  // Daily review achievements
  [1, 7, 14, 30, 60, 100, 365].forEach((count, i) => {
    achievements.push(createAchievement(
      `daily_reviews_${count}`,
      count === 1 ? 'First Review' : `Reviewer ${count}`,
      `Complete ${count} daily review${count > 1 ? 's' : ''}`,
      '📋',
      'habits',
      count * 3,
      'review_count',
      { count },
      'visible',
      'review'
    ));
  });
}

// 23. HIDDEN ACHIEVEMENTS
function generateHiddenAchievements() {
  // Time-based hidden
  const timeAchievements = [
    { code: 'night_owl', name: 'Night Owl', desc: 'Complete a task after midnight', hour: 0, icon: '🦉' },
    { code: 'early_bird', name: 'Early Bird', desc: 'Complete a task before 6 AM', hour: 5, icon: '🐦' },
    { code: 'triple_3', name: '3:33 AM', desc: 'Complete a task at 3:33 AM', hour: 3, minute: 33, icon: '👁️' },
    { code: 'eleven_eleven', name: '11:11', desc: 'Complete a task at 11:11', hour: 11, minute: 11, icon: '✨' },
    { code: 'twelve_34', name: '12:34', desc: 'Complete a task at 12:34', hour: 12, minute: 34, icon: '🔢' },
    { code: 'high_noon', name: 'High Noon', desc: 'Complete a task at exactly 12:00', hour: 12, minute: 0, icon: '🤠' },
    { code: 'midnight_hero', name: 'Midnight Hero', desc: 'Complete a task at exactly 00:00', hour: 0, minute: 0, icon: '🌙' },
    { code: 'golden_hour', name: 'Golden Hour', desc: 'Complete a task at sunrise', special: 'sunrise', icon: '🌅' },
    { code: 'sunset_worker', name: 'Sunset Worker', desc: 'Complete a task at sunset', special: 'sunset', icon: '🌇' },
  ];

  timeAchievements.forEach((a) => {
    achievements.push(createAchievement(
      a.code,
      a.name,
      a.desc,
      a.icon,
      'hidden',
      a.minute !== undefined ? 50 : 20,
      'time',
      { hour: a.hour, minute: a.minute, special: a.special },
      'hidden',
      'time'
    ));
  });

  // Number-based hidden (task numbers)
  const numberAchievements = [
    { num: 7, name: 'Lucky', icon: '🍀', xp: 7 },
    { num: 13, name: 'Unlucky?', icon: '🔮', xp: 13 },
    { num: 42, name: 'Answer', icon: '🌌', xp: 42 },
    { num: 69, name: 'Nice', icon: '😏', xp: 69 },
    { num: 100, name: 'Triple Digits', icon: '💯', xp: 100 },
    { num: 123, name: 'Sequence', icon: '🔢', xp: 50 },
    { num: 321, name: 'Countdown', icon: '⏬', xp: 50 },
    { num: 333, name: 'Angel Number', icon: '👼', xp: 33 },
    { num: 404, name: 'Not Found', icon: '🔍', xp: 40 },
    { num: 500, name: 'Half K', icon: '🎯', xp: 50 },
    { num: 666, name: 'The Number', icon: '😈', xp: 66 },
    { num: 777, name: 'Jackpot', icon: '🎰', xp: 77 },
    { num: 1000, name: 'Millennium', icon: '🎊', xp: 100 },
    { num: 1234, name: 'Full Sequence', icon: '📈', xp: 123 },
    { num: 9999, name: 'Almost There', icon: '😤', xp: 99 },
  ];

  numberAchievements.forEach((a) => {
    achievements.push(createAchievement(
      `task_number_${a.num}`,
      `Task #${a.num}: ${a.name}`,
      `Complete your ${a.num}th task`,
      a.icon,
      'hidden',
      a.xp,
      'task_number',
      { number: a.num },
      'invisible',
      'number'
    ));
  });

  // Pattern-based hidden
  const patternAchievements = [
    { code: 'lucky_seven', name: 'Lucky Seven', desc: '7 tasks on 7th at 7:07', icon: '7️⃣', xp: 77 },
    { code: 'speed_10', name: 'Speed Demon', desc: '10 tasks in 10 minutes', icon: '⚡', xp: 100 },
    { code: 'critical_5_5', name: 'Critical Speed', desc: '5 critical tasks in 5 minutes', icon: '🚨', xp: 50 },
    { code: 'emoji_title', name: 'Emoji Master', desc: 'Task with only emojis in title', icon: '😀', xp: 15 },
    { code: 'long_title', name: 'Novelist', desc: 'Task with 100+ character title', icon: '📚', xp: 10 },
    { code: 'short_title', name: 'Minimalist', desc: 'Task with 1 character title', icon: '·', xp: 10 },
    { code: 'same_title', name: 'Déjà Vu', desc: 'Complete same task title twice', icon: '👯', xp: 15 },
    { code: 'weekend_warrior', name: 'Weekend Warrior', desc: '5 tasks on a weekend', icon: '⚔️', xp: 30 },
  ];

  patternAchievements.forEach((a) => {
    achievements.push(createAchievement(
      a.code,
      a.name,
      a.desc,
      a.icon,
      'hidden',
      a.xp,
      'special',
      { special: a.code },
      'hidden',
      'pattern'
    ));
  });
}

// 23. ULTRA SECRET ACHIEVEMENTS
function generateUltraSecretAchievements() {
  const ultraSecrets = [
    { code: 'the_watcher', name: 'The Watcher', desc: 'You found a secret', icon: '👁️‍🗨️', xp: 200 },
    { code: 'time_lord', name: 'Time Lord', desc: 'Complete a task at every hour (0-23)', icon: '⏰', xp: 240 },
    { code: 'calendar_master', name: 'Calendar Master', desc: 'Complete a task every day of the year', icon: '📅', xp: 365 },
    { code: 'rainbow_week', name: 'Rainbow Week', desc: 'Different priority each day of week', icon: '🌈', xp: 70 },
    { code: 'perfectionist', name: 'Perfectionist', desc: '100 perfect days total', icon: '💯', xp: 500 },
    { code: 'full_circle', name: 'Full Circle', desc: 'Complete task exactly 1 year after creation', icon: '🔄', xp: 365 },
    { code: 'infinity', name: 'Infinity', desc: '1000 day streak', icon: '♾️', xp: 1000 },
    { code: 'duality', name: 'Duality', desc: 'Critical and Someday in same minute', icon: '🎭', xp: 50 },
    { code: 'puzzle_master', name: 'Puzzle Master', desc: 'Unlock all hidden achievements', icon: '🧩', xp: 500 },
    { code: 'ghost', name: 'Ghost', desc: 'Complete task at 00:00:00.000', icon: '👻', xp: 100 },
    { code: 'unicorn', name: 'Unicorn', desc: 'Catch all mythic creatures', icon: '🦄', xp: 300 },
    { code: 'diamond', name: 'Diamond', desc: '100,000 XP in one month', icon: '💎', xp: 1000 },
    { code: 'champion', name: 'Champion', desc: 'Top of leaderboard', icon: '🏆', xp: 500 },
    { code: 'supernova', name: 'Supernova', desc: '50 tasks in one day', icon: '🌟', xp: 500 },
    { code: 'launch', name: 'Launch', desc: '100 tasks in first week', icon: '🚀', xp: 200 },
    { code: 'dedication', name: 'Dedication', desc: 'Use the app for 1000 days', icon: '💫', xp: 1000 },
    { code: 'all_achievements', name: 'Completionist', desc: 'Unlock every achievement', icon: '🌌', xp: 5000 },
  ];

  ultraSecrets.forEach((a) => {
    achievements.push(createAchievement(
      a.code,
      a.name,
      a.desc,
      a.icon,
      'ultra_secret',
      a.xp,
      'special',
      { special: a.code },
      'ultra_secret',
      'ultra'
    ));
  });
}

// ============================================
// MAIN GENERATOR
// ============================================

function generateAllAchievements() {
  console.log('Generating achievements...\n');

  generateTotalTaskAchievements();
  console.log(`Total tasks: ${achievements.length}`);

  generatePriorityTotalAchievements();
  console.log(`+ Priority total: ${achievements.length}`);

  generateEnergyTotalAchievements();
  console.log(`+ Energy total: ${achievements.length}`);

  generateDurationTotalAchievements();
  console.log(`+ Duration total: ${achievements.length}`);

  generateDailyAchievements();
  console.log(`+ Daily: ${achievements.length}`);

  generateWeeklyAchievements();
  console.log(`+ Weekly: ${achievements.length}`);

  generateMonthlyAchievements();
  console.log(`+ Monthly: ${achievements.length}`);

  generateHourlyAchievements();
  console.log(`+ Hourly: ${achievements.length}`);

  generateStreakAchievements();
  console.log(`+ Streaks: ${achievements.length}`);

  generateProjectAchievements();
  console.log(`+ Projects: ${achievements.length}`);

  generateInboxAchievements();
  console.log(`+ Inbox: ${achievements.length}`);

  generateFocusAchievements();
  console.log(`+ Focus: ${achievements.length}`);

  generateTimeOfDayAchievements();
  console.log(`+ Time of day: ${achievements.length}`);

  generateDayOfWeekAchievements();
  console.log(`+ Day of week: ${achievements.length}`);

  generateSpecialDateAchievements();
  console.log(`+ Special dates: ${achievements.length}`);

  generateComboAchievements();
  console.log(`+ Combos: ${achievements.length}`);

  generateContextAchievements();
  console.log(`+ Context: ${achievements.length}`);

  generateSpeedAchievements();
  console.log(`+ Speed: ${achievements.length}`);

  generatePerfectAchievements();
  console.log(`+ Perfect: ${achievements.length}`);

  generateCreatureAchievements();
  console.log(`+ Creatures: ${achievements.length}`);

  generateLevelXPAchievements();
  console.log(`+ Level/XP: ${achievements.length}`);

  generateHabitAchievements();
  console.log(`+ Habits: ${achievements.length}`);

  generateHiddenAchievements();
  console.log(`+ Hidden: ${achievements.length}`);

  generateUltraSecretAchievements();
  console.log(`+ Ultra Secret: ${achievements.length}`);

  console.log(`\n✅ Total achievements generated: ${achievements.length}`);

  // Stats
  const byVisibility = achievements.reduce((acc, a) => {
    acc[a.visibility] = (acc[a.visibility] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const byCategory = achievements.reduce((acc, a) => {
    acc[a.category] = (acc[a.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('\nBy visibility:');
  Object.entries(byVisibility).forEach(([k, v]) => console.log(`  ${k}: ${v}`));

  console.log('\nBy category:');
  Object.entries(byCategory).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => console.log(`  ${k}: ${v}`));

  return achievements;
}

// ============================================
// EXPORT
// ============================================

export { generateAllAchievements, achievements };
export type { Achievement };

// Run if executed directly
if (require.main === module) {
  const generated = generateAllAchievements();

  // Output to JSON for verification
  const fs = require('fs');
  fs.writeFileSync(
    'generated-achievements.json',
    JSON.stringify(generated, null, 2)
  );
  console.log('\n📄 Saved to generated-achievements.json');
}
