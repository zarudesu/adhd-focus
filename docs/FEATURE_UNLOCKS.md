# Feature Unlock System

> Progressive disclosure for ADHD brains - reveal features as users build habits

## Design Philosophy

ADHD users can be overwhelmed by too many options at once. We use **progressive disclosure**:
1. Start with minimal UI (just Inbox)
2. Unlock features as users demonstrate readiness
3. Each unlock feels like a reward/achievement
4. Hidden until unlocked = surprise delight

## Unlock Conditions Summary

| Feature | Condition | Trigger | Rationale |
|---------|-----------|---------|-----------|
| **Inbox** | Always | - | Entry point, no barrier |
| **Today** | 1 task assigned | `tasksAssignedToday >= 1` | Learned to prioritize |
| **Scheduled** | 1 task scheduled (future) | `tasksScheduled >= 1` | Planning for future |
| **Projects** | 10 tasks added | `tasksAdded >= 10` | Enough tasks to organize |
| **Completed** | 1 task completed | `totalTasksCompleted >= 1` | First win |
| **Daily Checklist** | 3 tasks completed | `totalTasksCompleted >= 3` | Ready for habits |
| **Quick Actions** | 10 tasks completed | `totalTasksCompleted >= 10` | Power user emerging |
| **Focus Mode** | 5 tasks completed | `totalTasksCompleted >= 5` | Ready for deep work |
| **Achievements** | 3 tasks added | `tasksAdded >= 3` | Show gamification early |
| **Creatures** | Level 5 | `level >= 5` | Earned through XP |
| **Statistics** | 7-day streak | `currentStreak >= 7` | Consistent habit formed |

## User Journey Map

```
Day 1-2: Capture & Triage
├── INBOX (always available) - Capture everything
├── Unlock: Add 3 tasks → ACHIEVEMENTS appears (see progress)
├── Unlock: Move task to today → TODAY appears
└── Unlock: Complete task → COMPLETED appears

Day 3-7: Building Habits
├── Unlock: Complete 3 tasks → DAILY CHECKLIST appears
├── Unlock: Schedule for tomorrow → SCHEDULED appears
├── Unlock: Complete 5 tasks → FOCUS MODE appears
├── Unlock: Add 10 tasks → PROJECTS appears
└── Unlock: Reach Level 5 → CREATURES appears

Week 2+: Power User
├── Unlock: Complete 10 tasks → QUICK ACTIONS appears
└── Unlock: 7-day streak → STATISTICS appears
```

## Feature Definitions

### Tier 1: Always Available
- **Inbox**: Entry point for all tasks. Zero friction capture.

### Tier 2: Early Unlocks (Day 1)
- **Today**: Focus on what matters NOW. Unlocks immediately when user assigns first task to today.
- **Completed**: See your wins. Unlocks on first task completion.
- **Achievements**: Early gamification hook. Unlocks after 3 tasks added.

### Tier 3: Planning Features (Day 2-3)
- **Daily Checklist**: Build habits. Unlocks after 3 tasks completed.
- **Scheduled**: Future planning. Unlocks when user schedules a task for a FUTURE date (not today).
- **Focus Mode**: Deep work timer. Unlocks after 5 completions show readiness.

### Tier 4: Organization (Week 1)
- **Projects**: Group related tasks. Unlocks at 10 tasks when organization becomes necessary.
- **Quick Actions**: Power user shortcuts. Unlocks at 10 completions.

### Tier 5: Long-term (Week 2+)
- **Creatures**: Virtual companions. Unlocks at Level 5 (earned through XP).
- **Statistics**: Data for data lovers. Unlocks at 7-day streak (proves consistent usage).

## Technical Implementation

### Database Schema (feature table)
```sql
-- Unlock conditions (nullable = not a factor)
unlock_tasks_added INTEGER          -- Total tasks ever created
unlock_tasks_completed INTEGER      -- Total tasks marked done
unlock_tasks_scheduled INTEGER      -- Tasks scheduled for FUTURE dates
unlock_tasks_assigned_today INTEGER -- Tasks moved to Today list
unlock_level INTEGER                -- XP-based level
unlock_streak_days INTEGER          -- Consecutive days active
```

### User Progress (users table)
```sql
-- Progress counters (incremented by API)
tasks_added INTEGER DEFAULT 0
total_tasks_completed INTEGER DEFAULT 0
tasks_scheduled INTEGER DEFAULT 0       -- Only future dates!
tasks_assigned_today INTEGER DEFAULT 0
current_streak INTEGER DEFAULT 0
level INTEGER DEFAULT 1
```

### Tracking Rules

**POST /api/tasks (Create)**
```typescript
// Always increment
tasksAdded += 1

// If status is "today"
tasksAssignedToday += 1

// If scheduledDate is in the FUTURE (not today!)
if (scheduledDate > today) {
  tasksScheduled += 1
}
```

**PATCH /api/tasks/[id] (Update)**
```typescript
// If moving to today (first time)
if (newStatus === 'today' && oldStatus !== 'today') {
  tasksAssignedToday += 1
}

// If setting scheduledDate (first time) AND it's in the FUTURE
if (newScheduledDate && !oldScheduledDate && newScheduledDate > today) {
  tasksScheduled += 1
}

// If completing (first time)
if (newStatus === 'done' && oldStatus !== 'done') {
  totalTasksCompleted += 1
}
```

### Bug Prevention

**Common Mistakes:**
1. ❌ Incrementing `tasksScheduled` for ANY scheduledDate
2. ✅ Only increment when `scheduledDate > today`

3. ❌ "For Today" toggle sets `scheduledDate = today`
4. ✅ "For Today" should only set `status = 'today'`, no scheduledDate needed

## Testing Checklist

### New User Flow
- [ ] Inbox visible on registration
- [ ] All other nav items hidden
- [ ] Add first task → Achievements appears (3rd task)
- [ ] Move to today → Today appears
- [ ] Complete task → Completed appears

### Scheduling Test
- [ ] Add task "For Today" → `tasksScheduled` stays 0
- [ ] Schedule for tomorrow → `tasksScheduled` becomes 1
- [ ] Scheduled nav appears

### Edge Cases
- [ ] Edit task, add scheduledDate = today → no increment
- [ ] Edit task, add scheduledDate = tomorrow → increment
- [ ] Unschedule then reschedule → only count once

## Seed Data Reference

```typescript
// From seed-gamification.ts
const features = [
  { code: 'nav_inbox', name: 'Inbox' },
  { code: 'nav_today', name: 'Today', unlockTasksAssignedToday: 1 },
  { code: 'nav_scheduled', name: 'Scheduled', unlockTasksScheduled: 1 },
  { code: 'nav_projects', name: 'Projects', unlockTasksAdded: 10 },
  { code: 'nav_completed', name: 'Completed', unlockTasksCompleted: 1 },
  { code: 'nav_checklist', name: 'Daily Checklist', unlockTasksCompleted: 3 },
  { code: 'nav_quick_actions', name: 'Quick Actions', unlockTasksCompleted: 10 },
  { code: 'nav_focus', name: 'Focus Mode', unlockTasksCompleted: 5 },
  { code: 'nav_achievements', name: 'Achievements', unlockTasksAdded: 3 },
  { code: 'nav_creatures', name: 'Creatures', unlockLevel: 5 },
  { code: 'nav_stats', name: 'Statistics', unlockStreakDays: 7 },
];
```
