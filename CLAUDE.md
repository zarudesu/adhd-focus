# CLAUDE.md - AI Assistant Instructions

> **READ THIS FILE FIRST** in every new session or after context compaction.
> Last updated: 2026-02-05

---

## ⚠️ ОБЯЗАТЕЛЬНО ПРОЧИТАЙ ПЕРЕД РАБОТОЙ ⚠️

**Claude, ЭТО ДЛЯ ТЕБЯ. Каждую новую сессию:**

1. **ПРОЧИТАЙ ЭТУ ТАБЛИЦУ** - здесь все домены и доступы:

| Что | URL/Команда |
|-----|-------------|
| 🌐 **PROD** | `https://beatyour8.com` |
| 🧪 **STAGING** | `https://adhdrenaline.com` |
| 🖥️ **SSH** | `ssh -i ~/.ssh/adhd-focus-deploy root@23.134.216.230` |
| 📦 **Deploy Prod** | `git push origin main` |
| 📦 **Deploy Staging** | `git push origin staging` |

2. **НЕ ГАДАЙ** - если не знаешь домен/путь/команду - ИЩИ В ЭТОМ ФАЙЛЕ
3. **НЕ SSH** для поиска инфы, которая уже здесь записана

**Если ты не изучил полностью эту доку перед началом работы - ТЫ ОБЛАЖАЛСЯ.**

---

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
| Status | Active development - Web + iOS apps |
| Web Stack | Next.js 16 + Drizzle + NextAuth + PostgreSQL |
| iOS Stack | SwiftUI + URLSession + Keychain |
| Language | User: Russian, Code/Docs: English |
| Repo | https://github.com/zarudesu/adhd-focus |
| **Prod Server** | `23.134.216.230` |
| **Prod Domain** | `https://beatyour8.com` |
| **Staging Domain** | `https://adhdrenaline.com` |
| **SSH** | `ssh -i ~/.ssh/adhd-focus-deploy root@23.134.216.230` |
| **Deploy Prod** | `git push origin main` triggers GitHub Actions |
| **Deploy Staging** | `git push origin staging` triggers GitHub Actions |

## MANDATORY Workflow (Every Session!)

### 1. Start of Session

**⚠️ ПЕРВЫМ ДЕЛОМ: Прочитай таблицу доменов в начале этого файла!**

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

**После context compaction:** Обязательно перечитай CLAUDE.md - ты потеряешь контекст!

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
- **Update this file** if anything changed:
  - Новые домены/URLs → добавь в таблицу в начале файла
  - Новые команды/пути → добавь в соответствующую секцию
  - Новые фичи/страницы → обнови "Current State"
- **Update "Current State" section** below
- Commit with conventional commits
- Note any blockers

**⚠️ Если ты узнал что-то новое (домен, путь, команду) - ЗАПИШИ СЮДА. Следующий Claude скажет тебе спасибо.**

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
| Statistics | **DONE** | Streak, level, XP, pomodoros, focus time, weekly charts, achievements, habits |
| Checklist | **DONE** | Daily habits with drag-drop reorder, time of day sections, streaks, yesterday review |
| Landing | **DONE** | Minimalist single input, localStorage tasks, celebration modal, registration flow |

### iOS App - Native SwiftUI

| Screen | Status | Features |
|--------|--------|----------|
| Login | **DONE** | Email/password, JWT token storage in Keychain |
| Signup | **DONE** | Registration with auto-login |
| Today | **DONE** | Today tasks, complete/uncomplete, add task |
| Inbox | **DONE** | Inbox tasks, quick add bar |
| Settings | **DONE** | User info, stats, logout |

**Key Files:**
- `apps/ios/ADHDFocus/` - Main app code
- `apps/ios/project.yml` - XcodeGen config
- `apps/ios/ADHDFocus.xcodeproj/` - Generated Xcode project

**Build & Run:**
```bash
cd apps/ios
xcodegen generate   # Generate Xcode project from project.yml
open ADHDFocus.xcodeproj
# In Xcode: Select team, build (Cmd+B), run on simulator/device
```

### Backend - API Routes

| Route | Status |
|-------|--------|
| GET/POST /api/tasks | **DONE** (+ mobile JWT auth) |
| PATCH/DELETE /api/tasks/[id] | **DONE** (+ mobile JWT auth) |
| Auth (register/login) | **DONE** (+ bot protection) |
| POST /api/mobile/auth/login | **DONE** (JWT for iOS) |
| POST /api/auth/verify-credentials | **DONE** (re-auth for Projects) |
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
| POST /api/gamification/day-surprise | **DONE** |
| GET /api/stats | **DONE** |
| GET/POST /api/habits | **DONE** |
| PATCH/DELETE /api/habits/[id] | **DONE** |
| POST /api/habits/[id]/check | **DONE** |
| POST /api/habits/reorder | **DONE** |
| GET/POST /api/habits/review | **DONE** |

### Key Files Changed Recently
- `src/components/gamification/LevelProgress.tsx` - Shows "Mindfulness" without level number
- `src/app/(dashboard)/dashboard/quick-actions/page.tsx` - Fixed Math.random, setState patterns
- `src/components/gamification/*.tsx` - Fixed React strict mode issues (refs, setState in effects)
- `src/hooks/useFocusTimer.ts` - Fixed setState in effect pattern
- `src/app/(dashboard)/dashboard/hub/page.tsx` - Fixed lazy initializer, removed unused props
- Multiple files - Fixed unescaped HTML entities (`'` → `&apos;`)

### Known Issues (Code Review 2026-01-20)

**Security (High):**
- [x] ~~No rate limiting on `/api/auth/register`~~ - FIXED (5 req/15 min)
- [x] ~~Email logging in auth.ts~~ - FIXED (lib/logger.ts sanitizes PII in production)

**Performance (Medium):**
- [x] ~~No `useMemo` in useTasks.ts~~ - FIXED
- [x] ~~N+1 queries in projects listing~~ - ALREADY FIXED (uses JOIN + GROUP BY)

**Code Quality (Medium):**
- [x] ~~State set during render in settings/page.tsx~~ - FIXED (lazy initializer + setTimeout pattern)
- [x] ~~Math.random() in render~~ - FIXED (moved to effects or static values)
- [x] ~~setState directly in effects~~ - FIXED (setTimeout pattern in all gamification components)
- [x] ~~Ref access during render~~ - FIXED (moved to useEffect)
- [x] ~~Unescaped HTML entities~~ - FIXED (`'` → `&apos;`)
- [x] ~~Type duplication - not using @adhd-focus/shared~~ - RESOLVED (removed dead shared package, schema.ts is source of truth)
- [x] ~~Self-HTTP-call in registration action~~ - ALREADY FIXED (imports registerUser directly)

**Accessibility:**
- [x] ~~Labels not associated with inputs in InboxProcessor~~ - FIXED (changed to <p> for button groups)
- [x] ~~Color picker buttons missing aria-labels~~ - ALREADY FIXED (has aria-label)

**Dependencies:**
- [ ] NextAuth beta in production

**ESLint Status:** 0 errors, ~50 warnings (unused variables only)

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
│   ├── page.tsx                  # Landing page (minimalist input)
│   ├── sync/page.tsx             # Sync localStorage tasks after registration
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
│   │   ├── checklist/page.tsx    # Daily habits
│   │   ├── focus/page.tsx        # Focus Mode (Pomodoro)
│   │   ├── achievements/page.tsx # Achievements list
│   │   ├── creatures/page.tsx    # Creatures collection
│   │   ├── stats/page.tsx        # Statistics
│   │   └── settings/
│   │       ├── page.tsx          # Settings
│   │       └── integrations/     # Integrations
│   ├── api/
│   │   ├── auth/                 # NextAuth + register
│   │   ├── tasks/                # Tasks CRUD
│   │   ├── projects/             # Projects CRUD
│   │   ├── habits/               # Habits CRUD + check + reorder + review
│   │   ├── profile/              # Profile GET/PATCH
│   │   ├── focus/sessions/       # Focus sessions
│   │   └── gamification/         # Stats, XP, achievements, creatures, rewards
│   └── (public)/                 # Login, signup, etc.
├── components/
│   ├── tasks/                    # TaskCard, TaskList, AddTaskDialog
│   ├── inbox/                    # InboxProcessor
│   ├── habits/                   # AddHabitDialog, SortableHabitItem, YesterdayReviewModal
│   ├── landing/                  # UnlockModal
│   ├── gamification/             # FeatureGate, ProtectedRoute, GamificationProvider
│   └── ui/                       # shadcn components
├── hooks/
│   ├── useTasks.ts               # Tasks CRUD + filters
│   ├── useProjects.ts            # Projects CRUD
│   ├── useHabits.ts              # Habits CRUD + check/reorder
│   ├── useYesterdayReview.ts     # Habits review modal
│   ├── useProfile.ts             # User preferences
│   ├── useFocusTimer.ts          # Pomodoro timer
│   ├── useFeatures.ts            # Feature unlocks
│   ├── useGamification.ts        # XP/levels/rewards
│   ├── useWelcomeBack.ts         # Returning user detection
│   └── useAuth.ts                # Auth state
├── db/
│   ├── index.ts                  # Drizzle client
│   └── schema.ts                 # Database schema (incl. gamification, habits)
└── lib/
    ├── auth.ts                   # NextAuth config
    ├── mobile-auth.ts            # JWT verification for mobile
    ├── pending-tasks.ts          # localStorage helpers
    └── utils.ts                  # Utilities

apps/ios/ADHDFocus/
├── ADHDFocusApp.swift            # App entry point
├── ContentView.swift             # Main tab view + auth routing
├── Models/
│   ├── Task.swift                # TaskItem, TaskStatus, enums
│   ├── User.swift                # User, AuthResponse, LoginInput
│   └── Project.swift             # Project model
├── Services/
│   ├── APIClient.swift           # HTTP client + Keychain storage
│   ├── AuthManager.swift         # Auth state management
│   └── TaskStore.swift           # Tasks state + CRUD
└── Views/
    ├── Auth/
    │   ├── LoginView.swift       # Login screen
    │   └── SignupView.swift      # Registration screen
    ├── Today/
    │   └── TodayView.swift       # Today tasks list
    ├── Inbox/
    │   └── InboxView.swift       # Inbox + quick add
    └── Components/
        ├── TaskRow.swift         # Single task row
        └── AddTaskSheet.swift    # Add task modal
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
# apps/web/.env.local (local development)
DATABASE_URL=postgres://postgres:testpassword123@localhost:5434/postgres
AUTH_SECRET=your-secret-here
AUTH_URL=http://localhost:3000
```

## Production & Staging Environments

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Server: 23.134.216.230                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐     ┌──────────────────────────────────┐  │
│  │   Caddy     │────▶│  beatyour8.com (Production)      │  │
│  │  (ports     │     │  ├─ adhd-focus-web:3000          │  │
│  │  80/443)    │     │  └─ adhd-focus-db:5432           │  │
│  │             │     └──────────────────────────────────┘  │
│  │             │                                            │
│  │             │     ┌──────────────────────────────────┐  │
│  │             │────▶│  adhdrenaline.com (Staging)      │  │
│  │             │     │  ├─ adhd-focus-web-staging:3000  │  │
│  └─────────────┘     │  └─ adhd-focus-db-staging:5433   │  │
│                      └──────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Domains & Branches

| Environment | Domain | Git Branch | Image Tag |
|-------------|--------|------------|-----------|
| **Production** | beatyour8.com | `main` | `:latest` |
| **Staging** | adhdrenaline.com | `staging` | `:staging` |

### Deployment Workflow

```bash
# Deploy to PRODUCTION (beatyour8.com)
git checkout main
git push origin main
# → GitHub Actions builds :latest image
# → Deploys to adhd-focus-web container

# Deploy to STAGING (adhdrenaline.com)
git checkout staging
git merge main  # or cherry-pick specific commits
git push origin staging
# → GitHub Actions builds :staging image
# → Deploys to adhd-focus-web-staging container
```

### Server File Structure

```
/opt/adhd-focus/
├── .env                      # Production secrets
├── .env.staging              # Staging secrets (separate DB password!)
├── docker-compose.yml        # Production services
├── docker-compose.staging.yml # Staging services
├── Caddyfile                 # Multi-domain routing
└── migrations/               # DB migrations
```

### Key Server Commands

```bash
# SSH to server
ssh -i ~/.ssh/adhd-focus-deploy root@23.134.216.230

# Check all containers
docker ps

# View logs
docker logs adhd-focus-web          # Production web
docker logs adhd-focus-web-staging  # Staging web
docker logs adhd-focus-caddy        # Reverse proxy

# Restart services
cd /opt/adhd-focus
docker compose restart web                                    # Prod web
docker compose -f docker-compose.staging.yml restart web-staging  # Staging web
docker compose restart caddy                                  # Caddy (both domains)

# Manual deploy (without GitHub Actions)
docker pull ghcr.io/zarudesu/adhd-focus-web:latest
docker compose up -d --no-deps web

# Database access
docker exec -it adhd-focus-db psql -U postgres -d adhd_focus           # Prod
docker exec -it adhd-focus-db-staging psql -U postgres -d adhd_focus_staging  # Staging
```

### Databases

| Environment | Container | Port | Database Name |
|-------------|-----------|------|---------------|
| Production | adhd-focus-db | 5432 | adhd_focus |
| Staging | adhd-focus-db-staging | 5433 | adhd_focus_staging |

**IMPORTANT**: Databases are completely separate. Staging data won't affect production.

### Adding New Server Files

When you need to update server configs (Caddyfile, docker-compose, etc.):

```bash
# Copy file to server
scp -i ~/.ssh/adhd-focus-deploy docker/Caddyfile root@23.134.216.230:/opt/adhd-focus/

# Then restart affected service
ssh -i ~/.ssh/adhd-focus-deploy root@23.134.216.230 "cd /opt/adhd-focus && docker compose restart caddy"
```

### GitHub Actions Secrets Required

For both `production` and `staging` environments in GitHub:
- `SERVER_HOST` = `23.134.216.230`
- `SERVER_USER` = `root`
- `SSH_PRIVATE_KEY` = contents of `~/.ssh/adhd-focus-deploy`

### Initial Staging Setup (One-Time)

This was already done, but for reference:

```bash
# 1. Point DNS: adhdrenaline.com → 23.134.216.230

# 2. Copy files to server
scp -i ~/.ssh/adhd-focus-deploy docker/docker-compose.staging.yml root@23.134.216.230:/opt/adhd-focus/
scp -i ~/.ssh/adhd-focus-deploy docker/Caddyfile root@23.134.216.230:/opt/adhd-focus/

# 3. Create staging secrets on server
ssh root@23.134.216.230
cd /opt/adhd-focus
cat > .env.staging << 'EOF'
DOMAIN=adhdrenaline.com
SITE_URL=https://adhdrenaline.com
POSTGRES_PASSWORD=$(openssl rand -base64 24)
AUTH_SECRET=$(openssl rand -base64 32)
POSTGRES_DB=adhd_focus_staging
POSTGRES_PORT=5433
WEB_VERSION=latest
EOF

# 4. Start staging
docker compose -f docker-compose.staging.yml --env-file .env.staging up -d
docker compose restart caddy
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

## Gamification System

**Documentation**:
- **[docs/FEATURE_UNLOCKS.md](docs/FEATURE_UNLOCKS.md)** - Unlock conditions & rationale
- **[apps/web/docs/GAMIFICATION.md](apps/web/docs/GAMIFICATION.md)** - XP, achievements, creatures
- **[docs/RETENTION_RESEARCH.md](docs/RETENTION_RESEARCH.md)** - ADHD retention research & behavioral science

### Core Concept: Progressive Feature Unlocking

ADHD brain overwhelms from too many options. Solution:
- New user sees **only Inbox**
- Features **unlock** through user actions (not levels!)
- Creates **progress feeling** + **tutorial effect**
- Hidden until unlocked = surprise delight

### Key Components

| Component | Purpose |
|-----------|---------|
| `FeatureGate` | Hides UI until feature unlocked |
| `useFeatures` | Check if feature unlocked, get next unlock |
| `useGamification` | XP/level, award XP, check achievements |

### Feature Unlock Order (Current)

| Feature | Unlock Trigger |
|---------|---------------|
| Inbox | Always available |
| Today | 1 task assigned to today |
| Scheduled | 1 task scheduled for **future** date |
| Completed | 1 task completed |
| Checklist | 3 tasks completed |
| Achievements | 3 tasks added |
| Focus Mode | 5 tasks completed |
| Projects | 10 tasks added |
| Quick Actions | 10 tasks completed |
| Creatures | Level 5 |
| Statistics | 7-day streak |

See **[docs/FEATURE_UNLOCKS.md](docs/FEATURE_UNLOCKS.md)** for full details and rationale.

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
│   ├── useGamification.ts    # XP, levels, rewards
│   └── useWelcomeBack.ts     # Returning user detection (3+ days away)
├── components/gamification/
│   ├── FeatureGate.tsx       # Gates UI behind features
│   └── WelcomeBackFlow.tsx   # Returning user welcome modal
├── app/api/gamification/
│   ├── stats/route.ts        # GET user stats
│   ├── xp/route.ts           # POST award XP
│   ├── achievements/check/   # POST check achievements
│   ├── creatures/spawn/      # POST spawn creature
│   ├── rewards/log/          # POST log visual effect
│   └── day-surprise/         # POST day 3-5 surprise achievement
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
- **Phase 6**: ✅ ADHD Retention features (see below)

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

## Recent Changes (2026-02-05)

### ADHD Retention Features (Phase 6) ✅
Based on behavioral science research (docs/RETENTION_RESEARCH.md). No DB migrations needed.

**Features implemented:**
1. **Welcome Back Flow** — Warm modal for users returning after 3+ days. "Hey. You're back." with Fresh Start option (bulk archive overdue)
2. **Task Amnesty** — "Let go" (archive) button throughout app. Stale task review step in morning review for tasks 14+ days old (batch archive)
3. **XP Variation** — ±20% random variation + 10% chance of 2x bonus (variable ratio reinforcement)
4. **Just 1 Mode** — Show only 1 active task on Today page (toggle in Settings, off by default)
5. **Day 3-5 Surprise** — Hidden "Still Here" + "Comeback" achievements for early retention

**Key files:**
- `hooks/useWelcomeBack.ts` — returning user detection
- `components/gamification/WelcomeBackFlow.tsx` — welcome back modal
- `components/tasks/MorningReviewModal.tsx` — stale task step (14+ days), batch archive
- `hooks/useGamification.ts` — calculateTaskXp with variable rewards
- `app/api/gamification/day-surprise/route.ts` — day 3-5 achievement check
- `db/generate-achievements.ts` — retention achievements (still_here, comeback)
- `app/(dashboard)/dashboard/page.tsx` — Just 1 mode, overdue archive button
- `app/(dashboard)/dashboard/settings/page.tsx` — Just 1 mode toggle

### Previous (2026-01-22)

### Staging Environment - LIVE ✅
- **Production**: https://beatyour8.com (main branch)
- **Staging**: https://adhdrenaline.com (staging branch)
- Separate databases, same server
- See "Production & Staging Environments" section above for full details

### Security Improvements
- **Bot protection for registration**: Honeypot field + timing check (forms < 3 seconds = bot)
- **Re-auth modal for Projects**: When Projects feature unlocks, user must re-enter password (prep for email verification)

**Key files changed:**
- `docker/docker-compose.staging.yml` - Staging services (web-staging, db-staging)
- `docker/Caddyfile` - Multi-domain routing (beatyour8.com + adhdrenaline.com)
- `.github/workflows/deploy-staging.yml` - Staging branch → adhdrenaline.com
- `src/app/actions/auth.ts` - Bot detection in registration
- `src/components/gamification/ReAuthModal.tsx` - Password verification modal
- `src/app/api/auth/verify-credentials/route.ts` - Re-auth endpoint

### iOS App - Native SwiftUI
- **Full iOS app skeleton**: Login, Signup, Today, Inbox, Settings tabs
- **JWT authentication**: Mobile auth endpoint `/api/mobile/auth/login` returns JWT tokens
- **Keychain storage**: Secure token storage using iOS Security framework
- **Shared TaskStore**: Single source of truth for tasks across views
- **Mobile-aware API**: Tasks endpoints now accept both NextAuth sessions (web) and Bearer tokens (mobile)

**Key technical decisions:**
- Renamed `Task` model to `TaskItem` to avoid Swift async/await conflict
- Used `@ObservedObject` for shared state instead of `@StateObject` per view
- API returns camelCase (no snake_case conversion needed)
- `lib/mobile-auth.ts` helper verifies JWT for mobile requests

### Previous (2026-01-20)

### ESLint Strict Mode Compliance
- **0 errors** (was 24 errors)
- Fixed Math.random() in render (achievements, sidebar, quick-actions)
- Fixed setState in useEffect (setTimeout pattern in all gamification components)
- Fixed ref access during render (moved to useEffect)
- Fixed unescaped HTML entities across multiple files
- Fixed TypeScript null checks in settings page
- Hidden level number from sidebar - shows just "Mindfulness"

### Previous (2026-01-17)

#### Focus Mode - Pomodoro Timer Complete
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
