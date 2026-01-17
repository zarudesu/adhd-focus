# CLAUDE.md - AI Assistant Instructions

> **READ THIS FILE FIRST** in every new session or after context compaction.
> Last updated: 2026-01-17

## CRITICAL: When Fixing Bugs

**STOP. Google BEFORE writing code.**
- Search "[tech] [error]" first
- One fix at a time, test after each
- Ask before creating new files
- After 3 fails: "застрял, нужна помощь"

**When user says "погугли" / "стоп" / "хватит" - IMMEDIATELY stop and do what they say. No "one more try".**

---

## Quick Context

**ADHD Focus** - Task management app optimized for ADHD brains.

| Key | Value |
|-----|-------|
| Status | Active development - Web UI connected to API |
| Stack | Next.js 16 + Drizzle + NextAuth + PostgreSQL |
| Language | User: Russian, Code/Docs: English |
| Repo | https://github.com/zarudesu/adhd-focus |
| **Prod Server** | `23.134.216.230` |
| **Prod Domain** | `https://beatyour8.com` |
| **SSH** | `ssh -i ~/.ssh/adhd-focus-deploy root@23.134.216.230` |
| **Deploy** | `git push` triggers GitHub Actions |

## MANDATORY Workflow (Every Session!)

### 1. Start of Session
```bash
# Check current state
git status && git log --oneline -5

# What's running?
docker ps
lsof -i :3000

# Start if needed
cd docker && docker compose up -d db
cd apps/web && npm run dev
```

### 2. Before Implementing ANYTHING
1. **Search for existing solutions** - Use WebSearch for templates, packages, patterns
2. **Check community resources** (see section below)
3. **Use MCP tools**: `context7` for docs, `shadcn` for components, `playwright` for testing
4. **Only write from scratch if nothing exists**

### 3. During Development
- Use `TodoWrite` to track progress
- Test with real database via Playwright
- Keep code minimal

### 4. When Something Breaks (MANDATORY)
**STOP. Do NOT immediately write code.**

1. **Google first** - search "[technology] [error message]" (e.g. "nextjs standalone bcryptjs")
2. **Check existing code** - maybe solution already exists in project
3. **One change at a time** - change, test, then next change
4. **Ask user before adding files** - "хочу добавить X, ок?"
5. **3 failed attempts = STOP** - tell user "застрял, нужна помощь"

**NEVER:**
- Add multiple fixes at once
- Create new files without asking
- Guess solutions without researching
- Keep trying after 3 failures

### 5. End of Session
- **Update this file** if anything changed
- **Update "Current State" section** below
- Commit with conventional commits
- Note any blockers

## Critical Rules

### DO
- **Check internet first** - WebSearch for "nextjs [feature] 2026", "shadcn [component]", "drizzle [pattern]"
- **Use existing solutions** - npm packages, shadcn blocks, community templates
- **Use MCP tools** - context7, playwright, shadcn, github
- **Keep this file updated** - especially Current State section
- **Test with real data** - via Playwright MCP

### DON'T
- Write from scratch what already exists
- Make UI decisions without asking user
- Add unnecessary complexity
- Skip testing
- Forget to update documentation

## Current State (UPDATE THIS!)

### Web App - Pages Connected to API

| Page | Status | Features |
|------|--------|----------|
| Today | **DONE** | Tasks list, complete/uncomplete, add task, edit on click, completed section |
| Inbox | **DONE** | Tasks WITHOUT project, Quick Add, move to today |
| Inbox Process | **DONE** | Process All mode - one task at a time decision flow |
| Quick Actions | **DONE** | Timer-based quick capture with 2-min countdown |
| Scheduled | **DONE** | Tasks grouped by date, smart dates (Today/Tomorrow/etc), edit on click |
| Projects | **DONE** | Clickable project cards, create with emoji/color, task count, progress bar |
| Project Detail | **DONE** | Task list for project, add/edit tasks, completed section |
| Completed | **DONE** | All finished tasks grouped by date, uncomplete to return |
| Settings | **DONE** | Profile, preferences (pomodoro, WIP limit, theme, notifications), logout |
| Focus Mode | **DONE** | Pomodoro timer, work/break modes, task selection, session tracking, stats |
| Achievements | **DONE** | List of achievements with progress, unlocked status |
| Creatures | **DONE** | Collection of creatures, spawn mechanics |
| Statistics | **DONE** | Streak, level, XP, pomodoros, focus time, weekly charts, achievements |

### Backend - API Routes

| Route | Status |
|-------|--------|
| GET/POST /api/tasks | **DONE** |
| PATCH/DELETE /api/tasks/[id] | **DONE** |
| Auth (register/login) | **DONE** |
| GET/POST /api/projects | **DONE** |
| PATCH/DELETE /api/projects/[id] | **DONE** |
| GET/PATCH /api/profile | **DONE** |
| GET/POST /api/focus/sessions | **DONE** |
| PATCH /api/focus/sessions/[id] | **DONE** |
| GET /api/gamification/stats | **DONE** |
| POST /api/gamification/xp | **DONE** |
| GET /api/gamification/achievements | **DONE** |
| POST /api/gamification/achievements/check | **DONE** |
| GET /api/gamification/creatures | **DONE** |
| POST /api/gamification/creatures/spawn | **DONE** |
| POST /api/gamification/rewards/log | **DONE** |
| GET /api/stats | **DONE** |

### Key Files Changed Recently
- `src/lib/logger.ts` - Safe logging utility (sanitizes PII in production)
- `src/app/(dashboard)/dashboard/stats/page.tsx` - Statistics with focus stats, weekly charts
- `src/app/api/stats/route.ts` - Historical daily stats API
- `src/hooks/useFocusTimer.ts` - Pomodoro timer hook with work/break modes
- `src/app/api/focus/sessions/route.ts` - Focus sessions API (GET/POST)
- `src/app/api/focus/sessions/[id]/route.ts` - Session update API (PATCH)
- `src/app/(dashboard)/dashboard/focus/page.tsx` - Focus Mode UI with timer
- `src/components/gamification/GamificationProvider.tsx` - XP/rewards context
- `src/app/api/gamification/*` - 5 gamification API endpoints

### Known Issues (Code Review 2026-01-15)

**Security (High):**
- [x] ~~No rate limiting on `/api/auth/register`~~ - FIXED (5 req/15 min)
- [x] ~~Email logging in auth.ts~~ - FIXED (lib/logger.ts sanitizes PII in production)

**Performance (Medium):**
- [x] ~~No `useMemo` in useTasks.ts~~ - FIXED
- [ ] N+1 queries in projects listing

**Code Quality (Medium):**
- [ ] State set during render in settings/page.tsx - anti-pattern
- [ ] Type duplication - not using @adhd-focus/shared
- [ ] Self-HTTP-call in registration action

**Accessibility:**
- [ ] Labels not associated with inputs in InboxProcessor
- [ ] Color picker buttons missing aria-labels

**Dependencies:**
- [ ] NextAuth beta in production

## Tech Stack

| Layer | Technology | Docs |
|-------|------------|------|
| Framework | Next.js 16.1 | Use `context7` MCP |
| Database | PostgreSQL 17 | Docker on port 5434 |
| ORM | Drizzle | `npm run db:push` |
| Auth | NextAuth v5 | JWT + Credentials |
| UI | shadcn/ui + Tailwind | Use `shadcn` MCP |
| Testing | Playwright | Use `playwright` MCP |

## Project Structure

```
apps/web/src/
├── app/
│   ├── (dashboard)/dashboard/    # Protected pages
│   │   ├── page.tsx              # Today
│   │   ├── inbox/
│   │   │   ├── page.tsx          # Inbox
│   │   │   └── process/page.tsx  # Process All mode
│   │   ├── quick-actions/page.tsx # Quick Actions (2-min timer)
│   │   ├── scheduled/page.tsx    # Scheduled
│   │   ├── projects/
│   │   │   ├── page.tsx          # Projects list
│   │   │   └── [id]/page.tsx     # Project detail
│   │   ├── completed/page.tsx    # Completed tasks
│   │   ├── focus/page.tsx        # Focus Mode (Pomodoro)
│   │   ├── achievements/page.tsx # Achievements list
│   │   ├── creatures/page.tsx    # Creatures collection
│   │   ├── stats/page.tsx        # Statistics (TODO)
│   │   └── settings/
│   │       ├── page.tsx          # Settings
│   │       └── integrations/     # Integrations
│   ├── api/
│   │   ├── auth/                 # NextAuth + register
│   │   ├── tasks/                # Tasks CRUD
│   │   ├── projects/             # Projects CRUD
│   │   ├── profile/              # Profile GET/PATCH
│   │   ├── focus/sessions/       # Focus sessions
│   │   └── gamification/         # Stats, XP, achievements, creatures, rewards
│   └── (public)/                 # Login, signup, etc.
├── components/
│   ├── tasks/                    # TaskCard, TaskList, AddTaskDialog
│   ├── inbox/                    # InboxProcessor
│   ├── gamification/             # FeatureGate, GamificationProvider
│   └── ui/                       # shadcn components
├── hooks/
│   ├── useTasks.ts               # Tasks CRUD + filters
│   ├── useProjects.ts            # Projects CRUD
│   ├── useProfile.ts             # User preferences
│   ├── useFocusTimer.ts          # Pomodoro timer
│   ├── useFeatures.ts            # Feature unlocks
│   ├── useGamification.ts        # XP/levels/rewards
│   └── useAuth.ts                # Auth state
├── db/
│   ├── index.ts                  # Drizzle client
│   └── schema.ts                 # Database schema (incl. gamification)
└── lib/
    ├── auth.ts                   # NextAuth config
    └── utils.ts                  # Utilities
```

## Community Resources (CHECK THESE FIRST!)

### Starter Templates
- [Vercel NextAuth + Drizzle](https://github.com/vercel/nextjs-postgres-auth-starter)
- [Shadcn Dashboard Starter](https://github.com/Kiranism/next-shadcn-dashboard-starter)
- [Shadcn Admin](https://github.com/satnaing/shadcn-admin)

### UI Components
- [shadcn/ui](https://ui.shadcn.com) - Base components
- [shadcn/ui blocks](https://ui.shadcn.com/blocks) - Ready sections
- [Magic UI](https://magicui.design) - Animations

### Feature Patterns
- [dnd-kit](https://dndkit.com) - Drag and drop for Kanban
- [cmdk](https://cmdk.paco.me) - Command palette
- [sonner](https://sonner.emilkowal.ski) - Toasts

## Development Commands

```bash
# Start everything
cd docker && docker compose up -d db
cd apps/web && npm run dev

# Database
npm run db:push     # Sync schema
npm run db:studio   # Visual editor

# Add component
npx shadcn@latest add [component]
```

## Environment Variables

```bash
# apps/web/.env.local
DATABASE_URL=postgres://postgres:testpassword123@localhost:5434/postgres
AUTH_SECRET=your-secret-here
AUTH_URL=http://localhost:3000
```

## API Pattern (Reference)

```typescript
// Hook usage
const { tasks, todayTasks, inboxTasks, scheduledTasks,
        complete, uncomplete, deleteTask, moveToToday, create } = useTasks();

// Filter helper already in hook:
// todayTasks - status: today/in_progress + done with today's date
// inboxTasks - status: inbox
// scheduledTasks - status: scheduled
```

## ADHD UX Principles

1. **Minimal cognitive load** - One thing at a time
2. **Instant feedback** - Respond immediately
3. **Reduce decisions** - Smart defaults
4. **Forgiveness** - Easy undo

### Features
- Energy levels: low/medium/high
- Priority: must/should/want/someday
- WIP limit: 3 tasks/day
- Quick capture: instant inbox

## Gamification System (NEW!)

**Documentation**: See `apps/web/docs/GAMIFICATION.md` for full details.

### Core Concept: Progressive Feature Unlocking

ADHD brain overwhelms from too many options. Solution:
- New user sees **only Inbox**
- Features **unlock** through levels/achievements
- Creates **progress feeling** + **tutorial effect**

### Key Components

| Component | Purpose |
|-----------|---------|
| `FeatureGate` | Hides UI until feature unlocked |
| `useFeatures` | Check if feature unlocked, get next unlock |
| `useGamification` | XP/level, award XP, check achievements |

### Feature Unlock Order

| Level | Feature | Alt: Task Count |
|-------|---------|-----------------|
| 0 | Inbox | - |
| 2 | Today | 3 tasks |
| 3 | Priority | 5 tasks |
| 4 | Energy | 10 tasks |
| 5 | Projects | 15 tasks |
| 6+ | Scheduled, Tags, Focus, etc. | - |

### XP Formula
```typescript
XP_to_level = floor(100 × (level ^ 1.5))
// L1→2: 100 XP, L2→3: 283 XP, L5→6: 1118 XP
```

### Files Structure
```
src/
├── hooks/
│   ├── useFeatures.ts        # Feature unlock checking
│   └── useGamification.ts    # XP, levels, rewards
├── components/gamification/
│   └── FeatureGate.tsx       # Gates UI behind features
├── app/api/gamification/
│   ├── stats/route.ts        # GET user stats
│   ├── xp/route.ts           # POST award XP
│   ├── achievements/check/   # POST check achievements
│   ├── creatures/spawn/      # POST spawn creature
│   └── rewards/log/          # POST log visual effect
└── db/
    ├── schema.ts             # Gamification tables
    └── seed-gamification.ts  # Seed features/achievements/creatures
```

### Usage Example
```tsx
// Gate feature behind unlock
<FeatureGate feature="priority">
  <PrioritySelector />
</FeatureGate>

// Check in code
const { isUnlocked } = useFeatures();
if (isUnlocked('projects')) { /* show projects */ }

// Award XP
const { awardXp, checkAchievements } = useGamification();
await awardXp(15, 'task_complete');
await checkAchievements();
```

### Roadmap
- **Phase 0**: ✅ DB schema, hooks, components, API, seed
- **Phase 1**: ✅ XP integration in useTasks, level bar in sidebar
- **Phase 2**: ✅ Visual rewards - GamificationProvider with effects
- **Phase 3**: ✅ Achievements UI - /dashboard/achievements page
- **Phase 4**: ✅ Creatures collection - /dashboard/creatures page
- **Phase 5**: TODO - FeatureGate in all UI (progressive unlock)

## Troubleshooting

```bash
# Port 3000 in use
lsof -ti:3000 | xargs kill -9

# Check database
docker ps
docker logs adhd-focus-db

# Playwright browser stuck (ALWAYS run before new test session!)
rm -rf ~/Library/Caches/ms-playwright/mcp-chrome-*
pkill -9 -f "Google Chrome for Testing"
```

## Playwright Testing Rules

**IMPORTANT**: Before starting a new Playwright test:
1. Kill existing browser: `pkill -9 -f "Google Chrome for Testing"`
2. Use `browser_snapshot` to check current state before clicking
3. Reuse existing tab - don't call `browser_navigate` if already on correct page
4. Use `browser_click` with element refs from snapshot

## Commit Style

```
feat(tasks): add feature
fix(auth): fix bug
docs: update CLAUDE.md
```

## Recent Changes (2026-01-17)

### Focus Mode - Pomodoro Timer Complete
- **useFocusTimer hook**: Full timer with work/short break/long break modes
- **Circular timer UI**: SVG progress ring, animated countdown
- **Task selection**: Pick from today's tasks to focus on
- **Session tracking**: API saves sessions, updates user/task stats
- **Today's Progress**: Shows pomodoros, minutes, all-time stats
- **Notifications**: Sound + browser notifications on timer complete
- **User preferences**: Timer durations from Settings

### Gamification System - Phase 0 Complete
- **Progressive Feature Unlocking**: Core concept - app starts with only Inbox, features unlock via levels
- **DB Schema**: New tables for features, achievements, creatures, rewards
- **useFeatures hook**: Check unlocked features, get next unlock
- **useGamification hook**: XP/level system, reward effects, creature spawning
- **FeatureGate component**: Gate UI behind feature unlocks
- **API endpoints**: 5 new gamification endpoints
- **Seed data**: 15 features, 30 achievements, 16 creatures

### Previous (2026-01-16)
- **Completed Page**: `/dashboard/completed` with tasks grouped by date
- **Project Selector**: In AddTaskDialog "More options"
- **Clickable Projects**: Navigate to project detail
- **Task Editing Everywhere**: Click any task to edit

### Previous (2026-01-15)
- **Responsive AddTaskDialog**: Form stacks vertically on mobile (320px+)
- **Security**: Rate limiting on `/api/auth/register` (5 req/15 min)
- **Performance**: `useMemo` for filtered task lists in `useTasks.ts`
